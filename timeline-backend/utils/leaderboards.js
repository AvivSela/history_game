/**
 * Leaderboard System Utilities
 * Handles global leaderboards, category-specific leaderboards, and time-based rankings
 */

const { query } = require('./database');
const { leaderboardCache } = require('./cache');
const logger = require('./logger');

/**
 * Get global leaderboard
 * @param {number} limit - Number of players to return (default: 100)
 * @param {string} sortBy - Sort criteria: 'score', 'accuracy', 'games_played' (default: 'score')
 * @param {string} order - Sort order: 'desc' or 'asc' (default: 'desc')
 * @returns {Promise<Array>} Array of player rankings
 */
async function getGlobalLeaderboard(limit = 100, sortBy = 'total_score', order = 'desc') {
  try {
    const validSortFields = ['total_score', 'average_accuracy', 'total_games_played', 'win_rate', 'average_score_per_game'];
    const validOrders = ['desc', 'asc'];
    
    if (!validSortFields.includes(sortBy)) {
      throw new Error(`Invalid sort field: ${sortBy}`);
    }
    
    if (!validOrders.includes(order)) {
      throw new Error(`Invalid sort order: ${order}`);
    }

    // Use cache with 2-minute TTL for global leaderboard
    return await leaderboardCache.getOrFetch('global', async () => {
      const sql = `
        SELECT 
          ps.player_name,
          ps.total_games_played,
          ps.total_games_won,
          ps.total_score,
          ps.average_score_per_game,
          ps.win_rate,
          ps.average_accuracy as accuracy,
          ps.best_score,
          ps.longest_streak,
          ROW_NUMBER() OVER (ORDER BY ps.${sortBy} ${order.toUpperCase()}) as rank
        FROM player_statistics ps
        WHERE ps.total_games_played > 0
        ORDER BY ps.${sortBy} ${order.toUpperCase()}
        LIMIT $1
      `;

      const result = await query(sql, [limit]);
      logger.info(`Global leaderboard retrieved: ${result.rows.length} players`);
      return result.rows;
    }, { limit, sortBy, order }, 120000); // 2 minutes TTL
  } catch (error) {
    logger.error('Error getting global leaderboard:', error);
    throw error;
  }
}

/**
 * Get category-specific leaderboard
 * @param {string} category - Category name
 * @param {number} limit - Number of players to return (default: 50)
 * @param {string} sortBy - Sort criteria (default: 'score')
 * @param {string} order - Sort order (default: 'desc')
 * @returns {Promise<Array>} Array of player rankings for category
 */
async function getCategoryLeaderboard(category, limit = 50, sortBy = 'total_score', order = 'desc') {
  try {
    const validSortFields = ['total_score', 'accuracy', 'games_played', 'win_rate', 'average_score'];
    const validOrders = ['desc', 'asc'];
    
    if (!validSortFields.includes(sortBy)) {
      throw new Error(`Invalid sort field: ${sortBy}`);
    }
    
    if (!validOrders.includes(order)) {
      throw new Error(`Invalid sort order: ${order}`);
    }

    // Use cache with 3-minute TTL for category leaderboard
    return await leaderboardCache.getOrFetch('category', async () => {
      const sql = `
        SELECT 
          cs.player_name,
          cs.category,
          cs.games_played,
          cs.games_won,
          cs.total_score,
          cs.average_score as average_score_per_game,
          cs.win_rate,
          cs.accuracy,
          cs.best_score,
          ROW_NUMBER() OVER (ORDER BY cs.${sortBy} ${order.toUpperCase()}) as rank
        FROM category_statistics cs
        WHERE cs.category = $1 AND cs.games_played > 0
        ORDER BY cs.${sortBy} ${order.toUpperCase()}
        LIMIT $2
      `;

      const result = await query(sql, [category, limit]);
      logger.info(`Category leaderboard retrieved for ${category}: ${result.rows.length} players`);
      return result.rows;
    }, { category, limit, sortBy, order }, 180000); // 3 minutes TTL
  } catch (error) {
    logger.error(`Error getting category leaderboard for ${category}:`, error);
    throw error;
  }
}

/**
 * Get daily leaderboard (last 24 hours)
 * @param {number} limit - Number of players to return (default: 50)
 * @param {string} sortBy - Sort criteria (default: 'score')
 * @param {string} order - Sort order (default: 'desc')
 * @returns {Promise<Array>} Array of player rankings for daily period
 */
