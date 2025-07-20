module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ],
  
  // Coverage settings
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'server.js',
    'routes/**/*.js',
    'middleware/**/*.js',
    'utils/**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    // Exclude test files and folders
    '!**/__tests__/**',
    '!**/?(*.)+(spec|test).js',
    // Exclude configuration, migration and entry index files
    '!**/config/**',
    '!**/migrations/**',
    '!**/index.js'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 65,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
  
  // Global teardown
  globalTeardown: '<rootDir>/__tests__/globalTeardown.js',
  
  // Test timeout
  testTimeout: 10000,
  
  // Verbose output
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks between tests
  restoreMocks: true,
  
  // Module file extensions
  moduleFileExtensions: ['js', 'json'],
  
  // Transform settings
  transform: {},
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/'
  ],
  
  // Force exit after tests complete
  forceExit: true,
  
  // Detect open handles
  detectOpenHandles: true,
  
  // Worker idle memory limit
  workerIdleMemoryLimit: '512MB'
}; 