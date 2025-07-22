/**
 * GameMoveService Tests
 * @description Comprehensive tests for GameMoveService with Prisma ORM
 */

const { PrismaClient } = require('@prisma/client');
const GameMoveService = require('../services/GameMoveService');
const GameSessionService = require('../services/GameSessionService');
const CardService = require('../services/CardService');

// Mock Prisma client for testing
const mockPrisma = {
  game_moves: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn()
  },
  game_sessions: {
    update: jest.fn()
  },
  $transaction: jest.fn(),
  $disconnect: jest.fn()
};

describe('GameMoveService', () => {
  let gameMoveService;
  let gameSessionService;
  let cardService;

  beforeEach(() => {
    jest.clearAllMocks();
    gameMoveService = new GameMoveService(mockPrisma);
    gameSessionService = new GameSessionService(mockPrisma);
    cardService = new CardService(mockPrisma);
  });

  describe('Constructor', () => {
    test('should create service with provided Prisma client', () => {
      const service = new GameMoveService(mockPrisma);
      expect(service).toBeInstanceOf(GameMoveService);
    });

    test('should create service with new Prisma client if none provided', () => {
      const service = new GameMoveService();
      expect(service).toBeInstanceOf(GameMoveService);
    });
  });

  describe('transformMove', () => {
    test('should transform Prisma move to API format', () => {
      const prismaMove = {
        id: 'move-uuid-1',
        session_id: 'session-uuid-1',
        card_id: 1,
        position_before: 0,
        position_after: 1,
        is_correct: true,
        move_number: 1,
        time_taken_seconds: 5,
        created_at: new Date('2024-01-01'),
        cards: {
          id: 1,
          title: 'Test Event',
          date_occurred: new Date('2020-01-01'),
          category: 'History',
          difficulty: 3
        },
        game_sessions: {
          id: 'session-uuid-1',
          player_name: 'TestPlayer',
          status: 'active'
        }
      };

      const result = gameMoveService.transformMove(prismaMove);

      expect(result).toEqual({
        id: 'move-uuid-1',
        session_id: 'session-uuid-1',
        card_id: 1,
        position_before: 0,
        position_after: 1,
        is_correct: true,
        move_number: 1,
        time_taken_seconds: 5,
        created_at: new Date('2024-01-01'),
        card: {
          id: 1,
          title: 'Test Event',
          date_occurred: new Date('2020-01-01'),
          category: 'History',
          difficulty: 3
        },
        session: {
          id: 'session-uuid-1',
          player_name: 'TestPlayer',
          status: 'active'
        }
      });
    });

    test('should handle null move', () => {
      const result = gameMoveService.transformMove(null);
      expect(result).toBeNull();
    });

    test('should handle move without related data', () => {
      const prismaMove = {
        id: 'move-uuid-1',
        session_id: 'session-uuid-1',
        card_id: 1,
        position_before: 0,
        position_after: 1,
        is_correct: true,
        move_number: 1,
        time_taken_seconds: 5,
        created_at: new Date('2024-01-01')
      };

      const result = gameMoveService.transformMove(prismaMove);

      expect(result.card).toBeNull();
      expect(result.session).toBeNull();
    });
  });

  describe('transformToPrisma', () => {
    test('should transform API data to Prisma format', () => {
      const apiData = {
        session_id: 'session-uuid-1',
        card_id: 1,
        position_before: 0,
        position_after: 1,
        is_correct: true,
        move_number: 1,
        time_taken_seconds: 5
      };

      const result = gameMoveService.transformToPrisma(apiData);

      expect(result).toEqual(apiData);
    });

    test('should handle partial data', () => {
      const apiData = {
        session_id: 'session-uuid-1',
        card_id: 1,
        is_correct: true
      };

      const result = gameMoveService.transformToPrisma(apiData);

      expect(result).toEqual({
        session_id: 'session-uuid-1',
        card_id: 1,
        is_correct: true
      });
    });
  });

  describe('findById', () => {
    test('should find move by ID with related data', async () => {
      const mockMove = {
        id: 'move-uuid-1',
        session_id: 'session-uuid-1',
        card_id: 1,
        position_before: 0,
        position_after: 1,
        is_correct: true,
        move_number: 1,
        time_taken_seconds: 5,
        created_at: new Date('2024-01-01'),
        cards: {
          id: 1,
          title: 'Test Event',
          date_occurred: new Date('2020-01-01'),
          category: 'History',
          difficulty: 3
        },
        game_sessions: {
          id: 'session-uuid-1',
          player_name: 'TestPlayer',
          status: 'active'
        }
      };

      mockPrisma.game_moves.findUnique.mockResolvedValue(mockMove);

      const result = await gameMoveService.findById('move-uuid-1');

      expect(mockPrisma.game_moves.findUnique).toHaveBeenCalledWith({
        where: { id: 'move-uuid-1' },
        include: {
          cards: true,
          game_sessions: {
            select: {
              id: true,
              player_name: true,
              status: true
            }
          }
        }
      });
      expect(result).toEqual(gameMoveService.transformMove(mockMove));
    });

    test('should return null for non-existent move', async () => {
      mockPrisma.game_moves.findUnique.mockResolvedValue(null);

      const result = await gameMoveService.findById('non-existent');

      expect(result).toBeNull();
    });

    test('should handle errors', async () => {
      const error = new Error('Database error');
      mockPrisma.game_moves.findUnique.mockRejectedValue(error);

      await expect(gameMoveService.findById('move-uuid-1')).rejects.toThrow('Database error');
    });
  });

  describe('createMove', () => {
    test('should create move with related data', async () => {
      const moveData = {
        session_id: 'session-uuid-1',
        card_id: 1,
        position_before: 0,
        position_after: 1,
        is_correct: true,
        move_number: 1,
        time_taken_seconds: 5
      };

      const mockCreatedMove = {
        id: 'move-uuid-1',
        ...moveData,
        created_at: new Date('2024-01-01'),
        cards: {
          id: 1,
          title: 'Test Event',
          date_occurred: new Date('2020-01-01'),
          category: 'History',
          difficulty: 3
        },
        game_sessions: {
          id: 'session-uuid-1',
          player_name: 'TestPlayer',
          status: 'active'
        }
      };

      mockPrisma.game_moves.create.mockResolvedValue(mockCreatedMove);

      const result = await gameMoveService.createMove(moveData);

      expect(mockPrisma.game_moves.create).toHaveBeenCalledWith({
        data: moveData,
        include: {
          cards: true,
          game_sessions: {
            select: {
              id: true,
              player_name: true,
              status: true
            }
          }
        }
      });
      expect(result).toEqual(gameMoveService.transformMove(mockCreatedMove));
    });

    test('should handle errors', async () => {
      const error = new Error('Database error');
      mockPrisma.game_moves.create.mockRejectedValue(error);

      await expect(gameMoveService.createMove({})).rejects.toThrow('Database error');
    });
  });

  describe('updateMove', () => {
    test('should update move', async () => {
      const updateData = {
        position_after: 2,
        time_taken_seconds: 10
      };

      const mockUpdatedMove = {
        id: 'move-uuid-1',
        session_id: 'session-uuid-1',
        card_id: 1,
        position_before: 0,
        position_after: 2,
        is_correct: true,
        move_number: 1,
        time_taken_seconds: 10,
        created_at: new Date('2024-01-01'),
        cards: {
          id: 1,
          title: 'Test Event',
          date_occurred: new Date('2020-01-01'),
          category: 'History',
          difficulty: 3
        },
        game_sessions: {
          id: 'session-uuid-1',
          player_name: 'TestPlayer',
          status: 'active'
        }
      };

      mockPrisma.game_moves.update.mockResolvedValue(mockUpdatedMove);

      const result = await gameMoveService.updateMove('move-uuid-1', updateData);

      expect(mockPrisma.game_moves.update).toHaveBeenCalledWith({
        where: { id: 'move-uuid-1' },
        data: updateData,
        include: {
          cards: true,
          game_sessions: {
            select: {
              id: true,
              player_name: true,
              status: true
            }
          }
        }
      });
      expect(result).toEqual(gameMoveService.transformMove(mockUpdatedMove));
    });
  });

  describe('deleteMove', () => {
    test('should delete move', async () => {
      const mockDeletedMove = {
        id: 'move-uuid-1',
        session_id: 'session-uuid-1',
        card_id: 1,
        position_before: 0,
        position_after: 1,
        is_correct: true,
        move_number: 1,
        time_taken_seconds: 5,
        created_at: new Date('2024-01-01'),
        cards: {
          id: 1,
          title: 'Test Event',
          date_occurred: new Date('2020-01-01'),
          category: 'History',
          difficulty: 3
        },
        game_sessions: {
          id: 'session-uuid-1',
          player_name: 'TestPlayer',
          status: 'active'
        }
      };

      mockPrisma.game_moves.delete.mockResolvedValue(mockDeletedMove);

      const result = await gameMoveService.deleteMove('move-uuid-1');

      expect(mockPrisma.game_moves.delete).toHaveBeenCalledWith({
        where: { id: 'move-uuid-1' },
        include: {
          cards: true,
          game_sessions: {
            select: {
              id: true,
              player_name: true,
              status: true
            }
          }
        }
      });
      expect(result).toEqual(gameMoveService.transformMove(mockDeletedMove));
    });
  });

  describe('getSessionMoves', () => {
    test('should get moves for session with default options', async () => {
      const mockMoves = [
        {
          id: 'move-uuid-1',
          session_id: 'session-uuid-1',
          card_id: 1,
          position_before: 0,
          position_after: 1,
          is_correct: true,
          move_number: 1,
          time_taken_seconds: 5,
          created_at: new Date('2024-01-01'),
          cards: {
            id: 1,
            title: 'Test Event 1',
            date_occurred: new Date('2020-01-01'),
            category: 'History',
            difficulty: 3
          }
        },
        {
          id: 'move-uuid-2',
          session_id: 'session-uuid-1',
          card_id: 2,
          position_before: 1,
          position_after: 2,
          is_correct: false,
          move_number: 2,
          time_taken_seconds: 8,
          created_at: new Date('2024-01-01'),
          cards: {
            id: 2,
            title: 'Test Event 2',
            date_occurred: new Date('2020-02-01'),
            category: 'Technology',
            difficulty: 4
          }
        }
      ];

      mockPrisma.game_moves.findMany.mockResolvedValue(mockMoves);

      const result = await gameMoveService.getSessionMoves('session-uuid-1');

      expect(mockPrisma.game_moves.findMany).toHaveBeenCalledWith({
        where: { session_id: 'session-uuid-1' },
        orderBy: { move_number: 'asc' },
        include: { cards: true }
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(gameMoveService.transformMove(mockMoves[0]));
      expect(result[1]).toEqual(gameMoveService.transformMove(mockMoves[1]));
    });

    test('should get moves with custom options', async () => {
      const mockMoves = [];
      mockPrisma.game_moves.findMany.mockResolvedValue(mockMoves);

      await gameMoveService.getSessionMoves('session-uuid-1', {
        orderBy: 'created_at',
        order: 'desc',
        includeCard: false,
        includeSession: true
      });

      expect(mockPrisma.game_moves.findMany).toHaveBeenCalledWith({
        where: { session_id: 'session-uuid-1' },
        orderBy: { created_at: 'desc' },
        include: {
          game_sessions: {
            select: {
              id: true,
              player_name: true,
              status: true
            }
          }
        }
      });
    });
  });

  describe('getMovesByCard', () => {
    test('should get moves by card with pagination', async () => {
      const mockMoves = [
        {
          id: 'move-uuid-1',
          session_id: 'session-uuid-1',
          card_id: 1,
          position_before: 0,
          position_after: 1,
          is_correct: true,
          move_number: 1,
          time_taken_seconds: 5,
          created_at: new Date('2024-01-01'),
          game_sessions: {
            id: 'session-uuid-1',
            player_name: 'TestPlayer',
            status: 'active'
          }
        }
      ];

      mockPrisma.game_moves.findMany.mockResolvedValue(mockMoves);

      const result = await gameMoveService.getMovesByCard(1, {
        limit: 10,
        offset: 0,
        orderBy: 'created_at',
        order: 'desc'
      });

      expect(mockPrisma.game_moves.findMany).toHaveBeenCalledWith({
        where: { card_id: 1 },
        orderBy: { created_at: 'desc' },
        take: 10,
        skip: 0,
        include: {
          game_sessions: {
            select: {
              id: true,
              player_name: true,
              status: true
            }
          }
        }
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(gameMoveService.transformMove(mockMoves[0]));
    });
  });

  describe('getMovesByCorrectness', () => {
    test('should get correct moves', async () => {
      const mockMoves = [
        {
          id: 'move-uuid-1',
          session_id: 'session-uuid-1',
          card_id: 1,
          position_before: 0,
          position_after: 1,
          is_correct: true,
          move_number: 1,
          time_taken_seconds: 5,
          created_at: new Date('2024-01-01'),
          cards: {
            id: 1,
            title: 'Test Event',
            date_occurred: new Date('2020-01-01'),
            category: 'History',
            difficulty: 3
          },
          game_sessions: {
            id: 'session-uuid-1',
            player_name: 'TestPlayer',
            status: 'active'
          }
        }
      ];

      mockPrisma.game_moves.findMany.mockResolvedValue(mockMoves);

      const result = await gameMoveService.getMovesByCorrectness(true);

      expect(mockPrisma.game_moves.findMany).toHaveBeenCalledWith({
        where: { is_correct: true },
        orderBy: { created_at: 'desc' },
        take: 50,
        skip: 0,
        include: {
          cards: true,
          game_sessions: {
            select: {
              id: true,
              player_name: true,
              status: true
            }
          }
        }
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(gameMoveService.transformMove(mockMoves[0]));
    });
  });

  describe('getSessionMoveStats', () => {
    test('should calculate session move statistics', async () => {
      const mockMoves = [
        {
          id: 'move-uuid-1',
          session_id: 'session-uuid-1',
          card_id: 1,
          position_before: 0,
          position_after: 1,
          is_correct: true,
          move_number: 1,
          time_taken_seconds: 5,
          created_at: new Date('2024-01-01')
        },
        {
          id: 'move-uuid-2',
          session_id: 'session-uuid-1',
          card_id: 2,
          position_before: 1,
          position_after: 2,
          is_correct: false,
          move_number: 2,
          time_taken_seconds: 8,
          created_at: new Date('2024-01-01')
        },
        {
          id: 'move-uuid-3',
          session_id: 'session-uuid-1',
          card_id: 3,
          position_before: 2,
          position_after: 3,
          is_correct: true,
          move_number: 3,
          time_taken_seconds: 3,
          created_at: new Date('2024-01-01')
        }
      ];

      mockPrisma.game_moves.findMany.mockResolvedValue(mockMoves);

      const result = await gameMoveService.getSessionMoveStats('session-uuid-1');

      expect(result).toEqual({
        total_moves: 3,
        correct_moves: 2,
        incorrect_moves: 1,
        accuracy: 66.67,
        average_move_time: 5.33,
        fastest_move: 3,
        slowest_move: 8,
        moves_with_timing: 3
      });
    });

    test('should handle moves without timing data', async () => {
      const mockMoves = [
        {
          id: 'move-uuid-1',
          session_id: 'session-uuid-1',
          card_id: 1,
          position_before: 0,
          position_after: 1,
          is_correct: true,
          move_number: 1,
          time_taken_seconds: null,
          created_at: new Date('2024-01-01')
        }
      ];

      mockPrisma.game_moves.findMany.mockResolvedValue(mockMoves);

      const result = await gameMoveService.getSessionMoveStats('session-uuid-1');

      expect(result).toEqual({
        total_moves: 1,
        correct_moves: 1,
        incorrect_moves: 0,
        accuracy: 100,
        average_move_time: 0,
        fastest_move: 0,
        slowest_move: 0,
        moves_with_timing: 0
      });
    });
  });

  describe('getCardMoveStats', () => {
    test('should calculate card move statistics', async () => {
      const mockMoves = [
        {
          id: 'move-uuid-1',
          session_id: 'session-uuid-1',
          card_id: 1,
          position_before: 0,
          position_after: 1,
          is_correct: true,
          move_number: 1,
          time_taken_seconds: 5,
          created_at: new Date('2024-01-01')
        },
        {
          id: 'move-uuid-2',
          session_id: 'session-uuid-2',
          card_id: 1,
          position_before: 0,
          position_after: 1,
          is_correct: false,
          move_number: 1,
          time_taken_seconds: 8,
          created_at: new Date('2024-01-01')
        }
      ];

      mockPrisma.game_moves.findMany.mockResolvedValue(mockMoves);

      const result = await gameMoveService.getCardMoveStats(1);

      expect(result).toEqual({
        card_id: 1,
        total_moves: 2,
        correct_moves: 1,
        incorrect_moves: 1,
        accuracy: 50,
        average_move_time: 6.5,
        moves_with_timing: 2
      });
    });
  });

  describe('recordMove', () => {
    test('should record move with transaction and update session stats', async () => {
      const moveData = {
        session_id: 'session-uuid-1',
        card_id: 1,
        position_before: 0,
        position_after: 1,
        is_correct: true,
        move_number: 1,
        time_taken_seconds: 5
      };

      const mockCreatedMove = {
        id: 'move-uuid-1',
        ...moveData,
        created_at: new Date('2024-01-01'),
        card: {
          id: 1,
          title: 'Test Event',
          date_occurred: new Date('2020-01-01'),
          category: 'History',
          difficulty: 3
        },
        game_sessions: {
          id: 'session-uuid-1',
          player_name: 'TestPlayer',
          status: 'active'
        }
      };

      const mockTransaction = jest.fn().mockImplementation(async (operation) => {
        return await operation({
          game_moves: {
            create: jest.fn().mockResolvedValue(mockCreatedMove)
          },
          game_sessions: {
            update: jest.fn().mockResolvedValue({})
          }
        });
      });

      mockPrisma.$transaction.mockImplementation(mockTransaction);

      const result = await gameMoveService.recordMove(moveData);

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(result).toEqual(gameMoveService.transformMove(mockCreatedMove));
    });

    test('should handle transaction errors', async () => {
      const error = new Error('Transaction error');
      mockPrisma.$transaction.mockRejectedValue(error);

      await expect(gameMoveService.recordMove({})).rejects.toThrow('Transaction error');
    });
  });

  describe('createMovesBulk', () => {
    test('should create multiple moves with transaction', async () => {
      const movesData = [
        {
          session_id: 'session-uuid-1',
          card_id: 1,
          position_before: 0,
          position_after: 1,
          is_correct: true,
          move_number: 1,
          time_taken_seconds: 5
        },
        {
          session_id: 'session-uuid-1',
          card_id: 2,
          position_before: 1,
          position_after: 2,
          is_correct: false,
          move_number: 2,
          time_taken_seconds: 8
        }
      ];

      const mockCreatedMoves = movesData.map((data, index) => ({
        id: `move-uuid-${index + 1}`,
        ...data,
        created_at: new Date('2024-01-01'),
        card: {
          id: data.card_id,
          title: `Test Event ${data.card_id}`,
          date_occurred: new Date('2020-01-01'),
          category: 'History',
          difficulty: 3
        },
        game_sessions: {
          id: data.session_id,
          player_name: 'TestPlayer',
          status: 'active'
        }
      }));

      const mockTransaction = jest.fn().mockImplementation(async (operation) => {
        return await operation({
          game_moves: {
            create: jest.fn().mockImplementation((data) => {
              const index = movesData.findIndex(move => move.card_id === data.data.card_id);
              return Promise.resolve(mockCreatedMoves[index]);
            })
          },
          game_sessions: {
            update: jest.fn().mockResolvedValue({})
          }
        });
      });

      mockPrisma.$transaction.mockImplementation(mockTransaction);

      const result = await gameMoveService.createMovesBulk(movesData);

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(gameMoveService.transformMove(mockCreatedMoves[0]));
      expect(result[1]).toEqual(gameMoveService.transformMove(mockCreatedMoves[1]));
    });

    test('should handle empty moves array', async () => {
      const result = await gameMoveService.createMovesBulk([]);
      expect(result).toEqual([]);
    });
  });

  describe('withTransaction', () => {
    test('should execute operation within transaction', async () => {
      const mockOperation = jest.fn().mockResolvedValue('result');
      mockPrisma.$transaction.mockResolvedValue('result');

      const result = await gameMoveService.withTransaction(mockOperation);

      expect(mockPrisma.$transaction).toHaveBeenCalledWith(mockOperation);
      expect(result).toBe('result');
    });
  });

  describe('disconnect', () => {
    test('should disconnect from database', async () => {
      mockPrisma.$disconnect.mockResolvedValue();

      await gameMoveService.disconnect();

      expect(mockPrisma.$disconnect).toHaveBeenCalled();
    });
  });
}); 