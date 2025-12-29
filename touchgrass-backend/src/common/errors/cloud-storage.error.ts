export class CloudStorageError extends Error {
    constructor (readonly operation: string, readonly message: string) {
        super(message);
        this.name = "CloudStorageError";
    }
}