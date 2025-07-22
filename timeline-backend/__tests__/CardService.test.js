/**
 * CardService Tests
 * @description Tests for CardService with Prisma ORM
 * @version 1.0.0
 */

const CardService = require('../services/CardService');
const { PrismaClient } = require('@prisma/client');

// Mock Prisma client for testing
const mockPrisma = {
  cards: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn()
  },
  $disconnect: jest.fn()
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma)
}));

describe('CardService', () => {
  let cardService;

  beforeEach(() => {
    jest.clearAllMocks();
    cardService = new CardService(mockPrisma);
  });

  afterEach(async () => {
    await cardService.disconnect();
  });

  describe('findById', () => {
    it('should find a card by ID successfully', async () => {
      const mockCard = {
        id: 1,
        title: 'Test Event',
        description: 'Test Description',
        date_occurred: new Date('2020-01-01'),
        category: 'History',
        difficulty: 3,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01')
      };

      mockPrisma.cards.findUnique.mockResolvedValue(mockCard);

      const result = await cardService.findById(1);

      expect(mockPrisma.cards.findUnique).toHaveBeenCalledWith({
        where: { id: 1 }
      });
      expect(result).toEqual({
        id: 1,
        title: 'Test Event',
        description: 'Test Description',
        dateOccurred: mockCard.date_occurred,
        category: 'History',
        difficulty: 3,
        createdAt: mockCard.created_at,
        updatedAt: mockCard.updated_at
      });
    });

    it('should return null when card not found', async () => {
      mockPrisma.cards.findUnique.mockResolvedValue(null);

      const result = await cardService.findById(999);

      expect(result).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      mockPrisma.cards.findUnique.mockRejectedValue(new Error('Database error'));

      await expect(cardService.findById(1)).rejects.toThrow('Failed to find card: Database error');
    });
  });

  describe('createCard', () => {
    it('should create a card successfully', async () => {
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
        date_occurred: new Date(cardData.dateOccurred),
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01')
      };

      mockPrisma.cards.findFirst.mockResolvedValue(null); // No duplicate
      mockPrisma.cards.create.mockResolvedValue(mockCreatedCard);

      const result = await cardService.createCard(cardData);

      expect(mockPrisma.cards.findFirst).toHaveBeenCalledWith({
        where: {
          title: cardData.title,
          date_occurred: new Date(cardData.dateOccurred)
        }
      });
      expect(mockPrisma.cards.create).toHaveBeenCalledWith({
        data: {
          title: cardData.title,
          description: cardData.description,
          date_occurred: new Date(cardData.dateOccurred),
          category: cardData.category,
          difficulty: cardData.difficulty
        }
      });
      expect(result.id).toBe(2);
    });

    it('should throw error for missing required fields', async () => {
      const cardData = {
        title: 'New Event',
        // Missing required fields
      };

      await expect(cardService.createCard(cardData)).rejects.toThrow(
        'Missing required fields: title, dateOccurred, category, difficulty'
      );
    });

    it('should throw error for invalid difficulty range', async () => {
      const cardData = {
        title: 'New Event',
        description: 'Description',
        dateOccurred: '2020-02-01',
        category: 'Technology',
        difficulty: 6 // Invalid
      };

      await expect(cardService.createCard(cardData)).rejects.toThrow(
        'Difficulty must be between 1 and 5'
      );
    });

    it('should throw error for duplicate card', async () => {
      const cardData = {
        title: 'Existing Event',
        description: 'Description',
        dateOccurred: '2020-02-01',
        category: 'Technology',
        difficulty: 4
      };

      mockPrisma.cards.findFirst.mockResolvedValue({ id: 1 }); // Duplicate found

      await expect(cardService.createCard(cardData)).rejects.toThrow(
        'Card with this title and date already exists'
      );
    });
  });

  describe('updateCard', () => {
    it('should update a card successfully', async () => {
      const cardId = 1;
      const updateData = {
        title: 'Updated Event',
        difficulty: 5
      };

      const existingCard = {
        id: 1,
        title: 'Original Event',
        description: 'Description',
        date_occurred: new Date('2020-01-01'),
        category: 'History',
        difficulty: 3,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01')
      };

      const updatedCard = {
        ...existingCard,
        ...updateData,
        updated_at: new Date('2024-01-02')
      };

      mockPrisma.cards.findUnique.mockResolvedValue(existingCard);
      mockPrisma.cards.findFirst.mockResolvedValue(null); // No duplicate
      mockPrisma.cards.update.mockResolvedValue(updatedCard);

      const result = await cardService.updateCard(cardId, updateData);

      expect(mockPrisma.cards.update).toHaveBeenCalledWith({
        where: { id: cardId },
        data: {
          title: updateData.title,
          difficulty: updateData.difficulty,
          updated_at: expect.any(Date)
        }
      });
      expect(result.title).toBe('Updated Event');
      expect(result.difficulty).toBe(5);
    });

    it('should throw error when card not found', async () => {
      mockPrisma.cards.findUnique.mockResolvedValue(null);

      await expect(cardService.updateCard(999, { title: 'New Title' })).rejects.toThrow(
        'Card not found'
      );
    });

    it('should throw error for invalid difficulty range', async () => {
      const existingCard = {
        id: 1,
        title: 'Original Event',
        difficulty: 3
      };

      mockPrisma.cards.findUnique.mockResolvedValue(existingCard);

      await expect(cardService.updateCard(1, { difficulty: 6 })).rejects.toThrow(
        'Difficulty must be between 1 and 5'
      );
    });
  });

  describe('deleteCard', () => {
    it('should delete a card successfully', async () => {
      const cardId = 1;
      const existingCard = {
        id: 1,
        title: 'Event to Delete',
        description: 'Description',
        date_occurred: new Date('2020-01-01'),
        category: 'History',
        difficulty: 3,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01')
      };

      mockPrisma.cards.findUnique.mockResolvedValue(existingCard);
      mockPrisma.cards.delete.mockResolvedValue(existingCard);

      const result = await cardService.deleteCard(cardId);

      expect(mockPrisma.cards.delete).toHaveBeenCalledWith({
        where: { id: cardId }
      });
      expect(result.id).toBe(1);
    });

    it('should throw error when card not found', async () => {
      mockPrisma.cards.findUnique.mockResolvedValue(null);

      await expect(cardService.deleteCard(999)).rejects.toThrow('Card not found');
    });
  });

  describe('findCards', () => {
    it('should find cards with filters successfully', async () => {
      const options = {
        category: 'History',
        difficulty: 3,
        limit: 10,
        offset: 0,
        sortBy: 'date_occurred',
        sortOrder: 'ASC'
      };

      const mockCards = [
        {
          id: 1,
          title: 'Event 1',
          description: 'Description 1',
          date_occurred: new Date('2020-01-01'),
          category: 'History',
          difficulty: 3,
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01')
        }
      ];

      mockPrisma.cards.findMany.mockResolvedValue(mockCards);
      mockPrisma.cards.count.mockResolvedValue(1);

      const result = await cardService.findCards(options);

      expect(mockPrisma.cards.findMany).toHaveBeenCalledWith({
        where: {
          category: 'History',
          difficulty: 3
        },
        orderBy: {
          date_occurred: 'asc'
        },
        take: 10,
        skip: 0
      });
      expect(result.cards).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });

    it('should handle search filter correctly', async () => {
      const options = {
        search: 'test'
      };

      mockPrisma.cards.findMany.mockResolvedValue([]);
      mockPrisma.cards.count.mockResolvedValue(0);

      await cardService.findCards(options);

      expect(mockPrisma.cards.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { title: { contains: 'test', mode: 'insensitive' } },
            { description: { contains: 'test', mode: 'insensitive' } }
          ]
        },
        orderBy: {
          date_occurred: 'asc'
        },
        take: 50,
        skip: 0
      });
    });
  });

  describe('createCardsBulk', () => {
    it('should create multiple cards successfully', async () => {
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

      // Mock successful creation for both cards
      mockPrisma.cards.findFirst.mockResolvedValue(null); // No duplicates
      mockPrisma.cards.create
        .mockResolvedValueOnce({
          id: 1,
          title: 'Event 1',
          description: 'Description 1',
          date_occurred: new Date('2020-01-01'),
          category: 'History',
          difficulty: 3,
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01')
        })
        .mockResolvedValueOnce({
          id: 2,
          title: 'Event 2',
          description: 'Description 2',
          date_occurred: new Date('2020-02-01'),
          category: 'Technology',
          difficulty: 4,
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01')
        });

      const result = await cardService.createCardsBulk(cards);

      expect(result.created).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
      expect(result.created[0].id).toBe(1);
      expect(result.created[1].id).toBe(2);
    });

    it('should handle errors in bulk creation', async () => {
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
          // Missing required fields
        }
      ];

      // Mock successful creation for first card, error for second
      mockPrisma.cards.findFirst.mockResolvedValue(null);
      mockPrisma.cards.create
        .mockResolvedValueOnce({
          id: 1,
          title: 'Event 1',
          description: 'Description 1',
          date_occurred: new Date('2020-01-01'),
          category: 'History',
          difficulty: 3,
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01')
        });

      const result = await cardService.createCardsBulk(cards);

      expect(result.created).toHaveLength(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].index).toBe(1);
      expect(result.errors[0].error).toContain('Missing required fields');
    });

    it('should throw error for empty cards array', async () => {
      await expect(cardService.createCardsBulk([])).rejects.toThrow(
        'Cards array is required and must not be empty'
      );
    });

    it('should throw error for too many cards', async () => {
      const cards = Array(101).fill({
        title: 'Event',
        description: 'Description',
        dateOccurred: '2020-01-01',
        category: 'History',
        difficulty: 3
      });

      await expect(cardService.createCardsBulk(cards)).rejects.toThrow(
        'Cannot create more than 100 cards at once'
      );
    });
  });

  describe('disconnect', () => {
    it('should disconnect from Prisma client', async () => {
      await cardService.disconnect();
      expect(mockPrisma.$disconnect).toHaveBeenCalled();
    });
  });
}); 