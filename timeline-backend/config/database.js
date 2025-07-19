const { Pool } = require('pg');
const logger = require('../utils/logger');

/**
 * Database configuration and connection management
 * @description Handles PostgreSQL connection setup with connection pooling
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
  },
  test: {
    host: process.env.TEST_DB_HOST || 'localhost',
    port: process.env.TEST_DB_PORT || 5433,
    database: process.env.TEST_DB_NAME || 'timeline_game_test',
    user: process.env.TEST_DB_USER || 'postgres',
    password: process.env.TEST_DB_PASSWORD || 'password',
    max: 5,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 2000,
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
  }
};

// Get current environment
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Create connection pool
const pool = new Pool(dbConfig);

/**
 * Test database connection
 * @description Verifies that the database connection is working
 * @returns {Promise<boolean>} True if connection is successful
 */
async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    
    logger.info('✅ Database connection successful');
    logger.info(`📅 Database time: ${result.rows[0].now}`);
    return true;
  } catch (error) {
    logger.error('❌ Database connection failed:', error.message);
    return false;
  }
}

/**
 * Execute a query with error handling
 * @description Executes a database query with proper error handling and logging
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Query result
 */
async function query(text, params = []) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    logger.debug('📊 Executed query', {
      text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      duration: `${duration}ms`,
      rows: result.rowCount
    });
    
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    logger.error('❌ Query error:', {
      text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      duration: `${duration}ms`,
      error: error.message
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
 * Close the database pool
 * @description Gracefully closes all database connections
 */
async function closePool() {
  try {
    // Wait for all queries to complete
    await pool.query('SELECT 1');
    
    // Close the pool
    await pool.end();
    logger.info('🔒 Database pool closed');
  } catch (error) {
    logger.error('❌ Error closing database pool:', error.message);
    // Force close if graceful close fails
    try {
      pool.end();
    } catch (forceError) {
      logger.error('❌ Force close also failed:', forceError.message);
    }
  }
}

// Handle pool events
pool.on('connect', (client) => {
  logger.debug('🔗 New client connected to database');
});

pool.on('error', (err, client) => {
  logger.error('❌ Unexpected error on idle client', err);
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
  testConnection,
  closePool,
  config: dbConfig
}; 