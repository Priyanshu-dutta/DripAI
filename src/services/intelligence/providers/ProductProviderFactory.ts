import { IProductRepository } from '../IProductRepository';
import { LocalProductProvider } from './LocalProductProvider';
import { SearchApiProvider } from './SearchApiProvider';
import { AffiliateProvider } from './AffiliateProvider';
import { RetailProvider } from './RetailProvider';
import { EnvConfig } from '../../../config/env';
import { StyleBlueprint } from '../../../types/blueprint';

/**
 * Factory class resolving configuration-based IProductRepository providers dynamically.
 */
export class ProductProviderFactory {
  /**
   * Instantiates the active provider based on environment setup tokens.
   */
  public static getProvider(blueprint?: StyleBlueprint): IProductRepository {
    const active = EnvConfig.getActiveProductProvider().toLowerCase();

    switch (active) {
      case 'searchapi':
        return new SearchApiProvider(blueprint);
      case 'affiliate':
        return new AffiliateProvider();
      case 'retail':
        return new RetailProvider();
      case 'local':
      default:
        return new LocalProductProvider();
    }
  }
}
