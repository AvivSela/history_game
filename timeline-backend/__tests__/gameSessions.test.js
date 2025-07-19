/**
 * Game Sessions API Tests
 * Tests for game session management endpoints
 */

const request = require('supertest');
const { app } = require('../server');
const GameSession = require('../models/GameSession');
const { query } = require('../config/database');
const dbUtils = require('../utils/database');

// Temporarily enable console output for debugging
const originalLog = console.log;
const originalError = console.error;
console.log = originalLog;
console.error = originalError;

describe('Game Sessions API', () => {
  let testSessionId;
  const testCardId = 1; // Use a known card ID from the database

  beforeAll(async () => {
    // Ensure we're in test environment
    process.env.NODE_ENV = 'test';
    
    // Initialize database if needed
    try {
      const { testConnection } = require('../config/database');
      const isConnected = await testConnection();
      if (!isConnected) {
        throw new Error('Database connection failed');
      }
      console.log('✅ Database connected for tests');
      
      // Initialize database
      await dbUtils.initializeDatabase();
      console.log('✅ Database initialized for tests');
    } catch (error) {
      console.error('❌ Database setup error:', error.message);
      throw error;
    }
  });

  afterAll(async () => {
    // Clean up test data
    if (testSessionId) {
      try {
        await query('DELETE FROM game_moves WHERE session_id = $1', [testSessionId]);
        await query('DELETE FROM game_sessions WHERE id = $1', [testSessionId]);
      } catch (error) {
        console.error('Cleanup error:', error.message);
      }
    }
  });

  describe('POST /api/game-sessions', () => {
    it('should create a new game session with valid data', async () => {
      const sessionData = {
        player_name: 'TestPlayer',
        difficulty_level: 2,
        card_count: 5,
        categories: ['History', 'Technology']
      };

      console.log('📝 Creating session with data:', sessionData);

      const response = await request(app)
        .post('/api/game-sessions')
        .send(sessionData);

      // Log the actual response for debugging
      console.log('Response status:', response.status);
      console.log('Response body:', JSON.stringify(response.body, null, 2));

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Game session created successfully');
      expect(response.body.data).toHaveProperty('session_id');
      expect(response.body.data.player_name).toBe('TestPlayer');
      expect(response.body.data.difficulty_level).toBe(2);
      expect(response.body.data.card_count).toBe(5);
      expect(response.body.data.categories).toEqual(['History', 'Technology']);
      expect(response.body.data.status).toBe('active');

      testSessionId = response.body.data.session_id;
    });

    it('should reject session creation with missing required fields', async () => {
      const response = await request(app)
        .post('/api/game-sessions')
        .send({ player_name: 'TestPlayer' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Missing required fields');
    });

    it('should reject session creation with invalid difficulty level', async () => {
      const sessionData = {
        player_name: 'TestPlayer',
        difficulty_level: 6,
        card_count: 5
      };

      const response = await request(app)
        .post('/api/game-sessions')
        .send(sessionData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Difficulty level must be between 1 and 5');
    });

    it('should reject session creation with invalid card count', async () => {
      const sessionData = {
        player_name: 'TestPlayer',
        difficulty_level: 2,
        card_count: 51
      };

      const response = await request(app)
        .post('/api/game-sessions')
        .send(sessionData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Card count must be between 1 and 50');
    });

    it('should reject session creation with empty player name', async () => {
      const sessionData = {
        player_name: '',
        difficulty_level: 2,
        card_count: 5
      };

      const response = await request(app)
        .post('/api/game-sessions')
        .send(sessionData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Player name must be between 1 and 100 characters');
    });
  });

  describe('GET /api/game-sessions/:id', () => {
    it('should retrieve a game session by ID', async () => {
      const response = await request(app)
        .get(`/api/game-sessions/${testSessionId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testSessionId);
      expect(response.body.data.player_name).toBe('TestPlayer');
      expect(response.body.data.status).toBe('active');
    });

    it('should return 404 for non-existent session', async () => {
      const fakeId = '123e4567-e89b-12d3-a456-426614174000';
      
      const response = await request(app)
        .get(`/api/game-sessions/${fakeId}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Game session not found');
    });
  });

  describe('POST /api/game-sessions/:id/moves', () => {
    it('should record a move in an active session', async () => {
      const moveData = {
        card_id: testCardId,
        position_before: 0,
        position_after: 1,
        is_correct: true,
        time_taken_seconds: 5
      };

      const response = await request(app)
        .post(`/api/game-sessions/${testSessionId}/moves`)
        .send(moveData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Move recorded successfully');
      expect(response.body.data.session_id).toBe(testSessionId);
      expect(response.body.data.card_id).toBe(testCardId);
      expect(response.body.data.move_number).toBe(1);
      expect(response.body.data.is_correct).toBe(true);
    });

    it('should record a second move with correct move number', async () => {
      const moveData = {
        card_id: testCardId,
        position_before: 1,
        position_after: 2,
        is_correct: false,
        time_taken_seconds: 3
      };

      const response = await request(app)
        .post(`/api/game-sessions/${testSessionId}/moves`)
        .send(moveData);

      expect(response.status).toBe(201);
      expect(response.body.data.move_number).toBe(2);
      expect(response.body.data.is_correct).toBe(false);
    });

    it('should reject move recording with missing required fields', async () => {
      const response = await request(app)
        .post(`/api/game-sessions/${testSessionId}/moves`)
        .send({ card_id: testCardId });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Missing required fields');
    });

    it('should reject move recording with invalid card_id', async () => {
      const moveData = {
        card_id: -1,
        is_correct: true
      };

      const response = await request(app)
        .post(`/api/game-sessions/${testSessionId}/moves`)
        .send(moveData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('card_id must be a positive integer');
    });

    it('should reject move recording for non-existent session', async () => {
      const fakeId = '123e4567-e89b-12d3-a456-426614174000';
      const moveData = {
        card_id: testCardId,
        is_correct: true
      };

      const response = await request(app)
        .post(`/api/game-sessions/${fakeId}/moves`)
        .send(moveData);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Game session not found');
    });
  });

  describe('GET /api/game-sessions/:id/moves', () => {
    it('should retrieve all moves for a session', async () => {
      const response = await request(app)
        .get(`/api/game-sessions/${testSessionId}/moves`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].move_number).toBe(1);
      expect(response.body.data[1].move_number).toBe(2);
      expect(response.body.data[0].is_correct).toBe(true);
      expect(response.body.data[1].is_correct).toBe(false);
    });

    it('should return empty array for session with no moves', async () => {
      // Create a new session without moves
      const sessionData = {
        player_name: 'TestPlayer2',
        difficulty_level: 1,
        card_count: 3
      };

      const createResponse = await request(app)
        .post('/api/game-sessions')
        .send(sessionData);

      expect(createResponse.status).toBe(201);
      const newSessionId = createResponse.body.data.session_id;

      const response = await request(app)
        .get(`/api/game-sessions/${newSessionId}/moves`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(0);
      expect(response.body.data).toHaveLength(0);

      // Clean up
      await query('DELETE FROM game_sessions WHERE id = $1', [newSessionId]);
    });
  });

  describe('PUT /api/game-sessions/:id/complete', () => {
    it('should complete a game session with score', async () => {
      const completeData = {
        score: 85
      };

      const response = await request(app)
        .put(`/api/game-sessions/${testSessionId}/complete`)
        .send(completeData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Game session completed successfully');
      expect(response.body.data.session_id).toBe(testSessionId);
      expect(response.body.data.status).toBe('completed');
      expect(response.body.data.score).toBe(85);
      expect(response.body.data.total_moves).toBe(2);
      expect(response.body.data.correct_moves).toBe(1);
      expect(response.body.data.incorrect_moves).toBe(1);
      expect(response.body.data.duration_seconds).toBeDefined();
    });

    it('should reject completing an already completed session', async () => {
      const response = await request(app)
        .put(`/api/game-sessions/${testSessionId}/complete`)
        .send({ score: 90 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Session is already completed or abandoned');
    });

    it('should reject completing with invalid score', async () => {
      // Create a new session for this test
      const sessionData = {
        player_name: 'TestPlayer3',
        difficulty_level: 1,
        card_count: 3
      };

      const createResponse = await request(app)
        .post('/api/game-sessions')
        .send(sessionData);

      expect(createResponse.status).toBe(201);
      const newSessionId = createResponse.body.data.session_id;

      const response = await request(app)
        .put(`/api/game-sessions/${newSessionId}/complete`)
        .send({ score: -1 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Score must be a non-negative integer');

      // Clean up
      await query('DELETE FROM game_sessions WHERE id = $1', [newSessionId]);
    });
  });

  describe('PUT /api/game-sessions/:id/abandon', () => {
    it('should abandon an active game session', async () => {
      // Create a new session for this test
      const sessionData = {
        player_name: 'TestPlayer4',
        difficulty_level: 1,
        card_count: 3
      };

      const createResponse = await request(app)
        .post('/api/game-sessions')
        .send(sessionData);

      expect(createResponse.status).toBe(201);
      const newSessionId = createResponse.body.data.session_id;

      const response = await request(app)
        .put(`/api/game-sessions/${newSessionId}/abandon`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Game session abandoned successfully');
      expect(response.body.data.session_id).toBe(newSessionId);
      expect(response.body.data.status).toBe('abandoned');
      expect(response.body.data.duration_seconds).toBeDefined();

      // Clean up
      await query('DELETE FROM game_sessions WHERE id = $1', [newSessionId]);
    });

    it('should reject abandoning a completed session', async () => {
      const response = await request(app)
        .put(`/api/game-sessions/${testSessionId}/abandon`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Session is already completed or abandoned');
    });
  });

  describe('GET /api/game-sessions/:id/stats', () => {
    it('should retrieve detailed statistics for a session', async () => {
      const response = await request(app)
        .get(`/api/game-sessions/${testSessionId}/stats`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id', testSessionId);
      expect(response.body.data).toHaveProperty('player_name', 'TestPlayer');
      expect(response.body.data).toHaveProperty('status', 'completed');
      expect(response.body.data).toHaveProperty('total_moves', 2);
      expect(response.body.data).toHaveProperty('correct_moves', 1);
      expect(response.body.data).toHaveProperty('incorrect_moves', 1);
      expect(response.body.data).toHaveProperty('score', 85);
      expect(response.body.data).toHaveProperty('total_moves_recorded', 2);
    });
  });

  describe('GET /api/game-sessions/player/:playerName', () => {
    it('should retrieve recent sessions for a player', async () => {
      const response = await request(app)
        .get('/api/game-sessions/player/TestPlayer');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.player_name).toBe('TestPlayer');
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('player_name', 'TestPlayer');
    });

    it('should respect limit parameter', async () => {
      const response = await request(app)
        .get('/api/game-sessions/player/TestPlayer?limit=1');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
    });

    it('should reject invalid limit', async () => {
      const response = await request(app)
        .get('/api/game-sessions/player/TestPlayer?limit=51');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Limit must be between 1 and 50');
    });
  });

  describe('GET /api/game-sessions/leaderboard', () => {
    it('should retrieve leaderboard data', async () => {
      const response = await request(app)
        .get('/api/game-sessions/leaderboard');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.category).toBe('all');
      expect(response.body.data).toBeInstanceOf(Array);
      
      if (response.body.data.length > 0) {
        expect(response.body.data[0]).toHaveProperty('player_name');
        expect(response.body.data[0]).toHaveProperty('games_played');
        expect(response.body.data[0]).toHaveProperty('avg_score');
        expect(response.body.data[0]).toHaveProperty('best_score');
        expect(response.body.data[0]).toHaveProperty('accuracy_percentage');
      }
    });

    it('should respect limit parameter', async () => {
      const response = await request(app)
        .get('/api/game-sessions/leaderboard?limit=5');

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });

    it('should reject invalid limit', async () => {
      const response = await request(app)
        .get('/api/game-sessions/leaderboard?limit=101');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Limit must be between 1 and 100');
    });

    it('should filter by category when provided', async () => {
      const response = await request(app)
        .get('/api/game-sessions/leaderboard?category=History');

      expect(response.status).toBe(200);
      expect(response.body.category).toBe('History');
    });
  });
}); 