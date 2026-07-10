import { ValidationError } from './errors';

/**
 * Validates and sanitizes the user prompt.
 */
export class PromptSanitizer {
  private static readonly MAX_LENGTH = 1000;
  private static readonly MIN_LENGTH = 3;

  /**
   * Sanitizes the input string and validates its structure.
   * Throws a ValidationError if the input is invalid.
   */
  public static sanitize(prompt: unknown, requestId?: string): string {
    if (typeof prompt !== 'string') {
      throw new ValidationError('The "prompt" field must be a string.', requestId);
    }

    const trimmed = prompt.trim();

    if (trimmed.length < this.MIN_LENGTH) {
      throw new ValidationError(
        `The prompt must be at least ${this.MIN_LENGTH} characters long.`,
        requestId
      );
    }

    if (trimmed.length > this.MAX_LENGTH) {
      throw new ValidationError(
        `The prompt exceeds the maximum allowed length of ${this.MAX_LENGTH} characters.`,
        requestId
      );
    }

    // Basic sanitization: strip HTML tags and potentially dangerous script tags
    let sanitized = trimmed
      .replace(/<[^>]*>/g, '') // Strip basic HTML tags
      .replace(/javascript:/gi, '') // Strip javascript scheme
      .replace(/[\r\n\t]+/g, ' '); // Normalize whitespaces and line endings

    // Guard against simple, obvious jailbreak/injection keywords by neutralizing them slightly
    // but keep it lightweight as Gemini's system instructions will serve as the primary sandbox.
    sanitized = sanitized.replace(/(system prompt|ignore previous instructions|you are now)/gi, '[neutralized]');

    return sanitized;
  }
}
