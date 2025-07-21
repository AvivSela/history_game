/**
 * SQL Query Builders
 * @description Handles SQL query construction with proper parameterization and filtering
 */

/**
 * Custom error classes for query builder operations
 */
class QueryBuilderError extends Error {
  constructor(message, query, params, context = {}) {
    super(message);
    this.name = 'QueryBuilderError';
    this.query = query;
    this.params = params;
    this.context = context;
    this.timestamp = new Date().toISOString();
  }
}

class InvalidQueryError extends QueryBuilderError {
  constructor(message, query, params, context = {}) {
    super(message, query, params, context);
    this.name = 'InvalidQueryError';
  }
}

class ValidationError extends QueryBuilderError {
  constructor(message, field, value, context = {}) {
    super(message, null, null, { ...context, field, value });
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
  }
}

/**
 * Input validation utilities
 */
const ValidationUtils = {
  /**
   * Validate that a value is a non-empty string
   * @param {any} value - Value to validate
   * @param {string} fieldName - Name of the field for error messages
   * @returns {string} Validated string
   * @throws {ValidationError} If validation fails
   */
  validateString(value, fieldName) {
    if (typeof value !== 'string') {
      throw new ValidationError(
        `${fieldName} must be a string, got ${typeof value}`,
        fieldName,
        value
      );
    }
    if (!value.trim()) {
      throw new ValidationError(
        `${fieldName} cannot be empty`,
        fieldName,
        value
      );
    }
    return value.trim();
  },

  /**
   * Validate that a value is a number within a range
   * @param {any} value - Value to validate
   * @param {string} fieldName - Name of the field for error messages
   * @param {number} min - Minimum allowed value
   * @param {number} max - Maximum allowed value
   * @returns {number} Validated number
   * @throws {ValidationError} If validation fails
   */
  validateNumber(value, fieldName, min = null, max = null) {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new ValidationError(
        `${fieldName} must be a valid number, got ${typeof value}`,
        fieldName,
        value
      );
    }
    if (min !== null && value < min) {
      throw new ValidationError(
        `${fieldName} must be at least ${min}, got ${value}`,
        fieldName,
        value
      );
    }
    if (max !== null && value > max) {
      throw new ValidationError(
        `${fieldName} must be at most ${max}, got ${value}`,
        fieldName,
        value
      );
    }
    return value;
  },

  /**
   * Validate that a value is a boolean
   * @param {any} value - Value to validate
   * @param {string} fieldName - Name of the field for error messages
   * @returns {boolean} Validated boolean
   * @throws {ValidationError} If validation fails
   */
  validateBoolean(value, fieldName) {
    if (typeof value !== 'boolean') {
      throw new ValidationError(
        `${fieldName} must be a boolean, got ${typeof value}`,
        fieldName,
        value
      );
    }
    return value;
  },

  /**
   * Validate that a value is an array
   * @param {any} value - Value to validate
   * @param {string} fieldName - Name of the field for error messages
   * @returns {Array} Validated array
   * @throws {ValidationError} If validation fails
   */
  validateArray(value, fieldName) {
    if (!Array.isArray(value)) {
      throw new ValidationError(
        `${fieldName} must be an array, got ${typeof value}`,
        fieldName,
        value
      );
    }
    return value;
  }
};

/**
 * Base query builder class for common SQL operations
 */
class QueryBuilder {
  constructor() {
    this.sql = '';
    this.params = [];
    this.conditions = [];
    this.startTime = Date.now();
    this.logger = require('./logger');
  }

