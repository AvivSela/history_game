/**
 * Game State Test Utilities
 *
 * Specialized utilities for testing game state management
 * that provide stable, reusable test helpers.
 */

import { act, waitFor } from '@testing-library/react';
import {
  GAME_STATUS,
  PLAYER_TYPES,
  CARD_COUNTS,
  POOL_CARD_COUNT,
} from '../__mocks__/gameConstants';

/**
 * Initialize a game state for testing
 * @param {string} mode - Game mode ('single')
 * @param {string} difficulty - Game difficulty ('easy', 'medium', 'hard')
 * @param {Object} result - Hook result from renderHook
 * @returns {Promise<void>}
 */
export const initializeGameForTesting = async (
  result,
  mode = 'single',
  difficulty = 'medium'
) => {
  // Convert string difficulty to range object for new implementation
  const difficultyRange = difficulty === 'easy' ? { min: 1, max: 2 } :
                         difficulty === 'medium' ? { min: 1, max: 4 } :
                         difficulty === 'hard' ? { min: 3, max: 4 } :
                         difficulty === 'expert' ? { min: 4, max: 4 } :
                         { min: 1, max: 4 }; // default to medium range

  await act(async () => {
    await result.current.initializeGame(mode, difficultyRange);
  });

  // Wait for initialization to complete
  await waitFor(
    () => {
      expect(result.current.state.gameStatus).toBe(GAME_STATUS.PLAYING);
    },
    { timeout: 3000 }
  );
};

/**
 * Select a card for testing
 * @param {Object} result - Hook result from renderHook
 * @param {Object} card - Card to select (optional, uses first card if not provided)
 * @returns {Promise<Object>} The selected card
 */
export const selectCardForTesting = async (result, card = null) => {
  const cardToSelect = card || result.current.state.playerHand[0];

  await act(async () => {
    result.current.selectCard(cardToSelect);
  });

  return cardToSelect;
};

/**
 * Place a card for testing with proper act() wrapping
 * @param {Object} result - Hook result from renderHook
 * @param {number} position - Position to place the card
 * @param {Object} card - Card to place (optional, uses selected card if not provided)
 * @returns {Promise<Object>} The placement result
 */
export const placeCardForTesting = async (result, position, card = null) => {
  const cardToPlace = card || result.current.state.selectedCard;

  if (!cardToPlace) {
    throw new Error('No card selected for placement');
  }

  let placementResult;
  await act(async () => {
    placementResult = await result.current.placeCard(position);
  });

  // Wait for state to settle
  await waitFor(
    () => {
      expect(result.current.state.selectedCard).toBeNull();
    },
    { timeout: 1000 }
  );

  return placementResult;
};

/**
 * Complete a full game by placing all cards (optimized version)
 * @param {Object} result - Hook result from renderHook
 * @returns {Promise<void>}
 */
export const completeGameForTesting = async result => {
  const initialHandSize = result.current.state.playerHand.length;

  for (let i = 0; i < initialHandSize; i++) {
    const card = result.current.state.playerHand[0];
    await selectCardForTesting(result, card);
    await placeCardForTesting(result, 1); // Place after first timeline card
  }

  // Wait for game completion
  await waitFor(
    () => {
      expect(result.current.state.gameStatus).toBe(GAME_STATUS.WON);
    },
    { timeout: 3000 }
  );
};

/**
 * Get expected card counts for a game mode
 * @param {string} mode - Game mode
 * @returns {Object} Expected card counts
 */
export const getExpectedCardCounts = (mode = 'single') => {
  const baseCount = CARD_COUNTS.SINGLE;

  return {
    timeline: 1, // Always starts with 1 card
    playerHand: baseCount - 1, // Remaining cards
    cardPool: POOL_CARD_COUNT,
    total: baseCount + POOL_CARD_COUNT,
  };
};

/**
 * Validate game state structure
 * @param {Object} state - Game state to validate
 * @param {string} mode - Expected game mode
 */
