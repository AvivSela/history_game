#!/usr/bin/env node

/**
 * Database Connection Test Script
 * @description Simple script to test database connection and configuration
 */

const { testConnection, config } = require('../config/database');
const logger = require('../utils/logger');

async function main() {
  logger.info('🧪 Testing database connection...');
  logger.info(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔧 Database: ${config.database}`);
  logger.info(`🔧 Host: ${config.host}:${config.port}`);
  logger.info(`🔧 User: ${config.user}`);
  
  try {
    const isConnected = await testConnection();
    if (isConnected) {
      logger.info('✅ Database connection test successful!');
      process.exit(0);
    } else {
      logger.error('❌ Database connection test failed!');
      process.exit(1);
    }
  } catch (error) {
    logger.error('❌ Database connection test error:', error.message);
    process.exit(1);
  }
}

main(); 