const request = require('supertest');
const { query } = require('./config/database');

// Import app dynamically to avoid circular dependencies
let app, server;

async function debugTest() {
  try {
    // Dynamic import to avoid circular dependencies
    const serverModule = await import('./server.js');
    app = serverModule.app;
    server = serverModule.server;
    
    console.log('Testing statistics endpoint...');
    
    // First, let's check if there are any statistics in the database
    const statsResult = await query('SELECT COUNT(*) as count FROM player_statistics');
    console.log('Player statistics count:', statsResult.rows[0].count);
    
    const categoryStatsResult = await query('SELECT COUNT(*) as count FROM category_statistics');
    console.log('Category statistics count:', categoryStatsResult.rows[0].count);
    
    // Check if there are any game sessions
    const sessionsResult = await query('SELECT COUNT(*) as count FROM game_sessions WHERE status = \'completed\'');
    console.log('Completed game sessions count:', sessionsResult.rows[0].count);
    
    // Check what's in the statistics tables
    const playerStats = await query('SELECT * FROM player_statistics');
    console.log('Player statistics:', JSON.stringify(playerStats.rows, null, 2));
    
    const categoryStats = await query('SELECT * FROM category_statistics');
    console.log('Category statistics:', JSON.stringify(categoryStats.rows, null, 2));
    
    // Test the categories endpoint
    const response = await request(app)
      .get('/api/statistics/player/TestPlayer/categories');
    
    console.log('Response status:', response.status);
    console.log('Response body:', JSON.stringify(response.body, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (server) {
      await server.close();
    }
  }
}

debugTest(); 