export class RedisError extends Error {
    constructor(
        readonly operation: string,
        readonly cause: string, 
        readonly msg: string
    ) {
        super(msg);
        this.name = "RedisError";
    }
}