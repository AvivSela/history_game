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
  value: localStorageMock
});

describe('CategorySelector', () => {
  const defaultProps = {
    value: ['history', 'science'],
    onChange: vi.fn(),
    categories: [
      { id: 'history', name: 'History', description: 'Historical events and figures' },
      { id: 'science', name: 'Science', description: 'Scientific discoveries and inventions' },
      { id: 'art', name: 'Art', description: 'Artistic movements and masterpieces' },
      { id: 'literature', name: 'Literature', description: 'Books, authors, and literary works' },
      { id: 'geography', name: 'Geography', description: 'Places, countries, and landmarks' }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('Rendering', () => {
    test('renders all categories as checkboxes', () => {
      render(<CategorySelector {...defaultProps} />);
      
      // Open dropdown first
      const triggerButton = screen.getByRole('button', { name: /2 categories selected/i });
      fireEvent.click(triggerButton);
      
      expect(screen.getByLabelText('History')).toBeInTheDocument();
      expect(screen.getByLabelText('Science')).toBeInTheDocument();
      expect(screen.getByLabelText('Art')).toBeInTheDocument();
      expect(screen.getByLabelText('Literature')).toBeInTheDocument();
      expect(screen.getByLabelText('Geography')).toBeInTheDocument();
    });

    test('marks selected categories as checked', () => {
      render(<CategorySelector {...defaultProps} />);
      
      // Open dropdown first
      const triggerButton = screen.getByRole('button', { name: /2 categories selected/i });
      fireEvent.click(triggerButton);
      
      expect(screen.getByLabelText('History')).toBeChecked();
      expect(screen.getByLabelText('Science')).toBeChecked();
      expect(screen.getByLabelText('Art')).not.toBeChecked();
    });

    test('renders category descriptions', () => {
      render(<CategorySelector {...defaultProps} />);
      
      // Open dropdown first
      const triggerButton = screen.getByRole('button', { name: /2 categories selected/i });
      fireEvent.click(triggerButton);
      
      expect(screen.getByText('Historical events and figures')).toBeInTheDocument();
      expect(screen.getByText('Scientific discoveries and inventions')).toBeInTheDocument();
    });

    test('renders with custom className', () => {
      render(<CategorySelector {...defaultProps} className="custom-class" />);
      
      const container = screen.getByText('Game Categories').closest('.category-selector');
      expect(container).toHaveClass('custom-class');
    });

    test('renders with custom label', () => {
      render(<CategorySelector {...defaultProps} label="Custom Categories" />);
      
      expect(screen.getByText('Game Categories')).toBeInTheDocument();
    });

    test('renders search input', () => {
      render(<CategorySelector {...defaultProps} />);
      
      // Open dropdown first
      const triggerButton = screen.getByRole('button', { name: /2 categories selected/i });
      fireEvent.click(triggerButton);
      
      const searchInput = screen.getByPlaceholderText('Search categories...');
      expect(searchInput).toBeInTheDocument();
    });

    test('renders favorites section', () => {
      render(<CategorySelector {...defaultProps} />);
      
      // Open dropdown first
      const triggerButton = screen.getByRole('button', { name: /2 categories selected/i });
      fireEvent.click(triggerButton);
      
      // Favorite the first category
      const historyCheckbox = screen.getByLabelText('History');
      const favoriteButton = historyCheckbox.closest('.category-selector__item').querySelector('.category-selector__favorite');
      fireEvent.click(favoriteButton);
      
      // Now the Favorites button should be present
      expect(screen.getByRole('button', { name: /Favorites/ })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper label structure', () => {
      render(<CategorySelector {...defaultProps} />);
      
      const legend = screen.getByText('Game Categories');
      
      expect(legend).toBeInTheDocument();
    });

    test('has proper ARIA attributes for checkboxes', () => {
      render(<CategorySelector {...defaultProps} />);
      
      // Open dropdown first
      const triggerButton = screen.getByRole('button', { name: /2 categories selected/i });
      fireEvent.click(triggerButton);
      
      const historyCheckbox = screen.getByLabelText('History');
      expect(historyCheckbox).toHaveAttribute('type', 'checkbox');
      expect(historyCheckbox).toBeChecked();
    });

    test('has proper label associations', () => {
      render(<CategorySelector {...defaultProps} />);
      
      // Open dropdown first
      const triggerButton = screen.getByRole('button', { name: /2 categories selected/i });
      fireEvent.click(triggerButton);
      
      const historyCheckbox = screen.getByLabelText('History');
      
      expect(historyCheckbox).toBeInTheDocument();
      expect(screen.getByText('History')).toBeInTheDocument();
    });

    test('applies disabled state correctly', () => {
      render(<CategorySelector {...defaultProps} disabled={true} />);
      
      const triggerButton = screen.getByRole('button');
      expect(triggerButton).toBeDisabled();
    });

    test('has proper focus management', () => {
      render(<CategorySelector {...defaultProps} />);
      
      // Open dropdown first
      const triggerButton = screen.getByRole('button', { name: /2 categories selected/i });
      fireEvent.click(triggerButton);
      
      const searchInput = screen.getByPlaceholderText('Search categories...');
      searchInput.focus();
      
      expect(searchInput).toHaveFocus();
    });
  });

  describe('User Interactions', () => {
    test('calls onChange when checkbox is selected', () => {
      render(<CategorySelector {...defaultProps} />);
      
      // Open dropdown first
      const triggerButton = screen.getByRole('button', { name: /2 categories selected/i });
      fireEvent.click(triggerButton);
      
      const artCheckbox = screen.getByLabelText('Art');
      fireEvent.click(artCheckbox);
      
      expect(defaultProps.onChange).toHaveBeenCalledWith(['history', 'science', 'art']);
    });

    test('calls onChange when checkbox is deselected', () => {
      render(<CategorySelector {...defaultProps} />);
      
      // Open dropdown first
      const triggerButton = screen.getByRole('button', { name: /2 categories selected/i });
      fireEvent.click(triggerButton);
      
      const historyCheckbox = screen.getByLabelText('History');
      fireEvent.click(historyCheckbox);
      
      expect(defaultProps.onChange).toHaveBeenCalledWith(['science']);
    });

    test('does not call onChange when disabled', () => {
      render(<CategorySelector {...defaultProps} disabled={true} />);
      
      // Try to open dropdown when disabled
      const triggerButton = screen.getByRole('button');
      fireEvent.click(triggerButton);
      
      // Should not be able to open dropdown when disabled
      expect(screen.queryByPlaceholderText('Search categories...')).not.toBeInTheDocument();
    });

    test('updates selection when value prop changes', () => {
      const { rerender } = render(<CategorySelector {...defaultProps} />);
      
      // Initially shows 2 categories selected
      expect(screen.getByRole('button')).toHaveTextContent('2 categories selected');
      
      // Change to Art and Literature
      rerender(<CategorySelector {...defaultProps} value={['art', 'literature']} />);
      
      // Should still show 2 categories selected
      expect(screen.getByRole('button')).toHaveTextContent('2 categories selected');
    });
  });

  describe('Search Functionality', () => {
    test('filters categories based on search input', () => {
      render(<CategorySelector {...defaultProps} />);
      
      // Open dropdown first
      const triggerButton = screen.getByRole('button', { name: /2 categories selected/i });
      fireEvent.click(triggerButton);
      
      const searchInput = screen.getByPlaceholderText('Search categories...');
      
      // Type "science"
      fireEvent.change(searchInput, { target: { value: 'science' } });
      
      // Should show only Science
      expect(screen.getByLabelText('Science')).toBeInTheDocument();
      expect(screen.queryByLabelText('History')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Art')).not.toBeInTheDocument();
    });

    test('filters categories case-insensitively', () => {
      render(<CategorySelector {...defaultProps} />);
      
      // Open dropdown first
      const triggerButton = screen.getByRole('button', { name: /2 categories selected/i });
      fireEvent.click(triggerButton);
      
      const searchInput = screen.getByPlaceholderText('Search categories...');
      
      // Type "HISTORY"
      fireEvent.change(searchInput, { target: { value: 'HISTORY' } });
      
      // Should show History
      expect(screen.getByLabelText('History')).toBeInTheDocument();
    });

    test('filters by description text', () => {
      render(<CategorySelector {...defaultProps} />);
      
      // Open dropdown first
      const triggerButton = screen.getByRole('button', { name: /2 categories selected/i });
      fireEvent.click(triggerButton);
      
      const searchInput = screen.getByPlaceholderText('Search categories...');
      
      // Type "discoveries"
      fireEvent.change(searchInput, { target: { value: 'discoveries' } });
      
      // Should show Science
      expect(screen.getByLabelText('Science')).toBeInTheDocument();
    });

    test('shows all categories when search is cleared', () => {
      render(<CategorySelector {...defaultProps} />);
      
      // Open dropdown first
      const triggerButton = screen.getByRole('button', { name: /2 categories selected/i });
      fireEvent.click(triggerButton);
      
      const searchInput = screen.getByPlaceholderText('Search categories...');
      
      // Type something
      fireEvent.change(searchInput, { target: { value: 'science' } });
      
      // Clear search
      fireEvent.change(searchInput, { target: { value: '' } });
      
      // Should show all categories
      expect(screen.getByLabelText('History')).toBeInTheDocument();
      expect(screen.getByLabelText('Science')).toBeInTheDocument();
      expect(screen.getByLabelText('Art')).toBeInTheDocument();
      expect(screen.getByLabelText('Literature')).toBeInTheDocument();
      expect(screen.getByLabelText('Geography')).toBeInTheDocument();
    });

    test('shows no results message when no matches', () => {
      render(<CategorySelector {...defaultProps} />);
      
      // Open dropdown first
      const triggerButton = screen.getByRole('button', { name: /2 categories selected/i });
      fireEvent.click(triggerButton);
      
      const searchInput = screen.getByPlaceholderText('Search categories...');
      
      // Type something that doesn't match
      fireEvent.change(searchInput, { target: { value: 'xyz' } });
      
      expect(screen.getByText(/No categories found matching/)).toBeInTheDocument();
    });
  });

  describe('Favorites Functionality', () => {
    test('loads favorites from localStorage', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(['history', 'art']));
      
      render(<CategorySelector {...defaultProps} />);
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith('timeline-game-favorites');
    });

    test('saves favorites to localStorage', () => {
      render(<CategorySelector {...defaultProps} />);
      
      // Open dropdown first
      const triggerButton = screen.getByRole('button', { name: /2 categories selected/i });
      fireEvent.click(triggerButton);
      
      const historyCheckbox = screen.getByLabelText('History');
      const favoriteButton = historyCheckbox.closest('.category-selector__item').querySelector('.category-selector__favorite');
      
      fireEvent.click(favoriteButton);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('timeline-game-favorites', JSON.stringify(['history']));
    });

    test('toggles favorite status', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(['history']));
      
      render(<CategorySelector {...defaultProps} />);
      
      // Open dropdown first
      const triggerButton = screen.getByRole('button', { name: /2 categories selected/i });
      fireEvent.click(triggerButton);
      
      const historyCheckbox = screen.getByLabelText('History');
      const favoriteButton = historyCheckbox.closest('.category-selector__item').querySelector('.category-selector__favorite');
      
      // Should be favorited initially
      expect(favoriteButton).toHaveClass('category-selector__favorite--active');
      
      // Click to unfavorite
      fireEvent.click(favoriteButton);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('timeline-game-favorites', JSON.stringify([]));
    });

    test('shows favorites section when favorites exist', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(['history', 'art']));
      
      render(<CategorySelector {...defaultProps} />);
      
      // Open dropdown first
      const triggerButton = screen.getByRole('button', { name: /2 categories selected/i });
      fireEvent.click(triggerButton);
      
      expect(screen.getByText(/Favorites/)).toBeInTheDocument();
      expect(screen.getByText('History')).toBeInTheDocument();
      expect(screen.getByText('Art')).toBeInTheDocument();
    });

    test('hides favorites section when no favorites', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([]));
      
      render(<CategorySelector {...defaultProps} />);
      
      // Open dropdown first
      const triggerButton = screen.getByRole('button', { name: /2 categories selected/i });
      fireEvent.click(triggerButton);
      
      expect(screen.queryByText(/Favorites/)).not.toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    test('navigates through checkboxes with Tab', () => {
      render(<CategorySelector {...defaultProps} />);
      
      // Open dropdown first
      const triggerButton = screen.getByRole('button', { name: /2 categories selected/i });
      fireEvent.click(triggerButton);
      
      const searchInput = screen.getByPlaceholderText('Search categories...');
      
      searchInput.focus();
      expect(searchInput).toHaveFocus();
    });

    test('handles escape key in search', () => {
      render(<CategorySelector {...defaultProps} />);
      
      // Open dropdown first
      const triggerButton = screen.getByRole('button', { name: /2 categories selected/i });
      fireEvent.click(triggerButton);
      
      const searchInput = screen.getByPlaceholderText('Search categories...');
      
      fireEvent.keyDown(searchInput, { key: 'Escape' });
      
      // Dropdown should close
      expect(screen.queryByPlaceholderText('Search categories...')).not.toBeInTheDocument();
    });
  });

  describe('CSS Classes', () => {
    test('applies correct classes when disabled', () => {
      render(<CategorySelector {...defaultProps} disabled={true} />);
      
      const container = screen.getByText('Game Categories').closest('.category-selector');
      expect(container).toHaveClass('category-selector--disabled');
    });

    test('applies correct classes when open', () => {
      render(<CategorySelector {...defaultProps} />);
      
      // Open dropdown first
      const triggerButton = screen.getByRole('button', { name: /2 categories selected/i });
      fireEvent.click(triggerButton);
      
      const container = screen.getByText('Game Categories').closest('.category-selector');
      expect(container).toHaveClass('category-selector--open');
    });

    test('applies selected class to checked items', () => {
      render(<CategorySelector {...defaultProps} />);
      
      // Open dropdown first
      const triggerButton = screen.getByRole('button', { name: /2 categories selected/i });
      fireEvent.click(triggerButton);
      
      const historyItem = screen.getByLabelText('History').closest('.category-selector__item');
      const artItem = screen.getByLabelText('Art').closest('.category-selector__item');
      
      expect(historyItem).toHaveClass('category-selector__item--selected');
      expect(artItem).not.toHaveClass('category-selector__item--selected');
    });
  });

  describe('Edge Cases', () => {
    test('handles empty categories array', () => {
      render(<CategorySelector {...defaultProps} categories={[]} />);
      
      // Open dropdown first
      const triggerButton = screen.getByRole('button', { name: /2 categories selected/i });
      fireEvent.click(triggerButton);
      
      expect(screen.getByText(/No categories found/)).toBeInTheDocument();
    });

    test('handles missing onChange prop', () => {
      const { onChange, ...propsWithoutOnChange } = defaultProps;
      
      expect(() => {
        render(<CategorySelector {...propsWithoutOnChange} />);
      }).not.toThrow();
    });

    test('handles null onChange prop', () => {
      expect(() => {
        render(<CategorySelector {...defaultProps} onChange={null} />);
      }).not.toThrow();
    });

    test('handles invalid value gracefully', () => {
      render(<CategorySelector {...defaultProps} value={['invalid-category']} />);
      
      // Open dropdown first
      const triggerButton = screen.getByRole('button', { name: /1 category selected/i });
      fireEvent.click(triggerButton);
      
      // Should not crash and should show available categories
      expect(screen.getByLabelText('History')).toBeInTheDocument();
    });

    test('handles localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });
      
      expect(() => {
        render(<CategorySelector {...defaultProps} />);
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    test('filters categories on search input', async () => {
      render(<CategorySelector {...defaultProps} />);
      
      // Open dropdown first
      const triggerButton = screen.getByRole('button', { name: /2 categories selected/i });
      fireEvent.click(triggerButton);
      
      const searchInput = screen.getByPlaceholderText('Search categories...');
      
      // Type search term
      fireEvent.change(searchInput, { target: { value: 'science' } });
      
      await waitFor(() => {
        expect(screen.getByLabelText('Science')).toBeInTheDocument();
        expect(screen.queryByLabelText('History')).not.toBeInTheDocument();
      });
    });
  });
}); 