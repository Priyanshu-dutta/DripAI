import { IShoppingProvider, SearchOptions } from './IShoppingProvider';
import { ShoppingProduct } from '@/types/stylist';

/**
 * Myntra Retail Marketplace Search Provider
 */
export class MyntraProvider implements IShoppingProvider {
  readonly name = 'myntra';

  /**
   * Search Myntra collections for products matching the styling query.
   * Business logic implementation is deferred to subsequent phases.
   */
  async searchProducts(query: string, options?: SearchOptions): Promise<ShoppingProduct[]> {
    // Phase 1: Shell structure only. No business logic or fake arrays.
    return [];
  }

  /**
   * Retrieve item particulars from Myntra inventory details.
   */
  async getProductDetails(productId: string): Promise<ShoppingProduct | null> {
    return null;
  }
}
