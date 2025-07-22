/**
 * Populate Test Database with Sample Events
 * @description Script to populate the test database with sample events for API testing
 */

const { query } = require('./config/database');

// Sample events data from server.js
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

async function populateTestDatabase() {
  try {
    console.log('🔧 Setting up test environment...');
    process.env.NODE_ENV = 'test';
    
    console.log('📝 Populating test database with sample events...');
    
    // Clear existing test data
    await query('DELETE FROM game_moves');
    await query('DELETE FROM game_sessions');
    await query('DELETE FROM cards WHERE id > 700'); // Keep the integration test card
    
    // Insert sample events
    for (const event of sampleEvents) {
      await query(`
        INSERT INTO cards (id, title, description, date_occurred, category, difficulty)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          date_occurred = EXCLUDED.date_occurred,
          category = EXCLUDED.category,
          difficulty = EXCLUDED.difficulty
      `, [
        event.id,
        event.title,
        event.description,
        event.dateOccurred,
        event.category,
        event.difficulty
      ]);
    }
    
    console.log(`✅ Successfully inserted ${sampleEvents.length} sample events`);
    
    // Verify the data
    const result = await query('SELECT COUNT(*) as count FROM cards');
    console.log(`📊 Total cards in database: ${result.rows[0].count}`);
    
    const categories = await query('SELECT DISTINCT category FROM cards ORDER BY category');
    console.log('📂 Available categories:', categories.rows.map(row => row.category));
    
  } catch (error) {
    console.error('❌ Error populating test database:', error.message);
    process.exit(1);
  }
}

// Run the script
populateTestDatabase(); 