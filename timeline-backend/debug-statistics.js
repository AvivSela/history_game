/**
 * Debug script for statistics functions
 */

const { query } = require('./config/database');
const statistics = require('./utils/statistics');
const logger = require('./utils/logger');

async function debugStatistics() {
  try {
    console.log('🔧 Setting up test environment...');
    
    // Set test environment
    process.env.NODE_ENV = 'test';
    
    // Force database config to use test environment
    const dbConfig = require('./config/database');
    
    // Test database connection
    const { testConnection } = require('./config/database');
    const isConnected = await testConnection();
    console.log('Database connected:', isConnected);
    
    if (!isConnected) {
      console.error('❌ Database connection failed');
      return;
    }
    
    // Check if test data exists
    const sessionCount = await query('SELECT COUNT(*) FROM game_sessions WHERE player_name = $1', ['TestPlayer']);
    console.log('TestPlayer sessions:', sessionCount.rows[0].count);
    
    const completedCount = await query('SELECT COUNT(*) FROM game_sessions WHERE player_name = $1 AND status = $2', ['TestPlayer', 'completed']);
    console.log('TestPlayer completed sessions:', completedCount.rows[0].count);
    
    // Show all sessions for debugging
    const allSessions = await query('SELECT player_name, status, score, categories FROM game_sessions LIMIT 5');
    console.log('All sessions sample:', allSessions.rows);
    
    // Test each statistics function
    console.log('\n🧪 Testing statistics functions...');
    
    try {
      console.log('1. Testing calculatePlayerStatistics...');
      const playerStats = await statistics.calculatePlayerStatistics('TestPlayer');
      console.log('✅ Player stats:', JSON.stringify(playerStats, null, 2));
    } catch (error) {
      console.error('❌ Player stats error:', error.message);
    }
    
    try {
      console.log('\n2. Testing calculateCategoryStatistics...');
      const categoryStats = await statistics.calculateCategoryStatistics('TestPlayer');
      console.log('✅ Category stats:', JSON.stringify(categoryStats, null, 2));
    } catch (error) {
      console.error('❌ Category stats error:', error.message);
    }
    
    try {
      console.log('\n3. Testing calculateDifficultyStatistics...');
      const difficultyStats = await statistics.calculateDifficultyStatistics('TestPlayer');
      console.log('✅ Difficulty stats:', JSON.stringify(difficultyStats, null, 2));
    } catch (error) {
      console.error('❌ Difficulty stats error:', error.message);
    }
    
    try {
      console.log('\n4. Testing calculateDailyStatistics...');
      const dailyStats = await statistics.calculateDailyStatistics('TestPlayer', 30);
      console.log('✅ Daily stats:', JSON.stringify(dailyStats, null, 2));
    } catch (error) {
      console.error('❌ Daily stats error:', error.message);
    }
    
    try {
      console.log('\n5. Testing calculateWeeklyStatistics...');
      const weeklyStats = await statistics.calculateWeeklyStatistics('TestPlayer', 12);
      console.log('✅ Weekly stats:', JSON.stringify(weeklyStats, null, 2));
    } catch (error) {
      console.error('❌ Weekly stats error:', error.message);
    }
    
    try {
      console.log('\n6. Testing getFavoriteCategories...');
      const favoriteCategories = await statistics.getFavoriteCategories('TestPlayer');
      console.log('✅ Favorite categories:', JSON.stringify(favoriteCategories, null, 2));
    } catch (error) {
      console.error('❌ Favorite categories error:', error.message);
    }
    
    try {
      console.log('\n7. Testing getFavoriteDifficulty...');
      const favoriteDifficulty = await statistics.getFavoriteDifficulty('TestPlayer');
      console.log('✅ Favorite difficulty:', JSON.stringify(favoriteDifficulty, null, 2));
    } catch (error) {
      console.error('❌ Favorite difficulty error:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
  } finally {
    const { closePool } = require('./config/database');
    await closePool();
    console.log('\n✅ Database pool closed');
  }
}

debugStatistics(); 