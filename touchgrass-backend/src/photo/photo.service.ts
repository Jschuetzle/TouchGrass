import { Inject, Injectable } from "@nestjs/common";
import { PhotoUploadIntentDto, PhotoUploadIntentsRequestDto } from "./dto/request/photo-upload-intent.dto";
import { UserService } from "../user/user.service";
import { PhotoUploadIntentResultDto, PhotoUploadIntentResultsDto } from "./dto/response/photo-upload-intent-result.dto";
import { REKOGNITION_MAX_S3_OBJECT_SIZE  } from "../common/constants/rekognition";
import { DEFAULT_DAILY_UPLOAD_COUNT } from "../common/constants/user";
import { PhotoUploadLimitExceededError } from "../common/errors/photo-upload-limit-exceeded.error";
import { S3Service } from "../s3/s3.service";
import { RedisService } from "../redis/redis.service";
import { FILE_TYPE_VALIDATION_BUFFER_SIZE, SUPPORTED_MIME_TYPES, UPLOAD_INTENT_NORMAL_PIC_EXPIRATION_TIME, UPLOAD_INTENT_PROFILE_PIC_EXPIRATION_TIME } from "../common/constants/photos";
import { UploadLimitAlreadyReachedError } from "../common/errors/upload-limit-already-reached.error";
import { ValidateUploadIntentResult } from "./domain/validate-upload-intent-result.type";
import { ValidatePhotosDto } from "./dto/request/validate-photo.dto";
import { PhotoOperation } from "./domain/photo-operation.enum";
import { Readable } from "stream";
import { RekognitionService } from "src/rekognition/rekognition.service";
import { ValidatePhotoResultDto, ValidatePhotoResultsDto } from "./dto/response/validate-photo-result.dto";
import { UploadIntent, UploadIntentStatus } from "./domain/upload-intent.entity";
import { loadEsm } from "load-esm";
import { ValidationResult } from "./domain/validation-result";
import { UserProfileNotFoundError } from "src/common/errors/user-profile-not-found.error";
import { Photo } from "./domain/photo.entity";
import { PHOTO_REPOSITORY_TOKEN } from "src/common/constants/provider-tokens";
import { PhotoRepository } from "./domain/photo-repository.interface";
import { streamToBuffer } from "src/common/util/network";

@Injectable()
export class PhotoService {
    constructor(
        @Inject(PHOTO_REPOSITORY_TOKEN)
        private readonly photoRepo: PhotoRepository,
        private readonly userService: UserService,
        private readonly s3Service: S3Service,
        private readonly redisService: RedisService,
        private readonly rekognitionService: RekognitionService,
    ) {}


    async handleUploadIntents(userId: string, uploadIntents: PhotoUploadIntentsRequestDto): Promise<PhotoUploadIntentResultsDto> {
        // check if number of intents and existing uploads together goes past daily limit
        // profile pics don't count towards daily limit
        if (uploadIntents.op !== PhotoOperation.PROFILE_PIC) {
            await this.validateUploadIntentCount(userId, uploadIntents.intents.length);
        }

        const validationResult = this.validateUploadIntentMetadata(uploadIntents.intents);

        // update the number of intents alloted...will throw UserDomainError if count exceeds limit during update
        // we do a second check here, as the daily upload count could've changed during the above validation
        if (uploadIntents.op !== PhotoOperation.PROFILE_PIC) {
            this.userService.addToDailyUploadCount(userId, validationResult.successCount);
        }

        // create resources for all successful intents
        const expiration = uploadIntents.op === PhotoOperation.PROFILE_PIC ? UPLOAD_INTENT_PROFILE_PIC_EXPIRATION_TIME : UPLOAD_INTENT_NORMAL_PIC_EXPIRATION_TIME;

        const intentResults = validationResult.results;
        for (let i=0; i < intentResults.length; i++) {
            if (intentResults[i].success) {
                const objectKey = `raw/${crypto.randomUUID()}`;

                await this.redisService.createTimedUploadIntent(
                    objectKey, 
                    userId, 
                    uploadIntents.op, 
                    expiration
                );
                
                const presignedUrl = await this.s3Service.generatePutPresignedUrl(
                    objectKey,
                    expiration,
                    uploadIntents.intents[i].content_type ?? '',
                    uploadIntents.intents[i].size ?? 0,
                )

                intentResults[i].object_key = objectKey;
                intentResults[i].presigned_url = presignedUrl;
            }
        }

        return { intent_results: intentResults } as PhotoUploadIntentResultsDto;
    }
    

