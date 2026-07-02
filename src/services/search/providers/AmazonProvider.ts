import { IShoppingProvider, SearchOptions } from './IShoppingProvider';
import { ShoppingProduct } from '@/types/stylist';

/**
 * Amazon Retail Marketplace Search Provider
 */
export class AmazonProvider implements IShoppingProvider {
  readonly name = 'amazon';

  /**
   * Search Amazon collections for products matching the styling query.
   * Business logic implementation is deferred to subsequent phases.
   */
  async searchProducts(query: string, options?: SearchOptions): Promise<ShoppingProduct[]> {
    return [];
  }

  /**
   * Retrieve item particulars from Amazon inventory details.
   */
  async getProductDetails(productId: string): Promise<ShoppingProduct | null> {
    return null;
  }
}
