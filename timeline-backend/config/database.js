const { Pool } = require('pg');
const logger = require('../utils/logger');

/**
 * Database configuration and connection management
 * @description Handles PostgreSQL connection setup with connection pooling
 * @version 2.0.0 - Enhanced for CI/CD and production environments
 */

// Environment-based configuration
const config = {
  development: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5433,
    database: process.env.DB_NAME || 'timeline_game',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
    allowExitOnIdle: true, // Allow pool to exit when idle
  },
  test: {
    host: process.env.TEST_DB_HOST || 'localhost',
    port: process.env.TEST_DB_PORT || 5433,
    database: process.env.TEST_DB_NAME || 'timeline_game_test',
    user: process.env.TEST_DB_USER || 'postgres',
    password: process.env.TEST_DB_PASSWORD || 'password',
    max: 5, // Smaller pool for tests
    idleTimeoutMillis: 10000, // Shorter timeout for tests
    connectionTimeoutMillis: 2000,
    allowExitOnIdle: true,
  },
  production: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: {
      rejectUnauthorized: false
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    allowExitOnIdle: false, // Keep connections alive in production
  }
};

// Get current environment
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Log environment and configuration for debugging
logger.info(`🔧 Database Environment: ${env}`);
logger.info(`🔧 Database Config:`, {
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database,
  user: dbConfig.user,
  max: dbConfig.max
});

// Validate required environment variables for production
if (env === 'production') {
  const requiredVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables for production: ${missingVars.join(', ')}`);
  }
}

// Create connection pool
const pool = new Pool(dbConfig);

/**
 * Test database connection with retry logic
 * @description Verifies that the database connection is working with retry mechanism
 * @param {number} maxRetries - Maximum number of retry attempts
 * @param {number} retryDelay - Delay between retries in milliseconds
 * @returns {Promise<boolean>} True if connection is successful
 */
async function testConnection(maxRetries = 3, retryDelay = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT NOW(), version()');
      client.release();
      
      logger.info('✅ Database connection successful');
      logger.info(`📅 Database time: ${result.rows[0].now}`);
      logger.info(`🐘 PostgreSQL version: ${result.rows[0].version.split(' ')[0]}`);
      return true;
    } catch (error) {
      logger.warn(`❌ Database connection attempt ${attempt}/${maxRetries} failed:`, error.message);
      
      if (attempt === maxRetries) {
        logger.error('❌ Database connection failed after all retry attempts');
        return false;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  return false;
}

/**
 * Execute a query with error handling and performance monitoring
 * @description Executes a database query with proper error handling and logging
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Query result
 */
async function query(text, params = []) {
  const start = Date.now();
  const queryId = Math.random().toString(36).substring(7);
  
  try {
    logger.debug(`🔍 Query ${queryId} starting:`, {
      text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      params: params.length > 0 ? params : 'none'
    });
    
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    logger.debug(`✅ Query ${queryId} completed:`, {
      duration: `${duration}ms`,
      rows: result.rowCount
    });
    
    // Log slow queries
    if (duration > 1000) {
      logger.warn(`🐌 Slow query detected (${duration}ms):`, {
        queryId,
        text: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
        rows: result.rowCount
      });
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    logger.error(`❌ Query ${queryId} failed:`, {
      text: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
      duration: `${duration}ms`,
      error: error.message,
      code: error.code
    });
    throw error;
  }
}

/**
 * Get a client from the pool for transactions
 * @description Gets a client for manual transaction management
 * @returns {Promise<Object>} Database client
 */
async function getClient() {
  return await pool.connect();
}

/**
 * Execute a transaction with automatic rollback on error
 * @description Executes multiple queries in a transaction
 * @param {Function} callback - Function that receives the client and executes queries
 * @returns {Promise<any>} Result of the transaction
 */
async function transaction(callback) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Close the database pool gracefully
 * @description Gracefully closes all database connections
 */
async function closePool() {
  try {
    logger.info('🔒 Closing database pool...');
    
    // Wait for all queries to complete
    await pool.query('SELECT 1');
    
    // Close the pool
    await pool.end();
    logger.info('✅ Database pool closed successfully');
  } catch (error) {
    logger.error('❌ Error closing database pool:', error.message);
    // Force close if graceful close fails
    try {
      pool.end();
      logger.info('🔧 Database pool force-closed');
    } catch (forceError) {
      logger.error('❌ Force close also failed:', forceError.message);
    }
  }
}

/**
 * Get pool statistics
 * @description Returns current pool status for monitoring
 * @returns {Object} Pool statistics
 */
function getPoolStats() {
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount
  };
}

// Handle pool events
pool.on('connect', (client) => {
  logger.debug('🔗 New client connected to database');
});

pool.on('error', (err, client) => {
  logger.error('❌ Unexpected error on idle client', err);
});

pool.on('acquire', (client) => {
  logger.debug('📥 Client acquired from pool');
});

pool.on('release', (client) => {
  logger.debug('📤 Client released to pool');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('🛑 Received SIGINT, closing database pool...');
  await closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('🛑 Received SIGTERM, closing database pool...');
  await closePool();
  process.exit(0);
});

module.exports = {
  pool,
  query,
  getClient,
  transaction,
  testConnection,
  closePool,
  getPoolStats,
  config: dbConfig
}; 