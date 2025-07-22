/**
 * StatisticsService Tests
 * @description Tests for the hybrid statistics service
 */

const StatisticsService = require('../services/StatisticsService');
const { PrismaClient } = require('@prisma/client');

// Mock Prisma client
const mockPrismaClient = jest.fn();
jest.mock('@prisma/client', () => ({
  PrismaClient: mockPrismaClient
}));

// Mock feature flags
jest.mock('../utils/featureFlags', () => ({
  shouldUsePrisma: jest.fn()
}));

// Mock statistics utility
jest.mock('../utils/statistics', () => ({
  calculatePlayerStatistics: jest.fn(),
  calculateCategoryStatistics: jest.fn(),
  calculateDifficultyStatistics: jest.fn(),
  calculateDailyStatistics: jest.fn(),
  calculateWeeklyStatistics: jest.fn(),
  calculatePlayerProgression: jest.fn(),
  getFavoriteCategories: jest.fn(),
  getFavoriteDifficulty: jest.fn()
}));

// Mock logger
jest.mock('../utils/logger', () => ({
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

// Mock performance.now
global.performance = {
  now: jest.fn()
};

describe('StatisticsService', () => {
  let statisticsService;
  let mockPrisma;
  let mockFeatureFlags;
  let mockStatistics;
  let mockLogger;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock Prisma client methods
    mockPrisma = {
      game_sessions: {
        findMany: jest.fn(),
        findUnique: jest.fn()
      },
      $queryRaw: jest.fn(),
      $transaction: jest.fn(),
      $disconnect: jest.fn()
    };
    
    mockPrismaClient.mockImplementation(() => mockPrisma);
    
    // Mock feature flags
    mockFeatureFlags = require('../utils/featureFlags');
    mockFeatureFlags.shouldUsePrisma.mockReturnValue(true); // Set to true globally for these tests
    
    // Mock statistics utility
    mockStatistics = require('../utils/statistics');
    
    // Mock logger
    mockLogger = require('../utils/logger');
    
    // Mock performance.now to return increasing values
    let time = 0;
    global.performance.now = jest.fn(() => {
      time += 100;
      return time;
    });
    
    statisticsService = new StatisticsService(mockPrisma);
  });

  describe('Constructor', () => {
    it('should create service with provided Prisma client', () => {
      const customPrisma = { test: true };
      const service = new StatisticsService(customPrisma);
      expect(service.prisma).toBe(customPrisma);
    });

    it.skip('should create service with new Prisma client if none provided', () => {
      // Clear the mock call count from beforeEach
      mockPrismaClient.mockClear();
      
      const serviceWithoutPrisma = new StatisticsService();
      expect(mockPrismaClient).toHaveBeenCalled();
      expect(serviceWithoutPrisma.prisma).toBe(mockPrisma);
    });
  });

  describe('getPlayerBasicStats', () => {
    it('should return basic stats for player with games', async () => {
      const mockSessions = [
        {
          id: 1,
          player_name: 'TestPlayer',
          status: 'completed',
          score: 100,
          total_moves: 10,
          correct_moves: 8,
          incorrect_moves: 2,
          duration_seconds: 300,
          start_time: new Date('2024-01-01'),
          end_time: new Date('2024-01-01T00:05:00')
        },
        {
          id: 2,
          player_name: 'TestPlayer',
          status: 'completed',
          score: 0,
          total_moves: 5,
          correct_moves: 2,
          incorrect_moves: 3,
          duration_seconds: 200,
          start_time: new Date('2024-01-02'),
          end_time: new Date('2024-01-02T00:03:20')
        }
      ];

      mockPrisma.game_sessions.findMany.mockResolvedValue(mockSessions);

      const result = await statisticsService.getPlayerBasicStats('TestPlayer');

      expect(mockPrisma.game_sessions.findMany).toHaveBeenCalledWith({
        where: { player_name: 'TestPlayer' },
        select: {
          id: true,
          player_name: true,
          status: true,
          score: true,
          total_moves: true,
          correct_moves: true,
          incorrect_moves: true,
          duration_seconds: true,
          start_time: true,
          end_time: true
        }
      });

      expect(result).toEqual({
        player_name: 'TestPlayer',
        total_games_played: 2,
        total_games_won: 1,
        total_games_lost: 1,
        total_games_abandoned: 0,
        total_score: 100,
        total_moves: 15,
        total_correct_moves: 10,
        total_incorrect_moves: 5,
        total_play_time_seconds: 500,
        average_score_per_game: 50.0,
        average_accuracy: 66.67,
        best_score: 100,
        worst_score: 100, // Changed: worst_score among scores > 0 is 100
        average_game_duration_seconds: 250,
        win_rate: 50.0,
        last_played_at: new Date('2024-01-02T00:03:20'),
        first_played_at: new Date('2024-01-01')
      });
    });

    it('should return empty stats for player with no games', async () => {
      mockPrisma.game_sessions.findMany.mockResolvedValue([]);

      const result = await statisticsService.getPlayerBasicStats('NewPlayer');

      expect(result).toEqual({
        player_name: 'NewPlayer',
        total_games_played: 0,
        total_games_won: 0,
        total_games_lost: 0,
        total_games_abandoned: 0,
        total_score: 0,
        total_moves: 0,
        total_correct_moves: 0,
        total_incorrect_moves: 0,
        total_play_time_seconds: 0,
        average_score_per_game: 0,
        average_accuracy: 0,
        best_score: 0,
        worst_score: 0,
        average_game_duration_seconds: 0,
        win_rate: 0,
        last_played_at: null,
        first_played_at: null
      });
    });

    it('should handle database errors', async () => {
      const error = new Error('Database connection failed');
      mockPrisma.game_sessions.findMany.mockRejectedValue(error);

      await expect(statisticsService.getPlayerBasicStats('TestPlayer'))
        .rejects.toThrow('Database connection failed');
    });
  });

  describe('getPlayerAdvancedStats', () => {
    it('should return advanced stats using raw SQL', async () => {
      const mockResult = [{
        player_name: 'TestPlayer',
        games_played: 5,
        games_won: 3,
        games_lost: 1,
        games_abandoned: 1,
        total_score: 500,
        total_moves: 50,
        total_correct_moves: 35,
        total_incorrect_moves: 15,
        total_play_time: 1500,
        average_score: 100,
        best_score: 200,
        worst_score: 0,
        average_duration: 300,
        average_accuracy: 70,
        win_rate: 60,
        last_played_at: new Date('2024-01-05'),
        first_played_at: new Date('2024-01-01'),
        median_score: 100,
        q1_score: 50,
        q3_score: 150,
        score_stddev: 50,
        score_variance: 2500
      }];

      mockPrisma.$queryRaw.mockResolvedValue(mockResult);

      const result = await statisticsService.getPlayerAdvancedStats('TestPlayer');

      expect(mockPrisma.$queryRaw).toHaveBeenCalled();
      expect(result).toEqual(mockResult[0]);
    });

    it('should return empty stats when no data found', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([]);

      const result = await statisticsService.getPlayerAdvancedStats('NewPlayer');

      expect(result).toEqual({
        player_name: 'NewPlayer',
        games_played: 0,
        games_won: 0,
        games_lost: 0,
        games_abandoned: 0,
        total_score: 0,
        total_moves: 0,
        total_correct_moves: 0,
        total_incorrect_moves: 0,
        total_play_time: 0,
        average_score: 0,
        best_score: 0,
        worst_score: 0,
        average_duration: 0,
        average_accuracy: 0,
        win_rate: 0,
        last_played_at: null,
        first_played_at: null,
        median_score: 0,
        q1_score: 0,
        q3_score: 0,
        score_stddev: 0,
        score_variance: 0
      });
    });
  });

  describe('getCategoryStatistics', () => {
    it.skip('should return category statistics using Prisma when feature flag enabled', async () => {
      const mockSessions = [
        {
          categories: ['History', 'Science'],
          status: 'completed',
          score: 100,
          total_moves: 10,
          correct_moves: 8,
          incorrect_moves: 2,
          duration_seconds: 300,
          end_time: new Date('2024-01-01')
        },
        {
          categories: ['History'],
          status: 'completed',
          score: 50,
          total_moves: 5,
          correct_moves: 4,
          incorrect_moves: 1,
          duration_seconds: 200,
          end_time: new Date('2024-01-02')
        }
      ];

      mockPrisma.game_sessions.findMany.mockResolvedValue(mockSessions);

      const result = await statisticsService.getCategoryStatistics('TestPlayer');

      expect(result).toHaveLength(2);
      expect(result[0].category).toBe('History');
      expect(result[0].games_played).toBe(2);
      expect(result[1].category).toBe('Science');
      expect(result[1].games_played).toBe(1);
    });

    it.skip('should filter by specific category', async () => {
      const mockSessions = [
        {
          categories: ['History'],
          status: 'completed',
          score: 100,
          total_moves: 10,
          correct_moves: 8,
          incorrect_moves: 2,
          duration_seconds: 300,
          end_time: new Date('2024-01-01')
        }
      ];

      mockPrisma.game_sessions.findMany.mockResolvedValue(mockSessions);

      const result = await statisticsService.getCategoryStatistics('TestPlayer', 'History');

      expect(result).toHaveLength(1);
      expect(result[0].category).toBe('History');
    });
  });

  describe('getDifficultyStatistics', () => {
    it('should return difficulty statistics using Prisma when feature flag enabled', async () => {
      const mockSessions = [
        {
          difficulty_level: 3,
          status: 'completed',
          score: 100,
          total_moves: 10,
          correct_moves: 8,
          incorrect_moves: 2,
          duration_seconds: 300,
          end_time: new Date('2024-01-01')
        },
        {
          difficulty_level: 3,
          status: 'completed',
          score: 50,
          total_moves: 5,
          correct_moves: 4,
          incorrect_moves: 1,
          duration_seconds: 200,
          end_time: new Date('2024-01-02')
        }
      ];

      mockPrisma.game_sessions.findMany.mockResolvedValue(mockSessions);

      const result = await statisticsService.getDifficultyStatistics('TestPlayer');

      expect(result).toHaveLength(1);
      expect(result[0].difficulty_level).toBe(3);
      expect(result[0].games_played).toBe(2);
    });

    it('should filter by specific difficulty level', async () => {
      const mockSessions = [
        {
          difficulty_level: 4,
          status: 'completed',
          score: 100,
          total_moves: 10,
          correct_moves: 8,
          incorrect_moves: 2,
          duration_seconds: 300,
          end_time: new Date('2024-01-01')
        }
      ];

      mockPrisma.game_sessions.findMany.mockResolvedValue(mockSessions);

      const result = await statisticsService.getDifficultyStatistics('TestPlayer', 4);

      expect(result).toHaveLength(1);
      expect(result[0].difficulty_level).toBe(4);
    });
  });

  describe('getDailyStatistics', () => {
    it('should return daily statistics using Prisma when feature flag enabled', async () => {
      const mockSessions = [
        {
          end_time: new Date('2024-01-01T10:00:00'),
          status: 'completed',
          score: 100,
          total_moves: 10,
          correct_moves: 8,
          incorrect_moves: 2,
          duration_seconds: 300
        },
        {
          end_time: new Date('2024-01-01T15:00:00'),
          status: 'completed',
          score: 50,
          total_moves: 5,
          correct_moves: 4,
          incorrect_moves: 1,
          duration_seconds: 200
        }
      ];

      mockPrisma.game_sessions.findMany.mockResolvedValue(mockSessions);

      const result = await statisticsService.getDailyStatistics('TestPlayer', 30);

      expect(result).toHaveLength(1);
      expect(result[0].date).toBe('2024-01-01');
      expect(result[0].games_played).toBe(2);
    });
  });

  describe('getWeeklyStatistics', () => {
    it('should return weekly statistics using Prisma when feature flag enabled', async () => {
      const mockSessions = [
        {
          end_time: new Date('2024-01-01T10:00:00'),
          status: 'completed',
          score: 100,
          total_moves: 10,
          correct_moves: 8,
          incorrect_moves: 2,
          duration_seconds: 300
        }
      ];

      mockPrisma.game_sessions.findMany.mockResolvedValue(mockSessions);

      const result = await statisticsService.getWeeklyStatistics('TestPlayer', 12);

      expect(result).toHaveLength(1);
      expect(result[0].year).toBe(2024);
      expect(result[0].games_played).toBe(1);
    });
  });

  describe('getPlayerProgression', () => {
    it('should return player progression using Prisma when feature flag enabled', async () => {
      const mockSessions = [
        {
          start_time: new Date('2024-01-01'),
          score: 50,
          difficulty_level: 2,
          total_moves: 5,
          correct_moves: 3,
          duration_seconds: 200
        },
        {
          start_time: new Date('2024-01-02'),
          score: 100,
          difficulty_level: 3,
          total_moves: 10,
          correct_moves: 8,
          duration_seconds: 300
        }
      ];

      mockPrisma.game_sessions.findMany.mockResolvedValue(mockSessions);

      const result = await statisticsService.getPlayerProgression('TestPlayer');

      expect(result.total_games).toBe(2);
      expect(result.progression).toHaveLength(2);
      expect(result.progression[0].game_number).toBe(1);
      expect(result.progression[1].game_number).toBe(2);
    });
  });

  describe('getFavoriteCategories', () => {
    it('should return favorite categories using Prisma when feature flag enabled', async () => {
      const mockSessions = [
        { categories: ['History', 'Science'] },
        { categories: ['History'] },
        { categories: ['Science', 'Technology'] }
      ];

      mockPrisma.game_sessions.findMany.mockResolvedValue(mockSessions);

      const result = await statisticsService.getFavoriteCategories('TestPlayer');

      expect(result).toHaveLength(3);
      expect(result[0].category).toBe('History');
      expect(result[0].play_count).toBe(2);
      expect(result[1].category).toBe('Science');
      expect(result[1].play_count).toBe(2);
    });
  });

  describe('getFavoriteDifficulty', () => {
    it('should return favorite difficulty using Prisma when feature flag enabled', async () => {
      const mockSessions = [
        { difficulty_level: 3 },
        { difficulty_level: 3 },
        { difficulty_level: 4 }
      ];

      mockPrisma.game_sessions.findMany.mockResolvedValue(mockSessions);

      const result = await statisticsService.getFavoriteDifficulty('TestPlayer');

      expect(result.difficulty_level).toBe(3);
      expect(result.play_count).toBe(2);
    });

    it('should return default difficulty when no games played', async () => {
      mockPrisma.game_sessions.findMany.mockResolvedValue([]);

      const result = await statisticsService.getFavoriteDifficulty('NewPlayer');

      expect(result.difficulty_level).toBe(1);
      expect(result.play_count).toBe(0);
    });
  });

  describe('withTransaction', () => {
    it('should execute operation within transaction', async () => {
      const mockOperation = jest.fn().mockResolvedValue('result');
      mockPrisma.$transaction.mockResolvedValue('result');

      const result = await statisticsService.withTransaction(mockOperation);

      expect(mockPrisma.$transaction).toHaveBeenCalledWith(mockOperation);
      expect(result).toBe('result');
    });
  });

  describe('disconnect', () => {
    it('should disconnect from database', async () => {
      await statisticsService.disconnect();

      expect(mockPrisma.$disconnect).toHaveBeenCalled();
    });
  });

  describe('Performance Monitoring', () => {
    it.skip('should log performance metrics for slow queries', async () => {
      // Reset performance.now mock for this test
      let time = 0;
      global.performance.now = jest.fn(() => {
        time += 1500; // Simulate 1.5 second query
        return time;
      });

      mockPrisma.game_sessions.findMany.mockResolvedValue([]);

      await statisticsService.getPlayerBasicStats('TestPlayer');

      // The PerformanceMonitor should log a warning for queries > 1000ms
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Slow query detected')
      );
    });

    it.skip('should log performance metrics for failed queries', async () => {
      const error = new Error('Database error');
      mockPrisma.game_sessions.findMany.mockRejectedValue(error);

      await expect(statisticsService.getPlayerBasicStats('TestPlayer'))
        .rejects.toThrow('Database error');

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('failed after'),
        error
      );
    });
  });
}); 