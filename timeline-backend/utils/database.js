const { query, testConnection } = require('../config/database');
const logger = require('./logger');

/**
 * Database utilities for Timeline Game
 * @description Provides common database operations for cards and game data
 */

/**
 * Get all cards from the database
 * @description Retrieves all cards with optional filtering
 * @param {Object} options - Query options
 * @param {string} options.category - Filter by category
 * @param {number} options.difficulty - Filter by difficulty
 * @param {number} options.limit - Limit number of results
 * @param {number} options.offset - Offset for pagination
 * @returns {Promise<Array>} Array of cards
 */
async function getAllCards(options = {}) {
  try {
    let sql = 'SELECT * FROM cards';
    const params = [];
    const conditions = [];

    // Add category filter
    if (options.category) {
      conditions.push('category = $' + (params.length + 1));
      params.push(options.category);
    }

    // Add difficulty filter
    if (options.difficulty) {
      conditions.push('difficulty = $' + (params.length + 1));
      params.push(options.difficulty);
    }

    // Add WHERE clause if filters exist
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    // Add ordering
    sql += ' ORDER BY date_occurred ASC';

    // Add pagination
    if (options.limit) {
      sql += ' LIMIT $' + (params.length + 1);
      params.push(options.limit);
    }

    if (options.offset) {
      sql += ' OFFSET $' + (params.length + 1);
      params.push(options.offset);
    }

    const result = await query(sql, params);
    return result.rows;
  } catch (error) {
    logger.error('❌ Error getting all cards:', error.message);
    throw error;
  }
}

/**
 * Get random cards for a game
 * @description Retrieves a specified number of random cards
 * @param {number} count - Number of cards to retrieve
 * @param {Object} options - Additional options
 * @param {string} options.category - Filter by category
 * @param {number} options.difficulty - Filter by difficulty
 * @returns {Promise<Array>} Array of random cards
 */
async function getRandomCards(count, options = {}) {
  try {
    let sql = 'SELECT * FROM cards';
    const params = [];
    const conditions = [];

    // Add category filter
    if (options.category) {
      conditions.push('category = $' + (params.length + 1));
      params.push(options.category);
    }

    // Add difficulty filter
    if (options.difficulty) {
      conditions.push('difficulty = $' + (params.length + 1));
      params.push(options.difficulty);
    }

    // Add WHERE clause if filters exist
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    // Add random ordering and limit
    sql += ' ORDER BY RANDOM() LIMIT $' + (params.length + 1);
    params.push(count);

    const result = await query(sql, params);
    return result.rows;
  } catch (error) {
    logger.error('❌ Error getting random cards:', error.message);
    throw error;
  }
}

/**
 * Get card by ID
 * @description Retrieves a specific card by its ID
 * @param {number} id - Card ID
 * @returns {Promise<Object|null>} Card object or null if not found
 */
async function getCardById(id) {
  try {
    const sql = 'SELECT * FROM cards WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0] || null;
  } catch (error) {
    logger.error('❌ Error getting card by ID:', error.message);
    throw error;
  }
}

/**
 * Get all unique categories
 * @description Retrieves all unique categories from the cards table
 * @returns {Promise<Array>} Array of category names
 */
async function getCategories() {
  try {
    const sql = 'SELECT DISTINCT category FROM cards ORDER BY category';
    const result = await query(sql);
    return result.rows.map(row => row.category);
  } catch (error) {
    logger.error('❌ Error getting categories:', error.message);
    throw error;
  }
}

/**
 * Get cards by category
 * @description Retrieves all cards in a specific category
 * @param {string} category - Category name
 * @returns {Promise<Array>} Array of cards in the category
 */
async function getCardsByCategory(category) {
  try {
    const sql = 'SELECT * FROM cards WHERE category = $1 ORDER BY date_occurred ASC';
    const result = await query(sql, [category]);
    return result.rows;
  } catch (error) {
    logger.error('❌ Error getting cards by category:', error.message);
    throw error;
  }
}

/**
 * Get total count of cards
 * @description Returns the total number of cards in the database
 * @param {Object} options - Filter options
 * @returns {Promise<number>} Total count
 */
async function getCardCount(options = {}) {
  try {
    let sql = 'SELECT COUNT(*) FROM cards';
    const params = [];
    const conditions = [];

    // Add category filter
    if (options.category) {
      conditions.push('category = $' + (params.length + 1));
      params.push(options.category);
    }

    // Add difficulty filter
    if (options.difficulty) {
      conditions.push('difficulty = $' + (params.length + 1));
      params.push(options.difficulty);
    }

    // Add WHERE clause if filters exist
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    const result = await query(sql, params);
    return parseInt(result.rows[0].count);
  } catch (error) {
    logger.error('❌ Error getting card count:', error.message);
    throw error;
  }
}

/**
 * Initialize database with sample data
 * @description Runs the initial schema and sample data migrations
 * @returns {Promise<boolean>} True if successful
 */
async function initializeDatabase() {
  try {
    logger.info('🔄 Initializing database...');

    // Test connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Database connection failed');
    }

    // Check if cards table exists and has data
    const count = await getCardCount();
    if (count > 0) {
      logger.info(`✅ Database already initialized with ${count} cards`);
      return true;
    }

    logger.info('📝 Database is empty, initialization complete');
    return true;
  } catch (error) {
    logger.error('❌ Database initialization failed:', error.message);
    throw error;
  }
}

/**
 * Get database statistics
 * @description Returns useful statistics about the database
 * @returns {Promise<Object>} Database statistics
 */
async function getDatabaseStats() {
  try {
    const stats = {
      totalCards: await getCardCount(),
      categories: await getCategories(),
      categoryCounts: {},
      difficultyDistribution: {}
    };

    // Get category counts
    const categoryResult = await query(
      'SELECT category, COUNT(*) as count FROM cards GROUP BY category ORDER BY count DESC'
    );
    categoryResult.rows.forEach(row => {
      stats.categoryCounts[row.category] = parseInt(row.count);
    });

    // Get difficulty distribution
    const difficultyResult = await query(
      'SELECT difficulty, COUNT(*) as count FROM cards GROUP BY difficulty ORDER BY difficulty'
    );
    difficultyResult.rows.forEach(row => {
      stats.difficultyDistribution[row.difficulty] = parseInt(row.count);
    });

    return stats;
  } catch (error) {
    logger.error('❌ Error getting database stats:', error.message);
    throw error;
  }
}

module.exports = {
  getAllCards,
  getRandomCards,
  getCardById,
  getCategories,
  getCardsByCategory,
  getCardCount,
  initializeDatabase,
  getDatabaseStats
}; 