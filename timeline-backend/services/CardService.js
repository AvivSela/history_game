/**
 * Card Service
 * @description Service layer for card operations using Prisma ORM
 * @version 1.0.0
 */

const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

/**
 * Card Service Class
 * @description Handles card CRUD operations using Prisma ORM
 */
class CardService {
  constructor(prisma = null) {
    this.prisma = prisma || new PrismaClient();
  }

  /**
   * Find a card by ID
   * @param {number} id - Card ID
   * @returns {Promise<Object|null>} Card object or null if not found
   */
  async findById(id) {
    try {
      logger.debug(`🔍 Finding card by ID: ${id}`);
      
      const card = await this.prisma.cards.findUnique({
        where: { id: parseInt(id) }
      });

      if (!card) {
        logger.debug(`❌ Card not found: ${id}`);
        return null;
      }

      // Transform to match existing API response format
      return {
        id: card.id,
        title: card.title,
        description: card.description,
        dateOccurred: card.date_occurred,
        category: card.category,
        difficulty: card.difficulty,
        createdAt: card.created_at,
        updatedAt: card.updated_at
      };
    } catch (error) {
      logger.error(`❌ Error finding card by ID ${id}:`, error.message);
      throw new Error(`Failed to find card: ${error.message}`);
    }
  }

  /**
   * Create a new card
   * @param {Object} data - Card data
   * @param {string} data.title - Card title
   * @param {string} data.description - Card description (optional)
   * @param {Date|string} data.dateOccurred - Date when event occurred
   * @param {string} data.category - Card category
   * @param {number} data.difficulty - Difficulty level (1-5)
   * @returns {Promise<Object>} Created card object
   */
  async createCard(data) {
    try {
      logger.debug('🔧 Creating new card:', { title: data.title, category: data.category });

      // Validate required fields
      if (!data.title || !data.dateOccurred || !data.category || !data.difficulty) {
        throw new Error('Missing required fields: title, dateOccurred, category, difficulty');
      }

      // Validate difficulty range
      if (data.difficulty < 1 || data.difficulty > 5) {
        throw new Error('Difficulty must be between 1 and 5');
      }

      // Check for duplicates
      const existingCard = await this.prisma.cards.findFirst({
        where: {
          title: data.title,
          date_occurred: new Date(data.dateOccurred)
        }
      });

      if (existingCard) {
        throw new Error('Card with this title and date already exists');
      }

      const card = await this.prisma.cards.create({
        data: {
          title: data.title,
          description: data.description || null,
          date_occurred: new Date(data.dateOccurred),
          category: data.category,
          difficulty: data.difficulty
        }
      });

      logger.info(`✅ Card created successfully: ${card.id}`);

      // Transform to match existing API response format
      return {
        id: card.id,
        title: card.title,
        description: card.description,
        dateOccurred: card.date_occurred,
        category: card.category,
        difficulty: card.difficulty,
        createdAt: card.created_at,
        updatedAt: card.updated_at
      };
    } catch (error) {
      logger.error('❌ Error creating card:', error.message);
      throw new Error(`Failed to create card: ${error.message}`);
    }
  }

  /**
   * Update an existing card
   * @param {number} id - Card ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} Updated card object
   */
  async updateCard(id, data) {
    try {
      logger.debug(`🔧 Updating card ${id}:`, data);

      // Check if card exists
      const existingCard = await this.prisma.cards.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existingCard) {
        throw new Error('Card not found');
      }

      // Validate difficulty range if provided
      if (data.difficulty && (data.difficulty < 1 || data.difficulty > 5)) {
        throw new Error('Difficulty must be between 1 and 5');
      }

      // Check for duplicates if title or date is being updated
      if (data.title || data.dateOccurred) {
        const duplicateCard = await this.prisma.cards.findFirst({
          where: {
            title: data.title || existingCard.title,
            date_occurred: data.dateOccurred ? new Date(data.dateOccurred) : existingCard.date_occurred,
            id: { not: parseInt(id) }
          }
        });

        if (duplicateCard) {
          throw new Error('Card with this title and date already exists');
        }
      }

      const updateData = {};
      if (data.title) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.dateOccurred) updateData.date_occurred = new Date(data.dateOccurred);
      if (data.category) updateData.category = data.category;
      if (data.difficulty) updateData.difficulty = data.difficulty;
      updateData.updated_at = new Date();

      const card = await this.prisma.cards.update({
        where: { id: parseInt(id) },
        data: updateData
      });

      logger.info(`✅ Card updated successfully: ${card.id}`);

