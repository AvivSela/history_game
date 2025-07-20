/**
 * Game Session Routes
 * Handles all game session related endpoints
 */

const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const GameSession = require('../models/GameSession');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * POST /api/game-sessions
 * Create a new game session
 */
router.post('/', asyncHandler(async (req, res) => {
  const { player_name, difficulty_level, card_count, categories } = req.body;
  
  // Validate required fields
  if (player_name === undefined || player_name === null || !difficulty_level || !card_count) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: player_name, difficulty_level, card_count'
    });
  }
  
  // Validate player name type and format
  if (typeof player_name !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Player name must be a string'
    });
  }
  
  // Validate player name (check empty string after checking if it exists)
  if (player_name.trim().length === 0 || player_name.length > 100) {
    return res.status(400).json({
      success: false,
      error: 'Player name must be between 1 and 100 characters'
    });
  }
  
  // Validate difficulty level
  if (difficulty_level < 1 || difficulty_level > 5) {
    return res.status(400).json({
      success: false,
      error: 'Difficulty level must be between 1 and 5'
    });
  }
  
  // Validate card count
  if (card_count < 1 || card_count > 50) {
    return res.status(400).json({
      success: false,
      error: 'Card count must be between 1 and 50'
    });
  }
  
  try {
    const sessionData = {
      player_name: player_name.trim(),
      difficulty_level: parseInt(difficulty_level),
      card_count: parseInt(card_count),
      categories: categories || []
    };
    
    const session = await GameSession.createSession(sessionData);
    
    logger.info(`🎮 New game session created: ${session.id} for player: ${player_name}`);
    
    res.status(201).json({
      success: true,
      message: 'Game session created successfully',
      data: {
        session_id: session.id,
        player_name: session.player_name,
        difficulty_level: session.difficulty_level,
        card_count: session.card_count,
        categories: session.categories,
        status: session.status,
        start_time: session.start_time
      }
    });
  } catch (error) {
    logger.error('❌ Error creating game session:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to create game session'
    });
  }
}));

/**
 * GET /api/game-sessions/leaderboard
 * Get leaderboard data
 */
router.get('/leaderboard', asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const category = req.query.category;
  
  // Validate limit
  if (limit < 1 || limit > 100) {
    return res.status(400).json({
      success: false,
      error: 'Limit must be between 1 and 100'
    });
  }
  
  try {
    const leaderboard = await GameSession.getLeaderboard(limit, category);
    
    res.json({
      success: true,
      count: leaderboard.length,
      category: category || 'all',
      data: leaderboard
    });
  } catch (error) {
    logger.error('❌ Error fetching leaderboard:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leaderboard'
    });
  }
}));

/**
 * GET /api/game-sessions/player/:playerName
 * Get recent sessions for a player
 */
router.get('/player/:playerName', asyncHandler(async (req, res) => {
  const { playerName } = req.params;
  const limit = parseInt(req.query.limit) || 10;
  
  // Validate limit
  if (limit < 1 || limit > 50) {
    return res.status(400).json({
      success: false,
      error: 'Limit must be between 1 and 50'
    });
  }
  
  try {
    const sessions = await GameSession.getPlayerSessions(playerName, limit);
    
    res.json({
      success: true,
      count: sessions.length,
      player_name: playerName,
      data: sessions
    });
  } catch (error) {
    logger.error('❌ Error fetching player sessions:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch player sessions'
    });
  }
}));

/**
 * GET /api/game-sessions/:id
 * Get a specific game session
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  try {
    const session = await GameSession.getSessionById(id);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Game session not found'
      });
    }
    
    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    logger.error('❌ Error fetching game session:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch game session'
    });
  }
}));

/**
 * POST /api/game-sessions/:id/moves
 * Record a move in a game session
 */
