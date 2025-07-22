/**
 * GameMoveService Integration Tests
 * @description Comprehensive integration tests for complete game flow validation
 */

const { PrismaClient } = require('@prisma/client');
const GameMoveService = require('../services/GameMoveService');
const GameSessionService = require('../services/GameSessionService');
const CardService = require('../services/CardService');

describe('GameMoveService Integration', () => {
  let prisma;
  let gameMoveService;
  let gameSessionService;
  let cardService;
  let testSessionId;
  let testCardId;

  beforeAll(async () => {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL
        }
      }
    });
    
    gameMoveService = new GameMoveService(prisma);
    gameSessionService = new GameSessionService(prisma);
    cardService = new CardService(prisma);
  });

  beforeEach(async () => {
    // Clean up test data
    await prisma.game_moves.deleteMany();
    await prisma.game_sessions.deleteMany();
    await prisma.cards.deleteMany();

    // Create test card
    const testCard = await cardService.createCard({
      title: 'Integration Test Event',
      dateOccurred: new Date('2020-01-01'),
      category: 'History',
      difficulty: 3,
      description: 'Test event for integration testing'
    });
    testCardId = testCard.id;

    // Create test session
    const testSession = await gameSessionService.createSession({
      player_name: 'IntegrationTestPlayer',
      difficulty_level: 3,
      card_count: 5,
      categories: ['History']
    });
    testSessionId = testSession.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Complete Game Flow', () => {
    test('should handle complete game session with multiple moves', async () => {
      // Create additional test cards
      const card1 = await cardService.createCard({
        title: 'Event 1',
        dateOccurred: new Date('2019-01-01'),
        category: 'History',
        difficulty: 2
      });

      const card2 = await cardService.createCard({
        title: 'Event 2',
        dateOccurred: new Date('2021-01-01'),
        category: 'History',
        difficulty: 4
      });

      // Record moves in sequence
      const move1 = await gameMoveService.recordMove({
        session_id: testSessionId,
        card_id: card1.id,
        position_before: null,
        position_after: 0,
        is_correct: true,
        move_number: 1,
        time_taken_seconds: 5
      });

      const move2 = await gameMoveService.recordMove({
        session_id: testSessionId,
        card_id: testCardId,
        position_before: null,
        position_after: 1,
        is_correct: true,
        move_number: 2,
        time_taken_seconds: 8
      });

      const move3 = await gameMoveService.recordMove({
        session_id: testSessionId,
        card_id: card2.id,
        position_before: null,
        position_after: 2,
        is_correct: false,
        move_number: 3,
        time_taken_seconds: 12
      });

      // Verify moves were recorded
      expect(move1.move_number).toBe(1);
      expect(move1.is_correct).toBe(true);
      expect(move2.move_number).toBe(2);
      expect(move2.is_correct).toBe(true);
      expect(move3.move_number).toBe(3);
      expect(move3.is_correct).toBe(false);

      // Verify session statistics were updated
      const session = await gameSessionService.findById(testSessionId);
      expect(session.total_moves).toBe(3);
      expect(session.correct_moves).toBe(2);
      expect(session.incorrect_moves).toBe(1);

      // Verify all moves can be retrieved
      const sessionMoves = await gameMoveService.getSessionMoves(testSessionId);
      expect(sessionMoves).toHaveLength(3);
      expect(sessionMoves[0].move_number).toBe(1);
      expect(sessionMoves[1].move_number).toBe(2);
      expect(sessionMoves[2].move_number).toBe(3);
    });

    test('should handle move statistics calculation correctly', async () => {
      // Record moves with different outcomes
      await gameMoveService.recordMove({
        session_id: testSessionId,
        card_id: testCardId,
        position_before: null,
        position_after: 0,
        is_correct: true,
        move_number: 1,
        time_taken_seconds: 5
      });

      await gameMoveService.recordMove({
        session_id: testSessionId,
        card_id: testCardId,
        position_before: 0,
        position_after: 1,
        is_correct: false,
        move_number: 2,
        time_taken_seconds: 8
      });

      await gameMoveService.recordMove({
        session_id: testSessionId,
        card_id: testCardId,
        position_before: 1,
        position_after: 2,
        is_correct: true,
        move_number: 3,
        time_taken_seconds: 3
      });

      // Get session move statistics
      const sessionStats = await gameMoveService.getSessionMoveStats(testSessionId);
      expect(sessionStats.total_moves).toBe(3);
      expect(sessionStats.correct_moves).toBe(2);
      expect(sessionStats.incorrect_moves).toBe(1);
      expect(sessionStats.accuracy).toBe(66.67);
      expect(sessionStats.average_move_time).toBe(5.33);
      expect(sessionStats.fastest_move).toBe(3);
      expect(sessionStats.slowest_move).toBe(8);
      expect(sessionStats.moves_with_timing).toBe(3);

      // Get card move statistics
      const cardStats = await gameMoveService.getCardMoveStats(testCardId);
      expect(cardStats.card_id).toBe(testCardId);
      expect(cardStats.total_moves).toBe(3);
      expect(cardStats.correct_moves).toBe(2);
      expect(cardStats.incorrect_moves).toBe(1);
      expect(cardStats.accuracy).toBe(66.67);
      expect(cardStats.average_move_time).toBe(5.33);
    });

    test('should handle bulk move creation with transaction integrity', async () => {
      // Create additional test cards
      const card1 = await cardService.createCard({
        title: 'Bulk Test Event 1',
        dateOccurred: new Date('2019-01-01'),
        category: 'History',
        difficulty: 2
      });

      const card2 = await cardService.createCard({
        title: 'Bulk Test Event 2',
        dateOccurred: new Date('2021-01-01'),
        category: 'History',
        difficulty: 4
      });

      // Create moves data for bulk creation
      const movesData = [
        {
          session_id: testSessionId,
          card_id: card1.id,
          position_before: null,
          position_after: 0,
          is_correct: true,
          move_number: 1,
          time_taken_seconds: 5
        },
        {
          session_id: testSessionId,
          card_id: testCardId,
          position_before: null,
          position_after: 1,
          is_correct: false,
          move_number: 2,
          time_taken_seconds: 8
        },
        {
          session_id: testSessionId,
          card_id: card2.id,
          position_before: null,
          position_after: 2,
          is_correct: true,
          move_number: 3,
          time_taken_seconds: 3
        }
      ];

      // Create moves in bulk
      const createdMoves = await gameMoveService.createMovesBulk(movesData);

      // Verify all moves were created
      expect(createdMoves).toHaveLength(3);
      expect(createdMoves[0].move_number).toBe(1);
      expect(createdMoves[1].move_number).toBe(2);
      expect(createdMoves[2].move_number).toBe(3);

      // Verify session statistics were updated correctly
      const session = await gameSessionService.findById(testSessionId);
      expect(session.total_moves).toBe(3);
      expect(session.correct_moves).toBe(2);
      expect(session.incorrect_moves).toBe(1);

      // Verify moves can be retrieved
      const sessionMoves = await gameMoveService.getSessionMoves(testSessionId);
      expect(sessionMoves).toHaveLength(3);
    });
  });

  describe('Data Consistency', () => {
    test('should maintain referential integrity between moves and sessions', async () => {
      // Record a move
      const move = await gameMoveService.recordMove({
        session_id: testSessionId,
        card_id: testCardId,
        position_before: null,
        position_after: 0,
        is_correct: true,
        move_number: 1,
        time_taken_seconds: 5
      });

      // Verify move references correct session
      expect(move.session_id).toBe(testSessionId);

      // Verify session exists and has correct data
      const session = await gameSessionService.findById(testSessionId);
      expect(session).not.toBeNull();
      expect(session.id).toBe(testSessionId);

      // Verify move can be found by session
      const sessionMoves = await gameMoveService.getSessionMoves(testSessionId);
      expect(sessionMoves).toHaveLength(1);
      expect(sessionMoves[0].id).toBe(move.id);
    });

    test('should maintain referential integrity between moves and cards', async () => {
      // Record a move
      const move = await gameMoveService.recordMove({
        session_id: testSessionId,
        card_id: testCardId,
        position_before: null,
        position_after: 0,
        is_correct: true,
        move_number: 1,
        time_taken_seconds: 5
      });

      // Verify move references correct card
      expect(move.card_id).toBe(testCardId);

      // Verify card exists
      const card = await cardService.findById(testCardId);
      expect(card).not.toBeNull();
      expect(card.id).toBe(testCardId);

      // Verify move can be found by card
      const cardMoves = await gameMoveService.getMovesByCard(testCardId);
      expect(cardMoves).toHaveLength(1);
      expect(cardMoves[0].id).toBe(move.id);
    });

    test('should maintain move number sequence within session', async () => {
      // Record multiple moves
      const move1 = await gameMoveService.recordMove({
        session_id: testSessionId,
        card_id: testCardId,
        position_before: null,
        position_after: 0,
        is_correct: true,
        move_number: 1,
        time_taken_seconds: 5
      });

      const move2 = await gameMoveService.recordMove({
        session_id: testSessionId,
        card_id: testCardId,
        position_before: 0,
        position_after: 1,
        is_correct: false,
        move_number: 2,
        time_taken_seconds: 8
      });

      const move3 = await gameMoveService.recordMove({
        session_id: testSessionId,
        card_id: testCardId,
        position_before: 1,
        position_after: 2,
        is_correct: true,
        move_number: 3,
        time_taken_seconds: 3
      });

      // Verify move numbers are sequential
      expect(move1.move_number).toBe(1);
      expect(move2.move_number).toBe(2);
      expect(move3.move_number).toBe(3);

      // Verify moves are returned in correct order
      const sessionMoves = await gameMoveService.getSessionMoves(testSessionId);
      expect(sessionMoves).toHaveLength(3);
      expect(sessionMoves[0].move_number).toBe(1);
      expect(sessionMoves[1].move_number).toBe(2);
      expect(sessionMoves[2].move_number).toBe(3);
    });
  });

  describe('Query Operations', () => {
    test('should query moves by correctness', async () => {
      // Record moves with different outcomes
      await gameMoveService.recordMove({
        session_id: testSessionId,
        card_id: testCardId,
        position_before: null,
        position_after: 0,
        is_correct: true,
        move_number: 1,
        time_taken_seconds: 5
      });

      await gameMoveService.recordMove({
        session_id: testSessionId,
        card_id: testCardId,
        position_before: 0,
        position_after: 1,
        is_correct: false,
        move_number: 2,
        time_taken_seconds: 8
      });

      // Query correct moves
      const correctMoves = await gameMoveService.getMovesByCorrectness(true);
      expect(correctMoves).toHaveLength(1);
      expect(correctMoves[0].is_correct).toBe(true);

      // Query incorrect moves
      const incorrectMoves = await gameMoveService.getMovesByCorrectness(false);
      expect(incorrectMoves).toHaveLength(1);
      expect(incorrectMoves[0].is_correct).toBe(false);
    });

    test('should query moves by card with pagination', async () => {
      // Create additional test cards
      const card1 = await cardService.createCard({
        title: 'Query Test Event 1',
        dateOccurred: new Date('2019-01-01'),
        category: 'History',
        difficulty: 2
      });

      const card2 = await cardService.createCard({
        title: 'Query Test Event 2',
        dateOccurred: new Date('2021-01-01'),
        category: 'History',
        difficulty: 4
      });

      // Record moves for different cards
      await gameMoveService.recordMove({
        session_id: testSessionId,
        card_id: testCardId,
        position_before: null,
        position_after: 0,
        is_correct: true,
        move_number: 1,
        time_taken_seconds: 5
      });

      await gameMoveService.recordMove({
        session_id: testSessionId,
        card_id: card1.id,
        position_before: null,
        position_after: 1,
        is_correct: false,
        move_number: 2,
        time_taken_seconds: 8
      });

      await gameMoveService.recordMove({
        session_id: testSessionId,
        card_id: card2.id,
        position_before: null,
        position_after: 2,
        is_correct: true,
        move_number: 3,
        time_taken_seconds: 3
      });

      // Query moves by specific card
      const testCardMoves = await gameMoveService.getMovesByCard(testCardId);
      expect(testCardMoves).toHaveLength(1);
      expect(testCardMoves[0].card_id).toBe(testCardId);

      // Query with pagination
      const paginatedMoves = await gameMoveService.getMovesByCard(testCardId, {
        limit: 1,
        offset: 0
      });
      expect(paginatedMoves).toHaveLength(1);
    });

    test('should handle session moves with different include options', async () => {
      // Record a move
      await gameMoveService.recordMove({
        session_id: testSessionId,
        card_id: testCardId,
        position_before: null,
        position_after: 0,
        is_correct: true,
        move_number: 1,
        time_taken_seconds: 5
      });

      // Get moves with card data
      const movesWithCard = await gameMoveService.getSessionMoves(testSessionId, {
        includeCard: true,
        includeSession: false
      });
      expect(movesWithCard).toHaveLength(1);
      expect(movesWithCard[0].card).not.toBeNull();
      expect(movesWithCard[0].session).toBeNull();

      // Get moves with session data
      const movesWithSession = await gameMoveService.getSessionMoves(testSessionId, {
        includeCard: false,
        includeSession: true
      });
      expect(movesWithSession).toHaveLength(1);
      expect(movesWithSession[0].card).toBeNull();
      expect(movesWithSession[0].session).not.toBeNull();

      // Get moves with both
      const movesWithBoth = await gameMoveService.getSessionMoves(testSessionId, {
        includeCard: true,
        includeSession: true
      });
      expect(movesWithBoth).toHaveLength(1);
      expect(movesWithBoth[0].card).not.toBeNull();
      expect(movesWithBoth[0].session).not.toBeNull();
    });
  });

  describe('Error Handling and Rollback', () => {
    test('should handle transaction rollback on error', async () => {
      // Try to record a move with invalid session ID
      const invalidSessionId = '00000000-0000-0000-0000-000000000000';
      
      await expect(gameMoveService.recordMove({
        session_id: invalidSessionId,
        card_id: testCardId,
        position_before: null,
        position_after: 0,
        is_correct: true,
        move_number: 1,
        time_taken_seconds: 5
      })).rejects.toThrow();

      // Verify no moves were created
      const sessionMoves = await gameMoveService.getSessionMoves(testSessionId);
      expect(sessionMoves).toHaveLength(0);

      // Verify session statistics were not updated
      const session = await gameSessionService.findById(testSessionId);
      expect(session.total_moves).toBe(0);
      expect(session.correct_moves).toBe(0);
      expect(session.incorrect_moves).toBe(0);
    });

    test('should handle bulk creation rollback on error', async () => {
      // Create moves data with invalid session ID
      const invalidSessionId = '00000000-0000-0000-0000-000000000000';
      
      const movesData = [
        {
          session_id: testSessionId,
          card_id: testCardId,
          position_before: null,
          position_after: 0,
          is_correct: true,
          move_number: 1,
          time_taken_seconds: 5
        },
        {
          session_id: invalidSessionId, // This will cause an error
          card_id: testCardId,
          position_before: null,
          position_after: 1,
          is_correct: false,
          move_number: 2,
          time_taken_seconds: 8
        }
      ];

      // Try to create moves in bulk
      await expect(gameMoveService.createMovesBulk(movesData)).rejects.toThrow();

      // Verify no moves were created
      const sessionMoves = await gameMoveService.getSessionMoves(testSessionId);
      expect(sessionMoves).toHaveLength(0);

      // Verify session statistics were not updated
      const session = await gameSessionService.findById(testSessionId);
      expect(session.total_moves).toBe(0);
      expect(session.correct_moves).toBe(0);
      expect(session.incorrect_moves).toBe(0);
    });

    test('should handle concurrent move recording', async () => {
      // Record moves concurrently
      const promises = [
        gameMoveService.recordMove({
          session_id: testSessionId,
          card_id: testCardId,
          position_before: null,
          position_after: 0,
          is_correct: true,
          move_number: 1,
          time_taken_seconds: 5
        }),
        gameMoveService.recordMove({
          session_id: testSessionId,
          card_id: testCardId,
          position_before: 0,
          position_after: 1,
          is_correct: false,
          move_number: 2,
          time_taken_seconds: 8
        })
      ];

      const results = await Promise.all(promises);

      // Verify both moves were recorded
      expect(results).toHaveLength(2);
      expect(results[0].move_number).toBe(1);
      expect(results[1].move_number).toBe(2);

      // Verify session statistics are correct
      const session = await gameSessionService.findById(testSessionId);
      expect(session.total_moves).toBe(2);
      expect(session.correct_moves).toBe(1);
      expect(session.incorrect_moves).toBe(1);
    });
  });

  describe('Performance and Scalability', () => {
    test('should handle large number of moves efficiently', async () => {
      const moveCount = 50;
      const movesData = [];

      // Prepare moves data
      for (let i = 0; i < moveCount; i++) {
        movesData.push({
          session_id: testSessionId,
          card_id: testCardId,
          position_before: i,
          position_after: i + 1,
          is_correct: i % 2 === 0, // Alternate correct/incorrect
          move_number: i + 1,
          time_taken_seconds: Math.floor(Math.random() * 10) + 1
        });
      }

      // Record moves in bulk
      const startTime = Date.now();
      const createdMoves = await gameMoveService.createMovesBulk(movesData);
      const endTime = Date.now();

      // Verify all moves were created
      expect(createdMoves).toHaveLength(moveCount);

      // Verify performance (should complete within reasonable time)
      expect(endTime - startTime).toBeLessThan(5000); // 5 seconds

      // Verify session statistics
      const session = await gameSessionService.findById(testSessionId);
      expect(session.total_moves).toBe(moveCount);
      expect(session.correct_moves).toBe(Math.ceil(moveCount / 2));
      expect(session.incorrect_moves).toBe(Math.floor(moveCount / 2));

      // Verify statistics calculation performance
      const statsStartTime = Date.now();
      const stats = await gameMoveService.getSessionMoveStats(testSessionId);
      const statsEndTime = Date.now();

      expect(stats.total_moves).toBe(moveCount);
      expect(statsEndTime - statsStartTime).toBeLessThan(1000); // 1 second
    });
  });
}); 