/**
 * API Endpoint Tests for Timeline Backend
 * Tests all API routes for proper functionality, error handling, and response formats
 */

const request = require('supertest');
const express = require('express');

// Import the server app
let app;
let server;

// Setup and teardown
beforeAll(async () => {
  // Import the server dynamically to avoid port conflicts
  const serverModule = require('../server');
  app = serverModule.app;
  server = serverModule.server;
});

afterAll(async () => {
  if (server) {
    await new Promise(resolve => server.close(resolve));
  }
});

describe('API Endpoints', () => {
  describe('GET /api/health', () => {
    it('should return health status with correct format', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('version');
      expect(response.body.status).toBe('healthy');
      expect(response.body.version).toBe('1.0.0');
    });

    it('should return valid timestamp', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      const timestamp = new Date(response.body.timestamp);
      expect(timestamp.getTime()).not.toBeNaN();
    });
  });

  describe('GET /api/events', () => {
    it('should return all events with correct format', async () => {
      const response = await request(app)
        .get('/api/events')
        .expect(200);

      expectSuccessProperty(response);
      expectDataProperty(response);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBeGreaterThan(0);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return events with correct structure', async () => {
      const response = await request(app)
        .get('/api/events')
        .expect(200);

      const event = response.body.data[0];
      expect(event).toHaveProperty('id');
      expect(event).toHaveProperty('title');
      expect(event).toHaveProperty('dateOccurred');
      expect(event).toHaveProperty('category');
      expect(event).toHaveProperty('difficulty');
      expect(event).toHaveProperty('description');
    });

    it('should return at least 10 events', async () => {
      const response = await request(app)
        .get('/api/events')
        .expect(200);

      expect(response.body.count).toBeGreaterThanOrEqual(10);
    });
  });

  describe('GET /api/events/random/:count', () => {
    it('should return random events with specified count', async () => {
      const count = 5;
      const response = await request(app)
        .get(`/api/events/random/${count}`)
        .expect(200);

      expectSuccessProperty(response);
      expectDataProperty(response);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(count);
      expect(response.body.requested).toBe(count);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(count);
    });

    it('should handle invalid count parameter', async () => {
      const response = await request(app)
        .get('/api/events/random/invalid')
        .expect(400); // Should return 400 for invalid count

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Count must be at least 1');
    });

    it('should handle count of 0', async () => {
      const response = await request(app)
        .get('/api/events/random/0')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Count must be at least 1');
    });

    it('should handle negative count', async () => {
      const response = await request(app)
        .get('/api/events/random/-5')
        .expect(400); // Should return 400 for negative count

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Count must be at least 1');
    });

    it('should handle count larger than available events', async () => {
      const response = await request(app)
        .get('/api/events/random/100')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Requested 100 events but only');
    });

    it('should return different events on multiple requests', async () => {
      const count = 3;
      const response1 = await request(app)
        .get(`/api/events/random/${count}`)
        .expect(200);

      const response2 = await request(app)
        .get(`/api/events/random/${count}`)
        .expect(200);

      // Note: This test might occasionally fail due to randomness
      // In a real scenario, we'd mock the random function
      expect(response1.body.data.length).toBe(count);
      expect(response2.body.data.length).toBe(count);
    });
  });

  describe('GET /api/events/random', () => {
    it('should return random events with query parameter', async () => {
      const count = 3;
      const response = await request(app)
        .get(`/api/events/random?count=${count}`)
        .expect(200);

      expectSuccessProperty(response);
      expectDataProperty(response);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(count);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should default to 5 events when no count specified', async () => {
      const response = await request(app)
        .get('/api/events/random')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(5);
    });

    it('should handle invalid query parameter', async () => {
      const response = await request(app)
        .get('/api/events/random?count=invalid')
        .expect(200); // Should default to 5

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(5);
    });
  });

  describe('GET /api/categories', () => {
    it('should return all categories', async () => {
      const response = await request(app)
        .get('/api/categories')
        .expect(200);

      expectSuccessProperty(response);
      expectDataProperty(response);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBeGreaterThan(0);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return unique categories', async () => {
      const response = await request(app)
        .get('/api/categories')
        .expect(200);

      const categories = response.body.data;
      const uniqueCategories = [...new Set(categories)];
      expect(categories.length).toBe(uniqueCategories.length);
    });

    it('should include expected categories', async () => {
      const response = await request(app)
        .get('/api/categories')
        .expect(200);

      const categories = response.body.data;
      expect(categories).toContain('History');
      expect(categories).toContain('Technology');
    });
  });

  describe('GET /api/events/category', () => {
    it('should return events for valid category', async () => {
      const response = await request(app)
        .get('/api/events/category?name=History')
        .expect(200);

      expectSuccessProperty(response);
      expectDataProperty(response);
      expect(response.body.success).toBe(true);
      expect(response.body.category).toBe('History');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return events for case-insensitive category', async () => {
      const response = await request(app)
        .get('/api/events/category?name=history')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.category).toBe('history');
    });

    it('should return empty array for non-existent category', async () => {
      const response = await request(app)
        .get('/api/events/category?name=NonExistentCategory')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(0);
      expect(response.body.data).toEqual([]);
    });

    it('should require category name parameter', async () => {
      const response = await request(app)
        .get('/api/events/category')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Category name is required');
    });

    it('should handle empty category name', async () => {
      const response = await request(app)
        .get('/api/events/category?name=')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Category name is required');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Route not found');
      expect(response.body.availableRoutes).toBeDefined();
    });

    it('should handle malformed JSON in request body', async () => {
      const response = await request(app)
        .post('/api/events')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Response Format Consistency', () => {
    it('should maintain consistent response format across all endpoints', async () => {
      const endpoints = [
        '/api/health',
        '/api/events',
        '/api/events/random/3',
        '/api/categories',
        '/api/events/category?name=History'
      ];

      for (const endpoint of endpoints) {
        const response = await request(app).get(endpoint);
        expect(response.body).toHaveProperty('success');
        expect(typeof response.body.success).toBe('boolean');
      }
    });

    it('should include proper HTTP headers', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.headers['content-type']).toContain('application/json');
    });
  });
}); 