    private async validateUploadIntentCount(userId: string, requestIntentCount: number): Promise<void> {
        const userEntity = await this.userService.findUserById(userId);
        if (!userEntity) {
            throw new UserProfileNotFoundError(userId);
        } else if (userEntity.daily_upload_count === DEFAULT_DAILY_UPLOAD_COUNT) {
            throw new UploadLimitAlreadyReachedError(userId);
        }

        const exceededBy = Math.max(0, (userEntity.daily_upload_count + requestIntentCount) - DEFAULT_DAILY_UPLOAD_COUNT);
        if (exceededBy > 0) {
            throw new PhotoUploadLimitExceededError(userId, exceededBy);
        }
    }


    private validateUploadIntentMetadata(uploadIntents: PhotoUploadIntentDto[]): ValidateUploadIntentResult {
        const uploadIntentResults: PhotoUploadIntentResultDto[] = [];
        let successfulIntentCount = 0; // in order to accurately track the number of upload intents we'll allocate

        // validate the metadata in request body against photo rules, if the metadata is provided
        for (const intent of uploadIntents) {
            let intentResult: PhotoUploadIntentResultDto;

            // ValidatorPipe takes care of checking the mime type (if it exists), so just check file size
            // if size not provided, then treat the intent as validated, as this is frequently a case on mobile
            if (intent.size && intent.size > REKOGNITION_MAX_S3_OBJECT_SIZE) {
                intentResult = {
                    id: intent.id,
                    success: false,
                    error: 'File size exceeded the maximum size of 15MB',
                }
            }
            else {
                successfulIntentCount++;

                // can't construct a complete successful intent object yet bc url resources aren't created yet
                intentResult = {
                    id: intent.id,
                    success: true,
                }
            }
            uploadIntentResults.push(intentResult);
        }

        return {
            results: uploadIntentResults,
            successCount: successfulIntentCount,
        };
    }


    async validatePhotos(userId: string, dto: ValidatePhotosDto): Promise<ValidatePhotoResultsDto> {
        const validatePhotoResults: ValidatePhotoResultDto[] = [];

        for (const photo of dto.photos) {
            // (1)
            // In redis, validate the current upload intent with the information provided
            const timedUploadIntent = await this.redisService.getUploadIntent(photo.object_key);
            if (!timedUploadIntent) {
                validatePhotoResults.push({
                    id: photo.id,
                    success: false,
                    error: "Invalid or expired object_key",
                });

                this.redisService.setUploadIntentStatus(photo.object_key, UploadIntentStatus.FAILED);
                continue;
            }

            const uploadIntentValidateResult = this.validateTimedUploadIntent(timedUploadIntent, userId);
            if (!uploadIntentValidateResult.valid) {
                validatePhotoResults.push({
                    id: photo.id,
                    success: false,
                    error: uploadIntentValidateResult.error,
                });

                this.redisService.setUploadIntentStatus(photo.object_key, UploadIntentStatus.FAILED);
                continue;
            } else {
                timedUploadIntent.setStatus(UploadIntentStatus.INTENT_VALIDATED);
                this.redisService.setUploadIntentStatus(photo.object_key, UploadIntentStatus.INTENT_VALIDATED);
            }
            

            // (2) 
            // validate the photo has been uploaded to S3, and has the same metadata as the upload intent
            const validateCloudUploadAgainstUploadIntentResult = await this.validateCloudUploadAgainstUploadIntent(photo.object_key);
            if (!validateCloudUploadAgainstUploadIntentResult.valid) {
                validatePhotoResults.push({
                    id: photo.id,
                    success: false,
                    error: validateCloudUploadAgainstUploadIntentResult.error,
                });

                this.redisService.setUploadIntentStatus(photo.object_key, UploadIntentStatus.FAILED);
                continue;
            } else {
                timedUploadIntent.setStatus(UploadIntentStatus.PHOTO_UPLOADED);
                this.redisService.setUploadIntentStatus(photo.object_key, UploadIntentStatus.PHOTO_UPLOADED);
            }

            // (3)
            // load in a small portion of the file in order to determine the actual image format
            const validateFileUploadedToCloudStorageResult = await this.validateFileUploadedToCloudStorage(photo.object_key);
            if (!validateFileUploadedToCloudStorageResult.valid) {
                validatePhotoResults.push({
                    id: photo.id,
                    success: false,
                    error: validateFileUploadedToCloudStorageResult.error,
                });

                this.redisService.setUploadIntentStatus(photo.object_key, UploadIntentStatus.FAILED);
                continue;
            } else {
                timedUploadIntent.setStatus(UploadIntentStatus.PHOTO_VALIDATED);
                this.redisService.setUploadIntentStatus(photo.object_key, UploadIntentStatus.PHOTO_VALIDATED);
            }
            
            // (4)
            // perform the operation on the uploaded photo
            const performPhotoOperationResult = await this.performPhotoOperation(timedUploadIntent.op, userId, photo.object_key);
            if (!performPhotoOperationResult.valid) {
                validatePhotoResults.push({
                    id: photo.id,
                    success: false,
                    error: performPhotoOperationResult.error,
                });

                this.redisService.setUploadIntentStatus(photo.object_key, UploadIntentStatus.FAILED);
                continue;
            }
        
            validatePhotoResults.push({
                id: photo.id,
                success: true,
            });
        }

        return { results: validatePhotoResults } as ValidatePhotoResultsDto;
    }


