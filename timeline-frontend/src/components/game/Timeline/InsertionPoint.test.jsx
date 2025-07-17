import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import InsertionPoint from './InsertionPoint';

const mockSelectedCard = {
  title: 'Berlin Wall Falls',
};

describe('InsertionPoint', () => {
  const defaultProps = {
    index: 0,
    isHovered: false,
    isClickable: true,
    selectedCard: mockSelectedCard,
    onClick: vi.fn(),
    onMouseEnter: vi.fn(),
    onMouseLeave: vi.fn(),
    onRef: vi.fn(),
  };

  describe('Basic Functionality', () => {
    it('renders and handles interactions', () => {
      render(<InsertionPoint {...defaultProps} />);

      const insertionPoint = screen.getByTestId('insertion-point');
      expect(insertionPoint).toBeInTheDocument();

      // Test click
      fireEvent.click(insertionPoint);
      expect(defaultProps.onClick).toHaveBeenCalledTimes(1);

      // Test mouse events
      fireEvent.mouseEnter(insertionPoint);
      expect(defaultProps.onMouseEnter).toHaveBeenCalledTimes(1);

      fireEvent.mouseLeave(insertionPoint);
      expect(defaultProps.onMouseLeave).toHaveBeenCalledTimes(1);
    });

    it('handles disabled state', () => {
      render(<InsertionPoint {...defaultProps} isClickable={false} />);

      const insertionPoint = screen.getByTestId('insertion-point');
      expect(insertionPoint).toHaveAttribute('tabIndex', '-1');
    });
  });

  describe('Visual States', () => {
    it('shows tooltip when hovered with selected card', () => {
      render(<InsertionPoint {...defaultProps} isHovered={true} />);

      expect(
        screen.getByText('Place "Berlin Wall Falls" here')
      ).toBeInTheDocument();
    });

    it('hides tooltip when not hovered', () => {
      render(<InsertionPoint {...defaultProps} isHovered={false} />);

      expect(
        screen.queryByText('Place "Berlin Wall Falls" here')
      ).not.toBeInTheDocument();
    });
  });
});
