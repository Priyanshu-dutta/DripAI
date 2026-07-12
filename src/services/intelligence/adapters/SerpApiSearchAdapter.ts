import { ISearchAdapter } from './ISearchAdapter';

/**
 * SerpAPI Google Shopping search provider adapter placeholder.
 */
export class SerpApiSearchAdapter implements ISearchAdapter {
  public readonly name = 'SerpApiSearchAdapter';

  public async searchShopping(query: string, page?: number): Promise<any[]> {
    // DEVELOPER WARNING: When ready to connect SerpApi:
    // Query: `https://serpapi.com/search?api_key=${apiKey}&engine=google_shopping&q=${encodeURIComponent(query)}`
    // Map response array format to RawProviderProduct objects
    console.log(`[SerpApiSearchAdapter] Search triggered for query: "${query}", page: ${page || 1} (Simulated placeholder run)`);
    return [];
  }
}
