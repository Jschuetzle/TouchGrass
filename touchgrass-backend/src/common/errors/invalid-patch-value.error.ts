import { ValidationErrorMetadata } from "../types";
import { PatchDomainError } from "./patch-domain.error";

export class InvalidPatchValueError extends PatchDomainError {
    constructor(public readonly errors: ValidationErrorMetadata[]) {
        super(`Unsupported patch values: ${JSON.stringify(errors)}`);
        this.name = "InvalidPatchValueError";
    }
}