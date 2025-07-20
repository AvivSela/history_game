/**
 * Cache Management System
 * Provides Redis-like in-memory caching for leaderboards and analytics data
 */

const logger = require('./logger');

class Cache {
  constructor() {
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      size: 0
    };
    this.maxSize = 1000; // Maximum number of cache entries
    this.defaultTTL = 300000; // 5 minutes in milliseconds
  }

  /**
   * Set a value in cache with optional TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in milliseconds (default: 5 minutes)
   */
  set(key, value, ttl = this.defaultTTL) {
    try {
      // Check if cache is full and evict if necessary
      if (this.cache.size >= this.maxSize) {
        this.evictOldest();
      }

      const expiry = Date.now() + ttl;
      this.cache.set(key, {
        value,
        expiry,
        created: Date.now(),
        accessed: Date.now()
      });

      this.stats.sets++;
      this.stats.size = this.cache.size;
      
      logger.debug(`Cache SET: ${key} (expires: ${new Date(expiry).toISOString()})`);
    } catch (error) {
      logger.error('Error setting cache value:', error);
    }
  }

  /**
   * Get a value from cache
   * @param {string} key - Cache key
   * @returns {any|null} Cached value or null if not found/expired
   */
  get(key) {
    try {
      const item = this.cache.get(key);
      
      if (!item) {
        this.stats.misses++;
        logger.debug(`Cache MISS: ${key}`);
        return null;
      }

      // Check if item has expired
      if (Date.now() > item.expiry) {
        this.cache.delete(key);
        this.stats.misses++;
        this.stats.size = this.cache.size;
        logger.debug(`Cache EXPIRED: ${key}`);
        return null;
      }

      // Update last accessed time
      item.accessed = Date.now();
      this.cache.set(key, item);
      
      this.stats.hits++;
      logger.debug(`Cache HIT: ${key}`);
      return item.value;
    } catch (error) {
      logger.error('Error getting cache value:', error);
      return null;
    }
  }

  /**
   * Delete a value from cache
   * @param {string} key - Cache key
   * @returns {boolean} True if key was deleted, false if not found
   */
  delete(key) {
    try {
      const deleted = this.cache.delete(key);
      if (deleted) {
        this.stats.deletes++;
        this.stats.size = this.cache.size;
        logger.debug(`Cache DELETE: ${key}`);
      }
      return deleted;
    } catch (error) {
      logger.error('Error deleting cache value:', error);
      return false;
    }
  }

  /**
   * Check if a key exists in cache (and is not expired)
   * @param {string} key - Cache key
   * @returns {boolean} True if key exists and is valid
   */
  has(key) {
    try {
      const item = this.cache.get(key);
      if (!item) return false;
      
      if (Date.now() > item.expiry) {
        this.cache.delete(key);
        this.stats.size = this.cache.size;
        return false;
      }
      
      return true;
    } catch (error) {
      logger.error('Error checking cache key:', error);
      return false;
    }
  }

  /**
   * Clear all cache entries
   */
  clear() {
    try {
      const size = this.cache.size;
      this.cache.clear();
      this.stats.size = 0;
      logger.info(`Cache CLEARED: ${size} entries removed`);
    } catch (error) {
      logger.error('Error clearing cache:', error);
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache performance statistics
   */
  getStats() {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests * 100).toFixed(2) : 0;
    
    return {
      ...this.stats,
      hit_rate: `${hitRate}%`,
      total_requests: totalRequests,
      cache_size: this.cache.size,
      max_size: this.maxSize,
      utilization: `${((this.cache.size / this.maxSize) * 100).toFixed(2)}%`
    };
  }

  /**
   * Evict the oldest cache entry (LRU eviction)
   */
  evictOldest() {
    try {
      let oldestKey = null;
      let oldestTime = Date.now();

      for (const [key, item] of this.cache.entries()) {
        if (item.accessed < oldestTime) {
          oldestTime = item.accessed;
          oldestKey = key;
        }
      }

      if (oldestKey) {
        this.cache.delete(oldestKey);
        logger.debug(`Cache EVICTED (LRU): ${oldestKey}`);
      }
    } catch (error) {
      logger.error('Error evicting oldest cache entry:', error);
    }
  }

  /**
   * Clean up expired entries
   * @returns {number} Number of expired entries removed
   */
  cleanup() {
    try {
      let removed = 0;
      const now = Date.now();

      for (const [key, item] of this.cache.entries()) {
        if (now > item.expiry) {
          this.cache.delete(key);
          removed++;
        }
      }

      this.stats.size = this.cache.size;
      
      if (removed > 0) {
        logger.info(`Cache CLEANUP: ${removed} expired entries removed`);
      }
      
      return removed;
    } catch (error) {
      logger.error('Error cleaning up cache:', error);
      return 0;
    }
  }

  /**
   * Set cache size limit
   * @param {number} maxSize - Maximum number of cache entries
   */
  setMaxSize(maxSize) {
    if (maxSize > 0) {
      this.maxSize = maxSize;
      logger.info(`Cache max size updated: ${maxSize}`);
    }
  }

  /**
   * Set default TTL
   * @param {number} ttl - Default time to live in milliseconds
   */
  setDefaultTTL(ttl) {
    if (ttl > 0) {
      this.defaultTTL = ttl;
      logger.info(`Cache default TTL updated: ${ttl}ms`);
    }
  }
}

