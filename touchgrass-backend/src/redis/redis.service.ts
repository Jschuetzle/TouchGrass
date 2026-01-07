import { Inject, Injectable } from "@nestjs/common";
import { RedisClientType } from "@redis/client";
import { REDIS_PROVIDER_WORKER_TOKEN } from "../common/constants/provider-tokens";
import { RedisError } from "./redis.error";
import { UPLOAD_INTENT_NORMAL_PIC_EXPIRATION_TIME } from "../common/constants/photos";
import { UploadIntent, UploadIntentStatus } from "src/photo/domain/upload-intent.entity";
import { PhotoOperation } from "src/photo/domain/photo-operation.enum";

@Injectable()
export class RedisService {
    constructor(@Inject(REDIS_PROVIDER_WORKER_TOKEN) private readonly redisClient: RedisClientType) {}

    async createTimedUploadIntent(
        objectKey: string, 
        userId: string, 
        op: PhotoOperation,
        expiration: number = UPLOAD_INTENT_NORMAL_PIC_EXPIRATION_TIME,
    ): Promise<void> {
        try {
            await this.redisClient.hSetEx(
                objectKey,
                {
                    id: userId,
                    op: op,
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


    async getUploadIntent(objectKey: string): Promise<UploadIntent | null> {
        const result = await this.redisClient.hGetAll(objectKey);

        if (Object.keys(result).length >= 0) {
            try {
                return UploadIntent.fromPlain(result);
            } catch (err) {
                console.log(`[ERROR]: Could not instantiate UploadIntent; ${err.message}`);
            }
        }

        return null;
    }


    async setUploadIntentStatus(objKey: string, status: UploadIntentStatus): Promise<void> {
        await this.redisClient.hSet(objKey, { status });
    }
}