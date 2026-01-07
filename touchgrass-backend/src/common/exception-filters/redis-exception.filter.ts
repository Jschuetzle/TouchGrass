import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { Request, Response } from "express";
import { RedisError } from "src/redis/redis.error";

@Catch(RedisError)
export class RedisExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
            const request = ctx.getRequest<Request>();
            const response = ctx.getResponse<Response>();

            const redisError = exception as RedisError;

            // for now, treat every redis error as an internal server error
            return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                path: request.url,
                message: `Internal server error occurred during ${redisError.operation}`,
            });
    }
}