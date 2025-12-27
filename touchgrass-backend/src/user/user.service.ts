import { Injectable, InternalServerErrorException, Inject } from '@nestjs/common';
import { User } from './domain/user.entity';
import { UploadProfilePhotoResponseDto } from './dto/response/upload-profile-photo.dto';
import { RekognitionService } from '../rekognition/rekognition.service';
import { REKOGNITION_CONFIDENCE_THRESHOLD, REKOGNITION_PROFILEPIC_VALIDATION_ATTRIBUTES } from '../common/constants/rekognition';
import { USER_REPOSITORY_TOKEN } from '../common/constants/provider-tokens';
import { S3Service } from '../s3/s3.service';
import { CreateUserRequestDto } from './dto/request/create-user.dto';
import { UserRepository } from './domain/user-repository.interface';
import { S3_PROFILE_PIC_DIR } from '../common/constants/s3';
import { JsonPatchOp } from '../common/dto/JsonPatchDto';
import { UnsupportedPatchOperationError } from '../common/errors/unsupported-patch-operation.error';
import { applyOperation, deepClone, Operation } from 'fast-json-patch';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { PatchUserDto } from './dto/patch-user.dto';
import { PatchError } from 'fast-json-patch/module/helpers';
import { PatchPathDoesNotExistError } from '../common/errors/patch-path-does-not-exist.error';
import { PatchDomainError } from '../common/errors/patch-domain.error';
import { UserProfileNotFoundError } from '../common/errors/user-profile-not-found.error';
import { validate } from 'class-validator';
import { ValidationErrorMetadata } from '../common/types';
import { InvalidPatchValueError } from '../common/errors/invalid-patch-value.error';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepo: UserRepository,
    private readonly rekognitionService: RekognitionService,
    private readonly s3Service: S3Service,
  ) {}


  /**
   * Creates and inserts a new User entity from the provided CreateUserDto.
   * If an insert of the entity fails, then the global orm exception filter handles the exception.
   * 
   * - If a user with identical ID already exists, then a BadRequestException is thrown by the filter.
   * - If a user with identical username already exists, than a ConflictException is thrown by the filter.
   * - If both of the above properties already exist, the BadRequestException is favored (as this is more a serious issue).
   *
   * @param dto Data transfer object containing the fields required to create a user.
   * @returns The newly created User entity.
   * @throws TypeOrmError upon failure to create the user entity or perform the insert
  **/
  async create(userId: string, userData: CreateUserRequestDto): Promise<User> {
    const createdUser = this.userRepo.createUserEntity({
      id: userId,
      ...userData,
    });

    await this.userRepo.insertEntity(createdUser);
    return createdUser;
  }

  /**
   * Return the User entity associated with 'username', if it exists.
   *
   * @param username Unique touchgrass username used for search
   * @returns The User entiIty associated with 'username', otherwise null.
  **/
  async findUserById(id: string): Promise<User | null> {
    return await this.userRepo.getUserById(id);
  }


  /**
   * Update the user entity according to the information in the dto,
   * and return the new instance of the user.
   * 
   * @param user Data transfer object containing the fields required to update a user.
   * @returns The newly updated User entity.
  **/
  async updateUser(userId: string, patches: JsonPatchOp[]): Promise<User> {
    // validate the JsonPatchOps against our custom rules before getting the entity
    for (const patch of patches) {
      // for now we're only supporting the 'replace' op
      if (patch.op !== 'replace') {
        throw new UnsupportedPatchOperationError(patch.op);
      }
    }
    
    // obtain only the fields of the entity which are allowed to be patched
    const userEntity = await this.userRepo.getUserById(userId);
    if (!userEntity) {
      throw new UserProfileNotFoundError(userId);
    }
    const plain = instanceToPlain(userEntity);
    const patchableUserEntity = plainToInstance(PatchUserDto, plain, { excludeExtraneousValues: true });

    // apply the patches one by one
    for (const patch of patches) {
      const patchPath = patch.path;
      
      try {
        // modifies patchableUserEntity in place
        applyOperation<PatchUserDto>(
          patchableUserEntity, 
          deepClone(patch as Operation), // deepClone to prevent patch object from being modified 
          true // for default validation the lib provides
        );
      } catch (err) {
        const patchError = err as PatchError;
        const errorName = patchError.name;
        const errorMessage = patchError.message;
        
        switch (errorName) {
          case 'OPERATION_PATH_UNRESOLVABLE':
            throw new PatchPathDoesNotExistError(patchPath, errorMessage);

          default:
            throw new PatchDomainError(errorMessage);
        }
      }
    }

    // verify the patches follow validation logic
    // the second argument is config to ensure the value causing the error is provided for logging
    const classValidatorErrors = await validate(patchableUserEntity, { validationError: { value: true }});
    if (classValidatorErrors.length > 0) {
      const customValidatorErrors = classValidatorErrors.map(error => {
        return {
          property: error.property,
          value: error.value,
          constraints: error.constraints,
        } as ValidationErrorMetadata;
      });

      throw new InvalidPatchValueError(customValidatorErrors);
    }

    // merge the patches into the original entity, and perform update
    Object.assign(userEntity, patchableUserEntity);
    return await this.userRepo.saveEntity(userEntity);
  }


  /**
   * Validate the profile picture uploaded by the user. If validated, a Rekognition collection
   * dedicated to the user is created, and the profile picture is associated to this collection.
   * Otherwise, a 409 Conflict is sent back to the user, in which they will attempt with a different profile photo.
   * 
   * @param dto Data transfer object containing the profile photo in base64 encoding.
   * @returns The AWS S3 link to the profile photo
  **/
    async validateProfilePhoto(userId: string, photo: Express.Multer.File): Promise<UploadProfilePhotoResponseDto> {
      let response: UploadProfilePhotoResponseDto;
      
      try {
        const faceData = await this.rekognitionService.detectFaces(photo, REKOGNITION_PROFILEPIC_VALIDATION_ATTRIBUTES);

        let validFace = false;


        if (faceData.FaceDetails) {
          if (faceData.FaceDetails.length > 1) {
            response = new UploadProfilePhotoResponseDto({ 
              success: false,
              err_msg: 'Multiple faces detected in submitted photo',
            });
          }
          else {
            const face = faceData.FaceDetails![0];

            if (!(face.EyesOpen!.Value ?? false)) {
              response = new UploadProfilePhotoResponseDto({ 
                success: false,
                err_msg: 'Eyes must be open in profile photo',
              });
            }
            else if (face.Sunglasses!.Value ?? false) {
              response = new UploadProfilePhotoResponseDto({ 
                success: false,
                err_msg: 'Sunglasses obstructued eyes in profile photo',
              });
            }
            else if (face.FaceOccluded!.Value ?? false) {
              response = new UploadProfilePhotoResponseDto({ 
                success: false,
                err_msg: 'Face obstructed in submitted photo',
              });
            }
            else if ((face.Confidence ?? 0) <= REKOGNITION_CONFIDENCE_THRESHOLD) {
              response = new UploadProfilePhotoResponseDto({ 
                success: false,
                err_msg: "Couldn't detect face clearly in submitted photo",
              });
            }
            else {
              response = new UploadProfilePhotoResponseDto({ 
                success: true,
              });
              validFace = true;
            }
          }
        }
        else {
          response = new UploadProfilePhotoResponseDto({ 
            success: false,
            err_msg: 'No face detected in submitted photo',
          });
        }


        if (validFace) {
          const path = `${S3_PROFILE_PIC_DIR}/${userId}`;
          await this.s3Service.putObject(photo, path);
          const presignedUrl = await this.s3Service.getPresignedUrl(path)

          console.log(`Presigned URL: ${presignedUrl}`);

          // await this.userRepo.update(
          //   { id: userId }, 
          //   { 
          //     profile_pic_link: presignedUrl,
          //     completed_new_user_flow: true,
          //   }
          // );

          response.profile_photo_link = presignedUrl;
        } 
        else {
          console.log('[validateProfilePhoto] photo rejected due to failed validation.');
        }
      } 
      catch (err) {
        console.error('[validateProfilePhoto] error:', err.message);
        throw new InternalServerErrorException(err.message);
      }

      return response;
  }



  // look into testing/modifying this function after
  //  1. Talking w/ Abhi
  //  2. Getting hands dirty with friends feature
  async searchUsers(username: string, page = 1, limit = 10): Promise<User[]> {
    if (!username || !username.trim()) {
      return [];
    }

    const exactMatch = await this.userRepo.getUserByUsername(username);
    const extraLimit = exactMatch ? limit - 1 : limit;

    const offset = (page - 1) * limit;
    const partialMatches = [];
    // const partialMatches = await this.userRepo.find({
    //   where: {
    //     username: ILike(`%${username}%`),
    //     ...(exactMatch && { id: Not(exactMatch.id) }),
    //   },
    //   skip: offset,
    //   take: extraLimit,
    // });

    if (exactMatch) {
      return [exactMatch, ...partialMatches];
    }

    return partialMatches;
  }
}