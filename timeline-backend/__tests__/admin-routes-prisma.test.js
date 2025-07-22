/**
 * Admin Routes Prisma Integration Tests
 * @description Tests for admin routes with hybrid Prisma/Query Builder approach
 * @version 1.0.0
 */

const request = require('supertest');
const express = require('express');

// Mock all dependencies before importing routes
jest.mock('../config/database', () => ({
  query: jest.fn()
}));

jest.mock('../services/CardService');
jest.mock('../utils/featureFlags', () => ({
  shouldUsePrisma: jest.fn()
}));

jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn()
}));

// Import after mocking
const CardService = require('../services/CardService');
const { shouldUsePrisma } = require('../utils/featureFlags');
const { query } = require('../config/database');

// Create test app
const app = express();
app.use(express.json());

// Import and use routes after all mocks are set up
const adminRoutes = require('../routes/admin');
app.use('/api/admin', adminRoutes);

describe('Admin Routes - Prisma Integration', () => {
  let mockCardService;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock CardService
    mockCardService = {
      findById: jest.fn(),
      findCards: jest.fn(),
      createCard: jest.fn(),
      updateCard: jest.fn(),
      deleteCard: jest.fn(),
      createCardsBulk: jest.fn(),
      disconnect: jest.fn()
    };
    CardService.mockImplementation(() => mockCardService);
    
    // Setup default database mock responses
    query.mockResolvedValue({
      rows: [
        {
          id: 1,
          title: 'Test Card',
          description: 'Test Description',
          date_occurred: new Date('2020-01-01'),
          category: 'History',
          difficulty: 3,
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01')
        }
      ],
      rowCount: 1
    });
  });

  describe('GET /api/admin/cards', () => {
    it('should use Prisma when feature flag is enabled', async () => {
      shouldUsePrisma.mockReturnValue(true);
      
      const mockCards = [
        {
          id: 1,
          title: 'Test Event',
          description: 'Test Description',
          dateOccurred: new Date('2020-01-01'),
          category: 'History',
          difficulty: 3,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        }
      ];

      mockCardService.findCards.mockResolvedValue({
        cards: mockCards,
        pagination: {
          total: 1,
          limit: 50,
          offset: 0,
          hasMore: false
        }
      });

      const response = await request(app)
        .get('/api/admin/cards')
        .expect(200);

      expect(shouldUsePrisma).toHaveBeenCalledWith('cards');
      expect(CardService).toHaveBeenCalled();
      expect(mockCardService.findCards).toHaveBeenCalled();
      expect(mockCardService.disconnect).toHaveBeenCalled();
      expect(response.body.source).toBe('prisma');
      expect(response.body.data.cards).toHaveLength(1);
    });

    it('should use query builder when feature flag is disabled', async () => {
      shouldUsePrisma.mockReturnValue(false);

      // Mock count query for pagination
      query.mockResolvedValueOnce({
        rows: [{ count: '1' }],
        rowCount: 1
      });

      const response = await request(app)
        .get('/api/admin/cards')
        .expect(200);

      expect(shouldUsePrisma).toHaveBeenCalledWith('cards');
      expect(CardService).not.toHaveBeenCalled();
      expect(response.body.source).toBe('query_builder');
    });
  });

  describe('GET /api/admin/cards/:id', () => {
    it('should use Prisma when feature flag is enabled', async () => {
      shouldUsePrisma.mockReturnValue(true);
      
      const mockCard = {
        id: 1,
        title: 'Test Event',
        description: 'Test Description',
        dateOccurred: new Date('2020-01-01'),
        category: 'History',
        difficulty: 3,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      };

      mockCardService.findById.mockResolvedValue(mockCard);

      const response = await request(app)
        .get('/api/admin/cards/1')
        .expect(200);

      expect(shouldUsePrisma).toHaveBeenCalledWith('cards');
      expect(CardService).toHaveBeenCalled();
      expect(mockCardService.findById).toHaveBeenCalledWith(1);
      expect(mockCardService.disconnect).toHaveBeenCalled();
      expect(response.body.source).toBe('prisma');
      expect(response.body.data.id).toBe(1);
    });

    it('should return 404 when card not found with Prisma', async () => {
      shouldUsePrisma.mockReturnValue(true);
      mockCardService.findById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/admin/cards/999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Card not found');
    });
  });

  describe('POST /api/admin/cards', () => {
    it('should use Prisma when feature flag is enabled', async () => {
      shouldUsePrisma.mockReturnValue(true);
      
      const cardData = {
        title: 'New Event',
        description: 'New Description',
        dateOccurred: '2020-02-01',
        category: 'Technology',
        difficulty: 4
      };

      const mockCreatedCard = {
        id: 2,
        ...cardData,
        dateOccurred: new Date(cardData.dateOccurred),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      };

      mockCardService.createCard.mockResolvedValue(mockCreatedCard);

      const response = await request(app)
        .post('/api/admin/cards')
        .send(cardData)
        .expect(201);

      expect(shouldUsePrisma).toHaveBeenCalledWith('cards');
      expect(CardService).toHaveBeenCalled();
      expect(mockCardService.createCard).toHaveBeenCalledWith(cardData);
      expect(mockCardService.disconnect).toHaveBeenCalled();
      expect(response.body.source).toBe('prisma');
      expect(response.body.data.id).toBe(2);
    });

    it('should validate required fields', async () => {
      shouldUsePrisma.mockReturnValue(true);

      const response = await request(app)
        .post('/api/admin/cards')
        .send({ title: 'Incomplete Card' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Missing required fields');
    });
  });

  describe('PUT /api/admin/cards/:id', () => {
    it('should use Prisma when feature flag is enabled', async () => {
      shouldUsePrisma.mockReturnValue(true);
      
      const updateData = {
        title: 'Updated Event',
        difficulty: 5
      };

      const mockUpdatedCard = {
        id: 1,
        title: 'Updated Event',
        description: 'Original Description',
        dateOccurred: new Date('2020-01-01'),
        category: 'History',
        difficulty: 5,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02')
      };

      mockCardService.updateCard.mockResolvedValue(mockUpdatedCard);

      const response = await request(app)
        .put('/api/admin/cards/1')
        .send(updateData)
        .expect(200);

      expect(shouldUsePrisma).toHaveBeenCalledWith('cards');
      expect(CardService).toHaveBeenCalled();
      expect(mockCardService.updateCard).toHaveBeenCalledWith(1, updateData);
      expect(mockCardService.disconnect).toHaveBeenCalled();
      expect(response.body.source).toBe('prisma');
      expect(response.body.data.title).toBe('Updated Event');
    });
  });

  describe('DELETE /api/admin/cards/:id', () => {
    it('should use Prisma when feature flag is enabled', async () => {
      shouldUsePrisma.mockReturnValue(true);
      
      const mockDeletedCard = {
        id: 1,
        title: 'Deleted Event',
        description: 'Description',
        dateOccurred: new Date('2020-01-01'),
        category: 'History',
        difficulty: 3,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      };

      mockCardService.deleteCard.mockResolvedValue(mockDeletedCard);

      const response = await request(app)
        .delete('/api/admin/cards/1')
        .expect(200);

      expect(shouldUsePrisma).toHaveBeenCalledWith('cards');
      expect(CardService).toHaveBeenCalled();
      expect(mockCardService.deleteCard).toHaveBeenCalledWith(1);
      expect(mockCardService.disconnect).toHaveBeenCalled();
      expect(response.body.source).toBe('prisma');
      expect(response.body.data.id).toBe(1);
    });
  });

  describe('POST /api/admin/cards/bulk', () => {
    it('should use Prisma when feature flag is enabled', async () => {
      shouldUsePrisma.mockReturnValue(true);
      
      const cards = [
        {
          title: 'Event 1',
          description: 'Description 1',
          dateOccurred: '2020-01-01',
          category: 'History',
          difficulty: 3
        },
        {
          title: 'Event 2',
          description: 'Description 2',
          dateOccurred: '2020-02-01',
          category: 'Technology',
          difficulty: 4
        }
      ];

      const mockResult = {
        created: [
          { index: 0, id: 1, title: 'Event 1' },
          { index: 1, id: 2, title: 'Event 2' }
        ],
        errors: []
      };

      mockCardService.createCardsBulk.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/admin/cards/bulk')
        .send({ cards })
        .expect(201);

      expect(shouldUsePrisma).toHaveBeenCalledWith('cards');
      expect(CardService).toHaveBeenCalled();
      expect(mockCardService.createCardsBulk).toHaveBeenCalledWith(cards);
      expect(mockCardService.disconnect).toHaveBeenCalled();
      expect(response.body.source).toBe('prisma');
      expect(response.body.data.created).toHaveLength(2);
    });

    it('should validate cards array', async () => {
      shouldUsePrisma.mockReturnValue(true);

      const response = await request(app)
        .post('/api/admin/cards/bulk')
        .send({ cards: [] })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Cards array is required');
    });
  });
}); 