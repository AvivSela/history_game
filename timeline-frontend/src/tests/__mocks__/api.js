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
      getRandomEvents: vi.fn().mockImplementation((count = 5) => {
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
