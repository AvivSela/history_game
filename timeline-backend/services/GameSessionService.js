/**
 * GameSessionService
 * @description Handles game session operations using Prisma ORM
 * @version 1.0.0
 */

const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

class GameSessionService {
  /**
   * Constructor
   * @param {PrismaClient} prisma - Prisma client instance
   */
  constructor(prisma = null) {
    this.prisma = prisma || new PrismaClient();
  }

  /**
   * Transform Prisma game session to API format
   * @param {Object} session - Prisma game session object
   * @returns {Object} Transformed session data
   */
  transformSession(session) {
    if (!session) return null;
    
    return {
      id: session.id,
      player_name: session.player_name,
      difficulty_level: session.difficulty_level,
      card_count: session.card_count,
      categories: session.categories || [],
      status: session.status,
      score: session.score || 0,
      total_moves: session.total_moves || 0,
      correct_moves: session.correct_moves || 0,
      incorrect_moves: session.incorrect_moves || 0,
      start_time: session.start_time,
      end_time: session.end_time,
      duration_seconds: session.duration_seconds,
      created_at: session.created_at,
      updated_at: session.updated_at
    };
  }

  /**
   * Transform API session data to Prisma format
   * @param {Object} data - API session data
   * @returns {Object} Transformed data for Prisma
   */
  transformToPrisma(data) {
    const transformed = {};
    
    if (data.player_name !== undefined) transformed.player_name = data.player_name;
    if (data.difficulty_level !== undefined) transformed.difficulty_level = data.difficulty_level;
    if (data.card_count !== undefined) transformed.card_count = data.card_count;
    if (data.categories !== undefined) transformed.categories = data.categories;
    if (data.status !== undefined) transformed.status = data.status;
    if (data.score !== undefined) transformed.score = data.score;
    if (data.total_moves !== undefined) transformed.total_moves = data.total_moves;
    if (data.correct_moves !== undefined) transformed.correct_moves = data.correct_moves;
    if (data.incorrect_moves !== undefined) transformed.incorrect_moves = data.incorrect_moves;
    if (data.start_time !== undefined) transformed.start_time = data.start_time;
    if (data.end_time !== undefined) transformed.end_time = data.end_time;
    if (data.duration_seconds !== undefined) transformed.duration_seconds = data.duration_seconds;
    
    return transformed;
  }

  /**
   * Transform Prisma game move to API format
   * @param {Object} move - Prisma game move object
   * @returns {Object} Transformed move data
   */
  transformMove(move) {
    if (!move) return null;
    
    return {
      id: move.id,
      session_id: move.session_id,
      card_id: move.card_id,
      position_before: move.position_before,
      position_after: move.position_after,
      is_correct: move.is_correct,
      move_number: move.move_number,
      time_taken_seconds: move.time_taken_seconds,
      created_at: move.created_at
    };
  }

  /**
   * Find game session by ID
   * @param {string} id - Session UUID
   * @returns {Promise<Object|null>} Session data or null
   */
  async findById(id) {
    try {
      const session = await this.prisma.game_sessions.findUnique({
        where: { id },
        include: {
          game_moves: {
            orderBy: { move_number: 'asc' }
          }
        }
      });
      
      return this.transformSession(session);
    } catch (error) {
      logger.error('❌ Error finding game session by ID:', error.message);
      throw error;
    }
  }

  /**
   * Create a new game session
   * @param {Object} data - Session data
   * @returns {Promise<Object>} Created session
   */
  async createSession(data) {
    try {
      const sessionData = this.transformToPrisma(data);
      
      const session = await this.prisma.game_sessions.create({
        data: sessionData
      });
      
      logger.info(`🎮 Created new game session: ${session.id}`);
      return this.transformSession(session);
    } catch (error) {
      logger.error('❌ Error creating game session:', error.message);
      throw error;
    }
  }

  /**
   * Update game session
   * @param {string} id - Session UUID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} Updated session
   */
  async updateSession(id, data) {
    try {
      const updateData = this.transformToPrisma(data);
      
      const session = await this.prisma.game_sessions.update({
        where: { id },
        data: updateData
      });
      
      logger.info(`🎮 Updated game session: ${id}`);
      return this.transformSession(session);
    } catch (error) {
      logger.error('❌ Error updating game session:', error.message);
      throw error;
    }
  }

  /**
   * Update session status
   * @param {string} id - Session UUID
   * @param {string} status - New status
   * @param {Object} additionalData - Additional data to update
   * @returns {Promise<Object>} Updated session
   */
  async updateSessionStatus(id, status, additionalData = {}) {
    try {
      const updateData = {
        status,
        ...this.transformToPrisma(additionalData)
      };
      
      const session = await this.prisma.game_sessions.update({
        where: { id },
        data: updateData
      });
      
      logger.info(`🎮 Updated session ${id} status to: ${status}`);
      return this.transformSession(session);
    } catch (error) {
      logger.error('❌ Error updating session status:', error.message);
      throw error;
    }
  }

  /**
   * Delete game session
   * @param {string} id - Session UUID
   * @returns {Promise<Object>} Deleted session
   */
  async deleteSession(id) {
    try {
      const session = await this.prisma.game_sessions.delete({
        where: { id }
      });
      
      logger.info(`🎮 Deleted game session: ${id}`);
      return this.transformSession(session);
    } catch (error) {
      logger.error('❌ Error deleting game session:', error.message);
      throw error;
    }
  }

