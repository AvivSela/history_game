const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { errorHandler, notFoundHandler, asyncHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({
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

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    message: 'Timeline API is running!',
    timestamp: new Date().toISOString(),
    status: 'healthy',
    version: '1.0.0'
  });
});

// Get all events
app.get('/api/events', asyncHandler(async (req, res) => {
  logger.info('📊 Fetching all events...');
  res.json({
    success: true,
    count: sampleEvents.length,
    data: sampleEvents
  });
}));

// Get random events for a game (using simpler parameter handling)
app.get('/api/events/random/:count', asyncHandler(async (req, res) => {
  const countParam = req.params.count;
  const count = parseInt(countParam);
  
  logger.info(`🎲 Fetching ${count} random events...`);
  
  // Handle invalid or negative counts
  if (isNaN(count) || count < 1) {
    return res.status(400).json({
      success: false,
      error: 'Count must be at least 1'
    });
  }
  
  if (count > sampleEvents.length) {
    return res.status(400).json({
      success: false,
      error: `Requested ${count} events but only ${sampleEvents.length} available`
    });
  }
  
  // Create a copy and shuffle
  const shuffled = [...sampleEvents].sort(() => 0.5 - Math.random());
  const selectedEvents = shuffled.slice(0, count);
  
  res.json({
    success: true,
    count: selectedEvents.length,
    requested: count,
    data: selectedEvents
  });
}));

// Alternative route without parameters (fallback)
app.get('/api/events/random', asyncHandler(async (req, res) => {
  const count = parseInt(req.query.count) || 5;
  logger.info(`🎲 Fetching ${count} random events (query param)...`);
  
  const shuffled = [...sampleEvents].sort(() => 0.5 - Math.random());
  const selectedEvents = shuffled.slice(0, count);
  
  res.json({
    success: true,
    count: selectedEvents.length,
    data: selectedEvents
  });
}));

// Get available categories
app.get('/api/categories', asyncHandler(async (req, res) => {
  logger.info('📁 Fetching categories...');
  const categories = [...new Set(sampleEvents.map(event => event.category))];
  
  res.json({
    success: true,
    count: categories.length,
    data: categories
  });
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
  const filtered = sampleEvents.filter(event => 
    event.category.toLowerCase() === category.toLowerCase()
  );
  
  res.json({
    success: true,
    count: filtered.length,
    category: category,
    data: filtered
  });
}));

// Error handling middleware
app.use(errorHandler);

// Handle 404s
app.use('*', notFoundHandler);

const server = app.listen(PORT, () => {
  logger.info('🚀 Timeline API Server Successfully Started!');
  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  logger.info(`📍 Server: http://localhost:${PORT}`);
  logger.info(`💓 Health: http://localhost:${PORT}/api/health`);
  logger.info(`📊 Events: http://localhost:${PORT}/api/events`);
  logger.info(`🎲 Random: http://localhost:${PORT}/api/events/random/5`);
  logger.info(`📁 Categories: http://localhost:${PORT}/api/categories`);
  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  logger.info('✅ Ready for frontend connections!');
});

// Export for testing
module.exports = { app, server };
