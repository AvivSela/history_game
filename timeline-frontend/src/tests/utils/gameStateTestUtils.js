/**
 * Game State Test Utilities
 * 
 * Specialized utilities for testing game state management
 * that provide stable, reusable test helpers.
 */

import { act, waitFor } from '@testing-library/react';
import { GAME_STATUS, PLAYER_TYPES, CARD_COUNTS, POOL_CARD_COUNT } from '../__mocks__/gameConstants';

/**
 * Initialize a game state for testing
 * @param {string} mode - Game mode ('single', 'ai', 'multiplayer')
 * @param {string} difficulty - Game difficulty ('easy', 'medium', 'hard')
 * @param {Object} result - Hook result from renderHook
 * @returns {Promise<void>}
 */
export const initializeGameForTesting = async (result, mode = 'single', difficulty = 'medium') => {
  await act(async () => {
    await result.current.initializeGame(mode, difficulty);
  });

  // Wait for initialization to complete
  await waitFor(() => {
    expect(result.current.state.gameStatus).toBe(GAME_STATUS.PLAYING);
  });
};

/**
 * Select a card for testing
 * @param {Object} result - Hook result from renderHook
 * @param {Object} card - Card to select (optional, uses first card if not provided)
 * @returns {Object} The selected card
 */
export const selectCardForTesting = (result, card = null) => {
  const cardToSelect = card || result.current.state.playerHand[0];
  
  act(() => {
    result.current.selectCard(cardToSelect);
  });

  return cardToSelect;
};

/**
 * Place a card for testing
 * @param {Object} result - Hook result from renderHook
 * @param {number} position - Position to place the card
 * @param {Object} card - Card to place (optional, uses selected card if not provided)
 */
export const placeCardForTesting = (result, position, card = null) => {
  const cardToPlace = card || result.current.state.selectedCard;
  
  if (!cardToPlace) {
    throw new Error('No card selected for placement');
  }

  act(() => {
    result.current.placeCard(position);
  });
};

/**
 * Complete a full game by placing all cards
 * @param {Object} result - Hook result from renderHook
 * @returns {Promise<void>}
 */
export const completeGameForTesting = async (result) => {
  const initialHandSize = result.current.state.playerHand.length;
  
  for (let i = 0; i < initialHandSize; i++) {
    const card = result.current.state.playerHand[0];
    selectCardForTesting(result, card);
    placeCardForTesting(result, 1); // Place after first timeline card
  }

  // Wait for game completion - the actual implementation sets status to 'won'
  await waitFor(() => {
    expect(result.current.state.gameStatus).toBe(GAME_STATUS.WON);
  });
};

/**
 * Get expected card counts for a game mode
 * @param {string} mode - Game mode
 * @returns {Object} Expected card counts
 */
export const getExpectedCardCounts = (mode = 'single') => {
  const baseCount = mode === 'ai' ? CARD_COUNTS.AI : CARD_COUNTS.SINGLE;
  
  return {
    timeline: 1, // Always starts with 1 card
    playerHand: baseCount - 1, // Remaining cards
    cardPool: POOL_CARD_COUNT,
    total: baseCount + POOL_CARD_COUNT
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
  expect(state).toHaveProperty('currentPlayer');
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
  
  const totalCards = state.timeline.length + state.playerHand.length + state.cardPool.length;
  expect(totalCards).toBe(expected.total);
};

/**
 * Validate timeline integrity
 * @param {Array} timeline - Timeline array to validate
 */
export const validateTimelineIntegrity = (timeline) => {
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
    await waitFor(() => {
      expect(result.current.state.gameStatus).toBe(expectedState);
    });
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
      { id: 'timeline-1', title: 'Event 1', dateOccurred: '1950-01-01', category: 'History' }
    ],
    playerHand: [
      { id: 'player-1', title: 'Player Event 1', dateOccurred: '1960-01-01', category: 'History' },
      { id: 'player-2', title: 'Player Event 2', dateOccurred: '1970-01-01', category: 'History' }
    ],
    cardPool: [
      { id: 'pool-1', title: 'Pool Event 1', dateOccurred: '1990-01-01', category: 'History' }
    ],
    gameStatus: GAME_STATUS.PLAYING,
    currentPlayer: PLAYER_TYPES.HUMAN,
    gameMode: 'single',
    difficulty: 'medium',
    selectedCard: null,
    showInsertionPoints: false,
    feedback: null,
    isLoading: false,
    error: null,
    score: { human: 0, ai: 0 },
    attempts: {},
    startTime: Date.now(),
    turnStartTime: Date.now()
  };

  return { ...baseState, ...overrides };
};

