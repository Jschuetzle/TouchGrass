import { RekognitionServiceException } from "@aws-sdk/client-rekognition";
import { RekognitionDomainError } from "./rekognition-domain.error";

export class RekognitionServiceError extends RekognitionDomainError {
    constructor (
        readonly cause: RekognitionServiceException,
        readonly operation: string,
    ) {
        super(
            `Rekognition service failure during ${operation}`,
            'SERVICE_FAILURE',
        );
        this.name = "RekognitionServiceError";
    }
}