import { UserDomainError } from "./user-domain.error";

export class UploadLimitAlreadyReachedError extends UserDomainError {
    constructor(readonly userId: string) {
        super(`Upload attempted by user ${userId}, but limit had already been reached`);
        this.name = "UploadLimitAlreadyReachedError";
    }
}
