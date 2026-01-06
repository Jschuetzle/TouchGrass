import { CloudStorageError } from "./cloud-storage.error";

export class PresignedUrlGenerationError extends CloudStorageError {
    constructor(readonly operation: PresignedUrlOperation, readonly message: string) {
        super(operation, message);
        this.name = "PresignedUrlGenerationError";
    }
}

export type PresignedUrlOperation = "GET" | "PUT";