router.post('/:id/moves', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { 
    card_id, 
    position_before, 
    position_after, 
    is_correct, 
    time_taken_seconds 
  } = req.body;
  
  // Validate required fields
  if (!card_id || is_correct === undefined) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: card_id, is_correct'
    });
  }
  
  // Validate card_id
  if (!Number.isInteger(card_id) || card_id < 1) {
    return res.status(400).json({
      success: false,
      error: 'card_id must be a positive integer'
    });
  }
  
  // Validate is_correct
  if (typeof is_correct !== 'boolean') {
    return res.status(400).json({
      success: false,
      error: 'is_correct must be a boolean value'
    });
  }
  
  // Validate positions
  if (position_before !== undefined && (!Number.isInteger(position_before) || position_before < 0)) {
    return res.status(400).json({
      success: false,
      error: 'position_before must be a non-negative integer'
    });
  }
  
  if (position_after !== undefined && (!Number.isInteger(position_after) || position_after < 0)) {
    return res.status(400).json({
      success: false,
      error: 'position_after must be a non-negative integer'
    });
  }
  
  // Validate time_taken_seconds
  if (time_taken_seconds !== undefined && (!Number.isInteger(time_taken_seconds) || time_taken_seconds < 0)) {
    return res.status(400).json({
      success: false,
      error: 'time_taken_seconds must be a non-negative integer'
    });
  }
  
  try {
    // Check if session exists and is active
    const session = await GameSession.getSessionById(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Game session not found'
      });
    }
    
    if (session.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'Cannot record moves for a completed or abandoned session'
      });
    }
    
    // Get current move number
    const moves = await GameSession.getSessionMoves(id);
    const move_number = moves.length + 1;
    
    const moveData = {
      session_id: id,
      card_id: parseInt(card_id),
      position_before: position_before !== undefined ? parseInt(position_before) : null,
      position_after: position_after !== undefined ? parseInt(position_after) : null,
      is_correct: Boolean(is_correct),
      move_number: move_number,
      time_taken_seconds: time_taken_seconds !== undefined ? parseInt(time_taken_seconds) : null
    };
    
    const move = await GameSession.recordMove(moveData);
    
    logger.info(`🎯 Move ${move_number} recorded for session ${id}`);
    
    res.status(201).json({
      success: true,
      message: 'Move recorded successfully',
      data: {
        session_id: move.session_id,
        card_id: move.card_id,
        move_number: move.move_number,
        is_correct: move.is_correct,
        position_before: move.position_before,
        position_after: move.position_after,
        time_taken_seconds: move.time_taken_seconds
      }
    });
  } catch (error) {
    logger.error('❌ Error recording move:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to record move'
    });
  }
}));

/**
 * GET /api/game-sessions/:id/moves
 * Get all moves for a session
 */
router.get('/:id/moves', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  try {
    // Check if session exists
    const session = await GameSession.getSessionById(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Game session not found'
      });
    }
    
    const moves = await GameSession.getSessionMoves(id);
    
    res.json({
      success: true,
      count: moves.length,
      data: moves
    });
  } catch (error) {
    logger.error('❌ Error fetching session moves:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch session moves'
    });
  }
}));

/**
 * PUT /api/game-sessions/:id/complete
 * Complete a game session
 */
router.put('/:id/complete', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { score } = req.body;
  
  // Validate score
  if (score !== undefined && (!Number.isInteger(score) || score < 0)) {
    return res.status(400).json({
      success: false,
      error: 'Score must be a non-negative integer'
    });
  }
  
  try {
    // Check if session exists and is active
    const session = await GameSession.getSessionById(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Game session not found'
      });
    }
    
    if (session.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'Session is already completed or abandoned'
      });
    }
    
    const additionalData = {
      score: score !== undefined ? parseInt(score) : session.score,
      end_time: new Date()
    };
    
    const updatedSession = await GameSession.updateSessionStatus(id, 'completed', additionalData);
    
    logger.info(`🏁 Game session ${id} completed with score: ${updatedSession.score}`);
    
    res.json({
      success: true,
      message: 'Game session completed successfully',
      data: {
        session_id: updatedSession.id,
        status: updatedSession.status,
        score: updatedSession.score,
        total_moves: updatedSession.total_moves,
        correct_moves: updatedSession.correct_moves,
        incorrect_moves: updatedSession.incorrect_moves,
        duration_seconds: updatedSession.duration_seconds,
        end_time: updatedSession.end_time
      }
    });
  } catch (error) {
    logger.error('❌ Error completing game session:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to complete game session'
    });
  }
}));

/**
 * PUT /api/game-sessions/:id/abandon
 * Abandon a game session
 */
router.put('/:id/abandon', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  try {
    // Check if session exists and is active
    const session = await GameSession.getSessionById(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Game session not found'
      });
    }
    
    if (session.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'Session is already completed or abandoned'
      });
    }
    
    const additionalData = {
      end_time: new Date()
    };
    
    const updatedSession = await GameSession.updateSessionStatus(id, 'abandoned', additionalData);
    
    logger.info(`🚫 Game session ${id} abandoned`);
    
    res.json({
      success: true,
      message: 'Game session abandoned successfully',
      data: {
        session_id: updatedSession.id,
        status: updatedSession.status,
        total_moves: updatedSession.total_moves,
        correct_moves: updatedSession.correct_moves,
        incorrect_moves: updatedSession.incorrect_moves,
        duration_seconds: updatedSession.duration_seconds,
        end_time: updatedSession.end_time
      }
    });
  } catch (error) {
    logger.error('❌ Error abandoning game session:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to abandon game session'
    });
  }
}));

/**
 * GET /api/game-sessions/:id/stats
 * Get detailed statistics for a game session
 */
router.get('/:id/stats', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  try {
    // Check if session exists
    const session = await GameSession.getSessionById(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Game session not found'
      });
    }
    
    const stats = await GameSession.getSessionStats(id);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('❌ Error fetching session stats:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch session statistics'
    });
  }
}));

module.exports = router; 