import { S3Client } from '@aws-sdk/client-s3';
import { Module } from '@nestjs/common';
import { S3_PROVIDER_TOKEN_NAME } from '../common/constants';
import { S3Service } from './s3.service';

@Module({
    providers: [
        {
            provide: S3_PROVIDER_TOKEN_NAME,
            useFactory: (): S3Client => {
                return new S3Client({
                    region: process.env.S3_BUCKET_REGION
                });
            }
        },
        S3Service,
    ],
    exports: [S3_PROVIDER_TOKEN_NAME, S3Service]
})
export class S3Module {}
