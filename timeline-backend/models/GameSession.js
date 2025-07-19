/**
 * GameSession Model
 * Handles database operations for game sessions and moves
 */

const { query } = require('../config/database');
const logger = require('../utils/logger');

class GameSession {
  /**
   * Create a new game session
   * @param {Object} sessionData - Session data
   * @param {string} sessionData.player_name - Player name
   * @param {number} sessionData.difficulty_level - Difficulty level (1-5)
   * @param {number} sessionData.card_count - Number of cards
   * @param {string[]} sessionData.categories - Selected categories
   * @returns {Promise<Object>} Created session
   */
  static async createSession(sessionData) {
    const { player_name, difficulty_level, card_count, categories } = sessionData;
    
    const sql = `
      INSERT INTO game_sessions (player_name, difficulty_level, card_count, categories)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const values = [player_name, difficulty_level, card_count, categories];
    
    try {
      const result = await query(sql, values);
      logger.info(`🎮 Created new game session: ${result.rows[0].id}`);
      return result.rows[0];
    } catch (error) {
      logger.error('❌ Error creating game session:', error.message);
      throw error;
    }
  }

  /**
   * Get a game session by ID
   * @param {string} sessionId - Session UUID
   * @returns {Promise<Object|null>} Session data or null
   */
  static async getSessionById(sessionId) {
    const sql = `
      SELECT * FROM game_sessions 
      WHERE id = $1
    `;
    
    try {
      const result = await query(sql, [sessionId]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('❌ Error fetching game session:', error.message);
      throw error;
    }
  }

  /**
   * Update session status
   * @param {string} sessionId - Session UUID
   * @param {string} status - New status
   * @param {Object} additionalData - Additional data to update
   * @returns {Promise<Object>} Updated session
   */
  static async updateSessionStatus(sessionId, status, additionalData = {}) {
    const { score, end_time } = additionalData;
    
    let sql = `
      UPDATE game_sessions 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
    `;
    const values = [status];
    let paramCount = 1;
    
    if (score !== undefined) {
      paramCount++;
      sql += `, score = $${paramCount}`;
      values.push(score);
    }
    
    if (end_time !== undefined) {
      paramCount++;
      sql += `, end_time = $${paramCount}`;
      values.push(end_time);
    }
    
    sql += ` WHERE id = $${paramCount + 1} RETURNING *`;
    values.push(sessionId);
    
    try {
      const result = await query(sql, values);
      logger.info(`🎮 Updated session ${sessionId} status to: ${status}`);
      return result.rows[0];
    } catch (error) {
      logger.error('❌ Error updating session status:', error.message);
      throw error;
    }
  }

  /**
   * Record a move in a game session
   * @param {Object} moveData - Move data
   * @param {string} moveData.session_id - Session UUID
   * @param {number} moveData.card_id - Card ID
   * @param {number} moveData.position_before - Position before move
   * @param {number} moveData.position_after - Position after move
   * @param {boolean} moveData.is_correct - Whether move was correct
   * @param {number} moveData.move_number - Sequential move number
   * @param {number} moveData.time_taken_seconds - Time taken for move
   * @returns {Promise<Object>} Created move
   */
  static async recordMove(moveData) {
    const {
      session_id,
      card_id,
      position_before,
      position_after,
      is_correct,
      move_number,
      time_taken_seconds
    } = moveData;
    
    const sql = `
      INSERT INTO game_moves (
        session_id, card_id, position_before, position_after, 
        is_correct, move_number, time_taken_seconds
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const values = [
      session_id, card_id, position_before, position_after,
      is_correct, move_number, time_taken_seconds
    ];
    
    try {
      const result = await query(sql, values);
      
      // Update session statistics
      await this.updateSessionStats(session_id, is_correct);
      
      logger.info(`🎯 Recorded move ${move_number} for session ${session_id}`);
      return result.rows[0];
    } catch (error) {
      logger.error('❌ Error recording move:', error.message);
      throw error;
    }
  }

  /**
   * Update session statistics after a move
   * @param {string} sessionId - Session UUID
   * @param {boolean} isCorrect - Whether the move was correct
   * @returns {Promise<void>}
   */
  static async updateSessionStats(sessionId, isCorrect) {
    const sql = `
      UPDATE game_sessions 
      SET 
        total_moves = total_moves + 1,
        correct_moves = correct_moves + $1,
        incorrect_moves = incorrect_moves + $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
    `;
    
    const values = [isCorrect ? 1 : 0, isCorrect ? 0 : 1, sessionId];
    
    try {
      await query(sql, values);
    } catch (error) {
      logger.error('❌ Error updating session stats:', error.message);
      throw error;
    }
  }

  /**
   * Get moves for a session
   * @param {string} sessionId - Session UUID
   * @returns {Promise<Array>} Array of moves
   */
  static async getSessionMoves(sessionId) {
    const sql = `
      SELECT gm.*, c.title, c.date_occurred, c.category
      FROM game_moves gm
      JOIN cards c ON gm.card_id = c.id
      WHERE gm.session_id = $1
      ORDER BY gm.move_number ASC
    `;
    
    try {
      const result = await query(sql, [sessionId]);
      return result.rows;
    } catch (error) {
      logger.error('❌ Error fetching session moves:', error.message);
      throw error;
    }
  }

  /**
   * Get recent sessions for a player
   * @param {string} playerName - Player name
   * @param {number} limit - Number of sessions to return
   * @returns {Promise<Array>} Array of sessions
   */
  static async getPlayerSessions(playerName, limit = 10) {
    const sql = `
      SELECT * FROM game_sessions 
      WHERE player_name = $1
      ORDER BY start_time DESC
      LIMIT $2
    `;
    
    try {
      const result = await query(sql, [playerName, limit]);
      return result.rows;
    } catch (error) {
      logger.error('❌ Error fetching player sessions:', error.message);
      throw error;
    }
  }

  /**
   * Get session statistics
   * @param {string} sessionId - Session UUID
   * @returns {Promise<Object>} Session statistics
   */
  static async getSessionStats(sessionId) {
    const sql = `
      SELECT 
        gs.*,
        COUNT(gm.id) as total_moves_recorded,
        AVG(gm.time_taken_seconds) as avg_move_time,
        MIN(gm.time_taken_seconds) as fastest_move,
        MAX(gm.time_taken_seconds) as slowest_move
      FROM game_sessions gs
      LEFT JOIN game_moves gm ON gs.id = gm.session_id
      WHERE gs.id = $1
      GROUP BY gs.id
    `;
    
    try {
      const result = await query(sql, [sessionId]);
      if (result.rows[0]) {
        const stats = result.rows[0];
        // Convert numeric strings to numbers
        stats.total_moves_recorded = parseInt(stats.total_moves_recorded) || 0;
        stats.avg_move_time = parseFloat(stats.avg_move_time) || 0;
        stats.fastest_move = parseInt(stats.fastest_move) || 0;
        stats.slowest_move = parseInt(stats.slowest_move) || 0;
        return stats;
      }
      return null;
    } catch (error) {
      logger.error('❌ Error fetching session stats:', error.message);
      throw error;
    }
  }

  /**
   * Get leaderboard data
   * @param {number} limit - Number of entries to return
   * @param {string} category - Optional category filter
   * @returns {Promise<Array>} Leaderboard entries
   */
  static async getLeaderboard(limit = 10, category = null) {
    let sql = `
      SELECT 
        player_name,
        COUNT(*) as games_played,
        ROUND(AVG(score), 2) as avg_score,
        MAX(score) as best_score,
        SUM(correct_moves) as total_correct_moves,
        SUM(total_moves) as total_moves,
        CASE 
          WHEN SUM(total_moves) > 0 THEN 
            ROUND((SUM(correct_moves)::numeric / SUM(total_moves)) * 100, 2)
          ELSE 0 
        END as accuracy_percentage
      FROM game_sessions 
      WHERE status = 'completed'
    `;
    
    const values = [];
    let paramCount = 0;
    
    if (category) {
      paramCount++;
      sql += ` AND $${paramCount} = ANY(categories)`;
      values.push(category);
    }
    
    sql += `
      GROUP BY player_name
      HAVING COUNT(*) >= 1
      ORDER BY avg_score DESC, accuracy_percentage DESC
      LIMIT $${paramCount + 1}
    `;
    
    values.push(limit);
    
    try {
      const result = await query(sql, values);
      return result.rows;
    } catch (error) {
      logger.error('❌ Error fetching leaderboard:', error.message);
      throw error;
    }
  }
}

module.exports = GameSession; 