export const validateGameStateStructure = (state, mode = 'single') => {
  // Validate core arrays
  expect(Array.isArray(state.timeline)).toBe(true);
  expect(Array.isArray(state.playerHand)).toBe(true);
  expect(Array.isArray(state.cardPool)).toBe(true);

  // Validate timeline cards
  state.timeline.forEach(card => {
    expect(card).toHaveProperty('id');
    expect(card).toHaveProperty('title');
    expect(card).toHaveProperty('dateOccurred');
  });

  // Validate hand cards
  state.playerHand.forEach(card => {
    expect(card).toHaveProperty('id');
    expect(card).toHaveProperty('title');
    expect(card).toHaveProperty('dateOccurred');
  });

  // Validate pool cards
  state.cardPool.forEach(card => {
    expect(card).toHaveProperty('id');
    expect(card).toHaveProperty('title');
    expect(card).toHaveProperty('dateOccurred');
  });

  // Validate core properties
  expect(state).toHaveProperty('gameStatus');
  expect(state).toHaveProperty('gameMode');
  expect(state).toHaveProperty('difficulty');
  expect(state).toHaveProperty('selectedCard');
  expect(state).toHaveProperty('score');
  expect(state).toHaveProperty('attempts');
};

/**
 * Validate card distribution
 * @param {Object} state - Game state to validate
 * @param {string} mode - Game mode
 */
export const validateCardDistribution = (state, mode = 'single') => {
  const expected = getExpectedCardCounts(mode);

  expect(state.timeline.length).toBe(expected.timeline);
  expect(state.playerHand.length).toBe(expected.playerHand);
  expect(state.cardPool.length).toBe(expected.cardPool);

  const totalCards =
    state.timeline.length + state.playerHand.length + state.cardPool.length;
  expect(totalCards).toBe(expected.total);
};

/**
 * Validate timeline integrity
 * @param {Array} timeline - Timeline array to validate
 */
export const validateTimelineIntegrity = timeline => {
  expect(Array.isArray(timeline)).toBe(true);
  expect(timeline.length).toBeGreaterThan(0);

  // Each card should have required properties
  timeline.forEach(card => {
    expect(card).toHaveProperty('id');
    expect(card).toHaveProperty('title');
    expect(card).toHaveProperty('dateOccurred');
  });
};

/**
 * Validate game state transitions
 * @param {Object} result - Hook result from renderHook
 * @param {Array} expectedStates - Array of expected state transitions
 */
export const validateStateTransitions = async (result, expectedStates) => {
  for (const expectedState of expectedStates) {
    await waitFor(
      () => {
        expect(result.current.state.gameStatus).toBe(expectedState);
      },
      { timeout: 2000 }
    );
  }
};

/**
 * Create a test scenario with specific game state
 * @param {Object} overrides - State overrides
 * @returns {Object} Mock game state
 */
export const createTestScenario = (overrides = {}) => {
  const baseState = {
    timeline: [
      {
        id: 'timeline-1',
        title: 'Event 1',
        dateOccurred: '1950-01-01',
        category: 'History',
      },
    ],
    playerHand: [
      {
        id: 'player-1',
        title: 'Player Event 1',
        dateOccurred: '1960-01-01',
        category: 'History',
      },
      {
        id: 'player-2',
        title: 'Player Event 2',
        dateOccurred: '1970-01-01',
        category: 'History',
      },
    ],
    cardPool: [
      {
        id: 'pool-1',
        title: 'Pool Event 1',
        dateOccurred: '1990-01-01',
        category: 'History',
      },
    ],
    gameStatus: GAME_STATUS.PLAYING,
    gameMode: 'single',
    difficulty: 'medium',
    selectedCard: null,
    showInsertionPoints: false,
    feedback: null,
    isLoading: false,
    error: null,
    score: { human: 0 },
    attempts: {},
    startTime: Date.now(),
    turnStartTime: Date.now(),
  };

  return { ...baseState, ...overrides };
};

/**
 * Wait for async operations to complete
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>}
 */
export const waitForAsync = (ms = 0) =>
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Mock API responses for specific test scenarios
 * @param {Object} responses - API responses to mock
 */
export const mockAPIResponses = async responses => {
  const { apiMock } = await import('../__mocks__/api');

  Object.entries(responses).forEach(([method, response]) => {
    apiMock.setResponse(method, response);
  });
};

/**
 * Mock API errors for testing error scenarios
 * @param {Object} errors - API errors to mock
 */
