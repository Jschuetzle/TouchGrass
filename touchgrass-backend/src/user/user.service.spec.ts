import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException } from '@nestjs/common'; 
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserRequestDto } from './dto/request/create-user.dto';
import { User } from './user.entity';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { RekognitionModule } from '../rekognition/rekognition.module';
import { S3Module } from '../s3/s3.module';
import { RekognitionService } from '../rekognition/rekognition.service';
import { S3Service } from '../s3/s3.service';

describe('UserService', () => {
  // dependencies
  let service: UserService;
  let mockRepository: DeepMocked<Repository<User>>;
  let mockRekognitionService: DeepMocked<RekognitionService>;
  let mockS3Service: DeepMocked<S3Service>;

  // test data
  let testUserId: string;
  let testUsername: string;
  let userToCreate: CreateUserRequestDto;
  let savedUser: User;

  beforeAll(async () => {
    const userRepositoryToken = getRepositoryToken(User);
    const module: TestingModule = await Test.createTestingModule({
      imports: [RekognitionModule, S3Module],
      providers: [
        UserService,
        {
          provide: userRepositoryToken, useValue: createMock<Repository<User>>({}, { strict: true })
        },
        {
          provide: RekognitionService, useValue: createMock<RekognitionService>({}, { strict: true })
        },
        {
          provide: S3Service, useValue: createMock<S3Service>({}, { strict: true })
        },
      ]
    })
    .compile();

    service = module.get<UserService>(UserService);
    mockRepository = module.get<DeepMocked<Repository<User>>>(userRepositoryToken);
    mockRekognitionService = module.get<DeepMocked<RekognitionService>>(RekognitionService);
    mockS3Service = module.get<DeepMocked<S3Service>>(S3Service);

    testUserId = '1'
    testUsername = 'user1'
    userToCreate = { username: testUsername };
    savedUser = { 
      id: testUserId, 
      username: testUsername,
      firstname: "",
      lastname: "",
      email: "",
      phone_number: "",
      created_at: new Date(),
      daily_upload_count: 0,
      profile_pic_link: "",
      completed_new_user_flow: false,
      following: [],
      followers: [],
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it("should return HTTP 400 if user is created with duplicate ID", async () => {
    mockRepository.findBy.mockResolvedValue([{id: '1', username: 'user2'} as User]);

    return expect(service.create(testUserId, userToCreate))
      .rejects
      .toBeInstanceOf(BadRequestException);
  });

  it("should return HTTP 409 if user is created with duplicate username", async () => {
    mockRepository.findBy.mockResolvedValue([{id: '2', username: 'user1'} as User]);

    return expect(service.create(testUserId, userToCreate))
      .rejects
      .toBeInstanceOf(ConflictException);
  });

  it("should return HTTP 400 if user is created with duplicate ID and username", async () => {
    mockRepository.findBy.mockResolvedValue([{id: '1', username: 'user1'} as User]);

    return expect(service.create(testUserId, userToCreate))
      .rejects
      .toBeInstanceOf(BadRequestException);
  });

  it("should return user entity upon user creation with no duplicate information", async () => {
    mockRepository.findBy.mockResolvedValue([]);
    mockRepository.create.mockReturnValue(savedUser);
    mockRepository.save.mockResolvedValue(savedUser);

    return expect(service.create(testUserId, userToCreate))
      .resolves
      .toEqual(savedUser);
  });

  it("should return user entity upon searching with 'userId' for existing user", async () => {
    mockRepository.findOneBy.mockResolvedValue(savedUser);

    expect(service.findUser(testUserId))
      .resolves
      .toEqual(savedUser);
  });

  it("should return user entity upon searching with 'userId' for existing user", async () => {
    mockRepository.findOneBy.mockResolvedValue(savedUser);

    expect(service.findUser(testUserId))
      .resolves
      .toEqual(savedUser);
  });

  it("should return null upon searching with 'userId' for non-existing user", async () => {
    mockRepository.findOneBy.mockResolvedValue(null);

    expect(service.findUser(testUserId))
      .resolves
      .toBeNull();
  });
});
