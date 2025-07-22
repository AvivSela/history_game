/**
 * Query Optimization Utilities
 * @description Utilities for optimizing Prisma queries and implementing caching
 * @version 1.0.0
 */

const logger = require('./logger');

/**
 * Query optimization analyzer
 */
class QueryOptimizer {
  /**
   * Analyze query performance and suggest optimizations
   * @param {Object} query - Query object with select/include options
   * @param {number} executionTime - Query execution time in milliseconds
   * @returns {Object} Optimization suggestions
   */
  static analyzeQuery(query, executionTime) {
    const suggestions = [];
    
    // Check for missing select optimization
    if (!query.select && !query.include) {
      suggestions.push({
        type: 'select_optimization',
        priority: 'high',
        description: 'Add select clause to fetch only required fields',
        impact: 'Reduce data transfer by 60-80%'
      });
    }
    
    // Check for unnecessary includes
    if (query.include && Object.keys(query.include).length > 3) {
      suggestions.push({
        type: 'include_optimization',
        priority: 'medium',
        description: 'Consider using select instead of include for better performance',
        impact: 'Reduce query complexity and memory usage'
      });
    }
    
    // Check for missing pagination
    if (!query.take && !query.limit) {
      suggestions.push({
        type: 'pagination_optimization',
        priority: 'medium',
        description: 'Add pagination to limit result set size',
        impact: 'Prevent large result sets and improve response time'
      });
    }
    
    // Check for slow queries
    if (executionTime > 1000) {
      suggestions.push({
        type: 'performance_warning',
        priority: 'high',
        description: `Query took ${executionTime}ms - consider adding indexes or optimizing`,
        impact: 'Significant performance improvement needed'
      });
    }
    
    return {
      executionTime,
      suggestions,
      optimizationScore: this.calculateOptimizationScore(suggestions, executionTime)
    };
  }
  
  /**
   * Calculate optimization score (0-100)
   * @param {Array} suggestions - Optimization suggestions
   * @param {number} executionTime - Query execution time
   * @returns {number} Optimization score
   */
  static calculateOptimizationScore(suggestions, executionTime) {
    let score = 100;
    
    // Deduct points for each suggestion
    suggestions.forEach(suggestion => {
      switch (suggestion.priority) {
        case 'high':
          score -= 25;
          break;
        case 'medium':
          score -= 15;
          break;
        case 'low':
          score -= 5;
          break;
      }
    });
    
    // Deduct points for slow queries
    if (executionTime > 1000) {
      score -= 30;
    } else if (executionTime > 500) {
      score -= 15;
    } else if (executionTime > 100) {
      score -= 5;
    }
    
    return Math.max(0, score);
  }
  
  /**
   * Optimize select clause for better performance
   * @param {Object} query - Original query
   * @param {Array} requiredFields - Array of required field names
   * @returns {Object} Optimized query
   */
  static optimizeSelect(query, requiredFields) {
    const optimizedQuery = { ...query };
    
    // Create select object from required fields
    const select = {};
    requiredFields.forEach(field => {
      select[field] = true;
    });
    
    optimizedQuery.select = select;
    
    // Remove include if select is used
    if (optimizedQuery.include) {
      delete optimizedQuery.include;
    }
    
    return optimizedQuery;
  }
  
  /**
   * Add pagination to query
   * @param {Object} query - Original query
   * @param {number} page - Page number (1-based)
   * @param {number} pageSize - Number of items per page
   * @returns {Object} Query with pagination
   */
  static addPagination(query, page = 1, pageSize = 50) {
    const optimizedQuery = { ...query };
    
    optimizedQuery.skip = (page - 1) * pageSize;
    optimizedQuery.take = pageSize;
    
    return optimizedQuery;
  }
  
  /**
   * Optimize query with common patterns
   * @param {Object} query - Original query
   * @param {Object} options - Optimization options
   * @returns {Object} Optimized query
   */
  static optimizeQuery(query, options = {}) {
    let optimizedQuery = { ...query };
    
    // Add select optimization if required fields provided
    if (options.requiredFields) {
      optimizedQuery = this.optimizeSelect(optimizedQuery, options.requiredFields);
    }
    
    // Add pagination if requested
    if (options.pagination) {
      optimizedQuery = this.addPagination(
        optimizedQuery, 
        options.pagination.page, 
        options.pagination.pageSize
      );
    }
    
    // Add ordering if specified
    if (options.orderBy) {
      optimizedQuery.orderBy = options.orderBy;
    }
    
    return optimizedQuery;
  }
}

/**
 * Query result cache with TTL
 */
