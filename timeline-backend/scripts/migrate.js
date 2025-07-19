#!/usr/bin/env node

/**
 * Database Migration Script
 * @description Sets up the database schema and sample data for Timeline Game
 */

const fs = require('fs').promises;
const path = require('path');
const { query, testConnection } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Read and execute SQL migration file
 * @param {string} filePath - Path to the SQL file
 * @returns {Promise<void>}
 */
async function executeMigration(filePath) {
  try {
    logger.info(`📝 Executing migration: ${path.basename(filePath)}`);
    
    const sql = await fs.readFile(filePath, 'utf8');
    await query(sql);
    
    logger.info(`✅ Migration completed: ${path.basename(filePath)}`);
  } catch (error) {
    logger.error(`❌ Migration failed: ${path.basename(filePath)}`, error.message);
    throw error;
  }
}

/**
 * Run all migrations in order
 * @returns {Promise<void>}
 */
async function runMigrations() {
  try {
    logger.info('🔄 Starting database migrations...');
    
    // Test database connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Database connection failed');
    }
    
    // List of migrations in order
    const migrations = [
      '../migrations/001_initial_schema.sql',
      '../migrations/002_sample_data.sql',
      '../migrations/003_game_sessions.sql'
    ];
    
    // Execute each migration
    for (const migration of migrations) {
      const filePath = path.join(__dirname, migration);
      await executeMigration(filePath);
    }
    
    logger.info('🎉 All migrations completed successfully!');
    
    // Show database stats
    const stats = await query('SELECT COUNT(*) as total_cards FROM cards');
    logger.info(`📊 Database now contains ${stats.rows[0].total_cards} cards`);
    
  } catch (error) {
    logger.error('❌ Migration process failed:', error.message);
    process.exit(1);
  }
}

/**
 * Reset database (drop and recreate)
 * @returns {Promise<void>}
 */
async function resetDatabase() {
  try {
    logger.info('🔄 Resetting database...');
    
    // Drop existing tables
    await query('DROP TABLE IF EXISTS cards CASCADE');
    logger.info('🗑️  Dropped existing tables');
    
    // Run migrations
    await runMigrations();
    
  } catch (error) {
    logger.error('❌ Database reset failed:', error.message);
    process.exit(1);
  }
}

/**
 * Show database status
 * @returns {Promise<void>}
 */
async function showStatus() {
  try {
    logger.info('📊 Database Status:');
    
    // Test connection
    const isConnected = await testConnection();
    logger.info(`🔗 Connection: ${isConnected ? '✅ Connected' : '❌ Disconnected'}`);
    
    if (isConnected) {
          // Check if tables exist
    const tables = ['cards', 'game_sessions', 'game_moves'];
    
    for (const table of tables) {
      const tableResult = await query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = $1
        ) as table_exists
      `, [table]);
      
      const tableExists = tableResult.rows[0].table_exists;
      logger.info(`📋 ${table.charAt(0).toUpperCase() + table.slice(1)} table: ${tableExists ? '✅ Exists' : '❌ Missing'}`);
    }
    
    // Get cards table details if it exists
    const cardsTableResult = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'cards'
      ) as table_exists
    `);
    
    if (cardsTableResult.rows[0].table_exists) {
      // Get card count
      const countResult = await query('SELECT COUNT(*) as count FROM cards');
      const count = countResult.rows[0].count;
      logger.info(`🎴 Total cards: ${count}`);
      
      // Get categories
      const categoriesResult = await query('SELECT DISTINCT category FROM cards ORDER BY category');
      const categories = categoriesResult.rows.map(row => row.category);
      logger.info(`📁 Categories: ${categories.join(', ')}`);
    }
    
    // Get game sessions stats if table exists
    const sessionsTableResult = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'game_sessions'
      ) as table_exists
    `);
    
    if (sessionsTableResult.rows[0].table_exists) {
      const sessionsCountResult = await query('SELECT COUNT(*) as count FROM game_sessions');
      const sessionsCount = sessionsCountResult.rows[0].count;
      logger.info(`🎮 Total game sessions: ${sessionsCount}`);
      
      const movesCountResult = await query('SELECT COUNT(*) as count FROM game_moves');
      const movesCount = movesCountResult.rows[0].count;
      logger.info(`🎯 Total game moves: ${movesCount}`);
    }
    }
    
  } catch (error) {
    logger.error('❌ Error checking status:', error.message);
  }
}

// Main execution
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'migrate':
      await runMigrations();
      break;
    case 'reset':
      await resetDatabase();
      break;
    case 'status':
      await showStatus();
      break;
    default:
      logger.info('📖 Database Migration Script');
      logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      logger.info('Usage: node scripts/migrate.js <command>');
      logger.info('');
      logger.info('Commands:');
      logger.info('  migrate  - Run all pending migrations');
      logger.info('  reset    - Reset database (drop and recreate)');
      logger.info('  status   - Show database status');
      logger.info('');
      logger.info('Examples:');
      logger.info('  node scripts/migrate.js migrate');
      logger.info('  node scripts/migrate.js reset');
      logger.info('  node scripts/migrate.js status');
      break;
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    logger.error('❌ Script failed:', error.message);
    process.exit(1);
  });
}

module.exports = {
  runMigrations,
  resetDatabase,
  showStatus
}; 