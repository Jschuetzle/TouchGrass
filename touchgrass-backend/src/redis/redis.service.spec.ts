import { Test, TestingModule } from "@nestjs/testing";
import { RedisService } from "./redis.service";
import { REDIS_PROVIDER_WORKER_TOKEN } from "../common/constants/provider-tokens";
import { createMock, DeepMocked } from "@golevelup/ts-jest";
import { UPLOAD_INTENT_NORMAL_PIC_EXPIRATION_TIME } from "../common/constants/photos";
import { RedisError } from "./redis.error";
import { RedisClientType } from "@redis/client";

describe('RedisService', () => {
    let redisService: RedisService;
    let mockRedisClient: DeepMocked<RedisClientType>;

    const testObjectKey = "testObjectKey";
    const testUserId = "testUserId";
    const testExpirationTime = 50;

    const testError = createMock<Error>({
        message: 'some error message',
        name: "some name",
    });
    
    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RedisService,
                {
                    provide: REDIS_PROVIDER_WORKER_TOKEN, 
                    useValue: createMock<RedisClientType>(),
                }
            ]
        })
        .compile();

        redisService = module.get(RedisService);
        mockRedisClient = module.get(REDIS_PROVIDER_WORKER_TOKEN);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it(`upon creating upload intent with default params, and successful redis client operations,
        should call redisClient only once with proper arguments`, 
        async () => {
            await redisService.createTimedUploadIntent(testObjectKey, testUserId);

            expect(mockRedisClient.hSetEx).toHaveBeenCalledTimes(1);

            const hSetExParams = mockRedisClient.hSetEx.mock.calls[0];
            expect(hSetExParams[0]).toBe(testObjectKey);
            expect((hSetExParams[1] as any).id).toBe(testUserId);
            expect((hSetExParams[2] as any).expiration.value).toBe(UPLOAD_INTENT_NORMAL_PIC_EXPIRATION_TIME);
        }
    );

    it('upon creating upload intent with non default param, should make proper API call to expire the objectKey', async () => {
        await redisService.createTimedUploadIntent(testObjectKey, testUserId, testExpirationTime);

        expect(mockRedisClient.hSetEx).toHaveBeenCalledTimes(1);

        const hSetExParams = mockRedisClient.hSetEx.mock.calls[0];
        expect((hSetExParams[2] as any).expiration.value).toBe(testExpirationTime);
    });

    it('upon successful creation of upload intent, should return void', () => {
        expect(redisService.createTimedUploadIntent(testObjectKey, testUserId)).resolves.toBeUndefined();
    });

    it('upon failure to hSetEx, should throw RedisError', async () => {
        mockRedisClient.hSetEx.mockImplementation(() => { throw testError; });

        await expect(redisService.createTimedUploadIntent(testObjectKey, testUserId)).rejects.toThrow(RedisError);
    });
});