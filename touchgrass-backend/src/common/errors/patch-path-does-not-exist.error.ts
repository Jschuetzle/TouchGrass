import { PatchDomainError } from "./patch-domain.error";

export class PatchPathDoesNotExistError extends PatchDomainError {
    constructor(public readonly invalidPath: string, message?: string) {
        super(message || `Patch path ${invalidPath} does not exist`);
        this.name = "PatchPathDoesNotExistError";
    }
}