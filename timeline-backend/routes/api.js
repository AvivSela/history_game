const express = require('express');
const router = express.Router();

// Sample events data (we'll replace with database later)
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
  },
  { 
    id: 13, 
    title: "Personal Computer introduced", 
    dateOccurred: "1975-01-01", 
    category: "Technology", 
    difficulty: 2,
    description: "Altair 8800 becomes the first commercially successful personal computer"
  },
  { 
    id: 14, 
    title: "Penicillin discovered", 
    dateOccurred: "1928-09-28", 
    category: "Science", 
    difficulty: 2,
    description: "Alexander Fleming discovers penicillin's antibiotic properties"
  },
  { 
    id: 15, 
    title: "Television invented", 
    dateOccurred: "1926-01-26", 
    category: "Technology", 
    difficulty: 2,
    description: "John Logie Baird demonstrates the first television broadcast"
  }
];

// Get all events
router.get('/events', (req, res) => {
  try {
    res.json({
      success: true,
      count: sampleEvents.length,
      data: sampleEvents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch events'
    });
  }
});

// Get random events for a game - fix the parameter syntax
router.get('/events/random/:count', (req, res) => {
  try {
    const count = parseInt(req.params.count) || 5;
    
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
      data: selectedEvents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch random events'
    });
  }
});

// Get events by category - fix the parameter syntax
router.get('/events/category/:category', (req, res) => {
  try {
    const category = req.params.category;
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
    res.status(500).json({
      success: false,
      error: 'Failed to fetch events by category'
    });
  }
});

// Get events by difficulty - fix the parameter syntax
router.get('/events/difficulty/:level', (req, res) => {
  try {
    const level = parseInt(req.params.level);
    
    if (level < 1 || level > 3) {
      return res.status(400).json({
        success: false,
        error: 'Difficulty level must be between 1 and 3'
      });
    }
    
    const filtered = sampleEvents.filter(event => event.difficulty === level);
    
    res.json({
      success: true,
      count: filtered.length,
      difficulty: level,
      data: filtered
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch events by difficulty'
    });
  }
});

// Get available categories
router.get('/categories', (req, res) => {
  try {
    const categories = [...new Set(sampleEvents.map(event => event.category))];
    
    res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    });
  }
});

module.exports = router;
