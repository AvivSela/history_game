/**
 * Admin Cards API Tests
 * Tests for card management endpoints in admin routes
 */

const request = require('supertest');
const { app } = require('../server');
const { query } = require('../config/database');

describe('Admin Cards API', () => {
  let testCardId;
  let testCardData;

  beforeAll(async () => {
    // Clean up any existing test data
    await query("DELETE FROM cards WHERE title LIKE 'Test Card%'");
  });

  afterAll(async () => {
    // Clean up test data
    if (testCardId) {
      await query('DELETE FROM cards WHERE id = $1', [testCardId]);
    }
    await query("DELETE FROM cards WHERE title LIKE 'Test Card%'");
  });

  describe('POST /api/admin/cards', () => {
    test('should create a new card with valid data', async () => {
      const cardData = {
        title: 'Test Card - Creation',
        description: 'A test card for creation testing',
        dateOccurred: '2024-01-15',
        category: 'Technology',
        difficulty: 2
      };

      const response = await request(app)
        .post('/api/admin/cards')
        .send(cardData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Card created successfully');
      expect(response.body.data).toMatchObject({
        title: cardData.title,
        description: cardData.description,
        category: cardData.category,
        difficulty: cardData.difficulty
      });

      testCardId = response.body.data.id;
      testCardData = response.body.data;
    });

    test('should reject card creation with missing title', async () => {
      const cardData = {
        description: 'A test card without title',
        dateOccurred: '2024-01-15',
        category: 'Technology',
        difficulty: 2
      };

      const response = await request(app)
        .post('/api/admin/cards')
        .send(cardData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Missing required fields');
    });

    test('should reject card creation with missing dateOccurred', async () => {
      const cardData = {
        title: 'Test Card - No Date',
        description: 'A test card without date',
        category: 'Technology',
        difficulty: 2
      };

      const response = await request(app)
        .post('/api/admin/cards')
        .send(cardData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Missing required fields');
    });

    test('should reject card creation with missing category', async () => {
      const cardData = {
        title: 'Test Card - No Category',
        description: 'A test card without category',
        dateOccurred: '2024-01-15',
        difficulty: 2
      };

      const response = await request(app)
        .post('/api/admin/cards')
        .send(cardData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Missing required fields');
    });

    test('should reject card creation with missing difficulty', async () => {
      const cardData = {
        title: 'Test Card - No Difficulty',
        description: 'A test card without difficulty',
        dateOccurred: '2024-01-15',
        category: 'Technology'
      };

      const response = await request(app)
        .post('/api/admin/cards')
        .send(cardData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Missing required fields');
    });

    test('should reject card creation with invalid difficulty (0)', async () => {
      const cardData = {
        title: 'Test Card - Invalid Difficulty',
        description: 'A test card with invalid difficulty',
        dateOccurred: '2024-01-15',
        category: 'Technology',
        difficulty: 0
      };

      const response = await request(app)
        .post('/api/admin/cards')
        .send(cardData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Difficulty must be between 1 and 5');
    });

    test('should reject card creation with invalid difficulty (6)', async () => {
      const cardData = {
        title: 'Test Card - Invalid Difficulty High',
        description: 'A test card with invalid difficulty',
        dateOccurred: '2024-01-15',
        category: 'Technology',
        difficulty: 6
      };

      const response = await request(app)
        .post('/api/admin/cards')
        .send(cardData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Difficulty must be between 1 and 5');
    });

    test('should reject card creation with invalid date format', async () => {
      const cardData = {
        title: 'Test Card - Invalid Date',
        description: 'A test card with invalid date',
        dateOccurred: 'invalid-date',
        category: 'Technology',
        difficulty: 2
      };

      const response = await request(app)
        .post('/api/admin/cards')
        .send(cardData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid date format');
    });

    test('should reject duplicate card creation', async () => {
      const cardData = {
        title: 'Test Card - Duplicate',
        description: 'A test card for duplicate testing',
        dateOccurred: '2024-01-15',
        category: 'Technology',
        difficulty: 2
      };

      // Create first card
      await request(app)
        .post('/api/admin/cards')
        .send(cardData)
        .expect(201);

      // Try to create duplicate
      const response = await request(app)
        .post('/api/admin/cards')
        .send(cardData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('already exists');
    });
  });

  describe('GET /api/admin/cards', () => {
    test('should get all cards with pagination', async () => {
      const response = await request(app)
        .get('/api/admin/cards')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('cards');
      expect(response.body.data).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data.cards)).toBe(true);
      expect(response.body.data.pagination).toMatchObject({
        total: expect.any(Number),
        limit: expect.any(Number),
        offset: expect.any(Number),
        hasMore: expect.any(Boolean)
      });
    });

    test('should filter cards by category', async () => {
      const response = await request(app)
        .get('/api/admin/cards?category=Technology')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.cards).toBeDefined();
      
      // All returned cards should be Technology category
      response.body.data.cards.forEach(card => {
        expect(card.category).toBe('Technology');
      });
    });

    test('should filter cards by difficulty', async () => {
      const response = await request(app)
        .get('/api/admin/cards?difficulty=2')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.cards).toBeDefined();
      
      // All returned cards should have difficulty 2
      response.body.data.cards.forEach(card => {
        expect(card.difficulty).toBe(2);
      });
    });

    test('should search cards by title', async () => {
      const response = await request(app)
        .get('/api/admin/cards?search=Test Card')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.cards).toBeDefined();
      
      // All returned cards should contain "Test Card" in title
      response.body.data.cards.forEach(card => {
        expect(card.title.toLowerCase()).toContain('test card');
      });
    });

    test('should respect limit parameter', async () => {
      const response = await request(app)
        .get('/api/admin/cards?limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.cards.length).toBeLessThanOrEqual(5);
      expect(response.body.data.pagination.limit).toBe(5);
    });

    test('should respect offset parameter', async () => {
      const response1 = await request(app)
        .get('/api/admin/cards?limit=2&offset=0')
        .expect(200);

      const response2 = await request(app)
        .get('/api/admin/cards?limit=2&offset=2')
        .expect(200);

      expect(response1.body.success).toBe(true);
      expect(response2.body.success).toBe(true);
      
      // Results should be different
      expect(response1.body.data.cards).not.toEqual(response2.body.data.cards);
    });

    test('should sort cards by date in descending order', async () => {
      const response = await request(app)
        .get('/api/admin/cards?sortBy=date_occurred&sortOrder=DESC')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.cards.length).toBeGreaterThan(1);
      
      // Check if dates are in descending order
      for (let i = 0; i < response.body.data.cards.length - 1; i++) {
        const currentDate = new Date(response.body.data.cards[i].dateOccurred);
        const nextDate = new Date(response.body.data.cards[i + 1].dateOccurred);
        expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
      }
    });

    test('should handle invalid sort field gracefully', async () => {
      const response = await request(app)
        .get('/api/admin/cards?sortBy=invalid_field')
        .expect(200);

      expect(response.body.success).toBe(true);
      // Should default to date_occurred ASC
    });

    test('should handle invalid sort order gracefully', async () => {
      const response = await request(app)
        .get('/api/admin/cards?sortOrder=INVALID')
        .expect(200);

      expect(response.body.success).toBe(true);
      // Should default to ASC
    });
  });

  describe('GET /api/admin/cards/:id', () => {
    test('should get a specific card by ID', async () => {
      expect(testCardId).toBeDefined();
      
      const response = await request(app)
        .get(`/api/admin/cards/${testCardId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        id: testCardId,
        title: testCardData.title,
        description: testCardData.description,
        category: testCardData.category,
        difficulty: testCardData.difficulty
      });
    });

    test('should return 400 for invalid card ID', async () => {
      const response = await request(app)
        .get('/api/admin/cards/invalid')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid card ID');
    });

    test('should return 400 for negative card ID', async () => {
      const response = await request(app)
        .get('/api/admin/cards/-1')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid card ID');
    });

    test('should return 400 for zero card ID', async () => {
      const response = await request(app)
        .get('/api/admin/cards/0')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid card ID');
    });

    test('should return 404 for non-existent card', async () => {
      const response = await request(app)
        .get('/api/admin/cards/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Card not found');
    });
  });

  describe('PUT /api/admin/cards/:id', () => {
    test('should update a card with valid data', async () => {
      expect(testCardId).toBeDefined();
      
      const updateData = {
        title: 'Test Card - Updated',
        difficulty: 3
      };

      const response = await request(app)
        .put(`/api/admin/cards/${testCardId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Card updated successfully');
      expect(response.body.data).toMatchObject({
        id: testCardId,
        title: updateData.title,
        difficulty: updateData.difficulty
      });
    });

    test('should update multiple fields', async () => {
      expect(testCardId).toBeDefined();
      
      const updateData = {
        title: 'Test Card - Multiple Updates',
        description: 'Updated description',
        category: 'History',
        difficulty: 4
      };

      const response = await request(app)
        .put(`/api/admin/cards/${testCardId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        id: testCardId,
        title: updateData.title,
        description: updateData.description,
        category: updateData.category,
        difficulty: updateData.difficulty
      });
    });

    test('should return 400 for invalid card ID', async () => {
      const response = await request(app)
        .put('/api/admin/cards/invalid')
        .send({ title: 'Updated' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid card ID');
    });

    test('should return 404 for non-existent card', async () => {
      const response = await request(app)
        .put('/api/admin/cards/99999')
        .send({ title: 'Updated' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Card not found');
    });

    test('should return 400 for no fields to update', async () => {
      expect(testCardId).toBeDefined();
      
      const response = await request(app)
        .put(`/api/admin/cards/${testCardId}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('No fields to update');
    });

    test('should validate difficulty range on update', async () => {
      expect(testCardId).toBeDefined();
      
      const response = await request(app)
        .put(`/api/admin/cards/${testCardId}`)
        .send({ difficulty: 10 })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Difficulty must be between 1 and 5');
    });

    test('should validate date format on update', async () => {
      expect(testCardId).toBeDefined();
      
      const response = await request(app)
        .put(`/api/admin/cards/${testCardId}`)
        .send({ dateOccurred: 'invalid-date' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid date format');
    });
  });

  describe('DELETE /api/admin/cards/:id', () => {
    test('should delete a card successfully', async () => {
      // Create a card to delete
      const cardData = {
        title: 'Test Card - To Delete',
        description: 'A test card to be deleted',
        dateOccurred: '2024-01-16',
        category: 'Science',
        difficulty: 1
      };

      const createResponse = await request(app)
        .post('/api/admin/cards')
        .send(cardData)
        .expect(201);

      const cardId = createResponse.body.data.id;

      const response = await request(app)
        .delete(`/api/admin/cards/${cardId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Card deleted successfully');

      // Verify card is deleted
      await request(app)
        .get(`/api/admin/cards/${cardId}`)
        .expect(404);
    });

    test('should return 400 for invalid card ID', async () => {
      const response = await request(app)
        .delete('/api/admin/cards/invalid')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid card ID');
    });

    test('should return 404 for non-existent card', async () => {
      const response = await request(app)
        .delete('/api/admin/cards/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Card not found');
    });
  });

  describe('POST /api/admin/cards/bulk', () => {
    test('should create multiple cards successfully', async () => {
      const bulkData = {
        cards: [
          {
            title: 'Test Card - Bulk 1',
            description: 'First bulk test card',
            dateOccurred: '2024-01-17',
            category: 'History',
            difficulty: 2
          },
          {
            title: 'Test Card - Bulk 2',
            description: 'Second bulk test card',
            dateOccurred: '2024-01-18',
            category: 'Technology',
            difficulty: 3
          }
        ]
      };

      const response = await request(app)
        .post('/api/admin/cards/bulk')
        .send(bulkData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Bulk card creation completed');
      expect(response.body.data.created).toHaveLength(2);
      expect(response.body.data.errors).toHaveLength(0);
    });

    test('should handle mixed valid and invalid cards', async () => {
      const bulkData = {
        cards: [
          {
            title: 'Test Card - Valid',
            description: 'Valid card',
            dateOccurred: '2024-01-19',
            category: 'History',
            difficulty: 2
          },
          {
            title: 'Test Card - Invalid',
            description: 'Invalid card without required fields',
            dateOccurred: '2024-01-20'
            // Missing category and difficulty
          }
        ]
      };

      const response = await request(app)
        .post('/api/admin/cards/bulk')
        .send(bulkData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.created).toHaveLength(1);
      expect(response.body.data.errors).toHaveLength(1);
      expect(response.body.data.errors[0].error).toContain('Missing required fields');
    });

    test('should reject empty cards array', async () => {
      const response = await request(app)
        .post('/api/admin/cards/bulk')
        .send({ cards: [] })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Cards array is required and must not be empty');
    });

    test('should reject missing cards array', async () => {
      const response = await request(app)
        .post('/api/admin/cards/bulk')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Cards array is required and must not be empty');
    });

    test('should reject too many cards', async () => {
      const cards = Array.from({ length: 101 }, (_, i) => ({
        title: `Test Card - Bulk ${i}`,
        description: `Bulk test card ${i}`,
        dateOccurred: '2024-01-21',
        category: 'History',
        difficulty: 2
      }));

      const response = await request(app)
        .post('/api/admin/cards/bulk')
        .send({ cards })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Cannot create more than 100 cards at once');
    });
  });
}); 