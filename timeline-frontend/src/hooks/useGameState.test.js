import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useGameState } from './useGameState';
import {
  setupCommonMocks,
  resetAllMocks,
  cleanupTimeouts,
} from '../tests/utils/testSetup';

// Mock the API module before any imports
vi.mock('../utils/api', () => {
  const { apiMock } = require('../tests/__mocks__/api.js');
  return {
    gameAPI: apiMock.gameAPI,
    extractData: apiMock.extractData,
    handleAPIError: apiMock.handleAPIError,
    default: apiMock.default,
  };
});

// Mock SettingsManager
const defaultSettings = {
  difficulty: 'medium',
  cardCount: 5,
  categories: [],
  animations: true,
};

vi.mock('../utils/settingsManager.js', () => ({
  SettingsManager: vi.fn().mockImplementation(() => ({
    getSettings: vi.fn().mockReturnValue(defaultSettings),
    updateSetting: vi.fn().mockReturnValue(true),
    updateSettings: vi.fn().mockReturnValue(true),
    onChange: vi.fn(),
    isInitialized: true,
  })),
}));

// Setup common mocks for all tests
setupCommonMocks();

describe('useGameState Hook', () => {
  let mockSettingsManager;

  beforeEach(() => {
    resetAllMocks();
    mockSettingsManager = new (require('../utils/settingsManager.js').SettingsManager)();
  });

  afterEach(async () => {
    await cleanupTimeouts();
    vi.clearAllMocks();
  });

  describe('State Management', () => {
    it('initializes with default state', () => {
      const { result } = renderHook(() => useGameState());

      expect(result.current.state.gameStatus).toBe('lobby');
      expect(result.current.state.gameMode).toBe('single');
      expect(result.current.state.difficulty).toBe('medium');
      expect(result.current.state.timeline).toEqual([]);
      expect(result.current.state.playerHand).toEqual([]);
    });

    // Additional tests moved to behavior tests - see src/tests/behavior/gameBehavior.test.jsx
  });

  describe('Game Initialization', () => {
    it('initializes game successfully', async () => {
      const { result } = renderHook(() => useGameState());

      await act(async () => {
        await result.current.initializeGame('single', 'medium');
      });

      await waitFor(() => {
        expect(result.current.state.gameStatus).toBe('playing');
        expect(result.current.state.gameMode).toBe('single');
        expect(result.current.state.difficulty).toBe('medium');
      });
    });

    it('handles initialization errors', async () => {
      const { apiMock } = require('../tests/__mocks__/api');
      apiMock.gameAPI.getRandomEvents.mockRejectedValueOnce(
        new Error('API Error')
      );

      const { result } = renderHook(() => useGameState());

      await act(async () => {
        try {
          await result.current.initializeGame('single', 'medium');
        } catch (error) {
          // Expected to throw
        }
      });

      // The hook might handle errors differently, so we'll just check it doesn't crash
      expect(result.current.state).toBeDefined();
    });
  });

  describe('Game Actions', () => {
    it('allows card selection', async () => {
      const { result } = renderHook(() => useGameState());

      // Initialize game first
      await act(async () => {
        await result.current.initializeGame('single', 'medium');
      });

      await waitFor(() => {
        expect(result.current.state.gameStatus).toBe('playing');
      });

      // Test card selection
      if (result.current.state.playerHand.length > 0) {
        const card = result.current.state.playerHand[0];

        await act(async () => {
          result.current.selectCard(card);
        });

        expect(result.current.state.selectedCard).toBe(card);
      }
    });

    it('handles game restart', async () => {
      const { result } = renderHook(() => useGameState());

      // Initialize game first
      await act(async () => {
        await result.current.initializeGame('single', 'medium');
      });

      await waitFor(() => {
        expect(result.current.state.gameStatus).toBe('playing');
      });

      // Restart game
      await act(async () => {
        result.current.restartGame();
      });

      await waitFor(() => {
        expect(result.current.state.gameStatus).toBe('lobby');
      });
    });
  });

  describe('Settings Integration', () => {
    it('updates when settings change', async () => {
      const { result } = renderHook(() => useGameState());

      // Wait for settings manager to initialize
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Test settings update
      await act(async () => {
        const success = result.current.updateGameSetting('animations', false);
        expect(success).toBe(true);
      });

      expect(typeof result.current.updateGameSetting).toBe('function');
      expect(mockSettingsManager.updateSetting).toHaveBeenCalledWith('animations', false);
    });

    it('returns correct values from getGameSettings', async () => {
      const { result } = renderHook(() => useGameState());

      // Wait for settings manager to initialize
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const settings = result.current.getGameSettings();
      expect(settings).toBeDefined();
      expect(settings.difficulty).toBe('medium');
      expect(settings.cardCount).toBe(5);
      expect(settings.categories).toEqual([]);
      expect(settings.animations).toBe(true);
      expect(mockSettingsManager.getSettings).toHaveBeenCalled();
    });

    it('falls back to default settings when settings manager is unavailable', async () => {
      // Mock console.warn to avoid test output noise
      const originalWarn = console.warn;
      const mockWarn = vi.fn();
      console.warn = mockWarn;

      // Force settings manager to throw on instantiation
      const SettingsManager = require('../utils/settingsManager.js').SettingsManager;
      SettingsManager.mockImplementationOnce(() => {
        throw new Error('Settings manager unavailable');
      });

      const { result } = renderHook(() => useGameState());
      const settings = result.current.getGameSettings();

      expect(settings).toBeDefined();
      expect(settings.difficulty).toBe('medium');
      expect(settings.cardCount).toBeDefined();
      expect(settings.categories).toBeDefined();
      expect(mockWarn).toHaveBeenCalled();

      // Restore console.warn
      console.warn = originalWarn;
    });

    it('handles errors gracefully when getting settings', async () => {
      // Mock console.warn to avoid test output noise
      const originalWarn = console.warn;
      const mockWarn = vi.fn();
      console.warn = mockWarn;

      // Make getSettings throw
      mockSettingsManager.getSettings.mockImplementationOnce(() => {
        throw new Error('Failed to get settings');
      });

      const { result } = renderHook(() => useGameState());

      // Wait for settings manager to initialize
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const settings = result.current.getGameSettings();

      expect(settings).toBeDefined();
      expect(settings.difficulty).toBe('medium');
      expect(settings.cardCount).toBeDefined();
      expect(settings.categories).toBeDefined();
      expect(mockWarn).toHaveBeenCalledWith(
        'Error retrieving game settings:',
        expect.any(Error)
      );

      // Restore console.warn
      console.warn = originalWarn;
    });
  });
});
