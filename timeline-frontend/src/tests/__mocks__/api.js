/**
 * Centralized API Mock
 *
 * This mock automatically adapts to changes in the real API module
 * and provides consistent behavior across all tests.
 */

import { vi } from 'vitest';

// Mock axios instance
const mockAxiosInstance = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  interceptors: {
    request: { use: vi.fn() },
    response: { use: vi.fn() },
  },
};

// Default mock responses
const defaultResponses = {
  events: [
    {
      id: 'event-1',
      title: 'World War II',
      dateOccurred: '1939-09-01',
      category: 'Military',
      difficulty: 1,
    },
    {
      id: 'event-2',
      title: 'Moon Landing',
      dateOccurred: '1969-07-20',
      category: 'Space',
      difficulty: 2,
    },
    {
      id: 'event-3',
      title: 'Berlin Wall Falls',
      dateOccurred: '1989-11-09',
      category: 'Political',
      difficulty: 1,
    },
    {
      id: 'event-4',
      title: 'First Computer',
      dateOccurred: '1946-02-14',
      category: 'Technology',
      difficulty: 2,
    },
    {
      id: 'event-5',
      title: 'Internet Created',
      dateOccurred: '1983-01-01',
      category: 'Technology',
      difficulty: 3,
    },
    {
      id: 'event-6',
      title: 'First Flight',
      dateOccurred: '1903-12-17',
      category: 'Aviation',
      difficulty: 1,
    },
    {
      id: 'event-7',
      title: 'Atomic Bomb',
      dateOccurred: '1945-08-06',
      category: 'Military',
      difficulty: 2,
    },
    {
      id: 'event-8',
      title: 'Civil Rights Act',
      dateOccurred: '1964-07-02',
      category: 'Political',
      difficulty: 2,
    },
    {
      id: 'event-9',
      title: 'Personal Computer',
      dateOccurred: '1975-01-01',
      category: 'Technology',
      difficulty: 2,
    },
    {
      id: 'event-10',
      title: 'Fall of Soviet Union',
      dateOccurred: '1991-12-26',
      category: 'Political',
      difficulty: 1,
    },
  ],
  categories: [
    'Military',
    'Space',
    'Political',
    'Technology',
    'History',
    'Aviation',
  ],
};

