import { RawProviderProduct } from '../../types/product';

/**
 * Interface boundary defining the raw data retrieval contracts.
 * Any real provider or database resolver must implement this.
 */
export interface IProductRepository {
  /**
   * Identifies the name of the repository provider (e.g. 'LocalProductProvider', 'MyntraProvider').
   */
  readonly name: string;

  /**
   * Retrieves raw product records from the data source.
   * Can accept filters like category to reduce the size of retrieved objects in subsequent phases.
   */
  fetchRawProducts(filters?: {
    category?: 'top' | 'bottom' | 'shoes' | 'accessories';
    gender?: string;
  }): Promise<RawProviderProduct[]>;
}
