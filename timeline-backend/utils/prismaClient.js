/**
 * Prisma Client Singleton
 * @description Manages a single Prisma client instance to prevent connection pool exhaustion
 * @version 1.0.0
 */

const { PrismaClient } = require('@prisma/client');
const logger = require('./logger');

// Global Prisma client instance
let prismaClient = null;

/**
 * Get the singleton Prisma client instance
 * @returns {PrismaClient} Prisma client instance
 */
function getPrismaClient() {
  if (!prismaClient) {
    logger.debug('🔧 Initializing Prisma client...');
    
    prismaClient = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      },
      // Configure connection pool for better performance
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

    // Handle connection events
    prismaClient.$on('beforeExit', async () => {
      logger.debug('🔌 Prisma client shutting down...');
    });

    prismaClient.$on('query', (e) => {
      if (process.env.NODE_ENV === 'development') {
        logger.debug(`🔍 Query: ${e.query}`);
        logger.debug(`⏱️ Duration: ${e.duration}ms`);
      }
    });

    logger.info('✅ Prisma client initialized');
  }

  return prismaClient;
}

/**
 * Disconnect the Prisma client
 * @returns {Promise<void>}
 */
async function disconnectPrismaClient() {
  if (prismaClient) {
    logger.debug('🔌 Disconnecting Prisma client...');
    await prismaClient.$disconnect();
    prismaClient = null;
    logger.info('✅ Prisma client disconnected');
  }
}

/**
 * Reset the Prisma client (useful for testing)
 * @returns {Promise<void>}
 */
async function resetPrismaClient() {
  if (prismaClient) {
    await disconnectPrismaClient();
  }
  prismaClient = null;
}

module.exports = {
  getPrismaClient,
  disconnectPrismaClient,
  resetPrismaClient
}; 