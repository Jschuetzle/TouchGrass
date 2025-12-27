import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { UserDomainError } from "../errors/user-domain.error";
import { Request, Response } from 'express';

@Catch(UserDomainError)
export class UserDomainExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse<Response>();

        const userDomainException = exception as UserDomainError;

        if (userDomainException.name === 'UserProfileNotFoundError') {
            console.log(`[ERROR] UserProfileNotFoundError\n${userDomainException.message ? `\nMessage: ${userDomainException.message}` : ''}`);

            return response.status(HttpStatus.NOT_FOUND).json({
                statusCode: HttpStatus.NOT_FOUND,
                path: request.url,
                message: `User in previous request does not correspond to existing user`,
            });
        }

        // fallback on cases not covered above
        return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            path: request.url,
            message: `Unexpected user error`,
        });
    }
}