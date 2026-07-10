/**
 * Caching provider interface mapping generic caching methods.
 * Any caching layer (e.g. Memory, Redis) must implement this contract.
 */
export interface ICache {
  /**
   * Retrieves a cached value. Returns null if key does not exist or is expired.
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Saves a value into the cache registry with a time-to-live threshold.
   */
  set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
}
