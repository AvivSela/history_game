/**
 * Global teardown file for Jest
 * Cleans up resources after all tests complete
 */

const { disconnectPrismaClient } = require('../utils/prismaClient');

module.exports = async () => {
  try {
    console.log('🧹 Cleaning up test resources...');
    
    // Disconnect Prisma client
    await disconnectPrismaClient();
    
    console.log('✅ Test cleanup completed');
  } catch (error) {
    console.error('❌ Test cleanup failed:', error.message);
    // Don't throw error during teardown to avoid masking test failures
  }
}; 