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

  describe('Constructor and Initialization', () => {
    it('should initialize with default settings', () => {
      expect(manager.isReady()).toBe(true);
      expect(manager.getSettings()).toEqual({
        difficulty: DIFFICULTY_LEVELS.MEDIUM,
        cardCount: CARD_COUNTS.SINGLE,
        categories: [],
        animations: true,
        soundEffects: true,
        reducedMotion: false,
        highContrast: false,
        largeText: false,
        screenReaderSupport: true,
        autoSave: true,
        performanceMode: false,
        version: '1.0.0',
      });
    });

    it('should load settings from localStorage on initialization', () => {
      const savedSettings = {
        difficulty: DIFFICULTY_LEVELS.HARD,
        cardCount: 10,
        categories: ['history', 'science'],
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedSettings));

      const newManager = new SettingsManager();

      expect(localStorageMock.getItem).toHaveBeenCalledWith(
        'timeline-game-settings'
      );
      expect(newManager.getSetting('difficulty')).toBe(DIFFICULTY_LEVELS.HARD);
      expect(newManager.getSetting('cardCount')).toBe(10);
      expect(newManager.getSetting('categories')).toEqual([
        'history',
        'science',
      ]);
    });

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      const newManager = new SettingsManager();

      expect(newManager.isReady()).toBe(true);
      expect(newManager.getSettings()).toEqual(manager.getDefaultSettings());
    });

    it('should handle invalid JSON in localStorage', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');

      const newManager = new SettingsManager();

      expect(newManager.isReady()).toBe(true);
      expect(newManager.getSettings()).toEqual(manager.getDefaultSettings());
    });
  });

  describe('Settings Retrieval', () => {
    it('should get all settings', () => {
      const settings = manager.getSettings();
      expect(settings).toHaveProperty('difficulty');
      expect(settings).toHaveProperty('cardCount');
      expect(settings).toHaveProperty('categories');
      expect(settings).toHaveProperty('animations');
      expect(settings).toHaveProperty('soundEffects');
      expect(settings).toHaveProperty('reducedMotion');
      expect(settings).toHaveProperty('highContrast');
      expect(settings).toHaveProperty('largeText');
      expect(settings).toHaveProperty('screenReaderSupport');
      expect(settings).toHaveProperty('autoSave');
      expect(settings).toHaveProperty('performanceMode');
      expect(settings).toHaveProperty('version');
    });

    it('should get specific setting', () => {
      expect(manager.getSetting('difficulty')).toBe(DIFFICULTY_LEVELS.MEDIUM);
      expect(manager.getSetting('cardCount')).toBe(CARD_COUNTS.SINGLE);
      expect(manager.getSetting('animations')).toBe(true);
    });

    it('should return undefined for unknown setting', () => {
      expect(manager.getSetting('unknownSetting')).toBeUndefined();
    });

    it('should get default settings', () => {
      const defaults = manager.getDefaultSettings();
      expect(defaults).toEqual(manager.getSettings());
    });
  });

  describe('Settings Updates', () => {
    it('should update single setting successfully', () => {
      const result = manager.updateSetting(
        'difficulty',
        DIFFICULTY_LEVELS.HARD
      );

      expect(result).toBe(true);
      expect(manager.getSetting('difficulty')).toBe(DIFFICULTY_LEVELS.HARD);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'timeline-game-settings',
        expect.stringContaining('"difficulty":"hard"')
      );
    });

    it('should update multiple settings successfully', () => {
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
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(1);
    });

    it('should reject unknown setting keys', () => {
      const result = manager.updateSetting('unknownSetting', 'value');

      expect(result).toBe(false);
      expect(manager.getSetting('unknownSetting')).toBeUndefined();
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    it('should handle localStorage save errors', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Save error');
      });

      const result = manager.updateSetting(
        'difficulty',
        DIFFICULTY_LEVELS.HARD
      );

      expect(result).toBe(false);
      expect(manager.getSetting('difficulty')).toBe(DIFFICULTY_LEVELS.MEDIUM); // Should revert
    });

    it('should handle multiple settings update with save error', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Save error');
      });

      const updates = {
        difficulty: DIFFICULTY_LEVELS.EASY,
        cardCount: 8,
      };

      const result = manager.updateSettings(updates);

      expect(result).toBe(false);
      expect(manager.getSetting('difficulty')).toBe(DIFFICULTY_LEVELS.MEDIUM); // Should revert
      expect(manager.getSetting('cardCount')).toBe(CARD_COUNTS.SINGLE); // Should revert
    });
  });

  describe('Settings Reset', () => {
    it('should reset settings to defaults', () => {
      // First update some settings with valid values
      const update1 = manager.updateSetting(
        'difficulty',
        DIFFICULTY_LEVELS.HARD
      );
      const update2 = manager.updateSetting('animations', false);

      // Then reset
      const result = manager.resetToDefaults();

      expect(result).toBe(true);
      expect(manager.getSetting('difficulty')).toBe(DIFFICULTY_LEVELS.MEDIUM);
      expect(manager.getSetting('animations')).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should handle reset with save error', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Save error');
      });

      const result = manager.resetToDefaults();

      expect(result).toBe(false);
      // Settings should remain unchanged
      expect(manager.getSetting('difficulty')).toBe(DIFFICULTY_LEVELS.MEDIUM);
    });
  });

  describe('Change Listeners', () => {
    it('should register and call change listeners', () => {
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

    it('should handle multiple change listeners', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      manager.onChange(listener1);
      manager.onChange(listener2);

      manager.updateSetting('animations', false);

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });

    it('should unsubscribe listeners correctly', () => {
      const listener = vi.fn();
      const unsubscribe = manager.onChange(listener);

      unsubscribe();
      manager.updateSetting('difficulty', DIFFICULTY_LEVELS.HARD);

      expect(listener).not.toHaveBeenCalled();
    });

    it('should handle listener errors gracefully', () => {
      const errorListener = vi.fn().mockImplementation(() => {
        throw new Error('Listener error');
      });

      manager.onChange(errorListener);
      manager.updateSetting('difficulty', DIFFICULTY_LEVELS.HARD);

      // Should not throw, just log error
      expect(errorListener).toHaveBeenCalled();
    });

    it('should reject non-function listeners', () => {
      const unsubscribe = manager.onChange('not a function');

      expect(unsubscribe).toBeInstanceOf(Function);
      manager.updateSetting('difficulty', DIFFICULTY_LEVELS.HARD);
      // Should not throw
    });
  });

  describe('Settings Persistence', () => {
    it('should save settings to localStorage', () => {
      manager.updateSetting('difficulty', DIFFICULTY_LEVELS.HARD);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'timeline-game-settings',
        expect.stringContaining('"difficulty":"hard"')
      );
    });

    it('should load settings from localStorage', () => {
      const savedSettings = {
        difficulty: DIFFICULTY_LEVELS.EASY,
        cardCount: 5,
        categories: ['history'],
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedSettings));

      const newManager = new SettingsManager();

      expect(newManager.getSetting('difficulty')).toBe(DIFFICULTY_LEVELS.EASY);
      expect(newManager.getSetting('cardCount')).toBe(5);
      expect(newManager.getSetting('categories')).toEqual(['history']);
    });

    it('should merge loaded settings with defaults', () => {
      const savedSettings = {
        difficulty: DIFFICULTY_LEVELS.HARD,
        // Missing other settings
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedSettings));

      const newManager = new SettingsManager();

      expect(newManager.getSetting('difficulty')).toBe(DIFFICULTY_LEVELS.HARD);
      expect(newManager.getSetting('animations')).toBe(true); // Default value
      expect(newManager.getSetting('cardCount')).toBe(CARD_COUNTS.SINGLE); // Default value
    });

    it('should clear settings from localStorage', () => {
      const result = manager.clearSettings();

      expect(result).toBe(true);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        'timeline-game-settings'
      );
    });

    it('should handle clear settings error', () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('Clear error');
      });

      const result = manager.clearSettings();

      expect(result).toBe(false);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle null localStorage value', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const newManager = new SettingsManager();

      expect(newManager.isReady()).toBe(true);
      expect(newManager.getSettings()).toEqual(manager.getDefaultSettings());
    });

    it('should handle empty localStorage value', () => {
      localStorageMock.getItem.mockReturnValue('');

      const newManager = new SettingsManager();

      expect(newManager.isReady()).toBe(true);
      expect(newManager.getSettings()).toEqual(manager.getDefaultSettings());
    });

    it('should not notify listeners for unchanged values', () => {
      const listener = vi.fn();
      manager.onChange(listener);

      manager.updateSetting('difficulty', DIFFICULTY_LEVELS.MEDIUM); // Same value

      expect(listener).not.toHaveBeenCalled();
    });

    it('should handle settings manager not initialized', () => {
      // Create a manager without calling initialize
      const uninitializedManager = new SettingsManager();
      uninitializedManager.isInitialized = false;

      const result = uninitializedManager.updateSetting(
        'difficulty',
        DIFFICULTY_LEVELS.HARD
      );

      expect(result).toBe(false);
    });
  });

  describe('Singleton Pattern', () => {
    it('should export singleton instance', async () => {
      const { default: instance1 } = await import('./settingsManager.js');
      const { default: instance2 } = await import('./settingsManager.js');

      expect(instance1).toBe(instance2);
    });
  });
});