    private validateTimedUploadIntent(intent: UploadIntent, userId: string): ValidationResult {
        if (!intent.validateId(userId)) {
            return { 
                valid: false, 
                error: `Unauthorized to validate object_key.\nReceived: ${userId}\nExpected: ${intent.id}`
            };
        }
        else if (!intent.isPending()) {
            return {
                valid: false,
                error: "Validation already requested",
            };
        }
        else {
            return { valid: true };
        }
    }


    private async validateCloudUploadAgainstUploadIntent(objectKey: string): Promise<ValidationResult> {
        // verify the metadata of the S3 object
        const headResponse = await this.s3Service.headObject(`raw/${objectKey}`);

        if (!headResponse) {
            return {
                valid: false,
                error: "Photo not properly uploaded; validation failed.",
            }
        } else if (!headResponse.ContentLength || headResponse.ContentLength > REKOGNITION_MAX_S3_OBJECT_SIZE) {
            return {
                valid: false,
                error: "Uploaded photo is exceeds maximum limit 15MB.",
            }
        }
        else if (!headResponse.ContentType || !SUPPORTED_MIME_TYPES.has(headResponse.ContentType)) {
            return {
                valid: false,
                error: "Uploaded photo is not a supported format. Must be JPEG or PNG.",
            }
        }
        
        return { valid: true };
    }


    private async validateFileUploadedToCloudStorage(objectKey: string): Promise<ValidationResult> {
        try {
            const getResponse = await this.s3Service.getObject(
                `raw/${objectKey}`, 
                {
                    start: 0,
                    end: FILE_TYPE_VALIDATION_BUFFER_SIZE - 1,
                }
            );

            // convert s3 stream to a buffer for more error prone execution
            const getBodyStream = getResponse.Body;
            if (!getBodyStream) {
                return {
                    valid: false,
                    error: "Uploaded photo must not be empty file",
                }
            }
            const buffer = await streamToBuffer(getBodyStream as Readable);

            // check actual file format via file magic numbers
            const { fileTypeFromBuffer } = await loadEsm<typeof import("file-type")>('file-type');
            const fileType = await fileTypeFromBuffer(buffer);
            if (!fileType || !SUPPORTED_MIME_TYPES.has(fileType!.mime)) {
                return {
                    valid: false,
                    error: `Uploaded photo of format ${fileType ? fileType!.mime : 'unknown'} is not supported`,
                }
            }
        } catch (err) {
            console.log(`[ERROR]: Encountered error while validating uploaded file ${objectKey}.\nMessage: ${err.message}`);
            return {
                valid: false,
                error: 'Internal server error',
            };
        }

        return { valid: true };
    }


