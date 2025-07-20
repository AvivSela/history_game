const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { errorHandler, notFoundHandler, asyncHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const { testConnection } = require('./config/database');
const dbUtils = require('./utils/database');

// Import routes
const gameSessionRoutes = require('./routes/gameSessions');
const statisticsRoutes = require('./routes/statistics');
const analyticsRoutes = require('./routes/analytics');
const adminRoutes = require('./routes/admin');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({
  // Limit JSON payload size to prevent large-body DoS attacks
  limit: '100kb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({
        success: false,
        error: 'Invalid JSON format'
      });
      throw new Error('Invalid JSON');
    }
  }
}));

// Sample events data - expanded for better testing
const sampleEvents = [
  { 
    id: 1, 
    title: "World War II ends", 
    dateOccurred: "1945-09-02", 
    category: "History", 
    difficulty: 1,
    description: "Japan formally surrendered aboard the USS Missouri in Tokyo Bay"
  },
  { 
    id: 2, 
    title: "First Moon Landing", 
    dateOccurred: "1969-07-20", 
    category: "Space", 
    difficulty: 2,
    description: "Apollo 11 mission successfully lands Neil Armstrong and Buzz Aldrin on the moon"
  },
  { 
    id: 3, 
    title: "Berlin Wall falls", 
    dateOccurred: "1989-11-09", 
    category: "History", 
    difficulty: 1,
    description: "The barrier dividing East and West Berlin is torn down"
  },
  { 
    id: 4, 
    title: "iPhone is released", 
    dateOccurred: "2007-06-29", 
    category: "Technology", 
    difficulty: 1,
    description: "Apple releases the first iPhone, revolutionizing smartphones"
  },
  { 
    id: 5, 
    title: "Titanic sinks", 
    dateOccurred: "1912-04-15", 
    category: "History", 
    difficulty: 2,
    description: "The RMS Titanic sinks on its maiden voyage"
  },
  { 
    id: 6, 
    title: "Wright Brothers first flight", 
    dateOccurred: "1903-12-17", 
    category: "Aviation", 
    difficulty: 2,
    description: "First powered, sustained, and controlled heavier-than-air human flight"
  },
  { 
    id: 7, 
    title: "World Wide Web invented", 
    dateOccurred: "1989-03-12", 
    category: "Technology", 
    difficulty: 2,
    description: "Tim Berners-Lee proposes the World Wide Web"
  },
  { 
    id: 8, 
    title: "Discovery of DNA structure", 
    dateOccurred: "1953-04-25", 
    category: "Science", 
    difficulty: 3,
    description: "Watson and Crick publish their discovery of DNA's double helix structure"
  },
  { 
    id: 9, 
    title: "Fall of Roman Empire", 
    dateOccurred: "476-09-04", 
    category: "History", 
    difficulty: 3,
    description: "The last Western Roman Emperor is deposed"
  },
  { 
    id: 10, 
    title: "Printing Press invented", 
    dateOccurred: "1440-01-01", 
    category: "Technology", 
    difficulty: 2,
    description: "Johannes Gutenberg invents the printing press with movable type"
  },
  { 
    id: 11, 
    title: "Steam Engine invented", 
    dateOccurred: "1712-01-01", 
    category: "Technology", 
    difficulty: 2,
    description: "Thomas Newcomen builds the first practical steam engine"
  },
  { 
    id: 12, 
    title: "American Civil War ends", 
    dateOccurred: "1865-04-09", 
    category: "History", 
    difficulty: 2,
    description: "Confederate General Lee surrenders to Union General Grant"
  }
];

// Enhanced health check route with database status
app.get('/api/health', asyncHandler(async (req, res) => {
  const dbStatus = await testConnection();
  
  res.json({ 
    success: true,
    message: 'Timeline API is running!',
    timestamp: new Date().toISOString(),
    status: dbStatus ? 'healthy' : 'degraded',
    database: dbStatus ? 'connected' : 'disconnected',
    version: '1.0.0'
  });
}));

