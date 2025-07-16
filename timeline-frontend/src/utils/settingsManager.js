import { DIFFICULTY_LEVELS, CARD_COUNTS } from '../constants/gameConstants.js';

/**
 * SettingsManager - Manages game settings with persistence and validation
 *
 * This class provides a centralized way to manage all game settings including
 * difficulty levels, card counts, categories, and user preferences. It handles
 * localStorage persistence, validation, and change event notifications.
 *
 * @example
 * ```javascript
 * const settingsManager = new SettingsManager();
 *
 * // Get current settings
 * const settings = settingsManager.getSettings();
 *
 * // Update a setting
 * settingsManager.updateSetting('difficulty', 'hard');
 *
 * // Listen for changes
 * settingsManager.onChange((settings) => {
 *   console.log('Settings changed:', settings);
 * });
 * ```
 */
class SettingsManager {
  constructor() {
    this.storageKey = 'timeline-game-settings';
    this.defaultSettings = {
      // Game settings
      difficulty: DIFFICULTY_LEVELS.MEDIUM,
      cardCount: CARD_COUNTS.SINGLE,
      categories: [], // Empty array means all categories

      // UI settings
      animations: true,
      soundEffects: true,
      reducedMotion: false,

      // Accessibility settings
      highContrast: false,
      largeText: false,
      screenReaderSupport: true,

      // Performance settings
      autoSave: true,
      performanceMode: false,

      // Version for migration
      version: '1.0.0',
    };

    this.settings = { ...this.defaultSettings };
    this.changeListeners = [];
    this.isInitialized = false;

    this.initialize();
  }

  /**
   * Initialize settings manager by loading from localStorage
   * @private
   */
  initialize() {
    try {
      this.loadSettings();
      this.isInitialized = true;
    } catch (error) {
      // Fallback to default settings
      this.settings = { ...this.defaultSettings };
      this.isInitialized = true;
    }
  }

  /**
   * Load settings from localStorage with error handling
   * @private
   */
  loadSettings() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        // Merge with defaults to handle missing properties
        this.settings = {
          ...this.defaultSettings,
          ...parsedSettings,
        };
      } else {
        // No saved settings found, using defaults
      }
    } catch (error) {
      throw new Error('Failed to load settings from storage');
    }
  }

  /**
   * Save settings to localStorage with validation
   * @private
   */
  saveSettings() {
    try {
      const settingsToSave = { ...this.settings };
      localStorage.setItem(this.storageKey, JSON.stringify(settingsToSave));
    } catch (error) {
      throw new Error('Failed to save settings to storage');
    }
  }

  /**
   * Get all current settings
   * @returns {Object} Current settings object
   */
  getSettings() {
    return { ...this.settings };
  }

  /**
   * Get a specific setting value
   * @param {string} key - Setting key to retrieve
   * @returns {*} Setting value or undefined if not found
   */
  getSetting(key) {
    return this.settings[key];
  }

  /**
   * Update a single setting
   * @param {string} key - Setting key to update
   * @param {*} value - New value for the setting
   * @returns {boolean} True if setting was updated successfully
   */
  updateSetting(key, value) {
    if (!this.isInitialized) {
      return false;
    }

    if (!(key in this.defaultSettings)) {
      return false;
    }

    const oldValue = this.settings[key];
    this.settings[key] = value;

    try {
      this.saveSettings();
      this.notifyChangeListeners(key, value, oldValue);
      return true;
    } catch (error) {
      // Revert on save failure
      this.settings[key] = oldValue;
      return false;
    }
  }

  /**
   * Update multiple settings at once
   * @param {Object} settings - Object containing settings to update
   * @returns {boolean} True if all settings were updated successfully
   */
  updateSettings(settings) {
    if (!this.isInitialized) {
      return false;
    }

    const oldSettings = { ...this.settings };
    const updates = {};

    // Validate all settings before applying any
    for (const [key, value] of Object.entries(settings)) {
      if (!(key in this.defaultSettings)) {
        return false;
      }
      updates[key] = value;
    }

    // Apply all updates
    Object.assign(this.settings, updates);

    try {
      this.saveSettings();
      // Notify listeners for each changed setting
      Object.entries(updates).forEach(([key, value]) => {
        this.notifyChangeListeners(key, value, oldSettings[key]);
      });
      return true;
    } catch (error) {
      // Revert all changes on save failure
      this.settings = oldSettings;
      return false;
    }
  }

  /**
   * Reset settings to defaults
   * @returns {boolean} True if reset was successful
   */
  resetToDefaults() {
    if (!this.isInitialized) {
      return false;
    }

    const oldSettings = { ...this.settings };
    this.settings = { ...this.defaultSettings };

    try {
      this.saveSettings();
      // Notify listeners for all settings
      Object.keys(this.settings).forEach(key => {
        this.notifyChangeListeners(key, this.settings[key], oldSettings[key]);
      });
      return true;
    } catch (error) {
      // Revert on save failure
      this.settings = oldSettings;
      return false;
    }
  }

  /**
   * Add a change listener
   * @param {Function} listener - Function to call when settings change
   * @returns {Function} Unsubscribe function
   */
  onChange(listener) {
    if (typeof listener !== 'function') {
      return () => {};
    }

    this.changeListeners.push(listener);

    // Return unsubscribe function
    return () => {
      const index = this.changeListeners.indexOf(listener);
      if (index > -1) {
        this.changeListeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all change listeners
   * @param {string} key - Setting key that changed
   * @param {*} newValue - New value
   * @param {*} oldValue - Previous value
   * @private
   */
  notifyChangeListeners(key, newValue, oldValue) {
    if (newValue === oldValue) return;

    const changeInfo = {
      key,
      newValue,
      oldValue,
      timestamp: Date.now(),
      allSettings: { ...this.settings },
    };

    this.changeListeners.forEach(listener => {
      try {
        listener(changeInfo);
      } catch (error) {
        // Error in settings change listener
      }
    });
  }

  /**
   * Check if settings manager is ready
   * @returns {boolean} True if initialized
   */
  isReady() {
    return this.isInitialized;
  }

  /**
   * Get default settings
   * @returns {Object} Default settings object
   */
  getDefaultSettings() {
    return { ...this.defaultSettings };
  }

  /**
   * Clear all settings from localStorage
   * @returns {boolean} True if cleared successfully
   */
  clearSettings() {
    try {
      localStorage.removeItem(this.storageKey);
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Create singleton instance
const settingsManager = new SettingsManager();

export { SettingsManager };
export default settingsManager;
