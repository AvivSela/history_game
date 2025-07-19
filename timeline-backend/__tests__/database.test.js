const { testConnection, query } = require('../config/database');
const dbUtils = require('../utils/database');

/**
 * Database integration tests
 * @description Tests database connection and utility functions
 */

describe('Database Integration', () => {
  beforeAll(async () => {
    // Test connection before running tests
    try {
      const isConnected = await testConnection();
      if (!isConnected) {
        throw new Error('Database connection failed - make sure PostgreSQL is running');
      }
    } catch (error) {
      console.error('Database connection error:', error.message);
      console.error('Make sure the test database is properly configured with:');
      console.error('- TEST_DB_HOST: localhost');
      console.error('- TEST_DB_PORT: 5433');
      console.error('- TEST_DB_NAME: timeline_game_test');
      console.error('- TEST_DB_USER: postgres');
      console.error('- TEST_DB_PASSWORD: password');
      throw error;
    }
  });

  describe('Connection', () => {
    test('should connect to database successfully', async () => {
      const isConnected = await testConnection();
      expect(isConnected).toBe(true);
    });

    test('should execute a simple query', async () => {
      const result = await query('SELECT 1 as test');
      expect(result.rows[0].test).toBe(1);
    });
  });

  describe('Database Utilities', () => {
    test('should get all cards', async () => {
      const cards = await dbUtils.getAllCards();
      expect(Array.isArray(cards)).toBe(true);
      expect(cards.length).toBeGreaterThan(0);
      
      // Check card structure
      if (cards.length > 0) {
        const card = cards[0];
        expect(card).toHaveProperty('id');
        expect(card).toHaveProperty('title');
        expect(card).toHaveProperty('dateOccurred');
        expect(card).toHaveProperty('category');
        expect(card).toHaveProperty('difficulty');
        expect(card).toHaveProperty('description');
      }
    });

    test('should get random cards', async () => {
      const count = 3;
      const cards = await dbUtils.getRandomCards(count);
      expect(Array.isArray(cards)).toBe(true);
      expect(cards.length).toBe(count);
    });

    test('should get categories', async () => {
      const categories = await dbUtils.getCategories();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
      
      // Check that categories are strings
      categories.forEach(category => {
        expect(typeof category).toBe('string');
      });
    });

    test('should get cards by category', async () => {
      const categories = await dbUtils.getCategories();
      if (categories.length > 0) {
        const category = categories[0];
        const cards = await dbUtils.getCardsByCategory(category);
        expect(Array.isArray(cards)).toBe(true);
        
        // All cards should have the same category
        cards.forEach(card => {
          expect(card.category).toBe(category);
        });
      }
    });

    test('should get card count', async () => {
      const count = await dbUtils.getCardCount();
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThan(0);
    });

    test('should get database statistics', async () => {
      const stats = await dbUtils.getDatabaseStats();
      expect(stats).toHaveProperty('totalCards');
      expect(stats).toHaveProperty('categories');
      expect(stats).toHaveProperty('categoryCounts');
      expect(stats).toHaveProperty('difficultyDistribution');
      
      expect(typeof stats.totalCards).toBe('number');
      expect(Array.isArray(stats.categories)).toBe(true);
      expect(typeof stats.categoryCounts).toBe('object');
      expect(typeof stats.difficultyDistribution).toBe('object');
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid queries gracefully', async () => {
      await expect(query('SELECT * FROM non_existent_table')).rejects.toThrow();
    });

    test('should handle invalid card ID', async () => {
      const card = await dbUtils.getCardById(99999);
      expect(card).toBeNull();
    });

    test('should handle invalid category', async () => {
      const cards = await dbUtils.getCardsByCategory('NonExistentCategory');
      expect(Array.isArray(cards)).toBe(true);
      expect(cards.length).toBe(0);
    });
  });

  describe('Data Integrity', () => {
    test('should have valid card data', async () => {
      const cards = await dbUtils.getAllCards();
      
      cards.forEach(card => {
        // Check required fields
        expect(card.title).toBeTruthy();
        expect(card.dateOccurred).toBeTruthy();
        expect(card.category).toBeTruthy();
        expect(card.difficulty).toBeGreaterThanOrEqual(1);
        expect(card.difficulty).toBeLessThanOrEqual(5);
        
        // Check date format - verify it's a valid date
        const date = new Date(card.dateOccurred);
        expect(isNaN(date.getTime())).toBe(false);
        expect(date instanceof Date).toBe(true);
      });
    });

    test('should have consistent category data', async () => {
      const categories = await dbUtils.getCategories();
      const cards = await dbUtils.getAllCards();
      
      // All cards should have categories that exist in the categories list
      const categorySet = new Set(categories);
      cards.forEach(card => {
        expect(categorySet.has(card.category)).toBe(true);
      });
    });
  });
}); 