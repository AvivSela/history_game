import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Timeline from './Timeline';

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

const mockSelectedCard = {
  id: 4,
  title: 'Berlin Wall Falls',
  dateOccurred: '1989-11-09T00:00:00.000Z',
  category: 'History',
  difficulty: 2,
};

describe('Timeline', () => {
  describe('Basic Functionality', () => {
    it('handles empty timeline', () => {
      render(<Timeline events={[]} />);

      expect(screen.getByText('Timeline is empty')).toBeInTheDocument();
      expect(
        screen.getByText('Cards will appear here as you place them correctly')
      ).toBeInTheDocument();
    });

    // Tests moved to behavior tests - see src/tests/behavior/gameBehavior.test.jsx
  });

  // Scroll controls tests moved to behavior tests - see src/tests/behavior/gameBehavior.test.jsx
});
