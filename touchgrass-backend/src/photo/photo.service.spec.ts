import { Test, TestingModule } from "@nestjs/testing";
import { PhotoService } from "./photo.service";
import { createMock, DeepMocked } from "@golevelup/ts-jest";
import { UserService } from "../user/user.service";
import { S3Service } from "../s3/s3.service";
import { RedisService } from "../redis/redis.service";
import { DEFAULT_DAILY_UPLOAD_COUNT } from "../common/constants/user";
import { User } from "../user/domain/user.entity";
import { PhotoUploadIntentDto, PhotoUploadIntentsRequestDto } from "./dto/request/photo-upload-intent.dto";
import { UploadLimitAlreadyReachedError } from "../common/errors/upload-limit-already-reached.error";
import { PhotoUploadLimitExceededError } from "../common/errors/photo-upload-limit-exceeded.error";
import { REKOGNITION_MAX_S3_OBJECT_SIZE } from "../common/constants/rekognition";
import { PhotoUploadIntentResultDto, PhotoUploadIntentResultsDto } from "./dto/response/photo-upload-intent-result.dto";
import { UPLOAD_INTENT_NORMAL_PIC_EXPIRATION_TIME, UPLOAD_INTENT_PROFILE_PIC_EXPIRATION_TIME } from "../common/constants/photos";

