/**
 * Admin Routes Tests
 * @description Tests for admin dashboard and management endpoints
 */

const request = require('supertest');
const { app } = require('../server');

describe('Admin Routes', () => {
  describe('GET /api/admin/dashboard', () => {
    it('should return admin dashboard data', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('system_overview');
      expect(response.body.data).toHaveProperty('recent_activity');
      expect(response.body.data).toHaveProperty('top_players');
      expect(response.body.data).toHaveProperty('category_popularity');
      expect(response.body.data).toHaveProperty('difficulty_distribution');
    });
  });

  describe('GET /api/admin/players', () => {
    it('should return player management data', async () => {
      const response = await request(app)
        .get('/api/admin/players')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('players');
      expect(response.body.data).toHaveProperty('pagination');
    });

    it('should handle pagination parameters', async () => {
      const response = await request(app)
        .get('/api/admin/players?page=2&limit=5')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.pagination).toHaveProperty('page', 2);
      expect(response.body.data.pagination).toHaveProperty('limit', 5);
    });

    it('should handle search parameter', async () => {
      const response = await request(app)
        .get('/api/admin/players?search=test')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('players');
    });

    it('should handle empty search parameter', async () => {
      const response = await request(app)
        .get('/api/admin/players?search=')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('players');
    });

    it('should handle whitespace search parameter', async () => {
      const response = await request(app)
        .get('/api/admin/players?search=   ')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('players');
    });
  });

  describe('GET /api/admin/export/games', () => {
    it('should return game export data', async () => {
      const response = await request(app)
        .get('/api/admin/export/games')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('GET /api/admin/export/players', () => {
    it('should return player export data', async () => {
      const response = await request(app)
        .get('/api/admin/export/players')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('GET /api/admin/system-health', () => {
    it('should return system health information', async () => {
      const response = await request(app)
        .get('/api/admin/system-health')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('GET /api/admin/games', () => {
    it('should return game management data', async () => {
      const response = await request(app)
        .get('/api/admin/games')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });

    it('should handle pagination parameters', async () => {
      const response = await request(app)
        .get('/api/admin/games?page=1&limit=10')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('games');
    });

    it('should handle status filter', async () => {
      const response = await request(app)
        .get('/api/admin/games?status=completed')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('games');
    });

    it('should handle date range filter', async () => {
      const response = await request(app)
        .get('/api/admin/games?startDate=2024-01-01&endDate=2024-12-31')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('games');
    });
  });
}); 