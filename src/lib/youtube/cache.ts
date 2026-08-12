interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

/**
 * A simple in-memory cache for storing data with expiration.
 */
class PlaylistCache {
  private cache: Map<string, CacheEntry<unknown>>;

  constructor() {
    this.cache = new Map();
  }

  /**
   * Retrieves an item from the cache.
   * @param key The cache key.
   * @returns The cached data if it exists and has not expired, otherwise null.
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Sets an item in the cache.
   * @param key The cache key.
   * @param data The data to cache.
   * @param ttlMs Time-to-live in milliseconds. Defaults to 10 minutes (600,000 ms).
   */
  set<T>(key: string, data: T, ttlMs: number = 600000): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  /**
   * Removes an item from the cache.
   * @param key The cache key to remove.
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clears all items from the cache.
   */
  clear(): void {
    this.cache.clear();
  }
}

export const playlistCache = new PlaylistCache();
