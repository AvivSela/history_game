#!/usr/bin/env node

/**
 * Database Migration Script
 * @description Sets up the database schema and sample data for Timeline Game
 * @version 2.0.0 - Added migration versioning and validation
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { query, testConnection } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Calculate SHA256 checksum of a file
 * @param {string} filePath - Path to the file
 * @returns {Promise<string>} SHA256 checksum
 */
async function calculateChecksum(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Check if migration has already been applied
 * @param {string} migrationName - Name of the migration file
 * @returns {Promise<boolean>} True if migration exists
 */
async function isMigrationApplied(migrationName) {
  try {
    const result = await query(
      'SELECT COUNT(*) as count FROM migrations WHERE name = $1',
      [migrationName]
    );
    return result.rows[0].count > 0;
  } catch (error) {
    // If migrations table doesn't exist, migration hasn't been applied
    if (error.message.includes('relation "migrations" does not exist')) {
      return false;
    }
    throw error;
  }
}

/**
 * Record migration execution
 * @param {string} migrationName - Name of the migration file
 * @param {string} checksum - SHA256 checksum of the migration
 * @param {number} executionTime - Execution time in milliseconds
 * @returns {Promise<void>}
 */
async function recordMigration(migrationName, checksum, executionTime) {
  await query(
    'INSERT INTO migrations (name, checksum, execution_time_ms) VALUES ($1, $2, $3)',
    [migrationName, checksum, executionTime]
  );
}

/**
 * Read and execute SQL migration file
 * @param {string} filePath - Path to the SQL file
 * @returns {Promise<void>}
 */
async function executeMigration(filePath) {
  const migrationName = path.basename(filePath);
  const startTime = Date.now();
  
  try {
    logger.info(`📝 Executing migration: ${migrationName}`);
    
    // Check if migration already applied
    const isApplied = await isMigrationApplied(migrationName);
    if (isApplied) {
      logger.info(`⏭️  Migration already applied: ${migrationName}`);
      return;
    }
    
    // Calculate checksum
    const checksum = await calculateChecksum(filePath);
    
    // Read and execute SQL
    const sql = await fs.readFile(filePath, 'utf8');
    await query(sql);
    
    // Record migration
    const executionTime = Date.now() - startTime;
    await recordMigration(migrationName, checksum, executionTime);
    
    logger.info(`✅ Migration completed: ${migrationName} (${executionTime}ms)`);
  } catch (error) {
    const executionTime = Date.now() - startTime;
    logger.error(`❌ Migration failed: ${migrationName} (${executionTime}ms)`, error.message);
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
    
    // List of migrations in order (including tracking table)
    const migrations = [
      '../migrations/000_migration_tracking.sql',
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
    
    // Drop existing tables (including migrations table)
    await query('DROP TABLE IF EXISTS migrations CASCADE');
    await query('DROP TABLE IF EXISTS cards CASCADE');
    await query('DROP TABLE IF EXISTS game_sessions CASCADE');
    await query('DROP TABLE IF EXISTS game_moves CASCADE');
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
      // Check if migrations table exists
      const migrationsTableResult = await query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'migrations'
        ) as table_exists
      `);
      
      if (migrationsTableResult.rows[0].table_exists) {
        // Show applied migrations
        const appliedMigrations = await query(`
          SELECT name, executed_at, execution_time_ms 
          FROM migrations 
          ORDER BY executed_at
        `);
        
        logger.info(`📋 Applied migrations (${appliedMigrations.rows.length}):`);
        for (const migration of appliedMigrations.rows) {
          logger.info(`  ✅ ${migration.name} - ${migration.executed_at} (${migration.execution_time_ms}ms)`);
        }
      } else {
        logger.info('📋 No migration tracking table found');
      }
      
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

/**
 * Validate migration integrity
 * @returns {Promise<void>}
 */
async function validateMigrations() {
  try {
    logger.info('🔍 Validating migration integrity...');
    
    const migrations = [
      '../migrations/000_migration_tracking.sql',
      '../migrations/001_initial_schema.sql',
      '../migrations/002_sample_data.sql',
      '../migrations/003_game_sessions.sql'
    ];
    
    for (const migration of migrations) {
      const filePath = path.join(__dirname, migration);
      const migrationName = path.basename(filePath);
      
      // Check if file exists
      try {
        await fs.access(filePath);
      } catch (error) {
        logger.error(`❌ Migration file missing: ${migrationName}`);
        continue;
      }
      
      // Check if applied
      const isApplied = await isMigrationApplied(migrationName);
      if (isApplied) {
        // Validate checksum
        const currentChecksum = await calculateChecksum(filePath);
        const storedChecksum = await query(
          'SELECT checksum FROM migrations WHERE name = $1',
          [migrationName]
        );
        
        if (storedChecksum.rows[0].checksum !== currentChecksum) {
          logger.error(`❌ Checksum mismatch for: ${migrationName}`);
        } else {
          logger.info(`✅ ${migrationName} - Valid`);
        }
      } else {
        logger.info(`⏳ ${migrationName} - Not applied`);
      }
    }
    
  } catch (error) {
    logger.error('❌ Migration validation failed:', error.message);
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
    case 'validate':
      await validateMigrations();
      break;
    default:
      logger.info('📖 Database Migration Script v2.0.0');
      logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      logger.info('Usage: node scripts/migrate.js <command>');
      logger.info('');
      logger.info('Commands:');
      logger.info('  migrate  - Run all pending migrations');
      logger.info('  reset    - Reset database (drop and recreate)');
      logger.info('  status   - Show database status');
      logger.info('  validate - Validate migration integrity');
      logger.info('');
      logger.info('Examples:');
      logger.info('  node scripts/migrate.js migrate');
      logger.info('  node scripts/migrate.js reset');
      logger.info('  node scripts/migrate.js status');
      logger.info('  node scripts/migrate.js validate');
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
  showStatus,
  validateMigrations
}; 