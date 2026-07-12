/**
 * Contract specifying external search engine requests for Shopping products.
 */
export interface ISearchAdapter {
  readonly name: string;

  /**
   * Performs a search query against a Shopping scraper API and returns raw provider results.
   */
  searchShopping(query: string, page?: number): Promise<any[]>;
}
