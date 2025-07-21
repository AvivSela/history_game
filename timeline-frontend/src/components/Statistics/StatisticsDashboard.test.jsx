/**
 * Statistics Dashboard Test
 * @description Tests for the StatisticsDashboard component
 * @version 1.0.0
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import StatisticsDashboard from './StatisticsDashboard';
import { gameAPI } from '../../utils/api';

// Mock the API module
vi.mock('../../utils/api', () => ({
  gameAPI: {
    getPlayerStatistics: vi.fn(),
    getPlayerCategoryStatistics: vi.fn(),
    getCategories: vi.fn(),
    getGlobalLeaderboard: vi.fn(),
    getCategoryLeaderboard: vi.fn(),
    getDailyLeaderboard: vi.fn(),
    getWeeklyLeaderboard: vi.fn(),
    getPlayerRankings: vi.fn(),
    getLeaderboardSummary: vi.fn(),
    getAnalyticsOverview: vi.fn(),
    getAnalyticsTrends: vi.fn(),
    getDifficultyAnalytics: vi.fn(),
    getCategoryAnalytics: vi.fn(),
  },
  extractData: vi.fn((response) => response.data),
  handleAPIError: vi.fn((error) => error.message),
}));

describe('StatisticsDashboard', () => {
  const mockPlayerName = 'TestPlayer';
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock responses
    gameAPI.getPlayerStatistics.mockResolvedValue({
      data: {
        total_games_played: 10,
        total_games_won: 7,
        win_rate: 0.7,
        total_score: 5000,
        best_score: 800,
        average_score_per_game: 500,
      }
    });
    
    gameAPI.getPlayerCategoryStatistics.mockResolvedValue({
      data: [
        {
          category: 'Military',
          games_played: 3,
          win_rate: 0.67,
          average_score: 450,
          total_score: 1350
        },
        {
          category: 'Technology',
          games_played: 4,
          win_rate: 0.75,
          average_score: 520,
          total_score: 2080
        }
      ]
    });
    
    gameAPI.getCategories.mockResolvedValue({
      data: ['Military', 'Space', 'Political', 'Technology', 'History', 'Aviation']
    });
    
    gameAPI.getGlobalLeaderboard.mockResolvedValue({
      data: [
        {
          player_name: 'Player1',
          total_score: 10000,
          games_played: 20,
          win_rate: 0.8
        },
        {
          player_name: 'Player2',
          total_score: 8000,
          games_played: 15,
          win_rate: 0.7
        }
      ]
    });
    
    gameAPI.getCategoryLeaderboard.mockResolvedValue({
      data: [
        {
          player_name: 'Player1',
          total_score: 5000,
          games_played: 10,
          win_rate: 0.8
        }
      ]
    });
    
    gameAPI.getDailyLeaderboard.mockResolvedValue({
      data: [
        {
          player_name: 'Player1',
          daily_score: 800,
          games_played: 3
        }
      ]
    });
    
    gameAPI.getWeeklyLeaderboard.mockResolvedValue({
      data: [
        {
          player_name: 'Player1',
          weekly_score: 2400,
          games_played: 8
        }
      ]
    });
    
    gameAPI.getPlayerRankings.mockResolvedValue({
      data: {
        player_name: 'TestPlayer',
        global_rank: 5,
        category_ranks: {
          'Technology': 3,
          'Military': 7
        },
        daily_rank: 2,
        weekly_rank: 4
      }
    });
    
    gameAPI.getLeaderboardSummary.mockResolvedValue({
      data: {
        total_players: 100,
        total_games_played: 500,
        average_score: 450,
        top_score: 1200
      }
    });
    
    gameAPI.getAnalyticsOverview.mockResolvedValue({
      data: {
        total_games_played: 100,
        average_game_duration: 180,
        most_popular_categories: ['History', 'Technology'],
        difficulty_distribution: { easy: 30, medium: 50, hard: 20 }
      }
    });
    
    gameAPI.getAnalyticsTrends.mockResolvedValue({
      data: {
        time_period: '30d',
        trends: {
          games_played: [10, 15, 12, 18],
          average_score: [400, 450, 420, 480],
          player_engagement: [0.7, 0.8, 0.75, 0.85]
        }
      }
    });
    
    gameAPI.getDifficultyAnalytics.mockResolvedValue({
      data: {
        difficulty_level: 2,
        games_played: 50,
        average_score: 450,
        win_rate: 0.65,
        average_duration: 200
      }
    });
    
    gameAPI.getCategoryAnalytics.mockResolvedValue({
      data: {
        category: 'Technology',
        games_played: 30,
        average_score: 480,
        win_rate: 0.7,
        player_count: 25
      }
    });
  });

  it('renders nothing when not visible', () => {
    render(
      <StatisticsDashboard
        playerName={mockPlayerName}
        isVisible={false}
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByText('Game Statistics')).not.toBeInTheDocument();
  });

  it('renders dashboard when visible', () => {
    render(
      <StatisticsDashboard
        playerName={mockPlayerName}
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Game Statistics')).toBeInTheDocument();
    expect(screen.getByText('Player Stats')).toBeInTheDocument();
    expect(screen.getByText('Leaderboards')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <StatisticsDashboard
        playerName={mockPlayerName}
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByLabelText('Close statistics dashboard');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('loads player statistics on mount', async () => {
    const mockPlayerStats = {
      total_games: 10,
      games_won: 7,
      average_score: 85.5,
    };

    gameAPI.getPlayerStatistics.mockResolvedValue({
      data: mockPlayerStats,
    });

    render(
      <StatisticsDashboard
        playerName={mockPlayerName}
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(gameAPI.getPlayerStatistics).toHaveBeenCalledWith(mockPlayerName);
    });
  });

  it('switches tabs correctly', async () => {
    const mockLeaderboardData = {
      global: { leaderboard: [] },
      summary: { total_players: 100 },
    };

    gameAPI.getGlobalLeaderboard.mockResolvedValue({
      data: mockLeaderboardData.global,
    });
    gameAPI.getLeaderboardSummary.mockResolvedValue({
      data: mockLeaderboardData.summary,
    });

    render(
      <StatisticsDashboard
        playerName={mockPlayerName}
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    // Click on Leaderboards tab
    const leaderboardsTab = screen.getByText('Leaderboards');
    fireEvent.click(leaderboardsTab);

    await waitFor(() => {
      expect(gameAPI.getGlobalLeaderboard).toHaveBeenCalled();
      expect(gameAPI.getLeaderboardSummary).toHaveBeenCalled();
    });
  });

  it('handles API errors gracefully', async () => {
    const mockError = new Error('API Error');
    gameAPI.getPlayerStatistics.mockRejectedValue(mockError);

    render(
      <StatisticsDashboard
        playerName={mockPlayerName}
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
  });

  it('shows loading state while fetching data', async () => {
    // Create a promise that doesn't resolve immediately
    let resolvePromise;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    gameAPI.getPlayerStatistics.mockReturnValue(promise);

    render(
      <StatisticsDashboard
        playerName={mockPlayerName}
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Loading statistics...')).toBeInTheDocument();

    // Resolve the promise
    resolvePromise({ data: {} });
  });

  it('loads analytics data when analytics tab is clicked', async () => {
    const mockAnalyticsData = {
      overall: { total_games: 1000 },
    };

    gameAPI.getAnalyticsOverview.mockResolvedValue({
      data: mockAnalyticsData,
    });

    render(
      <StatisticsDashboard
        playerName={mockPlayerName}
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    // Click on Analytics tab
    const analyticsTab = screen.getByText('Analytics');
    fireEvent.click(analyticsTab);

    await waitFor(() => {
      expect(gameAPI.getAnalyticsOverview).toHaveBeenCalled();
    });
  });

  it('provides retry functionality for failed requests', async () => {
    const mockError = new Error('Network Error');
    gameAPI.getPlayerStatistics.mockRejectedValue(mockError);

    render(
      <StatisticsDashboard
        playerName={mockPlayerName}
        isVisible={true}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Network Error')).toBeInTheDocument();
    });

    const retryButton = screen.getByText('Retry');
    fireEvent.click(retryButton);

    expect(gameAPI.getPlayerStatistics).toHaveBeenCalledTimes(2);
  });
}); 