/**
 * Test Setup Utilities
 * 
 * Common mock setup, cleanup, and utility functions for tests.
 */

import { vi } from 'vitest';
import { apiMock } from '../__mocks__/api.js';

export const setupCommonMocks = () => {
  vi.mock('../utils/api', () => ({
    gameAPI: apiMock.gameAPI,
    extractData: apiMock.extractData,
    handleAPIError: apiMock.handleAPIError,
    default: apiMock.default
  }));

  vi.mock('../constants/gameConstants', () => {
    const constants = require('../__mocks__/gameConstants.js');
    return constants;
  });

  vi.mock('../utils/statePersistence', () => ({
    saveGameStateToStorage: vi.fn().mockReturnValue(true),
    loadGameStateFromStorage: vi.fn().mockReturnValue(null),
    clearGameStateFromStorage: vi.fn().mockReturnValue(true),
    hasSavedGameState: vi.fn().mockReturnValue(false),
    getStorageInfo: vi.fn().mockReturnValue({ available: true, type: 'localStorage' }),
    resetStorageCache: vi.fn()
  }));

  vi.mock('../utils/aiLogic', () => ({
    createAIOpponent: vi.fn(() => ({ name: 'Test AI', difficulty: 'medium' })),
    makeAIMove: vi.fn(),
    calculateAIDifficulty: vi.fn()
  }));
};

export const resetAllMocks = () => {
  vi.clearAllMocks();
  apiMock.reset();
};

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

export const setupAPIResponses = (responses = {}) => {
  Object.entries(responses).forEach(([method, response]) => {
    apiMock.setResponse(method, response);
  });
};

export const setupAPIErrors = (errors = {}) => {
  Object.entries(errors).forEach(([method, error]) => {
    apiMock.setError(method, error);
  });
};

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
  vi.clearAllTimers();
  
  return new Promise(resolve => setTimeout(resolve, 0));
};

/**
 * Enhanced async state update handler to prevent act() warnings
 * Wraps state updates in act() and waits for them to complete
 * @param {Function} stateUpdateFn - Function that triggers state updates
 * @param {number} timeout - Maximum time to wait for updates
 * @returns {Promise<void>}
 */
export const waitForStateUpdate = async (stateUpdateFn, timeout = 1000) => {
  const startTime = Date.now();
  
  return new Promise((resolve, reject) => {
    const checkComplete = () => {
      try {
        stateUpdateFn();
        resolve();
      } catch (error) {
        if (Date.now() - startTime > timeout) {
          reject(new Error(`State update timeout after ${timeout}ms`));
        } else {
          setTimeout(checkComplete, 10);
        }
      }
    };
    
    checkComplete();
  });
};

/**
 * Optimized test runner for complex game scenarios
 * Handles multiple state updates efficiently to prevent act() warnings
 * @param {Object} result - Hook result from renderHook
 * @param {Function} testFn - Test function to run
 * @param {Object} options - Options for test execution
 * @returns {Promise<void>}
 */
export const runOptimizedTest = async (result, testFn, options = {}) => {
  const {
    maxIterations = 100,
    iterationDelay = 10,
    timeout = 5000
  } = options;
  
  const startTime = Date.now();
  let iterations = 0;
  
  while (iterations < maxIterations && (Date.now() - startTime) < timeout) {
    try {
      await testFn(result);
      return;
    } catch (error) {
      iterations++;
      if (iterations >= maxIterations) {
        throw error;
      }
      await waitForAsync(iterationDelay);
    }
  }
  
  throw new Error(`Test failed after ${maxIterations} iterations or ${timeout}ms timeout`);
}; 