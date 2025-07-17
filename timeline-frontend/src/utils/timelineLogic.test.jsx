import { describe, it, expect } from 'vitest';
import {
  validatePlacementWithTolerance,
  findCorrectPosition,
  generateExactMatchFeedback,
  generateCloseMatchFeedback,
  generateMissedFeedback,
  generateSmartInsertionPoints,
  calculateInsertionPointRelevance,
} from './timelineLogic';

describe('Timeline Logic', () => {
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

  describe('Placement Validation', () => {
    it('validates placement correctly', () => {
      const result = validatePlacementWithTolerance(mockCard, mockTimeline, 2);
      expect(result.isCorrect).toBe(true);
      expect(result.correctPosition).toBe(2);
    });

    it('detects incorrect placement', () => {
      const result = validatePlacementWithTolerance(mockCard, mockTimeline, 0);
      expect(result.isCorrect).toBe(false);
      expect(result.correctPosition).toBe(2);
    });

    it('handles small timeline', () => {
      const result = validatePlacementWithTolerance(mockCard, [mockTimeline[0]], 1);
      expect(result.isCorrect).toBe(true);
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
    it('generates exact match feedback', () => {
      const feedback = generateExactMatchFeedback(mockCard);
      expect(feedback).toBeTruthy();
      expect(typeof feedback).toBe('string');
    });

    it('generates close match feedback', () => {
      const feedback = generateCloseMatchFeedback(mockCard, 1);
      expect(feedback).toBeTruthy();
      expect(typeof feedback).toBe('string');
    });

    it('generates missed feedback', () => {
      const feedback = generateMissedFeedback(mockCard, 0, 2);
      expect(feedback).toBeTruthy();
      expect(typeof feedback).toBe('string');
    });
  });

  describe('Insertion Points', () => {
    it('generates smart insertion points', () => {
      const points = generateSmartInsertionPoints(mockTimeline);
      expect(points).toBeTruthy();
      expect(Array.isArray(points)).toBe(true);
    });

    it('calculates insertion point relevance', () => {
      const insertionPoint = {
        referenceCard: mockTimeline[0],
        nextCard: mockTimeline[1],
      };
      const cardDate = new Date(mockCard.dateOccurred);
      const relevance = calculateInsertionPointRelevance(insertionPoint, cardDate);
      expect(relevance).toBeGreaterThan(0);
      expect(typeof relevance).toBe('number');
    });
  });
});
