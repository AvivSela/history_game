import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import DifficultyRangeSlider from './DifficultyRangeSlider.jsx';

// Mock useLayoutMode hook
vi.mock('./useLayoutMode', () => ({
  default: () => 'list'
}));

describe('DifficultyRangeSlider', () => {
  const defaultProps = {
    value: { min: 1, max: 4 },
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    test('renders with correct initial values', () => {
      render(<DifficultyRangeSlider {...defaultProps} />);

      expect(screen.getByText('Difficulty Range')).toBeInTheDocument();
      expect(screen.getByText('Level 1 - 4')).toBeInTheDocument();
      expect(screen.getByText('Cards from Easy to Expert difficulty')).toBeInTheDocument();
    });

    test('renders all difficulty levels with icons', () => {
      render(<DifficultyRangeSlider {...defaultProps} />);

      expect(screen.getByText('Easy')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toBeInTheDocument();
      expect(screen.getByText('Hard')).toBeInTheDocument();
      expect(screen.getByText('Expert')).toBeInTheDocument();

      // Check for emoji icons
      expect(screen.getByText('😊')).toBeInTheDocument();
      expect(screen.getByText('😐')).toBeInTheDocument();
      expect(screen.getByText('😰')).toBeInTheDocument();
      expect(screen.getByText('😱')).toBeInTheDocument();
    });

    test('renders preset buttons', () => {
      render(<DifficultyRangeSlider {...defaultProps} />);

      expect(screen.getByText('Easy Only')).toBeInTheDocument();
      expect(screen.getByText('Easy & Medium')).toBeInTheDocument();
      expect(screen.getByText('Medium & Up')).toBeInTheDocument();
      expect(screen.getByText('All Levels')).toBeInTheDocument();
    });
  });

  describe('Preset Button Functionality', () => {
    test('Easy Only preset sets range to 1-2', () => {
      render(<DifficultyRangeSlider {...defaultProps} />);

      const easyOnlyButton = screen.getByText('Easy Only');
      fireEvent.click(easyOnlyButton);

      expect(defaultProps.onChange).toHaveBeenCalledWith({ min: 1, max: 2 });
    });

    test('Easy & Medium preset sets range to 1-3', () => {
      render(<DifficultyRangeSlider {...defaultProps} />);

      const easyMediumButton = screen.getByText('Easy & Medium');
      fireEvent.click(easyMediumButton);

      expect(defaultProps.onChange).toHaveBeenCalledWith({ min: 1, max: 3 });
    });

    test('Medium & Up preset sets range to 2-4', () => {
      render(<DifficultyRangeSlider {...defaultProps} />);

      const mediumUpButton = screen.getByText('Medium & Up');
      fireEvent.click(mediumUpButton);

      expect(defaultProps.onChange).toHaveBeenCalledWith({ min: 2, max: 4 });
    });

    test('All Levels preset sets range to 1-4', () => {
      render(<DifficultyRangeSlider {...defaultProps} />);

      const allLevelsButton = screen.getByText('All Levels');
      fireEvent.click(allLevelsButton);

      expect(defaultProps.onChange).toHaveBeenCalledWith({ min: 1, max: 4 });
    });
  });

  describe('Single Difficulty Level', () => {
    test('displays correct text for single difficulty', () => {
      render(<DifficultyRangeSlider value={{ min: 2, max: 2 }} onChange={defaultProps.onChange} />);

      expect(screen.getByText('Medium (Level 2)')).toBeInTheDocument();
      expect(screen.getByText('Balanced challenge with moderate time pressure')).toBeInTheDocument();
    });
  });

  describe('Adjacent Difficulty Levels', () => {
    test('displays correct text for adjacent difficulties', () => {
      render(<DifficultyRangeSlider value={{ min: 1, max: 2 }} onChange={defaultProps.onChange} />);

      expect(screen.getByText('Level 1 - 2')).toBeInTheDocument();
      expect(screen.getByText('Easy and Medium cards')).toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    test('disables all interactive elements when disabled', () => {
      render(<DifficultyRangeSlider {...defaultProps} disabled={true} />);

      const presetButtons = screen.getAllByRole('button');
      presetButtons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });

    test('does not call onChange when disabled', () => {
      render(<DifficultyRangeSlider {...defaultProps} disabled={true} />);

      const easyOnlyButton = screen.getByText('Easy Only');
      fireEvent.click(easyOnlyButton);

      expect(defaultProps.onChange).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels for slider handles', () => {
      render(<DifficultyRangeSlider {...defaultProps} />);

      const minHandle = screen.getByLabelText('Minimum difficulty');
      const maxHandle = screen.getByLabelText('Maximum difficulty');

      expect(minHandle).toBeInTheDocument();
      expect(maxHandle).toBeInTheDocument();
      expect(minHandle).toHaveAttribute('aria-valuenow', '1');
      expect(maxHandle).toHaveAttribute('aria-valuenow', '4');
    });

    test('has proper ARIA attributes for slider handles', () => {
      render(<DifficultyRangeSlider {...defaultProps} />);

      const minHandle = screen.getByLabelText('Minimum difficulty');
      const maxHandle = screen.getByLabelText('Maximum difficulty');

      expect(minHandle).toHaveAttribute('aria-valuemin', '1');
      expect(minHandle).toHaveAttribute('aria-valuemax', '4');
      expect(maxHandle).toHaveAttribute('aria-valuemin', '1');
      expect(maxHandle).toHaveAttribute('aria-valuemax', '4');
    });

    test('handles are focusable when not disabled', () => {
      render(<DifficultyRangeSlider {...defaultProps} />);

      const minHandle = screen.getByLabelText('Minimum difficulty');
      const maxHandle = screen.getByLabelText('Maximum difficulty');

      expect(minHandle).toHaveAttribute('tabIndex', '0');
      expect(maxHandle).toHaveAttribute('tabIndex', '0');
    });

    test('handles are not focusable when disabled', () => {
      render(<DifficultyRangeSlider {...defaultProps} disabled={true} />);

      const minHandle = screen.getByLabelText('Minimum difficulty');
      const maxHandle = screen.getByLabelText('Maximum difficulty');

      expect(minHandle).toHaveAttribute('tabIndex', '-1');
      expect(maxHandle).toHaveAttribute('tabIndex', '-1');
    });
  });

  describe('Edge Cases', () => {
    test('handles empty value gracefully', () => {
      render(<DifficultyRangeSlider value={{}} onChange={defaultProps.onChange} />);

      // Should fall back to default values
      expect(screen.getByText('Level 1 - 4')).toBeInTheDocument();
    });

    test('handles null value gracefully', () => {
      render(<DifficultyRangeSlider value={null} onChange={defaultProps.onChange} />);

      // Should fall back to default values
      expect(screen.getByText('Level 1 - 4')).toBeInTheDocument();
    });

    test('handles undefined value gracefully', () => {
      render(<DifficultyRangeSlider value={undefined} onChange={defaultProps.onChange} />);

      // Should fall back to default values
      expect(screen.getByText('Level 1 - 4')).toBeInTheDocument();
    });
  });

  describe('CSS Classes', () => {
    test('applies correct CSS classes', () => {
      const { container } = render(<DifficultyRangeSlider {...defaultProps} />);

      expect(container.firstChild).toHaveClass('difficulty-range-slider');
    });

    test('applies disabled class when disabled', () => {
      const { container } = render(<DifficultyRangeSlider {...defaultProps} disabled={true} />);

      expect(container.firstChild).toHaveClass('difficulty-range-slider--disabled');
    });

    test('applies custom className', () => {
      const { container } = render(
        <DifficultyRangeSlider {...defaultProps} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('difficulty-range-slider');
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
}); 