  /**
   * Record a move in a game session
   * @param {Object} moveData - Move data
   * @returns {Promise<Object>} Created move
   */
  async recordMove(moveData) {
    try {
      const move = await this.prisma.game_moves.create({
        data: {
          session_id: moveData.session_id,
          card_id: moveData.card_id,
          position_before: moveData.position_before,
          position_after: moveData.position_after,
          is_correct: moveData.is_correct,
          move_number: moveData.move_number,
          time_taken_seconds: moveData.time_taken_seconds
        }
      });
      
      // Update session statistics
      await this.updateSessionStats(moveData.session_id, moveData.is_correct);
      
      logger.info(`🎯 Recorded move ${moveData.move_number} for session ${moveData.session_id}`);
      return this.transformMove(move);
    } catch (error) {
      logger.error('❌ Error recording move:', error.message);
      throw error;
    }
  }

  /**
   * Get all moves for a session
   * @param {string} sessionId - Session UUID
   * @returns {Promise<Array>} Array of moves
   */
  async getSessionMoves(sessionId) {
    try {
      const moves = await this.prisma.game_moves.findMany({
        where: { session_id: sessionId },
        orderBy: { move_number: 'asc' }
      });
      
      return moves.map(move => this.transformMove(move));
    } catch (error) {
      logger.error('❌ Error fetching session moves:', error.message);
      throw error;
    }
  }

  /**
   * Update session statistics after a move
   * @param {string} sessionId - Session UUID
   * @param {boolean} isCorrect - Whether the move was correct
   * @returns {Promise<void>}
   */
  async updateSessionStats(sessionId, isCorrect) {
    try {
      await this.prisma.game_sessions.update({
        where: { id: sessionId },
        data: {
          total_moves: {
            increment: 1
          },
          correct_moves: {
            increment: isCorrect ? 1 : 0
          },
          incorrect_moves: {
            increment: isCorrect ? 0 : 1
          }
        }
      });
    } catch (error) {
      logger.error('❌ Error updating session stats:', error.message);
      throw error;
    }
  }

  /**
   * Get session statistics
   * @param {string} sessionId - Session UUID
   * @returns {Promise<Object>} Session statistics
   */
  async getSessionStats(sessionId) {
    try {
      const session = await this.prisma.game_sessions.findUnique({
        where: { id: sessionId },
        include: {
          game_moves: {
            orderBy: { move_number: 'asc' }
          }
        }
      });
      
      if (!session) return null;
      
      const moves = session.game_moves;
      const totalMoves = moves.length;
      const correctMoves = moves.filter(move => move.is_correct).length;
      const avgMoveTime = totalMoves > 0 
        ? moves.reduce((sum, move) => sum + (move.time_taken_seconds || 0), 0) / totalMoves 
        : 0;
      const fastestMove = totalMoves > 0 
        ? Math.min(...moves.map(move => move.time_taken_seconds || 0))
        : 0;
      const slowestMove = totalMoves > 0 
        ? Math.max(...moves.map(move => move.time_taken_seconds || 0))
        : 0;
      
      return {
        ...this.transformSession(session),
        total_moves_recorded: totalMoves,
        avg_move_time: Math.round(avgMoveTime * 100) / 100,
        fastest_move: fastestMove,
        slowest_move: slowestMove
      };
    } catch (error) {
      logger.error('❌ Error fetching session stats:', error.message);
      throw error;
    }
  }

  /**
   * Get recent sessions for a player
   * @param {string} playerName - Player name
   * @param {number} limit - Number of sessions to return
   * @returns {Promise<Array>} Array of sessions
   */
  async getPlayerSessions(playerName, limit = 10) {
    try {
      const sessions = await this.prisma.game_sessions.findMany({
        where: { player_name: playerName },
        orderBy: { start_time: 'desc' },
        take: limit
      });
      
      return sessions.map(session => this.transformSession(session));
    } catch (error) {
      logger.error('❌ Error fetching player sessions:', error.message);
      throw error;
    }
  }

  /**
   * Get leaderboard data
   * @param {number} limit - Number of entries to return
   * @param {string} category - Filter by category
   * @returns {Promise<Array>} Leaderboard data
   */
  async getLeaderboard(limit = 10, category = null) {
    try {
      // Build the aggregation query
      const aggregationResult = await this.prisma.game_sessions.groupBy({
        by: ['player_name'],
        where: {
          status: 'completed',
          ...(category && { categories: { has: category } })
        },
        _count: {
          id: true
        },
        _avg: {
          score: true
        },
        _max: {
          score: true
        },
        _sum: {
          correct_moves: true,
          total_moves: true
        }
      });

      // Transform the results to match the expected format
      const leaderboard = aggregationResult
        .map(result => {
          const totalMoves = result._sum.total_moves || 0;
          const correctMoves = result._sum.correct_moves || 0;
          const accuracyPercentage = totalMoves > 0 
            ? Math.round((correctMoves / totalMoves) * 100 * 100) / 100
            : 0;

          return {
            player_name: result.player_name,
            games_played: result._count.id,
            avg_score: Math.round((result._avg.score || 0) * 100) / 100,
            best_score: result._max.score || 0,
            total_correct_moves: correctMoves,
            total_moves: totalMoves,
            accuracy_percentage: accuracyPercentage
          };
        })
        .sort((a, b) => {
          // Sort by average score descending, then by accuracy percentage descending
          if (a.avg_score !== b.avg_score) {
            return b.avg_score - a.avg_score;
          }
          return b.accuracy_percentage - a.accuracy_percentage;
        })
        .slice(0, limit);

      return leaderboard;
    } catch (error) {
      logger.error('❌ Error fetching leaderboard:', error.message);
      throw error;
    }
  }

  /**
   * Execute operations within a transaction
   * @param {Function} operation - Operation to execute
   * @returns {Promise<any>} Operation result
   */
  async withTransaction(operation) {
    return this.prisma.$transaction(operation);
  }

  /**
   * Disconnect from database
   * @returns {Promise<void>}
   */
  async disconnect() {
    await this.prisma.$disconnect();
  }
}

module.exports = GameSessionService; 