    private async performPhotoOperation(op: PhotoOperation, userId: string, objectKey: string): Promise<ValidationResult> {
        switch (op) {
            case PhotoOperation.PROFILE_PIC:
                return await this.validateProfilePic(userId, objectKey);
            
            case PhotoOperation.NORMAL_ALBUM:
            case PhotoOperation.GROUP_ALBUM:
                // to be implemented
            
            default:
                // return a ValidatePhotoResultDto {id, success: false, error: "internal server error"}
                // as the PhotoOperation stored in the redis entry shouldn't be a value outside the enum
        }

        return { valid: true };
    }


    private async validateProfilePic(userId: string, objectKey: string): Promise<ValidationResult> {
        // IN THE FUTURE, PROPER SAGA WOULD NEED TO BE IMPLEMENTED FOR PHOTO OPERATIONS
        // FOR PROPER ERROR HANDLING
        
        try {
            // perform the photo operation
            await this.rekognitionService.validateProfilePic(objectKey);

            // obtain the objectKey + faceId of the previous profile photo
            const prevUserEntity = await this.userService.findUserById(userId);
            if (!prevUserEntity) {
                throw new UserProfileNotFoundError(userId);
            }

            let prevProfilePhotoEntity: Photo | null = null;
            if (prevUserEntity.profile_pic_obj_key) {
                prevProfilePhotoEntity = await this.photoRepo.getPhotoById(prevUserEntity.profile_pic_obj_key);
            }

            // persist the changes in DB
            await this.changeProfilePicOnDB(userId, objectKey, prevUserEntity.profile_pic_obj_key);

            // persist the changes in cloud storage
            await this.changeProfilePicOnCloudStorage(objectKey, prevUserEntity.profile_pic_obj_key);

            // modify the Rekognition user, and the new photo entity
            const newFaceId = await this.rekognitionService.replaceProfilePic(userId, objectKey, prevProfilePhotoEntity?.model_face_id);
            await this.photoRepo.updateModelFaceId(objectKey, newFaceId);
        } catch (err) {
            let errorMessage: string;

            if (err.name === 'RekognitionClientRuleViolationError') {
                console.log(`[ERROR]: RekognitionClientRuleViolationError\nUserId: ${userId}\nError Code: ${err.err_code}\nMessage: ${err.message}`);
                errorMessage = err.message;
            } else {
                console.log(`[ERROR]: Server error during photo validation of user ${userId} and photo ${objectKey}.\nMessage: ${err.message}`);
                errorMessage = 'Internal Server Error';
            }

            return {
                valid: false,
                error: errorMessage,
            }
        }

        return { valid: true };
    }


    async changeProfilePicOnDB(userId: string, newObjectKey: string, oldObjectKey?: string): Promise<void> {
        // persist validated photo entity in db
        await this.createPhoto(newObjectKey, userId);
        await this.userService.updateProfilePicObjKey(userId, newObjectKey);

        // if it already existed, delete the previous profile pic from db
        if (oldObjectKey) {
            await this.removePhoto(oldObjectKey);
        }
    }


    async createPhoto(objectKey: string, userId: string): Promise<Photo> {
        const createdEntity = this.photoRepo.createPhotoEntity(objectKey, userId);
        await this.photoRepo.insertEntity(createdEntity);
        return createdEntity;
    }


    async removePhoto(objectKey: string): Promise<void> {
        await this.photoRepo.delete(objectKey);
    }


    async changeProfilePicOnCloudStorage(newObjectKey: string, oldObjectKey?: string): Promise<void> {
        // persist validated object in s3
        await this.s3Service.copyObject(`raw/${newObjectKey}`, newObjectKey);

        // if it already existed, delete the previous profile pic from s3
        if (oldObjectKey) {
            await this.s3Service.deleteObject(oldObjectKey);
        }
    }
}
