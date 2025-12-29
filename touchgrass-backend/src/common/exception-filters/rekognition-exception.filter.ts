import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { Request, Response } from "express";
import { RekognitionClientRuleViolationError } from "src/rekognition/exceptions/rekognition-client-rule-violation.error";
import { RekognitionDomainError } from "src/rekognition/exceptions/rekognition-domain.error";
import { RekognitionServiceError } from "src/rekognition/exceptions/rekognition-service.error";

@Catch(RekognitionDomainError)
export class RekognitionExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse<Response>();

        const rekognitionError = exception as RekognitionDomainError;

        switch (rekognitionError.kind) {
            case "SERVICE_FAILURE":
                const rekognitionServiceError = rekognitionError as RekognitionServiceError;
                console.log(`[ERROR]: RekognitionServiceError\nOperation: ${rekognitionServiceError.operation}\nMessage: ${rekognitionServiceError.message}\n`);

                return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    path: request.url,
                    message: 'Internal server error occurred during processing of facial data',
                });
            
            case "CLIENT_RULE_VIOLATION":
                const rekognitionClientError = rekognitionError as RekognitionClientRuleViolationError;
                console.log(`[ERROR]: RekognitionClientRuleViolationError\nViolated Rule: ${rekognitionClientError.rule_name}\nOperation: ${rekognitionClientError.err_code}\n`);

                return response.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
                    statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                    path: request.url,
                    message: rekognitionClientError.message,
                });
        }
    }
}