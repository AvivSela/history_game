/**
 * Global setup file for Jest
 * Populates the test database with sample data before all tests run
 */

module.exports = async () => {
  try {
    console.log('🔧 Setting up test database...');
    
    // Set test environment
    process.env.NODE_ENV = 'test';
    
    // Test Prisma client connection
    console.log('🔍 Testing Prisma client connection...');
    const { getPrismaClient } = require('../utils/prismaClient');
    const prisma = getPrismaClient();
    await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Prisma client connection test passed');
    
    // Run the populate script
    const { execSync } = require('child_process');
    execSync('node populate-test-db.js', { 
      cwd: __dirname + '/..',
      env: { ...process.env, NODE_ENV: 'test' },
      stdio: 'inherit'
    });
    
    console.log('✅ Test database setup completed');
  } catch (error) {
    console.error('❌ Test database setup failed:', error.message);
    throw error;
  }
}; 