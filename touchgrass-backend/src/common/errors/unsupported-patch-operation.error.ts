import { PatchDomainError } from "./patch-domain.error";

export class UnsupportedPatchOperationError extends PatchDomainError {
    constructor(public readonly op: string) {
        super(`Unsupported patch operation: ${op}`);
        this.name = "UnsupportedPatchOperationError";
    }
}