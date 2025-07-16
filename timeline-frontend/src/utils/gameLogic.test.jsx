import { describe, it, expect, vi } from 'vitest';
import {
  validateCardPlacement,
  isTimelineChronological,
  findCorrectPosition,
  generatePlacementFeedback,
  calculateScore,
  checkWinCondition,
  shuffleArray,
  formatTime,
  createGameSession,
} from './gameLogic';

const mockEvents = [
  {
    id: 1,
    title: 'World War II Begins',
    dateOccurred: '1939-09-01T00:00:00.000Z',
    category: 'History',
    difficulty: 2,
  },
  {
    id: 2,
    title: 'Moon Landing',
    dateOccurred: '1969-07-20T00:00:00.000Z',
    category: 'Science',
    difficulty: 1,
  },
  {
    id: 3,
    title: 'Internet Created',
    dateOccurred: '1989-03-12T00:00:00.000Z',
    category: 'Technology',
    difficulty: 3,
  },
];

const testCard = {
  id: 4,
  title: 'Berlin Wall Falls',
  dateOccurred: '1989-11-09T00:00:00.000Z',
  category: 'History',
  difficulty: 2,
};

describe('gameLogic', () => {
  describe('validateCardPlacement', () => {
    it('should validate correct card placement', () => {
      const timeline = [mockEvents[0], mockEvents[1]]; // 1939, 1969
      const result = validateCardPlacement(testCard, timeline, 2); // 1989 at end

      expect(result.isCorrect).toBe(true);
      expect(result.correctPosition).toBe(2);
      expect(result.feedback).toContain('correctly placed');
    });

    it('should detect incorrect card placement', () => {
      const timeline = [mockEvents[0], mockEvents[1]]; // 1939, 1969
      const result = validateCardPlacement(testCard, timeline, 0); // 1989 at beginning

      expect(result.isCorrect).toBe(false);
      expect(result.correctPosition).toBe(2);
      expect(result.feedback).toContain('later');
    });

    it('should handle empty timeline', () => {
      const result = validateCardPlacement(testCard, [], 0);

      expect(result.isCorrect).toBe(true);
      expect(result.correctPosition).toBe(0);
    });

    it('should return card date in result', () => {
      const result = validateCardPlacement(testCard, [], 0);

      expect(result.dateOccurred).toBe(testCard.dateOccurred);
    });
  });

  describe('isTimelineChronological', () => {
    it('should return true for chronologically ordered timeline', () => {
      const chronologicalTimeline = [
        mockEvents[0],
        mockEvents[1],
        mockEvents[2],
      ];

      expect(isTimelineChronological(chronologicalTimeline)).toBe(true);
    });

    it('should return false for non-chronological timeline', () => {
      const nonChronologicalTimeline = [
        mockEvents[1],
        mockEvents[0],
        mockEvents[2],
      ];

      expect(isTimelineChronological(nonChronologicalTimeline)).toBe(false);
    });

    it('should return true for empty timeline', () => {
      expect(isTimelineChronological([])).toBe(true);
    });

    it('should return true for single item timeline', () => {
      expect(isTimelineChronological([mockEvents[0]])).toBe(true);
    });
  });

  describe('findCorrectPosition', () => {
    it('should find correct position at beginning', () => {
      const card = { dateOccurred: '1920-01-01T00:00:00.000Z' };
      const timeline = [mockEvents[0], mockEvents[1]];

      expect(findCorrectPosition(card, timeline)).toBe(0);
    });

    it('should find correct position in middle', () => {
      const card = { dateOccurred: '1950-01-01T00:00:00.000Z' };
      const timeline = [mockEvents[0], mockEvents[1]];

      expect(findCorrectPosition(card, timeline)).toBe(1);
    });

    it('should find correct position at end', () => {
      const card = { dateOccurred: '2000-01-01T00:00:00.000Z' };
      const timeline = [mockEvents[0], mockEvents[1]];

      expect(findCorrectPosition(card, timeline)).toBe(2);
    });

    it('should handle empty timeline', () => {
      const card = { dateOccurred: '1950-01-01T00:00:00.000Z' };

      expect(findCorrectPosition(card, [])).toBe(0);
    });
  });

  describe('generatePlacementFeedback', () => {
    it('should generate positive feedback for correct placement', () => {
      const feedback = generatePlacementFeedback(
        testCard,
        [mockEvents[0]],
        1,
        1,
        true
      );

      expect(feedback).toContain('Berlin Wall Falls');
      expect(feedback).toContain('1989');
      expect(feedback).toContain('correctly placed');
    });

    it('should generate directional feedback for incorrect placement', () => {
      const feedback = generatePlacementFeedback(
        testCard,
        [mockEvents[0]],
        0,
        1,
        false
      );

      expect(feedback).toContain('Berlin Wall Falls');
      expect(feedback).toContain('later');
    });

    it('should handle empty timeline feedback', () => {
      const feedback = generatePlacementFeedback(testCard, [], 0, 0, false);

      expect(feedback).toContain('1989');
      expect(feedback).toContain('Try a different position');
    });

    it('should include random positive messages', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0);
      const feedback = generatePlacementFeedback(
        testCard,
        [mockEvents[0]],
        1,
        1,
        true
      );

      expect(feedback).toContain('Perfect!');
      Math.random.mockRestore();
    });
  });

  describe('calculateScore', () => {
    it('should return 0 for incorrect placement', () => {
      expect(calculateScore(false, 0, 1, 1)).toBe(0);
    });

    it('should calculate base score with difficulty multiplier', () => {
      const score = calculateScore(true, 0, 1, 3);
      expect(score).toBeGreaterThan(300); // Base 300 + time bonus
    });

    it('should apply time bonus for quick placement', () => {
      const quickScore = calculateScore(true, 1, 1, 1);
      const slowScore = calculateScore(true, 10, 1, 1);

      expect(quickScore).toBeGreaterThan(slowScore);
    });

    it('should apply attempt penalty', () => {
      const firstAttempt = calculateScore(true, 5, 1, 1);
      const secondAttempt = calculateScore(true, 5, 2, 1);

      expect(firstAttempt).toBeGreaterThan(secondAttempt);
      expect(firstAttempt - secondAttempt).toBe(25);
    });

    it('should have minimum score of 10', () => {
      const score = calculateScore(true, 100, 10, 1);
      expect(score).toBe(10);
    });

    it('should round final score', () => {
      const score = calculateScore(true, 2.7, 1, 1);
      expect(Number.isInteger(score)).toBe(true);
    });
  });

  describe('checkWinCondition', () => {
    it('should return true when player hand is empty', () => {
      expect(checkWinCondition([])).toBe(true);
    });

    it('should return false when player hand has cards', () => {
      expect(checkWinCondition([mockEvents[0]])).toBe(false);
    });
  });

  describe('shuffleArray', () => {
    it('should return array with same length', () => {
      const shuffled = shuffleArray(mockEvents);
      expect(shuffled).toHaveLength(mockEvents.length);
    });

    it('should contain all original elements', () => {
      const shuffled = shuffleArray(mockEvents);
      mockEvents.forEach(event => {
        expect(shuffled).toContainEqual(event);
      });
    });

    it('should not modify original array', () => {
      const original = [...mockEvents];
      shuffleArray(mockEvents);
      expect(mockEvents).toEqual(original);
    });

    it('should handle empty array', () => {
      const shuffled = shuffleArray([]);
      expect(shuffled).toEqual([]);
    });
  });

  describe('formatTime', () => {
    it('should format seconds under 60', () => {
      expect(formatTime(30)).toBe('30s');
      expect(formatTime(5.7)).toBe('6s');
    });

    it('should format minutes and seconds', () => {
      expect(formatTime(90)).toBe('1m 30s');
      expect(formatTime(125)).toBe('2m 5s');
    });

    it('should handle exact minutes', () => {
      expect(formatTime(120)).toBe('2m 0s');
    });

    it('should round seconds properly', () => {
      expect(formatTime(65.8)).toBe('1m 6s');
    });
  });

  describe('createGameSession', () => {
    const sixEvents = [
      {
        id: 1,
        title: 'Event 1',
        dateOccurred: '2000-01-01',
        category: 'A',
        difficulty: 1,
      },
      {
        id: 2,
        title: 'Event 2',
        dateOccurred: '2001-01-01',
        category: 'A',
        difficulty: 1,
      },
      {
        id: 3,
        title: 'Event 3',
        dateOccurred: '2002-01-01',
        category: 'A',
        difficulty: 1,
      },
      {
        id: 4,
        title: 'Event 4',
        dateOccurred: '2003-01-01',
        category: 'A',
        difficulty: 1,
      },
      {
        id: 5,
        title: 'Event 5',
        dateOccurred: '2004-01-01',
        category: 'A',
        difficulty: 1,
      },
      {
        id: 6,
        title: 'Event 6',
        dateOccurred: '2005-01-01',
        category: 'A',
        difficulty: 1,
      },
    ];

    it('should create game session with default settings', () => {
      const session = createGameSession(sixEvents);
      expect(session.sessionId).toMatch(/^game_\d+$/);
      expect(session.timeline).toHaveLength(1);
      expect(session.playerHand).toHaveLength(5);
      expect(session.score).toBe(0);
      expect(session.status).toBe('playing');
      expect(session.timeline[0].isRevealed).toBe(true);
    });

    it('should respect custom card count', () => {
      const session = createGameSession(sixEvents, { cardCount: 2 });
      expect(session.timeline).toHaveLength(1);
      expect(session.playerHand).toHaveLength(2);
    });

    it('should initialize tracking properties', () => {
      const session = createGameSession(sixEvents);
      expect(session.attempts).toEqual({});
      expect(session.hintsUsed).toBe(0);
      expect(typeof session.startTime).toBe('number');
    });

    it('should not modify original events array', () => {
      const eventsCopy = [...sixEvents];
      createGameSession(eventsCopy);
      expect(eventsCopy).toEqual(sixEvents);
    });
  });
});
