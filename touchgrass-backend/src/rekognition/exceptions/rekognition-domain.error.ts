import { RekognitionServiceException } from "@aws-sdk/client-rekognition";
import { RekognitionFailureKind } from "./rekognition-failure-kind.type";

export abstract class RekognitionDomainError extends Error {
    protected constructor(
        readonly message: string,
        readonly kind: RekognitionFailureKind,
    ) {
        super(message);
        this.name = "RekognitionDomainError";
    }
}