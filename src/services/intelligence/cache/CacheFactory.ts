import { ICache } from './ICache';
import { InMemoryCache } from './InMemoryCache';
import { RedisCache } from './RedisCache';
import { EnvConfig } from '../../../config/env';

/**
 * Factory class resolving cache provider instances dynamically.
 */
export class CacheFactory {
  private static instance: ICache | null = null;

  public static getCache(): ICache {
    if (!this.instance) {
      const active = EnvConfig.getActiveCacheProvider().toLowerCase();
      if (active === 'redis') {
        this.instance = new RedisCache();
      } else {
        this.instance = new InMemoryCache();
      }
    }
    return this.instance;
  }
}
