import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException } from '@nestjs/common'; 
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserRequestDto } from './dto/request/create-user.dto';
import { User } from './user.entity';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { RekognitionService } from '../rekognition/rekognition.service';
import { S3Service } from '../s3/s3.service';

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: DeepMocked<Repository<User>>;
  let mockRekognitionService: DeepMocked<RekognitionService>;
  let mockS3Service: DeepMocked<S3Service>;

  const testUserId1 = "1";
  const testUserId2 = "2";
  const testUsername1 = "user1";
  const testUsername2 = "user2";
  const testCreateUserRequestDto = createMock<CreateUserRequestDto>({
    username: testUsername2,
  });
  const testUser1 = createMock<User>({
    id: testUserId1,
    username: testUsername1,
  });
  const testUser2 = createMock<User>({
    id: testUserId2,
    username: testUsername2,
  });

  beforeAll(async () => {
    const userRepositoryToken = getRepositoryToken(User);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: userRepositoryToken, useValue: createMock<Repository<User>>()
        },
      ]
    })
    .useMocker(createMock)
    .compile();

    userService = module.get(UserService);
    mockUserRepository = module.get(userRepositoryToken);
    mockRekognitionService = module.get(RekognitionService);
    mockS3Service = module.get(S3Service);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  /**
   * 
   * USER CREATION
   * 
   */
  it("should return HTTP 400 if user is created with duplicate ID", () => {
    mockUserRepository.findBy.mockResolvedValue([testUser1]);

    expect(userService.create(testUserId1, testCreateUserRequestDto)).rejects.toBeInstanceOf(BadRequestException);
    expect(mockUserRepository.save).not.toHaveBeenCalled();
  });

  it("should return HTTP 409 if user is created with duplicate username", () => {
    mockUserRepository.findBy.mockResolvedValue([testUser2]);

    expect(userService.create(testUserId1, testCreateUserRequestDto)).rejects.toBeInstanceOf(ConflictException);
    expect(mockUserRepository.save).not.toHaveBeenCalled();
  });

  it("should return HTTP 400 if user is created with duplicate ID and username", () => {
    mockUserRepository.findBy.mockResolvedValue([testUser2]);

    expect(userService.create(testUserId2, testCreateUserRequestDto)).rejects.toBeInstanceOf(BadRequestException);
    expect(mockUserRepository.save).not.toHaveBeenCalled();
  });

  it("for non-duplicate user, should return entity of the new user", () => {
    mockUserRepository.findBy.mockResolvedValue([]);
    mockUserRepository.save.mockResolvedValue(testUser1);

    expect(userService.create(testUserId1, testCreateUserRequestDto)).resolves.toEqual(testUser1);
  });

  it('for non-duplicate user, should make one call to persist entity in db', async () => {
    mockUserRepository.findBy.mockResolvedValue([]);
    
    await userService.create(testUserId1, testCreateUserRequestDto);

    expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
  });

  /**
   * 
   * USER SEARCH
   * 
   */
  it("should return entity corresponding to an existing user with 'username'", () => {
    mockUserRepository.findOneBy.mockResolvedValue(testUser1);

    expect(userService.findUser(testUsername1)).resolves.toBe(testUser1);
  });

  it("should return null upon searching with 'username' for non-existing user", () => {
    mockUserRepository.findOneBy.mockResolvedValue(null);

    expect(userService.findUser(testUsername1)).resolves.toBeNull();
  });

  /**
   * 
   * USER UPDATE
   * 
   * I'm going to wait on writing unit tests for this, as the updateUser service function and
   * is too broad. Really I need to change the patch route handle.
   */


  /**
   * 
   * VALIDATE PROFILE PHOTO PUT
   * 
   * Going to wait on finalizing this feature until I write unit tests
   * 
   */


  /**
   * 
   * SEARCH USERS
   * 
   * Going to wait until coding of the friends feature until I write unit tests
   * 
   */
  
});
