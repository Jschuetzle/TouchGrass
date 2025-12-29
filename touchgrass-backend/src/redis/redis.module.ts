import { Module } from "@nestjs/common";
import { createClient, RedisClientType } from "@redis/client";
import { REDIS_PROVIDER_LISTENER_TOKEN, REDIS_PROVIDER_WORKER_TOKEN } from "src/common/constants/provider-tokens";
import { RedisService } from "./redis.service";
import { S3Module } from "src/s3/s3.module";
import { S3Service } from "src/s3/s3.service";

@Module({
    imports: [S3Module],
    providers: [
        {
            provide: REDIS_PROVIDER_WORKER_TOKEN,
            useFactory: async (): Promise<RedisClientType> => {
                return await createClient({
                    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
                })
                .on("error", (err) => console.log('\n[ERROR] Redis Worker Error\n', err))
                .connect();
            },
        },
        {
            provide: REDIS_PROVIDER_LISTENER_TOKEN,
            useFactory: async (s3Service: S3Service): Promise<RedisClientType> => {
                const listenerClient = await createClient({
                    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
                })
                .on("error", (err) => console.log('\n[ERROR] Redis Listener Error\n', err))
                .connect();

                await listenerClient.configSet('notify-keyspace-events', 'Ex'); // keyevent notifications not enabled by default
                await listenerClient.subscribe('__keyevent@0__:expired', async (expiredKey) => {
                    await s3Service.deleteObject(expiredKey);
                });

                return listenerClient;
            },
            inject: [S3Service]
        },
        RedisService,
    ],
    exports: [RedisService],
})
export class RedisModule {}