import NodeCache from 'node-cache';
import chalk from 'chalk';

// Create cache instance with 10 minute default TTL
const cache = new NodeCache({ 
  stdTTL: 600, // 10 minutes
  checkperiod: 120, // Check for expired keys every 2 minutes
  useClones: false // Better performance, but be careful with object mutations
});

// Cache middleware factory
export const cacheMiddleware = (duration = 600) => {
  return (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Create cache key from URL and query parameters
    const key = `${req.originalUrl || req.url}`;
    
    try {
      const cachedResponse = cache.get(key);
      
      if (cachedResponse) {
        console.log(chalk.green(`Cache HIT: ${key}`));
        return res.json(cachedResponse);
      }

      console.log(chalk.yellow(`Cache MISS: ${key}`));
      
      // Store original res.json
      const originalJson = res.json;
      
      // Override res.json to cache the response
      res.json = function(data) {
        // Cache the response data
        cache.set(key, data, duration);
        console.log(chalk.blue(`Cached response for: ${key}`));
        
        // Call original res.json
        return originalJson.call(this, data);
      };
      
      next();
    } catch (error) {
      console.error(chalk.red('Cache middleware error:', error));
      next();
    }
  };
};

// Cache invalidation helpers
export const invalidateCache = (pattern) => {
  try {
    const keys = cache.keys();
    const keysToDelete = keys.filter(key => key.includes(pattern));
    
    keysToDelete.forEach(key => {
      cache.del(key);
      console.log(chalk.red(`Invalidated cache: ${key}`));
    });
    
    return keysToDelete.length;
  } catch (error) {
    console.error(chalk.red('Cache invalidation error:', error));
    return 0;
  }
};

// Clear all cache
export const clearAllCache = () => {
  try {
    cache.flushAll();
    console.log(chalk.red('All cache cleared'));
    return true;
  } catch (error) {
    console.error(chalk.red('Clear cache error:', error));
    return false;
  }
};

// Get cache statistics
export const getCacheStats = () => {
  return {
    keys: cache.keys().length,
    hits: cache.getStats().hits,
    misses: cache.getStats().misses,
    ksize: cache.getStats().ksize,
    vsize: cache.getStats().vsize
  };
};

// Specific cache durations
export const CACHE_DURATIONS = {
  SHORT: 300,    // 5 minutes
  MEDIUM: 600,   // 10 minutes
  LONG: 1800,    // 30 minutes
  VERY_LONG: 3600 // 1 hour
};

export default cache;