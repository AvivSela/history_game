const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

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
    message: 'Timeline API is running!',
    timestamp: new Date().toISOString(),
    status: 'healthy',
    version: '1.0.0'
  });
});

// Get all events
app.get('/api/events', (req, res) => {
  try {
    console.log('📊 Fetching all events...');
    res.json({
      success: true,
      count: sampleEvents.length,
      data: sampleEvents
    });
  } catch (error) {
    console.error('❌ Error fetching events:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch events'
    });
  }
});

// Get random events for a game (using simpler parameter handling)
app.get('/api/events/random/:count', (req, res) => {
  try {
    const countParam = req.params.count;
    const count = parseInt(countParam) || 5;
    
    console.log(`🎲 Fetching ${count} random events...`);
    
    if (count > sampleEvents.length) {
      return res.status(400).json({
        success: false,
        error: `Requested ${count} events but only ${sampleEvents.length} available`
      });
    }
    
    if (count < 1) {
      return res.status(400).json({
        success: false,
        error: 'Count must be at least 1'
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
  } catch (error) {
    console.error('❌ Error in random events:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch random events'
    });
  }
});

// Alternative route without parameters (fallback)
app.get('/api/events/random', (req, res) => {
  try {
    const count = parseInt(req.query.count) || 5;
    console.log(`🎲 Fetching ${count} random events (query param)...`);
    
    const shuffled = [...sampleEvents].sort(() => 0.5 - Math.random());
    const selectedEvents = shuffled.slice(0, count);
    
    res.json({
      success: true,
      count: selectedEvents.length,
      data: selectedEvents
    });
  } catch (error) {
    console.error('❌ Error in random events (query):', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch random events'
    });
  }
});

// Get available categories
app.get('/api/categories', (req, res) => {
  try {
    console.log('📁 Fetching categories...');
    const categories = [...new Set(sampleEvents.map(event => event.category))];
    
    res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    });
  }
});

// Get events by category (using query parameters instead of path parameters)
app.get('/api/events/category', (req, res) => {
  try {
    const category = req.query.name;
    if (!category) {
      return res.status(400).json({
        success: false,
        error: 'Category name is required as query parameter (?name=History)'
      });
    }
    
    console.log(`📂 Fetching events for category: ${category}`);
    const filtered = sampleEvents.filter(event => 
      event.category.toLowerCase() === category.toLowerCase()
    );
    
    res.json({
      success: true,
      count: filtered.length,
      category: category,
      data: filtered
    });
  } catch (error) {
    console.error('❌ Error fetching events by category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch events by category'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('🚨 Server Error:', err.stack);
  res.status(500).json({ 
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
  });
});

// Handle 404s
app.use('*', (req, res) => {
  console.log(`🔍 Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    success: false,
    error: 'Route not found',
    availableRoutes: [
      'GET /api/health',
      'GET /api/events',
      'GET /api/events/random/:count',
      'GET /api/events/random?count=5',
      'GET /api/categories',
      'GET /api/events/category?name=History'
    ]
  });
});

app.listen(PORT, () => {
  console.log('🚀 Timeline API Server Successfully Started!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`💓 Health: http://localhost:${PORT}/api/health`);
  console.log(`📊 Events: http://localhost:${PORT}/api/events`);
  console.log(`🎲 Random: http://localhost:${PORT}/api/events/random/5`);
  console.log(`📁 Categories: http://localhost:${PORT}/api/categories`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Ready for frontend connections!');
});
