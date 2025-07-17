import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ScrollControls from './ScrollControls';

describe('ScrollControls', () => {
  const defaultProps = {
    onScrollLeft: vi.fn(),
    onScrollRight: vi.fn(),
  };

  describe('Basic Functionality', () => {
    it('renders and handles scroll interactions', () => {
      render(<ScrollControls {...defaultProps} />);

      const leftButton = screen.getByTitle('Scroll left');
      const rightButton = screen.getByTitle('Scroll right');

      expect(leftButton).toBeInTheDocument();
      expect(rightButton).toBeInTheDocument();

      // Test scroll interactions
      fireEvent.click(leftButton);
      expect(defaultProps.onScrollLeft).toHaveBeenCalledTimes(1);

      fireEvent.click(rightButton);
      expect(defaultProps.onScrollRight).toHaveBeenCalledTimes(1);
    });
  });
});
