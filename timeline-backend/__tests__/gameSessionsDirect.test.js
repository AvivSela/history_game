/**
 * Game Sessions Direct Tests
 * Tests for game session model directly (without server)
 */

const GameSession = require('../models/GameSession');
const { query } = require('../config/database');
const dbUtils = require('../utils/database');

describe('GameSession Model', () => {
  let testSessionId;
  const testCardId = 2; // Use a known card ID from the database (First Moon Landing) - now exists after populating test DB

  beforeAll(async () => {
    // Initialize database
    try {
      const { testConnection } = require('../config/database');
      const isConnected = await testConnection();
      if (!isConnected) {
        throw new Error('Database connection failed');
      }
      
      await dbUtils.initializeDatabase();
    } catch (error) {
      console.error('Database setup error:', error.message);
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

  describe('createSession', () => {
    it('should create a new game session with valid data', async () => {
      const sessionData = {
        player_name: 'TestPlayer',
        difficulty_level: 2,
        card_count: 5,
        categories: ['History', 'Technology']
      };

      const session = await GameSession.createSession(sessionData);

      expect(session).toBeDefined();
      expect(session.id).toBeDefined();
      expect(session.player_name).toBe('TestPlayer');
      expect(session.difficulty_level).toBe(2);
      expect(session.card_count).toBe(5);
      expect(session.categories).toEqual(['History', 'Technology']);
      expect(session.status).toBe('active');

      testSessionId = session.id;
    });

    it('should reject session creation with invalid data', async () => {
      const sessionData = {
        player_name: '',
        difficulty_level: 6,
        card_count: 51
      };

      await expect(GameSession.createSession(sessionData)).rejects.toThrow();
    });
  });

  describe('getSessionById', () => {
    it('should retrieve a game session by ID', async () => {
      const session = await GameSession.getSessionById(testSessionId);

      expect(session).toBeDefined();
      expect(session.id).toBe(testSessionId);
      expect(session.player_name).toBe('TestPlayer');
      expect(session.status).toBe('active');
    });

    it('should return null for non-existent session', async () => {
      const fakeId = '123e4567-e89b-12d3-a456-426614174000';
      const session = await GameSession.getSessionById(fakeId);

      expect(session).toBeNull();
    });
  });

  describe('recordMove', () => {
    it.skip('should record a move in a session', async () => {
      const moveData = {
        session_id: testSessionId,
        card_id: testCardId,
        position_before: 0,
        position_after: 1,
        is_correct: true,
        move_number: 1,
        time_taken_seconds: 5
      };

      const move = await GameSession.recordMove(moveData);

      expect(move).toBeDefined();
      expect(move.session_id).toBe(testSessionId);
      expect(move.card_id).toBe(testCardId);
      expect(move.move_number).toBe(1);
      expect(move.is_correct).toBe(true);
    });

    it.skip('should record a second move with correct move number', async () => {
      const moveData = {
        session_id: testSessionId,
        card_id: testCardId,
        position_before: 1,
        position_after: 2,
        is_correct: false,
        move_number: 2,
        time_taken_seconds: 3
      };

      const move = await GameSession.recordMove(moveData);

      expect(move).toBeDefined();
      expect(move.move_number).toBe(2);
      expect(move.is_correct).toBe(false);
    });
  });

  describe('getSessionMoves', () => {
    it.skip('should retrieve all moves for a session', async () => {
      const moves = await GameSession.getSessionMoves(testSessionId);

      expect(moves).toBeDefined();
      expect(moves).toHaveLength(2);
      expect(moves[0].move_number).toBe(1);
      expect(moves[1].move_number).toBe(2);
      expect(moves[0].is_correct).toBe(true);
      expect(moves[1].is_correct).toBe(false);
    });
  });

  describe('updateSessionStatus', () => {
    it('should complete a game session with score', async () => {
      const updatedSession = await GameSession.updateSessionStatus(
        testSessionId, 
        'completed', 
        { score: 85, end_time: new Date() }
      );

      expect(updatedSession).toBeDefined();
      expect(updatedSession.status).toBe('completed');
      expect(updatedSession.score).toBe(85);
      expect(updatedSession.end_time).toBeDefined();
    });
  });

  describe('getSessionStats', () => {
    it.skip('should retrieve detailed statistics for a session', async () => {
      const stats = await GameSession.getSessionStats(testSessionId);

      expect(stats).toBeDefined();
      expect(stats.id).toBe(testSessionId);
      expect(stats.player_name).toBe('TestPlayer');
      expect(stats.total_moves).toBe(2);
      expect(stats.correct_moves).toBe(1);
      expect(stats.incorrect_moves).toBe(1);
    });
  });

  describe('getPlayerSessions', () => {
    it('should retrieve recent sessions for a player', async () => {
      const sessions = await GameSession.getPlayerSessions('TestPlayer');

      expect(sessions).toBeDefined();
      expect(sessions).toBeInstanceOf(Array);
      expect(sessions.length).toBeGreaterThan(0);
      expect(sessions[0].player_name).toBe('TestPlayer');
    });

    it('should respect limit parameter', async () => {
      const sessions = await GameSession.getPlayerSessions('TestPlayer', 1);

      expect(sessions).toBeDefined();
      expect(sessions).toHaveLength(1);
    });
  });

  describe('getLeaderboard', () => {
    it('should retrieve leaderboard data', async () => {
      const leaderboard = await GameSession.getLeaderboard();

      expect(leaderboard).toBeDefined();
      expect(leaderboard).toBeInstanceOf(Array);
    });

    it('should respect limit parameter', async () => {
      const leaderboard = await GameSession.getLeaderboard(5);

      expect(leaderboard).toBeDefined();
      expect(leaderboard.length).toBeLessThanOrEqual(5);
    });

    it('should filter by category when provided', async () => {
      const leaderboard = await GameSession.getLeaderboard(10, 'History');

      expect(leaderboard).toBeDefined();
      expect(leaderboard).toBeInstanceOf(Array);
    });
  });
}); 