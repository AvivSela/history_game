import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { DIFFICULTY_LEVELS } from '../../constants/gameConstants.js';
import DifficultySelector from './DifficultySelector.jsx';

describe('DifficultySelector', () => {
  const defaultProps = {
    value: DIFFICULTY_LEVELS.MEDIUM,
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    test('renders and allows difficulty selection', () => {
      render(<DifficultySelector {...defaultProps} />);

      // Verify all options are present
      expect(screen.getByText('Easy')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toBeInTheDocument();
      expect(screen.getByText('Hard')).toBeInTheDocument();
      expect(screen.getByText('Expert')).toBeInTheDocument();

      // Verify current selection
      expect(screen.getByDisplayValue('medium')).toBeChecked();

      // Test selection change
      const hardRadio = screen.getByDisplayValue('hard');
      fireEvent.click(hardRadio);
      expect(defaultProps.onChange).toHaveBeenCalledWith(DIFFICULTY_LEVELS.HARD);
    });

    test('handles disabled state', () => {
      render(<DifficultySelector {...defaultProps} disabled={true} />);

      const radioButtons = screen.getAllByRole('radio');
      radioButtons.forEach(radio => {
        expect(radio).toBeDisabled();
      });

      // Should not call onChange when disabled
      const hardRadio = screen.getByDisplayValue('hard');
      fireEvent.click(hardRadio);
      expect(defaultProps.onChange).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    test('supports keyboard navigation with arrow keys', () => {
      render(<DifficultySelector {...defaultProps} />);

      const fieldset = screen.getByRole('group');

      // Test arrow key navigation
      fireEvent.keyDown(fieldset, { key: 'ArrowRight' });
      expect(defaultProps.onChange).toHaveBeenCalledWith(DIFFICULTY_LEVELS.HARD);

      vi.clearAllMocks();
      fireEvent.keyDown(fieldset, { key: 'ArrowLeft' });
      expect(defaultProps.onChange).toHaveBeenCalledWith(DIFFICULTY_LEVELS.EASY);
    });

    test('wraps around at boundaries', () => {
      render(<DifficultySelector {...defaultProps} value={DIFFICULTY_LEVELS.EXPERT} />);

      const fieldset = screen.getByRole('group');

      // Wrap from last to first
      fireEvent.keyDown(fieldset, { key: 'ArrowRight' });
      expect(defaultProps.onChange).toHaveBeenCalledWith(DIFFICULTY_LEVELS.EASY);
    });
  });

  describe('Edge Cases', () => {
    test('handles invalid values and missing props gracefully', () => {
      // Test invalid value
      render(<DifficultySelector {...defaultProps} value="invalid" />);
      const radioButtons = screen.getAllByRole('radio');
      radioButtons.forEach(radio => {
        expect(radio).not.toBeChecked();
      });

      // Test missing onChange
      expect(() => {
        render(<DifficultySelector value={DIFFICULTY_LEVELS.MEDIUM} />);
      }).not.toThrow();
    });
  });
});
