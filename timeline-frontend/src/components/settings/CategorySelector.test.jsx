import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import CategorySelector from './CategorySelector.jsx';

// Mock useLayoutMode hook
const mockUseLayoutMode = vi.fn().mockReturnValue('list');
vi.mock('./useLayoutMode', () => ({
  __esModule: true,
  default: () => mockUseLayoutMode(),
}));

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
      { id: 'history', name: 'History', description: 'Historical events' },
      { id: 'science', name: 'Science', description: 'Scientific discoveries' },
      { id: 'art', name: 'Art', description: 'Art history' },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('List Layout', () => {
    beforeEach(() => {
      mockUseLayoutMode.mockReturnValue('list');
    });

    it('renders in list layout with dropdown button', () => {
      render(<CategorySelector {...defaultProps} />);
      expect(
        screen.getByRole('button', { name: /2 categories selected/i })
      ).toBeInTheDocument();
    });

    it('opens dropdown on button click', () => {
      render(<CategorySelector {...defaultProps} />);
      fireEvent.click(
        screen.getByRole('button', { name: /2 categories selected/i })
      );
      expect(
        screen.getByPlaceholderText('Search categories...')
      ).toBeInTheDocument();
    });

    it('allows category selection in dropdown', () => {
      render(<CategorySelector {...defaultProps} />);
      fireEvent.click(
        screen.getByRole('button', { name: /2 categories selected/i })
      );
      fireEvent.click(screen.getByRole('checkbox', { name: /art/i }));
      expect(defaultProps.onChange).toHaveBeenCalledWith([
        'history',
        'science',
        'art',
      ]);
    });
  });

  describe('Grid Layout', () => {
    beforeEach(() => {
      mockUseLayoutMode.mockReturnValue('grid');
    });

    it('renders in grid layout with all categories visible', () => {
      render(<CategorySelector {...defaultProps} />);
      expect(screen.getByText('Historical events')).toBeInTheDocument();
      expect(screen.getByText('Scientific discoveries')).toBeInTheDocument();
      expect(screen.getByText('Art history')).toBeInTheDocument();
    });

    it('allows category selection by clicking grid items', () => {
      render(<CategorySelector {...defaultProps} />);
      fireEvent.click(screen.getByText('Art history').closest('div'));
      expect(defaultProps.onChange).toHaveBeenCalledWith([
        'history',
        'science',
        'art',
      ]);
    });

    it('shows search bar and control buttons', () => {
      render(<CategorySelector {...defaultProps} />);
      expect(
        screen.getByPlaceholderText('Search categories...')
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /select all/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /clear all/i })
      ).toBeInTheDocument();
    });
  });

  describe('Compact Layout', () => {
    beforeEach(() => {
      mockUseLayoutMode.mockReturnValue('compact');
    });

    it('renders in compact layout with category buttons', () => {
      render(<CategorySelector {...defaultProps} />);
      expect(
        screen.getByRole('button', { name: 'History' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Science' })
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Art' })).toBeInTheDocument();
    });

    it('allows category selection by clicking buttons', () => {
      render(<CategorySelector {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: 'Art' }));
      expect(defaultProps.onChange).toHaveBeenCalledWith([
        'history',
        'science',
        'art',
      ]);
    });
  });

  describe('Common Features', () => {
    beforeEach(() => {
      mockUseLayoutMode.mockReturnValue('grid'); // Use grid layout to show all controls
    });

    it('filters categories based on search term', () => {
      render(<CategorySelector {...defaultProps} />);
      const searchInput = screen.getByPlaceholderText('Search categories...');
      fireEvent.change(searchInput, { target: { value: 'hist' } });
      expect(screen.getByText('History')).toBeInTheDocument();
      expect(screen.queryByText('Science')).not.toBeInTheDocument();
    });

    it('handles select all button click', () => {
      render(<CategorySelector {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /select all/i }));
      expect(defaultProps.onChange).toHaveBeenCalledWith([
        'history',
        'science',
        'art',
      ]);
    });

    it('handles clear all button click', () => {
      render(<CategorySelector {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /clear all/i }));
      expect(defaultProps.onChange).toHaveBeenCalledWith([]);
    });

    it('handles favorite functionality', () => {
      render(<CategorySelector {...defaultProps} />);
      const favoriteButton = screen.getAllByLabelText(/add to favorites/i)[0];
      fireEvent.click(favoriteButton);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'timeline-game-favorites',
        JSON.stringify(['history'])
      );
    });

    it('respects disabled prop', () => {
      render(<CategorySelector {...defaultProps} disabled />);
      const searchInput = screen.getByPlaceholderText('Search categories...');
      const selectAllButton = screen.getByRole('button', {
        name: /select all/i,
      });
      const clearAllButton = screen.getByRole('button', { name: /clear all/i });

      expect(searchInput).toBeDisabled();
      expect(selectAllButton).toBeDisabled();
      expect(clearAllButton).toBeDisabled();
    });
  });
});
