import { ILike, Not } from 'typeorm';
import { ConflictException, Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user-request.dto';
import { UpdateUserDto } from './dto/update-user-request.dto';
import { UploadProfilePhotoRequestDto } from './dto/upload-profile-photo-request.dto';
import { UploadProfilePhotoResponseDto } from './dto/upload-profile-photo-response.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>
  ) {}


  /**
   * Creates and persists a new User entity from the provided CreateUserDto.
   *
   * Expected Behavior:
   * - If the user ID already exists, throws BadRequestException.
   * - If the username already exists, throws ConflictException.
   * - Otherwise, inserts the new user into the database and returns it.
   * 
   * In the case where the user ID exists AND the username exists, the BadRequestException
   * will be favored, as this is a serious issue (possible impersonation).
   *
   * @param dto Data transfer object containing the fields required to create a user.
   * @returns The newly created User entity.
   * @throws BadRequestException if a user with the same ID already exists.
   * @throws ConflictException if a user with the same username already exists.
  **/
  async create(userId: string, user: Partial<User>): Promise<User | null> {
    // EVENTUALLY MOVE TYPEORM CALLS TO IT'S OWN SERVICE CLASS
    // Otherwise, we tightly couple the mocks with the TypeORM calls...i.e. changing findBy to findOneBy would fail all tests 
    const duplicateUsers = await this.userRepo.findBy([
      { id: userId },
      { username: user.username },
    ]);

    const userIdExisting = duplicateUsers.some(dupUser => dupUser.id === userId);
    const usernameExisting = duplicateUsers.some(dupUser => dupUser.username === user.username);
  
    if (userIdExisting) {
      throw new BadRequestException();
    } else if (usernameExisting) {
      throw new ConflictException('Username already taken');
    }
  
    const createdUser = this.userRepo.create({
      ...user,
      id: userId,
    });
    return this.userRepo.save(createdUser);
  }

  /**
   * Return the User entity associated with 'userId', if it exists.
   *
   * @param userId Unique Firebase user ID used for search
   * @returns The User entity associated with 'userId', otherwise null.
  **/
  async findUser(userId: string): Promise<User | null> {
    return await this.userRepo.findOneBy({ id: userId });
  }


  /**
   * Update the user entity according to the information in the dto,
   * and return the new instance of the user.
   * 
   * @param user Data transfer object containing the fields required to update a user.
   * @returns The newly updated User entity.
  **/
  async updateUser(userId: string, user: Partial<User>): Promise<User | null> {
    // don't perform operations if empty dto is sent
    if (user && Object.keys(user).length > 0) {
      await this.userRepo.update(userId, user);
    }
    
    return await this.findUser(userId);
  }


  /**
   * Validate the profile picture uploaded by the user. If validated, a Rekognition collection
   * dedicated to the user is created, and the profile picture is associated to this collection.
   * Otherwise, a 409 Conflict is sent back to the user, in which they will attempt with a different profile photo.
   * 
   * @param dto Data transfer object containing the profile photo in base64 encoding.
   * @returns The AWS S3 link to the profile photo
  **/
  async validateProfilePhoto(userId: string, dto: UploadProfilePhotoRequestDto): Promise<UploadProfilePhotoResponseDto | null> {
    // dumby endpoint for now...50% chance success, 50% chance error
    const profilePhotoS3Link = "some link";

    if (Math.random() < 0.5) {
      throw new ConflictException("Could not validate profile photo");
    } else {
      return {
        profile_photo_link: profilePhotoS3Link,
      } as UploadProfilePhotoResponseDto;
    }
  }


  // look into testing/modifying this function after
  //  1. Talking w/ Abhi
  //  2. Getting hands dirty with friends feature
  async searchUsers(username: string, page = 1, limit = 10): Promise<User[]> {
    if (!username || !username.trim()) {
      return [];
    }

    const exactMatch = await this.userRepo.findOneBy({ username: username });
    const extraLimit = exactMatch ? limit - 1 : limit;

    const offset = (page - 1) * limit;
    const partialMatches = await this.userRepo.find({
      where: {
        username: ILike(`%${username}%`),
        ...(exactMatch && { id: Not(exactMatch.id) }),
      },
      skip: offset,
      take: extraLimit,
    });

    if (exactMatch) {
      return [exactMatch, ...partialMatches];
    }

    return partialMatches;
  }
}