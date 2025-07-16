import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  saveGameStateToStorage,
  loadGameStateFromStorage,
  clearGameStateFromStorage,
  hasSavedGameState,
  getStorageInfo,
  resetStorageCache,
} from './statePersistence';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock global storage objects
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

Object.defineProperty(global, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true,
});

// Also mock window for browser environment
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });

  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
    writable: true,
  });
}

// Sample game state for testing
const mockGameState = {
  timeline: [
    {
      id: 'card-1',
      title: 'World War II',
      dateOccurred: '1939-09-01',
      category: 'Military',
      isRevealed: true,
    },
  ],
  playerHand: [
    {
      id: 'card-2',
      title: 'Moon Landing',
      dateOccurred: '1969-07-20',
      category: 'Space',
    },
    {
      id: 'card-3',
      title: 'Berlin Wall Falls',
      dateOccurred: '1989-11-09',
      category: 'Political',
    },
  ],
  aiHand: [
    {
      id: 'card-4',
      title: 'First Computer',
      dateOccurred: '1946-02-14',
      category: 'Technology',
    },
  ],
  cardPool: [
    {
      id: 'card-5',
      title: 'Internet Created',
      dateOccurred: '1983-01-01',
      category: 'Technology',
    },
  ],
  gameStatus: 'playing',
  currentPlayer: 'human',
  gameMode: 'single',
  difficulty: 'medium',
  score: { human: 100, ai: 50 },
  attempts: { 'card-2': 1 },
  startTime: 1640995200000,
  turnStartTime: 1640995260000,
  gameStats: {
    totalMoves: 2,
    correctMoves: 1,
    hintsUsed: 0,
    averageTimePerMove: 3.5,
  },
  timelineAnalysis: null,
  turnHistory: [
    {
      id: 'turn-1',
      player: 'human',
      card: { id: 'card-1', title: 'World War II' },
      position: 0,
      timestamp: 1640995200000,
    },
  ],
  achievements: [],
  aiOpponent: null,
  selectedCard: null,
  // UI-only state (should not be persisted)
  showInsertionPoints: true,
  feedback: { type: 'success', message: 'Great job!' },
  isLoading: false,
  error: null,
  insertionPoints: [],
};

