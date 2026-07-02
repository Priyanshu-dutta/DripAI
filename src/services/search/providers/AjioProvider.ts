import { IShoppingProvider, SearchOptions } from './IShoppingProvider';
import { ShoppingProduct } from '@/types/stylist';

/**
 * AJIO Retail Marketplace Search Provider
 */
export class AjioProvider implements IShoppingProvider {
  readonly name = 'ajio';

  /**
   * Search AJIO collections for products matching the styling query.
   * Business logic implementation is deferred to subsequent phases.
   */
  async searchProducts(query: string, options?: SearchOptions): Promise<ShoppingProduct[]> {
    return [];
  }

  /**
   * Retrieve item particulars from AJIO inventory details.
   */
  async getProductDetails(productId: string): Promise<ShoppingProduct | null> {
    return null;
  }
}
