/**
 * Check Test Database Schema
 * @description Verify test database has correct tables and data
 */

const { query } = require('../config/database');
const logger = require('../utils/logger');

async function checkTestDatabase() {
  try {
    logger.info('🔍 Checking test database schema...');
    
    // Check if game_sessions table exists
    const sessionsTable = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'game_sessions'
      );
    `);
    
    logger.info(`📋 game_sessions table exists: ${sessionsTable.rows[0].exists}`);
    
    // Check if game_moves table exists
    const movesTable = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'game_moves'
      );
    `);
    
    logger.info(`📋 game_moves table exists: ${movesTable.rows[0].exists}`);
    
    // Check if cards table exists and has data
    const cardsTable = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'cards'
      );
    `);
    
    logger.info(`📋 cards table exists: ${cardsTable.rows[0].exists}`);
    
    if (cardsTable.rows[0].exists) {
      const cardCount = await query('SELECT COUNT(*) as count FROM cards');
      logger.info(`📊 Cards count: ${cardCount.rows[0].count}`);
      
      if (cardCount.rows[0].count > 0) {
        const sampleCard = await query('SELECT id, title FROM cards LIMIT 1');
        logger.info(`📄 Sample card: ${sampleCard.rows[0].id} - ${sampleCard.rows[0].title}`);
      }
    }
    
    // Check game_sessions structure if it exists
    if (sessionsTable.rows[0].exists) {
      const sessionsCount = await query('SELECT COUNT(*) as count FROM game_sessions');
      logger.info(`📊 Game sessions count: ${sessionsCount.rows[0].count}`);
      
      const sessionsStructure = await query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'game_sessions'
        ORDER BY ordinal_position;
      `);
      
      logger.info('📋 game_sessions table structure:');
      sessionsStructure.rows.forEach(col => {
        logger.info(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }
    
    // Check game_moves structure if it exists
    if (movesTable.rows[0].exists) {
      const movesCount = await query('SELECT COUNT(*) as count FROM game_moves');
      logger.info(`📊 Game moves count: ${movesCount.rows[0].count}`);
      
      const movesStructure = await query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'game_moves'
        ORDER BY ordinal_position;
      `);
      
      logger.info('📋 game_moves table structure:');
      movesStructure.rows.forEach(col => {
        logger.info(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }
    
    logger.info('✅ Test database check completed');
    
  } catch (error) {
    logger.error('❌ Error checking test database:', error.message);
    throw error;
  }
}

// Run the check
checkTestDatabase()
  .then(() => {
    logger.info('✅ Database check successful');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('❌ Database check failed:', error.message);
    process.exit(1);
  }); 