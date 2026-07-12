import { ISearchAdapter } from './ISearchAdapter';

/**
 * ValueSerp API integration adapter placeholder.
 */
export class ValueSerpSearchAdapter implements ISearchAdapter {
  public readonly name = 'ValueSerpSearchAdapter';

  public async searchShopping(query: string, page?: number): Promise<any[]> {
    // DEVELOPER WARNING: When ready to connect ValueSerp:
    // Query: `https://api.valueserp.com/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&search_type=shopping`
    // Map response array format to RawProviderProduct objects
    console.log(`[ValueSerpSearchAdapter] Search triggered for query: "${query}", page: ${page || 1} (Simulated placeholder run)`);
    return [];
  }
}
