import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
// Place all vi.mock calls at the top
vi.mock('../utils/statePersistence');
vi.mock('../utils/api');
vi.mock('../utils/aiLogic');
vi.mock('../constants/gameConstants');

import { useGameState } from './useGameState';
import * as statePersistence from '../utils/statePersistence';
import * as api from '../utils/api';
import { setupCommonMocks, resetAllMocks, createMockGameState, createMockEvents } from '../tests/utils/testSetup';
import { apiMock } from '../tests/__mocks__/api';

// Setup common mocks
setupCommonMocks();

// Get mocked modules
const mockedStatePersistence = vi.mocked(statePersistence);
const mockedApi = vi.mocked(api);

describe('useGameState - State Persistence Integration', () => {
  beforeEach(() => {
    resetAllMocks();
    
    // Setup default API responses with proper structure
    mockedApi.gameAPI.getRandomEvents.mockResolvedValue({ 
      data: createMockEvents(5) 
    });
    mockedApi.extractData.mockImplementation((response) => {
      const result = response?.data?.data || response?.data || response;
      return result;
    });
    
    // Setup default persistence responses
    mockedStatePersistence.saveGameStateToStorage.mockReturnValue(true);
    mockedStatePersistence.loadGameStateFromStorage.mockReturnValue(null);
    mockedStatePersistence.clearGameStateFromStorage.mockReturnValue(true);
    mockedStatePersistence.hasSavedGameState.mockReturnValue(false);
  });

  afterEach(() => {
    // Clean up any saved state
    act(() => {
      mockedStatePersistence.clearGameStateFromStorage();
    });
  });

  describe('Game Initialization', () => {
    it('should clear saved state when initializing a new game', async () => {
      const { result } = renderHook(() => useGameState());

      await act(async () => {
        await result.current.initializeGame('single', 'medium');
      });

      expect(mockedStatePersistence.clearGameStateFromStorage).toHaveBeenCalled();
    });

    it('should load saved state on mount but not during new game initialization', async () => {
      const { result } = renderHook(() => useGameState());

      // Allow 1 call on mount (for checking saved state)
      expect(mockedStatePersistence.loadGameStateFromStorage).toHaveBeenCalledTimes(1);

      // Clear the call count
      mockedStatePersistence.loadGameStateFromStorage.mockClear();

      await act(async () => {
        await result.current.initializeGame('single', 'medium');
      });

      // Should not call loadGameStateFromStorage during new game initialization
      expect(mockedStatePersistence.loadGameStateFromStorage).not.toHaveBeenCalled();
    });

    it('should create unique card IDs and proper card distribution for new games', async () => {
      // Setup different mock data for main game and pool to ensure unique IDs
      const mainGameEvents = createMockEvents(5);
      const poolEvents = createMockEvents(5).map((event, index) => ({
        ...event,
        id: `pool-${index + 1}` // Ensure unique IDs for pool cards
      }));

      // Mock the API to return different data for main game and pool
      mockedApi.gameAPI.getRandomEvents
        .mockResolvedValueOnce({ data: mainGameEvents }) // First call for main game
        .mockResolvedValueOnce({ data: poolEvents });    // Second call for pool

      const { result } = renderHook(() => useGameState());

      await act(async () => {
        await result.current.initializeGame('single', 'medium');
      });

      const state = result.current.state;
      
      // Check card distribution: 1 on timeline, 4 in player hand, 5 in pool
      expect(state.timeline).toHaveLength(1);
      expect(state.playerHand).toHaveLength(4);
      expect(state.cardPool).toHaveLength(5);
      
      // Collect all card IDs
      const allCardIds = [
        ...state.timeline.map(card => card.id),
        ...state.playerHand.map(card => card.id),
        ...state.cardPool.map(card => card.id)
      ];

      // Check for duplicates (should be 10 total cards: 1 timeline + 4 player + 5 pool)
      const uniqueIds = new Set(allCardIds);
      expect(allCardIds.length).toBe(10); // 1 + 4 + 5
      expect(allCardIds.length).toBe(uniqueIds.size);
    });
  });

  describe('State Loading on Mount', () => {
    it('should load saved state on mount if available', () => {
      const savedState = createMockGameState({
        timeline: [{ id: 'saved-1', title: 'Saved Event', dateOccurred: '1950-01-01', category: 'History' }],
        playerHand: [{ id: 'saved-2', title: 'Saved Hand', dateOccurred: '1960-01-01', category: 'History' }]
      });

      mockedStatePersistence.loadGameStateFromStorage.mockReturnValue(savedState);
      mockedStatePersistence.hasSavedGameState.mockReturnValue(true);

      const { result } = renderHook(() => useGameState());

      expect(result.current.state.timeline).toEqual(savedState.timeline);
      expect(result.current.state.playerHand).toEqual(savedState.playerHand);
    });

    it('should not load state if no saved state exists', () => {
      mockedStatePersistence.hasSavedGameState.mockReturnValue(false);

      const { result } = renderHook(() => useGameState());

      expect(result.current.state.gameStatus).toBe('lobby');
      expect(result.current.state.timeline).toEqual([]);
    });
  });

  describe('State Persistence During Gameplay', () => {
    it('should save state after each move', async () => {
      const { result } = renderHook(() => useGameState());

      await act(async () => {
        await result.current.initializeGame('single', 'medium');
      });

      // Make a move
      await act(async () => {
        await result.current.placeCard(0, 1);
      });

      expect(mockedStatePersistence.saveGameStateToStorage).toHaveBeenCalled();
    });

    it('should save state when game is restarted', async () => {
      const { result } = renderHook(() => useGameState());

      await act(async () => {
        await result.current.initializeGame('single', 'medium');
      });

      // Restart the game
      await act(async () => {
        result.current.restartGame();
      });

      expect(mockedStatePersistence.saveGameStateToStorage).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    // Removed error handling and exposed hook method tests as per user request
    it('should handle storage errors gracefully', async () => {
      mockedStatePersistence.saveGameStateToStorage.mockReturnValue(false);

      const { result } = renderHook(() => useGameState());

      await act(async () => {
        await result.current.initializeGame('single', 'medium');
      });

      // Game should still work even if storage fails
      expect(result.current.state.gameStatus).toBe('playing');
    });
  });
}); 