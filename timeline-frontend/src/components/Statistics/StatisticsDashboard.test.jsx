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
    getGlobalLeaderboard: vi.fn(),
    getLeaderboardSummary: vi.fn(),
    getAnalyticsOverview: vi.fn(),
  },
  extractData: vi.fn((response) => response.data),
  handleAPIError: vi.fn((error) => error.message),
}));

describe('StatisticsDashboard', () => {
  const mockPlayerName = 'TestPlayer';
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
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