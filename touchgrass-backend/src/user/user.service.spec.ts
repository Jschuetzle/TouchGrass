import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { CreateUserRequestDto } from './dto/request/create-user.dto';
import { User } from './domain/user.entity';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { RekognitionService } from '../rekognition/rekognition.service';
import { S3Service } from '../s3/s3.service';
import { UserRepository } from './domain/user-repository.interface';
import { USER_REPOSITORY_TOKEN } from '../common/constants/provider-tokens';

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: DeepMocked<UserRepository>;
  let mockRekognitionService: DeepMocked<RekognitionService>;
  let mockS3Service: DeepMocked<S3Service>;

  const testUserId = "1";
  const testUsername = "testUsername";
  const testCreateUserRequestDto = createMock<CreateUserRequestDto>();
  const testUser = createMock<User>();

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: USER_REPOSITORY_TOKEN, useValue: createMock<UserRepository>(),
        },
      ]
    })
    .useMocker(createMock)
    .compile();

    userService = module.get(UserService);
    mockUserRepository = module.get(USER_REPOSITORY_TOKEN);
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
  it("upon successful creation of the entity, insert should be called only once", async () => {
    mockUserRepository.createUserEntity.mockReturnValue(testUser);

    await userService.create(testUserId, testCreateUserRequestDto);

    expect(mockUserRepository.insertEntity).toHaveBeenCalledTimes(1);
  });

  it('upon successful creation and insertion of the entity, created entity should be returned', async () => {
    mockUserRepository.createUserEntity.mockReturnValue(testUser);
    // don't need to mock return of insertEntity since it returns void
    
    expect(userService.create(testUserId, testCreateUserRequestDto)).resolves.toBe(testUser);
  });

  /**
   * 
   * USER SEARCH
   * 
   */
  it('should call domain layer only once to obtain user entity', async () => {
    await userService.findUser(testUsername);

    expect(mockUserRepository.getUserEntity).toHaveBeenCalledTimes(1);
  });

  it("upon successful fetch of existing entity with given 'username', entity should be returned", () => {
    mockUserRepository.getUserEntity.mockResolvedValue(testUser);

    expect(userService.findUser(testUsername)).resolves.toBe(testUser);
  });

  it("upon successful fetch, but no existing user with given 'username', returns null", () => {
    mockUserRepository.getUserEntity.mockResolvedValue(null);

    expect(userService.findUser(testUsername)).resolves.toBeNull();
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