class QueryCache {
  constructor(maxSize = 1000, defaultTTL = 300000) { // 5 minutes default
    this.cache = new Map();
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      evictions: 0
    };
  }
  
  /**
   * Generate cache key from query parameters
   * @param {string} operation - Operation name
   * @param {Object} params - Query parameters
   * @returns {string} Cache key
   */
  generateKey(operation, params) {
    const sortedParams = JSON.stringify(params, Object.keys(params).sort());
    return `${operation}:${sortedParams}`;
  }
  
  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {any} Cached value or null
   */
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      this.stats.misses++;
      return null;
    }
    
    // Check if expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }
    
    this.stats.hits++;
    return item.value;
  }
  
  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in milliseconds
   */
  set(key, value, ttl = this.defaultTTL) {
    // Evict if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }
    
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl,
      createdAt: Date.now()
    });
    
    this.stats.sets++;
  }
  
  /**
   * Evict oldest cache entry
   */
  evictOldest() {
    let oldestKey = null;
    let oldestTime = Date.now();
    
    for (const [key, item] of this.cache.entries()) {
      if (item.createdAt < oldestTime) {
        oldestTime = item.createdAt;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.evictions++;
    }
  }
  
  /**
   * Clear all cache entries
   */
  clear() {
    this.cache.clear();
  }
  
  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0 
      ? (this.stats.hits / (this.stats.hits + this.stats.misses)) * 100 
      : 0;
    
    return {
      ...this.stats,
      hitRate: Math.round(hitRate * 100) / 100,
      size: this.cache.size,
      maxSize: this.maxSize,
      utilization: Math.round((this.cache.size / this.maxSize) * 100)
    };
  }
  
  /**
   * Invalidate cache entries by pattern
   * @param {string} pattern - Pattern to match keys
   */
  invalidatePattern(pattern) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * Performance monitoring for queries
 */
class QueryPerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.slowQueryThreshold = 1000; // 1 second
  }
  
  /**
   * Start monitoring a query
   * @param {string} queryName - Name of the query
   * @returns {string} Monitoring ID
   */
  startMonitoring(queryName) {
    const id = `${queryName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.metrics.set(id, {
      queryName,
      startTime: performance.now(),
      status: 'running'
    });
    return id;
  }
  
  /**
   * End monitoring a query
   * @param {string} id - Monitoring ID
   * @param {any} result - Query result
   * @param {Error} error - Error if any
   */
  endMonitoring(id, result = null, error = null) {
    const metric = this.metrics.get(id);
    if (!metric) return;
    
    const endTime = performance.now();
    const duration = endTime - metric.startTime;
    
    metric.endTime = endTime;
    metric.duration = duration;
    metric.status = error ? 'error' : 'completed';
    metric.result = result;
    metric.error = error;
    
    // Log slow queries
    if (duration > this.slowQueryThreshold) {
      logger.warn('Slow query detected', {
        queryName: metric.queryName,
        duration: Math.round(duration),
        threshold: this.slowQueryThreshold
      });
    }
    
    // Log errors
    if (error) {
      logger.error('Query error', {
        queryName: metric.queryName,
        duration: Math.round(duration),
        error: error.message
      });
    }
  }
  
  /**
   * Get performance metrics
   * @returns {Object} Performance metrics
   */
  getMetrics() {
    const completedQueries = Array.from(this.metrics.values())
      .filter(m => m.status === 'completed');
    
    if (completedQueries.length === 0) {
      return {
        totalQueries: 0,
        averageDuration: 0,
        slowQueries: 0,
        errorQueries: 0
      };
    }
    
    const durations = completedQueries.map(m => m.duration);
    const averageDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const slowQueries = completedQueries.filter(m => m.duration > this.slowQueryThreshold).length;
    const errorQueries = Array.from(this.metrics.values()).filter(m => m.status === 'error').length;
    
    return {
      totalQueries: completedQueries.length,
      averageDuration: Math.round(averageDuration),
      slowQueries,
      errorQueries,
      minDuration: Math.round(Math.min(...durations)),
      maxDuration: Math.round(Math.max(...durations))
    };
  }
  
  /**
   * Clear old metrics
   * @param {number} maxAge - Maximum age in milliseconds
   */
  clearOldMetrics(maxAge = 3600000) { // 1 hour default
    const cutoff = Date.now() - maxAge;
    
    for (const [id, metric] of this.metrics.entries()) {
      if (metric.startTime < cutoff) {
        this.metrics.delete(id);
      }
    }
  }
}

// Create global instances
const queryCache = new QueryCache();
const performanceMonitor = new QueryPerformanceMonitor();

module.exports = {
  QueryOptimizer,
  QueryCache,
  QueryPerformanceMonitor,
  queryCache,
  performanceMonitor
}; 