describe('State Persistence', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();

    // Reset localStorage mocks
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {});
    localStorageMock.removeItem.mockImplementation(() => {});

    // Reset sessionStorage mocks
    sessionStorageMock.getItem.mockReturnValue(null);
    sessionStorageMock.setItem.mockImplementation(() => {});
    sessionStorageMock.removeItem.mockImplementation(() => {});

    // Reset storage cache
    resetStorageCache();
  });

  afterEach(() => {
    // Clean up mocks
    vi.clearAllMocks();
    // Reset storage cache
    resetStorageCache();
  });

  describe('saveGameStateToStorage', () => {
    it('should save valid game state to localStorage', () => {
      // Clear any previous calls and reset cache
      localStorageMock.setItem.mockClear();
      resetStorageCache();

      const result = saveGameStateToStorage(mockGameState);

      expect(result).toBe(true);
      // Account for availability check call + actual operation call
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(2);

      // The first call is the availability check, the second is the actual operation
      const [key, value] = localStorageMock.setItem.mock.calls[1];
      expect(key).toBe('timelineGameState-v1.0.0');

      const savedState = JSON.parse(value);
      expect(savedState.version).toBe('1.0.0');
      expect(savedState.timeline).toEqual(mockGameState.timeline);
      expect(savedState.playerHand).toEqual(mockGameState.playerHand);
      expect(savedState.cardPool).toEqual(mockGameState.cardPool);
      expect(savedState.gameStatus).toBe('playing');

      // UI-only state should not be persisted
      expect(savedState.showInsertionPoints).toBeUndefined();
      expect(savedState.feedback).toBeUndefined();
      expect(savedState.isLoading).toBeUndefined();
      expect(savedState.error).toBeUndefined();
      expect(savedState.insertionPoints).toBeUndefined();
    });

    it('should handle localStorage errors gracefully', () => {
      // Clear any previous calls and reset cache
      sessionStorageMock.setItem.mockClear();
      resetStorageCache();

      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const result = saveGameStateToStorage(mockGameState);
      // Should fall back to sessionStorage when localStorage fails
      expect(result).toBe(true);
      // Account for availability check call + actual operation call
      expect(sessionStorageMock.setItem).toHaveBeenCalledTimes(2);
    });

    it('should handle large state data', () => {
      // Create a large state object that exceeds the 4.5MB limit
      const largeState = {
        ...mockGameState,
        cardPool: Array.from({ length: 100000 }, (_, i) => ({
          id: `large-card-${i}`,
          title: `Large Card ${i}`.repeat(100), // Make each card larger
          dateOccurred: '2000-01-01',
          category: 'Test'.repeat(50),
        })),
      };

      const result = saveGameStateToStorage(largeState);
      expect(result).toBe(false);
    });

    it('should fall back to sessionStorage when localStorage is unavailable', () => {
      // Clear any previous calls and reset cache
      sessionStorageMock.setItem.mockClear();
      resetStorageCache();

      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      const result = saveGameStateToStorage(mockGameState);
      expect(result).toBe(true);
      // Account for availability check call + actual operation call
      expect(sessionStorageMock.setItem).toHaveBeenCalledTimes(2);
    });
  });

  describe('loadGameStateFromStorage', () => {
    it('should load valid game state from localStorage', () => {
      // Mock localStorage to return saved state
      const savedStateString = JSON.stringify({
        version: '1.0.0',
        timestamp: Date.now(),
        ...mockGameState,
      });
      localStorageMock.getItem.mockReturnValue(savedStateString);

      // Then load it
      const loadedState = loadGameStateFromStorage();

      expect(loadedState).not.toBeNull();
      expect(loadedState.timeline).toEqual(mockGameState.timeline);
      expect(loadedState.playerHand).toEqual(mockGameState.playerHand);
      expect(loadedState.cardPool).toEqual(mockGameState.cardPool);
      expect(loadedState.gameStatus).toBe('playing');
    });

    it('should return null when no saved state exists', () => {
      const loadedState = loadGameStateFromStorage();
      expect(loadedState).toBeNull();
    });

    it('should handle corrupted JSON data', () => {
      localStorageMock.getItem.mockReturnValue('invalid json data');

      const loadedState = loadGameStateFromStorage();
      expect(loadedState).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalled(); // Should clear corrupted data
    });

    it('should handle missing required fields', () => {
      const incompleteState = {
        version: '1.0.0',
        timestamp: Date.now(),
        timeline: [],
        // Missing playerHand, gameStatus, currentPlayer
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(incompleteState));

      const loadedState = loadGameStateFromStorage();
      expect(loadedState).toBeNull();
    });

    it('should handle version mismatches gracefully', () => {
      const oldVersionState = {
        ...mockGameState,
        version: '0.9.0',
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(oldVersionState));

      const loadedState = loadGameStateFromStorage();
      expect(loadedState).not.toBeNull(); // Should still load despite version mismatch
    });
  });

  describe('clearGameStateFromStorage', () => {
    it('should clear saved game state', () => {
      // Mock that there's saved state
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockGameState));
      expect(hasSavedGameState()).toBe(true);

      // Then clear it
      const result = clearGameStateFromStorage();
      expect(result).toBe(true);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        'timelineGameState-v1.0.0'
      );

      // Mock that state is now cleared
      localStorageMock.getItem.mockReturnValue(null);
      expect(hasSavedGameState()).toBe(false);
    });

    it('should handle storage errors gracefully', () => {
      // Clear any previous calls and reset cache
      sessionStorageMock.removeItem.mockClear();
      resetStorageCache();

      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = clearGameStateFromStorage();
      // Should fall back to sessionStorage when localStorage fails
      expect(result).toBe(true);
      // Account for availability check call + actual operation call
      expect(sessionStorageMock.removeItem).toHaveBeenCalledTimes(2);
    });
  });

  describe('hasSavedGameState', () => {
    it('should return true when saved state exists', () => {
      // Mock that there's saved state
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockGameState));
      expect(hasSavedGameState()).toBe(true);
    });

    it('should return false when no saved state exists', () => {
      expect(hasSavedGameState()).toBe(false);
    });

    it('should handle storage errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(hasSavedGameState()).toBe(false);
    });
  });

  describe('getStorageInfo', () => {
    it('should return storage information when state exists', () => {
      // Mock that there's saved state
      const savedStateString = JSON.stringify(mockGameState);
      localStorageMock.getItem.mockReturnValue(savedStateString);

      const info = getStorageInfo();
      expect(info.available).toBe(true);
      expect(info.hasSavedState).toBe(true);
      expect(info.stateSize).toBe(savedStateString.length);
      expect(info.storageType).toBe('localStorage');
    });

    it('should return storage information when no state exists', () => {
      const info = getStorageInfo();
      expect(info.available).toBe(true);
      expect(info.hasSavedState).toBe(false);
      expect(info.stateSize).toBe(0);
      expect(info.storageType).toBe('localStorage');
    });

    it('should handle storage errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const info = getStorageInfo();
      expect(info.available).toBe(true);
      expect(info.error).toBe('Storage error');
    });
  });

  describe('Card ID Uniqueness Validation', () => {
    it('should not create duplicate card IDs when saving and loading', () => {
      // Mock that there's saved state with unique card IDs
      const savedStateString = JSON.stringify({
        version: '1.0.0',
        timestamp: Date.now(),
        ...mockGameState,
      });
      localStorageMock.getItem.mockReturnValue(savedStateString);

      // Load the state
      const loadedState = loadGameStateFromStorage();

      // Collect all card IDs
      const allCardIds = [
        ...loadedState.timeline.map(card => card.id),
        ...loadedState.playerHand.map(card => card.id),
        ...loadedState.aiHand.map(card => card.id),
        ...loadedState.cardPool.map(card => card.id),
      ];

      // Check for duplicates
      const uniqueIds = new Set(allCardIds);
      expect(allCardIds.length).toBe(uniqueIds.size);

      // Verify specific IDs are preserved
      expect(loadedState.timeline[0].id).toBe('card-1');
      expect(loadedState.playerHand[0].id).toBe('card-2');
      expect(loadedState.playerHand[1].id).toBe('card-3');
      expect(loadedState.aiHand[0].id).toBe('card-4');
      expect(loadedState.cardPool[0].id).toBe('card-5');
    });

    it('should preserve card object integrity', () => {
      // Mock that there's saved state
      const savedStateString = JSON.stringify({
        version: '1.0.0',
        timestamp: Date.now(),
        ...mockGameState,
      });
      localStorageMock.getItem.mockReturnValue(savedStateString);

      const loadedState = loadGameStateFromStorage();

      // Check that card objects maintain their structure
      const timelineCard = loadedState.timeline[0];
      expect(timelineCard).toEqual({
        id: 'card-1',
        title: 'World War II',
        dateOccurred: '1939-09-01',
        category: 'Military',
        isRevealed: true,
      });

      const handCard = loadedState.playerHand[0];
      expect(handCard).toEqual({
        id: 'card-2',
        title: 'Moon Landing',
        dateOccurred: '1969-07-20',
        category: 'Space',
      });
    });
  });

  describe('State Persistence Integration', () => {
    it('should handle complete save-load-clear cycle', () => {
      // 1. Save state
      const saveResult = saveGameStateToStorage(mockGameState);
      expect(saveResult).toBe(true);

      // Mock that state was saved
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockGameState));
      expect(hasSavedGameState()).toBe(true);

      // 2. Load state
      const loadedState = loadGameStateFromStorage();
      expect(loadedState).not.toBeNull();
      expect(loadedState.timeline.length).toBe(mockGameState.timeline.length);
      expect(loadedState.playerHand.length).toBe(
        mockGameState.playerHand.length
      );

      // 3. Clear state
      const clearResult = clearGameStateFromStorage();
      expect(clearResult).toBe(true);

      // Mock that state was cleared
      localStorageMock.getItem.mockReturnValue(null);
      expect(hasSavedGameState()).toBe(false);

      // 4. Verify no state remains
      const reloadedState = loadGameStateFromStorage();
      expect(reloadedState).toBeNull();
    });

    it('should handle multiple save operations', () => {
      // Save initial state
      saveGameStateToStorage(mockGameState);

      // Modify and save again
      const modifiedState = {
        ...mockGameState,
        score: { human: 200, ai: 100 },
        playerHand: mockGameState.playerHand.slice(1), // Remove one card
      };

      saveGameStateToStorage(modifiedState);

      // Mock that the modified state was saved
      localStorageMock.getItem.mockReturnValue(JSON.stringify(modifiedState));

      // Load and verify the latest state
      const loadedState = loadGameStateFromStorage();
      expect(loadedState.score.human).toBe(200);
      expect(loadedState.playerHand.length).toBe(1);
    });
  });
});
