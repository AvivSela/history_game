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
    it('renders events and allows interactions', () => {
      const onCardClick = vi.fn();
      const onInsertionPointClick = vi.fn();
      
      render(
        <Timeline
          events={mockEvents}
          highlightInsertionPoints={true}
          selectedCard={mockSelectedCard}
          onCardClick={onCardClick}
          onInsertionPointClick={onInsertionPointClick}
        />
      );

      // Verify events are displayed
      expect(screen.getByText('World War II Begins')).toBeInTheDocument();
      expect(screen.getByText('Moon Landing')).toBeInTheDocument();
      expect(screen.getByText('Internet Created')).toBeInTheDocument();

      // Test card click
      const firstCard = screen.getByText('World War II Begins');
      fireEvent.click(firstCard);
      expect(onCardClick).toHaveBeenCalledWith(mockEvents[0]);

      // Test insertion point click
      const insertionPoints = screen.getAllByTestId('insertion-point');
      expect(insertionPoints.length).toBeGreaterThan(0);
      
      fireEvent.click(insertionPoints[0]);
      expect(onInsertionPointClick).toHaveBeenCalledWith(0);
    });

    it('handles empty timeline', () => {
      render(<Timeline events={[]} />);

      expect(screen.getByText('Timeline is empty')).toBeInTheDocument();
      expect(
        screen.getByText('Cards will appear here as you place them correctly')
      ).toBeInTheDocument();
    });
  });

  describe('Insertion Points', () => {
    it('shows insertion points when highlighting is enabled', () => {
      render(
        <Timeline
          events={mockEvents}
          highlightInsertionPoints={true}
          selectedCard={mockSelectedCard}
        />
      );

      const insertionPoints = screen.getAllByTestId('insertion-point');
      expect(insertionPoints.length).toBeGreaterThan(0);

      // Test tooltip on hover
      fireEvent.mouseEnter(insertionPoints[0]);
      expect(
        screen.getByText('Place "Berlin Wall Falls" here')
      ).toBeInTheDocument();
    });

    it('hides insertion points when highlighting is disabled', () => {
      render(
        <Timeline
          events={mockEvents}
          highlightInsertionPoints={false}
          selectedCard={mockSelectedCard}
        />
      );

      const insertionPoints = screen.queryAllByTestId('insertion-point');
      expect(insertionPoints).toHaveLength(0);
    });
  });

  describe('Scroll Controls', () => {
    it('shows scroll controls when needed', () => {
      render(<Timeline events={mockEvents} />);

      expect(screen.getByTestId('timeline-scroll')).toBeInTheDocument();
    });

    it('hides scroll controls when not needed', () => {
      const fewEvents = mockEvents.slice(0, 2);
      render(<Timeline events={fewEvents} />);

      expect(screen.queryByTestId('timeline-scroll')).not.toBeInTheDocument();
    });
  });
});
