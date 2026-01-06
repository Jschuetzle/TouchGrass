import { UserDomainError } from "./user-domain.error";

export class PhotoUploadLimitExceededError extends UserDomainError {
    constructor(readonly userId: string, readonly exceededBy?: number) {
        super(`Daily upload count for user ${userId} exceeded${exceededBy ? ` by ${exceededBy} uploads}` : ''}`);
        this.name = 'PhotoUploadLimitExceededError';
    }
}