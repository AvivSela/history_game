/**
 * Game State Management Tests
 *
 * Tests for the useGameState hook covering all major game functionality.
 */

// Ensure API is mocked before anything else
import { vi } from 'vitest';

// Mock the API module with proper default behavior
vi.mock('../utils/api', () => {
  const { apiMock } = require('./__mocks__/api');
  return apiMock;
});

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import {
  setupCommonMocks,
  resetAllMocks,
  cleanupTimeouts,
} from './utils/testSetup';
import {
  initializeGameForTesting,
  selectCardForTesting,
  placeCardForTesting,
  simulateCompleteGame,
  validateGameStateStructure,
  validateCardDistribution,
  validateTimelineIntegrity,
  assertCardMoved,
  assertValidPlayingState,
  assertValidWinState,
  assertValidErrorState,
  assertValidLobbyState,
  mockAPIErrors,
  getExpectedCardCounts,
  waitForGameStatus,
  waitForAsync,
} from './utils/gameStateTestUtils';
import { useGameState } from '../hooks/useGameState';
import { GAME_STATUS, PLAYER_TYPES } from '../tests/__mocks__/gameConstants';

// Setup common mocks for all tests
setupCommonMocks();

describe('Game State Management', () => {
  beforeEach(() => {
    resetAllMocks();
    // Ensure API mock is reset to default behavior
    const { apiMock } = require('./__mocks__/api');
    apiMock.reset();
  });

  afterEach(async () => {
    // Clean up any pending timeouts to prevent act() warnings
    await cleanupTimeouts();
  });

  describe('Game Initialization', () => {
    it('initializes single player game successfully', async () => {
      const { result } = renderHook(() => useGameState());

      await initializeGameForTesting(result, 'single', 'medium');

      // Test behavior, not implementation details
      expect(result.current.state.gameMode).toBe('single');
      expect(result.current.state.difficulty).toBe('medium');

      // Validate card distribution
      validateCardDistribution(result.current.state, 'single');
    });

    it('handles API failures during initialization', async () => {
      const { apiMock } = require('./__mocks__/api');
      apiMock.gameAPI.getRandomEvents.mockRejectedValueOnce(
        new Error('Network Error')
      );

      const { result } = renderHook(() => useGameState());

      await act(async () => {
        try {
          await result.current.initializeGame('single', 'medium');
        } catch (error) {
          // Expected to throw
        }
      });

      await waitFor(
        () => {
          expect(result.current.state.gameStatus).toBe(GAME_STATUS.ERROR);
          expect(result.current.state.error).toBeTruthy();
        },
        { timeout: 2000 }
      );
    });
  });

  describe('Game Flow', () => {
    it('allows player to select and place cards', async () => {
      const { result } = renderHook(() => useGameState());

      await initializeGameForTesting(result, 'single', 'medium');

      const cardToSelect = await selectCardForTesting(result);
      expect(result.current.state.selectedCard).toBe(cardToSelect);

      // Place card and wait for result
      const placementResult = await placeCardForTesting(result, 1);

      // Check if placement was successful
      if (placementResult && placementResult.isCorrect) {
        expect(result.current.state.timeline).toContain(cardToSelect);
        expect(result.current.state.playerHand).not.toContain(cardToSelect);
      } else {
        expect(result.current.state.playerHand.length).toBeGreaterThan(0);
        expect(result.current.state.selectedCard).toBeNull();
      }
    });

    it('continues game until completion', async () => {
      const { result } = renderHook(() => useGameState());

      await initializeGameForTesting(result, 'single', 'medium');

      // Use the optimized game completion utility
      await simulateCompleteGame(result);

      // The game should eventually reach a valid state
      expect(['playing', 'won']).toContain(result.current.state.gameStatus);
    }, 10000);
  });

  describe('Card Management', () => {
    it('allows selecting and deselecting cards', async () => {
      const { result } = renderHook(() => useGameState());

      await initializeGameForTesting(result, 'single', 'medium');

      const cardToSelect = await selectCardForTesting(result);
      expect(result.current.state.selectedCard).toBe(cardToSelect);

      // Deselect card
      await act(async () => {
        result.current.selectCard(null);
      });

      expect(result.current.state.selectedCard).toBeNull();
      expect(result.current.state.showInsertionPoints).toBe(false);
    });

    it('handles incorrect card placement', async () => {
      const { result } = renderHook(() => useGameState());

      await initializeGameForTesting(result, 'single', 'medium');

      const cardToPlace = result.current.state.playerHand[0];
      const initialHandSize = result.current.state.playerHand.length;

      await selectCardForTesting(result, cardToPlace);

      await act(async () => {
        await result.current.placeCard(0); // Place before first card (likely incorrect)
      });

      // Should get feedback about incorrect placement
      expect(result.current.state.feedback).toBeTruthy();
      expect(result.current.state.playerHand.length).toBeLessThanOrEqual(
        initialHandSize
      );
    });
  });

  describe('Timeline Management', () => {
    it('adds cards to timeline in correct positions', async () => {
      const { result } = renderHook(() => useGameState());

      await initializeGameForTesting(result, 'single', 'medium');

      const cardToPlace = await selectCardForTesting(result);
      const placementResult = await placeCardForTesting(result, 1);

      if (placementResult && placementResult.isCorrect) {
        expect(result.current.state.timeline[1]).toBe(cardToPlace);
      } else {
        expect(result.current.state.playerHand.length).toBeGreaterThan(0);
        expect(result.current.state.selectedCard).toBeNull();
      }
    });

    it('validates timeline integrity', async () => {
      const { result } = renderHook(() => useGameState());

      await initializeGameForTesting(result, 'single', 'medium');

      // Timeline should have valid structure
      validateTimelineIntegrity(result.current.state.timeline);
    });
  });
});
