import { ICache } from './ICache';

/**
 * Standard client-side/server runtime memory caching provider.
 */
export class InMemoryCache implements ICache {
  private cache = new Map<string, { value: any; expiry: number }>();

  public async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  public async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttlSeconds * 1000,
    });
  }
}
