import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { Request, Response } from 'express';
import { UnsupportedPatchOperationError } from "../errors/unsupported-patch-operation.error";
import { PatchDomainError } from "../errors/patch-domain.error";
import { PatchPathDoesNotExistError } from "../errors/patch-path-does-not-exist.error";
import { InvalidPatchValueError } from "../errors/invalid-patch-value.error";

@Catch(PatchDomainError)
export class PatchExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse<Response>();

        const patchException = exception as PatchDomainError;

        if (patchException.name === 'UnsupportedPatchOperationError') {
            const op = (patchException as UnsupportedPatchOperationError).op;

            console.log(`[ERROR] UnsupportedPatchOperationError \nOperation: ${op}${patchException.message ? `\nMessage: ${patchException.message}` : ''}`);

            return response.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
                statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                path: request.url,
                message: `Unsupported patch operation: ${op}`,
            });
        }
        else if (patchException.name === 'PatchPathDoesNotExistError') {
            const path = (patchException as PatchPathDoesNotExistError).invalidPath;

            console.log(`[ERROR] PatchPathDoesNotExistError \nInvalid Path: ${path}${patchException.message ? `\nMessage: ${patchException.message}` : ''}`);

            return response.status(HttpStatus.NOT_FOUND).json({
                statusCode: HttpStatus.NOT_FOUND,
                path: request.url,
                code: "PATCH_PATH_NOT_FOUND",  // included so that different 404 use cases can be separated by client
                message: `PATCH path '${path}' does not correspond with an existing resource`,
            });
        }
        else if (patchException.name === 'InvalidPatchValueError') {
            const errors = (patchException as InvalidPatchValueError).errors;

            console.log(`[ERROR] InvalidPatchValueError\nMessage: ${patchException.message ? `\nMessage: ${patchException.message}` : ''}`);

            return response.status(HttpStatus.BAD_REQUEST).json({
                statusCode: HttpStatus.BAD_REQUEST,
                path: request.url,
                message: 'PATCH values failed validation',
                errors: errors,
            });
        }
        
        // fallback for anything not covered above
        console.log(`[ERROR] PatchDomainError\nMessage: ${patchException.message}`);
        return response.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
            statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
            path: request.url,
        }); 
    }
}