async function getDailyLeaderboard(limit = 50, sortBy = 'total_score', order = 'desc') {
  try {
    const validSortFields = ['total_score', 'accuracy', 'games_played', 'win_rate', 'average_score'];
    const validOrders = ['desc', 'asc'];
    
    if (!validSortFields.includes(sortBy)) {
      throw new Error(`Invalid sort field: ${sortBy}`);
    }
    
    if (!validOrders.includes(order)) {
      throw new Error(`Invalid sort order: ${order}`);
    }

    // Use cache with 1-minute TTL for daily leaderboard (changes frequently)
    return await leaderboardCache.getOrFetch('daily', async () => {
      const sql = `
        SELECT 
          ds.player_name,
          ds.date,
          ds.games_played,
          ds.games_won,
          ds.total_score,
          ds.average_score as average_score_per_game,
          ds.win_rate,
          ds.accuracy,
          ROW_NUMBER() OVER (ORDER BY ds.${sortBy} ${order.toUpperCase()}) as rank
        FROM daily_statistics ds
        WHERE ds.date = CURRENT_DATE AND ds.games_played > 0
        ORDER BY ds.${sortBy} ${order.toUpperCase()}
        LIMIT $1
      `;

      const result = await query(sql, [limit]);
      logger.info(`Daily leaderboard retrieved: ${result.rows.length} players`);
      return result.rows;
    }, { limit, sortBy, order }, 60000); // 1 minute TTL
  } catch (error) {
    logger.error('Error getting daily leaderboard:', error);
    throw error;
  }
}

/**
 * Get weekly leaderboard (current week)
 * @param {number} limit - Number of players to return (default: 50)
 * @param {string} sortBy - Sort criteria (default: 'score')
 * @param {string} order - Sort order (default: 'desc')
 * @returns {Promise<Array>} Array of player rankings for weekly period
 */
async function getWeeklyLeaderboard(limit = 50, sortBy = 'total_score', order = 'desc') {
  try {
    const validSortFields = ['total_score', 'accuracy', 'games_played', 'win_rate', 'average_score'];
    const validOrders = ['desc', 'asc'];
    
    if (!validSortFields.includes(sortBy)) {
      throw new Error(`Invalid sort field: ${sortBy}`);
    }
    
    if (!validOrders.includes(order)) {
      throw new Error(`Invalid sort order: ${order}`);
    }

    // Use cache with 5-minute TTL for weekly leaderboard
    return await leaderboardCache.getOrFetch('weekly', async () => {
      const sql = `
        SELECT 
          ws.player_name,
          ws.week_start_date,
          ws.games_played,
          ws.games_won,
          ws.total_score,
          ws.average_score as average_score_per_game,
          ws.win_rate,
          ws.accuracy,
          ROW_NUMBER() OVER (ORDER BY ws.${sortBy} ${order.toUpperCase()}) as rank
        FROM weekly_statistics ws
        WHERE ws.week_start_date = DATE_TRUNC('week', CURRENT_DATE) AND ws.games_played > 0
        ORDER BY ws.${sortBy} ${order.toUpperCase()}
        LIMIT $1
      `;

      const result = await query(sql, [limit]);
      logger.info(`Weekly leaderboard retrieved: ${result.rows.length} players`);
      return result.rows;
    }, { limit, sortBy, order }, 300000); // 5 minutes TTL
  } catch (error) {
    logger.error('Error getting weekly leaderboard:', error);
    throw error;
  }
}

/**
 * Get player's ranking across all leaderboards
 * @param {string} playerName - Player name
 * @returns {Promise<Object>} Player's rankings in different leaderboards
 */