  /**
   * Add a WHERE condition with validation
   * @param {string} condition - SQL condition (e.g., 'column = $1')
   * @param {any} value - Parameter value
   * @returns {QueryBuilder} This instance for chaining
   * @throws {ValidationError} If validation fails
   */
  where(condition, value) {
    try {
      // Validate condition parameter
      const validatedCondition = ValidationUtils.validateString(condition, 'condition');
      
      // Check for SQL injection patterns in condition
      if (this.containsSQLInjection(validatedCondition)) {
        throw new ValidationError(
          'Condition contains potentially unsafe SQL patterns',
          'condition',
          validatedCondition
        );
      }

      // Only add condition if value is not null, undefined, or empty string
      if (value !== null && value !== undefined && value !== '') {
        this.conditions.push(validatedCondition);
        this.params.push(value);
        
        this.logger.debug('Added WHERE condition', {
          condition: validatedCondition,
          value: value,
          paramCount: this.params.length
        });
      } else {
        this.logger.debug('Skipped WHERE condition due to falsy value', {
          condition: validatedCondition,
          value: value
        });
      }
      
      return this;
    } catch (error) {
      this.logger.error('Error adding WHERE condition', {
        condition,
        value,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Add multiple WHERE conditions
   * @param {Array} conditions - Array of {condition, value} or {condition, values} objects
   * @returns {QueryBuilder} This instance for chaining
   * @throws {ValidationError} If validation fails
   */
  whereMultiple(conditions) {
    try {
      const validatedConditions = ValidationUtils.validateArray(conditions, 'conditions');
      
      validatedConditions.forEach(({ condition, value, values }, index) => {
        if (typeof condition !== 'string') {
          throw new ValidationError(
            `Invalid condition at index ${index}: must have 'condition' (string) property`,
            `conditions[${index}]`,
            { condition, value, values }
          );
        }
        
        // Handle both single value and array of values
        if (values !== undefined && Array.isArray(values)) {
          // For array of values (like difficulties), add each value to params
          this.conditions.push(condition);
          this.params.push(...values);
        } else if (value !== undefined) {
          // For single value, add directly and fix parameter numbering
          const paramNumber = this.params.length + 1;
          const adjustedCondition = condition.replace(/\$\d+/, `$${paramNumber}`);
          this.conditions.push(adjustedCondition);
          this.params.push(value);
        } else {
          throw new ValidationError(
            `Invalid condition at index ${index}: must have either 'value' or 'values' property`,
            `conditions[${index}]`,
            { condition, value, values }
          );
        }
      });
      
      return this;
    } catch (error) {
      this.logger.error('Error adding multiple WHERE conditions', {
        conditions,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Add multiple WHERE conditions with proper parameter numbering
   * @param {Array} conditions - Array of {condition, value} objects
   * @param {number} startParamIndex - Starting parameter index
   * @returns {QueryBuilder} This instance for chaining
   * @throws {ValidationError} If validation fails
   */
  whereMultipleWithIndex(conditions, startParamIndex = 1) {
    try {
      const validatedConditions = ValidationUtils.validateArray(conditions, 'conditions');
      const validatedStartIndex = ValidationUtils.validateNumber(startParamIndex, 'startParamIndex', 1);
      
      validatedConditions.forEach(({ condition, value }, index) => {
        if (value !== null && value !== undefined && value !== '') {
          // Calculate the correct parameter number
          const paramNumber = validatedStartIndex + index;
          const adjustedCondition = condition.replace(/\$\d+/, `$${paramNumber}`);
          
          this.conditions.push(adjustedCondition);
          this.params.push(value);
          
          this.logger.debug('Added indexed WHERE condition', {
            originalCondition: condition,
            adjustedCondition,
            paramNumber,
            value
          });
        }
      });
      
      return this;
    } catch (error) {
      this.logger.error('Error adding indexed WHERE conditions', {
        conditions,
        startParamIndex,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Build WHERE clause from conditions
   * @returns {string} WHERE clause
   */
  buildWhereClause() {
    if (this.conditions.length === 0) {
      return '';
    }
    
    const whereClause = ' WHERE ' + this.conditions.join(' AND ');
    
    this.logger.debug('Built WHERE clause', {
      conditions: this.conditions,
      whereClause,
      paramCount: this.params.length
    });
    
    return whereClause;
  }

  /**
   * Build complete query
   * @returns {Object} Query object with sql and params
   * @throws {InvalidQueryError} If query construction fails
   */
  build() {
    try {
      const endTime = Date.now();
      const duration = endTime - this.startTime;
      
      const result = {
        sql: this.sql + this.buildWhereClause(),
        params: this.params
      };
      
      // Log query performance
      if (duration > 100) {
        this.logger.warn('Slow query construction detected', {
          duration,
          conditions: this.conditions.length,
          params: this.params.length,
          sql: result.sql
        });
      } else {
        this.logger.debug('Query built successfully', {
          duration,
          conditions: this.conditions.length,
          params: this.params.length,
          sql: result.sql
        });
      }
      
      return result;
    } catch (error) {
      this.logger.error('Error building query', {
        sql: this.sql,
        conditions: this.conditions,
        params: this.params,
        error: error.message
      });
      throw new InvalidQueryError(
        'Failed to build query: ' + error.message,
        this.sql,
        this.params,
        { conditions: this.conditions }
      );
    }
  }

  /**
   * Check for potential SQL injection patterns
   * @param {string} condition - SQL condition to check
   * @returns {boolean} True if potentially unsafe patterns found
   */
  containsSQLInjection(condition) {
    const dangerousPatterns = [
      /;\s*$/i,           // Semicolon at end
      /--\s*$/i,          // SQL comment
      /\/\*.*\*\//i,      // Multi-line comment
      /union\s+select/i,  // UNION SELECT
      /drop\s+table/i,    // DROP TABLE
      /delete\s+from/i,   // DELETE FROM
      /insert\s+into/i,   // INSERT INTO
      /update\s+set/i,    // UPDATE SET
      /create\s+table/i,  // CREATE TABLE
      /alter\s+table/i,   // ALTER TABLE
      /--/i,              // Any SQL comment
      /\/\*/i,            // Any multi-line comment start
      /\*\//i             // Any multi-line comment end
    ];
    
    return dangerousPatterns.some(pattern => pattern.test(condition));
  }
}

/**
 * Card-specific query builder
 */
class CardQueryBuilder extends QueryBuilder {
  constructor() {
    super();
    this.baseTable = 'cards';
  }

  /**
   * Build SELECT query for cards
   * @param {Object} options - Query options
   * @param {string} [options.category] - Filter by category
   * @param {number} [options.difficulty] - Filter by exact difficulty
   * @param {Array<number>} [options.difficulties] - Filter by specific difficulty values (new parameter)
   * @param {number} [options.difficulty_min] - Filter by minimum difficulty (1-5) (legacy)
   * @param {number} [options.difficulty_max] - Filter by maximum difficulty (1-5) (legacy)
   * @param {number} [options.limit] - Limit number of results
   * @param {number} [options.offset] - Offset for pagination
   * @param {boolean} [options.random] - Order results randomly
   * @returns {Object} Query object with sql and params
   * @throws {ValidationError} If validation fails
   */
  select(options = {}) {
    try {
      this.logger.debug('Building card SELECT query', { options });
      
      // Reset query state
      this.sql = `SELECT * FROM ${this.baseTable}`;
      this.params = [];
      this.conditions = [];
      
      // Validate and process options
      if (options.category !== null && options.category !== undefined) {
        options.category = ValidationUtils.validateString(options.category, 'category');
      }
      // Handle categories array (new parameter)
      if (options.categories !== null && options.categories !== undefined) {
        options.categories = ValidationUtils.validateArray(options.categories, 'categories');
        // Validate each category value
        options.categories = options.categories.map(cat => 
          ValidationUtils.validateString(cat, 'category')
        );
      }
      if (options.difficulty !== null && options.difficulty !== undefined) {
        options.difficulty = ValidationUtils.validateNumber(options.difficulty, 'difficulty', 1, 5);
      }
      
      // New difficulties array parameter
      if (options.difficulties !== null && options.difficulties !== undefined) {
        options.difficulties = ValidationUtils.validateArray(options.difficulties, 'difficulties');
        // Validate each difficulty value
        options.difficulties = options.difficulties.map(d => 
          ValidationUtils.validateNumber(d, 'difficulty', 1, 4)
        );
      }
      
      // Legacy difficulty range parameters
      if (options.difficulty_min !== undefined && options.difficulty_min !== null) {
        options.difficulty_min = ValidationUtils.validateNumber(options.difficulty_min, 'difficulty_min', 1, 5);
      }
      if (options.difficulty_max !== undefined && options.difficulty_max !== null) {
        options.difficulty_max = ValidationUtils.validateNumber(options.difficulty_max, 'difficulty_max', 1, 5);
      }
      
      if (options.limit !== null && options.limit !== undefined) {
        options.limit = ValidationUtils.validateNumber(options.limit, 'limit', 1, 1000);
      }
      if (options.offset !== null && options.offset !== undefined) {
        options.offset = ValidationUtils.validateNumber(options.offset, 'offset', 0);
      }
      if (options.random !== null && options.random !== undefined) {
        options.random = ValidationUtils.validateBoolean(options.random, 'random');
      }
      
      // Build WHERE conditions
      const filters = [];
      
      if (options.category !== null && options.category !== undefined) {
        filters.push({ condition: 'category ILIKE $1', value: options.category });
      }
      // Handle categories array (new parameter)
      if (options.categories !== null && options.categories !== undefined && options.categories.length > 0) {
        const placeholders = options.categories.map((_, index) => `$${this.params.length + index + 1}`).join(', ');
        filters.push({ 
          condition: `category ILIKE ANY(ARRAY[${placeholders}])`, 
          values: options.categories 
        });
      }
      if (options.difficulty !== null && options.difficulty !== undefined) {
        filters.push({ condition: 'difficulty = $1', value: options.difficulty });
      }
      
      // New difficulties array filtering
      if (options.difficulties !== null && options.difficulties !== undefined && options.difficulties.length > 0) {
        const placeholders = options.difficulties.map((_, index) => `$${this.params.length + index + 1}`).join(', ');
        filters.push({ 
          condition: `difficulty IN (${placeholders})`, 
          values: options.difficulties 
        });
      }
      
      // Legacy difficulty range filtering (only if difficulties array is not provided)
      if (options.difficulties === null || options.difficulties === undefined || options.difficulties.length === 0) {
        if (options.difficulty_min !== null && options.difficulty_min !== undefined) {
          filters.push({ condition: 'difficulty >= $1', value: options.difficulty_min });
        }
        if (options.difficulty_max !== null && options.difficulty_max !== undefined) {
          filters.push({ condition: 'difficulty <= $1', value: options.difficulty_max });
        }
      }
      
      // Apply filters
      if (filters.length > 0) {
        this.whereMultiple(filters);
      }
      
      const { sql: baseSql, params: baseParams } = this.build();
      this.sql = baseSql;
      this.params = baseParams;
      
      if (options.random) {
        this.sql += ' ORDER BY RANDOM()';
      } else {
        this.sql += ' ORDER BY date_occurred ASC';
      }
      
      if (options.limit !== null && options.limit !== undefined) {
        this.sql += ' LIMIT $' + (this.params.length + 1);
        this.params.push(options.limit);
      }
      
      if (options.offset !== null && options.offset !== undefined) {
        this.sql += ' OFFSET $' + (this.params.length + 1);
        this.params.push(options.offset);
      }
      
      const result = { sql: this.sql, params: this.params };
      
      this.logger.debug('Card SELECT query built successfully', {
        sql: result.sql,
        params: result.params,
        options
      });
      
      return result;
    } catch (error) {
      this.logger.error('Error building card SELECT query', {
        options,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Build SELECT query for specific card ID
   * @param {number} id - Card ID
   * @returns {Object} Query object with sql and params
   * @throws {ValidationError} If validation fails
   */
  selectById(id) {
    try {
      const validatedId = ValidationUtils.validateNumber(id, 'id', 1);
      
      this.sql = `SELECT * FROM ${this.baseTable} WHERE id = $1`;
      this.params = [validatedId];
      
      const result = { sql: this.sql, params: this.params };
      
      this.logger.debug('Card SELECT by ID query built', {
        id: validatedId,
        sql: result.sql
      });
      
      return result;
    } catch (error) {
      this.logger.error('Error building card SELECT by ID query', {
        id,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Build SELECT query for cards by category
   * @param {string} category - Category name
   * @returns {Object} Query object with sql and params
   * @throws {ValidationError} If validation fails
   */
  selectByCategory(category) {
    try {
      const validatedCategory = ValidationUtils.validateString(category, 'category');
      
      this.sql = `SELECT * FROM ${this.baseTable} WHERE category = $1 ORDER BY date_occurred ASC`;
      this.params = [validatedCategory];
      
      const result = { sql: this.sql, params: this.params };
      
      this.logger.debug('Card SELECT by category query built', {
        category: validatedCategory,
        sql: result.sql
      });
      
      return result;
    } catch (error) {
      this.logger.error('Error building card SELECT by category query', {
        category,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Build COUNT query for cards
   * @param {Object} options - Query options
   * @param {string} [options.category] - Filter by category
   * @param {number} [options.difficulty] - Filter by exact difficulty
   * @param {Array<number>} [options.difficulties] - Filter by specific difficulty values (new parameter)
   * @param {number} [options.difficulty_min] - Filter by minimum difficulty (1-5) (legacy)
   * @param {number} [options.difficulty_max] - Filter by maximum difficulty (1-5) (legacy)
   * @returns {Object} Query object with sql and params
   * @throws {ValidationError} If validation fails
   */
  count(options = {}) {
    try {
      this.logger.debug('Building card COUNT query', { options });
      
      // Reset query state
      this.sql = `SELECT COUNT(*) FROM ${this.baseTable}`;
      this.params = [];
      this.conditions = [];
      
      // Build WHERE conditions
      const filters = [];
      
      // Handle both singular 'category' and plural 'categories' for consistency
      const categoryFilter = options.category !== undefined ? options.category : options.categories;
      
      if (categoryFilter) {
        if (Array.isArray(categoryFilter)) {
          // Validate each category in the array
          const validatedCategories = categoryFilter.map(cat => 
            ValidationUtils.validateString(cat, 'category')
          );
          // Handle multiple categories with case-insensitive comparison
          const conditions = validatedCategories.map((_, index) => `category ILIKE $${this.params.length + index + 1}`);
          this.conditions.push(`(${conditions.join(' OR ')})`);
          this.params.push(...validatedCategories);
        } else {
          // Handle single category with case-insensitive comparison
          const validatedCategory = ValidationUtils.validateString(categoryFilter, 'category');
          this.where(`category ILIKE $${this.params.length + 1}`, validatedCategory);
        }
      }
      
      if (options.difficulty !== null && options.difficulty !== undefined) {
        const validatedDifficulty = ValidationUtils.validateNumber(options.difficulty, 'difficulty', 1, 5);
        this.where(`difficulty = $${this.params.length + 1}`, validatedDifficulty);
      }
      
      // New difficulties array parameter
      if (options.difficulties !== null && options.difficulties !== undefined && options.difficulties.length > 0) {
        const validatedDifficulties = ValidationUtils.validateArray(options.difficulties, 'difficulties');
        // Validate each difficulty value
        const difficulties = validatedDifficulties.map(d => 
          ValidationUtils.validateNumber(d, 'difficulty', 1, 4)
        );
        const placeholders = difficulties.map((_, index) => `$${this.params.length + index + 1}`).join(', ');
        filters.push({ 
          condition: `difficulty IN (${placeholders})`, 
          values: difficulties 
        });
      }
      
      // Legacy difficulty range filtering (only if difficulties array is not provided)
      if (options.difficulties === null || options.difficulties === undefined || options.difficulties.length === 0) {
        if (options.difficulty_min !== null && options.difficulty_min !== undefined) {
          const validatedMin = ValidationUtils.validateNumber(options.difficulty_min, 'difficulty_min', 1, 5);
          filters.push({ condition: 'difficulty >= $1', value: validatedMin });
        }
        if (options.difficulty_max !== null && options.difficulty_max !== undefined) {
          const validatedMax = ValidationUtils.validateNumber(options.difficulty_max, 'difficulty_max', 1, 5);
          filters.push({ condition: 'difficulty <= $1', value: validatedMax });
        }
      }
      
      // Apply filters
      if (filters.length > 0) {
        this.whereMultiple(filters);
      }
      
      const { sql: baseSql, params: baseParams } = this.build();
      this.sql = baseSql;
      this.params = baseParams;
      
      const result = { sql: this.sql, params: this.params };
      
      this.logger.debug('Card COUNT query built successfully', {
        sql: result.sql,
        params: result.params,
        options
      });
      
      return result;
    } catch (error) {
      this.logger.error('Error building card COUNT query', {
        options,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Build query to get distinct categories
   * @returns {Object} Query object with sql and params
   */
  selectCategories() {
    this.sql = `SELECT DISTINCT category FROM ${this.baseTable} ORDER BY category ASC`;
    this.params = [];
    
    const result = { sql: this.sql, params: this.params };
    
    this.logger.debug('Card categories query built', {
      sql: result.sql
    });
    
    return result;
  }

  /**
   * Build query to get category statistics
   * @returns {Object} Query object with sql and params
   */
  selectCategoryStats() {
    this.sql = `
      SELECT 
        category,
        COUNT(*) as count,
        AVG(difficulty) as avg_difficulty
      FROM ${this.baseTable}
      GROUP BY category
      ORDER BY count DESC
    `;
    this.params = [];
    
    const result = { sql: this.sql, params: this.params };
    
    this.logger.debug('Card category stats query built', {
      sql: result.sql
    });
    
    return result;
  }

  /**
   * Build query to get difficulty statistics
   * @returns {Object} Query object with sql and params
   */
  selectDifficultyStats() {
    this.sql = `
      SELECT 
        difficulty,
        COUNT(*) as count
      FROM ${this.baseTable}
      GROUP BY difficulty
      ORDER BY difficulty ASC
    `;
    this.params = [];
    
    const result = { sql: this.sql, params: this.params };
    
    this.logger.debug('Card difficulty stats query built', {
      sql: result.sql
    });
    
    return result;
  }
}

/**
 * Statistics-specific query builder
 */
class StatisticsQueryBuilder extends QueryBuilder {
  constructor() {
    super();
    this.baseTable = 'game_sessions';
  }

  /**
   * Build SELECT query for game sessions with validation
   * @param {Object} options - Query options
   * @param {string} [options.playerName] - Filter by player name
   * @param {string} [options.status] - Filter by status
   * @param {string} [options.startDate] - Filter by start date
   * @param {string} [options.endDate] - Filter by end date
   * @param {number} [options.limit] - Limit number of results
   * @param {number} [options.offset] - Offset for pagination
   * @returns {Object} Query object with sql and params
   * @throws {ValidationError} If validation fails
   */
  selectGameSessions(options = {}) {
    try {
      this.logger.debug('Building game sessions SELECT query', { options });
      
      // Validate options
      if (options.playerName !== undefined) {
        options.playerName = ValidationUtils.validateString(options.playerName, 'playerName');
      }
      
      if (options.status !== undefined) {
        options.status = ValidationUtils.validateString(options.status, 'status');
      }
      
      if (options.startDate !== undefined) {
        options.startDate = ValidationUtils.validateString(options.startDate, 'startDate');
      }
      
      if (options.endDate !== undefined) {
        options.endDate = ValidationUtils.validateString(options.endDate, 'endDate');
      }
      
      if (options.limit !== undefined) {
        options.limit = ValidationUtils.validateNumber(options.limit, 'limit', 1, 1000);
      }
      
      if (options.offset !== undefined) {
        options.offset = ValidationUtils.validateNumber(options.offset, 'offset', 0);
      }

      this.sql = 'SELECT * FROM game_sessions';
      
      const filters = [];
      if (options.playerName) {
        filters.push({ condition: 'player_name ILIKE $1', value: `%${options.playerName}%` });
      }
      if (options.status) {
        filters.push({ condition: 'status = $1', value: options.status });
      }
      if (options.startDate) {
        filters.push({ condition: 'start_time >= $1', value: options.startDate });
      }
      if (options.endDate) {
        filters.push({ condition: 'start_time <= $1', value: options.endDate });
      }
      
      this.whereMultipleWithIndex(filters, 1);
      
      const { sql: baseSql, params: baseParams } = this.build();
      this.sql = baseSql;
      this.params = baseParams;
      
      this.sql += ' ORDER BY start_time DESC';
      
      if (options.limit !== null && options.limit !== undefined) {
        this.sql += ' LIMIT $' + (this.params.length + 1);
        this.params.push(options.limit);
      }
      
      if (options.offset !== null && options.offset !== undefined) {
        this.sql += ' OFFSET $' + (this.params.length + 1);
        this.params.push(options.offset);
      }
      
      const result = { sql: this.sql, params: this.params };
      
      this.logger.debug('Game sessions SELECT query built successfully', {
        sql: result.sql,
        params: result.params,
        options
      });
      
      return result;
    } catch (error) {
      this.logger.error('Error building game sessions SELECT query', {
        options,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Build query to get player statistics
   * @param {string} playerName - Player name
   * @returns {Object} Query object with sql and params
   * @throws {ValidationError} If validation fails
   */
  selectPlayerStats(playerName) {
    try {
      const validatedPlayerName = ValidationUtils.validateString(playerName, 'playerName');
      
      this.sql = `
        SELECT 
          player_name,
          COUNT(*) as total_games,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_games,
          AVG(score) as avg_score,
          MAX(score) as best_score,
          MIN(start_time) as first_game,
          MAX(start_time) as last_game
        FROM game_sessions
        WHERE player_name = $1
        GROUP BY player_name
      `;
      this.params = [validatedPlayerName];
      
      const result = { sql: this.sql, params: this.params };
      
      this.logger.debug('Player stats query built', {
        playerName: validatedPlayerName,
        sql: result.sql
      });
      
      return result;
    } catch (error) {
      this.logger.error('Error building player stats query', {
        playerName,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Build query to get leaderboard data
   * @param {Object} options - Query options
   * @param {string} [options.timeframe] - Timeframe filter ('weekly', 'monthly')
   * @param {number} [options.limit] - Limit number of results
   * @returns {Object} Query object with sql and params
   * @throws {ValidationError} If validation fails
   */
  selectLeaderboard(options = {}) {
    try {
      this.logger.debug('Building leaderboard query', { options });
      
      // Validate options
      if (options.timeframe !== undefined) {
        const validTimeframes = ['weekly', 'monthly'];
        if (!validTimeframes.includes(options.timeframe)) {
          throw new ValidationError(
            `timeframe must be one of: ${validTimeframes.join(', ')}`,
            'timeframe',
            options.timeframe
          );
        }
      }
      
      if (options.limit !== undefined) {
        options.limit = ValidationUtils.validateNumber(options.limit, 'limit', 1, 1000);
      }

      this.sql = `
        SELECT 
          player_name,
          COUNT(*) as games_played,
          AVG(score) as avg_score,
          MAX(score) as best_score
        FROM game_sessions
        WHERE status = 'completed'
      `;
      
      if (options.timeframe === 'weekly') {
        this.sql += ' AND start_time >= NOW() - INTERVAL \'7 days\'';
      } else if (options.timeframe === 'monthly') {
        this.sql += ' AND start_time >= NOW() - INTERVAL \'30 days\'';
      }
      
      this.sql += `
        GROUP BY player_name
        HAVING COUNT(*) >= 1
        ORDER BY avg_score DESC, best_score DESC
      `;
      
      if (options.limit) {
        this.sql += ' LIMIT $1';
        this.params = [options.limit];
      }
      
      const result = { sql: this.sql, params: this.params };
      
      this.logger.debug('Leaderboard query built successfully', {
        sql: result.sql,
        params: result.params,
        options
      });
      
      return result;
    } catch (error) {
      this.logger.error('Error building leaderboard query', {
        options,
        error: error.message
      });
      throw error;
    }
  }
}

module.exports = {
  QueryBuilder,
  CardQueryBuilder,
  StatisticsQueryBuilder,
  QueryBuilderError,
  InvalidQueryError,
  ValidationError,
  ValidationUtils
}; 