/**
 * Wait for async operations to complete
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>}
 */
export const waitForAsync = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Mock API responses for specific test scenarios
 * @param {Object} responses - API responses to mock
 */
export const mockAPIResponses = async (responses) => {
  const { apiMock } = await import('../__mocks__/api');
  
  Object.entries(responses).forEach(([method, response]) => {
    apiMock.setResponse(method, response);
  });
};

/**
 * Mock API errors for testing error scenarios
 * @param {Object} errors - API errors to mock
 */
export const mockAPIErrors = async (errors) => {
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
export const assertValidPlayingState = (state) => {
  expect(state.gameStatus).toBe(GAME_STATUS.PLAYING);
  expect(state.isLoading).toBe(false);
  expect(state.error).toBeNull();
  expect(state.currentPlayer).toBe(PLAYER_TYPES.HUMAN);
  expect(state.playerHand.length).toBeGreaterThan(0);
  expect(state.timeline.length).toBeGreaterThan(0);
};

/**
 * Assert that game state is in a valid win state
 * @param {Object} state - Game state to validate
 */
export const assertValidWinState = (state) => {
  expect(state.gameStatus).toBe(GAME_STATUS.WON);
  expect(state.playerHand.length).toBe(0);
  expect(state.isLoading).toBe(false);
  expect(state.error).toBeNull();
};

/**
 * Assert that game state is in a valid error state
 * @param {Object} state - Game state to validate
 */
export const assertValidErrorState = (state) => {
  expect(state.gameStatus).toBe(GAME_STATUS.ERROR);
  expect(state.error).toBeTruthy();
  expect(state.isLoading).toBe(false);
};

/**
 * Assert that game state is in lobby state
 * @param {Object} state - Game state to validate
 */
export const assertValidLobbyState = (state) => {
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
export const waitForGameStatus = async (result, expectedStatus, timeout = 5000) => {
  await waitFor(() => {
    expect(result.current.state.gameStatus).toBe(expectedStatus);
  }, { timeout });
};

/**
 * Simulate placing all cards to complete the game
 * Note: Due to card replacement mechanics, this may take multiple attempts
 * @param {Object} result - Hook result from renderHook
 * @returns {Promise<void>}
 */
export const simulateCompleteGame = async (result) => {
  const initialHandSize = result.current.state.playerHand.length;
  let attempts = 0;
  const maxAttempts = initialHandSize * 5; // Allow for multiple incorrect placements
  
  // Continue placing cards until hand is empty or max attempts reached
  while (result.current.state.playerHand.length > 0 && attempts < maxAttempts) {
    const card = result.current.state.playerHand[0];
    
    // Select the card
    act(() => {
      result.current.selectCard(card);
    });
    
    // Try different positions to find the correct one
    const positions = [1, 0, 2, 3, 4];
    let placed = false;
    
    for (const position of positions) {
      if (position < result.current.state.timeline.length + 1) {
        await act(async () => {
          const placementResult = await result.current.placeCard(position);
          if (placementResult && placementResult.isCorrect) {
            placed = true;
          }
        });
        
        // Wait a bit for state updates
        await waitForAsync(100);
        
        if (placed) break;
      }
    }
    
    attempts++;
  }
  
  // The game should eventually reach a win state or continue with replacements
  // We don't strictly require WON state due to card replacement mechanics
  console.log(`Game simulation completed after ${attempts} attempts`);
}; 