async function getPlayerRankings(playerName) {
  try {
    // Get global ranking
    const globalRankingSql = `
      SELECT rank FROM (
        SELECT 
          player_name,
          ROW_NUMBER() OVER (ORDER BY total_score DESC) as rank
        FROM player_statistics
        WHERE total_games_played > 0
      ) ranked WHERE player_name = $1
    `;
    
    // Get category rankings
    const categoryRankingSql = `
      SELECT 
        category,
        ROW_NUMBER() OVER (PARTITION BY category ORDER BY total_score DESC) as rank
      FROM category_statistics
      WHERE player_name = $1 AND games_played > 0
    `;
    
    // Get daily ranking
    const dailyRankingSql = `
      SELECT rank FROM (
        SELECT 
          player_name,
          ROW_NUMBER() OVER (ORDER BY total_score DESC) as rank
        FROM daily_statistics
        WHERE date = CURRENT_DATE AND games_played > 0
      ) ranked WHERE player_name = $1
    `;
    
    // Get weekly ranking
    const weeklyRankingSql = `
      SELECT rank FROM (
        SELECT 
          player_name,
          ROW_NUMBER() OVER (ORDER BY total_score DESC) as rank
        FROM weekly_statistics
        WHERE week_start_date = DATE_TRUNC('week', CURRENT_DATE) AND games_played > 0
      ) ranked WHERE player_name = $1
    `;

    const [globalResult, categoryResult, dailyResult, weeklyResult] = await Promise.all([
      query(globalRankingSql, [playerName]),
      query(categoryRankingSql, [playerName]),
      query(dailyRankingSql, [playerName]),
      query(weeklyRankingSql, [playerName])
    ]);

    const rankings = {
      global: globalResult.rows[0]?.rank || null,
      daily: dailyResult.rows[0]?.rank || null,
      weekly: weeklyResult.rows[0]?.rank || null,
      categories: categoryResult.rows.reduce((acc, row) => {
        acc[row.category] = row.rank;
        return acc;
      }, {})
    };

    logger.info(`Player rankings retrieved for ${playerName}`);
    return rankings;
  } catch (error) {
    logger.error(`Error getting player rankings for ${playerName}:`, error);
    throw error;
  }
}

/**
 * Get leaderboard summary statistics
 * @returns {Promise<Object>} Summary statistics for all leaderboards
 */
async function getLeaderboardSummary() {
  try {
    // Use cache with 10-minute TTL for summary (changes less frequently)
    return await leaderboardCache.getOrFetch('summary', async () => {
      const sql = `
        SELECT 
          (SELECT COUNT(*) FROM player_statistics WHERE total_games_played > 0) as total_players,
          (SELECT COUNT(*) FROM category_statistics WHERE games_played > 0) as total_category_entries,
          (SELECT COUNT(*) FROM daily_statistics WHERE date = CURRENT_DATE AND games_played > 0) as daily_active_players,
          (SELECT COUNT(*) FROM weekly_statistics WHERE week_start_date = DATE_TRUNC('week', CURRENT_DATE) AND games_played > 0) as weekly_active_players,
          (SELECT MAX(total_score) FROM player_statistics) as highest_score,
          (SELECT AVG(average_score_per_game) FROM player_statistics WHERE total_games_played > 0) as average_score
      `;

      const result = await query(sql);
      const summary = result.rows[0];
      
      // Convert numeric types to numbers
      summary.total_players = Number(summary.total_players);
      summary.total_category_entries = Number(summary.total_category_entries);
      summary.daily_active_players = Number(summary.daily_active_players);
      summary.weekly_active_players = Number(summary.weekly_active_players);
      summary.highest_score = Number(summary.highest_score);
      summary.average_score = Number(summary.average_score || 0);

      logger.info('Leaderboard summary retrieved');
      return summary;
    }, {}, 600000); // 10 minutes TTL
  } catch (error) {
    logger.error('Error getting leaderboard summary:', error);
    throw error;
  }
}

/**
 * Invalidate leaderboard caches when new game data is added
 * @param {string} playerName - Player name (optional)
 * @param {string} category - Category name (optional)
 */
async function invalidateLeaderboardCaches(playerName = null, category = null) {
  try {
    if (playerName) {
      // Invalidate player-specific caches
      leaderboardCache.invalidate('player', { playerName });
    }
    
    if (category) {
      // Invalidate category-specific caches
      leaderboardCache.invalidate('category', { category });
    }
    
    // Always invalidate global and time-based caches when new data is added
    leaderboardCache.invalidate('global');
    leaderboardCache.invalidate('daily');
    leaderboardCache.invalidate('weekly');
    leaderboardCache.invalidate('summary');
    
    logger.info(`Leaderboard caches invalidated${playerName ? ` for player: ${playerName}` : ''}${category ? ` for category: ${category}` : ''}`);
  } catch (error) {
    logger.error('Error invalidating leaderboard caches:', error);
  }
}

/**
 * Get cache statistics for leaderboards
 * @returns {Object} Cache performance statistics
 */
async function getCacheStats() {
  try {
    return leaderboardCache.getStats();
  } catch (error) {
    logger.error('Error getting cache stats:', error);
    return null;
  }
}

module.exports = {
  getGlobalLeaderboard,
  getCategoryLeaderboard,
  getDailyLeaderboard,
  getWeeklyLeaderboard,
  getPlayerRankings,
  getLeaderboardSummary,
  invalidateLeaderboardCaches,
  getCacheStats
}; 