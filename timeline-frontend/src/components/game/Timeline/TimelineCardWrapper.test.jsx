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
  describe('Basic Functionality', () => {
    it('renders event information and handles interactions', () => {
      const onCardClick = vi.fn();
      render(<TimelineCardWrapper event={mockEvent} onCardClick={onCardClick} />);

      // Verify event information is displayed
      expect(screen.getByText('World War II Begins')).toBeInTheDocument();
      expect(screen.getByText('1939')).toBeInTheDocument();
      expect(screen.getByText('Sep 1')).toBeInTheDocument();

      // Test card click
      const card = screen.getByText('World War II Begins');
      fireEvent.click(card);
      expect(onCardClick).toHaveBeenCalledWith(mockEvent);
    });

    it('handles different date formats', () => {
      const differentEvent = {
        ...mockEvent,
        dateOccurred: '1969-07-20T00:00:00.000Z',
      };

      render(<TimelineCardWrapper event={differentEvent} />);

      expect(screen.getByText('1969')).toBeInTheDocument();
      expect(screen.getByText('Jul 20')).toBeInTheDocument();
    });
  });
});
