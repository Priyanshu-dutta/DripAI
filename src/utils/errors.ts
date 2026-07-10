/**
 * Custom operational error classes for Drip AI Blueprint Service.
 */

export abstract class BaseError extends Error {
  public abstract readonly status: number;
  public readonly requestId?: string;

  constructor(message: string, requestId?: string) {
    super(message);
    this.name = this.constructor.name;
    this.requestId = requestId;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  public toJSON() {
    return {
      error: this.name,
      message: this.message,
      requestId: this.requestId,
      status: this.status,
    };
  }
}

/**
 * Thrown when the user input prompt fails validation or sanitization.
 */
export class ValidationError extends BaseError {
  public readonly status = 400;
}

/**
 * Thrown when there is an issue with Gemini API calls or response structuring.
 */
export class GeminiError extends BaseError {
  public readonly status = 502;
}

/**
 * Thrown when system configurations are invalid (e.g., missing API keys).
 */
export class ConfigurationError extends BaseError {
  public readonly status = 500;
}
