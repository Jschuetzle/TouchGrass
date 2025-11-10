export class S3ServiceError extends Error {
  public readonly cause?: unknown;
  public readonly statusCode?: number;

  constructor(message: string, cause?: unknown, statusCode?: number) {
    super(message);
    this.name = "S3ServiceError";
    this.cause = cause;
    this.statusCode = statusCode;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}