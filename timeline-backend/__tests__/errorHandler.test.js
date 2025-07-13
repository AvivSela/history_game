/**
 * Error Handler Middleware Tests
 * Tests the enhanced error handling functionality
 */

const request = require('supertest');
const express = require('express');
const { 
  errorHandler, 
  notFoundHandler, 
  asyncHandler, 
  ValidationError, 
  NotFoundError, 
  DatabaseError 
} = require('../middleware/errorHandler');

describe('Error Handler Middleware', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  describe('Custom Error Classes', () => {
    it('should create ValidationError with correct properties', () => {
      const error = new ValidationError('Invalid input', 'email');
      
      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Invalid input');
      expect(error.statusCode).toBe(400);
      expect(error.field).toBe('email');
    });

    it('should create NotFoundError with correct properties', () => {
      const error = new NotFoundError('User');
      
      expect(error.name).toBe('NotFoundError');
      expect(error.message).toBe('User not found');
      expect(error.statusCode).toBe(404);
    });

    it('should create DatabaseError with correct properties', () => {
      const error = new DatabaseError('Connection failed');
      
      expect(error.name).toBe('DatabaseError');
      expect(error.message).toBe('Connection failed');
      expect(error.statusCode).toBe(500);
    });
  });

  describe('asyncHandler', () => {
    it('should handle successful async operations', async () => {
      const handler = asyncHandler(async (req, res) => {
        res.json({ success: true });
      });

      app.get('/test', handler);
      app.use(errorHandler);

      const response = await request(app)
        .get('/test')
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should handle async errors', async () => {
      const handler = asyncHandler(async (req, res) => {
        throw new Error('Test error');
      });

      app.get('/test', handler);
      app.use(errorHandler);

      const response = await request(app)
        .get('/test')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Test error');
    });

    it('should handle custom errors with status codes', async () => {
      const handler = asyncHandler(async (req, res) => {
        throw new ValidationError('Invalid data', 'field');
      });

      app.get('/test', handler);
      app.use(errorHandler);

      const response = await request(app)
        .get('/test')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid data');
      expect(response.body.field).toBe('field');
    });
  });

  describe('notFoundHandler', () => {
    it('should return 404 for unmatched routes', async () => {
      app.use('*', notFoundHandler);

      const response = await request(app)
        .get('/nonexistent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Route not found');
      expect(response.body.path).toBe('/nonexistent');
      expect(response.body.method).toBe('GET');
      expect(response.body.availableRoutes).toBeDefined();
    });
  });

  describe('errorHandler', () => {
    it('should handle generic errors', async () => {
      app.get('/test', (req, res, next) => {
        next(new Error('Generic error'));
      });
      app.use(errorHandler);

      const response = await request(app)
        .get('/test')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Generic error');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.path).toBe('/test');
      expect(response.body.method).toBe('GET');
    });

    it('should handle custom errors with status codes', async () => {
      app.get('/test', (req, res, next) => {
        next(new NotFoundError('Resource'));
      });
      app.use(errorHandler);

      const response = await request(app)
        .get('/test')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Resource not found');
    });

    it('should include stack trace in development', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      app.get('/test', (req, res, next) => {
        next(new Error('Test error'));
      });
      app.use(errorHandler);

      const response = await request(app)
        .get('/test')
        .expect(500);

      expect(response.body.stack).toBeDefined();
      expect(response.body.name).toBeDefined();

      process.env.NODE_ENV = originalEnv;
    });

    it('should not include stack trace in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      app.get('/test', (req, res, next) => {
        next(new Error('Test error'));
      });
      app.use(errorHandler);

      const response = await request(app)
        .get('/test')
        .expect(500);

      expect(response.body.stack).toBeUndefined();
      expect(response.body.name).toBeUndefined();

      process.env.NODE_ENV = originalEnv;
    });
  });
}); 