import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameState } from './useGameState';
import * as statePersistence from '../utils/statePersistence';
import * as gameAPI from '../utils/api';

// Mock dependencies
vi.mock('../utils/statePersistence');
vi.mock('../utils/api', () => ({
  gameAPI: {
    getRandomEvents: vi.fn(),
    extractData: vi.fn()
  },
  extractData: vi.fn(),
  handleAPIError: vi.fn()
}));
vi.mock('../utils/aiLogic', () => ({
  createAIOpponent: vi.fn(() => ({ name: 'Test AI', difficulty: 'medium' }))
}));

// Mock game constants
vi.mock('../constants/gameConstants', () => ({
  GAME_STATUS: {
    LOBBY: 'lobby',
    LOADING: 'loading',
    PLAYING: 'playing',
    PAUSED: 'paused',
    WON: 'won',
    LOST: 'lost',
    ERROR: 'error'
  },
  PLAYER_TYPES: {
    HUMAN: 'human',
    AI: 'ai'
  },
  CARD_COUNTS: {
    SINGLE: 5,
    AI: 8
  },
  POOL_CARD_COUNT: 10,
  API: {
    BASE_URL: 'http://localhost:5000/api',
    TIMEOUT: 10000,
    STATUS_CODES: {
      OK: 200,
      CREATED: 201,
      BAD_REQUEST: 400,
      UNAUTHORIZED: 401,
      NOT_FOUND: 404,
      INTERNAL_SERVER_ERROR: 500
    }
  }
}));

// Get mocked modules
const mockedGameAPI = vi.mocked(gameAPI);
const mockedStatePersistence = vi.mocked(statePersistence);

// Mock sample data
const mockEvents = [
  {
    id: 'event-1',
    title: 'World War II',
    dateOccurred: '1939-09-01',
    category: 'Military',
    difficulty: 1
  },
  {
    id: 'event-2',
    title: 'Moon Landing',
    dateOccurred: '1969-07-20',
    category: 'Space',
    difficulty: 2
  },
  {
    id: 'event-3',
    title: 'Berlin Wall Falls',
    dateOccurred: '1989-11-09',
    category: 'Political',
    difficulty: 1
  },
  {
    id: 'event-4',
    title: 'First Computer',
    dateOccurred: '1946-02-14',
    category: 'Technology',
    difficulty: 2
  },
  {
    id: 'event-5',
    title: 'Internet Created',
    dateOccurred: '1983-01-01',
    category: 'Technology',
    difficulty: 3
  }
];

const mockPoolEvents = [
  {
    id: 'pool-1',
    title: 'Pool Event 1',
    dateOccurred: '1950-01-01',
    category: 'History',
    difficulty: 1
  },
  {
    id: 'pool-2',
    title: 'Pool Event 2',
    dateOccurred: '1970-01-01',
    category: 'History',
    difficulty: 2
  }
];

