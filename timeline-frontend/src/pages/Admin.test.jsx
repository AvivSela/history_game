import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import Admin from './Admin';
import { gameAPI } from '../utils/api';

// Mock the API module
vi.mock('../utils/api', () => ({
  gameAPI: {
    getAdminCards: vi.fn(),
    createAdminCard: vi.fn(),
    updateAdminCard: vi.fn(),
    deleteAdminCard: vi.fn()
  },
  extractData: vi.fn((response) => response.data),
  handleAPIError: vi.fn((error) => error.message)
}));

// Mock data for testing
const mockCards = [
  {
    id: 1,
    title: 'First Computer',
    description: 'The first electronic computer was built',
    dateOccurred: '1946-02-14',
    category: 'Technology',
    difficulty: 3,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    title: 'Moon Landing',
    description: 'First human steps on the moon',
    dateOccurred: '1969-07-20',
    category: 'Science',
    difficulty: 2,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

const mockPagination = {
  total: 2,
  limit: 20,
  offset: 0,
  hasMore: false
};

describe('Admin Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock successful API response
    gameAPI.getAdminCards.mockResolvedValue({
      data: {
        data: {
          cards: mockCards,
          pagination: mockPagination
        }
      }
    });
  });

  describe('Core Functionality', () => {
    test('renders admin page with header', async () => {
      render(<Admin />);
      
      await waitFor(() => {
        expect(screen.getByText('Timeline Game Admin')).toBeInTheDocument();
        expect(screen.getByText('Manage game content and monitor system performance')).toBeInTheDocument();
      });
    });

    test('renders Card Management tab', async () => {
      render(<Admin />);
      
      await waitFor(() => {
        expect(screen.getByText('Card Management')).toBeInTheDocument();
      });
    });

    test('loads and displays cards successfully', async () => {
      render(<Admin />);
      
      await waitFor(() => {
        expect(screen.getByText('First Computer')).toBeInTheDocument();
        expect(screen.getByText('Moon Landing')).toBeInTheDocument();
      });
    });

    test('displays card information correctly', async () => {
      render(<Admin />);
      
      await waitFor(() => {
        // Check card titles
        expect(screen.getByText('First Computer')).toBeInTheDocument();
        expect(screen.getByText('Moon Landing')).toBeInTheDocument();
        
        // Check categories in card display (not dropdown)
        const categorySpans = screen.getAllByText(/Technology|Science/);
        expect(categorySpans.length).toBeGreaterThanOrEqual(2);
        
        // Check dates
        expect(screen.getByText('2/14/1946')).toBeInTheDocument();
        expect(screen.getByText('7/20/1969')).toBeInTheDocument();
      });
    });

    test('displays card actions (Edit and Delete buttons)', async () => {
      render(<Admin />);
      
      await waitFor(() => {
        const editButtons = screen.getAllByText('Edit');
        const deleteButtons = screen.getAllByText('Delete');
        
        expect(editButtons).toHaveLength(2);
        expect(deleteButtons).toHaveLength(2);
      });
    });

    test('displays Add New Card button', async () => {
      render(<Admin />);
      
      await waitFor(() => {
        expect(screen.getByText('Add New Card')).toBeInTheDocument();
      });
    });

    test('displays search and filter controls', async () => {
      render(<Admin />);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search cards...')).toBeInTheDocument();
        expect(screen.getByText('Category:')).toBeInTheDocument();
        expect(screen.getByText('Difficulty:')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    test('displays error message when API call fails', async () => {
      gameAPI.getAdminCards.mockRejectedValue(new Error('Failed to fetch cards'));
      
      render(<Admin />);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to load cards: Failed to fetch cards')).toBeInTheDocument();
      });
    });

    test('dismisses error message when button is clicked', async () => {
      gameAPI.getAdminCards.mockRejectedValue(new Error('Failed to fetch cards'));
      
      render(<Admin />);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to load cards: Failed to fetch cards')).toBeInTheDocument();
      });

      const dismissButton = screen.getByText('×');
      fireEvent.click(dismissButton);

      expect(screen.queryByText('Failed to load cards: Failed to fetch cards')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    test('shows empty state when no cards are found', async () => {
      gameAPI.getAdminCards.mockResolvedValue({
        data: {
          data: {
            cards: [],
            pagination: { total: 0, limit: 20, offset: 0, hasMore: false }
          }
        }
      });
      
      render(<Admin />);
      
      await waitFor(() => {
        expect(screen.getByText('No cards found')).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    test('shows loading state initially', () => {
      render(<Admin />);
      
      expect(screen.getByText('Loading admin interface...')).toBeInTheDocument();
    });
  });

  describe('API Integration', () => {
    test('calls API with correct parameters', async () => {
      render(<Admin />);
      
      await waitFor(() => {
        expect(gameAPI.getAdminCards).toHaveBeenCalledWith('limit=20&offset=0&category=&difficulty=&search=');
      });
    });

    test('handles API response structure correctly', async () => {
      render(<Admin />);
      
      await waitFor(() => {
        expect(screen.getByText('First Computer')).toBeInTheDocument();
        expect(screen.getByText('Moon Landing')).toBeInTheDocument();
      });
    });
  });
}); 