import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import DifficultySelector from './DifficultySelector.jsx';

// Mock useLayoutMode hook
vi.mock('./useLayoutMode', () => ({
  default: () => 'list'
}));

describe('DifficultySelector', () => {
  const defaultProps = {
    value: ['medium'],
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    test('renders and allows difficulty selection', async () => {
      render(<DifficultySelector {...defaultProps} />);

      // Verify dropdown button is present
      expect(screen.getByText('1 difficulty selected')).toBeInTheDocument();

      // Open dropdown
      const dropdownButton = screen.getByRole('button');
      fireEvent.click(dropdownButton);

      // Verify all options are present after opening dropdown
      expect(screen.getByText('Easy')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toBeInTheDocument();
      expect(screen.getByText('Hard')).toBeInTheDocument();
      expect(screen.getByText('Expert')).toBeInTheDocument();

      // Verify current selection (Medium should be selected)
      const mediumItem = screen.getByText('Medium').closest('.difficulty-selector__item');
      expect(mediumItem).toBeTruthy();
      expect(mediumItem).toHaveClass('difficulty-selector__item--selected');

      // Test selection change
      const hardCheckbox = screen.getByRole('checkbox', { name: 'Hard' });
      fireEvent.click(hardCheckbox);
      expect(defaultProps.onChange).toHaveBeenCalledWith(['medium', 'hard']);
    });

    test('handles disabled state', () => {
      render(<DifficultySelector {...defaultProps} disabled={true} />);

      // Verify dropdown button is disabled
      const dropdownButton = screen.getByRole('button');
      expect(dropdownButton).toBeDisabled();

      // Should not call onChange when disabled
      fireEvent.click(dropdownButton);
      expect(defaultProps.onChange).not.toHaveBeenCalled();
    });
  });

  describe('Search Functionality', () => {
    test('filters difficulties by search term', () => {
      render(<DifficultySelector {...defaultProps} />);

      // Open dropdown first
      const dropdownButton = screen.getByRole('button');
      fireEvent.click(dropdownButton);

      const searchInput = screen.getByPlaceholderText('Search difficulties...');
      fireEvent.change(searchInput, { target: { value: 'easy' } });

      // Only Easy should be visible
      expect(screen.getByText('Easy')).toBeInTheDocument();
      expect(screen.queryByText('Hard')).not.toBeInTheDocument();
      expect(screen.queryByText('Expert')).not.toBeInTheDocument();
    });
  });

  describe('Control Buttons', () => {
    test('Select All button selects all difficulties', () => {
      render(<DifficultySelector {...defaultProps} />);

      // Open dropdown first
      const dropdownButton = screen.getByRole('button');
      fireEvent.click(dropdownButton);

      const selectAllButton = screen.getByText('Select All');
      fireEvent.click(selectAllButton);

      expect(defaultProps.onChange).toHaveBeenCalledWith(['easy', 'medium', 'hard', 'expert']);
    });

    test('Clear All button deselects all difficulties', () => {
      render(<DifficultySelector {...defaultProps} />);

      // Open dropdown first
      const dropdownButton = screen.getByRole('button');
      fireEvent.click(dropdownButton);

      const clearAllButton = screen.getByText('Clear All');
      fireEvent.click(clearAllButton);

      expect(defaultProps.onChange).toHaveBeenCalledWith([]);
    });
  });

  describe('Edge Cases', () => {
    test('handles invalid values and missing props gracefully', () => {
      // Test invalid value
      render(<DifficultySelector {...defaultProps} value="invalid" />);
      
      // Should show dropdown button with count
      expect(screen.getByText(/difficulties selected/)).toBeInTheDocument();

      // Test missing onChange
      expect(() => {
        render(<DifficultySelector value={['medium']} />);
      }).not.toThrow();
    });
  });
});
