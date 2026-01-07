import { CopyObjectCommand, CopyObjectCommandOutput, DeleteObjectCommand, GetObjectCommand, GetObjectCommandOutput, HeadObjectCommand, HeadObjectCommandOutput, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Inject, Injectable } from '@nestjs/common';
import { S3_PROVIDER_TOKEN } from '../common/constants/provider-tokens';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PresignedUrlGenerationError } from '../common/errors/presigned-url-generation.error';
import { CloudStorageError } from '../common/errors/cloud-storage.error';
import { ByteRange } from './types/byte-range.type';

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
            throw new CloudStorageError('PUT', err.message);
        }
    }


    async deleteObject(path: string): Promise<void> {
        const command = new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: path,
        });

        try {
            await this.s3Client.send(command);
        } catch (err) {
            throw new CloudStorageError('DELETE', err.message);
        }
    }

    async getObject(path: string, range?: ByteRange): Promise<GetObjectCommandOutput> {
        const command = new GetObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: path,
            ...(range && {
                Range: `bytes=${range.start}-${range.end ?? ''}`
            }),
        });

        try {
            return await this.s3Client.send(command);
        } catch (err) {
            throw new CloudStorageError('GET', err.message);
        }
    }

    async copyObject(originalObj: string, newObj: string): Promise<CopyObjectCommandOutput> {
        const command = new CopyObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            CopySource: `${process.env.S3_BUCKET_NAME}/${originalObj}`,
            Key: newObj,
        });

        try {
            return await this.s3Client.send(command);
        } catch (err) {
            throw new CloudStorageError('COPY', err.message);
        }
    }

    async headObject(path: string): Promise<HeadObjectCommandOutput | null> {
        const command = new HeadObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: path,
        });

        try {
            return await this.s3Client.send(command);
        } catch (err) {
            if (err.name === 'NotFound') {
                return null;
            }
            else {
                throw new CloudStorageError('HEAD', err.message);
            }
        }
    }




    async generateGetPresignedUrl(path: string): Promise<string> {
        const command = new GetObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: path,
        });

        try {
            return await getSignedUrl(this.s3Client, command)
        } catch (err) {
            throw new PresignedUrlGenerationError("GET", err.message);
        }
    }


    async generatePutPresignedUrl(
        path: string, 
        expiration: number,
        contentType?: string,
        contentLength?: number,
    ): Promise<string> {
        const command = new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: path,
            ...(contentType ? { ContentType: contentType } : {}),
            ...(contentLength ? { ContentLength: contentLength } : {}),
        });

        try {
            return await getSignedUrl(this.s3Client, command, { 
                expiresIn: expiration,
                signableHeaders: new Set(["content-type", "content-length"]),
            });
        } catch (err) {
            throw new PresignedUrlGenerationError("PUT", err.message);
        }
    }
}
