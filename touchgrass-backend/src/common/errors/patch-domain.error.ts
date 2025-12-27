import { DomainError } from "./domain.error";

export class PatchDomainError extends DomainError {
    constructor(message?: string) {
        super(message);
        this.name = "PatchDomainError";
    }
}