import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { DIFFICULTY_LEVELS } from '../../constants/gameConstants.js';
import DifficultySelector from './DifficultySelector.jsx';

/**
 * DifficultySelector Component Tests
 *
 * Tests for the DifficultySelector component including rendering, accessibility,
 * keyboard navigation, and user interactions.
 */

describe('DifficultySelector', () => {
  const defaultProps = {
    value: DIFFICULTY_LEVELS.MEDIUM,
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders all difficulty options', () => {
      render(<DifficultySelector {...defaultProps} />);

      expect(screen.getByText('Easy')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toBeInTheDocument();
      expect(screen.getByText('Hard')).toBeInTheDocument();
      expect(screen.getByText('Expert')).toBeInTheDocument();
    });

    test('renders difficulty descriptions', () => {
      render(<DifficultySelector {...defaultProps} />);

      expect(
        screen.getByText(/Relaxed gameplay with generous time limits/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Balanced challenge with moderate time pressure/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Challenging gameplay with strict time limits/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Maximum challenge with minimal assistance/)
      ).toBeInTheDocument();
    });

    test('renders difficulty icons', () => {
      render(<DifficultySelector {...defaultProps} />);

      expect(screen.getByText('😊')).toBeInTheDocument();
      expect(screen.getByText('😐')).toBeInTheDocument();
      expect(screen.getByText('😰')).toBeInTheDocument();
      expect(screen.getByText('😱')).toBeInTheDocument();
    });

    test('marks current selection as selected', () => {
      render(<DifficultySelector {...defaultProps} />);

      const mediumOption = screen.getByDisplayValue('medium');
      expect(mediumOption).toBeChecked();
    });

    test('renders with custom className', () => {
      render(<DifficultySelector {...defaultProps} className="custom-class" />);

      const fieldset = screen.getByRole('group');
      expect(fieldset).toHaveClass('custom-class');
    });

    test('renders legend text', () => {
      render(<DifficultySelector {...defaultProps} />);

      expect(screen.getByText('Game Difficulty')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper fieldset and legend structure', () => {
      render(<DifficultySelector {...defaultProps} />);

      const fieldset = screen.getByRole('group');
      const legend = screen.getByText('Game Difficulty');

      expect(fieldset).toBeInTheDocument();
      expect(legend).toBeInTheDocument();
    });

    test('has proper ARIA attributes for radio buttons', () => {
      render(<DifficultySelector {...defaultProps} />);

      const easyRadio = screen.getByDisplayValue('easy');
      const mediumRadio = screen.getByDisplayValue('medium');

      expect(easyRadio).toHaveAttribute('type', 'radio');
      expect(mediumRadio).toHaveAttribute('type', 'radio');
      expect(easyRadio).toHaveAttribute('name', 'difficulty');
      expect(mediumRadio).toHaveAttribute('name', 'difficulty');
    });

    test('has proper ARIA describedby attributes', () => {
      render(<DifficultySelector {...defaultProps} />);

      const easyRadio = screen.getByDisplayValue('easy');
      const easyDescription = screen.getByText(/Relaxed gameplay/);

      expect(easyRadio).toHaveAttribute(
        'aria-describedby',
        'difficulty-easy-description'
      );
      expect(easyDescription).toHaveAttribute(
        'id',
        'difficulty-easy-description'
      );
    });

    test('applies disabled state correctly', () => {
      render(<DifficultySelector {...defaultProps} disabled={true} />);

      const fieldset = screen.getByRole('group');
      const radioButtons = screen.getAllByRole('radio');

      expect(fieldset).toHaveClass('difficulty-selector--disabled');
      radioButtons.forEach(radio => {
        expect(radio).toBeDisabled();
      });
    });
  });

  describe('User Interactions', () => {
    test('calls onChange when radio button is selected', () => {
      render(<DifficultySelector {...defaultProps} />);

      const hardRadio = screen.getByDisplayValue('hard');
      fireEvent.click(hardRadio);

      expect(defaultProps.onChange).toHaveBeenCalledWith(
        DIFFICULTY_LEVELS.HARD
      );
    });

    test('calls onChange when option container is clicked', () => {
      render(<DifficultySelector {...defaultProps} />);

      // Find the option container for Hard difficulty
      const hardOption = screen.getByDisplayValue('hard').closest('.difficulty-selector__option');
      fireEvent.click(hardOption);

      expect(defaultProps.onChange).toHaveBeenCalledWith(
        DIFFICULTY_LEVELS.HARD
      );
    });

    test('calls onChange when label is clicked', () => {
      render(<DifficultySelector {...defaultProps} />);

      // Find the label for Hard difficulty
      const hardLabel = screen.getByText('Hard');
      fireEvent.click(hardLabel);

      expect(defaultProps.onChange).toHaveBeenCalledWith(
        DIFFICULTY_LEVELS.HARD
      );
    });

    test('does not call onChange when disabled', () => {
      render(<DifficultySelector {...defaultProps} disabled={true} />);

      const hardRadio = screen.getByDisplayValue('hard');
      fireEvent.click(hardRadio);

      expect(defaultProps.onChange).not.toHaveBeenCalled();
    });

    test('updates selection when value prop changes', () => {
      const { rerender } = render(<DifficultySelector {...defaultProps} />);

      // Initially Medium is selected
      expect(screen.getByDisplayValue('medium')).toBeChecked();

      // Change to Hard
      rerender(
        <DifficultySelector {...defaultProps} value={DIFFICULTY_LEVELS.HARD} />
      );
      expect(screen.getByDisplayValue('hard')).toBeChecked();
      expect(screen.getByDisplayValue('medium')).not.toBeChecked();
    });

    test('applies selected styling to current option', () => {
      render(<DifficultySelector {...defaultProps} />);

      const mediumOption = screen
        .getByDisplayValue('medium')
        .closest('.difficulty-selector__option');
      expect(mediumOption).toHaveClass('difficulty-selector__option--selected');
    });
  });

  describe('Keyboard Navigation', () => {
    test('navigates to next option with ArrowRight', () => {
      render(<DifficultySelector {...defaultProps} />);

      const fieldset = screen.getByRole('group');

      // Start with Medium selected
      expect(screen.getByDisplayValue('medium')).toBeChecked();

      // Press ArrowRight to go to Hard
      fireEvent.keyDown(fieldset, { key: 'ArrowRight' });
      expect(defaultProps.onChange).toHaveBeenCalledWith(
        DIFFICULTY_LEVELS.HARD
      );
    });

    test('navigates to next option with ArrowDown', () => {
      render(<DifficultySelector {...defaultProps} />);

      const fieldset = screen.getByRole('group');

      // Start with Medium selected
      expect(screen.getByDisplayValue('medium')).toBeChecked();

      // Press ArrowDown to go to Hard
      fireEvent.keyDown(fieldset, { key: 'ArrowDown' });
      expect(defaultProps.onChange).toHaveBeenCalledWith(
        DIFFICULTY_LEVELS.HARD
      );
    });

    test('navigates to previous option with ArrowLeft', () => {
      render(<DifficultySelector {...defaultProps} />);

      const fieldset = screen.getByRole('group');

      // Start with Medium selected
      expect(screen.getByDisplayValue('medium')).toBeChecked();

      // Press ArrowLeft to go to Easy
      fireEvent.keyDown(fieldset, { key: 'ArrowLeft' });
      expect(defaultProps.onChange).toHaveBeenCalledWith(
        DIFFICULTY_LEVELS.EASY
      );
    });

    test('navigates to previous option with ArrowUp', () => {
      render(<DifficultySelector {...defaultProps} />);

      const fieldset = screen.getByRole('group');

      // Start with Medium selected
      expect(screen.getByDisplayValue('medium')).toBeChecked();

      // Press ArrowUp to go to Easy
      fireEvent.keyDown(fieldset, { key: 'ArrowUp' });
      expect(defaultProps.onChange).toHaveBeenCalledWith(
        DIFFICULTY_LEVELS.EASY
      );
    });

    test('wraps around to first option when pressing ArrowRight on last option', () => {
      render(
        <DifficultySelector
          {...defaultProps}
          value={DIFFICULTY_LEVELS.EXPERT}
        />
      );

      const fieldset = screen.getByRole('group');

      // Start with Expert selected
      expect(screen.getByDisplayValue('expert')).toBeChecked();

      // Press ArrowRight to wrap to Easy
      fireEvent.keyDown(fieldset, { key: 'ArrowRight' });
      expect(defaultProps.onChange).toHaveBeenCalledWith(
        DIFFICULTY_LEVELS.EASY
      );
    });

    test('wraps around to last option when pressing ArrowLeft on first option', () => {
      render(
        <DifficultySelector {...defaultProps} value={DIFFICULTY_LEVELS.EASY} />
      );

      const fieldset = screen.getByRole('group');

      // Start with Easy selected
      expect(screen.getByDisplayValue('easy')).toBeChecked();

      // Press ArrowLeft to wrap to Expert
      fireEvent.keyDown(fieldset, { key: 'ArrowLeft' });
      expect(defaultProps.onChange).toHaveBeenCalledWith(
        DIFFICULTY_LEVELS.EXPERT
      );
    });

    test('prevents default behavior for arrow keys', () => {
      render(<DifficultySelector {...defaultProps} />);

      const fieldset = screen.getByRole('group');

      // Use real KeyboardEvent and check defaultPrevented
      const arrowRightEvent = new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true,
        cancelable: true,
      });
      fieldset.dispatchEvent(arrowRightEvent);
      expect(arrowRightEvent.defaultPrevented).toBe(true);

      const arrowLeftEvent = new KeyboardEvent('keydown', {
        key: 'ArrowLeft',
        bubbles: true,
        cancelable: true,
      });
      fieldset.dispatchEvent(arrowLeftEvent);
      expect(arrowLeftEvent.defaultPrevented).toBe(true);
    });

    test('does not respond to other keys', () => {
      render(<DifficultySelector {...defaultProps} />);

      const fieldset = screen.getByRole('group');

      // Press other keys should not trigger onChange
      fireEvent.keyDown(fieldset, { key: 'Tab' });
      fireEvent.keyDown(fieldset, { key: 'Enter' });
      fireEvent.keyDown(fieldset, { key: 'Space' });
      fireEvent.keyDown(fieldset, { key: 'Escape' });

      expect(defaultProps.onChange).not.toHaveBeenCalled();
    });

    test('responds to Enter key on option container', () => {
      render(<DifficultySelector {...defaultProps} />);

      const hardOption = screen.getByDisplayValue('hard').closest('.difficulty-selector__option');
      fireEvent.keyDown(hardOption, { key: 'Enter' });

      expect(defaultProps.onChange).toHaveBeenCalledWith(
        DIFFICULTY_LEVELS.HARD
      );
    });

    test('responds to Space key on option container', () => {
      render(<DifficultySelector {...defaultProps} />);

      const hardOption = screen.getByDisplayValue('hard').closest('.difficulty-selector__option');
      fireEvent.keyDown(hardOption, { key: ' ' });

      expect(defaultProps.onChange).toHaveBeenCalledWith(
        DIFFICULTY_LEVELS.HARD
      );
    });
  });

  describe('CSS Classes', () => {
    test('applies correct classes when disabled', () => {
      render(<DifficultySelector {...defaultProps} disabled={true} />);

      const fieldset = screen.getByRole('group');
      expect(fieldset).toHaveClass('difficulty-selector--disabled');
    });

    test('applies selected class to current option', () => {
      render(<DifficultySelector {...defaultProps} />);

      const mediumOption = screen
        .getByDisplayValue('medium')
        .closest('.difficulty-selector__option');
      expect(mediumOption).toHaveClass('difficulty-selector__option--selected');
    });

    test('does not apply selected class to unselected options', () => {
      render(<DifficultySelector {...defaultProps} />);

      const easyOption = screen
        .getByDisplayValue('easy')
        .closest('.difficulty-selector__option');
      const hardOption = screen
        .getByDisplayValue('hard')
        .closest('.difficulty-selector__option');

      expect(easyOption).not.toHaveClass(
        'difficulty-selector__option--selected'
      );
      expect(hardOption).not.toHaveClass(
        'difficulty-selector__option--selected'
      );
    });
  });

  describe('Edge Cases', () => {
    test('handles invalid value gracefully', () => {
      render(<DifficultySelector {...defaultProps} value="invalid" />);

      // Should not crash and should not have any selected option
      const radioButtons = screen.getAllByRole('radio');
      radioButtons.forEach(radio => {
        expect(radio).not.toBeChecked();
      });
    });

    test('handles missing onChange prop', () => {
      // Should not crash when onChange is not provided
      expect(() => {
        render(<DifficultySelector value={DIFFICULTY_LEVELS.MEDIUM} />);
      }).not.toThrow();
    });

    test('handles null onChange prop', () => {
      // Should not crash when onChange is null
      expect(() => {
        render(
          <DifficultySelector
            value={DIFFICULTY_LEVELS.MEDIUM}
            onChange={null}
          />
        );
      }).not.toThrow();
    });
  });

  describe('Integration with Constants', () => {
    test('uses correct difficulty level constants', () => {
      render(<DifficultySelector {...defaultProps} />);

      // Verify that the component uses the correct constants
      expect(DIFFICULTY_LEVELS.EASY).toBe('easy');
      expect(DIFFICULTY_LEVELS.MEDIUM).toBe('medium');
      expect(DIFFICULTY_LEVELS.HARD).toBe('hard');
      expect(DIFFICULTY_LEVELS.EXPERT).toBe('expert');
    });

    test('passes correct values to onChange', () => {
      render(<DifficultySelector {...defaultProps} />);

      const easyRadio = screen.getByDisplayValue('easy');
      fireEvent.click(easyRadio);

      expect(defaultProps.onChange).toHaveBeenCalledWith('easy');
    });
  });
});
