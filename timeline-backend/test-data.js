/**
 * Test data insertion script
 */

const { query } = require('./config/database');

async function insertTestData() {
  try {
    console.log('🔧 Setting up test environment...');
    
    // Set test environment
    process.env.NODE_ENV = 'test';
    
    // Test database connection
    const { testConnection } = require('./config/database');
    const isConnected = await testConnection();
    console.log('Database connected:', isConnected);
    
    if (!isConnected) {
      console.error('❌ Database connection failed');
      return;
    }
    
    // Clear existing test data
    await query('DELETE FROM game_sessions WHERE player_name = $1', ['TestPlayer']);
    console.log('✅ Cleared existing test data');
    
    // Insert test data
    const sessionResult = await query(`
      INSERT INTO game_sessions (
        player_name, difficulty_level, card_count, categories, 
        status, score, total_moves, correct_moves, incorrect_moves,
        start_time, end_time, duration_seconds
      ) VALUES (
        $1, 2, 5, ARRAY['History', 'Technology'], 
        $2, 80, 5, 4, 1,
        NOW() - INTERVAL '1 hour', NOW(), 3600
      ) RETURNING id
    `, ['TestPlayer', 'completed']);

    console.log('✅ Created session with ID:', sessionResult.rows[0].id);

    // Create another session
    await query(`
      INSERT INTO game_sessions (
        player_name, difficulty_level, card_count, categories, 
        status, score, total_moves, correct_moves, incorrect_moves,
        start_time, end_time, duration_seconds
      ) VALUES (
        $1, 3, 8, ARRAY['Science', 'History'], 
        $2, 90, 8, 7, 1,
        NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour', 4800
      )
    `, ['TestPlayer', 'completed']);

    console.log('✅ Created second session');

    // Create an abandoned session
    await query(`
      INSERT INTO game_sessions (
        player_name, difficulty_level, card_count, categories, 
        status, score, total_moves, correct_moves, incorrect_moves,
        start_time, end_time, duration_seconds
      ) VALUES (
        $1, 1, 3, ARRAY['Technology'], 
        $2, 0, 2, 1, 1,
        NOW() - INTERVAL '3 hours', NOW() - INTERVAL '2 hours', 1200
      )
    `, ['TestPlayer', 'abandoned']);

    console.log('✅ Created abandoned session');

    // Verify test data
    const sessionCount = await query('SELECT COUNT(*) FROM game_sessions WHERE player_name = $1', ['TestPlayer']);
    console.log('✅ Total TestPlayer sessions:', sessionCount.rows[0].count);
    
    const completedCount = await query('SELECT COUNT(*) FROM game_sessions WHERE player_name = $1 AND status = $2', ['TestPlayer', 'completed']);
    console.log('✅ TestPlayer completed sessions:', completedCount.rows[0].count);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    const { closePool } = require('./config/database');
    await closePool();
    console.log('\n✅ Database pool closed');
  }
}

insertTestData(); 