      // Transform to match existing API response format
      return {
        id: card.id,
        title: card.title,
        description: card.description,
        dateOccurred: card.date_occurred,
        category: card.category,
        difficulty: card.difficulty,
        createdAt: card.created_at,
        updatedAt: card.updated_at
      };
    } catch (error) {
      logger.error(`❌ Error updating card ${id}:`, error.message);
      throw new Error(`Failed to update card: ${error.message}`);
    }
  }

  /**
   * Delete a card
   * @param {number} id - Card ID
   * @returns {Promise<Object>} Deleted card object
   */
  async deleteCard(id) {
    try {
      logger.debug(`🗑️ Deleting card ${id}`);

      // Check if card exists
      const existingCard = await this.prisma.cards.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existingCard) {
        throw new Error('Card not found');
      }

      const card = await this.prisma.cards.delete({
        where: { id: parseInt(id) }
      });

      logger.info(`✅ Card deleted successfully: ${card.id}`);

      // Transform to match existing API response format
      return {
        id: card.id,
        title: card.title,
        description: card.description,
        dateOccurred: card.date_occurred,
        category: card.category,
        difficulty: card.difficulty,
        createdAt: card.created_at,
        updatedAt: card.updated_at
      };
    } catch (error) {
      logger.error(`❌ Error deleting card ${id}:`, error.message);
      throw new Error(`Failed to delete card: ${error.message}`);
    }
  }

  /**
   * Find cards with filtering and pagination
   * @param {Object} options - Filter options
   * @param {string} options.category - Filter by category
   * @param {number} options.difficulty - Filter by difficulty
   * @param {string} options.search - Search in title and description
   * @param {number} options.limit - Number of results to return
   * @param {number} options.offset - Number of results to skip
   * @param {string} options.sortBy - Field to sort by
   * @param {string} options.sortOrder - Sort order (ASC/DESC)
   * @returns {Promise<Object>} Cards with pagination info
   */
  async findCards(options = {}) {
    try {
      const {
        category,
        difficulty,
        search,
        limit = 50,
        offset = 0,
        sortBy = 'date_occurred',
        sortOrder = 'ASC'
      } = options;

      logger.debug('🔍 Finding cards with filters:', { category, difficulty, limit, offset });

      // Build where conditions
      const where = {};
      
      if (category) {
        where.category = category;
      }
      
      if (difficulty) {
        where.difficulty = parseInt(difficulty);
      }
      
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ];
      }

      // Build order by
      const orderBy = {};
      const validSortFields = ['id', 'title', 'date_occurred', 'category', 'difficulty', 'created_at'];
      const validSortOrders = ['asc', 'desc'];
      
      if (validSortFields.includes(sortBy)) {
        orderBy[sortBy] = validSortOrders.includes(sortOrder.toLowerCase()) ? sortOrder.toLowerCase() : 'asc';
      } else {
        orderBy.date_occurred = 'asc';
      }

      // Get cards with pagination
      const [cards, totalCount] = await Promise.all([
        this.prisma.cards.findMany({
          where,
          orderBy,
          take: parseInt(limit),
          skip: parseInt(offset)
        }),
        this.prisma.cards.count({ where })
      ]);

      // Transform to match existing API response format
      const transformedCards = cards.map(card => ({
        id: card.id,
        title: card.title,
        description: card.description,
        dateOccurred: card.date_occurred,
        category: card.category,
        difficulty: card.difficulty,
        createdAt: card.created_at,
        updatedAt: card.updated_at
      }));

      return {
        cards: transformedCards,
        pagination: {
          total: totalCount,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: (parseInt(offset) + parseInt(limit)) < totalCount
        }
      };
    } catch (error) {
      logger.error('❌ Error finding cards:', error.message);
      throw new Error(`Failed to find cards: ${error.message}`);
    }
  }

  /**
   * Create multiple cards in bulk
   * @param {Array} cards - Array of card data objects
   * @returns {Promise<Object>} Results of bulk creation
   */
  async createCardsBulk(cards) {
    try {
      logger.info(`🔧 Creating ${cards.length} cards in bulk`);

      if (!Array.isArray(cards) || cards.length === 0) {
        throw new Error('Cards array is required and must not be empty');
      }

      if (cards.length > 100) {
        throw new Error('Cannot create more than 100 cards at once');
      }

      const results = [];
      const errors = [];

      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        
        try {
          const createdCard = await this.createCard(card);
          results.push({
            index: i,
            id: createdCard.id,
            title: createdCard.title
          });
        } catch (error) {
          errors.push({
            index: i,
            error: error.message
          });
        }
      }

      logger.info(`✅ Bulk card creation completed: ${results.length} created, ${errors.length} failed`);

      return {
        created: results,
        errors: errors
      };
    } catch (error) {
      logger.error('❌ Error in bulk card creation:', error.message);
      throw new Error(`Failed to create cards in bulk: ${error.message}`);
    }
  }

  /**
   * Disconnect from Prisma client
   */
  async disconnect() {
    await this.prisma.$disconnect();
  }
}

module.exports = CardService; 