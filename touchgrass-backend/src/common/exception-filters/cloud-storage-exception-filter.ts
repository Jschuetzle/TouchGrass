import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { Request, Response } from "express";
import { PresignedUrlGenerationError } from "../errors/presigned-url-generation.error";
import { CloudStorageError } from "../errors/cloud-storage.error";

@Catch(CloudStorageError)
export class CloudStorageExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse<Response>();

        const cloudStorageError = exception as CloudStorageError;

        switch (cloudStorageError.name) {
            case "PresignedUrlGenerationError":
                const urlGenError = cloudStorageError as PresignedUrlGenerationError;
                console.log(`[ERROR]: PresignedUrlGenerationError\nOperation: ${urlGenError.operation}\nMessage: ${urlGenError.message}\n`);

            default:
                console.log(`[ERROR]: CloudStorageError\nOperation: ${cloudStorageError.operation}\nMessage: ${cloudStorageError.message}\n`);
        }

        // obviously, this needs to be more comprehensive, which we can do in the future
        // once we determine why exceptions occur during S3/signedURL operations

        return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            path: request.url,
            message: 'Internal server error occured during storage of photos on cloud',
        });
    } 
}