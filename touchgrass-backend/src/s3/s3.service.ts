import { GetObjectCommand, PutObjectCommand, S3Client, S3ServiceException } from '@aws-sdk/client-s3';
import { Inject, Injectable } from '@nestjs/common';
import { S3_PROVIDER_TOKEN } from '../common/constants/provider-tokens';
import { S3ServiceError } from './s3-service.error';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
    constructor(@Inject(S3_PROVIDER_TOKEN) private readonly s3Client: S3Client) {}

    async putObject(photo: Express.Multer.File, path: string): Promise<void> {
        const command = new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Body: photo.buffer,
            Key: path,
        })

        try {
            await this.s3Client.send(command);
        } catch (err) {
            const s3Error = err as S3ServiceException;
            const statusCode = s3Error.$metadata.httpStatusCode;
            
            // in future, could have custom error handling based on the type of exception
            // for now, just throw a general exception
            throw new S3ServiceError(
                `Failed to PutObject in S3 bucket: ${statusCode || ''}`,
                s3Error,
                statusCode
            );
        }
    }


    async getPresignedUrl(path: string): Promise<string> {
        const command = new GetObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: path,
        });

        try {
            return await getSignedUrl(this.s3Client, command)
        } catch (err) {
            console.log('[ERROR]: Failed to generate presigned url for S3 object');
            throw err;
        }
    }
}
