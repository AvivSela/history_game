/**
 * Cache Tests
 * @description Tests for cache management system
 */

const { Cache, LeaderboardCache } = require('../utils/cache');

describe('Cache System', () => {
  let cache;

  beforeEach(() => {
    cache = require('../utils/cache').cache; // Use the singleton cache
    cache.clear(); // Clear any existing data
    // Reset stats
    cache.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      size: 0
    };
  });

  describe('Basic Cache Operations', () => {
    it('should set and get values', () => {
      cache.set('test-key', 'test-value');
      expect(cache.get('test-key')).toBe('test-value');
    });

    it('should return null for non-existent keys', () => {
      expect(cache.get('non-existent')).toBeNull();
    });

    it('should delete values', () => {
      cache.set('test-key', 'test-value');
      expect(cache.delete('test-key')).toBe(true);
      expect(cache.get('test-key')).toBeNull();
    });

    it('should return false when deleting non-existent key', () => {
      expect(cache.delete('non-existent')).toBe(false);
    });

    it('should check if key exists', () => {
      cache.set('test-key', 'test-value');
      expect(cache.has('test-key')).toBe(true);
      expect(cache.has('non-existent')).toBe(false);
    });

    it('should clear all entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.clear();
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
    });
  });

  describe('TTL and Expiration', () => {
    it('should respect TTL', () => {
      cache.set('test-key', 'test-value', 100); // 100ms TTL
      
      // Should be available immediately
      expect(cache.get('test-key')).toBe('test-value');
      
      // Should expire after TTL
      return new Promise(resolve => {
        setTimeout(() => {
          expect(cache.get('test-key')).toBeNull();
          resolve();
        }, 150);
      });
    });

    it('should handle expired entries in has()', () => {
      cache.set('test-key', 'test-value', 100);
      
      // Should be available immediately
      expect(cache.has('test-key')).toBe(true);
      
      // Should expire after TTL
      return new Promise(resolve => {
        setTimeout(() => {
          expect(cache.has('test-key')).toBe(false);
          resolve();
        }, 150);
      });
    });
  });

  describe('Cache Statistics', () => {
    it('should track cache statistics', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      
      // Hit
      cache.get('key1');
      
      // Miss
      cache.get('non-existent');
      
      // Delete
      cache.delete('key2');
      
      const stats = cache.getStats();
      
      expect(stats.sets).toBe(2);
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
      expect(stats.deletes).toBe(1);
      expect(stats.size).toBe(1);
      expect(stats.total_requests).toBe(2);
      expect(stats.hit_rate).toBe('50.00%');
    });

    it('should calculate utilization correctly', () => {
      const stats = cache.getStats();
      expect(stats.utilization).toBe('0.00%');
      expect(stats.max_size).toBe(1000);
    });
  });

  describe('Cache Eviction', () => {
    it.skip('should evict entries when cache is full', () => {
      // Set max size to 2
      cache.setMaxSize(2);
      
      // Add 3 items
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      
      // Check that cache size is respected
      const stats = cache.getStats();
      expect(stats.cache_size).toBeLessThanOrEqual(2);
    });

    it.skip('should update access time on get', () => {
      cache.setMaxSize(2);
      
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      
      // Access key1 to update its access time
      cache.get('key1');
      
      // Add new item - should evict one of the existing items
      cache.set('key3', 'value3');
      
      // Check that cache size is respected
      const stats = cache.getStats();
      expect(stats.cache_size).toBeLessThanOrEqual(2);
    });
  });

  describe('Cache Cleanup', () => {
    it('should remove expired entries during cleanup', () => {
      cache.set('key1', 'value1', 100);
      cache.set('key2', 'value2', 200);
      
      // Wait for first item to expire
      return new Promise(resolve => {
        setTimeout(() => {
          const removed = cache.cleanup();
          expect(removed).toBe(1);
          expect(cache.get('key1')).toBeNull();
          expect(cache.get('key2')).toBe('value2');
          resolve();
        }, 150);
      });
    });
  });

  describe('Configuration', () => {
    it('should allow setting max size', () => {
      cache.setMaxSize(5);
      expect(cache.maxSize).toBe(5);
    });

    it('should allow setting default TTL', () => {
      cache.setDefaultTTL(60000);
      expect(cache.defaultTTL).toBe(60000);
    });
  });
});

describe('LeaderboardCache', () => {
  let leaderboardCache;

  beforeEach(() => {
    leaderboardCache = new LeaderboardCache();
    // Clear the cache before each test
    leaderboardCache.cache.clear();
  });

  describe('Key Generation', () => {
    it('should generate consistent keys', () => {
      const key1 = leaderboardCache.generateKey('global', { sort: 'score' });
      const key2 = leaderboardCache.generateKey('global', { sort: 'score' });
      expect(key1).toBe(key2);
    });

    it('should generate different keys for different parameters', () => {
      const key1 = leaderboardCache.generateKey('global', { sort: 'score' });
      const key2 = leaderboardCache.generateKey('global', { sort: 'accuracy' });
      expect(key1).not.toBe(key2);
    });
  });

  describe('Get or Fetch', () => {
    it('should return cached data if available', async () => {
      const mockFetch = jest.fn().mockResolvedValue(['player1', 'player2']);
      
      // First call should fetch
      const result1 = await leaderboardCache.getOrFetch('global', mockFetch);
      expect(result1).toEqual(['player1', 'player2']);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      
      // Second call should use cache
      const result2 = await leaderboardCache.getOrFetch('global', mockFetch);
      expect(result2).toEqual(['player1', 'player2']);
      expect(mockFetch).toHaveBeenCalledTimes(1); // Still 1, not 2
    });

    it('should handle fetch errors gracefully', async () => {
      const mockFetch = jest.fn().mockRejectedValue(new Error('Fetch failed'));
      
      try {
        await leaderboardCache.getOrFetch('global', mockFetch);
        expect(true).toBe(false); // This should not be reached
      } catch (error) {
        expect(error.message).toBe('Fetch failed');
      }
    });
  });

  describe('Cache Invalidation', () => {
    it('should invalidate specific cache entries', async () => {
      const mockFetch = jest.fn().mockResolvedValue(['player1']);
      
      await leaderboardCache.getOrFetch('global', mockFetch);
      leaderboardCache.invalidate('global');
      
      // Should fetch again after invalidation
      await leaderboardCache.getOrFetch('global', mockFetch);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should invalidate all cache entries', async () => {
      const mockFetch = jest.fn().mockResolvedValue(['player1']);
      
      await leaderboardCache.getOrFetch('global', mockFetch);
      await leaderboardCache.getOrFetch('category', mockFetch);
      
      leaderboardCache.invalidateAll();
      
      // Should fetch again after invalidation
      await leaderboardCache.getOrFetch('global', mockFetch);
      await leaderboardCache.getOrFetch('category', mockFetch);
      expect(mockFetch).toHaveBeenCalledTimes(4);
    });
  });
}); 