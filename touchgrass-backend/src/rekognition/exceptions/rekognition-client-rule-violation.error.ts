import { RekognitionServiceException } from "@aws-sdk/client-rekognition";
import { RekognitionDomainError } from "./rekognition-domain.error";

export class RekognitionClientRuleViolationError extends RekognitionDomainError {
    constructor (
        readonly rule_name: string,
        readonly err_code: number,
        readonly msg: string,
    ) {
        super(
            msg,
            'CLIENT_RULE_VIOLATION',
        );
        this.name = "RekognitionClientRuleViolationError";
    }
}