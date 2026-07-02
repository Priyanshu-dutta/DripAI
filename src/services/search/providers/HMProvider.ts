import { IShoppingProvider, SearchOptions } from './IShoppingProvider';
import { ShoppingProduct } from '@/types/stylist';

/**
 * H&M Retail Fashion Search Provider
 */
export class HMProvider implements IShoppingProvider {
  readonly name = 'hm';

  /**
   * Search H&M collections for products matching the styling query.
   * Business logic implementation is deferred to subsequent phases.
   */
  async searchProducts(query: string, options?: SearchOptions): Promise<ShoppingProduct[]> {
    return [];
  }

  /**
   * Retrieve item particulars from H&M inventory details.
   */
  async getProductDetails(productId: string): Promise<ShoppingProduct | null> {
    return null;
  }
}
