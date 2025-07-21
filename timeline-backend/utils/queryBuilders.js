/**
 * SQL Query Builders
 * @description Handles SQL query construction with proper parameterization and filtering
 */

/**
 * Base query builder class for common SQL operations
 */
class QueryBuilder {
  constructor() {
    this.sql = '';
    this.params = [];
    this.conditions = [];
  }

  /**
   * Add a WHERE condition
   * @param {string} condition - SQL condition (e.g., 'column = $1')
   * @param {any} value - Parameter value
   * @returns {QueryBuilder} This instance for chaining
   */
  where(condition, value) {
    if (value !== null && value !== undefined && value !== '') {
      this.conditions.push(condition);
      this.params.push(value);
    }
    return this;
  }

  /**
   * Add multiple WHERE conditions
   * @param {Array} conditions - Array of {condition, value} objects
   * @returns {QueryBuilder} This instance for chaining
   */
  whereMultiple(conditions) {
    conditions.forEach(({ condition, value }) => {
      this.where(condition, value);
    });
    return this;
  }

  /**
   * Add multiple WHERE conditions with proper parameter numbering
   * @param {Array} conditions - Array of {condition, value} objects
   * @param {number} startParamIndex - Starting parameter index
   * @returns {QueryBuilder} This instance for chaining
   */
  whereMultipleWithIndex(conditions, startParamIndex = 1) {
    conditions.forEach(({ condition, value }, index) => {
      if (value !== null && value !== undefined && value !== '') {
        // Replace the parameter placeholder with the correct index
        const paramIndex = startParamIndex + index;
        const updatedCondition = condition.replace(/\$\d+/, `$${paramIndex}`);
        this.conditions.push(updatedCondition);
        this.params.push(value);
      }
    });
    return this;
  }

  /**
   * Build the WHERE clause
   * @returns {string} SQL WHERE clause
   */
  buildWhereClause() {
    return this.conditions.length > 0 ? ` WHERE ${this.conditions.join(' AND ')}` : '';
  }

  /**
   * Get the final SQL and parameters
   * @returns {Object} {sql, params}
   */
  build() {
    return {
      sql: this.sql + this.buildWhereClause(),
      params: this.params
    };
  }
}

/**
 * Card query builder for card-related operations
 */
class CardQueryBuilder extends QueryBuilder {
  constructor() {
    super();
    this.baseTable = 'cards';
  }

  /**
   * Build SELECT query for cards
   * @param {Object} options - Query options
   * @param {string} options.category - Filter by category
   * @param {number} options.difficulty - Filter by difficulty
   * @param {number} options.limit - Limit number of results
   * @param {number} options.offset - Offset for pagination
   * @param {boolean} options.random - Whether to order randomly
   * @returns {Object} {sql, params}
   */
  select(options = {}) {
    this.sql = `SELECT * FROM ${this.baseTable}`;
    
    // Add filters with proper parameter indexing
    const filters = [];
    if (options.category) filters.push({ condition: 'category = $1', value: options.category });
    if (options.difficulty !== null && options.difficulty !== undefined) filters.push({ condition: 'difficulty = $2', value: options.difficulty });
    
    this.whereMultipleWithIndex(filters, 1);

    // Build the complete SQL with WHERE clause first
    const { sql: baseSql, params: baseParams } = this.build();
    this.sql = baseSql;
    this.params = baseParams;

    // Add ordering
    if (options.random) {
      this.sql += ' ORDER BY RANDOM()';
    } else {
      this.sql += ' ORDER BY date_occurred ASC';
    }

    // Add pagination
    if (options.limit !== null && options.limit !== undefined) {
      this.sql += ' LIMIT $' + (this.params.length + 1);
      this.params.push(options.limit);
    }

    if (options.offset !== null && options.offset !== undefined) {
      this.sql += ' OFFSET $' + (this.params.length + 1);
      this.params.push(options.offset);
    }

    return { sql: this.sql, params: this.params };
  }

  /**
   * Build SELECT query for card by ID
   * @param {number} id - Card ID
   * @returns {Object} {sql, params}
   */
  selectById(id) {
    this.sql = `SELECT * FROM ${this.baseTable} WHERE id = $1`;
    this.params = [id];
    return this.build();
  }

  /**
   * Build SELECT query for cards by category
   * @param {string} category - Category name
   * @returns {Object} {sql, params}
   */
  selectByCategory(category) {
    this.sql = `SELECT * FROM ${this.baseTable} WHERE category = $1 ORDER BY date_occurred ASC`;
    this.params = [category];
    return this.build();
  }

