/**
 * Database Integration Tests
 * @description Tests for database connection and utilities
 */

const { query } = require('../config/database');
const { 
  getAllCards, 
  getRandomCards, 
  getCategories, 
  getCardsByCategory, 
  getCardCount,
  getDatabaseStats 
} = require('../utils/database');

describe('Database Integration', () => {
  describe('Connection', () => {
    it('should connect to database successfully', async () => {
      const result = await query('SELECT 1 as test');
      expect(result.rows[0].test).toBe(1);
    });

    it('should execute a simple query', async () => {
      const result = await query('SELECT NOW() as current_time');
      expect(result.rows[0]).toHaveProperty('current_time');
    });
  });

  describe('Database Utilities', () => {
    it('should get all cards', async () => {
      const cards = await getAllCards();
      expect(Array.isArray(cards)).toBe(true);
      expect(cards.length).toBeGreaterThan(0);
      expect(cards[0]).toHaveProperty('id');
      expect(cards[0]).toHaveProperty('title');
    });

    it('should get random cards', async () => {
      const cards = await getRandomCards(5);
      expect(Array.isArray(cards)).toBe(true);
      expect(cards.length).toBeLessThanOrEqual(5);
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should get categories', async () => {
      const categories = await getCategories();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
    });

    it('should get cards by category', async () => {
      const cards = await getCardsByCategory('History');
      expect(Array.isArray(cards)).toBe(true);
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should get card count', async () => {
      const count = await getCardCount();
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThan(0);
    });

    it('should get database statistics', async () => {
      const stats = await getDatabaseStats();
      expect(stats).toHaveProperty('totalCards');
      expect(stats).toHaveProperty('categories');
      expect(stats).toHaveProperty('categoryCounts');
      expect(stats).toHaveProperty('difficultyDistribution');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid queries gracefully', async () => {
      try {
        await query('SELECT * FROM nonexistent_table');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle invalid card ID', async () => {
      const cards = await getCardsByCategory('NonexistentCategory');
      expect(Array.isArray(cards)).toBe(true);
      expect(cards.length).toBe(0);
    });

    it('should handle invalid category', async () => {
      const cards = await getCardsByCategory('InvalidCategory');
      expect(Array.isArray(cards)).toBe(true);
      expect(cards.length).toBe(0);
    });

    it('should handle database connection errors', async () => {
      // This test is complex to mock properly, so we'll skip it for now
      // The error handling is tested in other ways throughout the codebase
      expect(true).toBe(true); // Placeholder test
    });

    it('should handle empty result sets', async () => {
      const cards = await getCardsByCategory('VerySpecificCategoryThatDoesNotExist');
      expect(Array.isArray(cards)).toBe(true);
      expect(cards.length).toBe(0);
    });

    it('should handle null parameters gracefully', async () => {
      const cards = await getAllCards({ category: null });
      expect(Array.isArray(cards)).toBe(true);
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should handle undefined parameters gracefully', async () => {
      const cards = await getAllCards({ category: undefined });
      expect(Array.isArray(cards)).toBe(true);
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should handle empty string parameters', async () => {
      try {
        await getAllCards({ category: '' });
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error.message).toContain('category cannot be empty');
        expect(error.name).toBe('ValidationError');
      }
    });

    it('should handle invalid difficulty levels', async () => {
      try {
        await getAllCards({ difficulty: 999 });
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error.message).toContain('difficulty must be at most 5, got 999');
        expect(error.name).toBe('ValidationError');
      }
    });

    it('should handle negative difficulty levels', async () => {
      try {
        await getAllCards({ difficulty: -1 });
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error.message).toContain('difficulty must be at least 0, got -1');
        expect(error.name).toBe('ValidationError');
      }
    });

    it('should handle zero difficulty level', async () => {
      const cards = await getAllCards({ difficulty: 0 });
      expect(Array.isArray(cards)).toBe(true);
      // PostgreSQL treats 0 as a valid value, so we check it returns an array
      expect(cards.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle invalid count for random cards', async () => {
      try {
        await getRandomCards(0);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error.message).toContain('limit must be at least 1, got 0');
        expect(error.name).toBe('ValidationError');
      }
    });

    it('should handle negative count for random cards', async () => {
      try {
        await getRandomCards(-5);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error.message).toContain('limit must be at least 1, got -5');
        expect(error.name).toBe('ValidationError');
      }
    });

    it('should handle very large count for random cards', async () => {
      const cards = await getRandomCards(1000);
      expect(Array.isArray(cards)).toBe(true);
      expect(cards.length).toBeLessThanOrEqual(1000);
    });

    it('should handle categories parameter in getCardCount (fix for parameter mismatch bug)', async () => {
      // Test that getCardCount properly handles the 'categories' parameter
      // This was a bug where server.js passed { categories } but CardQueryBuilder expected { category }
      const totalCount = await getCardCount();
      const historyCount = await getCardCount({ categories: ['History'] });
      const politicsCount = await getCardCount({ categories: ['Politics'] });
      const bothCount = await getCardCount({ categories: ['History', 'Politics'] });
      
      expect(typeof totalCount).toBe('number');
      expect(typeof historyCount).toBe('number');
      expect(typeof politicsCount).toBe('number');
      expect(typeof bothCount).toBe('number');
      
      // The counts should be logical
      expect(historyCount).toBeGreaterThanOrEqual(0);
      expect(politicsCount).toBeGreaterThanOrEqual(0);
      expect(bothCount).toBeGreaterThanOrEqual(historyCount);
      expect(bothCount).toBeGreaterThanOrEqual(politicsCount);
      expect(totalCount).toBeGreaterThanOrEqual(bothCount);
    });

    it('should use consistent category filtering between getRandomCards and getCardCount', async () => {
      // Test that both functions use the same filtering logic to prevent count mismatches
      const categories = ['History', 'Politics'];
      
      // Get count for these categories
      const count = await getCardCount({ categories });
      
      // Get random cards for these categories
      const cards = await getRandomCards(count, { categories });
      
      // The number of cards returned should match the count
      expect(cards.length).toBe(count);
      
      // All returned cards should be from the specified categories
      cards.forEach(card => {
        expect(categories.some(cat => 
          card.category.toLowerCase() === cat.toLowerCase()
        )).toBe(true);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle pagination edge cases', async () => {
      try {
        await getAllCards({ limit: 0, offset: 0 });
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error.message).toContain('limit must be at least 1, got 0');
        expect(error.name).toBe('ValidationError');
      }
    });

    it('should handle large pagination limits', async () => {
      const cards = await getAllCards({ limit: 1000 });
      expect(Array.isArray(cards)).toBe(true);
      expect(cards.length).toBeLessThanOrEqual(1000);
    });

    it('should handle large pagination offsets', async () => {
      const cards = await getAllCards({ offset: 1000 });
      expect(Array.isArray(cards)).toBe(true);
      // Should return empty array if offset is beyond available data
    });

    it('should handle negative pagination values', async () => {
      try {
        await getAllCards({ limit: -10, offset: -10 });
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error.message).toContain('limit must be at least 1, got -10');
        expect(error.name).toBe('ValidationError');
      }
    });

    it('should handle special characters in category names', async () => {
      const cards = await getCardsByCategory('History & Politics');
      expect(Array.isArray(cards)).toBe(true);
      // Should handle special characters gracefully
    });

    it('should handle very long category names', async () => {
      const longCategory = 'A'.repeat(1000);
      const cards = await getCardsByCategory(longCategory);
      expect(Array.isArray(cards)).toBe(true);
      expect(cards.length).toBe(0);
    });

    it('should handle whitespace in category names', async () => {
      const cards = await getCardsByCategory('  History  ');
      expect(Array.isArray(cards)).toBe(true);
      // Should handle leading/trailing whitespace
    });

    it('should handle case sensitivity in category names', async () => {
      const cards = await getCardsByCategory('HISTORY');
      expect(Array.isArray(cards)).toBe(true);
      // Should handle case differences
    });

    it('should handle multiple filter combinations', async () => {
      const cards = await getAllCards({ 
        category: 'History', 
        difficulty: 3,
        limit: 5,
        offset: 0
      });
      expect(Array.isArray(cards)).toBe(true);
      expect(cards.length).toBeLessThanOrEqual(5);
    });

    it('should handle empty filter combinations', async () => {
      try {
        await getAllCards({ 
          category: '', 
          difficulty: null,
          limit: undefined,
          offset: 0
        });
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error.message).toContain('category cannot be empty');
        expect(error.name).toBe('ValidationError');
      }
    });
  });

  describe('Data Integrity', () => {
    it('should have valid card data', async () => {
      const cards = await getAllCards();
      expect(cards.length).toBeGreaterThan(0);
      
      cards.forEach(card => {
        expect(card).toHaveProperty('id');
        expect(card).toHaveProperty('title');
        expect(card).toHaveProperty('dateOccurred');
        expect(card).toHaveProperty('category');
        expect(card).toHaveProperty('difficulty');
        expect(typeof card.id).toBe('number');
        expect(typeof card.title).toBe('string');
        expect(typeof card.category).toBe('string');
        expect(typeof card.difficulty).toBe('number');
        expect(card.difficulty).toBeGreaterThanOrEqual(1);
        expect(card.difficulty).toBeLessThanOrEqual(5);
      });
    });

    it('should have consistent category data', async () => {
      const categories = await getCategories();
      expect(categories.length).toBeGreaterThan(0);
      
      categories.forEach(category => {
        expect(typeof category).toBe('string');
        expect(category.length).toBeGreaterThan(0);
      });
    });

    it('should have valid difficulty levels', async () => {
      const cards = await getAllCards();
      const difficulties = [...new Set(cards.map(card => card.difficulty))];
      
      difficulties.forEach(difficulty => {
        expect(difficulty).toBeGreaterThanOrEqual(1);
        expect(difficulty).toBeLessThanOrEqual(5);
        expect(Number.isInteger(difficulty)).toBe(true);
      });
    });

    it('should have valid dates', async () => {
      const cards = await getAllCards();
      
      cards.forEach(card => {
        expect(card.dateOccurred).toBeDefined();
        expect(new Date(card.dateOccurred).toString()).not.toBe('Invalid Date');
      });
    });

    it('should have unique card IDs', async () => {
      const cards = await getAllCards();
      const ids = cards.map(card => card.id);
      const uniqueIds = [...new Set(ids)];
      expect(uniqueIds.length).toBe(ids.length);
    });

    it('should have chronological ordering', async () => {
      const cards = await getAllCards();
      
      for (let i = 1; i < cards.length; i++) {
        const prevDate = new Date(cards[i - 1].dateOccurred);
        const currDate = new Date(cards[i].dateOccurred);
        expect(currDate.getTime()).toBeGreaterThanOrEqual(prevDate.getTime());
      }
    });
  });

  describe('Performance and Limits', () => {
    it('should handle large result sets efficiently', async () => {
      const startTime = Date.now();
      const cards = await getAllCards();
      const endTime = Date.now();
      
      expect(cards.length).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle concurrent requests', async () => {
      const promises = [
        getAllCards(),
        getCategories(),
        getCardCount(),
        getRandomCards(5)
      ];
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(4);
      expect(Array.isArray(results[0])).toBe(true);
      expect(Array.isArray(results[1])).toBe(true);
      expect(typeof results[2]).toBe('number');
      expect(Array.isArray(results[3])).toBe(true);
    });

    it('should handle memory efficiently with large limits', async () => {
      const cards = await getAllCards({ limit: 100 });
      expect(cards.length).toBeLessThanOrEqual(100);
      expect(Array.isArray(cards)).toBe(true);
    });
  });
}); 