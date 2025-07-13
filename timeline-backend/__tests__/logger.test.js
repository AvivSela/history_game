/**
 * Logger Utility Tests
 * Tests the logging functionality and different log levels
 */

const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

describe('Logger Utility', () => {
  const logsDir = path.join(__dirname, '..', 'logs');
  const today = new Date().toISOString().split('T')[0];
  const logFile = path.join(logsDir, `${today}.log`);

  // Mock console methods
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  const mockConsoleLog = jest.fn();
  const mockConsoleError = jest.fn();

  beforeAll(() => {
    console.log = mockConsoleLog;
    console.error = mockConsoleError;
  });

  afterAll(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    // Clear mocks
    mockConsoleLog.mockClear();
    mockConsoleError.mockClear();
    
    // Remove log file if it exists
    if (fs.existsSync(logFile)) {
      fs.unlinkSync(logFile);
    }
  });

  afterEach(() => {
    // Clean up log file
    if (fs.existsSync(logFile)) {
      fs.unlinkSync(logFile);
    }
  });

  describe('Log Levels', () => {
    it('should log error messages', () => {
      const message = 'Test error message';
      const data = { error: 'test' };
      
      logger.error(message, data);
      
      expect(mockConsoleLog).toHaveBeenCalled();
      expect(fs.existsSync(logFile)).toBe(true);
      
      const logContent = fs.readFileSync(logFile, 'utf8');
      expect(logContent).toContain('ERROR');
      expect(logContent).toContain(message);
    });

    it('should log warning messages', () => {
      const message = 'Test warning message';
      
      logger.warn(message);
      
      expect(mockConsoleLog).toHaveBeenCalled();
      expect(fs.existsSync(logFile)).toBe(true);
      
      const logContent = fs.readFileSync(logFile, 'utf8');
      expect(logContent).toContain('WARN');
      expect(logContent).toContain(message);
    });

    it('should log info messages', () => {
      const message = 'Test info message';
      
      logger.info(message);
      
      expect(mockConsoleLog).toHaveBeenCalled();
      expect(fs.existsSync(logFile)).toBe(true);
      
      const logContent = fs.readFileSync(logFile, 'utf8');
      expect(logContent).toContain('INFO');
      expect(logContent).toContain(message);
    });

    it('should log debug messages', () => {
      const message = 'Test debug message';
      
      // Set log level to DEBUG to allow debug messages
      process.env.LOG_LEVEL = 'DEBUG';
      
      logger.debug(message);
      
      expect(mockConsoleLog).toHaveBeenCalled();
      expect(fs.existsSync(logFile)).toBe(true);
      
      const logContent = fs.readFileSync(logFile, 'utf8');
      expect(logContent).toContain('DEBUG');
      expect(logContent).toContain(message);
    });
  });

  describe('Log Format', () => {
    it('should include timestamp in log entries', () => {
      const message = 'Test message';
      
      logger.info(message);
      
      const logContent = fs.readFileSync(logFile, 'utf8');
      const logEntry = JSON.parse(logContent.trim());
      
      expect(logEntry).toHaveProperty('timestamp');
      expect(logEntry).toHaveProperty('level');
      expect(logEntry).toHaveProperty('message');
      expect(logEntry.level).toBe('INFO');
      expect(logEntry.message).toBe(message);
    });

    it('should include data in log entries when provided', () => {
      const message = 'Test message';
      const data = { key: 'value', number: 123 };
      
      logger.info(message, data);
      
      const logContent = fs.readFileSync(logFile, 'utf8');
      const logEntry = JSON.parse(logContent.trim());
      
      expect(logEntry).toHaveProperty('data');
      expect(logEntry.data).toEqual(data);
    });
  });

  describe('Environment-based Logging', () => {
    const originalEnv = process.env.LOG_LEVEL;

    beforeEach(() => {
      // Reset log level before each test
      process.env.LOG_LEVEL = originalEnv;
    });

    afterEach(() => {
      process.env.LOG_LEVEL = originalEnv;
    });

    it('should default to INFO level when LOG_LEVEL is not set', () => {
      delete process.env.LOG_LEVEL;
      
      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');
      
      const logContent = fs.readFileSync(logFile, 'utf8');
      
      expect(logContent).not.toContain('DEBUG');
      expect(logContent).toContain('INFO');
      expect(logContent).toContain('WARN');
      expect(logContent).toContain('ERROR');
    });
  });

  describe('Specialized Logging Methods', () => {
    it('should log API requests', () => {
      const req = {
        method: 'GET',
        originalUrl: '/api/events',
        ip: '127.0.0.1',
        get: jest.fn().mockReturnValue('test-agent')
      };
      
      const res = {
        statusCode: 200
      };
      
      logger.request(req, res, 150);
      
      const logContent = fs.readFileSync(logFile, 'utf8');
      const logEntry = JSON.parse(logContent.trim());
      
      expect(logEntry.data).toHaveProperty('method', 'GET');
      expect(logEntry.data).toHaveProperty('url', '/api/events');
      expect(logEntry.data).toHaveProperty('statusCode', 200);
      expect(logEntry.data).toHaveProperty('responseTime', '150ms');
    });



    it('should log performance metrics', () => {
      logger.performance('API_CALL', 1200, { endpoint: '/api/events' });
      
      const logContent = fs.readFileSync(logFile, 'utf8');
      const logEntry = JSON.parse(logContent.trim());
      
      expect(logEntry.data).toHaveProperty('operation', 'API_CALL');
      expect(logEntry.data).toHaveProperty('duration', '1200ms');
      expect(logEntry.data).toHaveProperty('details');
    });
  });

  describe('File Logging', () => {
    it('should create log file with correct name format', () => {
      logger.info('Test message');
      
      expect(fs.existsSync(logFile)).toBe(true);
      expect(logFile).toMatch(/\d{4}-\d{2}-\d{2}\.log$/);
    });

    it('should append to existing log file', () => {
      logger.info('First message');
      logger.info('Second message');
      
      const logContent = fs.readFileSync(logFile, 'utf8');
      const lines = logContent.trim().split('\n');
      
      expect(lines).toHaveLength(2);
      expect(lines[0]).toContain('First message');
      expect(lines[1]).toContain('Second message');
    });
  });
}); 