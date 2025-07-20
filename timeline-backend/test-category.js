/**
 * Test category filtering
 */

const { query } = require('./config/database');
const statistics = require('./utils/statistics');

async function testCategoryFiltering() {
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
    
    console.log('\n🧪 Testing category filtering...');
    
    // Test all categories
    console.log('1. Testing all categories...');
    const allCategories = await statistics.calculateCategoryStatistics('TestPlayer');
    console.log('✅ All categories:', allCategories.map(c => c.category));
    
    // Test specific category
    console.log('\n2. Testing History category...');
    const historyCategory = await statistics.calculateCategoryStatistics('TestPlayer', 'History');
    console.log('✅ History category count:', historyCategory.length);
    console.log('✅ History category:', historyCategory.map(c => c.category));
    
    // Test specific category
    console.log('\n3. Testing Technology category...');
    const technologyCategory = await statistics.calculateCategoryStatistics('TestPlayer', 'Technology');
    console.log('✅ Technology category count:', technologyCategory.length);
    console.log('✅ Technology category:', technologyCategory.map(c => c.category));
    
    // Test specific category
    console.log('\n4. Testing Science category...');
    const scienceCategory = await statistics.calculateCategoryStatistics('TestPlayer', 'Science');
    console.log('✅ Science category count:', scienceCategory.length);
    console.log('✅ Science category:', scienceCategory.map(c => c.category));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    const { closePool } = require('./config/database');
    await closePool();
    console.log('\n✅ Database pool closed');
  }
}

testCategoryFiltering(); 