import { RekognitionServiceException } from "@aws-sdk/client-rekognition";
import { RekognitionDomainError } from "./rekognition-domain.error";
import { RekognitionErrorCause } from "./rekognition-error-cause.enum";

export class RekognitionServiceError extends RekognitionDomainError {
    constructor (
        readonly cause: RekognitionServiceException,
        readonly operation: string,
    ) {
        super(
            `Rekognition service failure during ${operation}`,
            RekognitionErrorCause.SERVICE_FAILURE,
        );
        this.name = "RekognitionServiceError";
    }
}