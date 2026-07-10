import { ISearchAdapter } from './ISearchAdapter';

/**
 * SerpAPI Google Shopping search provider adapter placeholder.
 */
export class SerpApiSearchAdapter implements ISearchAdapter {
  public readonly name = 'SerpApiSearchAdapter';

  public async searchShopping(query: string): Promise<any[]> {
    // DEVELOPER WARNING: When ready to connect SerpApi:
    // Query: `https://serpapi.com/search?api_key=${apiKey}&engine=google_shopping&q=${encodeURIComponent(query)}`
    // Map response array format to RawProviderProduct objects
    console.log(`[SerpApiSearchAdapter] Search triggered for query: "${query}" (Simulated placeholder run)`);
    return [];
  }
}
