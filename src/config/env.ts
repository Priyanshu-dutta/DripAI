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

  /**
   * Retrieves the Serper API Key.
   * Returns null if not defined or set to the default placeholder.
   */
  public static getSerperApiKey(): string | null {
    const key = process.env.SERPER_API_KEY;
    if (!key || key === 'your_serper_api_key_here') {
      return null;
    }
    return key;
  }

  /**
   * Retrieves the active product provider identifier.
   * Defaults to 'local'. Options are: 'local' | 'searchapi' | 'affiliate' | 'retail'.
   */
  public static getActiveProductProvider(): string {
    const provider = process.env.ACTIVE_PRODUCT_PROVIDER;
    if (provider) return provider;

    // Auto-detect: Use searchapi if Serper API Key is configured, otherwise fallback to local
    const serperKey = process.env.SERPER_API_KEY;
    if (serperKey && serperKey !== 'your_serper_api_key_here') {
      return 'searchapi';
    }
    return 'local';
  }

  /**
   * Retrieves the active search adapter identifier.
   * Defaults to 'serper'. Options are: 'serper' | 'valueserp' | 'serpapi'.
   */
  public static getActiveSearchAdapter(): string {
    return process.env.ACTIVE_SEARCH_ADAPTER || 'serper';
  }

  /**
   * Retrieves the active cache provider.
   * Defaults to 'memory'. Options are: 'memory' | 'redis'.
   */
  public static getActiveCacheProvider(): string {
    return process.env.ACTIVE_CACHE_PROVIDER || 'memory';
  }
}
