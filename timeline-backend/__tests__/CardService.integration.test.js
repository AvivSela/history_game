/**
 * CardService Integration Tests
 * @description Integration tests for CardService with actual database
 * @version 1.0.0
 */

const CardService = require('../services/CardService');

describe('CardService Integration', () => {
  let cardService;

  beforeAll(async () => {
    try {
      cardService = new CardService();
    } catch (error) {
      console.error('❌ Failed to initialize CardService:', error.message);
      console.error('This usually means the Prisma client has not been generated.');
      console.error('Please run: yarn workspace timeline-backend db:generate');
      throw error;
    }
  });

  afterAll(async () => {
    // The singleton Prisma client is managed globally and will be disconnected
    // in the global teardown, so we don't need to disconnect here
  });

  describe('Database Connection', () => {
    it('should connect to database successfully', async () => {
      // Try to find a card to test connection
      const card = await cardService.findById(1);
      // Should either return a card or null, but not throw an error
      expect(card === null || typeof card === 'object').toBe(true);
    });
  });

  describe('findCards', () => {
    it('should find cards with pagination', async () => {
      const result = await cardService.findCards({
        limit: 5,
        offset: 0
      });

      expect(result).toHaveProperty('cards');
      expect(result).toHaveProperty('pagination');
      expect(Array.isArray(result.cards)).toBe(true);
      expect(result.pagination).toHaveProperty('total');
      expect(result.pagination).toHaveProperty('limit');
      expect(result.pagination).toHaveProperty('offset');
      expect(result.pagination).toHaveProperty('hasMore');
    });

    it('should filter cards by category', async () => {
      const result = await cardService.findCards({
        category: 'History',
        limit: 10
      });

      expect(result.cards.length).toBeGreaterThanOrEqual(0);
      // All returned cards should have History category
      result.cards.forEach(card => {
        expect(card.category).toBe('History');
      });
    });

    it('should filter cards by difficulty', async () => {
      const result = await cardService.findCards({
        difficulty: 3,
        limit: 10
      });

      expect(result.cards.length).toBeGreaterThanOrEqual(0);
      // All returned cards should have difficulty 3
      result.cards.forEach(card => {
        expect(card.difficulty).toBe(3);
      });
    });
  });

  describe('findById', () => {
    it('should find existing card by ID', async () => {
      // First get a list of cards to find an existing ID
      const cardsResult = await cardService.findCards({ limit: 1 });
      
      if (cardsResult.cards.length > 0) {
        const existingId = cardsResult.cards[0].id;
        const card = await cardService.findById(existingId);
        
        expect(card).not.toBeNull();
        expect(card.id).toBe(existingId);
        expect(card).toHaveProperty('title');
        expect(card).toHaveProperty('description');
        expect(card).toHaveProperty('dateOccurred');
        expect(card).toHaveProperty('category');
        expect(card).toHaveProperty('difficulty');
      }
    });

    it('should return null for non-existent card', async () => {
      const card = await cardService.findById(999999);
      expect(card).toBeNull();
    });
  });
}); 