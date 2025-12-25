import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, InternalServerErrorException } from "@nestjs/common";
import { QueryFailedError, TypeORMError as OrmError } from "typeorm";
import { Request, Response } from "express";
import { USER_PK_CONSTRAINT_NAME, USERNAME_CONSTRAINT_NAME } from "../constants/db-constraints";

@Catch(OrmError)
export class OrmExceptionFilter implements ExceptionFilter {
    catch(exception: OrmError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse<Response>();

        if (exception instanceof QueryFailedError) {
            // driver typed as any since `driverError` is of generic type extending Error,
            // which obviously doesn't have the properties utilized below
            const driver: any = (exception as any).driverError || {};
            const code = driver.code || '';
            const constraint = driver.constraint || '';

            // to be used for future logging. All other available fields can be found at
            // https://www.postgresql.org/docs/current/protocol-error-fields.html
            const message = driver.message || '';
            const detail = driver.detail || '';

            console.log(`[ERROR] QueryFailedException \nCode: ${code}\nConstraint: ${constraint}\nMessage: ${message}\nDetail: ${detail}`);

            switch (code) {
                case '23505':  // unique violation
                    switch (constraint) {
                        // user with firebase uid already exists
                        case USER_PK_CONSTRAINT_NAME:
                            return response.status(HttpStatus.BAD_REQUEST).json({
                                statusCode: HttpStatus.BAD_REQUEST,
                                path: request.url,
                                message: "Duplicate resource",
                            });
                        
                        // user with username already exists
                        case USERNAME_CONSTRAINT_NAME:
                            return response.status(HttpStatus.CONFLICT).json({
                                statusCode: HttpStatus.CONFLICT,
                                path: request.url,
                                message: "Username already exists",
                            });
                    }
            }

            // fallback for anything not covered above
            return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                path: request.url,
                message: "Database query failed",
            });
        }

        // Unknown error...let Nest global handler deal with it
        throw new InternalServerErrorException();
    }
}