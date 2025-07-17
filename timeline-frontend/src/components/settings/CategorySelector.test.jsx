import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import CategorySelector from './CategorySelector.jsx';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('CategorySelector', () => {
  const defaultProps = {
    value: ['history', 'science'],
    onChange: vi.fn(),
    categories: [
      {
        id: 'history',
        name: 'History',
        description: 'Historical events and figures',
      },
      {
        id: 'science',
        name: 'Science',
        description: 'Scientific discoveries and inventions',
      },
      {
        id: 'technology',
        name: 'Technology',
        description: 'Technological advancements',
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('renders and allows category selection', () => {
      render(<CategorySelector {...defaultProps} />);

      // Verify the component renders
      expect(screen.getByText('Game Categories')).toBeInTheDocument();
      expect(screen.getByText('2 categories selected')).toBeInTheDocument();

      // Click to open dropdown
      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Should show category options
      expect(screen.getByText('History')).toBeInTheDocument();
      expect(screen.getByText('Science')).toBeInTheDocument();
      expect(screen.getByText('Technology')).toBeInTheDocument();
    });

    it('handles category toggling', async () => {
      render(<CategorySelector {...defaultProps} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Toggle a category
      const historyCheckbox = screen.getByLabelText('History');
      fireEvent.click(historyCheckbox);

      await waitFor(() => {
        expect(defaultProps.onChange).toHaveBeenCalled();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles edge cases gracefully', () => {
      // Test with no selected categories
      render(<CategorySelector {...defaultProps} value={[]} />);
      expect(screen.getByRole('button', { name: /Select categories/i })).toBeInTheDocument();
    });
  });
});
