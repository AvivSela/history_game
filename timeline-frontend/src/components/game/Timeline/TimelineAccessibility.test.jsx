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
    title: 'Berlin Wall Falls',
    dateOccurred: '1989-11-09T00:00:00.000Z',
    category: 'History',
    difficulty: 2,
  },
  {
    id: 4,
    title: 'Internet Created',
    dateOccurred: '1983-01-01T00:00:00.000Z',
    category: 'Technology',
    difficulty: 1,
  },
];

const mockSelectedCard = {
  id: 4,
  title: 'Berlin Wall Falls',
  dateOccurred: '1989-11-09T00:00:00.000Z',
  category: 'History',
  difficulty: 2,
};

describe('Timeline Accessibility', () => {
  describe('Keyboard Navigation', () => {
    it('should handle arrow key navigation between insertion points', () => {
      const onInsertionPointClick = vi.fn();
      render(
        <Timeline
          events={mockEvents}
          highlightInsertionPoints={true}
          selectedCard={mockSelectedCard}
          onInsertionPointClick={onInsertionPointClick}
        />
      );

      const insertionPoints = screen.getAllByTestId('insertion-point');
      expect(insertionPoints).toHaveLength(mockEvents.length + 1); // Before first + after each event

      // Focus the first insertion point
      insertionPoints[0].focus();
      expect(insertionPoints[0]).toHaveFocus();

      // Test arrow right navigation
      fireEvent.keyDown(insertionPoints[0], { key: 'ArrowRight' });
      expect(insertionPoints[1]).toHaveFocus();

      // Test arrow left navigation
      fireEvent.keyDown(insertionPoints[1], { key: 'ArrowLeft' });
      expect(insertionPoints[0]).toHaveFocus();
    });

    it('should handle Enter key to select insertion point', () => {
      const onInsertionPointClick = vi.fn();
      render(
        <Timeline
          events={mockEvents}
          highlightInsertionPoints={true}
          selectedCard={mockSelectedCard}
          onInsertionPointClick={onInsertionPointClick}
        />
      );

      const insertionPoints = screen.getAllByTestId('insertion-point');
      insertionPoints[0].focus();

      fireEvent.keyDown(insertionPoints[0], { key: 'Enter' });
      expect(onInsertionPointClick).toHaveBeenCalledWith(0);
    });

    it('should handle Space key to select insertion point', () => {
      const onInsertionPointClick = vi.fn();
      render(
        <Timeline
          events={mockEvents}
          highlightInsertionPoints={true}
          selectedCard={mockSelectedCard}
          onInsertionPointClick={onInsertionPointClick}
        />
      );

      const insertionPoints = screen.getAllByTestId('insertion-point');
      insertionPoints[0].focus();

      fireEvent.keyDown(insertionPoints[0], { key: ' ' });
      expect(onInsertionPointClick).toHaveBeenCalledWith(0);
    });

    it('should wrap around when navigating past the last insertion point', () => {
      const onInsertionPointClick = vi.fn();
      render(
        <Timeline
          events={mockEvents}
          highlightInsertionPoints={true}
          selectedCard={mockSelectedCard}
          onInsertionPointClick={onInsertionPointClick}
        />
      );

      const insertionPoints = screen.getAllByTestId('insertion-point');
      const lastIndex = insertionPoints.length - 1;

      // Focus the last insertion point
      insertionPoints[lastIndex].focus();
      expect(insertionPoints[lastIndex]).toHaveFocus();

      // Test arrow right navigation (should wrap to first)
      fireEvent.keyDown(insertionPoints[lastIndex], { key: 'ArrowRight' });
      expect(insertionPoints[0]).toHaveFocus();
    });

    it('should wrap around when navigating before the first insertion point', () => {
      const onInsertionPointClick = vi.fn();
      render(
        <Timeline
          events={mockEvents}
          highlightInsertionPoints={true}
          selectedCard={mockSelectedCard}
          onInsertionPointClick={onInsertionPointClick}
        />
      );

      const insertionPoints = screen.getAllByTestId('insertion-point');
      const lastIndex = insertionPoints.length - 1;

      // Focus the first insertion point
      insertionPoints[0].focus();
      expect(insertionPoints[0]).toHaveFocus();

      // Test arrow left navigation (should wrap to last)
      fireEvent.keyDown(insertionPoints[0], { key: 'ArrowLeft' });
      expect(insertionPoints[lastIndex]).toHaveFocus();
    });
  });

  describe('ARIA Compliance', () => {
    it('should have proper ARIA labels for insertion points', () => {
      render(
        <Timeline
          events={mockEvents}
          highlightInsertionPoints={true}
          selectedCard={mockSelectedCard}
        />
      );

      const insertionPoints = screen.getAllByTestId('insertion-point');
      expect(insertionPoints[0]).toHaveAttribute(
        'aria-label',
        'Place "Berlin Wall Falls" at position 1'
      );
    });

    it('should have proper ARIA labels when no card is selected', () => {
      render(
        <Timeline
          events={mockEvents}
          highlightInsertionPoints={true}
          selectedCard={null}
        />
      );

      const insertionPoints = screen.getAllByTestId('insertion-point');
      expect(insertionPoints[0]).toHaveAttribute(
        'aria-label',
        'Insertion point at position 1'
      );
    });

    it('should have proper role attributes for insertion points', () => {
      render(
        <Timeline
          events={mockEvents}
          highlightInsertionPoints={true}
          selectedCard={mockSelectedCard}
        />
      );

      const insertionPoints = screen.getAllByTestId('insertion-point');
      insertionPoints.forEach(point => {
        expect(point).toHaveAttribute('role', 'button');
      });
    });

    it('should have proper tabIndex for insertion points', () => {
      render(
        <Timeline
          events={mockEvents}
          highlightInsertionPoints={true}
          selectedCard={mockSelectedCard}
        />
      );

      const insertionPoints = screen.getAllByTestId('insertion-point');
      insertionPoints.forEach(point => {
        expect(point).toHaveAttribute('tabIndex', '0');
      });
    });

    it('should have proper tabIndex when insertion points are not clickable', () => {
      render(
        <Timeline
          events={mockEvents}
          highlightInsertionPoints={true}
          selectedCard={null}
        />
      );

      const insertionPoints = screen.getAllByTestId('insertion-point');
      insertionPoints.forEach(point => {
        expect(point).toHaveAttribute('tabIndex', '-1');
      });
    });
  });

  describe('Scroll Controls Accessibility', () => {
    it('should have proper ARIA labels for scroll buttons', () => {
      render(<Timeline events={mockEvents} />);

      const leftButton = screen.getByLabelText('Scroll timeline to the left');
      const rightButton = screen.getByLabelText('Scroll timeline to the right');

      expect(leftButton).toBeInTheDocument();
      expect(rightButton).toBeInTheDocument();
    });

    it('should have proper ARIA descriptions for scroll buttons', () => {
      render(<Timeline events={mockEvents} />);

      const leftButton = screen.getByLabelText('Scroll timeline to the left');
      const rightButton = screen.getByLabelText('Scroll timeline to the right');

      expect(leftButton).toHaveAttribute(
        'aria-describedby',
        'scroll-left-description'
      );
      expect(rightButton).toHaveAttribute(
        'aria-describedby',
        'scroll-right-description'
      );
    });

    it('should have screen reader descriptions for scroll buttons', () => {
      render(<Timeline events={mockEvents} />);

      expect(
        screen.getByText('Navigate to previous timeline events')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Navigate to next timeline events')
      ).toBeInTheDocument();
    });
  });
});
