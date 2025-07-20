/**
 * Global teardown file for Jest
 * Ensures database pool is closed only once after all tests complete
 */

module.exports = async () => {
  try {
    const { closePool } = require('../config/database');
    await closePool();
    console.log('✅ Global teardown: Database pool closed successfully');
  } catch (error) {
    console.error('❌ Global teardown: Error closing database pool:', error.message);
  }
}; 