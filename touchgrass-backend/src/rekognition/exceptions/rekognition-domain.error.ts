import { RekognitionErrorCause } from "./rekognition-error-cause.enum";

export abstract class RekognitionDomainError extends Error {
    protected constructor(
        readonly message: string,
        readonly kind: RekognitionErrorCause,
    ) {
        super(message);
        this.name = "RekognitionDomainError";
    }
}