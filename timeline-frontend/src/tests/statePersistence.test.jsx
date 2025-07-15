import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  saveGameStateToStorage,
  loadGameStateFromStorage,
  clearGameStateFromStorage,
  hasSavedGameState,
  getStorageInfo,
  resetStorageCache
} from '../utils/statePersistence.js';

describe('State Persistence', () => {
  let originalLocalStorage;
  let originalSessionStorage;
  let originalConsole;

  beforeEach(() => {
    // Store original storage objects
    originalLocalStorage = global.localStorage;
    originalSessionStorage = global.sessionStorage;
    
    // Store original console methods
    originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error
    };
    
    // Mock console methods to suppress output during tests
    console.log = vi.fn();
    console.warn = vi.fn();
    console.error = vi.fn();

    // Create mock storage objects
    const mockStorage = {
      store: {},
      getItem: vi.fn((key) => mockStorage.store[key] || null),
      setItem: vi.fn((key, value) => {
        mockStorage.store[key] = value;
      }),
      removeItem: vi.fn((key) => {
        delete mockStorage.store[key];
      }),
      clear: vi.fn(() => {
        mockStorage.store = {};
      })
    };

    // Replace global storage objects with mocks
    global.localStorage = mockStorage;
    global.sessionStorage = { ...mockStorage, store: {} };
    resetStorageCache(); // Reset storage cache between tests
  });

  afterEach(() => {
    // Restore original storage objects
    global.localStorage = originalLocalStorage;
    global.sessionStorage = originalSessionStorage;
    
    // Restore original console methods
    console.log = originalConsole.log;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
    
    vi.clearAllMocks();
  });

  describe('saveGameStateToStorage', () => {
    it('should save valid game state to localStorage', () => {
      const mockState = {
        timeline: [{ id: 1, title: 'Event 1', year: 1000 }],
        playerHand: [{ id: 2, title: 'Event 2', year: 1500 }],
        cardPool: [],
        gameStatus: 'playing',
        gameMode: 'single',
        difficulty: 'medium',
        score: { human: 100 },
        attempts: {},
        startTime: Date.now(),
        turnStartTime: Date.now(),
        gameStats: { totalMoves: 5, correctMoves: 3, hintsUsed: 0, averageTimePerMove: 2.5 },
        timelineAnalysis: null,
        turnHistory: [],
        achievements: [],
        selectedCard: null,
        // UI-only state that should not be persisted
        showInsertionPoints: false,
        feedback: null,
        isLoading: false,
        error: null
      };

      const result = saveGameStateToStorage(mockState);
      
      expect(result).toBe(true);
      expect(global.localStorage.setItem).toHaveBeenCalledWith(
        'timelineGameState-v1.0.0',
        expect.stringContaining('"version":"1.0.0"')
      );
      
      const savedData = JSON.parse(global.localStorage.store['timelineGameState-v1.0.0']);
      expect(savedData.version).toBe('1.0.0');
      expect(savedData.timeline).toEqual(mockState.timeline);
      expect(savedData.playerHand).toEqual(mockState.playerHand);
      expect(savedData.gameStatus).toBe('playing');
      // UI-only state should not be persisted
      expect(savedData.showInsertionPoints).toBeUndefined();
      expect(savedData.feedback).toBeUndefined();
      expect(savedData.isLoading).toBeUndefined();
      expect(savedData.error).toBeUndefined();
    });

    it('should return false when no storage is available', () => {
      // Mock both localStorage and sessionStorage to throw errors
      global.localStorage.setItem.mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });
      global.sessionStorage.setItem.mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      const mockState = {
        timeline: [],
        playerHand: [],
        cardPool: [],
        gameStatus: 'playing',
        gameMode: 'single',
        difficulty: 'medium',
        score: { human: 0 },
        attempts: {},
        startTime: Date.now(),
        turnStartTime: Date.now(),
        gameStats: { totalMoves: 0, correctMoves: 0, hintsUsed: 0, averageTimePerMove: 0 },
        timelineAnalysis: null,
        turnHistory: [],
        achievements: [],
        selectedCard: null
      };

      const result = saveGameStateToStorage(mockState);
      expect(result).toBe(false);
    });

    it('should fallback to sessionStorage when localStorage fails', () => {
      // Mock localStorage to throw an error but sessionStorage to work
      global.localStorage.setItem.mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });
      // sessionStorage works as normal
      global.sessionStorage.setItem.mockImplementation((key, value) => {
        global.sessionStorage.store[key] = value;
      });

      const mockState = {
        timeline: [],
        playerHand: [],
        cardPool: [],
        gameStatus: 'playing',
        gameMode: 'single',
        difficulty: 'medium',
        score: { human: 0 },
        attempts: {},
        startTime: Date.now(),
        turnStartTime: Date.now(),
        gameStats: { totalMoves: 0, correctMoves: 0, hintsUsed: 0, averageTimePerMove: 0 },
        timelineAnalysis: null,
        turnHistory: [],
        achievements: [],
        selectedCard: null
      };

      const result = saveGameStateToStorage(mockState);
      expect(result).toBe(true);
      expect(global.sessionStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('loadGameStateFromStorage', () => {
    it('should load valid game state from storage', () => {
      const mockSavedState = {
        version: '1.0.0',
        timestamp: Date.now(),
        timeline: [{ id: 1, title: 'Event 1', year: 1000 }],
        playerHand: [{ id: 2, title: 'Event 2', year: 1500 }],
        cardPool: [],
        gameStatus: 'playing',
        gameMode: 'single',
        difficulty: 'medium',
        score: { human: 100 },
        attempts: {},
        startTime: Date.now(),
        turnStartTime: Date.now(),
        gameStats: { totalMoves: 5, correctMoves: 3, hintsUsed: 0, averageTimePerMove: 2.5 },
        timelineAnalysis: null,
        turnHistory: [],
        achievements: [],
        selectedCard: null
      };

      global.localStorage.store['timelineGameState-v1.0.0'] = JSON.stringify(mockSavedState);

      const result = loadGameStateFromStorage();
      
      expect(result).toEqual(mockSavedState);
    });

    it('should return null when no saved state exists', () => {
      const result = loadGameStateFromStorage();
      expect(result).toBe(null);
    });

    it('should return null for corrupted data', () => {
      global.localStorage.store['timelineGameState-v1.0.0'] = 'invalid json';

      const result = loadGameStateFromStorage();
      expect(result).toBe(null);
    });

    it('should return null for missing required fields', () => {
      const incompleteState = {
        version: '1.0.0',
        timestamp: Date.now(),
        // Missing required fields
        gameStatus: 'playing'
      };

      global.localStorage.store['timelineGameState-v1.0.0'] = JSON.stringify(incompleteState);

      const result = loadGameStateFromStorage();
      expect(result).toBe(null);
    });
  });

  describe('clearGameStateFromStorage', () => {
    it('should clear saved game state', () => {
      // First save some state
      const mockState = {
        timeline: [],
        playerHand: [],
        cardPool: [],
        gameStatus: 'playing',
        gameMode: 'single',
        difficulty: 'medium',
        score: { human: 0 },
        attempts: {},
        startTime: Date.now(),
        turnStartTime: Date.now(),
        gameStats: { totalMoves: 0, correctMoves: 0, hintsUsed: 0, averageTimePerMove: 0 },
        timelineAnalysis: null,
        turnHistory: [],
        achievements: [],
        selectedCard: null
      };

      saveGameStateToStorage(mockState);
      expect(hasSavedGameState()).toBe(true);

      // Then clear it
      const result = clearGameStateFromStorage();
      expect(result).toBe(true);
      expect(hasSavedGameState()).toBe(false);
    });
  });

  describe('hasSavedGameState', () => {
    it('should return true when saved state exists', () => {
      const mockState = {
        timeline: [],
        playerHand: [],
        cardPool: [],
        gameStatus: 'playing',
        gameMode: 'single',
        difficulty: 'medium',
        score: { human: 0 },
        attempts: {},
        startTime: Date.now(),
        turnStartTime: Date.now(),
        gameStats: { totalMoves: 0, correctMoves: 0, hintsUsed: 0, averageTimePerMove: 0 },
        timelineAnalysis: null,
        turnHistory: [],
        achievements: [],
        selectedCard: null
      };

      saveGameStateToStorage(mockState);
      expect(hasSavedGameState()).toBe(true);
    });

    it('should return false when no saved state exists', () => {
      expect(hasSavedGameState()).toBe(false);
    });
  });

  describe('getStorageInfo', () => {
    it('should return storage information', () => {
      const info = getStorageInfo();
      expect(info.available).toBe(true);
      expect(info.hasSavedState).toBe(false);
      expect(info.stateSize).toBe(0);
      expect(info.storageType).toBe('localStorage');
    });

    it('should return correct info when state exists', () => {
      const mockState = {
        timeline: [],
        playerHand: [],
        cardPool: [],
        gameStatus: 'playing',
        gameMode: 'single',
        difficulty: 'medium',
        score: { human: 0 },
        attempts: {},
        startTime: Date.now(),
        turnStartTime: Date.now(),
        gameStats: { totalMoves: 0, correctMoves: 0, hintsUsed: 0, averageTimePerMove: 0 },
        timelineAnalysis: null,
        turnHistory: [],
        achievements: [],
        selectedCard: null
      };

      saveGameStateToStorage(mockState);
      const info = getStorageInfo();
      
      expect(info.available).toBe(true);
      expect(info.hasSavedState).toBe(true);
      expect(info.stateSize).toBeGreaterThan(0);
      expect(info.storageType).toBe('localStorage');
    });
  });
}); 