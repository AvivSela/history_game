import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SettingsManager } from './settingsManager';
import { DIFFICULTY_LEVELS, CARD_COUNTS } from '../constants/gameConstants.js';
import settingsManager from './settingsManager';

let manager;
// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock console methods to avoid noise in tests
const originalConsole = { ...console };

describe('SettingsManager', () => {
  let manager;

  beforeEach(() => {
    vi.clearAllMocks();

    // Suppress console logs during tests
    console.log = vi.fn();
    console.warn = vi.fn();
    console.error = vi.fn();

    // Reset localStorage mock implementations to default
    localStorageMock.getItem.mockReset();
    localStorageMock.setItem.mockReset();
    localStorageMock.removeItem.mockReset();
    localStorageMock.clear.mockReset();

    // Create a fresh instance for each test
    manager = new SettingsManager();

    // Clear any lingering state from singleton interference
    manager.changeListeners = [];
    manager.settings = { ...manager.defaultSettings };
    manager.isInitialized = true;

    // Patch the singleton to avoid cross-test interference
    settingsManager.changeListeners = [];
    settingsManager.settings = { ...settingsManager.defaultSettings };
    settingsManager.isInitialized = true;
  });

  afterEach(() => {
    // Restore console
    console.log = originalConsole.log;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;

    // Clean up localStorage
    localStorageMock.clear();
  });

  describe('Basic Functionality', () => {
    it('initializes with default settings', () => {
      expect(manager.isReady()).toBe(true);
      expect(manager.getSettings()).toEqual({
        difficulty: DIFFICULTY_LEVELS.MEDIUM,
        cardCount: CARD_COUNTS.SINGLE,
        categories: [],
        animations: true,
        soundEffects: true,
        version: '1.0.0',
      });
    });

    it('loads and saves settings', () => {
      const savedSettings = {
        difficulty: DIFFICULTY_LEVELS.HARD,
        cardCount: 10,
        categories: ['history', 'science'],
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedSettings));

      const newManager = new SettingsManager();

      expect(newManager.getSetting('difficulty')).toBe(DIFFICULTY_LEVELS.HARD);
      expect(newManager.getSetting('cardCount')).toBe(10);
      expect(newManager.getSetting('categories')).toEqual(['history', 'science']);
    });

    it('updates settings successfully', () => {
      const result = manager.updateSetting('difficulty', DIFFICULTY_LEVELS.HARD);

      expect(result).toBe(true);
      expect(manager.getSetting('difficulty')).toBe(DIFFICULTY_LEVELS.HARD);
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('handles multiple settings updates', () => {
      const updates = {
        difficulty: DIFFICULTY_LEVELS.EASY,
        cardCount: 8,
        animations: false,
      };

      const result = manager.updateSettings(updates);

      expect(result).toBe(true);
      expect(manager.getSetting('difficulty')).toBe(DIFFICULTY_LEVELS.EASY);
      expect(manager.getSetting('cardCount')).toBe(8);
      expect(manager.getSetting('animations')).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('handles localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      const newManager = new SettingsManager();

      expect(newManager.isReady()).toBe(true);
      expect(newManager.getSettings()).toEqual(manager.getDefaultSettings());
    });

    it('handles invalid JSON in localStorage', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');

      const newManager = new SettingsManager();

      expect(newManager.isReady()).toBe(true);
      expect(newManager.getSettings()).toEqual(manager.getDefaultSettings());
    });

    it('rejects unknown setting keys', () => {
      const result = manager.updateSetting('unknownSetting', 'value');

      expect(result).toBe(false);
      expect(manager.getSetting('unknownSetting')).toBeUndefined();
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    it('handles save errors', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Save error');
      });

      const result = manager.updateSetting('difficulty', DIFFICULTY_LEVELS.HARD);

      expect(result).toBe(false);
      expect(manager.getSetting('difficulty')).toBe(DIFFICULTY_LEVELS.MEDIUM); // Should revert
    });
  });

  describe('Change Listeners', () => {
    it('registers and calls change listeners', () => {
      const listener = vi.fn();
      const unsubscribe = manager.onChange(listener);

      manager.updateSetting('difficulty', DIFFICULTY_LEVELS.HARD);

      expect(listener).toHaveBeenCalledWith({
        key: 'difficulty',
        newValue: DIFFICULTY_LEVELS.HARD,
        oldValue: DIFFICULTY_LEVELS.MEDIUM,
        timestamp: expect.any(Number),
        allSettings: expect.any(Object),
      });

      unsubscribe();
    });

    it('unsubscribes listeners correctly', () => {
      const listener = vi.fn();
      const unsubscribe = manager.onChange(listener);

      unsubscribe();
      manager.updateSetting('difficulty', DIFFICULTY_LEVELS.HARD);

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('Settings Reset', () => {
    it('resets settings to defaults', () => {
      // First update some settings
      manager.updateSetting('difficulty', DIFFICULTY_LEVELS.HARD);
      manager.updateSetting('animations', false);

      // Then reset
      const result = manager.resetToDefaults();

      expect(result).toBe(true);
      expect(manager.getSetting('difficulty')).toBe(DIFFICULTY_LEVELS.MEDIUM);
      expect(manager.getSetting('animations')).toBe(true);
    });
  });
});
