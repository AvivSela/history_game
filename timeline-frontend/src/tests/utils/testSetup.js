/**
 * Test Setup Utilities
 * 
 * Provides common mock setup, cleanup, and utility functions
 * to make tests more robust and maintainable.
 */

import { vi } from 'vitest';
import { apiMock } from '../__mocks__/api.js';

/**
 * Setup common mocks for all tests
 */
export const setupCommonMocks = () => {
  // Mock API module with proper structure
  vi.mock('../utils/api', () => ({
    gameAPI: apiMock.gameAPI,
    extractData: apiMock.extractData,
    handleAPIError: apiMock.handleAPIError,
    default: apiMock.default
  }));

  // Mock game constants
  vi.mock('../constants/gameConstants', () => {
    const constants = require('../__mocks__/gameConstants.js');
    return constants;
  });

  // Mock state persistence
  vi.mock('../utils/statePersistence', () => ({
    saveGameStateToStorage: vi.fn().mockReturnValue(true),
    loadGameStateFromStorage: vi.fn().mockReturnValue(null),
    clearGameStateFromStorage: vi.fn().mockReturnValue(true),
    hasSavedGameState: vi.fn().mockReturnValue(false),
    getStorageInfo: vi.fn().mockReturnValue({ available: true, type: 'localStorage' }),
    resetStorageCache: vi.fn()
  }));

  // Mock AI logic
  vi.mock('../utils/aiLogic', () => ({
    createAIOpponent: vi.fn(() => ({ name: 'Test AI', difficulty: 'medium' })),
    makeAIMove: vi.fn(),
    calculateAIDifficulty: vi.fn()
  }));
};

/**
 * Reset all mocks to their default state
 */
export const resetAllMocks = () => {
  vi.clearAllMocks();
  apiMock.reset();
};

/**
 * Create a mock game state for testing
 */
export const createMockGameState = (overrides = {}) => {
  const defaultState = {
    timeline: [
      { id: 'timeline-1', title: 'Event 1', dateOccurred: '1950-01-01', category: 'History' }
    ],
    playerHand: [
      { id: 'player-1', title: 'Player Event 1', dateOccurred: '1960-01-01', category: 'History' },
      { id: 'player-2', title: 'Player Event 2', dateOccurred: '1970-01-01', category: 'History' }
    ],
    aiHand: [
      { id: 'ai-1', title: 'AI Event 1', dateOccurred: '1980-01-01', category: 'History' }
    ],
    cardPool: [
      { id: 'pool-1', title: 'Pool Event 1', dateOccurred: '1990-01-01', category: 'History' }
    ],
    gameStatus: 'playing',
    currentPlayer: 'human',
    gameMode: 'single',
    difficulty: 'medium',
    score: 0,
    moves: 0,
    startTime: Date.now(),
    lastMoveTime: Date.now()
  };

  return { ...defaultState, ...overrides };
};

/**
 * Create mock events for testing
 */
export const createMockEvents = (count = 5) => {
  const events = [];
  for (let i = 0; i < count; i++) {
    events.push({
      id: `event-${i + 1}`,
      title: `Test Event ${i + 1}`,
      dateOccurred: `${1950 + i}-01-01`,
      category: 'History',
      difficulty: (i % 3) + 1
    });
  }
  return events;
};

/**
 * Setup API responses for specific test scenarios
 */
export const setupAPIResponses = (responses = {}) => {
  Object.entries(responses).forEach(([method, response]) => {
    apiMock.setResponse(method, response);
  });
};

/**
 * Setup API errors for testing error scenarios
 */
export const setupAPIErrors = (errors = {}) => {
  Object.entries(errors).forEach(([method, error]) => {
    apiMock.setError(method, error);
  });
};

/**
 * Wait for async operations to complete
 */
export const waitForAsync = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Mock console methods to avoid noise in tests
 */
export const mockConsole = () => {
  const originalConsole = { ...console };
  
  beforeAll(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    console.log = originalConsole.log;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
  });
};

/**
 * Clean up timeouts and prevent act() warnings
 * Call this in afterEach to ensure clean test state
 */
export const cleanupTimeouts = () => {
  // Clear all pending timeouts
  vi.clearAllTimers();
  
  // Wait for any pending state updates
  return new Promise(resolve => setTimeout(resolve, 0));
}; 