describe('useGameState - State Persistence Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock API responses - ensure functions exist before mocking
    if (mockedGameAPI.gameAPI?.getRandomEvents) {
      mockedGameAPI.gameAPI.getRandomEvents.mockResolvedValue({ data: mockEvents });
    }
    if (mockedGameAPI.extractData) {
      mockedGameAPI.extractData.mockImplementation((response) => response?.data || response);
    }
    
    // Mock persistence functions
    if (mockedStatePersistence.saveGameStateToStorage) {
      mockedStatePersistence.saveGameStateToStorage.mockReturnValue(true);
    }
    if (mockedStatePersistence.loadGameStateFromStorage) {
      mockedStatePersistence.loadGameStateFromStorage.mockReturnValue(null);
    }
    if (mockedStatePersistence.clearGameStateFromStorage) {
      mockedStatePersistence.clearGameStateFromStorage.mockReturnValue(true);
    }
    if (mockedStatePersistence.hasSavedGameState) {
      mockedStatePersistence.hasSavedGameState.mockReturnValue(false);
    }
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

    it('should not load saved state when starting a new game', async () => {
      const { result } = renderHook(() => useGameState());

      await act(async () => {
        await result.current.initializeGame('single', 'medium');
      });

      // Should not call loadGameStateFromStorage during new game initialization
      expect(mockedStatePersistence.loadGameStateFromStorage).not.toHaveBeenCalled();
    });

    it('should create unique card IDs for new games', async () => {
      const { result } = renderHook(() => useGameState());

      await act(async () => {
        await result.current.initializeGame('single', 'medium');
      });

      const state = result.current.state;
      
      // Collect all card IDs
      const allCardIds = [
        ...state.timeline.map(card => card.id),
        ...state.playerHand.map(card => card.id),
        ...state.aiHand.map(card => card.id),
        ...state.cardPool.map(card => card.id)
      ];

      // Check for duplicates
      const uniqueIds = new Set(allCardIds);
      expect(allCardIds.length).toBe(uniqueIds.size);
    });
  });

  describe('State Loading on Mount', () => {
    it('should load saved state on mount if available', () => {
      const savedState = {
        timeline: [{ id: 'saved-1', title: 'Saved Event', dateOccurred: '1950-01-01', category: 'History' }],
        playerHand: [{ id: 'saved-2', title: 'Saved Hand', dateOccurred: '1960-01-01', category: 'History' }],
        aiHand: [],
        cardPool: [],
        gameStatus: 'playing',
        currentPlayer: 'human',
        gameMode: 'single',
        difficulty: 'medium',
        score: { human: 100, ai: 0 },
        attempts: {},
        startTime: Date.now(),
        turnStartTime: Date.now(),
        gameStats: { totalMoves: 1, correctMoves: 1, hintsUsed: 0, averageTimePerMove: 0 },
        timelineAnalysis: null,
        turnHistory: [],
        achievements: [],
        aiOpponent: null,
        selectedCard: null
      };

      mockedStatePersistence.loadGameStateFromStorage.mockReturnValue(savedState);

      const { result } = renderHook(() => useGameState());

      expect(result.current.state.timeline).toEqual(savedState.timeline);
      expect(result.current.state.playerHand).toEqual(savedState.playerHand);
      expect(result.current.state.gameStatus).toBe('playing');
    });

    it('should not load saved state if game status is lobby', () => {
      const savedState = {
        timeline: [],
        playerHand: [],
        aiHand: [],
        cardPool: [],
        gameStatus: 'lobby', // Should not load this
        currentPlayer: 'human',
        gameMode: 'single',
        difficulty: 'medium',
        score: { human: 0, ai: 0 },
        attempts: {},
        startTime: null,
        turnStartTime: null,
        gameStats: { totalMoves: 0, correctMoves: 0, hintsUsed: 0, averageTimePerMove: 0 },
        timelineAnalysis: null,
        turnHistory: [],
        achievements: [],
        aiOpponent: null,
        selectedCard: null
      };

      mockedStatePersistence.loadGameStateFromStorage.mockReturnValue(savedState);

      const { result } = renderHook(() => useGameState());

      // Should not load lobby state
      expect(result.current.state.gameStatus).toBe('lobby');
      expect(result.current.state.timeline).toEqual([]);
      expect(result.current.state.playerHand).toEqual([]);
    });
  });

  describe('State Saving', () => {
    it('should save state when game is in progress', async () => {
      const { result } = renderHook(() => useGameState());

      await act(async () => {
        await result.current.initializeGame('single', 'medium');
      });

      // State should be saved after initialization
      expect(mockedStatePersistence.saveGameStateToStorage).toHaveBeenCalled();
      
      const savedState = mockedStatePersistence.saveGameStateToStorage.mock.calls[0][0];
      expect(savedState.gameStatus).toBe('playing');
      expect(savedState.timeline.length).toBeGreaterThan(0);
      expect(savedState.playerHand.length).toBeGreaterThan(0);
    });

    it('should not save state when game is in lobby', () => {
      const { result } = renderHook(() => useGameState());

      // Initial state is lobby, should not save
      expect(mockedStatePersistence.saveGameStateToStorage).not.toHaveBeenCalled();
    });

    it('should save state when cards are placed', async () => {
      const { result } = renderHook(() => useGameState());

      await act(async () => {
        await result.current.initializeGame('single', 'medium');
      });

      // Clear previous save calls
      mockedStatePersistence.saveGameStateToStorage.mockClear();

      // Select a card
      const selectedCard = result.current.state.playerHand[0];
      act(() => {
        result.current.selectCard(selectedCard);
      });

      // Place the card
      await act(async () => {
        await result.current.placeCard(0);
      });

      // State should be saved after card placement
      expect(mockedStatePersistence.saveGameStateToStorage).toHaveBeenCalled();
    });
  });

  describe('Card Placement with Persistence', () => {
    it('should not create duplicate cards when placing cards', async () => {
      const { result } = renderHook(() => useGameState());

      await act(async () => {
        await result.current.initializeGame('single', 'medium');
      });

      const initialState = result.current.state;
      const selectedCard = initialState.playerHand[0];

      // Place the card
      await act(async () => {
        await result.current.placeCard(0);
      });

      const finalState = result.current.state;

      // Check that the card was moved from hand to timeline
      expect(finalState.timeline.length).toBe(initialState.timeline.length + 1);
      expect(finalState.playerHand.length).toBe(initialState.playerHand.length - 1);

      // Verify the card is no longer in the hand
      const cardStillInHand = finalState.playerHand.find(card => card.id === selectedCard.id);
      expect(cardStillInHand).toBeUndefined();

      // Verify the card is now in the timeline
      const cardInTimeline = finalState.timeline.find(card => card.id === selectedCard.id);
      expect(cardInTimeline).toBeDefined();
      expect(cardInTimeline.id).toBe(selectedCard.id);
    });

    it('should maintain unique card IDs after multiple placements', async () => {
      const { result } = renderHook(() => useGameState());

      await act(async () => {
        await result.current.initializeGame('single', 'medium');
      });

      // Place multiple cards
      for (let i = 0; i < 2; i++) {
        const selectedCard = result.current.state.playerHand[0];
        await act(async () => {
          await result.current.placeCard(0);
        });
      }

      const finalState = result.current.state;

      // Collect all card IDs
      const allCardIds = [
        ...finalState.timeline.map(card => card.id),
        ...finalState.playerHand.map(card => card.id),
        ...finalState.aiHand.map(card => card.id),
        ...finalState.cardPool.map(card => card.id)
      ];

      // Check for duplicates
      const uniqueIds = new Set(allCardIds);
      expect(allCardIds.length).toBe(uniqueIds.size);
    });
  });

  describe('Game Restart', () => {
    it('should clear saved state when restarting game', async () => {
      const { result } = renderHook(() => useGameState());

      await act(async () => {
        await result.current.initializeGame('single', 'medium');
      });

      // Clear previous calls
      mockedStatePersistence.clearGameStateFromStorage.mockClear();

      // Restart the game
      act(() => {
        result.current.restartGame();
      });

      expect(mockedStatePersistence.clearGameStateFromStorage).toHaveBeenCalled();
    });

    it('should reset game state to lobby when restarting', async () => {
      const { result } = renderHook(() => useGameState());

      await act(async () => {
        await result.current.initializeGame('single', 'medium');
      });

      // Restart the game
      act(() => {
        result.current.restartGame();
      });

      expect(result.current.state.gameStatus).toBe('lobby');
      expect(result.current.state.timeline).toEqual([]);
      expect(result.current.state.playerHand).toEqual([]);
      expect(result.current.state.selectedCard).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle persistence errors gracefully', async () => {
      // Mock persistence to fail
      mockedStatePersistence.saveGameStateToStorage.mockReturnValue(false);

      const { result } = renderHook(() => useGameState());

      await act(async () => {
        await result.current.initializeGame('single', 'medium');
      });

      // Game should still work even if persistence fails
      expect(result.current.state.gameStatus).toBe('playing');
      expect(result.current.state.timeline.length).toBeGreaterThan(0);
    });

    it('should handle corrupted saved state gracefully', () => {
      // Mock corrupted saved state
      mockedStatePersistence.loadGameStateFromStorage.mockReturnValue({
        timeline: null, // Invalid data
        playerHand: null,
        gameStatus: 'playing',
        currentPlayer: 'human'
      });

      const { result } = renderHook(() => useGameState());

      // Should fall back to default state
      expect(result.current.state.gameStatus).toBe('lobby');
      expect(result.current.state.timeline).toEqual([]);
      expect(result.current.state.playerHand).toEqual([]);
    });
  });
}); 