import { isEnumValue } from "src/common/validation/enum";
import { PhotoOperation } from "./photo-operation.enum";

export class UploadIntent {
    constructor(
        public readonly id: string,
        public status: UploadIntentStatus,
        public readonly op: PhotoOperation,
    ) {}

    static fromPlain(obj: unknown): UploadIntent {
        if (!obj || typeof obj !== 'object') {
            throw new InvalidUploadIntentError("Input must be an object");
        } 
        
        const o = obj as Record<string, unknown>;
        
        if (
            typeof o.id !== "string" ||
            !isEnumValue(UploadIntentStatus, o.status) ||
            !isEnumValue(PhotoOperation, o.op)
        ) {
            throw new InvalidUploadIntentError("Invalid shape");
        }

        // ignore any extra properties that exist in the plain object input

        return new UploadIntent(o.id, o.status, o.op);
    }


    setStatus(status: UploadIntentStatus): void {
        this.status = status;
    }

    
    isPending(): boolean {
        return this.status === UploadIntentStatus.PENDING;
    }


    validateId(id: string): boolean {
        return id === this.id;
    }
}

export class InvalidUploadIntentError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidUploadIntentError';
    }
}

export enum UploadIntentStatus {
    PENDING = 'pending',
    INTENT_VALIDATED = 'intent-validated',
    PHOTO_UPLOADED = 'photo-uploaded',
    PHOTO_VALIDATED = 'photo_validated',
    FAILED = 'failed',
}