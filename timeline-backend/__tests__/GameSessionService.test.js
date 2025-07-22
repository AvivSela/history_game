/**
 * GameSessionService Tests
 * @description Tests for GameSessionService with Prisma integration
 */

const { PrismaClient } = require('@prisma/client');
const GameSessionService = require('../services/GameSessionService');

// Mock Prisma client
const mockPrisma = {
  game_sessions: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn()
  },
  game_moves: {
    create: jest.fn(),
    findMany: jest.fn()
  },
  $transaction: jest.fn(),
  $disconnect: jest.fn()
};

describe('GameSessionService', () => {
  let gameSessionService;

  beforeEach(() => {
    jest.clearAllMocks();
    gameSessionService = new GameSessionService(mockPrisma);
  });

  describe('transformSession', () => {
    it('should transform Prisma session to API format', () => {
      const prismaSession = {
        id: 'test-uuid',
        player_name: 'TestPlayer',
        difficulty_level: 3,
        card_count: 10,
        categories: ['History', 'Technology'],
        status: 'active',
        score: 100,
        total_moves: 5,
        correct_moves: 4,
        incorrect_moves: 1,
        start_time: new Date('2024-01-01'),
        end_time: null,
        duration_seconds: null,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01')
      };

      const result = gameSessionService.transformSession(prismaSession);

      expect(result).toEqual({
        id: 'test-uuid',
        player_name: 'TestPlayer',
        difficulty_level: 3,
        card_count: 10,
        categories: ['History', 'Technology'],
        status: 'active',
        score: 100,
        total_moves: 5,
        correct_moves: 4,
        incorrect_moves: 1,
        start_time: new Date('2024-01-01'),
        end_time: null,
        duration_seconds: null,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01')
      });
    });

    it('should handle null session', () => {
      const result = gameSessionService.transformSession(null);
      expect(result).toBeNull();
    });

    it('should handle undefined categories', () => {
      const prismaSession = {
        id: 'test-uuid',
        player_name: 'TestPlayer',
        difficulty_level: 3,
        card_count: 10,
        categories: null,
        status: 'active',
        score: null,
        total_moves: null,
        correct_moves: null,
        incorrect_moves: null,
        start_time: new Date('2024-01-01'),
        end_time: null,
        duration_seconds: null,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01')
      };

      const result = gameSessionService.transformSession(prismaSession);

      expect(result.categories).toEqual([]);
      expect(result.score).toBe(0);
      expect(result.total_moves).toBe(0);
      expect(result.correct_moves).toBe(0);
      expect(result.incorrect_moves).toBe(0);
    });
  });

  describe('transformToPrisma', () => {
    it('should transform API data to Prisma format', () => {
      const apiData = {
        player_name: 'TestPlayer',
        difficulty_level: 3,
        card_count: 10,
        categories: ['History']
      };

      const result = gameSessionService.transformToPrisma(apiData);

      expect(result).toEqual({
        player_name: 'TestPlayer',
        difficulty_level: 3,
        card_count: 10,
        categories: ['History']
      });
    });

    it('should only include defined values', () => {
      const apiData = {
        player_name: 'TestPlayer',
        difficulty_level: 3,
        card_count: undefined,
        categories: null
      };

      const result = gameSessionService.transformToPrisma(apiData);

      expect(result).toEqual({
        player_name: 'TestPlayer',
        difficulty_level: 3,
        categories: null
      });
      expect(result.card_count).toBeUndefined();
    });
  });

  describe('transformMove', () => {
    it('should transform Prisma move to API format', () => {
      const prismaMove = {
        id: 'move-uuid',
        session_id: 'session-uuid',
        card_id: 1,
        position_before: 0,
        position_after: 1,
        is_correct: true,
        move_number: 1,
        time_taken_seconds: 5,
        created_at: new Date('2024-01-01')
      };

      const result = gameSessionService.transformMove(prismaMove);

      expect(result).toEqual({
        id: 'move-uuid',
        session_id: 'session-uuid',
        card_id: 1,
        position_before: 0,
        position_after: 1,
        is_correct: true,
        move_number: 1,
        time_taken_seconds: 5,
        created_at: new Date('2024-01-01')
      });
    });

    it('should handle null move', () => {
      const result = gameSessionService.transformMove(null);
      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find session by ID with moves', async () => {
      const mockSession = {
        id: 'test-uuid',
        player_name: 'TestPlayer',
        game_moves: []
      };

      mockPrisma.game_sessions.findUnique.mockResolvedValue(mockSession);

      const result = await gameSessionService.findById('test-uuid');

      expect(mockPrisma.game_sessions.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-uuid' },
        include: {
          game_moves: {
            orderBy: { move_number: 'asc' }
          }
        }
      });
      expect(result).toBeDefined();
    });

    it('should handle database error', async () => {
      const error = new Error('Database error');
      mockPrisma.game_sessions.findUnique.mockRejectedValue(error);

      await expect(gameSessionService.findById('test-uuid')).rejects.toThrow('Database error');
    });
  });

  describe('createSession', () => {
    it('should create new session', async () => {
      const sessionData = {
        player_name: 'TestPlayer',
        difficulty_level: 3,
        card_count: 10,
        categories: ['History']
      };

      const mockCreatedSession = {
        id: 'new-uuid',
        ...sessionData,
        status: 'active',
        score: 0,
        total_moves: 0,
        correct_moves: 0,
        incorrect_moves: 0,
        start_time: new Date(),
        end_time: null,
        duration_seconds: null,
        created_at: new Date(),
        updated_at: new Date()
      };

      mockPrisma.game_sessions.create.mockResolvedValue(mockCreatedSession);

      const result = await gameSessionService.createSession(sessionData);

      expect(mockPrisma.game_sessions.create).toHaveBeenCalledWith({
        data: sessionData
      });
      expect(result).toBeDefined();
      expect(result.player_name).toBe('TestPlayer');
    });

    it('should handle creation error', async () => {
      const error = new Error('Creation failed');
      mockPrisma.game_sessions.create.mockRejectedValue(error);

      await expect(gameSessionService.createSession({})).rejects.toThrow('Creation failed');
    });
  });

  describe('updateSession', () => {
    it('should update session', async () => {
      const updateData = {
        score: 150,
        status: 'completed'
      };

      const mockUpdatedSession = {
        id: 'test-uuid',
        score: 150,
        status: 'completed'
      };

      mockPrisma.game_sessions.update.mockResolvedValue(mockUpdatedSession);

      const result = await gameSessionService.updateSession('test-uuid', updateData);

      expect(mockPrisma.game_sessions.update).toHaveBeenCalledWith({
        where: { id: 'test-uuid' },
        data: updateData
      });
      expect(result).toBeDefined();
    });
  });

  describe('updateSessionStatus', () => {
    it('should update session status with additional data', async () => {
      const testDate = new Date('2024-01-01T12:00:00.000Z');
      const additionalData = {
        score: 200,
        end_time: testDate
      };

      const mockUpdatedSession = {
        id: 'test-uuid',
        status: 'completed',
        score: 200,
        end_time: testDate
      };

      mockPrisma.game_sessions.update.mockResolvedValue(mockUpdatedSession);

      const result = await gameSessionService.updateSessionStatus('test-uuid', 'completed', additionalData);

      expect(mockPrisma.game_sessions.update).toHaveBeenCalledWith({
        where: { id: 'test-uuid' },
        data: {
          status: 'completed',
          score: 200,
          end_time: testDate
        }
      });
      expect(result).toBeDefined();
    });
  });

  describe('deleteSession', () => {
    it('should delete session', async () => {
      const mockDeletedSession = {
        id: 'test-uuid',
        player_name: 'TestPlayer'
      };

      mockPrisma.game_sessions.delete.mockResolvedValue(mockDeletedSession);

      const result = await gameSessionService.deleteSession('test-uuid');

      expect(mockPrisma.game_sessions.delete).toHaveBeenCalledWith({
        where: { id: 'test-uuid' }
      });
      expect(result).toBeDefined();
    });
  });

  describe('recordMove', () => {
    it('should record move and update session stats', async () => {
      const moveData = {
        session_id: 'session-uuid',
        card_id: 1,
        position_before: 0,
        position_after: 1,
        is_correct: true,
        move_number: 1,
        time_taken_seconds: 5
      };

      const mockCreatedMove = {
        id: 'move-uuid',
        ...moveData,
        created_at: new Date()
      };

      mockPrisma.game_moves.create.mockResolvedValue(mockCreatedMove);
      mockPrisma.game_sessions.update.mockResolvedValue({});

      const result = await gameSessionService.recordMove(moveData);

      expect(mockPrisma.game_moves.create).toHaveBeenCalledWith({
        data: moveData
      });
      expect(mockPrisma.game_sessions.update).toHaveBeenCalledWith({
        where: { id: 'session-uuid' },
        data: {
          total_moves: { increment: 1 },
          correct_moves: { increment: 1 },
          incorrect_moves: { increment: 0 }
        }
      });
      expect(result).toBeDefined();
    });

    it('should handle incorrect move stats update', async () => {
      const moveData = {
        session_id: 'session-uuid',
        card_id: 1,
        position_before: 0,
        position_after: 1,
        is_correct: false,
        move_number: 1,
        time_taken_seconds: 5
      };

      const mockCreatedMove = {
        id: 'move-uuid',
        ...moveData,
        created_at: new Date()
      };

      mockPrisma.game_moves.create.mockResolvedValue(mockCreatedMove);
      mockPrisma.game_sessions.update.mockResolvedValue({});

      await gameSessionService.recordMove(moveData);

      expect(mockPrisma.game_sessions.update).toHaveBeenCalledWith({
        where: { id: 'session-uuid' },
        data: {
          total_moves: { increment: 1 },
          correct_moves: { increment: 0 },
          incorrect_moves: { increment: 1 }
        }
      });
    });
  });

  describe('getSessionMoves', () => {
    it('should get moves for session', async () => {
      const mockMoves = [
        {
          id: 'move-1',
          session_id: 'session-uuid',
          card_id: 1,
          move_number: 1,
          is_correct: true
        },
        {
          id: 'move-2',
          session_id: 'session-uuid',
          card_id: 2,
          move_number: 2,
          is_correct: false
        }
      ];

      mockPrisma.game_moves.findMany.mockResolvedValue(mockMoves);

      const result = await gameSessionService.getSessionMoves('session-uuid');

      expect(mockPrisma.game_moves.findMany).toHaveBeenCalledWith({
        where: { session_id: 'session-uuid' },
        orderBy: { move_number: 'asc' }
      });
      expect(result).toHaveLength(2);
      expect(result[0].move_number).toBe(1);
      expect(result[1].move_number).toBe(2);
    });
  });

  describe('getSessionStats', () => {
    it('should calculate session statistics', async () => {
      const mockSession = {
        id: 'session-uuid',
        player_name: 'TestPlayer',
        score: 100,
        total_moves: 3,
        correct_moves: 2,
        incorrect_moves: 1,
        game_moves: [
          { time_taken_seconds: 5, is_correct: true },
          { time_taken_seconds: 3, is_correct: true },
          { time_taken_seconds: 7, is_correct: false }
        ]
      };

      mockPrisma.game_sessions.findUnique.mockResolvedValue(mockSession);

      const result = await gameSessionService.getSessionStats('session-uuid');

      expect(result).toBeDefined();
      expect(result.total_moves_recorded).toBe(3);
      expect(result.avg_move_time).toBe(5); // (5+3+7)/3 = 5
      expect(result.fastest_move).toBe(3);
      expect(result.slowest_move).toBe(7);
    });

    it('should handle session with no moves', async () => {
      const mockSession = {
        id: 'session-uuid',
        player_name: 'TestPlayer',
        game_moves: []
      };

      mockPrisma.game_sessions.findUnique.mockResolvedValue(mockSession);

      const result = await gameSessionService.getSessionStats('session-uuid');

      expect(result.total_moves_recorded).toBe(0);
      expect(result.avg_move_time).toBe(0);
      expect(result.fastest_move).toBe(0);
      expect(result.slowest_move).toBe(0);
    });

    it('should handle null session', async () => {
      mockPrisma.game_sessions.findUnique.mockResolvedValue(null);

      const result = await gameSessionService.getSessionStats('session-uuid');

      expect(result).toBeNull();
    });
  });

  describe('getPlayerSessions', () => {
    it('should get recent sessions for player', async () => {
      const mockSessions = [
        { id: 'session-1', player_name: 'TestPlayer' },
        { id: 'session-2', player_name: 'TestPlayer' }
      ];

      mockPrisma.game_sessions.findMany.mockResolvedValue(mockSessions);

      const result = await gameSessionService.getPlayerSessions('TestPlayer', 5);

      expect(mockPrisma.game_sessions.findMany).toHaveBeenCalledWith({
        where: { player_name: 'TestPlayer' },
        orderBy: { start_time: 'desc' },
        take: 5
      });
      expect(result).toHaveLength(2);
    });
  });

  describe('getLeaderboard', () => {
    it('should get leaderboard without category filter', async () => {
      const mockSessions = [
        { id: 'session-1', score: 200, game_moves: [{ id: 'move-1' }] },
        { id: 'session-2', score: 150, game_moves: [{ id: 'move-2' }, { id: 'move-3' }] }
      ];

      mockPrisma.game_sessions.findMany.mockResolvedValue(mockSessions);

      const result = await gameSessionService.getLeaderboard(10);

      expect(mockPrisma.game_sessions.findMany).toHaveBeenCalledWith({
        where: {
          status: 'completed',
          score: { gt: 0 }
        },
        orderBy: [
          { score: 'desc' },
          { duration_seconds: 'asc' }
        ],
        take: 10,
        include: {
          game_moves: {
            select: { id: true }
          }
        }
      });
      expect(result).toHaveLength(2);
      expect(result[0].total_moves_recorded).toBe(1);
      expect(result[1].total_moves_recorded).toBe(2);
    });

    it('should get leaderboard with category filter', async () => {
      const mockSessions = [
        { id: 'session-1', score: 200, game_moves: [{ id: 'move-1' }] }
      ];

      mockPrisma.game_sessions.findMany.mockResolvedValue(mockSessions);

      await gameSessionService.getLeaderboard(10, 'History');

      expect(mockPrisma.game_sessions.findMany).toHaveBeenCalledWith({
        where: {
          status: 'completed',
          score: { gt: 0 },
          categories: { has: 'History' }
        },
        orderBy: [
          { score: 'desc' },
          { duration_seconds: 'asc' }
        ],
        take: 10,
        include: {
          game_moves: {
            select: { id: true }
          }
        }
      });
    });
  });

  describe('withTransaction', () => {
    it('should execute operation within transaction', async () => {
      const mockOperation = jest.fn().mockResolvedValue('result');
      mockPrisma.$transaction.mockResolvedValue('result');

      const result = await gameSessionService.withTransaction(mockOperation);

      expect(mockPrisma.$transaction).toHaveBeenCalledWith(mockOperation);
      expect(result).toBe('result');
    });
  });

  describe('disconnect', () => {
    it('should disconnect from database', async () => {
      await gameSessionService.disconnect();

      expect(mockPrisma.$disconnect).toHaveBeenCalled();
    });
  });
}); 