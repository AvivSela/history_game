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

  describe('Rendering', () => {
    it('should render insertion point with correct attributes', () => {
      render(<InsertionPoint {...defaultProps} />);

      const insertionPoint = screen.getByTestId('insertion-point');
      expect(insertionPoint).toBeInTheDocument();
      expect(insertionPoint).toHaveAttribute('data-drop-zone', 'timeline-0');
      expect(insertionPoint).toHaveAttribute('role', 'button');
      expect(insertionPoint).toHaveAttribute('tabIndex', '0');
    });

    it('should render with correct aria-label when card is selected', () => {
      render(<InsertionPoint {...defaultProps} />);

      const insertionPoint = screen.getByTestId('insertion-point');
      expect(insertionPoint).toHaveAttribute(
        'aria-label',
        'Place "Berlin Wall Falls" at position 1'
      );
    });

    it('should render with correct aria-label when no card is selected', () => {
      render(<InsertionPoint {...defaultProps} selectedCard={null} />);

      const insertionPoint = screen.getByTestId('insertion-point');
      expect(insertionPoint).toHaveAttribute(
        'aria-label',
        'Insertion point at position 1'
      );
    });

    it('should render plus icon when not hovered', () => {
      render(<InsertionPoint {...defaultProps} />);

      expect(screen.getByText('+')).toBeInTheDocument();
    });

    it('should render location icon when hovered with selected card', () => {
      render(<InsertionPoint {...defaultProps} isHovered={true} />);

      expect(screen.getByText('📍')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onClick when clicked', () => {
      const onClick = vi.fn();
      render(<InsertionPoint {...defaultProps} onClick={onClick} />);

      const insertionPoint = screen.getByTestId('insertion-point');
      fireEvent.click(insertionPoint);

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should call onMouseEnter when mouse enters', () => {
      const onMouseEnter = vi.fn();
      render(<InsertionPoint {...defaultProps} onMouseEnter={onMouseEnter} />);

      const insertionPoint = screen.getByTestId('insertion-point');
      fireEvent.mouseEnter(insertionPoint);

      expect(onMouseEnter).toHaveBeenCalledTimes(1);
    });

    it('should call onMouseLeave when mouse leaves', () => {
      const onMouseLeave = vi.fn();
      render(<InsertionPoint {...defaultProps} onMouseLeave={onMouseLeave} />);

      const insertionPoint = screen.getByTestId('insertion-point');
      fireEvent.mouseLeave(insertionPoint);

      expect(onMouseLeave).toHaveBeenCalledTimes(1);
    });

    it('should call onRef with element reference', () => {
      const onRef = vi.fn();
      render(<InsertionPoint {...defaultProps} onRef={onRef} />);

      expect(onRef).toHaveBeenCalled();
    });
  });

  describe('Visual States', () => {
    it('should apply hovered styles when isHovered is true', () => {
      render(<InsertionPoint {...defaultProps} isHovered={true} />);

      const insertionPoint = screen.getByTestId('insertion-point');
      expect(insertionPoint).toHaveClass(
        'opacity-100',
        'scale-110',
        'bg-blue-500/5',
        'rounded-lg'
      );
    });

    it('should apply non-hovered styles when isHovered is false', () => {
      render(<InsertionPoint {...defaultProps} isHovered={false} />);

      const insertionPoint = screen.getByTestId('insertion-point');
      expect(insertionPoint).toHaveClass('opacity-60');
      expect(insertionPoint).not.toHaveClass('opacity-100', 'scale-110');
    });

    it('should apply disabled styles when not clickable', () => {
      render(<InsertionPoint {...defaultProps} isClickable={false} />);

      const insertionPoint = screen.getByTestId('insertion-point');
      expect(insertionPoint).toHaveClass('opacity-30');
      expect(insertionPoint).toHaveAttribute('tabIndex', '-1');
    });

    it('should show tooltip when hovered with selected card', () => {
      render(<InsertionPoint {...defaultProps} isHovered={true} />);

      expect(
        screen.getByText('Place "Berlin Wall Falls" here')
      ).toBeInTheDocument();
    });

    it('should not show tooltip when not hovered', () => {
      render(<InsertionPoint {...defaultProps} isHovered={false} />);

      expect(
        screen.queryByText('Place "Berlin Wall Falls" here')
      ).not.toBeInTheDocument();
    });

    it('should not show tooltip when no card is selected', () => {
      render(
        <InsertionPoint
          {...defaultProps}
          isHovered={true}
          selectedCard={null}
        />
      );

      expect(
        screen.queryByText('Place "Berlin Wall Falls" here')
      ).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard navigable when clickable', () => {
      render(<InsertionPoint {...defaultProps} isClickable={true} />);

      const insertionPoint = screen.getByTestId('insertion-point');
      expect(insertionPoint).toHaveAttribute('tabIndex', '0');
    });

    it('should not be keyboard navigable when not clickable', () => {
      render(<InsertionPoint {...defaultProps} isClickable={false} />);

      const insertionPoint = screen.getByTestId('insertion-point');
      expect(insertionPoint).toHaveAttribute('tabIndex', '-1');
    });

    it('should have proper role attribute', () => {
      render(<InsertionPoint {...defaultProps} />);

      const insertionPoint = screen.getByTestId('insertion-point');
      expect(insertionPoint).toHaveAttribute('role', 'button');
    });
  });
});
