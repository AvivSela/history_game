/**
 * Prisma Test Utilities
 * @description Utilities for testing with Prisma ORM
 * @version 1.0.0
 */

// Prisma test utilities for integration testing
// ✅ Connection issue resolved - Prisma client is now working

class PrismaTestUtils {
  constructor() {
    this.prisma = null;
  }

  /**
   * Initialize Prisma client for testing
   * @param {string} databaseUrl - Test database URL
   */
  async initialize(databaseUrl = process.env.TEST_DATABASE_URL) {
    try {
      const { PrismaClient } = require('@prisma/client');
      this.prisma = new PrismaClient({
        datasources: {
          db: {
            url: databaseUrl
          }
        }
      });
      await this.prisma.$connect();
      console.log('✅ Prisma client initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Prisma client:', error.message);
      throw error;
    }
  }

  /**
   * Clean up test data
   * @description Removes all test data from the database
   */
  async cleanup() {
    if (!this.prisma) {
      console.log('⚠️ Prisma cleanup skipped - client not initialized');
      return;
    }

    try {
      // Clean up in reverse order of dependencies
      await this.prisma.game_moves.deleteMany();
      await this.prisma.game_sessions.deleteMany();
      await this.prisma.player_statistics.deleteMany();
      await this.prisma.category_statistics.deleteMany();
      await this.prisma.difficulty_statistics.deleteMany();
      await this.prisma.daily_statistics.deleteMany();
      await this.prisma.weekly_statistics.deleteMany();
      await this.prisma.cards.deleteMany();
      
      console.log('✅ Test data cleaned up');
    } catch (error) {
      console.error('❌ Error during cleanup:', error.message);
      throw error;
    }
  }

  /**
   * Seed test data
   * @description Populates the database with test data
   */
  async seed() {
    if (!this.prisma) {
      console.log('⚠️ Prisma seeding skipped - client not initialized');
      return;
    }

    try {
      // Seed cards
      const cards = await this.prisma.cards.createMany({
        data: [
          {
            title: 'Test Event 1',
            date_occurred: new Date('2020-01-01'),
            category: 'History',
            difficulty: 3,
            description: 'Test description 1'
          },
          {
            title: 'Test Event 2',
            date_occurred: new Date('2020-02-01'),
            category: 'Technology',
            difficulty: 4,
            description: 'Test description 2'
          }
        ]
      });

      console.log(`✅ Seeded ${cards.count} cards`);
    } catch (error) {
      console.error('❌ Error during seeding:', error.message);
      throw error;
    }
  }

  /**
   * Disconnect from database
   * @description Gracefully closes the Prisma client connection
   */
  async disconnect() {
    if (this.prisma) {
      try {
        await this.prisma.$disconnect();
        console.log('✅ Prisma client disconnected');
      } catch (error) {
        console.error('❌ Error disconnecting Prisma client:', error.message);
      }
    }
  }

  /**
   * Get test database URL
   * @returns {string} Test database URL
   */
  getTestDatabaseUrl() {
    return process.env.TEST_DATABASE_URL || 
           process.env.DATABASE_URL?.replace('timeline_game', 'timeline_game_test') ||
           'postgresql://postgres:password@localhost:5433/timeline_game_test';
  }

  /**
   * Check if Prisma is available
   * @returns {boolean} True if Prisma client is working
   */
  isAvailable() {
    return this.prisma !== null;
  }

  /**
   * Test Prisma connection
   * @returns {Promise<boolean>} True if connection is successful
   */
  async testConnection() {
    if (!this.prisma) {
      return false;
    }
    
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('❌ Prisma connection test failed:', error.message);
      return false;
    }
  }
}

module.exports = PrismaTestUtils; 