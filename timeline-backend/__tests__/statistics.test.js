/**
 * Statistics API Tests
 * @description Tests for player statistics and analytics endpoints
 */

const request = require('supertest');
const { query } = require('../config/database');
const logger = require('../utils/logger');
const dbUtils = require('../utils/database');

// Import the server app
let app;
let server;

// Setup and teardown
beforeAll(async () => {
  // Import the server dynamically to avoid port conflicts
  const serverModule = require('../server');
  app = serverModule.app;
  server = serverModule.server;

  // Ensure we're in test environment
  process.env.NODE_ENV = 'test';
  
  // Initialize database if needed
  try {
    const { testConnection } = require('../config/database');
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Database connection failed');
    }
    console.log('✅ Database connected for statistics tests');
    
    // Initialize database
    await dbUtils.initializeDatabase();
    console.log('✅ Database initialized for statistics tests');
  } catch (error) {
    console.error('❌ Database setup error:', error.message);
    throw error;
  }
});

afterAll(async () => {
  if (server) {
    await new Promise(resolve => server.close(resolve));
  }
});

describe('Statistics API', () => {
  let testPlayerName = 'TestPlayer';
  let testSessionId;

  beforeEach(async () => {
    // Clean up any existing test data first
    await query('DELETE FROM game_sessions WHERE player_name = $1', [testPlayerName]);
    
    // Create test data for each test
    const sessionResult = await query(`
      INSERT INTO game_sessions (
        player_name, difficulty_level, card_count, categories, 
        status, score, total_moves, correct_moves, incorrect_moves,
        start_time, end_time, duration_seconds
      ) VALUES (
        $1, 2, 5, ARRAY['History', 'Technology'], 
        'completed', 80, 5, 4, 1,
        NOW() - INTERVAL '1 hour', NOW(), 3600
      ) RETURNING id
    `, [testPlayerName]);

    testSessionId = sessionResult.rows[0].id;

    // Create another session for more data
    await query(`
      INSERT INTO game_sessions (
        player_name, difficulty_level, card_count, categories, 
        status, score, total_moves, correct_moves, incorrect_moves,
        start_time, end_time, duration_seconds
      ) VALUES (
        $1, 3, 8, ARRAY['Science', 'History'], 
        'completed', 90, 8, 7, 1,
        NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour', 4800
      )
    `, [testPlayerName]);

    // Create an abandoned session
    await query(`
      INSERT INTO game_sessions (
        player_name, difficulty_level, card_count, categories, 
        status, score, total_moves, correct_moves, incorrect_moves,
        start_time, end_time, duration_seconds
      ) VALUES (
        $1, 1, 3, ARRAY['Technology'], 
        'abandoned', 0, 2, 1, 1,
        NOW() - INTERVAL '3 hours', NOW() - INTERVAL '2 hours', 1200
      )
    `, [testPlayerName]);

    // Verify test data was created
    const countResult = await query('SELECT COUNT(*) FROM game_sessions WHERE player_name = $1', [testPlayerName]);
    console.log(`📊 Created ${countResult.rows[0].count} test game sessions for ${testPlayerName}`);
  });

  afterEach(async () => {
    // Clean up test data after each test
    await query('DELETE FROM game_sessions WHERE player_name = $1', [testPlayerName]);
  });

  describe('GET /api/statistics/player/:playerName', () => {
    it('should return player statistics for valid player', async () => {
      const response = await request(app)
        .get(`/api/statistics/player/${testPlayerName}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('player_name', testPlayerName);
      expect(response.body.data).toHaveProperty('total_games_played');
      expect(response.body.data).toHaveProperty('total_games_won');
      expect(response.body.data).toHaveProperty('total_score');
      expect(response.body.data).toHaveProperty('average_score_per_game');
      expect(response.body.data).toHaveProperty('average_accuracy');
      expect(response.body.data).toHaveProperty('favorite_categories');
      expect(response.body.data).toHaveProperty('favorite_difficulty');
    });

    it('should return 400 for empty player name', async () => {
      const response = await request(app)
        .get('/api/statistics/player/')
        .expect(404);
    });

    it('should return 400 for missing player name', async () => {
      const response = await request(app)
        .get('/api/statistics/player/')
        .expect(404);
    });

    it('should return empty statistics for non-existent player', async () => {
      const response = await request(app)
        .get('/api/statistics/player/NonExistentPlayer')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.player_name).toBe('NonExistentPlayer');
      expect(response.body.data.total_games_played).toBe(0);
      expect(response.body.data.total_score).toBe(0);
    });
  });

  describe('GET /api/statistics/player/:playerName/categories', () => {
    it('should return category statistics for player', async () => {
      const response = await request(app)
        .get(`/api/statistics/player/${testPlayerName}/categories`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.player_name).toBe(testPlayerName);
      expect(response.body.data.category).toBe('all');
      expect(Array.isArray(response.body.data.statistics)).toBe(true);
      
      // Should have statistics for History, Technology, and Science categories
      const categories = response.body.data.statistics.map(s => s.category);
      expect(categories).toContain('History');
      expect(categories).toContain('Technology');
      expect(categories).toContain('Science');
    });

    it('should return statistics for specific category', async () => {
      const response = await request(app)
        .get(`/api/statistics/player/${testPlayerName}/categories?category=History`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.category).toBe('History');
      expect(response.body.data.statistics.length).toBe(1);
      expect(response.body.data.statistics[0].category).toBe('History');
    });

    it('should return empty array for non-existent category', async () => {
      const response = await request(app)
        .get(`/api/statistics/player/${testPlayerName}/categories?category=NonExistent`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.statistics).toEqual([]);
    });
  });

  describe('GET /api/statistics/player/:playerName/difficulty', () => {
    it('should return difficulty statistics for player', async () => {
      const response = await request(app)
        .get(`/api/statistics/player/${testPlayerName}/difficulty`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.player_name).toBe(testPlayerName);
      expect(response.body.data.difficulty_level).toBe('all');
      expect(Array.isArray(response.body.data.statistics)).toBe(true);
      
      // Should have statistics for difficulty levels 1, 2, and 3
      const difficulties = response.body.data.statistics.map(s => s.difficulty_level);
      expect(difficulties).toContain(1);
      expect(difficulties).toContain(2);
      expect(difficulties).toContain(3);
    });

    it('should return statistics for specific difficulty level', async () => {
      const response = await request(app)
        .get(`/api/statistics/player/${testPlayerName}/difficulty?level=2`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.difficulty_level).toBe(2);
      expect(response.body.data.statistics.length).toBe(1);
      expect(response.body.data.statistics[0].difficulty_level).toBe(2);
    });

    it('should return 400 for invalid difficulty level', async () => {
      const response = await request(app)
        .get(`/api/statistics/player/${testPlayerName}/difficulty?level=6`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Difficulty level must be between 1 and 5');
    });

    it('should return 400 for non-numeric difficulty level', async () => {
      const response = await request(app)
        .get(`/api/statistics/player/${testPlayerName}/difficulty?level=abc`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Difficulty level must be between 1 and 5');
    });
  });

  describe('GET /api/statistics/player/:playerName/progress', () => {
    it('should return player progression data', async () => {
      const response = await request(app)
        .get(`/api/statistics/player/${testPlayerName}/progress`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.player_name).toBe(testPlayerName);
      expect(response.body.data).toHaveProperty('total_games');
      expect(response.body.data).toHaveProperty('progression');
      expect(response.body.data).toHaveProperty('improvement');
      expect(Array.isArray(response.body.data.progression)).toBe(true);
    });

    it('should return empty progression for new player', async () => {
      const response = await request(app)
        .get('/api/statistics/player/NewPlayer/progress')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.total_games).toBe(0);
      expect(response.body.data.progression).toEqual([]);
    });
  });

  describe('GET /api/statistics/player/:playerName/daily', () => {
    it('should return daily statistics for player', async () => {
      const response = await request(app)
        .get(`/api/statistics/player/${testPlayerName}/daily`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.player_name).toBe(testPlayerName);
      expect(response.body.data.days).toBe(30);
      expect(Array.isArray(response.body.data.statistics)).toBe(true);
    });

    it('should respect days parameter', async () => {
      const response = await request(app)
        .get(`/api/statistics/player/${testPlayerName}/daily?days=7`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.days).toBe(7);
    });

    it('should return 400 for invalid days parameter', async () => {
      const response = await request(app)
        .get(`/api/statistics/player/${testPlayerName}/daily?days=400`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Days parameter must be between 1 and 365');
    });

    it('should return 400 for non-numeric days parameter', async () => {
      const response = await request(app)
        .get(`/api/statistics/player/${testPlayerName}/daily?days=abc`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Days parameter must be between 1 and 365');
    });
  });

  describe('GET /api/statistics/player/:playerName/weekly', () => {
    it('should return weekly statistics for player', async () => {
      const response = await request(app)
        .get(`/api/statistics/player/${testPlayerName}/weekly`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.player_name).toBe(testPlayerName);
      expect(response.body.data.weeks).toBe(12);
      expect(Array.isArray(response.body.data.statistics)).toBe(true);
    });

    it('should respect weeks parameter', async () => {
      const response = await request(app)
        .get(`/api/statistics/player/${testPlayerName}/weekly?weeks=4`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.weeks).toBe(4);
    });

    it('should return 400 for invalid weeks parameter', async () => {
      const response = await request(app)
        .get(`/api/statistics/player/${testPlayerName}/weekly?weeks=60`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Weeks parameter must be between 1 and 52');
    });
  });

  describe('GET /api/statistics/player/:playerName/summary', () => {
    it('should return comprehensive player summary', async () => {
      const response = await request(app)
        .get(`/api/statistics/player/${testPlayerName}/summary`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.player_name).toBe(testPlayerName);
      expect(response.body.data).toHaveProperty('overview');
      expect(response.body.data).toHaveProperty('categories');
      expect(response.body.data).toHaveProperty('difficulties');
      expect(response.body.data).toHaveProperty('progression');
      expect(response.body.data).toHaveProperty('recent_performance');
    });
  });

  describe('GET /api/statistics/players', () => {
    it('should return comparison statistics for multiple players', async () => {
      const response = await request(app)
        .get(`/api/statistics/players?players=${testPlayerName},AnotherPlayer`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.players).toEqual([testPlayerName, 'AnotherPlayer']);
      expect(Array.isArray(response.body.data.statistics)).toBe(true);
      expect(response.body.data.statistics.length).toBe(2);
      expect(response.body.data).toHaveProperty('comparison');
    });

    it('should return 400 for missing players parameter', async () => {
      const response = await request(app)
        .get('/api/statistics/players')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Players parameter is required (comma-separated list)');
    });

    it('should return 400 for empty players list', async () => {
      const response = await request(app)
        .get('/api/statistics/players?players=')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Players parameter is required (comma-separated list)');
    });

    it('should return 400 for too many players', async () => {
      const manyPlayers = Array.from({ length: 11 }, (_, i) => `Player${i}`).join(',');
      const response = await request(app)
        .get(`/api/statistics/players?players=${manyPlayers}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Maximum 10 players can be compared at once');
    });

    it('should handle players with no statistics gracefully', async () => {
      const response = await request(app)
        .get('/api/statistics/players?players=NoStatsPlayer')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.statistics[0].player_name).toBe('NoStatsPlayer');
      expect(response.body.data.statistics[0].total_games_played).toBe(0);
    });
  });
}); 