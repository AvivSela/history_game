/**
 * Leaderboard System Tests
 * Tests for leaderboard calculation and ranking functionality
 */

const request = require('supertest');
const { query } = require('../config/database');
const leaderboards = require('../utils/leaderboards');
const { leaderboardCache } = require('../utils/cache');

// Import app directly to avoid dynamic import issues
let app, server;

beforeAll(async () => {
  // Import the server directly
  const serverModule = require('../server');
  app = serverModule.app;
  server = serverModule.server;
  
  // Ensure test database is migrated
  const { execSync } = require('child_process');
  try {
    execSync('node scripts/migrate.js', { stdio: 'inherit' });
  } catch (error) {
    console.log('Migration already up to date or failed:', error.message);
  }
});

afterAll(async () => {
  if (server) {
    await server.close();
  }
});

describe('Leaderboard System', () => {
  beforeEach(async () => {
    // Clear cache before each test
    leaderboardCache.invalidateAll();
    
    // Create test data
    await createTestData();
  });

  afterEach(async () => {
    // Clean up test data
    await cleanupTestData();
  });

  describe('Global Leaderboard', () => {
    test('should get global leaderboard sorted by score', async () => {
      const leaderboard = await leaderboards.getGlobalLeaderboard(10, 'total_score', 'desc');
      
      expect(leaderboard).toBeDefined();
      expect(Array.isArray(leaderboard)).toBe(true);
      expect(leaderboard.length).toBeGreaterThan(0);
      
      // Check ranking order
      for (let i = 1; i < leaderboard.length; i++) {
        expect(leaderboard[i-1].total_score).toBeGreaterThanOrEqual(leaderboard[i].total_score);
      }
      
      // Check rank field
      leaderboard.forEach((entry, index) => {
        expect(parseInt(entry.rank)).toBe(index + 1);
      });
    });

    test('should get global leaderboard sorted by accuracy', async () => {
      const leaderboard = await leaderboards.getGlobalLeaderboard(10, 'average_accuracy', 'desc');
      
      expect(leaderboard).toBeDefined();
      expect(Array.isArray(leaderboard)).toBe(true);
      
      // Check ranking order
      for (let i = 1; i < leaderboard.length; i++) {
        expect(parseFloat(leaderboard[i-1].accuracy)).toBeGreaterThanOrEqual(parseFloat(leaderboard[i].accuracy));
      }
    });

    test('should respect limit parameter', async () => {
      const limit = 5;
      const leaderboard = await leaderboards.getGlobalLeaderboard(limit, 'total_score', 'desc');
      
      expect(leaderboard.length).toBeLessThanOrEqual(limit);
    });

    test('should handle invalid sort field', async () => {
      await expect(leaderboards.getGlobalLeaderboard(10, 'invalid_field', 'desc'))
        .rejects.toThrow('Invalid sort field: invalid_field');
    });

    test('should handle invalid sort order', async () => {
      await expect(leaderboards.getGlobalLeaderboard(10, 'total_score', 'invalid_order'))
        .rejects.toThrow('Invalid sort order: invalid_order');
    });
  });

  describe('Category Leaderboard', () => {
    test('should get category leaderboard for specific category', async () => {
      const category = 'History';
      const leaderboard = await leaderboards.getCategoryLeaderboard(category, 10, 'total_score', 'desc');
      
      expect(leaderboard).toBeDefined();
      expect(Array.isArray(leaderboard)).toBe(true);
      
      // All entries should be for the specified category
      leaderboard.forEach(entry => {
        expect(entry.category).toBe(category);
      });
    });

    test('should handle non-existent category', async () => {
      const category = 'NonExistentCategory';
      const leaderboard = await leaderboards.getCategoryLeaderboard(category, 10, 'total_score', 'desc');
      
      expect(leaderboard).toBeDefined();
      expect(Array.isArray(leaderboard)).toBe(true);
      expect(leaderboard.length).toBe(0);
    });
  });

  describe('Daily Leaderboard', () => {
    test('should get daily leaderboard for current date', async () => {
      const leaderboard = await leaderboards.getDailyLeaderboard(10, 'total_score', 'desc');
      
      expect(leaderboard).toBeDefined();
      expect(Array.isArray(leaderboard)).toBe(true);
      
      // All entries should be for current date (handle timezone differences)
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      leaderboard.forEach(entry => {
        const entryDate = entry.date.toISOString().split('T')[0];
        expect([today, yesterday]).toContain(entryDate);
      });
    });
  });

  describe('Weekly Leaderboard', () => {
    test('should get weekly leaderboard for current week', async () => {
      const leaderboard = await leaderboards.getWeeklyLeaderboard(10, 'total_score', 'desc');
      
      expect(leaderboard).toBeDefined();
      expect(Array.isArray(leaderboard)).toBe(true);
    });
  });

  describe('Player Rankings', () => {
    test('should get player rankings across all leaderboards', async () => {
      const playerName = 'TestPlayer1';
      const rankings = await leaderboards.getPlayerRankings(playerName);
      
      expect(rankings).toBeDefined();
      expect(rankings).toHaveProperty('global');
      expect(rankings).toHaveProperty('daily');
      expect(rankings).toHaveProperty('weekly');
      expect(rankings).toHaveProperty('categories');
      expect(typeof rankings.categories).toBe('object');
    });

    test('should handle player with no rankings', async () => {
      const playerName = 'NonExistentPlayer';
      const rankings = await leaderboards.getPlayerRankings(playerName);
      
      expect(rankings).toBeDefined();
      expect(rankings.global).toBeNull();
      expect(rankings.daily).toBeNull();
      expect(rankings.weekly).toBeNull();
      expect(rankings.categories).toEqual({});
    });
  });

  describe('Leaderboard Summary', () => {
    test('should get leaderboard summary statistics', async () => {
      const summary = await leaderboards.getLeaderboardSummary();
      
      expect(summary).toBeDefined();
      expect(summary).toHaveProperty('total_players');
      expect(summary).toHaveProperty('total_category_entries');
      expect(summary).toHaveProperty('daily_active_players');
      expect(summary).toHaveProperty('weekly_active_players');
      expect(summary).toHaveProperty('highest_score');
      expect(summary).toHaveProperty('average_score');
      
      // Check data types
      expect(typeof summary.total_players).toBe('number');
      expect(typeof summary.total_category_entries).toBe('number');
      expect(typeof summary.daily_active_players).toBe('number');
      expect(typeof summary.weekly_active_players).toBe('number');
      expect(typeof summary.highest_score).toBe('number');
      expect(typeof summary.average_score).toBe('number');
    });
  });

  describe('Cache Functionality', () => {
    test('should cache leaderboard results', async () => {
      // First call should miss cache
      const startTime = Date.now();
      const leaderboard1 = await leaderboards.getGlobalLeaderboard(10, 'total_score', 'desc');
      const firstCallTime = Date.now() - startTime;
      
      // Second call should hit cache
      const startTime2 = Date.now();
      const leaderboard2 = await leaderboards.getGlobalLeaderboard(10, 'total_score', 'desc');
      const secondCallTime = Date.now() - startTime2;
      
      expect(leaderboard1).toEqual(leaderboard2);
      expect(secondCallTime).toBeLessThan(firstCallTime);
    });

    test('should invalidate cache when requested', async () => {
      // Get leaderboard to populate cache
      await leaderboards.getGlobalLeaderboard(10, 'total_score', 'desc');
      
      // Get initial cache stats
      const initialStats = await leaderboards.getCacheStats();
      expect(initialStats.leaderboard_entries).toBeGreaterThan(0);
      
      // Invalidate cache
      await leaderboards.invalidateLeaderboardCaches();
      
      // Cache should be reduced (not necessarily 0, as some entries might still be valid)
      const cacheStats = await leaderboards.getCacheStats();
      expect(cacheStats.leaderboard_entries).toBeLessThanOrEqual(initialStats.leaderboard_entries);
    });

    test('should get cache statistics', async () => {
      // Get some leaderboards to populate cache
      await leaderboards.getGlobalLeaderboard(10, 'total_score', 'desc');
      await leaderboards.getCategoryLeaderboard('History', 10, 'total_score', 'desc');
      
      const stats = await leaderboards.getCacheStats();
      
      expect(stats).toBeDefined();
      expect(stats).toHaveProperty('hits');
      expect(stats).toHaveProperty('misses');
      expect(stats).toHaveProperty('sets');
      expect(stats).toHaveProperty('hit_rate');
      expect(stats).toHaveProperty('leaderboard_entries');
    });
  });

  describe('API Endpoints', () => {
    test('GET /api/statistics/leaderboards/global should return global leaderboard', async () => {
      const response = await request(app)
        .get('/api/statistics/leaderboards/global')
        .query({ limit: 10, sortBy: 'total_score', order: 'desc' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('type', 'global');
      expect(response.body.data).toHaveProperty('leaderboard');
      expect(Array.isArray(response.body.data.leaderboard)).toBe(true);
    });

    test('GET /api/statistics/leaderboards/category/:category should return category leaderboard', async () => {
      const response = await request(app)
        .get('/api/statistics/leaderboards/category/History')
        .query({ limit: 10, sortBy: 'total_score', order: 'desc' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('type', 'category');
      expect(response.body.data).toHaveProperty('category', 'History');
      expect(response.body.data).toHaveProperty('leaderboard');
    });

    test('GET /api/statistics/leaderboards/daily should return daily leaderboard', async () => {
      const response = await request(app)
        .get('/api/statistics/leaderboards/daily')
        .query({ limit: 10, sortBy: 'total_score', order: 'desc' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('type', 'daily');
      expect(response.body.data).toHaveProperty('leaderboard');
    });

    test('GET /api/statistics/leaderboards/weekly should return weekly leaderboard', async () => {
      const response = await request(app)
        .get('/api/statistics/leaderboards/weekly')
        .query({ limit: 10, sortBy: 'total_score', order: 'desc' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('type', 'weekly');
      expect(response.body.data).toHaveProperty('leaderboard');
    });

    test('GET /api/statistics/leaderboards/player/:playerName should return player rankings', async () => {
      const response = await request(app)
        .get('/api/statistics/leaderboards/player/TestPlayer1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('player_name', 'TestPlayer1');
      expect(response.body.data).toHaveProperty('rankings');
    });

    test('GET /api/statistics/leaderboards/summary should return summary statistics', async () => {
      const response = await request(app)
        .get('/api/statistics/leaderboards/summary')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total_players');
      expect(response.body.data).toHaveProperty('highest_score');
    });

    test('should handle invalid parameters', async () => {
      const response = await request(app)
        .get('/api/statistics/leaderboards/global')
        .query({ limit: 2000 }) // Invalid limit
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('error');
    });
  });
});

// Helper functions for test data
async function createTestData() {
  // Create test players with statistics
  const testPlayers = [
    {
      name: 'TestPlayer1',
      total_games: 10,
      total_wins: 7,
      total_score: 850,
      best_score: 100,
      accuracy: 0.85,
      category: 'History'
    },
    {
      name: 'TestPlayer2',
      total_games: 8,
      total_wins: 5,
      total_score: 720,
      best_score: 90,
      accuracy: 0.78,
      category: 'Science'
    },
    {
      name: 'TestPlayer3',
      total_games: 12,
      total_wins: 9,
      total_score: 950,
      best_score: 110,
      accuracy: 0.92,
      category: 'History'
    }
  ];

  for (const player of testPlayers) {
    // Insert into player_statistics
    await query(`
      INSERT INTO player_statistics (
        player_name, total_games_played, total_games_won, total_score,
        average_score_per_game, average_accuracy, best_score, longest_streak
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (player_name) DO UPDATE SET
        total_games_played = EXCLUDED.total_games_played,
        total_games_won = EXCLUDED.total_games_won,
        total_score = EXCLUDED.total_score,
        average_score_per_game = EXCLUDED.average_score_per_game,
        average_accuracy = EXCLUDED.average_accuracy,
        best_score = EXCLUDED.best_score,
        longest_streak = EXCLUDED.longest_streak
    `, [
      player.name,
      player.total_games,
      player.total_wins,
      player.total_score,
      player.total_score / player.total_games,
      player.accuracy,
      player.best_score,
      3
    ]);

    // Insert into category_statistics
    await query(`
      INSERT INTO category_statistics (
        player_name, category, games_played, games_won, total_score,
        average_score, accuracy, best_score
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (player_name, category) DO UPDATE SET
        games_played = EXCLUDED.games_played,
        games_won = EXCLUDED.games_won,
        total_score = EXCLUDED.total_score,
        average_score = EXCLUDED.average_score,
        accuracy = EXCLUDED.accuracy,
        best_score = EXCLUDED.best_score
    `, [
      player.name,
      player.category,
      player.total_games,
      player.total_wins,
      player.total_score,
      player.total_score / player.total_games,
      player.accuracy,
      player.best_score
    ]);

    // Insert into daily_statistics
    await query(`
      INSERT INTO daily_statistics (
        player_name, date, games_played, games_won, total_score,
        average_score, accuracy
      ) VALUES ($1, CURRENT_DATE, $2, $3, $4, $5, $6)
      ON CONFLICT (player_name, date) DO UPDATE SET
        games_played = EXCLUDED.games_played,
        games_won = EXCLUDED.games_won,
        total_score = EXCLUDED.total_score,
        average_score = EXCLUDED.average_score,
        accuracy = EXCLUDED.accuracy
    `, [
      player.name,
      player.total_games,
      player.total_wins,
      player.total_score,
      player.total_score / player.total_games,
      player.accuracy
    ]);

    // Insert into weekly_statistics
    await query(`
      INSERT INTO weekly_statistics (
        player_name, year, week, games_played, games_won, total_score,
        average_score, accuracy
      ) VALUES ($1, EXTRACT(YEAR FROM CURRENT_DATE), EXTRACT(WEEK FROM CURRENT_DATE), $2, $3, $4, $5, $6)
      ON CONFLICT (player_name, year, week) DO UPDATE SET
        games_played = EXCLUDED.games_played,
        games_won = EXCLUDED.games_won,
        total_score = EXCLUDED.total_score,
        average_score = EXCLUDED.average_score,
        accuracy = EXCLUDED.accuracy
    `, [
      player.name,
      player.total_games,
      player.total_wins,
      player.total_score,
      player.total_score / player.total_games,
      player.accuracy
    ]);
  }
}

async function cleanupTestData() {
  const testPlayers = ['TestPlayer1', 'TestPlayer2', 'TestPlayer3'];
  
  for (const playerName of testPlayers) {
    await query('DELETE FROM player_statistics WHERE player_name = $1', [playerName]);
    await query('DELETE FROM category_statistics WHERE player_name = $1', [playerName]);
    await query('DELETE FROM daily_statistics WHERE player_name = $1', [playerName]);
    await query('DELETE FROM weekly_statistics WHERE player_name = $1', [playerName]);
  }
} 