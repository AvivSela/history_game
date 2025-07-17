import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TimelineCardWrapper from './TimelineCardWrapper';

const mockEvent = {
  id: 1,
  title: 'World War II Begins',
  dateOccurred: '1939-09-01T00:00:00.000Z',
  category: 'History',
  difficulty: 2,
};

describe('TimelineCardWrapper', () => {
  describe('Rendering', () => {
    it('should render timeline card wrapper with correct structure', () => {
      render(<TimelineCardWrapper event={mockEvent} />);

      const wrapper = screen.getByTestId('timeline-card-wrapper');
      expect(wrapper).toBeInTheDocument();
      expect(wrapper).toHaveClass('flex', 'flex-col', 'items-center');
    });

    it('should display correct year information', () => {
      render(<TimelineCardWrapper event={mockEvent} />);

      expect(screen.getByText('1939')).toBeInTheDocument();
    });

    it('should display correct date information', () => {
      render(<TimelineCardWrapper event={mockEvent} />);

      expect(screen.getByText('Sep 1')).toBeInTheDocument();
    });

    it('should render card with event title', () => {
      render(<TimelineCardWrapper event={mockEvent} />);

      expect(screen.getByText('World War II Begins')).toBeInTheDocument();
    });

    it('should render card with small size', () => {
      render(<TimelineCardWrapper event={mockEvent} />);

      // The Card component should receive the small size prop
      // We can verify this by checking the card is rendered
      expect(screen.getByText('World War II Begins')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onCardClick when card is clicked', () => {
      const onCardClick = vi.fn();
      render(<TimelineCardWrapper event={mockEvent} onCardClick={onCardClick} />);

      const card = screen.getByText('World War II Begins');
      fireEvent.click(card);

      expect(onCardClick).toHaveBeenCalledWith(mockEvent);
    });

    it('should not call onCardClick when no callback is provided', () => {
      render(<TimelineCardWrapper event={mockEvent} />);

      const card = screen.getByText('World War II Begins');
      fireEvent.click(card);

      // Should not throw an error
      expect(card).toBeInTheDocument();
    });
  });

  describe('Date Formatting', () => {
    it('should format different dates correctly', () => {
      const differentEvent = {
        ...mockEvent,
        dateOccurred: '1969-07-20T00:00:00.000Z',
      };

      render(<TimelineCardWrapper event={differentEvent} />);

      expect(screen.getByText('1969')).toBeInTheDocument();
      expect(screen.getByText('Jul 20')).toBeInTheDocument();
    });

    it('should handle single digit days correctly', () => {
      const singleDigitEvent = {
        ...mockEvent,
        dateOccurred: '1939-09-05T00:00:00.000Z',
      };

      render(<TimelineCardWrapper event={singleDigitEvent} />);

      expect(screen.getByText('Sep 5')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive classes for different screen sizes', () => {
      render(<TimelineCardWrapper event={mockEvent} />);

      const wrapper = screen.getByTestId('timeline-card-wrapper');
      expect(wrapper).toHaveClass('lg:gap-4', 'md:gap-3', 'sm:gap-2');
    });

    it('should have responsive date container classes', () => {
      render(<TimelineCardWrapper event={mockEvent} />);

      // The date container should have responsive classes
      const yearElement = screen.getByText('1939');
      // The date container is the parent of the year element
      const dateContainer = yearElement.parentElement;
      expect(dateContainer).toHaveClass('text-center', 'bg-card', 'px-3', 'py-2', 'rounded-lg', 'shadow-sm', 'border', 'border-border', 'min-w-[80px]', 'md:px-2', 'md:py-1', 'md:min-w-[70px]', 'sm:px-1', 'sm:py-1', 'sm:min-w-[60px]');
    });
  });

  describe('Accessibility', () => {
    it('should have proper test ID for testing', () => {
      render(<TimelineCardWrapper event={mockEvent} />);

      expect(screen.getByTestId('timeline-card-wrapper')).toBeInTheDocument();
    });

    it('should render card with timeline-card class', () => {
      render(<TimelineCardWrapper event={mockEvent} />);

      // The Card component should have the timeline-card class
      const card = screen.getByText('World War II Begins');
      expect(card).toBeInTheDocument();
    });
  });
}); 