// Create singleton cache instance
const cache = new Cache();

// Cleanup expired entries every 5 minutes (only in production)
if (process.env.NODE_ENV === 'production') {
  setInterval(() => {
    cache.cleanup();
  }, 5 * 60 * 1000);
}

/**
 * Cache wrapper for leaderboard functions
 */
class LeaderboardCache {
  constructor() {
    this.cache = cache;
    this.prefixes = {
      global: 'leaderboard:global',
      category: 'leaderboard:category',
      daily: 'leaderboard:daily',
      weekly: 'leaderboard:weekly',
      player: 'leaderboard:player',
      summary: 'leaderboard:summary'
    };
  }

  /**
   * Generate cache key for leaderboard
   * @param {string} type - Leaderboard type
   * @param {Object} params - Parameters for the leaderboard
   * @returns {string} Cache key
   */
  generateKey(type, params = {}) {
    const prefix = this.prefixes[type];
    if (!prefix) {
      throw new Error(`Invalid leaderboard type: ${type}`);
    }

    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join(':');

    return paramString ? `${prefix}:${paramString}` : prefix;
  }

  /**
   * Get cached leaderboard or fetch and cache
   * @param {string} type - Leaderboard type
   * @param {Function} fetchFunction - Function to fetch data if not cached
   * @param {Object} params - Parameters for the leaderboard
   * @param {number} ttl - Cache TTL in milliseconds
   * @returns {Promise<Array>} Leaderboard data
   */
  async getOrFetch(type, fetchFunction, params = {}, ttl = 300000) {
    const key = this.generateKey(type, params);
    
    // Try to get from cache first
    const cached = this.cache.get(key);
    if (cached) {
      logger.debug(`Leaderboard cache HIT: ${key}`);
      return cached;
    }

    // Fetch from database and cache
    logger.debug(`Leaderboard cache MISS: ${key}`);
    const data = await fetchFunction();
    this.cache.set(key, data, ttl);
    
    return data;
  }

  /**
   * Invalidate cache for specific leaderboard type
   * @param {string} type - Leaderboard type
   * @param {Object} params - Parameters to match for invalidation
   */
  invalidate(type, params = {}) {
    const key = this.generateKey(type, params);
    const deleted = this.cache.delete(key);
    
    if (deleted) {
      logger.info(`Leaderboard cache INVALIDATED: ${key}`);
    }
  }

  /**
   * Invalidate all leaderboard caches
   */
  invalidateAll() {
    let invalidated = 0;
    
    for (const [key] of this.cache.cache.entries()) {
      if (key.startsWith('leaderboard:')) {
        this.cache.delete(key);
        invalidated++;
      }
    }
    
    if (invalidated > 0) {
      logger.info(`Leaderboard cache INVALIDATED: ${invalidated} entries`);
    }
  }

  /**
   * Get cache statistics for leaderboards
   * @returns {Object} Cache statistics
   */
  getStats() {
    const stats = this.cache.getStats();
    const leaderboardStats = {
      leaderboard_entries: 0,
      leaderboard_hits: 0,
      leaderboard_misses: 0
    };

    // Count leaderboard-specific entries
    for (const [key, item] of this.cache.cache.entries()) {
      if (key.startsWith('leaderboard:')) {
        leaderboardStats.leaderboard_entries++;
      }
    }

    return {
      ...stats,
      ...leaderboardStats
    };
  }
}

// Create singleton leaderboard cache instance
const leaderboardCache = new LeaderboardCache();

module.exports = {
  cache,
  leaderboardCache,
  Cache,
  LeaderboardCache
}; 