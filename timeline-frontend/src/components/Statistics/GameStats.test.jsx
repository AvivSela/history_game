import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import GameStats from './GameStats';

// Mock the API module
vi.mock('../../utils/api', () => ({
  gameAPI: {
    getPlayerStatistics: vi.fn()
  },
  extractData: vi.fn(),
  handleAPIError: vi.fn()
}));

// Import the mocked functions
import { gameAPI, extractData, handleAPIError } from '../../utils/api';

/**
 * GameStats Component Tests
 * 
 * Tests the GameStats component's functionality including:
 * - Loading states
 * - Error handling
 * - Data display
 * - User interactions
 */
describe('GameStats', () => {
  const mockStats = {
    player_name: 'TestPlayer',
    total_games_played: 25,
    total_games_won: 18,
    win_rate: 0.72,
    total_score: 12500,
    best_score: 850,
    average_score_per_game: 500,
    total_moves: 150,
    average_accuracy: 0.85,
    average_game_duration_seconds: 180,
    total_correct_moves: 127,
    total_incorrect_moves: 23,
    total_play_time_seconds: 4500,
    favorite_categories: [
      { category: 'History', play_count: 10 },
      { category: 'Science', play_count: 8 }
    ],
    favorite_difficulty: {
      difficulty_level: 2,
      play_count: 15
    },
    first_played_at: '2024-01-15T10:00:00Z',
    last_played_at: '2024-01-20T15:30:00Z'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should show loading spinner when fetching stats', () => {
      gameAPI.getPlayerStatistics.mockImplementation(() => 
        new Promise(() => {}) // Never resolves
      );

      render(<GameStats playerName="TestPlayer" />);

      expect(screen.getByText('Loading statistics...')).toBeInTheDocument();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should show error message when API call fails', async () => {
      const errorMessage = 'Failed to load statistics';
      gameAPI.getPlayerStatistics.mockRejectedValue(new Error('API Error'));
      handleAPIError.mockReturnValue(errorMessage);

      render(<GameStats playerName="TestPlayer" />);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });

      expect(screen.getByText('⚠️')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('should retry when retry button is clicked', async () => {
      gameAPI.getPlayerStatistics
        .mockRejectedValueOnce(new Error('API Error'))
        .mockResolvedValueOnce({ data: mockStats });

      handleAPIError.mockReturnValue('Failed to load statistics');

      render(<GameStats playerName="TestPlayer" />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /retry/i }));
      });

      // Verify that the API was called twice (initial + retry)
      expect(gameAPI.getPlayerStatistics).toHaveBeenCalledTimes(2);
    });
  });

  describe('Data Display', () => {
    beforeEach(() => {
      gameAPI.getPlayerStatistics.mockResolvedValue({ data: mockStats });
      extractData.mockReturnValue(mockStats);
    });

    it('should display player name and basic stats', async () => {
      render(<GameStats playerName="TestPlayer" />);

      await waitFor(() => {
        expect(screen.getByText('TestPlayer')).toBeInTheDocument();
      });

      expect(screen.getByText('25')).toBeInTheDocument(); // Games played
      expect(screen.getByText('18')).toBeInTheDocument(); // Games won
      expect(screen.getByText('72%')).toBeInTheDocument(); // Win rate
    });

    it('should display performance statistics', async () => {
      render(<GameStats playerName="TestPlayer" />);

      await waitFor(() => {
        expect(screen.getByText('12,500')).toBeInTheDocument(); // Total score
        expect(screen.getByText('850')).toBeInTheDocument(); // Best score
        expect(screen.getByText('500')).toBeInTheDocument(); // Avg score
      });
    });

    it('should display gameplay statistics', async () => {
      render(<GameStats playerName="TestPlayer" />);

      await waitFor(() => {
        expect(screen.getByText('150')).toBeInTheDocument(); // Total moves
        expect(screen.getByText('85%')).toBeInTheDocument(); // Accuracy
        expect(screen.getByText('3m 0s')).toBeInTheDocument(); // Avg duration
      });
    });

    it('should display detailed statistics when showDetails is true', async () => {
      render(<GameStats playerName="TestPlayer" showDetails={true} />);

      await waitFor(() => {
        expect(screen.getByText('127')).toBeInTheDocument(); // Correct moves
        expect(screen.getByText('23')).toBeInTheDocument(); // Incorrect moves
        expect(screen.getByText('75m 0s')).toBeInTheDocument(); // Total play time (4500 seconds = 75 minutes)
      });
    });

    it('should hide detailed statistics when showDetails is false', async () => {
      render(<GameStats playerName="TestPlayer" showDetails={false} />);

      await waitFor(() => {
        expect(screen.getByText('TestPlayer')).toBeInTheDocument();
      });

      expect(screen.queryByText('Move Breakdown')).not.toBeInTheDocument();
      expect(screen.queryByText('Favorite Categories')).not.toBeInTheDocument();
    });

    it('should display favorite categories', async () => {
      render(<GameStats playerName="TestPlayer" showDetails={true} />);

      await waitFor(() => {
        expect(screen.getByText('History')).toBeInTheDocument();
        expect(screen.getByText('10 games')).toBeInTheDocument();
        expect(screen.getByText('Science')).toBeInTheDocument();
        expect(screen.getByText('8 games')).toBeInTheDocument();
      });
    });

    it('should display favorite difficulty', async () => {
      render(<GameStats playerName="TestPlayer" showDetails={true} />);

      await waitFor(() => {
        expect(screen.getByText('Level 2')).toBeInTheDocument();
        expect(screen.getByText('15 games')).toBeInTheDocument();
      });
    });
  });

  describe('User Interactions', () => {
    beforeEach(() => {
      gameAPI.getPlayerStatistics.mockResolvedValue({ data: mockStats });
      extractData.mockReturnValue(mockStats);
    });

    it('should refresh stats when refresh button is clicked', async () => {
      render(<GameStats playerName="TestPlayer" />);

      await waitFor(() => {
        expect(screen.getByText('TestPlayer')).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /refresh/i }));
      });

      expect(gameAPI.getPlayerStatistics).toHaveBeenCalledTimes(2);
    });

    it('should show last updated time', async () => {
      render(<GameStats playerName="TestPlayer" />);

      await waitFor(() => {
        expect(screen.getByText(/Updated:/)).toBeInTheDocument();
      });
    });
  });

  describe('API Integration', () => {
    it('should call API with correct player name', async () => {
      gameAPI.getPlayerStatistics.mockResolvedValue({ data: mockStats });
      extractData.mockReturnValue(mockStats);

      render(<GameStats playerName="TestPlayer" />);

      await waitFor(() => {
        expect(gameAPI.getPlayerStatistics).toHaveBeenCalledWith('TestPlayer');
      });
    });

    it('should handle API errors gracefully', async () => {
      const apiError = new Error('Network error');
      gameAPI.getPlayerStatistics.mockRejectedValue(apiError);
      handleAPIError.mockReturnValue('Failed to load statistics');

      render(<GameStats playerName="TestPlayer" />);

      await waitFor(() => {
        expect(handleAPIError).toHaveBeenCalledWith(apiError, 'Failed to load statistics');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty stats gracefully', async () => {
      gameAPI.getPlayerStatistics.mockResolvedValue({ data: null });
      extractData.mockReturnValue(null);

      render(<GameStats playerName="TestPlayer" />);

      await waitFor(() => {
        expect(screen.getByText('No statistics available')).toBeInTheDocument();
      });
    });

    it('should handle missing optional fields', async () => {
      const minimalStats = {
        player_name: 'TestPlayer',
        total_games_played: 5,
        total_games_won: 3,
        win_rate: 0.6,
        total_score: 1000,
        best_score: 200,
        average_score_per_game: 200,
        total_moves: 20,
        average_accuracy: 0.8,
        average_game_duration_seconds: 120,
        total_correct_moves: 16,
        total_incorrect_moves: 4,
        total_play_time_seconds: 600
      };

      gameAPI.getPlayerStatistics.mockResolvedValue({ data: minimalStats });
      extractData.mockReturnValue(minimalStats);

      render(<GameStats playerName="TestPlayer" showDetails={true} />);

      await waitFor(() => {
        expect(screen.getByText('TestPlayer')).toBeInTheDocument();
      });

      // Should not crash when optional fields are missing
      expect(screen.queryByText('Favorite Categories')).not.toBeInTheDocument();
      expect(screen.queryByText('Preferred Difficulty')).not.toBeInTheDocument();
    });

    it('should handle zero values correctly', async () => {
      const zeroStats = {
        player_name: 'TestPlayer',
        total_games_played: 0,
        total_games_won: 0,
        win_rate: 0,
        total_score: 0,
        best_score: 0,
        average_score_per_game: 0,
        total_moves: 0,
        average_accuracy: 0,
        average_game_duration_seconds: 0,
        total_correct_moves: 0,
        total_incorrect_moves: 0,
        total_play_time_seconds: 0
      };

      gameAPI.getPlayerStatistics.mockResolvedValue({ data: zeroStats });
      extractData.mockReturnValue(zeroStats);

      render(<GameStats playerName="TestPlayer" />);

      await waitFor(() => {
        // Check for specific zero values in context
        expect(screen.getByText('Games Played')).toBeInTheDocument();
        expect(screen.getByText('Games Won')).toBeInTheDocument();
        expect(screen.getByText('Win Rate')).toBeInTheDocument();
        // Check that zero values are displayed
        const zeroValues = screen.getAllByText('0');
        expect(zeroValues.length).toBeGreaterThan(0);
        const zeroPercentages = screen.getAllByText('0%');
        expect(zeroPercentages.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      gameAPI.getPlayerStatistics.mockResolvedValue({ data: mockStats });
      extractData.mockReturnValue(mockStats);
    });

    it('should have proper ARIA labels', async () => {
      render(<GameStats playerName="TestPlayer" />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /refresh statistics/i })).toBeInTheDocument();
      });
    });

    it('should have proper heading structure', async () => {
      render(<GameStats playerName="TestPlayer" showDetails={true} />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
        // With showDetails=true, we have 7 h4 headings: Overview, Performance, Gameplay, Move Breakdown, Favorite Categories, Preferred Difficulty, Activity
        expect(screen.getAllByRole('heading', { level: 4 })).toHaveLength(7);
      });
    });
  });
}); 