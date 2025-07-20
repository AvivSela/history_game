/**
 * Test analytics endpoints
 */

const request = require('supertest');
const { query } = require('./config/database');

async function testAnalytics() {
  try {
    console.log('🔧 Setting up test environment...');
    
    // Set test environment
    process.env.NODE_ENV = 'test';
    
    // Import the server app
    const serverModule = require('./server');
    const app = serverModule.app;
    
    // Create test data first
    console.log('📊 Creating test data for analytics...');
    
    // Clear existing test data
    await query('DELETE FROM game_sessions WHERE player_name LIKE $1', ['TestPlayer%']);
    
    // Create multiple test players with different data
    const testPlayers = ['TestPlayer1', 'TestPlayer2', 'TestPlayer3'];
    const categories = ['History', 'Science', 'Technology', 'Space'];
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
    
    // Test analytics endpoints
    console.log('\n🧪 Testing analytics endpoints...');
    
    // Test overview endpoint
    console.log('1. Testing /api/analytics/overview...');
    const overviewResponse = await request(app)
      .get('/api/analytics/overview')
      .expect(200);
    
    console.log('✅ Overview response:', {
      total_games: overviewResponse.body.data.overall.total_games,
      unique_players: overviewResponse.body.data.overall.unique_players,
      categories: overviewResponse.body.data.category_performance.length
    });
    
    // Test difficulty analytics
    console.log('\n2. Testing /api/analytics/difficulty/2...');
    const difficultyResponse = await request(app)
      .get('/api/analytics/difficulty/2')
      .expect(200);
    
    console.log('✅ Difficulty response:', {
      difficulty_level: difficultyResponse.body.data.difficulty_level,
      total_games: difficultyResponse.body.data.overview.total_games,
      categories: difficultyResponse.body.data.category_performance.length
    });
    
    // Test category analytics
    console.log('\n3. Testing /api/analytics/category/History...');
    const categoryResponse = await request(app)
      .get('/api/analytics/category/History')
      .expect(200);
    
    console.log('✅ Category response:', {
      category: categoryResponse.body.data.category,
      total_games: categoryResponse.body.data.overview.total_games,
      difficulties: categoryResponse.body.data.difficulty_performance.length
    });
    
    // Test trends endpoint
    console.log('\n4. Testing /api/analytics/trends...');
    const trendsResponse = await request(app)
      .get('/api/analytics/trends?days=7&interval=day')
      .expect(200);
    
    console.log('✅ Trends response:', {
      period: trendsResponse.body.data.period,
      interval: trendsResponse.body.data.interval,
      trend_count: trendsResponse.body.data.trends.length
    });
    
    console.log('\n🎉 All analytics endpoints working correctly!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    const { closePool } = require('./config/database');
    await closePool();
    console.log('\n✅ Database pool closed');
  }
}

testAnalytics(); 