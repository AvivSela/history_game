/**
 * Test export endpoints
 */

const request = require('supertest');
const { query } = require('./config/database');

async function testExport() {
  try {
    console.log('🔧 Setting up test environment...');
    
    // Set test environment
    process.env.NODE_ENV = 'test';
    
    // Import the server app
    const serverModule = require('./server');
    const app = serverModule.app;
    
    // Create test data first
    console.log('📊 Creating test data for export...');
    
    // Clear existing test data
    await query('DELETE FROM game_sessions WHERE player_name LIKE $1', ['TestPlayer%']);
    
    // Create multiple test players with different data
    const testPlayers = ['TestPlayer1', 'TestPlayer2', 'TestPlayer3'];
    const categories = ['History', 'Science', 'Technology'];
    const difficulties = [1, 2, 3];
    
    for (let i = 0; i < 10; i++) {
      const player = testPlayers[i % testPlayers.length];
      const category = categories[i % categories.length];
      const difficulty = difficulties[i % difficulties.length];
      const score = Math.floor(Math.random() * 100) + 10;
      const status = Math.random() > 0.2 ? 'completed' : 'abandoned';
      
      await query(`
        INSERT INTO game_sessions (
          player_name, difficulty_level, card_count, categories, 
          status, score, total_moves, correct_moves, incorrect_moves,
          start_time, end_time, duration_seconds
        ) VALUES (
          $1, $2, 5, ARRAY[$3], 
          $4, $5, 5, 4, 1,
          NOW() - INTERVAL '${i} hours', NOW() - INTERVAL '${i-1} hours', 3600
        )
      `, [player, difficulty, category, status, score]);
    }
    
    console.log('✅ Test data created');
    
    // Test export endpoints
    console.log('\n🧪 Testing export endpoints...');
    
    // Test games export (JSON)
    console.log('1. Testing /api/admin/export/games (JSON)...');
    const gamesJsonResponse = await request(app)
      .get('/api/admin/export/games?format=json')
      .expect(200);
    
    console.log('✅ Games JSON export:', {
      total_records: gamesJsonResponse.body.data.export_info.total_records,
      format: gamesJsonResponse.body.data.export_info.format
    });
    
    // Test games export (CSV)
    console.log('\n2. Testing /api/admin/export/games (CSV)...');
    const gamesCsvResponse = await request(app)
      .get('/api/admin/export/games?format=csv')
      .expect(200);
    
    console.log('✅ Games CSV export:', {
      content_type: gamesCsvResponse.headers['content-type'],
      content_disposition: gamesCsvResponse.headers['content-disposition']
    });
    
    // Test players export (JSON)
    console.log('\n3. Testing /api/admin/export/players (JSON)...');
    const playersJsonResponse = await request(app)
      .get('/api/admin/export/players?format=json')
      .expect(200);
    
    console.log('✅ Players JSON export:', {
      total_records: playersJsonResponse.body.data.export_info.total_records,
      format: playersJsonResponse.body.data.export_info.format
    });
    
    // Test players export (CSV)
    console.log('\n4. Testing /api/admin/export/players (CSV)...');
    const playersCsvResponse = await request(app)
      .get('/api/admin/export/players?format=csv')
      .expect(200);
    
    console.log('✅ Players CSV export:', {
      content_type: playersCsvResponse.headers['content-type'],
      content_disposition: playersCsvResponse.headers['content-disposition']
    });
    
    console.log('\n🎉 All export endpoints working correctly!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    const { closePool } = require('./config/database');
    await closePool();
    console.log('\n✅ Database pool closed');
  }
}

testExport(); 