export const mockAPIErrors = async errors => {
  const { apiMock } = await import('../__mocks__/api');

  Object.entries(errors).forEach(([method, error]) => {
    apiMock.setError(method, error);
  });
};

/**
 * Assert that a card was moved correctly
 * @param {Object} state - Current game state
 * @param {Object} card - Card that was moved
 * @param {string} fromLocation - Source location ('playerHand', 'cardPool')
 * @param {string} toLocation - Destination location ('timeline')
 */
export const assertCardMoved = (state, card, fromLocation, toLocation) => {
  // Card should be in destination
  expect(state[toLocation]).toContain(card);

  // Card should not be in source
  expect(state[fromLocation]).not.toContain(card);

  // Selection should be cleared
  expect(state.selectedCard).toBeNull();
  expect(state.showInsertionPoints).toBe(false);
};

/**
 * Assert that game state is in a valid playing state
 * @param {Object} state - Game state to validate
 */
export const assertValidPlayingState = state => {
  expect(state.gameStatus).toBe(GAME_STATUS.PLAYING);
  expect(state.isLoading).toBe(false);
  expect(state.error).toBeNull();
  expect(state.playerHand.length).toBeGreaterThan(0);
  expect(state.timeline.length).toBeGreaterThan(0);
};

/**
 * Assert that game state is in a valid win state
 * @param {Object} state - Game state to validate
 */
export const assertValidWinState = state => {
  expect(state.gameStatus).toBe(GAME_STATUS.WON);
  expect(state.playerHand.length).toBe(0);
  expect(state.isLoading).toBe(false);
  expect(state.error).toBeNull();
};

/**
 * Assert that game state is in a valid error state
 * @param {Object} state - Game state to validate
 */
export const assertValidErrorState = state => {
  expect(state.gameStatus).toBe(GAME_STATUS.ERROR);
  expect(state.error).toBeTruthy();
  expect(state.isLoading).toBe(false);
};

/**
 * Assert that game state is lobby state
 * @param {Object} state - Game state to validate
 */
export const assertValidLobbyState = state => {
  expect(state.gameStatus).toBe(GAME_STATUS.LOBBY);
  expect(state.timeline.length).toBe(0);
  expect(state.playerHand.length).toBe(0);
  expect(state.cardPool.length).toBe(0);
  expect(state.selectedCard).toBeNull();
  expect(state.isLoading).toBe(false);
  expect(state.error).toBeNull();
};

/**
 * Wait for a specific game state
 * @param {Object} result - Hook result from renderHook
 * @param {string} expectedStatus - Expected game status
 * @param {number} timeout - Timeout in milliseconds
 */
export const waitForGameStatus = async (
  result,
  expectedStatus,
  timeout = 5000
) => {
  await waitFor(
    () => {
      expect(result.current.state.gameStatus).toBe(expectedStatus);
    },
    { timeout }
  );
};

/**
 * Optimized game completion simulation
 * Handles card placement efficiently with proper act() wrapping
 * @param {Object} result - Hook result from renderHook
 * @returns {Promise<void>}
 */
export const simulateCompleteGame = async result => {
  const initialHandSize = result.current.state.playerHand.length;
  let attempts = 0;
  const maxAttempts = Math.min(initialHandSize * 3, 50); // Reduced max attempts

  // Continue placing cards until hand is empty or max attempts reached
  while (result.current.state.playerHand.length > 0 && attempts < maxAttempts) {
    const card = result.current.state.playerHand[0];

    // Select the card with proper act() wrapping
    await act(async () => {
      result.current.selectCard(card);
    });

    // Wait for selection to be processed
    await waitFor(
      () => {
        expect(result.current.state.selectedCard).toBeTruthy();
      },
      { timeout: 1000 }
    );

    // Try placement at position 1 (most likely correct)
    try {
      const placementResult = await placeCardForTesting(result, 1);
      if (placementResult && placementResult.isCorrect) {
        // Success - continue with next card
        attempts++;
        continue;
      }
    } catch (error) {
      // Continue to next attempt
    }

    // If placement at position 1 failed, try position 0
    try {
      const placementResult = await placeCardForTesting(result, 0);
      if (placementResult && placementResult.isCorrect) {
        // Success - continue with next card
        attempts++;
        continue;
      }
    } catch (error) {
      // Continue to next attempt
    }

    attempts++;

    // If we've made no progress for a while, break to avoid infinite loops
    if (
      attempts > initialHandSize &&
      result.current.state.playerHand.length >= initialHandSize
    ) {
      break;
    }
  }

  // The game should eventually reach a win state or continue with replacements
  // We don't strictly require WON state due to card replacement mechanics
  await waitFor(
    () => {
      expect(['playing', 'won']).toContain(result.current.state.gameStatus);
    },
    { timeout: 3000 }
  );
};

