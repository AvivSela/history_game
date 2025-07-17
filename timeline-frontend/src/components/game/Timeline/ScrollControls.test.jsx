import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ScrollControls from './ScrollControls';

describe('ScrollControls', () => {
  const defaultProps = {
    onScrollLeft: vi.fn(),
    onScrollRight: vi.fn(),
  };

  describe('Rendering', () => {
    it('should render scroll controls container', () => {
      render(<ScrollControls {...defaultProps} />);

      const container = screen.getByTestId('timeline-scroll');
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass(
        'absolute',
        'top-1/2',
        'transform',
        '-translate-y-1/2'
      );
    });

    it('should render left scroll button', () => {
      render(<ScrollControls {...defaultProps} />);

      const leftButton = screen.getByTitle('Scroll left');
      expect(leftButton).toBeInTheDocument();
      expect(leftButton).toHaveTextContent('‹');
    });

    it('should render right scroll button', () => {
      render(<ScrollControls {...defaultProps} />);

      const rightButton = screen.getByTitle('Scroll right');
      expect(rightButton).toBeInTheDocument();
      expect(rightButton).toHaveTextContent('›');
    });
  });

  describe('Interactions', () => {
    it('should call onScrollLeft when left button is clicked', () => {
      const onScrollLeft = vi.fn();
      render(<ScrollControls {...defaultProps} onScrollLeft={onScrollLeft} />);

      const leftButton = screen.getByTitle('Scroll left');
      fireEvent.click(leftButton);

      expect(onScrollLeft).toHaveBeenCalledTimes(1);
    });

    it('should call onScrollRight when right button is clicked', () => {
      const onScrollRight = vi.fn();
      render(
        <ScrollControls {...defaultProps} onScrollRight={onScrollRight} />
      );

      const rightButton = screen.getByTitle('Scroll right');
      fireEvent.click(rightButton);

      expect(onScrollRight).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-labels for buttons', () => {
      render(<ScrollControls {...defaultProps} />);

      const leftButton = screen.getByLabelText('Scroll timeline to the left');
      const rightButton = screen.getByLabelText('Scroll timeline to the right');

      expect(leftButton).toBeInTheDocument();
      expect(rightButton).toBeInTheDocument();
    });

    it('should have proper title attributes for buttons', () => {
      render(<ScrollControls {...defaultProps} />);

      const leftButton = screen.getByTitle('Scroll left');
      const rightButton = screen.getByTitle('Scroll right');

      expect(leftButton).toBeInTheDocument();
      expect(rightButton).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have responsive positioning classes', () => {
      render(<ScrollControls {...defaultProps} />);

      const container = screen.getByTestId('timeline-scroll');
      expect(container).toHaveClass(
        'left-2',
        'right-2',
        'lg:left-4',
        'lg:right-4'
      );
    });

    it('should have proper button styling classes', () => {
      render(<ScrollControls {...defaultProps} />);

      const leftButton = screen.getByTitle('Scroll left');
      expect(leftButton).toHaveClass(
        'w-10',
        'h-10',
        'lg:w-12',
        'lg:h-12',
        'bg-white/80',
        'hover:bg-white',
        'text-primary',
        'text-xl',
        'lg:text-2xl',
        'font-bold',
        'rounded-full',
        'shadow-lg',
        'border',
        'border-gray-200',
        'flex',
        'items-center',
        'justify-center',
        'transition-all',
        'duration-200',
        'hover:scale-110',
        'pointer-events-auto'
      );
    });

    it('should have pointer-events-none on container and pointer-events-auto on buttons', () => {
      render(<ScrollControls {...defaultProps} />);

      const container = screen.getByTestId('timeline-scroll');
      const leftButton = screen.getByTitle('Scroll left');

      expect(container).toHaveClass('pointer-events-none');
      expect(leftButton).toHaveClass('pointer-events-auto');
    });
  });

  describe('Button Content', () => {
    it('should display left arrow character', () => {
      render(<ScrollControls {...defaultProps} />);

      const leftButton = screen.getByTitle('Scroll left');
      expect(leftButton).toHaveTextContent('‹');
    });

    it('should display right arrow character', () => {
      render(<ScrollControls {...defaultProps} />);

      const rightButton = screen.getByTitle('Scroll right');
      expect(rightButton).toHaveTextContent('›');
    });
  });
});
