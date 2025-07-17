import { describe, it, expect } from 'vitest';
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

describe('Game Logic', () => {
  const mockTimeline = [
    {
      id: 1,
      title: 'World War II Begins',
      dateOccurred: '1939-09-01T00:00:00.000Z',
    },
    {
      id: 2,
      title: 'Moon Landing',
      dateOccurred: '1969-07-20T00:00:00.000Z',
    },
  ];

  const mockCard = {
    id: 3,
    title: 'Berlin Wall Falls',
    dateOccurred: '1989-11-09T00:00:00.000Z',
  };

  describe('Card Placement', () => {
    it('validates card placement correctly', () => {
      const result = validateCardPlacement(mockCard, mockTimeline, 2);
      expect(result.isCorrect).toBe(true);
      expect(result.correctPosition).toBe(2);
    });

    it('detects incorrect placement', () => {
      const result = validateCardPlacement(mockCard, mockTimeline, 0);
      expect(result.isCorrect).toBe(false);
      expect(result.correctPosition).toBe(2);
    });

    it('handles empty timeline', () => {
      const result = validateCardPlacement(mockCard, [], 0);
      expect(result.isCorrect).toBe(true);
      expect(result.correctPosition).toBe(0);
    });

    it('maintains chronological order', () => {
      const chronologicalTimeline = [
        { id: 1, title: 'Event 1', dateOccurred: '1900-01-01T00:00:00.000Z' },
        { id: 2, title: 'Event 2', dateOccurred: '1950-01-01T00:00:00.000Z' },
        { id: 3, title: 'Event 3', dateOccurred: '2000-01-01T00:00:00.000Z' },
      ];

      expect(isTimelineChronological(chronologicalTimeline)).toBe(true);
    });
  });

  describe('Position Finding', () => {
    it('finds correct position for card', () => {
      const position = findCorrectPosition(mockCard, mockTimeline);
      expect(position).toBe(2);
    });

    it('handles edge cases', () => {
      const earlyCard = {
        id: 4,
        title: 'Early Event',
        dateOccurred: '1900-01-01T00:00:00.000Z',
      };

      const position = findCorrectPosition(earlyCard, mockTimeline);
      expect(position).toBe(0);
    });
  });

  describe('Feedback Generation', () => {
    it('generates appropriate feedback', () => {
      const feedback = generatePlacementFeedback(
        mockCard,
        mockTimeline,
        2,
        2,
        true
      );
      expect(feedback).toBeTruthy();
      expect(typeof feedback).toBe('string');
    });

    it('handles incorrect placement feedback', () => {
      const feedback = generatePlacementFeedback(
        mockCard,
        mockTimeline,
        0,
        2,
        false
      );
      expect(feedback).toBeTruthy();
      expect(typeof feedback).toBe('string');
    });
  });

  describe('Score Calculation', () => {
    it('calculates score correctly', () => {
      const score = calculateScore(true, 5, 1, 2);
      expect(score).toBeGreaterThan(0);
      expect(typeof score).toBe('number');
    });

    it('handles edge cases', () => {
      const score = calculateScore(false, 0, 1, 1);
      expect(score).toBe(0);
    });
  });

  describe('Win Condition', () => {
    it('detects win condition', () => {
      const isWin = checkWinCondition([]);
      expect(isWin).toBe(true);
    });

    it('handles ongoing game', () => {
      const isWin = checkWinCondition([mockCard]);
      expect(isWin).toBe(false);
    });
  });

  describe('Utility Functions', () => {
    it('shuffles array', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray([...original]);
      
      expect(shuffled).toHaveLength(original.length);
      expect(shuffled).toEqual(expect.arrayContaining(original));
    });

    it('formats time correctly', () => {
      const formatted = formatTime(65);
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
    });

    it('creates game session', () => {
      const events = [mockCard, ...mockTimeline];
      const session = createGameSession(events, { cardCount: 3 });
      expect(session).toBeTruthy();
      expect(session.timeline).toHaveLength(1);
      expect(session.playerHand).toHaveLength(2);
    });
  });
});
