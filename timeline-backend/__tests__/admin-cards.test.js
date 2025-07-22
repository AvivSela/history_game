/**
 * Admin Cards Routes Test
 * @description Tests for card management routes with feature flag integration
 * @version 1.0.0
 */

const request = require('supertest');
const { app } = require('../server');
const { query } = require('../config/database');
const logger = require('../utils/logger');

describe('Admin Card Routes with Feature Flags', () => {
  let testCardId;

  beforeAll(async () => {
    // Create a test card for testing
    const result = await query(`
      INSERT INTO cards (title, description, date_occurred, category, difficulty)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, ['Test Card for Feature Flags', 'Test description', '2020-01-01', 'History', 3]);
    
    testCardId = result.rows[0].id;
  });

  afterAll(async () => {
    // Clean up test card
    if (testCardId) {
      await query('DELETE FROM cards WHERE id = $1', [testCardId]);
    }
  });

  describe('GET /api/admin/cards/:id', () => {
    it('should return card data with source indicator', async () => {
      const response = await request(app)
        .get(`/api/admin/cards/${testCardId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(testCardId);
      expect(response.body.data.title).toBe('Test Card for Feature Flags');
      expect(response.body.source).toBeDefined();
      expect(['prisma', 'query_builder']).toContain(response.body.source);
    });

    it('should return 404 for non-existent card', async () => {
      const response = await request(app)
        .get('/api/admin/cards/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Card not found');
    });
  });

  describe('POST /api/admin/cards', () => {
    it('should create a new card with source indicator', async () => {
      const newCard = {
        title: 'Feature Flag Test Card',
        description: 'Testing feature flag integration',
        dateOccurred: '2020-02-01',
        category: 'Technology',
        difficulty: 4
      };

      const response = await request(app)
        .post('/api/admin/cards')
        .send(newCard)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Card created successfully');
      expect(response.body.data).toBeDefined();
      expect(response.body.data.title).toBe(newCard.title);
      expect(response.body.source).toBeDefined();
      expect(['prisma', 'query_builder']).toContain(response.body.source);

      // Clean up
      await query('DELETE FROM cards WHERE title = $1', [newCard.title]);
    });

    it('should validate required fields', async () => {
      const invalidCard = {
        title: 'Missing Fields Card'
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/admin/cards')
        .send(invalidCard)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Missing required fields');
    });
  });

  describe('PUT /api/admin/cards/:id', () => {
    it('should update a card with source indicator', async () => {
      const updateData = {
        title: 'Updated Test Card',
        difficulty: 5
      };

      const response = await request(app)
        .put(`/api/admin/cards/${testCardId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Card updated successfully');
      expect(response.body.data.title).toBe(updateData.title);
      expect(response.body.data.difficulty).toBe(updateData.difficulty);
      expect(response.body.source).toBeDefined();
      expect(['prisma', 'query_builder']).toContain(response.body.source);
    });

    it('should return 404 for non-existent card', async () => {
      const response = await request(app)
        .put('/api/admin/cards/99999')
        .send({ title: 'Updated' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Card not found');
    });
  });

  describe('GET /api/admin/cards', () => {
    it('should return cards list with source indicator', async () => {
      const response = await request(app)
        .get('/api/admin/cards')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.source).toBeDefined();
      expect(['prisma', 'query_builder']).toContain(response.body.source);
    });

    it('should handle filtering by category', async () => {
      const response = await request(app)
        .get('/api/admin/cards?category=History')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.source).toBeDefined();
    });

    it('should handle pagination', async () => {
      const response = await request(app)
        .get('/api/admin/cards?limit=5&offset=0')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.source).toBeDefined();
    });
  });

  describe('POST /api/admin/cards/bulk', () => {
    it('should create multiple cards with source indicator', async () => {
      const bulkCards = [
        {
          title: 'Bulk Test Card 1',
          description: 'First bulk test card',
          dateOccurred: '2020-03-01',
          category: 'Science',
          difficulty: 2
        },
        {
          title: 'Bulk Test Card 2',
          description: 'Second bulk test card',
          dateOccurred: '2020-03-02',
          category: 'Art',
          difficulty: 3
        }
      ];

      const response = await request(app)
        .post('/api/admin/cards/bulk')
        .send({ cards: bulkCards })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Bulk card creation completed');
      expect(response.body.data).toBeDefined();
      expect(response.body.source).toBeDefined();
      expect(['prisma', 'query_builder']).toContain(response.body.source);

      // Clean up
      for (const card of bulkCards) {
        await query('DELETE FROM cards WHERE title = $1', [card.title]);
      }
    });
  });

  describe('DELETE /api/admin/cards/:id', () => {
    it('should delete a card with source indicator', async () => {
      // Create a card to delete
      const createResult = await query(`
        INSERT INTO cards (title, description, date_occurred, category, difficulty)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `, ['Card to Delete', 'Will be deleted', '2020-04-01', 'History', 1]);
      
      const cardToDeleteId = createResult.rows[0].id;

      const response = await request(app)
        .delete(`/api/admin/cards/${cardToDeleteId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Card deleted successfully');
      expect(response.body.source).toBeDefined();
      expect(['prisma', 'query_builder']).toContain(response.body.source);
    });

    it('should return 404 for non-existent card', async () => {
      const response = await request(app)
        .delete('/api/admin/cards/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Card not found');
    });
  });
}); 