// Get all events
app.get('/api/events', asyncHandler(async (req, res) => {
  logger.info('📊 Fetching all events...');
  
  try {
    const events = await dbUtils.getAllCards();
    res.json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    logger.error('❌ Error fetching events:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch events'
    });
  }
}));

// Get random events for a game (using simpler parameter handling)
app.get('/api/events/random/:count', asyncHandler(async (req, res) => {
  const countParam = req.params.count;
  const count = parseInt(countParam, 10);
  
  logger.info(`🎲 Fetching ${count} random events...`);
  
  // Handle invalid or negative counts
  if (isNaN(count) || count < 1) {
    return res.status(400).json({
      success: false,
      error: 'Count must be at least 1'
    });
  }
  
  try {
    // Get total count to validate request
    const totalCount = await dbUtils.getCardCount();
    
    if (count > totalCount) {
      return res.status(400).json({
        success: false,
        error: `Requested ${count} events but only ${totalCount} available`
      });
    }
    
    const selectedEvents = await dbUtils.getRandomCards(count);
    
    res.json({
      success: true,
      count: selectedEvents.length,
      requested: count,
      data: selectedEvents
    });
  } catch (error) {
    logger.error('❌ Error fetching random events:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch random events'
    });
  }
}));

// Alternative route without parameters (fallback)
app.get('/api/events/random', asyncHandler(async (req, res) => {
  const count = parseInt(req.query.count, 10) || 5;
  logger.info(`🎲 Fetching ${count} random events (query param)...`);
  
  try {
    const selectedEvents = await dbUtils.getRandomCards(count);
    
    res.json({
      success: true,
      count: selectedEvents.length,
      data: selectedEvents
    });
  } catch (error) {
    logger.error('❌ Error fetching random events:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch random events'
    });
  }
}));

// Get available categories
app.get('/api/categories', asyncHandler(async (req, res) => {
  logger.info('📁 Fetching categories...');
  
  try {
    const categories = await dbUtils.getCategories();
    
    res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    logger.error('❌ Error fetching categories:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    });
  }
}));

// Get events by category (using query parameters instead of path parameters)
app.get('/api/events/category', asyncHandler(async (req, res) => {
  const category = req.query.name;
  if (!category || category.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Category name is required as query parameter (?name=History)'
    });
  }
  
  logger.info(`📂 Fetching events for category: ${category}`);
  
  try {
    const filtered = await dbUtils.getCardsByCategory(category);
    
    res.json({
      success: true,
      count: filtered.length,
      category: category,
      data: filtered
    });
  } catch (error) {
    logger.error('❌ Error fetching events by category:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch events by category'
    });
  }
}));

// Game Session Routes
app.use('/api/game-sessions', gameSessionRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use(errorHandler);

// Handle 404s
app.use('*', notFoundHandler);

// Only start server if this file is run directly
if (require.main === module) {
  const server = app.listen(PORT, async () => {
    logger.info('🚀 Timeline API Server Successfully Started!');
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.info(`📍 Server: http://localhost:${PORT}`);
    logger.info(`💓 Health: http://localhost:${PORT}/api/health`);
    logger.info(`📊 Events: http://localhost:${PORT}/api/events`);
    logger.info(`🎲 Random: http://localhost:${PORT}/api/events/random/5`);
    logger.info(`📁 Categories: http://localhost:${PORT}/api/categories`);
    logger.info(`🎮 Game Sessions: http://localhost:${PORT}/api/game-sessions`);
    logger.info(`🏆 Leaderboard: http://localhost:${PORT}/api/game-sessions/leaderboard`);
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Initialize database
    try {
      await dbUtils.initializeDatabase();
      logger.info('✅ Database initialized successfully!');
    } catch (error) {
      logger.error('❌ Database initialization failed:', error.message);
      logger.info('⚠️  Server will continue without database functionality');
    }
    
    logger.info('✅ Ready for frontend connections!');
  });
  
  module.exports = { app, server };
} else {
  // Export for testing
  module.exports = { app };
}