describe('PhotoService', () => {
    let photoService: PhotoService;
    let mockUserService: DeepMocked<UserService>;
    let mockS3Service: DeepMocked<S3Service>;
    let mockRedisService: DeepMocked<RedisService>;

    const testRandomUUID = 't-e-s-t-uuid';
    jest.spyOn(globalThis.crypto, 'randomUUID')
        .mockReturnValue(testRandomUUID);

    const testUserId = 'testUserId';
    const testPhotoId = 'testPhotoId';
    const testPresignedUrl = 'testPresignedUrl';
    const testErrorString = 'File size exceeded the maximum size of 15MB';

    const testValidPhotoUploadIntentDto: PhotoUploadIntentDto = {id: testPhotoId, size: REKOGNITION_MAX_S3_OBJECT_SIZE};
    const testInvalidPhotoUploadIntentDto: PhotoUploadIntentDto = {id: testPhotoId, size: REKOGNITION_MAX_S3_OBJECT_SIZE + 1};
    const testPhotoUploadIntentDtoSizeOmitted: PhotoUploadIntentDto = {id: testPhotoId};
    const testPhotoUploadIntentsDto: PhotoUploadIntentsRequestDto = {
        is_profile_pic: false,
        intents: [testValidPhotoUploadIntentDto, testInvalidPhotoUploadIntentDto],
    };
    const testPhotoUploadIntentsDtoForProfilePic: PhotoUploadIntentsRequestDto = {
        is_profile_pic: true,
        intents: [testValidPhotoUploadIntentDto],
    };
    const testPhotoUploadIntentsDtoMissingSize: PhotoUploadIntentsRequestDto = {
        is_profile_pic: false,
        intents: [testPhotoUploadIntentDtoSizeOmitted],
    };

    const testValidPhotoUploadIntentResultDto: PhotoUploadIntentResultDto = {
        id: testPhotoId,
        success: true,
        object_key: `raw/${testRandomUUID}`,
        presigned_url: testPresignedUrl,
    };
    const testInvalidPhotoUploadIntentResultDto: PhotoUploadIntentResultDto = {
        id: testPhotoId,
        success: false,
        error: testErrorString,
    };
    const testPhotoUploadIntentResultsDto: PhotoUploadIntentResultsDto = {
        intent_results: [testValidPhotoUploadIntentResultDto, testInvalidPhotoUploadIntentResultDto],
    };


    const testUser = createMock<User>({daily_upload_count: 0});
    const testUserAtDailyLimit = createMock<User>({daily_upload_count: DEFAULT_DAILY_UPLOAD_COUNT});
    const testUserNearDailyLimit = createMock<User>({daily_upload_count: DEFAULT_DAILY_UPLOAD_COUNT - 1});

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PhotoService,
            ],
        })
        .useMocker(createMock)
        .compile();

        photoService = module.get(PhotoService);
        mockUserService = module.get(UserService);
        mockS3Service = module.get(S3Service);
        mockRedisService = module.get(RedisService);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('if user has reached daily upload limit, then UploadLimitAlreadyReachedError is thrown', async () => {
        mockUserService.findUserById.mockResolvedValue(testUserAtDailyLimit);

        await expect(photoService.handleUploadIntents(testUserId, testPhotoUploadIntentsDto))
            .rejects
            .toThrow(UploadLimitAlreadyReachedError);
    });

    it('if upload intents plus current count exceeds daily upload limit, then PhotoUploadLimitExceededError is thrown', async () => {
        mockUserService.findUserById.mockResolvedValue(testUserNearDailyLimit);

        await expect(photoService.handleUploadIntents(testUserId, testPhotoUploadIntentsDto))
            .rejects
            .toThrow(PhotoUploadLimitExceededError);
    });

    it("if upload intents don't exceed limit, then only one call to update the upload count on user entity should be made", async () => {
        mockUserService.findUserById.mockResolvedValue(testUser);

        await photoService.handleUploadIntents(testUserId, testPhotoUploadIntentsDto);

        expect(mockUserService.addToDailyUploadCount).toHaveBeenCalledTimes(1);
    });

    it(`if upload intents don't exceed limit, then number of calls to redis service 
        equals the number of valid intents, and arguments are correct`, 
        async () => {
            mockUserService.findUserById.mockResolvedValue(testUser);
            const validUploadIntents = 1;

            await photoService.handleUploadIntents(testUserId, testPhotoUploadIntentsDto);

            expect(mockRedisService.createTimedUploadIntent).toHaveBeenCalledTimes(validUploadIntents);
            const redisCallArguments = mockRedisService.createTimedUploadIntent.mock.calls[0];
            expect(redisCallArguments[0]).toBe(`raw/${testRandomUUID}`);
            expect(redisCallArguments[1]).toBe(testUserId);
            expect(redisCallArguments[2]).toBe(UPLOAD_INTENT_NORMAL_PIC_EXPIRATION_TIME);
        }
    );

    it(`if upload intents don't exceed limit, then number of calls to AWS presigning lib
        equals the number of valid intents, and arguments are correct`, 
        async () => {
            mockUserService.findUserById.mockResolvedValue(testUser);
            const validUploadIntents = 1;

            await photoService.handleUploadIntents(testUserId, testPhotoUploadIntentsDto);

            expect(mockS3Service.generatePutPresignedUrl).toHaveBeenCalledTimes(1);
            const signedUrlCallArguments = mockS3Service.generatePutPresignedUrl.mock.calls[0];
            expect(signedUrlCallArguments[0]).toBe(`raw/${testRandomUUID}`);
            expect(signedUrlCallArguments[1]).toBe(UPLOAD_INTENT_NORMAL_PIC_EXPIRATION_TIME);
            expect(signedUrlCallArguments[2]).toBe('');
            expect(signedUrlCallArguments[3]).toBe(REKOGNITION_MAX_S3_OBJECT_SIZE);
        }
    );

    it(`If upload intents don't exceed limit, then should return proper UploadIntentResults`, () => {
        mockUserService.findUserById.mockResolvedValue(testUser);
        mockS3Service.generatePutPresignedUrl.mockResolvedValue(testPresignedUrl);

        expect(photoService.handleUploadIntents(testUserId, testPhotoUploadIntentsDto))
            .resolves
            .toStrictEqual(testPhotoUploadIntentResultsDto);
    });

    it("if upload intent is for profile pic, then no calls to update the upload count on user entity should be made", async () => {
        await photoService.handleUploadIntents(testUserId, testPhotoUploadIntentsDtoForProfilePic);

        expect(mockUserService.addToDailyUploadCount).toHaveBeenCalledTimes(0);
    });

    it('if valid upload intent is for profile_pic, then objectKey prefix should properly reflect that', async () => {
        const intentResults = (await photoService.handleUploadIntents(testUserId, testPhotoUploadIntentsDtoForProfilePic)).intent_results;

        expect(mockRedisService.createTimedUploadIntent).toHaveBeenCalledTimes(1);
        const redisCallArguments = mockRedisService.createTimedUploadIntent.mock.calls[0];
        expect(redisCallArguments[0]).toBe(`raw/profile-pic/${testRandomUUID}`);

        expect(mockS3Service.generatePutPresignedUrl).toHaveBeenCalledTimes(1);
        const s3CallArguments = mockRedisService.createTimedUploadIntent.mock.calls[0];
        expect(s3CallArguments[0]).toBe(`raw/profile-pic/${testRandomUUID}`);

        expect(intentResults).toHaveLength(1);
        expect(intentResults[0].object_key).toBe(`raw/profile-pic/${testRandomUUID}`);
    });

    it('if valid upload intent is for profile_pic, then expiration time usedshould properly reflect that', async () => {
        await photoService.handleUploadIntents(testUserId, testPhotoUploadIntentsDtoForProfilePic);

        expect(mockRedisService.createTimedUploadIntent).toHaveBeenCalledTimes(1);
        const redisCallArguments = mockRedisService.createTimedUploadIntent.mock.calls[0];
        expect(redisCallArguments[2]).toBe(UPLOAD_INTENT_PROFILE_PIC_EXPIRATION_TIME);

        expect(mockS3Service.generatePutPresignedUrl).toHaveBeenCalledTimes(1);
        const s3CallArguments = mockS3Service.generatePutPresignedUrl.mock.calls[0];
        expect(s3CallArguments[1]).toBe(UPLOAD_INTENT_PROFILE_PIC_EXPIRATION_TIME);
    });

    it(`if upload intent doesn't exceed limit and intent missing metadata, then resources should be created`, async () => {
        mockUserService.findUserById.mockResolvedValue(testUser);
        
        await photoService.handleUploadIntents(testUserId, testPhotoUploadIntentsDtoMissingSize);

        expect(mockRedisService.createTimedUploadIntent).toHaveBeenCalledTimes(1);
        expect(mockS3Service.generatePutPresignedUrl).toHaveBeenCalledTimes(1);
        const s3CallArguments = mockS3Service.generatePutPresignedUrl.mock.calls[0];
        expect(s3CallArguments[2]).toBe('');
        expect(s3CallArguments[3]).toBe(0);
    });

    it(`if upload intent doesn't exceed limit and intent missing metadata, 
        then successful intent result should be returned`, 
        async () => {
            mockUserService.findUserById.mockResolvedValue(testUser);
            
            const intentResults = (await photoService.handleUploadIntents(testUserId, testPhotoUploadIntentsDtoMissingSize)).intent_results;
            expect(intentResults).toHaveLength(1);
            expect(intentResults[0].success).toBe(true);
        }
    );
})