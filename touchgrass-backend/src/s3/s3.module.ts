import { S3Client } from '@aws-sdk/client-s3';
import { Module } from '@nestjs/common';
import { S3_PROVIDER_TOKEN } from '../common/constants/provider-tokens';
import { S3Service } from './s3.service';

@Module({
    providers: [
        {
            provide: S3_PROVIDER_TOKEN,
            useFactory: (): S3Client => {
                return new S3Client({
                    region: process.env.S3_BUCKET_REGION
                });
            }
        },
        S3Service,
    ],
    exports: [S3Service]
})
export class S3Module {}
