import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import CardCountSlider from './CardCountSlider.jsx';

describe('CardCountSlider', () => {
  const defaultProps = {
    value: 10,
    onChange: vi.fn(),
    min: 5,
    max: 20,
    step: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    test('renders and allows value changes', () => {
      render(<CardCountSlider {...defaultProps} />);

      const slider = screen.getByRole('slider');
      expect(slider).toBeInTheDocument();
      expect(slider).toHaveValue('10');
      expect(screen.getByText('10')).toBeInTheDocument();

      // Test value change
      fireEvent.change(slider, { target: { value: '15' } });
      expect(defaultProps.onChange).toHaveBeenCalledWith(15);
      expect(screen.getByText('15')).toBeInTheDocument();
    });

    test('handles disabled state', () => {
      render(<CardCountSlider {...defaultProps} disabled={true} />);

      const slider = screen.getByRole('slider');
      expect(slider).toBeDisabled();

      // Should not call onChange when disabled
      fireEvent.change(slider, { target: { value: '15' } });
      expect(defaultProps.onChange).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    test('supports keyboard navigation', () => {
      render(<CardCountSlider {...defaultProps} />);

      const slider = screen.getByRole('slider');
      slider.focus();

      // Test arrow keys
      fireEvent.keyDown(slider, { key: 'ArrowRight' });
      expect(defaultProps.onChange).toHaveBeenCalledWith(11);

      vi.clearAllMocks();
      fireEvent.keyDown(slider, { key: 'ArrowLeft' });
      expect(defaultProps.onChange).toHaveBeenCalledWith(10);
    });

    test('respects min/max boundaries', () => {
      render(<CardCountSlider {...defaultProps} value={5} />);

      const slider = screen.getByRole('slider');
      slider.focus();

      // Try to go below min
      fireEvent.keyDown(slider, { key: 'ArrowLeft' });
      expect(defaultProps.onChange).toHaveBeenCalledWith(5); // Should stay at min
    });
  });

  describe('Edge Cases', () => {
    test('handles edge cases gracefully', () => {
      // Test invalid value
      render(<CardCountSlider {...defaultProps} value={25} />);
      const slider = screen.getByRole('slider');
      expect(slider).toHaveValue('20'); // Should clamp to max

      // Test missing onChange
      const { onChange, ...propsWithoutOnChange } = defaultProps;
      expect(() => {
        render(<CardCountSlider {...propsWithoutOnChange} />);
      }).not.toThrow();
    });
  });
});
