/**
 * Test setup file for Timeline Backend API
 * Configures the testing environment and global test utilities
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = 5001; // Use different port for testing

// Global test timeout
jest.setTimeout(process.env.JEST_TIMEOUT ? parseInt(process.env.JEST_TIMEOUT) : 10000);

// Global test utilities
global.testUtils = {
  /**
   * Generate a random string for testing
   * @param {number} length - Length of the string
   * @returns {string} Random string
   */
  randomString: (length = 10) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  /**
   * Generate a random date for testing
   * @param {number} startYear - Start year (default: 1900)
   * @param {number} endYear - End year (default: 2020)
   * @returns {string} Random date in YYYY-MM-DD format
   */
  randomDate: (startYear = 1900, endYear = 2020) => {
    const year = Math.floor(Math.random() * (endYear - startYear + 1)) + startYear;
    const month = Math.floor(Math.random() * 12) + 1;
    const day = Math.floor(Math.random() * 28) + 1; // Using 28 to avoid month/day issues
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  },

  /**
   * Generate a random event object for testing
   * @returns {Object} Random event object
   */
  randomEvent: () => ({
    id: Math.floor(Math.random() * 1000) + 1,
    title: `Test Event ${Math.random().toString(36).substring(7)}`,
    dateOccurred: global.testUtils.randomDate(),
    category: ['History', 'Science', 'Technology', 'Space'][Math.floor(Math.random() * 4)],
    difficulty: Math.floor(Math.random() * 3) + 1,
    description: `Test description for ${Math.random().toString(36).substring(7)}`
  }),

  /**
   * Wait for a specified amount of time
   * @param {number} ms - Milliseconds to wait
   * @returns {Promise} Promise that resolves after the specified time
   */
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms))
};

// Console logging for tests
const originalLog = console.log;
const originalError = console.error;

// Suppress console output during tests unless explicitly needed
beforeAll(() => {
  // Only suppress console output if not in test environment
  if (process.env.NODE_ENV === 'test') {
    console.log = jest.fn();
    console.error = jest.fn();
  }
});

// Restore console output after tests
afterAll(() => {
  console.log = originalLog;
  console.error = originalError;
});

// Note: Database pool cleanup is now handled by globalTeardown.js
// to prevent premature closure during parallel test execution

// Global test matchers - simplified approach
global.expectSuccessProperty = (response) => {
  expect(response.body).toHaveProperty('success');
  expect(typeof response.body.success).toBe('boolean');
};

global.expectDataProperty = (response) => {
  expect(response.body).toHaveProperty('data');
};

// Database connection check for tests that need it
global.checkDatabaseConnection = async () => {
  try {
    const { testConnection } = require('../config/database');
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Database connection failed - make sure PostgreSQL is running and configured correctly');
    }
    return true;
  } catch (error) {
    console.error('Database connection error:', error.message);
    throw error;
  }
};

// Database schema validation for tests that need it
global.validateDatabaseSchema = async () => {
  try {
    const { query } = require('../config/database');
    const requiredTables = ['cards', 'game_sessions', 'game_moves'];
    
    for (const table of requiredTables) {
      const result = await query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = $1
        ) as table_exists
      `, [table]);
      
      if (!result.rows[0].table_exists) {
        throw new Error(`Required table '${table}' does not exist. Run migrations first with: node scripts/migrate.js migrate`);
      }
    }
    
    console.log('✅ Database schema validation passed');
    return true;
  } catch (error) {
    console.error('❌ Database schema validation failed:', error.message);
    throw error;
  }
}; 