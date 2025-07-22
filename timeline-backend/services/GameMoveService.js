/**
 * GameMoveService
 * @description Handles game move operations using Prisma ORM
 * @version 1.0.0
 */

const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

class GameMoveService {
  /**
   * Constructor
   * @param {PrismaClient} prisma - Prisma client instance
   */
  constructor(prisma = null) {
    this.prisma = prisma || new PrismaClient();
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
      created_at: move.created_at,
             // Include related data if available
       card: move.cards ? {
         id: move.cards.id,
         title: move.cards.title,
         date_occurred: move.cards.date_occurred,
         category: move.cards.category,
         difficulty: move.cards.difficulty
       } : null,
      session: move.game_sessions ? {
        id: move.game_sessions.id,
        player_name: move.game_sessions.player_name,
        status: move.game_sessions.status
      } : null
    };
  }

  /**
   * Transform API move data to Prisma format
   * @param {Object} data - API move data
   * @returns {Object} Transformed data for Prisma
   */
  transformToPrisma(data) {
    const transformed = {};
    
    if (data.session_id !== undefined) transformed.session_id = data.session_id;
    if (data.card_id !== undefined) transformed.card_id = data.card_id;
    if (data.position_before !== undefined) transformed.position_before = data.position_before;
    if (data.position_after !== undefined) transformed.position_after = data.position_after;
    if (data.is_correct !== undefined) transformed.is_correct = data.is_correct;
    if (data.move_number !== undefined) transformed.move_number = data.move_number;
    if (data.time_taken_seconds !== undefined) transformed.time_taken_seconds = data.time_taken_seconds;
    
    return transformed;
  }

  /**
   * Find move by ID
   * @param {string} id - Move UUID
   * @returns {Promise<Object|null>} Move data or null
   */
  async findById(id) {
    try {
      const move = await this.prisma.game_moves.findUnique({
        where: { id },
        include: {
          cards: true,
          game_sessions: {
            select: {
              id: true,
              player_name: true,
              status: true
            }
          }
        }
      });
      
      return this.transformMove(move);
    } catch (error) {
      logger.error('❌ Error finding move by ID:', error.message);
      throw error;
    }
  }

  /**
   * Create a new move
   * @param {Object} data - Move data
   * @returns {Promise<Object>} Created move
   */
  async createMove(data) {
    try {
      const moveData = this.transformToPrisma(data);
      
      const move = await this.prisma.game_moves.create({
        data: moveData,
        include: {
          cards: true,
          game_sessions: {
            select: {
              id: true,
              player_name: true,
              status: true
            }
          }
        }
      });
      
      logger.info(`🎯 Created new move: ${move.id} for session: ${move.session_id}`);
      return this.transformMove(move);
    } catch (error) {
      logger.error('❌ Error creating move:', error.message);
      throw error;
    }
  }

  /**
   * Update move
   * @param {string} id - Move UUID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} Updated move
   */
  async updateMove(id, data) {
    try {
      const updateData = this.transformToPrisma(data);
      
      const move = await this.prisma.game_moves.update({
        where: { id },
        data: updateData,
        include: {
          cards: true,
          game_sessions: {
            select: {
              id: true,
              player_name: true,
              status: true
            }
          }
        }
      });
      
      logger.info(`🎯 Updated move: ${id}`);
      return this.transformMove(move);
    } catch (error) {
      logger.error('❌ Error updating move:', error.message);
      throw error;
    }
  }

  /**
   * Delete move
   * @param {string} id - Move UUID
   * @returns {Promise<Object>} Deleted move
   */
  async deleteMove(id) {
    try {
      const move = await this.prisma.game_moves.delete({
        where: { id },
        include: {
          cards: true,
          game_sessions: {
            select: {
              id: true,
              player_name: true,
              status: true
            }
          }
        }
      });
      
      logger.info(`🎯 Deleted move: ${id}`);
      return this.transformMove(move);
    } catch (error) {
      logger.error('❌ Error deleting move:', error.message);
      throw error;
    }
  }

  /**
   * Get all moves for a session
   * @param {string} sessionId - Session UUID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of moves
   */
  async getSessionMoves(sessionId, options = {}) {
    try {
      const { orderBy = 'move_number', order = 'asc', includeCard = true, includeSession = false } = options;
      
      const include = {};
      if (includeCard) {
        include.cards = true;
      }
      if (includeSession) {
        include.game_sessions = {
          select: {
            id: true,
            player_name: true,
            status: true
          }
        };
      }
      
      const moves = await this.prisma.game_moves.findMany({
        where: { session_id: sessionId },
        orderBy: { [orderBy]: order },
        include
      });
      
      return moves.map(move => this.transformMove(move));
    } catch (error) {
      logger.error('❌ Error fetching session moves:', error.message);
      throw error;
    }
  }

  /**
   * Get moves by card
   * @param {number} cardId - Card ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of moves
   */
  async getMovesByCard(cardId, options = {}) {
    try {
      const { limit = 50, offset = 0, orderBy = 'created_at', order = 'desc' } = options;
      
      const moves = await this.prisma.game_moves.findMany({
        where: { card_id: cardId },
        orderBy: { [orderBy]: order },
        take: limit,
        skip: offset,
        include: {
          game_sessions: {
            select: {
              id: true,
              player_name: true,
              status: true
            }
          }
        }
      });
      
      return moves.map(move => this.transformMove(move));
    } catch (error) {
      logger.error('❌ Error fetching moves by card:', error.message);
      throw error;
    }
  }

  /**
   * Get moves by correctness
   * @param {boolean} isCorrect - Whether moves were correct
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of moves
   */
  async getMovesByCorrectness(isCorrect, options = {}) {
    try {
      const { limit = 50, offset = 0, orderBy = 'created_at', order = 'desc' } = options;
      
      const moves = await this.prisma.game_moves.findMany({
        where: { is_correct: isCorrect },
        orderBy: { [orderBy]: order },
        take: limit,
        skip: offset,
        include: {
          cards: true,
          game_sessions: {
            select: {
              id: true,
              player_name: true,
              status: true
            }
          }
        }
      });
      
      return moves.map(move => this.transformMove(move));
    } catch (error) {
      logger.error('❌ Error fetching moves by correctness:', error.message);
      throw error;
    }
  }

  /**
   * Get move statistics for a session
   * @param {string} sessionId - Session UUID
   * @returns {Promise<Object>} Move statistics
   */
  async getSessionMoveStats(sessionId) {
    try {
      const moves = await this.prisma.game_moves.findMany({
        where: { session_id: sessionId },
        orderBy: { move_number: 'asc' }
      });
      
      const totalMoves = moves.length;
      const correctMoves = moves.filter(move => move.is_correct).length;
      const incorrectMoves = totalMoves - correctMoves;
      const accuracy = totalMoves > 0 ? (correctMoves / totalMoves) * 100 : 0;
      
      const moveTimes = moves
        .map(move => move.time_taken_seconds)
        .filter(time => time !== null && time !== undefined);
      
      const avgMoveTime = moveTimes.length > 0 
        ? moveTimes.reduce((sum, time) => sum + time, 0) / moveTimes.length 
        : 0;
      const fastestMove = moveTimes.length > 0 ? Math.min(...moveTimes) : 0;
      const slowestMove = moveTimes.length > 0 ? Math.max(...moveTimes) : 0;
      
      return {
        total_moves: totalMoves,
        correct_moves: correctMoves,
        incorrect_moves: incorrectMoves,
        accuracy: Math.round(accuracy * 100) / 100,
        average_move_time: Math.round(avgMoveTime * 100) / 100,
        fastest_move: fastestMove,
        slowest_move: slowestMove,
        moves_with_timing: moveTimes.length
      };
    } catch (error) {
      logger.error('❌ Error fetching session move stats:', error.message);
      throw error;
    }
  }

  /**
   * Get move statistics for a card
   * @param {number} cardId - Card ID
   * @returns {Promise<Object>} Card move statistics
   */
  async getCardMoveStats(cardId) {
    try {
      const moves = await this.prisma.game_moves.findMany({
        where: { card_id: cardId }
      });
      
      const totalMoves = moves.length;
      const correctMoves = moves.filter(move => move.is_correct).length;
      const incorrectMoves = totalMoves - correctMoves;
      const accuracy = totalMoves > 0 ? (correctMoves / totalMoves) * 100 : 0;
      
      const moveTimes = moves
        .map(move => move.time_taken_seconds)
        .filter(time => time !== null && time !== undefined);
      
      const avgMoveTime = moveTimes.length > 0 
        ? moveTimes.reduce((sum, time) => sum + time, 0) / moveTimes.length 
        : 0;
      
      return {
        card_id: cardId,
        total_moves: totalMoves,
        correct_moves: correctMoves,
        incorrect_moves: incorrectMoves,
        accuracy: Math.round(accuracy * 100) / 100,
        average_move_time: Math.round(avgMoveTime * 100) / 100,
        moves_with_timing: moveTimes.length
      };
    } catch (error) {
      logger.error('❌ Error fetching card move stats:', error.message);
      throw error;
    }
  }

  /**
   * Record a move with automatic session statistics update
   * @param {Object} moveData - Move data
   * @returns {Promise<Object>} Created move with updated session
   */
  async recordMove(moveData) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        // Create the move
        const move = await tx.game_moves.create({
          data: this.transformToPrisma(moveData),
          include: {
            cards: true,
            game_sessions: {
              select: {
                id: true,
                player_name: true,
                status: true
              }
            }
          }
        });
        
        // Update session statistics
        await tx.game_sessions.update({
          where: { id: moveData.session_id },
          data: {
            total_moves: {
              increment: 1
            },
            correct_moves: {
              increment: moveData.is_correct ? 1 : 0
            },
            incorrect_moves: {
              increment: moveData.is_correct ? 0 : 1
            }
          }
        });
        
        logger.info(`🎯 Recorded move ${moveData.move_number} for session ${moveData.session_id}`);
        return this.transformMove(move);
      });
    } catch (error) {
      logger.error('❌ Error recording move:', error.message);
      throw error;
    }
  }

  /**
   * Bulk create moves for a session
   * @param {Array} movesData - Array of move data
   * @returns {Promise<Array>} Array of created moves
   */
  async createMovesBulk(movesData) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const moves = [];
        
        for (const moveData of movesData) {
          const move = await tx.game_moves.create({
            data: this.transformToPrisma(moveData),
            include: {
              cards: true,
              game_sessions: {
                select: {
                  id: true,
                  player_name: true,
                  status: true
                }
              }
            }
          });
          
          moves.push(move);
        }
        
        // Update session statistics
        if (movesData.length > 0) {
          const sessionId = movesData[0].session_id;
          const correctMoves = movesData.filter(move => move.is_correct).length;
          const incorrectMoves = movesData.length - correctMoves;
          
          await tx.game_sessions.update({
            where: { id: sessionId },
            data: {
              total_moves: {
                increment: movesData.length
              },
              correct_moves: {
                increment: correctMoves
              },
              incorrect_moves: {
                increment: incorrectMoves
              }
            }
          });
        }
        
        logger.info(`🎯 Created ${movesData.length} moves for session ${movesData[0]?.session_id}`);
        return moves.map(move => this.transformMove(move));
      });
    } catch (error) {
      logger.error('❌ Error creating moves bulk:', error.message);
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

module.exports = GameMoveService; 