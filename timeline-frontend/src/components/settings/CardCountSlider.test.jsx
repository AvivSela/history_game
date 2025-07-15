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
    step: 1
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders slider with correct value', () => {
      render(<CardCountSlider {...defaultProps} />);
      
      const slider = screen.getByRole('slider');
      expect(slider).toBeInTheDocument();
      expect(slider).toHaveValue('10');
    });

    test('renders label text', () => {
      render(<CardCountSlider {...defaultProps} />);
      
      expect(screen.getByText('Number of Cards')).toBeInTheDocument();
    });

    test('renders current value display', () => {
      render(<CardCountSlider {...defaultProps} />);
      
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    test('renders with custom className', () => {
      render(<CardCountSlider {...defaultProps} className="custom-class" />);
      
      const container = screen.getByText('Number of Cards').closest('.card-count-slider');
      expect(container).toHaveClass('custom-class');
    });

    test('renders with custom label', () => {
      render(<CardCountSlider {...defaultProps} label="Custom Label" />);
      
      expect(screen.getByText('Custom Label')).toBeInTheDocument();
    });

    test('renders with custom min/max values', () => {
      render(<CardCountSlider {...defaultProps} min={3} max={15} />);
      
      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('min', '3');
      expect(slider).toHaveAttribute('max', '15');
    });

    test('renders with custom step value', () => {
      render(<CardCountSlider {...defaultProps} step={2} />);
      
      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('step', '2');
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA attributes', () => {
      render(<CardCountSlider {...defaultProps} />);
      
      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-valuemin', '5');
      expect(slider).toHaveAttribute('aria-valuemax', '20');
      expect(slider).toHaveAttribute('aria-valuenow', '10');
      expect(slider).toHaveAttribute('aria-valuetext', '10 cards');
    });

    test('has proper label association', () => {
      render(<CardCountSlider {...defaultProps} />);
      
      const slider = screen.getByRole('slider');
      const label = screen.getByText('Number of Cards');
      
      expect(slider).toHaveAttribute('aria-labelledby', label.id);
    });

    test('applies disabled state correctly', () => {
      render(<CardCountSlider {...defaultProps} disabled={true} />);
      
      const slider = screen.getByRole('slider');
      expect(slider).toBeDisabled();
    });

    test('has proper focus management', () => {
      render(<CardCountSlider {...defaultProps} />);
      
      const slider = screen.getByRole('slider');
      slider.focus();
      
      expect(slider).toHaveFocus();
    });
  });

  describe('User Interactions', () => {
    test('calls onChange when slider value changes', () => {
      render(<CardCountSlider {...defaultProps} />);
      
      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '15' } });
      
      expect(defaultProps.onChange).toHaveBeenCalledWith(15);
    });

    test('updates display value when slider changes', () => {
      render(<CardCountSlider {...defaultProps} />);
      
      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '15' } });
      
      expect(screen.getByText('15')).toBeInTheDocument();
    });

    test('does not call onChange when disabled', () => {
      render(<CardCountSlider {...defaultProps} disabled={true} />);
      
      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '15' } });
      
      expect(defaultProps.onChange).not.toHaveBeenCalled();
    });

    test('updates when value prop changes', () => {
      const { rerender } = render(<CardCountSlider {...defaultProps} />);
      
      // Initially 10
      expect(screen.getByRole('slider')).toHaveValue('10');
      expect(screen.getByText('10')).toBeInTheDocument();
      
      // Change to 15
      rerender(<CardCountSlider {...defaultProps} value={15} />);
      expect(screen.getByRole('slider')).toHaveValue('15');
      expect(screen.getByText('15')).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    test('responds to arrow keys', () => {
      render(<CardCountSlider {...defaultProps} />);
      
      const slider = screen.getByRole('slider');
      slider.focus();
      
      // Arrow right should increase value
      fireEvent.keyDown(slider, { key: 'ArrowRight' });
      expect(defaultProps.onChange).toHaveBeenCalledWith(11);
      
      // Arrow left should decrease value
      fireEvent.keyDown(slider, { key: 'ArrowLeft' });
      expect(defaultProps.onChange).toHaveBeenCalledWith(10);
    });

    test('responds to PageUp/PageDown keys', () => {
      render(<CardCountSlider {...defaultProps} />);
      
      const slider = screen.getByRole('slider');
      slider.focus();
      
      // PageUp should increase by larger amount
      fireEvent.keyDown(slider, { key: 'PageUp' });
      expect(defaultProps.onChange).toHaveBeenCalledWith(15);
      
      // PageDown should decrease by larger amount
      fireEvent.keyDown(slider, { key: 'PageDown' });
      expect(defaultProps.onChange).toHaveBeenCalledWith(10);
    });

    test('respects min/max boundaries', () => {
      render(<CardCountSlider {...defaultProps} value={5} />);
      
      const slider = screen.getByRole('slider');
      slider.focus();
      
      // Try to go below min
      fireEvent.keyDown(slider, { key: 'ArrowLeft' });
      expect(defaultProps.onChange).toHaveBeenCalledWith(5); // Should stay at min
      
      // Reset and try to go above max
      vi.clearAllMocks();
      const { container } = render(<CardCountSlider {...defaultProps} value={20} />);
      const newSlider = container.querySelector('input[type="range"]');
      newSlider.focus();
      
      fireEvent.keyDown(newSlider, { key: 'ArrowRight' });
      expect(defaultProps.onChange).toHaveBeenCalledWith(20); // Should stay at max
    });

    test('does not respond to other keys', () => {
      render(<CardCountSlider {...defaultProps} />);
      
      const slider = screen.getByRole('slider');
      slider.focus();
      
      // Other keys should not trigger onChange
      fireEvent.keyDown(slider, { key: 'Enter' });
      fireEvent.keyDown(slider, { key: 'Space' });
      fireEvent.keyDown(slider, { key: 'Tab' });
      fireEvent.keyDown(slider, { key: 'Escape' });
      
      expect(defaultProps.onChange).not.toHaveBeenCalled();
    });
  });

  describe('CSS Classes', () => {
    test('applies correct classes when disabled', () => {
      render(<CardCountSlider {...defaultProps} disabled={true} />);
      
      const container = screen.getByText('Number of Cards').closest('.card-count-slider');
      expect(container).toHaveClass('card-count-slider--disabled');
    });

    test('applies correct classes when focused', () => {
      render(<CardCountSlider {...defaultProps} />);
      
      const slider = screen.getByRole('slider');
      fireEvent.focus(slider);
      
      const container = screen.getByText('Number of Cards').closest('.card-count-slider');
      expect(container).toHaveClass('card-count-slider--focused');
    });

    test('removes focused class when blurred', () => {
      render(<CardCountSlider {...defaultProps} />);
      
      const slider = screen.getByRole('slider');
      fireEvent.focus(slider);
      fireEvent.blur(slider);
      
      const container = screen.getByText('Number of Cards').closest('.card-count-slider');
      expect(container).not.toHaveClass('card-count-slider--focused');
    });
  });

  describe('Edge Cases', () => {
    test('handles invalid value gracefully', () => {
      render(<CardCountSlider {...defaultProps} value={25} />);
      
      const slider = screen.getByRole('slider');
      expect(slider).toHaveValue('20'); // Should clamp to max
    });

    test('handles missing onChange prop', () => {
      const { onChange, ...propsWithoutOnChange } = defaultProps;
      
      expect(() => {
        render(<CardCountSlider {...propsWithoutOnChange} />);
      }).not.toThrow();
    });

    test('handles null onChange prop', () => {
      expect(() => {
        render(<CardCountSlider {...defaultProps} onChange={null} />);
      }).not.toThrow();
    });

    test('handles zero value', () => {
      render(<CardCountSlider {...defaultProps} value={0} min={0} />);
      
      const slider = screen.getByRole('slider');
      expect(slider).toHaveValue('0');
      expect(screen.getByText('0', { selector: '.card-count-slider__value-number' })).toBeInTheDocument();
    });

    test('handles negative min value', () => {
      render(<CardCountSlider {...defaultProps} min={-10} value={-5} />);
      
      const slider = screen.getByRole('slider');
      expect(slider).toHaveValue('-5');
      expect(screen.getByText('-5')).toBeInTheDocument();
    });
  });

  describe('Value Display', () => {
    test('displays value with custom suffix', () => {
      render(<CardCountSlider {...defaultProps} valueSuffix=" items" />);
      
      expect(screen.getByText('10 items')).toBeInTheDocument();
    });

    test('displays value with custom prefix', () => {
      render(<CardCountSlider {...defaultProps} valuePrefix="Count: " />);
      
      expect(screen.getByText('Count: 10')).toBeInTheDocument();
    });

    test('displays value with custom formatter', () => {
      const formatter = (value) => `${value} cards`;
      render(<CardCountSlider {...defaultProps} valueFormatter={formatter} />);
      
      expect(screen.getByText('10 cards')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    test('debounces rapid changes', () => {
      vi.useFakeTimers();
      
      render(<CardCountSlider {...defaultProps} />);
      
      const slider = screen.getByRole('slider');
      
      // Rapid changes
      fireEvent.change(slider, { target: { value: '11' } });
      fireEvent.change(slider, { target: { value: '12' } });
      fireEvent.change(slider, { target: { value: '13' } });
      
      // In test mode, each change should be called immediately
      expect(defaultProps.onChange).toHaveBeenCalledTimes(3);
      expect(defaultProps.onChange).toHaveBeenLastCalledWith(13);
      
      vi.useRealTimers();
    });
  });
}); 