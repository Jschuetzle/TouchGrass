import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { UserDomainError } from "../errors/user-domain.error";
import { Request, Response } from 'express';
import { PhotoUploadLimitExceededError } from "../errors/photo-upload-limit-exceeded.error";
import { UploadLimitAlreadyReachedError } from "../errors/upload-limit-already-reached.error";

@Catch(UserDomainError)
export class UserDomainExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse<Response>();

        const userDomainException = exception as UserDomainError;
        
        switch (userDomainException.name) {
            case "UserProfileNotFoundError":
                console.log(`[ERROR] UserProfileNotFoundError\n${userDomainException.message ? `\nMessage: ${userDomainException.message}` : ''}`);
                return response.status(HttpStatus.NOT_FOUND).json({
                    statusCode: HttpStatus.NOT_FOUND,
                    path: request.url,
                    message: `User in previous request does not correspond to existing user`,
                });
            
            case "PhotoUploadLimitExceededError":
                const limitExceededError = userDomainException as PhotoUploadLimitExceededError;
                console.log(`[ERROR]: PhotoUploadLimitExceededError\nMessage: ${limitExceededError.message}`);

                return response.status(HttpStatus.CONFLICT).json({
                    statusCode: HttpStatus.CONFLICT,
                    path: request.url,
                    message: `Exceeded daily upload limit by ${limitExceededError.exceededBy}. Please try again.`,
                });

            case "UploadLimitAlreadyReachedError":
                const limitAlreadyReachedError = userDomainException as UploadLimitAlreadyReachedError;
                console.log(`[ERROR]: UploadLimitAlreadyReachedError\nMessage: ${limitAlreadyReachedError.message}`);

                // in the future, I should return the amount of time until the daily count resets
                return response.status(HttpStatus.TOO_MANY_REQUESTS).json({
                    statusCode: HttpStatus.TOO_MANY_REQUESTS,
                    path: request.url,
                    message: `Daily upload limit has been reached. Try again tomorrow.`,
                });

            default:
                console.log(`[ERROR]: Unexpected user domain error thrown.\nMessage: ${userDomainException.message}`);
                return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    path: request.url,
                    message: `Unexpected user error`,
                });
        }
    }
}