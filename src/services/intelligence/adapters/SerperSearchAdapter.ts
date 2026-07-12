import { ISearchAdapter } from './ISearchAdapter';
import { EnvConfig } from '../../../config/env';

/**
 * Serper Google Shopping Search API integration adapter.
 */
export class SerperSearchAdapter implements ISearchAdapter {
  public readonly name = 'SerperSearchAdapter';

  public async searchShopping(query: string, page?: number): Promise<any[]> {
    const apiKey = EnvConfig.getSerperApiKey();
    if (!apiKey) {
      throw new Error('SERPER_API_KEY environment variable is not defined or is set to placeholder.');
    }

    const executeFetch = async (retries = 2, delayMs = 1000): Promise<any[]> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 seconds timeout

      try {
        console.log(`[SerperSearchAdapter] Serper request sent for query: "${query}", page: ${page || 1}`);
        const response = await fetch('https://google.serper.dev/shopping', {
          method: 'POST',
          headers: {
            'X-API-KEY': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: query,
            gl: 'in', // Default to India geo-target matching INR pricing
            hl: 'en',
            ...(page ? { page } : {})
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        console.log(`[SerperSearchAdapter] Response received from Serper Shopping. Status: ${response.status}`);

        // Rate limit (429) fallback retry loop
        if (response.status === 429 && retries > 0) {
          console.warn(`[SerperSearchAdapter] Rate limit (429) hit. Retrying in ${delayMs}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          return executeFetch(retries - 1, delayMs * 2);
        }

        if (!response.ok) {
          throw new Error(`Serper API responded with HTTP status ${response.status}`);
        }

        const data = await response.json();
        return data.shopping || [];

      } catch (err: any) {
        clearTimeout(timeoutId);

        if (retries > 0) {
          console.warn(`[SerperSearchAdapter] Query failed: "${err.message || err}". Retrying in ${delayMs}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          return executeFetch(retries - 1, delayMs * 2);
        }
        throw err;
      }
    };

    return executeFetch();
  }
}