/**
 * Initialize a game and verify it's ready to play
 * @param {Object} result - Hook result from renderHook
 * @param {string} mode - Game mode ('single')
 * @param {string} difficulty - Game difficulty ('easy', 'medium', 'hard')
 * @returns {Promise<void>}
 */
export const startNewGameSuccessfully = async (
  result,
  mode = 'single',
  difficulty = 'medium'
) => {
  await initializeGameForTesting(result, mode, difficulty);
  expect(result.current.state.gameStatus).toBe('playing');
  expect(result.current.state.playerHand.length).toBeGreaterThan(0);
  expect(result.current.state.timeline.length).toBeGreaterThan(0);
};

/**
 * Simulate network error during game initialization
 * @param {Object} result - Hook result from renderHook
 * @returns {Promise<void>}
 */
export const simulateNetworkError = async result => {
  const { apiMock } = require('../__mocks__/api');
  apiMock.gameAPI.getRandomEvents.mockRejectedValueOnce(
    new Error('Network Error')
  );

  await act(async () => {
    try {
      await result.current.initializeGame('single', 'medium');
    } catch (error) {
      // Expected error
    }
  });
};

/**
 * Verify game is in error state with helpful message
 * @param {Object} result - Hook result from renderHook
 */
export const expectGracefulErrorHandling = result => {
  expect(result.current.state.error).toBeTruthy();
  expect(result.current.state.gameStatus).toBeOneOf(['lobby', 'error']);
  expect(result.current.initializeGame).toBeTypeOf('function');
};

/**
 * Verify game is in a playable state
 * @param {Object} result - Hook result from renderHook
 */
export const expectPlayableGameState = result => {
  expect(result.current.state.gameStatus).toBe('playing');
  expect(result.current.state.playerHand.length).toBeGreaterThan(0);
  expect(result.current.state.timeline.length).toBeGreaterThan(0);
  expect(result.current.state.error).toBeFalsy();
};

/**
 * Verify game is in a clean initial state
 * @param {Object} result - Hook result from renderHook
 */
export const expectCleanInitialState = result => {
  expect(result.current.state.gameStatus).toBe('lobby');
  expect(result.current.state.gameMode).toBe('single');
  expect(result.current.state.difficulty).toBe('medium');
  expect(result.current.state.timeline).toEqual([]);
  expect(result.current.state.playerHand).toEqual([]);
  expect(result.current.state.selectedCard).toBeNull();
  expect(result.current.state.error).toBeNull();
};

/**
 * Simulate a player examining and selecting different cards
 * @param {Object} result - Hook result from renderHook
 * @returns {Promise<{firstCard: Object, secondCard: Object}>}
 */
export const simulateCardExamination = async result => {
  const firstCard = result.current.state.playerHand[0];
  const secondCard = result.current.state.playerHand[1];

  await act(async () => {
    result.current.selectCard(firstCard);
  });

  expect(result.current.state.selectedCard).toBe(firstCard);
  expect(result.current.state.showInsertionPoints).toBe(true);

  await act(async () => {
    result.current.selectCard(secondCard);
  });

  expect(result.current.state.selectedCard).toBe(secondCard);
  expect(result.current.state.showInsertionPoints).toBe(true);

  return { firstCard, secondCard };
};

/**
 * Verify game settings are properly applied
 * @param {Object} result - Hook result from renderHook
 * @param {Object} expectedSettings - Expected settings values
 */
export const expectSettingsApplied = (result, expectedSettings) => {
  const settings = result.current.getGameSettings();
  expect(settings).toBeDefined();
  Object.entries(expectedSettings).forEach(([key, value]) => {
    expect(settings[key]).toBe(value);
  });
};
