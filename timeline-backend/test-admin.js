/**
 * Test admin endpoints
 */

const request = require('supertest');
const { query } = require('./config/database');

async function testAdmin() {
  try {
    console.log('🔧 Setting up test environment...');
    
    // Set test environment
    process.env.NODE_ENV = 'test';
    
    // Import the server app
    const serverModule = require('./server');
    const app = serverModule.app;
    
    // Create test data first
    console.log('📊 Creating test data for admin...');
    
    // Clear existing test data
    await query('DELETE FROM game_sessions WHERE player_name LIKE $1', ['TestPlayer%']);
    
    // Create multiple test players with different data
    const testPlayers = ['TestPlayer1', 'TestPlayer2', 'TestPlayer3', 'TestPlayer4'];
    const categories = ['History', 'Science', 'Technology', 'Space'];
    const difficulties = [1, 2, 3, 4];
    
    for (let i = 0; i < 15; i++) {
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
    
    // Test admin endpoints
    console.log('\n🧪 Testing admin endpoints...');
    
    // Test dashboard endpoint
    console.log('1. Testing /api/admin/dashboard...');
    const dashboardResponse = await request(app)
      .get('/api/admin/dashboard')
      .expect(200);
    
    console.log('✅ Dashboard response:', {
      total_games: dashboardResponse.body.data.system_overview.total_games,
      unique_players: dashboardResponse.body.data.system_overview.unique_players,
      top_players: dashboardResponse.body.data.top_players.length,
      categories: dashboardResponse.body.data.category_popularity.length
    });
    
    // Test players endpoint
    console.log('\n2. Testing /api/admin/players...');
    const playersResponse = await request(app)
      .get('/api/admin/players?page=1&limit=5')
      .expect(200);
    
    console.log('✅ Players response:', {
      players_count: playersResponse.body.data.players.length,
      total_players: playersResponse.body.data.pagination.total,
      pages: playersResponse.body.data.pagination.pages
    });
    
    // Test games endpoint
    console.log('\n3. Testing /api/admin/games...');
    const gamesResponse = await request(app)
      .get('/api/admin/games?page=1&limit=5')
      .expect(200);
    
    console.log('✅ Games response:', {
      games_count: gamesResponse.body.data.games.length,
      total_games: gamesResponse.body.data.pagination.total,
      pages: gamesResponse.body.data.pagination.pages
    });
    
    // Test system health endpoint
    console.log('\n4. Testing /api/admin/system-health...');
    const healthResponse = await request(app)
      .get('/api/admin/system-health')
      .expect(200);
    
    console.log('✅ System health response:', {
      status: healthResponse.body.data.status,
      total_sessions: healthResponse.body.data.database.total_sessions,
      active_players_24h: healthResponse.body.data.database.active_players_24h
    });
    
    // Test game deletion (get a game ID first)
    console.log('\n5. Testing /api/admin/games/:id DELETE...');
    const gameToDelete = gamesResponse.body.data.games[0];
    if (gameToDelete) {
      const deleteResponse = await request(app)
        .delete(`/api/admin/games/${gameToDelete.id}`)
        .expect(200);
      
      console.log('✅ Delete response:', deleteResponse.body.message);
    }
    
    console.log('\n🎉 All admin endpoints working correctly!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    const { closePool } = require('./config/database');
    await closePool();
    console.log('\n✅ Database pool closed');
  }
}

testAdmin(); 