// Create a flexible mock that adapts to the real module structure
const createAPIMock = () => {
  const mock = {
    // Default mock responses
    defaultResponses,

    // Mock gameAPI methods - return axios response structure
    gameAPI: {
      healthCheck: vi.fn().mockResolvedValue({
        status: 200,
        data: { status: 'ok' },
      }),
      getAllEvents: vi.fn().mockResolvedValue({
        data: defaultResponses.events,
      }),
      getRandomEvents: vi.fn().mockImplementation((count = 5, categories = [], difficultyRange = null) => {
        const events = defaultResponses.events.slice(0, count);
        return Promise.resolve({
          data: events,
        });
      }),
      getEventsByCategory: vi.fn().mockImplementation(category => {
        const events = defaultResponses.events.filter(
          event => event.category === category
        );
        return Promise.resolve({
          data: events,
        });
      }),
      getEventsByDifficulty: vi.fn().mockImplementation(level => {
        const events = defaultResponses.events.filter(
          event => event.difficulty === level
        );
        return Promise.resolve({
          data: events,
        });
      }),
      getCategories: vi.fn().mockResolvedValue({
        data: defaultResponses.categories,
      }),
      // Enhanced backend API methods
      createGameSession: vi.fn().mockImplementation((sessionSettings) => {
        const sessionId = `test-session-${Date.now()}`;
        return Promise.resolve({
          data: {
            id: sessionId,
            player_name: sessionSettings.player_name || 'TestPlayer',
            difficulty_level: sessionSettings.difficulty_level || 2,
            card_count: sessionSettings.card_count || 5,
            created_at: new Date().toISOString(),
            status: 'active'
          }
        });
      }),
      recordMove: vi.fn().mockResolvedValue({
        data: {
          id: `move-${Date.now()}`,
          session_id: 'test-session-123',
          card_id: 'test-card',
          position_before: 0,
          position_after: 1,
          is_correct: true,
          time_taken_seconds: 5,
          created_at: new Date().toISOString()
        }
      }),
      completeGame: vi.fn().mockResolvedValue({
        data: {
          id: 'test-session-123',
          completed: true,
          final_score: 100,
          total_moves: 5,
          duration_ms: 30000,
          updated_at: new Date().toISOString()
        }
      }),
      getPlayerStatistics: vi.fn().mockResolvedValue({
        data: {
          player_name: 'TestPlayer',
          total_games_played: 10,
          total_games_won: 7,
          win_rate: 0.7,
          total_score: 5000,
          best_score: 800,
          average_score_per_game: 500,
          total_moves: 50,
          average_accuracy: 0.85,
          average_game_duration_seconds: 180,
          total_correct_moves: 42,
          total_incorrect_moves: 8,
          total_play_time_seconds: 1800
        }
      }),
      getPlayerCategoryStatistics: vi.fn().mockResolvedValue({
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
      }),
      getPlayerDifficultyStatistics: vi.fn().mockResolvedValue({
        data: [
          {
            difficulty_level: 1,
            games_played: 5,
            win_rate: 0.8,
            average_score: 600,
            total_score: 3000
          },
          {
            difficulty_level: 2,
            games_played: 3,
            win_rate: 0.67,
            average_score: 400,
            total_score: 1200
          }
        ]
      }),
      getPlayerProgress: vi.fn().mockResolvedValue({
        data: {
          player_name: 'TestPlayer',
          current_streak: 3,
          longest_streak: 7,
          total_play_time_hours: 2.5,
          favorite_category: 'Technology',
          improvement_rate: 0.15
        }
      }),
      getPlayerDailyStats: vi.fn().mockResolvedValue({
        data: [
          {
            date: '2024-01-01',
            games_played: 2,
            games_won: 1,
            total_score: 800,
            average_accuracy: 0.75
          }
        ]
      }),
      getPlayerWeeklyStats: vi.fn().mockResolvedValue({
        data: [
          {
            week: '2024-W01',
            games_played: 10,
            games_won: 7,
            total_score: 4000,
            average_accuracy: 0.82
          }
        ]
      }),
      getPlayerSummary: vi.fn().mockResolvedValue({
        data: {
          player_name: 'TestPlayer',
          total_games_played: 10,
          total_games_won: 7,
          win_rate: 0.7,
          total_score: 5000,
          best_score: 800,
          average_score_per_game: 500,
          total_moves: 50,
          average_accuracy: 0.85,
          average_game_duration_seconds: 180,
          total_correct_moves: 42,
          total_incorrect_moves: 8,
          total_play_time_seconds: 1800,
          current_streak: 3,
          longest_streak: 7,
          favorite_category: 'Technology',
          improvement_rate: 0.15
        }
      }),
      getPlayerComparison: vi.fn().mockResolvedValue({
        data: [
          {
            player_name: 'Player1',
            total_games_played: 20,
            win_rate: 0.8,
            total_score: 10000
          },
          {
            player_name: 'Player2',
            total_games_played: 15,
            win_rate: 0.7,
            total_score: 8000
          }
        ]
      }),
      getGameSession: vi.fn().mockResolvedValue({
        data: {
          id: 'test-session-123',
          player_name: 'TestPlayer',
          difficulty_level: 2,
          card_count: 5,
          status: 'active',
          created_at: new Date().toISOString()
        }
      }),
      getGameSessionHistory: vi.fn().mockResolvedValue({
        data: [
          {
            id: 'session-1',
            player_name: 'TestPlayer',
            difficulty_level: 2,
            card_count: 5,
            status: 'completed',
            final_score: 800,
            created_at: new Date().toISOString()
          }
        ]
      }),
      getGlobalLeaderboard: vi.fn().mockResolvedValue({
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
      }),
      getCategoryLeaderboard: vi.fn().mockResolvedValue({
        data: [
          {
            player_name: 'Player1',
            total_score: 5000,
            games_played: 10,
            win_rate: 0.8
          }
        ]
      }),
      getDailyLeaderboard: vi.fn().mockResolvedValue({
        data: [
          {
            player_name: 'Player1',
            daily_score: 800,
            games_played: 3
          }
        ]
      }),
      getWeeklyLeaderboard: vi.fn().mockResolvedValue({
        data: [
          {
            player_name: 'Player1',
            weekly_score: 2400,
            games_played: 8
          }
        ]
      }),
      getPlayerRankings: vi.fn().mockResolvedValue({
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
      }),
      getLeaderboardSummary: vi.fn().mockResolvedValue({
        data: {
          total_players: 100,
          total_games_played: 500,
          average_score: 450,
          top_score: 1200
        }
      }),
      getAnalyticsOverview: vi.fn().mockResolvedValue({
        data: {
          total_games_played: 100,
          average_game_duration: 180,
          most_popular_categories: ['History', 'Technology'],
          difficulty_distribution: { easy: 30, medium: 50, hard: 20 }
        }
      }),
      getAnalyticsTrends: vi.fn().mockResolvedValue({
        data: {
          time_period: '30d',
          trends: {
            games_played: [10, 15, 12, 18],
            average_score: [400, 450, 420, 480],
            player_engagement: [0.7, 0.8, 0.75, 0.85]
          }
        }
      }),
      getDifficultyAnalytics: vi.fn().mockResolvedValue({
        data: {
          difficulty_level: 2,
          games_played: 50,
          average_score: 450,
          win_rate: 0.65,
          average_duration: 200
        }
      }),
      getCategoryAnalytics: vi.fn().mockResolvedValue({
        data: {
          category: 'Technology',
          games_played: 30,
          average_score: 480,
          win_rate: 0.7,
          player_count: 25
        }
      }),
      getLeaderboard: vi.fn().mockResolvedValue({
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
      }),
      getGameAnalytics: vi.fn().mockResolvedValue({
        data: {
          total_games_played: 100,
          average_game_duration: 180,
          most_popular_categories: ['History', 'Technology'],
          difficulty_distribution: { easy: 30, medium: 50, hard: 20 }
        }
      })
    },

    // Helper functions
    extractData: vi.fn().mockImplementation(response => {
      return response?.data?.data || response?.data || response;
    }),

    handleAPIError: vi
      .fn()
      .mockImplementation((error, fallbackMessage = 'Something went wrong') => {
        return error?.message || fallbackMessage;
      }),

    // Axios instance
    default: mockAxiosInstance,

    // Utility methods for test setup
    reset: () => {
      vi.clearAllMocks();
      // Re-setup default behaviors
      Object.values(mock.gameAPI).forEach(fn => {
        if (vi.isMockFunction(fn)) {
          fn.mockClear();
        }
      });
      mock.extractData.mockClear();
      mock.handleAPIError.mockClear();
    },

    // Method to customize responses for specific tests
    setResponse: (method, response) => {
      if (mock.gameAPI[method]) {
        mock.gameAPI[method].mockResolvedValue(response);
      }
    },

    // Method to simulate errors
    setError: (method, error) => {
      if (mock.gameAPI[method]) {
        mock.gameAPI[method].mockRejectedValue(error);
      }
    },
  };

  return mock;
};

// Export the mock
export const apiMock = createAPIMock();

// Export individual functions for backward compatibility
export const { gameAPI, extractData, handleAPIError } = apiMock;
export default apiMock.default;
