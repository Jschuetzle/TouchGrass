import { UserDomainError } from "./user-domain.error";

export class UserProfileNotFoundError extends UserDomainError {
    constructor(userId: string) {
        super(`User profile does not exist${userId ? ` for id ${userId}` : ''}`);
        this.name = 'UserProfileNotFoundError';
    }
}