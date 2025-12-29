import { Inject, Injectable } from "@nestjs/common";
import { RedisClientType } from "@redis/client";
import { REDIS_PROVIDER_WORKER_TOKEN } from "src/common/constants/provider-tokens";
import { RedisError } from "./redis.error";

@Injectable()
export class RedisService {
    constructor(@Inject(REDIS_PROVIDER_WORKER_TOKEN) private readonly redisClient: RedisClientType) {}

    async createTimedUploadIntent(objectKey: string, userId: string, expiration: number = 120): Promise<void> {
        try {
            await this.redisClient.hSet(objectKey, {
                id: userId,
                status: "pending",
            });

            await this.redisClient.expire(objectKey, expiration, "NX");
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