  /**
   * Build COUNT query for cards
   * @param {Object} options - Filter options
   * @param {string} options.category - Filter by category
   * @param {number} options.difficulty - Filter by difficulty
   * @returns {Object} {sql, params}
   */
  count(options = {}) {
    this.sql = `SELECT COUNT(*) FROM ${this.baseTable}`;
    
    // Add filters with proper parameter indexing
    const filters = [];
    if (options.category) filters.push({ condition: 'category = $1', value: options.category });
    if (options.difficulty !== null && options.difficulty !== undefined) filters.push({ condition: 'difficulty = $2', value: options.difficulty });
    
    this.whereMultipleWithIndex(filters, 1);

    return this.build();
  }

  /**
   * Build query to get distinct categories
   * @returns {Object} {sql, params}
   */
  selectCategories() {
    this.sql = 'SELECT DISTINCT category FROM cards ORDER BY category';
    return this.build();
  }

  /**
   * Build query for category statistics
   * @returns {Object} {sql, params}
   */
  selectCategoryStats() {
    this.sql = 'SELECT category, COUNT(*) as count FROM cards GROUP BY category ORDER BY count DESC';
    return this.build();
  }

  /**
   * Build query for difficulty distribution
   * @returns {Object} {sql, params}
   */
  selectDifficultyStats() {
    this.sql = 'SELECT difficulty, COUNT(*) as count FROM cards GROUP BY difficulty ORDER BY difficulty';
    return this.build();
  }
}

/**
 * Statistics query builder for analytics operations
 */
class StatisticsQueryBuilder extends QueryBuilder {
  constructor() {
    super();
  }

  /**
   * Build query for game session statistics
   * @param {Object} options - Query options
   * @param {string} options.playerName - Filter by player name
   * @param {string} options.status - Filter by game status
   * @param {Date} options.startDate - Filter by start date
   * @param {Date} options.endDate - Filter by end date
   * @returns {Object} {sql, params}
   */
  selectGameSessions(options = {}) {
    this.sql = 'SELECT * FROM game_sessions';
    
    // Add filters with proper parameter indexing
    const filters = [];
    if (options.playerName) filters.push({ condition: 'player_name ILIKE $1', value: `%${options.playerName}%` });
    if (options.status) filters.push({ condition: 'status = $2', value: options.status });
    if (options.startDate) filters.push({ condition: 'start_time >= $3', value: options.startDate });
    if (options.endDate) filters.push({ condition: 'start_time <= $4', value: options.endDate });
    
    this.whereMultipleWithIndex(filters, 1);

    // Build the complete SQL with WHERE clause first
    const { sql: baseSql, params: baseParams } = this.build();
    this.sql = baseSql;
    this.params = baseParams;

    this.sql += ' ORDER BY start_time DESC';

    // Add pagination
    if (options.limit !== null && options.limit !== undefined) {
      this.sql += ' LIMIT $' + (this.params.length + 1);
      this.params.push(options.limit);
    }

    if (options.offset !== null && options.offset !== undefined) {
      this.sql += ' OFFSET $' + (this.params.length + 1);
      this.params.push(options.offset);
    }

    return { sql: this.sql, params: this.params };
  }

  /**
   * Build query for player statistics
   * @param {string} playerName - Player name
   * @returns {Object} {sql, params}
   */
  selectPlayerStats(playerName) {
    this.sql = `
      SELECT 
        player_name,
        COUNT(*) as total_games,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_games,
        COUNT(CASE WHEN status = 'abandoned' THEN 1 END) as abandoned_games,
        AVG(CASE WHEN status = 'completed' THEN EXTRACT(EPOCH FROM (end_time - start_time)) END) as avg_duration,
        MIN(start_time) as first_game,
        MAX(start_time) as last_game
      FROM game_sessions 
      WHERE player_name = $1
      GROUP BY player_name
    `;
    this.params = [playerName];
    return this.build();
  }

  /**
   * Build query for leaderboard
   * @param {Object} options - Query options
   * @param {number} options.limit - Number of players to return
   * @param {string} options.timeframe - Timeframe filter (all, week, month)
   * @returns {Object} {sql, params}
   */
  selectLeaderboard(options = {}) {
    let timeFilter = '';
    if (options.timeframe === 'week') {
      timeFilter = ' AND start_time >= NOW() - INTERVAL \'7 days\'';
    } else if (options.timeframe === 'month') {
      timeFilter = ' AND start_time >= NOW() - INTERVAL \'30 days\'';
    }

    this.sql = `
      SELECT 
        player_name,
        COUNT(*) as games_played,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as games_won,
        ROUND(
          COUNT(CASE WHEN status = 'completed' THEN 1 END)::DECIMAL / COUNT(*) * 100, 2
        ) as win_rate
      FROM game_sessions 
      WHERE status IN ('completed', 'abandoned')${timeFilter}
      GROUP BY player_name
      HAVING COUNT(*) >= 1
      ORDER BY win_rate DESC, games_won DESC
      LIMIT $1
    `;
    this.params = [options.limit || 10];
    return this.build();
  }
}

// Export query builders
module.exports = {
  QueryBuilder,
  CardQueryBuilder,
  StatisticsQueryBuilder
}; 