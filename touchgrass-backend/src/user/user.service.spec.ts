import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { CreateUserRequestDto } from './dto/request/create-user.dto';
import { User } from './domain/user.entity';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { RekognitionService } from '../rekognition/rekognition.service';
import { S3Service } from '../s3/s3.service';
import { UserRepository } from './domain/user-repository.interface';
import { USER_REPOSITORY_TOKEN } from '../common/constants/provider-tokens';
import { JsonPatchOp } from '../common/dto/JsonPatchDto';
import { UnsupportedPatchOperationError } from '../common/errors/unsupported-patch-operation.error';
import { UserProfileNotFoundError } from '../common/errors/user-profile-not-found.error';
import { applyOperation } from 'fast-json-patch';
import { PatchPathDoesNotExistError } from '../common/errors/patch-path-does-not-exist.error';
import { PatchDomainError } from '../common/errors/patch-domain.error';
import { validate, ValidationError } from 'class-validator';
import { InvalidPatchValueError } from '../common/errors/invalid-patch-value.error';

jest.mock('fast-json-patch', () => {
  return {
    applyOperation: jest.fn(),
    deepClone: jest.fn(),
  }
});

jest.mock('class-transformer', () => {
  const actual = jest.requireActual('class-transformer');
  return {
    ...actual,
    instanceToPlain: jest.fn(),
    plainToInstance: jest.fn(),
  }
});

jest.mock('class-validator', () => {
  const actual = jest.requireActual('class-validator');
  return {
    ...actual,
    validate: jest.fn(),
  }
});

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: DeepMocked<UserRepository>;
  let mockRekognitionService: DeepMocked<RekognitionService>;
  let mockS3Service: DeepMocked<S3Service>;

  const applyOperationMock = applyOperation as jest.MockedFunction<typeof applyOperation>;
  const validateMock = validate as jest.MockedFunction<typeof validate>;

  const testUserId = "1";
  const testUsername = "testUsername";
  const testCreateUserRequestDto = createMock<CreateUserRequestDto>();
  const testUser = createMock<User>();

  const testJsonPatch = createMock<JsonPatchOp>({
    path: 'some path',
  });
  const testPatchErrorPathUnresolvable = createMock<Error>({
    name: 'OPERATION_PATH_UNRESOLVABLE',
    message: 'some error message',

  });
  const testPatchErrorGeneral = createMock<Error>({
    name: 'some error',
    message: 'some message',
  });

  const testClassValidatorError = createMock<ValidationError>();
  testClassValidatorError.property = 'some property';
  testClassValidatorError.value = 'some JSON value';
  testClassValidatorError.constraints = {
    constraint: 'some violated constraint',
  }

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
    testJsonPatch.op = 'replace';
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
    await userService.findUserById(testUsername);

    expect(mockUserRepository.getUserById).toHaveBeenCalledTimes(1);
  });

  it("upon successful fetch of existing entity with given 'id', entity should be returned", () => {
    mockUserRepository.getUserById.mockResolvedValue(testUser);

    expect(userService.findUserById(testUsername)).resolves.toBe(testUser);
  });

  it("upon successful fetch, but no existing user with given 'username', returns null", () => {
    mockUserRepository.getUserById.mockResolvedValue(null);

    expect(userService.findUserById(testUsername)).resolves.toBeNull();
  });

  /**
   * 
   * USER UPDATE
   * 
   */
  it("should throw an UnsupportedPatchOperation when patch op is 'add'", async () => {
    testJsonPatch.op = 'add';
    
    await expect(userService.updateUser(testUserId, [testJsonPatch])).rejects.toThrow(UnsupportedPatchOperationError);
  });

  it("should throw an UnsupportedPatchOperation when patch op is 'remove'", async () => {
    testJsonPatch.op = 'remove';
    
    await expect(userService.updateUser(testUserId, [testJsonPatch])).rejects.toThrow(UnsupportedPatchOperationError);
  });

  it("should throw an UnsupportedPatchOperation when patch op is 'test'", async () => {
    testJsonPatch.op = 'test';
    
    await expect(userService.updateUser(testUserId, [testJsonPatch])).rejects.toThrow(UnsupportedPatchOperationError);
  });

  it("should throw an UnsupportedPatchOperation when patch op is 'move'", async () => {
    testJsonPatch.op = 'move';
    
    await expect(userService.updateUser(testUserId, [testJsonPatch])).rejects.toThrow(UnsupportedPatchOperationError);
  });

  it("should throw an UnsupportedPatchOperationError when patch op is 'copy'", async () => {
    testJsonPatch.op = 'copy';
    
    await expect(userService.updateUser(testUserId, [testJsonPatch])).rejects.toThrow(UnsupportedPatchOperationError);
  });

  it("upon parsing 'replace' op, should throw a UserProfileNotFoundError when user entity doesn't exist yet", async () => {
    mockUserRepository.getUserById.mockResolvedValue(null);

    await expect(userService.updateUser(testUserId, [testJsonPatch])).rejects.toThrow(UserProfileNotFoundError);
  });

  it("upon successful query of user entity, should return PatchPathDoesNotExistError for a 'path' that doesn't exist", 
    async () => {
      mockUserRepository.getUserById.mockResolvedValue(testUser);
      applyOperationMock.mockImplementation(() => { throw testPatchErrorPathUnresolvable; });

      await expect(userService.updateUser(testUserId, [testJsonPatch])).rejects.toThrow(PatchPathDoesNotExistError);
    }
  );

  it("upon successful user entity query, should return PatchDomainError for general PatchError", 
    async () => {
      mockUserRepository.getUserById.mockResolvedValue(testUser);
      applyOperationMock.mockImplementation(() => { throw testPatchErrorGeneral; });

      await expect(userService.updateUser(testUserId, [testJsonPatch])).rejects.toThrow(PatchDomainError);
    }
  );

  it("upon successful user entity query and patches, should return InvalidPatchValueError if error occurs during validation", 
    async () => {
      mockUserRepository.getUserById.mockResolvedValue(testUser);
      validateMock.mockResolvedValue([testClassValidatorError]);

      await expect(userService.updateUser(testUserId, [testJsonPatch])).rejects.toThrow(InvalidPatchValueError);
    }
  );

  it("upon successful user entity query, patches, and patch validation, should call saveEntity only one time", async () => {
    mockUserRepository.getUserById.mockResolvedValue(testUser);
    validateMock.mockResolvedValue([]);

    await userService.updateUser(testUserId, [testJsonPatch]);

    expect(mockUserRepository.saveEntity).toHaveBeenCalledTimes(1);
  });

  it("upon successful user entity query, patches, patch validation, and db persistence, should return updatedEntity", 
    () => {
      mockUserRepository.getUserById.mockResolvedValue(testUser);
      validateMock.mockResolvedValue([]);
      mockUserRepository.saveEntity.mockResolvedValue(testUser);

      expect(userService.updateUser(testUserId, [testJsonPatch])).resolves.toBe(testUser);
    }
  );

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
