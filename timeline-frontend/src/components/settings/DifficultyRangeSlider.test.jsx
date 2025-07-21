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

    test('renders stars for each difficulty level', () => {
      render(<DifficultyRangeSlider {...defaultProps} />);

      // Check that stars are rendered (★ character)
      const stars = screen.getAllByText('★');
      expect(stars.length).toBeGreaterThan(0);
    });

    test('renders preset buttons', () => {
      render(<DifficultyRangeSlider {...defaultProps} />);

      expect(screen.getByText('Easy Only')).toBeInTheDocument();
      expect(screen.getByText('Easy & Medium')).toBeInTheDocument();
      expect(screen.getByText('Medium & Up')).toBeInTheDocument();
      expect(screen.getByText('All Levels')).toBeInTheDocument();
    });
  });

  describe('Checkbox Functionality', () => {
    test('all difficulty checkboxes are checked by default when range is 1-4', () => {
      render(<DifficultyRangeSlider {...defaultProps} />);

      const easyCheckbox = screen.getByLabelText('Select Easy difficulty');
      const mediumCheckbox = screen.getByLabelText('Select Medium difficulty');
      const hardCheckbox = screen.getByLabelText('Select Hard difficulty');
      const expertCheckbox = screen.getByLabelText('Select Expert difficulty');

      expect(easyCheckbox).toBeChecked();
      expect(mediumCheckbox).toBeChecked();
      expect(hardCheckbox).toBeChecked();
      expect(expertCheckbox).toBeChecked();
    });

    test('clicking a difficulty checkbox toggles its selection', () => {
      render(<DifficultyRangeSlider {...defaultProps} />);

      const mediumCheckbox = screen.getByLabelText('Select Medium difficulty');
      fireEvent.click(mediumCheckbox);

      // When clicking medium (value 2) from range 1-4, it should create two ranges:
      // range1: 1-1 (size 1) and range2: 3-4 (size 2)
      // The component chooses the larger range, so it should be 3-4
      expect(defaultProps.onChange).toHaveBeenCalledWith({ min: 3, max: 4 });
    });

    test('clicking a difficulty checkbox adds it to the range', () => {
      render(<DifficultyRangeSlider value={{ min: 1, max: 1 }} onChange={defaultProps.onChange} />);

      const expertCheckbox = screen.getByLabelText('Select Expert difficulty');
      fireEvent.click(expertCheckbox);

      expect(defaultProps.onChange).toHaveBeenCalledWith({ min: 1, max: 4 });
    });

    test('cannot deselect the last remaining difficulty', () => {
      render(<DifficultyRangeSlider value={{ min: 2, max: 2 }} onChange={defaultProps.onChange} />);

      const mediumCheckbox = screen.getByLabelText('Select Medium difficulty');
      fireEvent.click(mediumCheckbox);

      // Should not call onChange since we can't deselect the last difficulty
      expect(defaultProps.onChange).not.toHaveBeenCalled();
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
      // Use a more specific selector to avoid duplicate text issues
      expect(screen.getByText('Balanced challenge with moderate time pressure', { selector: '.difficulty-range-slider__selected-description' })).toBeInTheDocument();
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

      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach(checkbox => {
        expect(checkbox).toBeDisabled();
      });
    });

    test('does not call onChange when disabled', () => {
      render(<DifficultyRangeSlider {...defaultProps} disabled={true} />);

      const easyOnlyButton = screen.getByText('Easy Only');
      fireEvent.click(easyOnlyButton);

      expect(defaultProps.onChange).not.toHaveBeenCalled();
    });

    test('does not call onChange when clicking disabled checkboxes', () => {
      render(<DifficultyRangeSlider {...defaultProps} disabled={true} />);

      const easyCheckbox = screen.getByLabelText('Select Easy difficulty');
      fireEvent.click(easyCheckbox);

      expect(defaultProps.onChange).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels for checkboxes', () => {
      render(<DifficultyRangeSlider {...defaultProps} />);

      expect(screen.getByLabelText('Select Easy difficulty')).toBeInTheDocument();
      expect(screen.getByLabelText('Select Medium difficulty')).toBeInTheDocument();
      expect(screen.getByLabelText('Select Hard difficulty')).toBeInTheDocument();
      expect(screen.getByLabelText('Select Expert difficulty')).toBeInTheDocument();
    });

    test('checkboxes are focusable when not disabled', () => {
      render(<DifficultyRangeSlider {...defaultProps} />);

      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach(checkbox => {
        expect(checkbox).not.toHaveAttribute('tabIndex', '-1');
      });
    });

    test('checkboxes are not focusable when disabled', () => {
      render(<DifficultyRangeSlider {...defaultProps} disabled={true} />);

      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach(checkbox => {
        expect(checkbox).toBeDisabled();
      });
    });

    test('stars have aria-hidden attribute', () => {
      render(<DifficultyRangeSlider {...defaultProps} />);

      const stars = screen.getAllByText('★');
      stars.forEach(star => {
        expect(star).toHaveAttribute('aria-hidden', 'true');
      });
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

    test('applies selected class to checked difficulty labels', () => {
      render(<DifficultyRangeSlider {...defaultProps} />);

      const labels = screen.getAllByText(/Easy|Medium|Hard|Expert/);
      labels.forEach(label => {
        if (label.closest('.difficulty-checkbox__label')) {
          expect(label.closest('.difficulty-checkbox__label')).toHaveClass('difficulty-checkbox__label--selected');
        }
      });
    });
  });
}); 