import { RekognitionDomainError } from "./rekognition-domain.error";
import { RekognitionErrorCause } from "./rekognition-error-cause.enum";

export class RekognitionClientRuleViolationError extends RekognitionDomainError {
    constructor (
        readonly rule_name: string,
        readonly err_code: number,
        readonly msg: string,
    ) {
        super(
            msg,
            RekognitionErrorCause.CLIENT_RULE_VIOLATION,
        );
        this.name = "RekognitionClientRuleViolationError";
    }
}