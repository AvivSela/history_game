const { query, testConnection } = require('../config/database');
const logger = require('./logger');
const { transformCardData } = require('./dataTransform');
const { 
  CardQueryBuilder, 
  StatisticsQueryBuilder,
  QueryBuilderError,
  InvalidQueryError,
  ValidationError
} = require('./queryBuilders');

/**
 * Database utilities for Timeline Game
 * @description Provides common database operations for cards and game data
 * @version 2.0.0 - Refactored with query builders for better separation of concerns
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
    logger.debug('Getting all cards with options', { options });
    
    const queryBuilder = new CardQueryBuilder();
    const { sql, params } = queryBuilder.select(options);
    
    const result = await query(sql, params);
    const transformedData = transformCardData(result.rows);
    
    logger.debug('Successfully retrieved all cards', {
      count: transformedData.length,
      options
    });
    
    return transformedData;
  } catch (error) {
    // Enhanced error logging with context
    if (error instanceof ValidationError) {
      logger.error('❌ Validation error getting all cards:', {
        field: error.field,
        value: error.value,
        message: error.message,
        options
      });
    } else if (error instanceof QueryBuilderError) {
      logger.error('❌ Query builder error getting all cards:', {
        message: error.message,
        query: error.query,
        params: error.params,
        context: error.context,
        options
      });
    } else {
      logger.error('❌ Database error getting all cards:', {
        message: error.message,
        options,
        stack: error.stack
      });
    }
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
    logger.debug('Getting random cards', { count, options });
    
    let sql, params;
    
    if (options.categories && options.categories.length > 0) {
      // Handle category filtering directly with case-insensitive comparison
      const placeholders = options.categories.map((_, index) => `$${index + 1}`).join(', ');
      sql = `SELECT * FROM cards WHERE LOWER(category) IN (${placeholders}) ORDER BY RANDOM() LIMIT $${options.categories.length + 1}`;
      params = [...options.categories.map(cat => cat.toLowerCase()), count];
    } else {
      // No category filtering
      sql = 'SELECT * FROM cards ORDER BY RANDOM() LIMIT $1';
      params = [count];
    }
    
    const result = await query(sql, params);
    const transformedData = transformCardData(result.rows);
    
    logger.debug('Successfully retrieved random cards', {
      requested: count,
      actual: transformedData.length,
      options
    });
    
    return transformedData;
  } catch (error) {
    // Enhanced error logging with context
    if (error instanceof ValidationError) {
      logger.error('❌ Validation error getting random cards:', {
        field: error.field,
        value: error.value,
        message: error.message,
        count,
        options
      });
    } else if (error instanceof QueryBuilderError) {
      logger.error('❌ Query builder error getting random cards:', {
        message: error.message,
        query: error.query,
        params: error.params,
        context: error.context,
        count,
        options
      });
    } else {
      logger.error('❌ Database error getting random cards:', {
        message: error.message,
        count,
        options,
        stack: error.stack
      });
    }
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
    const queryBuilder = new CardQueryBuilder();
    const { sql, params } = queryBuilder.selectById(id);
    
    const result = await query(sql, params);
    return result.rows[0] ? transformCardData(result.rows[0]) : null;
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
    const queryBuilder = new CardQueryBuilder();
    const { sql, params } = queryBuilder.selectCategories();
    
    const result = await query(sql, params);
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
    const queryBuilder = new CardQueryBuilder();
    const { sql, params } = queryBuilder.selectByCategory(category);
    
    const result = await query(sql, params);
    return transformCardData(result.rows);
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
    const queryBuilder = new CardQueryBuilder();
    const { sql, params } = queryBuilder.count(options);
    
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
    const queryBuilder = new CardQueryBuilder();
    const { sql: categorySql, params: categoryParams } = queryBuilder.selectCategoryStats();
    const categoryResult = await query(categorySql, categoryParams);
    categoryResult.rows.forEach(row => {
      stats.categoryCounts[row.category] = parseInt(row.count);
    });

    // Get difficulty distribution
    const { sql: difficultySql, params: difficultyParams } = queryBuilder.selectDifficultyStats();
    const difficultyResult = await query(difficultySql, difficultyParams);
    difficultyResult.rows.forEach(row => {
      stats.difficultyDistribution[row.difficulty] = parseInt(row.count);
    });

    return stats;
  } catch (error) {
    logger.error('❌ Error getting database stats:', error.message);
    throw error;
  }
}

/**
 * Get game sessions with filtering
 * @description Retrieves game sessions with optional filtering
 * @param {Object} options - Query options
 * @param {string} options.playerName - Filter by player name
 * @param {string} options.status - Filter by game status
 * @param {Date} options.startDate - Filter by start date
 * @param {Date} options.endDate - Filter by end date
 * @param {number} options.limit - Limit number of results
 * @param {number} options.offset - Offset for pagination
 * @returns {Promise<Array>} Array of game sessions
 */
async function getGameSessions(options = {}) {
  try {
    const queryBuilder = new StatisticsQueryBuilder();
    const { sql, params } = queryBuilder.selectGameSessions(options);
    
    const result = await query(sql, params);
    return result.rows;
  } catch (error) {
    logger.error('❌ Error getting game sessions:', error.message);
    throw error;
  }
}

/**
 * Get player statistics
 * @description Retrieves statistics for a specific player
 * @param {string} playerName - Player name
 * @returns {Promise<Object|null>} Player statistics or null if not found
 */
async function getPlayerStats(playerName) {
  try {
    const queryBuilder = new StatisticsQueryBuilder();
    const { sql, params } = queryBuilder.selectPlayerStats(playerName);
    
    const result = await query(sql, params);
    return result.rows[0] || null;
  } catch (error) {
    logger.error('❌ Error getting player stats:', error.message);
    throw error;
  }
}

/**
 * Get leaderboard
 * @description Retrieves player leaderboard
 * @param {Object} options - Query options
 * @param {number} options.limit - Number of players to return
 * @param {string} options.timeframe - Timeframe filter (all, week, month)
 * @returns {Promise<Array>} Array of leaderboard entries
 */
async function getLeaderboard(options = {}) {
  try {
    const queryBuilder = new StatisticsQueryBuilder();
    const { sql, params } = queryBuilder.selectLeaderboard(options);
    
    const result = await query(sql, params);
    return result.rows;
  } catch (error) {
    logger.error('❌ Error getting leaderboard:', error.message);
    throw error;
  }
}

module.exports = {
  query,
  getAllCards,
  getRandomCards,
  getCardById,
  getCategories,
  getCardsByCategory,
  getCardCount,
  initializeDatabase,
  getDatabaseStats,
  getGameSessions,
  getPlayerStats,
  getLeaderboard
}; 