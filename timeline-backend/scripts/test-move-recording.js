/**
 * Test Move Recording
 * @description Manually test move recording to debug the issue
 */

const { query } = require('../config/database');
const GameSession = require('../models/GameSession');
const logger = require('../utils/logger');

async function testMoveRecording() {
  try {
    logger.info('🧪 Testing move recording...');
    
    // First, create a test session
    const sessionData = {
      player_name: 'TestPlayer',
      difficulty_level: 1,
      card_count: 3,
      categories: ['History']
    };
    
    logger.info('📝 Creating test session...');
    const session = await GameSession.createSession(sessionData);
    logger.info(`✅ Session created: ${session.id}`);
    
    // Get a valid card ID
    const cardResult = await query('SELECT id FROM cards LIMIT 1');
    const cardId = cardResult.rows[0].id;
    logger.info(`📄 Using card ID: ${cardId}`);
    
    // Try to record a move
    const moveData = {
      session_id: session.id,
      card_id: cardId,
      position_before: 0,
      position_after: 1,
      is_correct: true,
      move_number: 1,
      time_taken_seconds: 5
    };
    
    logger.info('🎯 Recording move...');
    const move = await GameSession.recordMove(moveData);
    logger.info(`✅ Move recorded: ${move.id}`);
    
    // Check if the move was actually saved
    const moves = await GameSession.getSessionMoves(session.id);
    logger.info(`📊 Total moves for session: ${moves.length}`);
    
    // Clean up
    await query('DELETE FROM game_sessions WHERE id = $1', [session.id]);
    logger.info('🧹 Cleanup completed');
    
  } catch (error) {
    logger.error('❌ Error in move recording test:', error.message);
    logger.error('Stack trace:', error.stack);
    throw error;
  }
}

// Run the test
testMoveRecording()
  .then(() => {
    logger.info('✅ Move recording test successful');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('❌ Move recording test failed:', error.message);
    process.exit(1);
  }); 