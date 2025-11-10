export class RekognitionServiceError extends Error {
  public readonly cause?: unknown;
  public readonly statusCode?: number;

  constructor(message: string, cause?: unknown, statusCode?: number) {
    super(message);
    this.name = "RekognitionServiceError";
    this.cause = cause;
    this.statusCode = statusCode;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
