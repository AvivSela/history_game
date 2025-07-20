/**
 * Analytics Routes Tests
 * @description Tests for analytics and reporting endpoints
 */

const request = require('supertest');
const { app } = require('../server');

describe('Analytics Routes', () => {
  describe('GET /api/analytics/overview', () => {
    it('should return analytics overview data', async () => {
      const response = await request(app)
        .get('/api/analytics/overview')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('overall');
      expect(response.body.data).toHaveProperty('difficulty_distribution');
      expect(response.body.data).toHaveProperty('category_performance');
      expect(response.body.data).toHaveProperty('recent_activity');
    });
  });

  describe('GET /api/analytics/trends', () => {
    it('should return trend analysis data', async () => {
      const response = await request(app)
        .get('/api/analytics/trends')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('trends');
      expect(response.body.data).toHaveProperty('interval');
      expect(response.body.data).toHaveProperty('period');
    });

    it('should handle time period parameter', async () => {
      const response = await request(app)
        .get('/api/analytics/trends?period=7d')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('GET /api/analytics/difficulty/:level', () => {
    it('should return difficulty-specific analytics', async () => {
      const response = await request(app)
        .get('/api/analytics/difficulty/1')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });

    it('should handle invalid difficulty level', async () => {
      const response = await request(app)
        .get('/api/analytics/difficulty/6')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle non-numeric difficulty level', async () => {
      const response = await request(app)
        .get('/api/analytics/difficulty/abc')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle zero difficulty level', async () => {
      const response = await request(app)
        .get('/api/analytics/difficulty/0')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/analytics/category/:category', () => {
    it('should return category-specific analytics', async () => {
      const response = await request(app)
        .get('/api/analytics/category/History')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });

    it('should handle non-existent category', async () => {
      const response = await request(app)
        .get('/api/analytics/category/NonExistentCategory')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });
  });
}); 