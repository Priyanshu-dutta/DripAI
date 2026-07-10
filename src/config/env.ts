import { ConfigurationError } from '../utils/errors';

/**
 * Handles environment variable loading and validation.
 */
export class EnvConfig {
  /**
   * Retrieves the Gemini API Key.
   * Throws a ConfigurationError if not defined.
   */
  public static getGeminiApiKey(requestId?: string): string {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === 'your_gemini_api_key_here') {
      throw new ConfigurationError(
        'GEMINI_API_KEY environment variable is not defined or is set to the default placeholder.',
        requestId
      );
    }
    return key;
  }

  /**
   * Retrieves the Gemini Model name, defaulting to 'gemini-1.5-flash'.
   */
  public static getGeminiModel(): string {
    return process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  }
}
