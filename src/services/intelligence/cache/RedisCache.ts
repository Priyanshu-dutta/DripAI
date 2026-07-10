import { ICache } from './ICache';
import { InMemoryCache } from './InMemoryCache';

/**
 * Production-ready Redis Caching adapter wrapper.
 * Acts as an offline fallback mock in local development.
 */
export class RedisCache implements ICache {
  private localFallback = new InMemoryCache();

  public async get<T>(key: string): Promise<T | null> {
    // DEVELOPER WARNING: When ready to connect a real Redis instance,
    // import Redis from 'ioredis' and replace this mock lookup:
    // const client = new Redis(process.env.REDIS_URL);
    // const cached = await client.get(key);
    // return cached ? JSON.parse(cached) : null;
    
    console.log(`[RedisCache] Cache lookup triggered for key: "${key}" (Simulated local redis query)`);
    return this.localFallback.get<T>(key);
  }

  public async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    // DEVELOPER WARNING: Replace this mock saver with your Redis client write:
    // const client = new Redis(process.env.REDIS_URL);
    // await client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    
    console.log(`[RedisCache] Cache set triggered for key: "${key}" (Simulated local redis store for ${ttlSeconds} seconds)`);
    return this.localFallback.set<T>(key, value, ttlSeconds);
  }
}
