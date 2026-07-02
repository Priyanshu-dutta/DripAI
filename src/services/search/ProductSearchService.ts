import { IShoppingProvider, SearchOptions } from './providers/IShoppingProvider';
import { ShoppingProduct } from '@/types/stylist';

/**
 * ProductSearchService coordinates product queries across multiple shopping providers.
 * All queries from the frontend/API pipeline must pass through this service rather
 * than communicating with providers directly.
 */
export class ProductSearchService {
  private providers: IShoppingProvider[];

  /**
   * Initializes the service with a list of active shopping providers.
   */
  constructor(providers: IShoppingProvider[]) {
    this.providers = providers;
  }

  /**
   * Run parallel queries across all registered providers and return aggregated,
   * sorted results.
   */
  async searchAcrossProviders(
    query: string,
    options?: SearchOptions
  ): Promise<ShoppingProduct[]> {
    // Phase 1: Structural wrapper.
    // Concurrently invoke all providers and gather arrays.
    const searchPromises = this.providers.map(provider =>
      provider.searchProducts(query, options).catch(err => {
        // Log error and yield empty list to prevent single-provider failures from failing the entire search pipeline.
        console.error(`Provider [${provider.name}] failed during search:`, err);
        return [] as ShoppingProduct[];
      })
    );

    const providerResults = await Promise.all(searchPromises);
    const aggregatedProducts = providerResults.flat();

    // Sort descending based on match score
    return aggregatedProducts.sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * Fetch specific product detail records directly from the target provider.
   */
  async getProductDetails(
    providerName: string,
    productId: string
  ): Promise<ShoppingProduct | null> {
    const targetProvider = this.providers.find(p => p.name === providerName);
    if (!targetProvider) {
      console.warn(`Attempted lookup for unregistered provider: ${providerName}`);
      return null;
    }
    return targetProvider.getProductDetails(productId);
  }
}
