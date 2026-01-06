import { Inject, Injectable } from "@nestjs/common";
import { RedisClientType } from "@redis/client";
import { REDIS_PROVIDER_WORKER_TOKEN } from "../common/constants/provider-tokens";
import { RedisError } from "./redis.error";
import { UPLOAD_INTENT_NORMAL_PIC_EXPIRATION_TIME } from "../common/constants/photos";

@Injectable()
export class RedisService {
    constructor(@Inject(REDIS_PROVIDER_WORKER_TOKEN) private readonly redisClient: RedisClientType) {}

    async createTimedUploadIntent(
        objectKey: string, 
        userId: string, 
        expiration: number = UPLOAD_INTENT_NORMAL_PIC_EXPIRATION_TIME,
    ): Promise<void> {
        try {
            await this.redisClient.hSetEx(
                objectKey,
                {
                    id: userId,
                    status: "pending",
                },
                {
                    expiration: { 
                        type: 'EX',
                        value: expiration,
                    },
                    mode: 'FNX',
                }
            );
        } catch (err) {
            const redisError = err as Error;
            throw new RedisError(
                'upload_intent_creation',
                redisError.name, 
                redisError.message,
            );
        }
    }
}