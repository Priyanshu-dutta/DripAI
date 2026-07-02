import { ShoppingProduct } from '@/types/stylist';

export interface SearchOptions {
  limit?: number;
  minPrice?: number;
  maxPrice?: number;
  gender?: 'men' | 'women' | 'unisex';
}

/**
 * Interface contract representing an external retail engine or scraper service.
 * All newly integrated merchants must implement these methods.
 */
export interface IShoppingProvider {
  /**
   * The identifier key representing the provider (e.g. 'myntra', 'zara')
   */
  readonly name: string;

  /**
   * Search retail sources for matches using styling prompt terms.
   * Business logic implementation is deferred to subsequent phases.
   */
  searchProducts(query: string, options?: SearchOptions): Promise<ShoppingProduct[]>;

  /**
   * Look up specific detail metrics for a unique SKU or product.
   */
  getProductDetails(productId: string): Promise<ShoppingProduct | null>;
}
