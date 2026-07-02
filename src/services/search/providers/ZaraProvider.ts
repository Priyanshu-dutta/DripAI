import { IShoppingProvider, SearchOptions } from './IShoppingProvider';
import { ShoppingProduct } from '@/types/stylist';

/**
 * Zara Retail Fashion Search Provider
 */
export class ZaraProvider implements IShoppingProvider {
  readonly name = 'zara';

  /**
   * Search Zara collections for products matching the styling query.
   * Business logic implementation is deferred to subsequent phases.
   */
  async searchProducts(query: string, options?: SearchOptions): Promise<ShoppingProduct[]> {
    return [];
  }

  /**
   * Retrieve item particulars from Zara inventory details.
   */
  async getProductDetails(productId: string): Promise<ShoppingProduct | null> {
    return null;
  }
}
