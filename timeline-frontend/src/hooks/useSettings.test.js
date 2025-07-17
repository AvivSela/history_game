import { vi, describe, it, expect, beforeEach, beforeAll } from 'vitest';

vi.mock('../utils/settingsValidation', () => {
  globalThis.validateSettings = vi.fn();
  return { validateSettings: globalThis.validateSettings };
});

// Mock SettingsContext to prevent import errors
import React from 'react';
vi.mock('../contexts/SettingsContext', () => ({
  SettingsContext: React.createContext({}),
}));

import { renderHook, act } from '@testing-library/react';
import {
  useSettingsEnhanced,
  useSettingWatcher,
  useSettingsWithErrorHandling,
  useSettingsWithChangeTracking,
} from './useSettings';

// Mock the settings context hooks
const mockSettings = {
  difficulty: 'medium',
  cardCount: 5,
  categories: ['history', 'science'],
  animations: true,
  soundEffects: true,
  reducedMotion: false,
  highContrast: false,
  largeText: false,
  screenReaderSupport: true,
  autoSave: true,
  performanceMode: false,
  version: '1.0.0',
};

const mockUpdateSetting = vi.fn(() => true);
const mockUpdateSettings = vi.fn(() => true);
const mockResetSettings = vi.fn();
const mockGetSettings = vi.fn(() => mockSettings);
const mockGetSetting = vi.fn(key => mockSettings[key]);
const mockGetDefaultSettings = vi.fn(() => ({
  difficulty: 'easy',
  cardCount: 3,
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
}));
const mockClearError = vi.fn();
const mockClearValidationErrors = vi.fn();

// Mock the settings context hooks
vi.mock('../contexts/settingsHooks', () => ({
  useSettings: vi.fn(() => ({
    settings: mockSettings,
    isLoading: false,
    error: null,
    validationErrors: {},
    isInitialized: true,
    updateSetting: mockUpdateSetting,
    updateSettings: mockUpdateSettings,
    resetSettings: mockResetSettings,
    getSettings: mockGetSettings,
    getSetting: mockGetSetting,
    getDefaultSettings: mockGetDefaultSettings,
    clearError: mockClearError,
    clearValidationErrors: mockClearValidationErrors,
  })),
  useSettingsSafe: vi.fn(() => ({
    settings: mockSettings,
    isLoading: false,
    error: null,
    validationErrors: {},
    isInitialized: true,
    updateSetting: mockUpdateSetting,
    updateSettings: mockUpdateSettings,
    resetSettings: mockResetSettings,
    getSettings: mockGetSettings,
    getSetting: mockGetSetting,
    getDefaultSettings: mockGetDefaultSettings,
    clearError: mockClearError,
    clearValidationErrors: mockClearValidationErrors,
  })),
}));

describe('useSettingsEnhanced Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.validateSettings.mockReset();
    globalThis.validateSettings.mockReturnValue({
      isValid: true,
      errors: {},
    });
  });

  describe('Basic Functionality', () => {
    it('returns settings context with enhanced methods', () => {
      const { result } = renderHook(() => useSettingsEnhanced());

      expect(result.current.settings).toEqual(mockSettings);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.validationErrors).toEqual({});
    });

    it('provides enhanced update methods', () => {
      const { result } = renderHook(() => useSettingsEnhanced());

      expect(typeof result.current.updateSettingWithValidation).toBe(
        'function'
      );
      expect(typeof result.current.updateMultipleSettingsWithValidation).toBe(
        'function'
      );
      expect(typeof result.current.restoreSettings).toBe('function');
    });

    it('provides utility methods', () => {
      const { result } = renderHook(() => useSettingsEnhanced());

      expect(typeof result.current.hasUnsavedChanges).toBe('function');
      expect(typeof result.current.getSettingsDiff).toBe('function');
      expect(typeof result.current.isReady).toBe('function');
      expect(typeof result.current.hasError).toBe('function');
      expect(typeof result.current.hasValidationErrors).toBe('function');
      expect(typeof result.current.getValidationError).toBe('function');
      expect(typeof result.current.clearAllErrors).toBe('function');
    });
  });

  describe('updateSettingWithValidation', () => {
    it('updates setting with validation when validation passes', () => {
      globalThis.validateSettings.mockReturnValue({
        isValid: true,
        errors: {},
      });
      const { result } = renderHook(() => useSettingsEnhanced());
      act(() => {
        const updateResult = result.current.updateSettingWithValidation(
          'difficulty',
          'hard'
        );
        expect(updateResult.success).toBe(true);
        expect(updateResult.error).toBe(null);
      });
      expect(mockUpdateSetting).toHaveBeenCalledWith('difficulty', 'hard');
    });

    it('returns error when validation fails', () => {
      globalThis.validateSettings.mockReturnValue({
        isValid: false,
        errors: { difficulty: 'Invalid difficulty level' },
      });
      const { result } = renderHook(() => useSettingsEnhanced());
      act(() => {
        const updateResult = result.current.updateSettingWithValidation(
          'difficulty',
          'invalid'
        );
        expect(updateResult.success).toBe(false);
        expect(updateResult.error).toBe('Invalid difficulty level');
      });
      expect(mockUpdateSetting).not.toHaveBeenCalled();
    });

    it('calls onValidationError callback when validation fails', () => {
      globalThis.validateSettings.mockReturnValue({
        isValid: false,
        errors: { difficulty: 'Invalid difficulty level' },
      });
      const onValidationError = vi.fn();
      const { result } = renderHook(() =>
        useSettingsEnhanced({ onValidationError })
      );
      act(() => {
        result.current.updateSettingWithValidation('difficulty', 'invalid');
      });
      expect(onValidationError).toHaveBeenCalledWith(
        { difficulty: 'Invalid difficulty level' },
        {}
      );
    });

    it('skips validation when validate option is false', () => {
      globalThis.validateSettings.mockReturnValue({
        isValid: true,
        errors: {},
      });
      const { result } = renderHook(() => useSettingsEnhanced());
      act(() => {
        const updateResult = result.current.updateSettingWithValidation(
          'difficulty',
          'hard',
          { validate: false }
        );
        expect(updateResult.success).toBe(true);
      });
      expect(mockUpdateSetting).toHaveBeenCalledWith('difficulty', 'hard');
    });
  });

  describe('updateMultipleSettingsWithValidation', () => {
    it('updates multiple settings when validation passes', () => {
      globalThis.validateSettings.mockReturnValue({
        isValid: true,
        errors: {},
      });
      const { result } = renderHook(() => useSettingsEnhanced());
      act(() => {
        const updateResult =
          result.current.updateMultipleSettingsWithValidation({
            difficulty: 'hard',
            cardCount: 7,
          });
        expect(updateResult.success).toBe(true);
        expect(updateResult.errors).toEqual({});
      });
      expect(mockUpdateSettings).toHaveBeenCalledWith({
        difficulty: 'hard',
        cardCount: 7,
      });
    });

    it('returns errors when validation fails', () => {
      globalThis.validateSettings.mockReturnValue({
        isValid: false,
        errors: {
          difficulty: 'Invalid difficulty',
          cardCount: 'Invalid count',
        },
      });
      const { result } = renderHook(() => useSettingsEnhanced());
      act(() => {
        const updateResult =
          result.current.updateMultipleSettingsWithValidation({
            difficulty: 'invalid',
            cardCount: -1,
          });
        expect(updateResult.success).toBe(false);
        expect(updateResult.errors).toEqual({
          difficulty: 'Invalid difficulty',
          cardCount: 'Invalid count',
        });
      });
      expect(mockUpdateSettings).not.toHaveBeenCalled();
    });
  });

  describe('restoreSettings', () => {
    it('restores settings from backup when validation passes', () => {
      globalThis.validateSettings.mockReturnValue({
        isValid: true,
        errors: {},
      });
      const backupSettings = { difficulty: 'easy', cardCount: 3 };
      const { result } = renderHook(() => useSettingsEnhanced());
      act(() => {
        const restoreResult = result.current.restoreSettings(backupSettings);
        expect(restoreResult.success).toBe(true);
        expect(restoreResult.errors).toEqual({});
      });
      expect(mockUpdateSettings).toHaveBeenCalledWith(backupSettings);
    });

    it('returns error when backup validation fails', () => {
      globalThis.validateSettings.mockReturnValue({
        isValid: false,
        errors: { difficulty: 'Invalid difficulty' },
      });
      const backupSettings = { difficulty: 'invalid' };
      const { result } = renderHook(() => useSettingsEnhanced());
      act(() => {
        const restoreResult = result.current.restoreSettings(backupSettings);
        expect(restoreResult.success).toBe(false);
        expect(restoreResult.errors).toEqual({
          difficulty: 'Invalid difficulty',
        });
      });
      expect(mockUpdateSettings).not.toHaveBeenCalled();
    });

    it('handles exceptions during restoration', () => {
      globalThis.validateSettings.mockReturnValue({
        isValid: true,
        errors: {},
      });
      mockUpdateSettings.mockImplementation(() => {
        throw new Error('Storage error');
      });
      const backupSettings = { difficulty: 'easy' };
      const { result } = renderHook(() => useSettingsEnhanced());
      act(() => {
        const restoreResult = result.current.restoreSettings(backupSettings);
        expect(restoreResult.success).toBe(false);
        expect(restoreResult.errors.general).toBe('Storage error');
      });
    });
  });

  describe('hasUnsavedChanges', () => {
    it('returns true when settings differ from defaults', () => {
      const { result } = renderHook(() => useSettingsEnhanced());

      const hasChanges = result.current.hasUnsavedChanges();
      expect(hasChanges).toBe(true);
    });

    it('returns false when settings match defaults', () => {
      mockGetSettings.mockReturnValue({
        difficulty: 'easy',
        cardCount: 3,
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

      const { result } = renderHook(() => useSettingsEnhanced());

      const hasChanges = result.current.hasUnsavedChanges();
      expect(hasChanges).toBe(false);
    });
  });

  describe('getSettingsDiff', () => {
    it.skip('returns differences between current and default settings', () => {
      const { result } = renderHook(() => useSettingsEnhanced());

      const diff = result.current.getSettingsDiff();
      expect(diff).toEqual({
        difficulty: { current: 'medium', default: 'easy' },
        cardCount: { current: 5, default: 3 },
        categories: { current: ['history', 'science'], default: [] },
      });
    });

    it.skip('returns empty object when no differences', () => {
      mockGetSettings.mockReturnValue({
        difficulty: 'easy',
        cardCount: 3,
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

      const { result } = renderHook(() => useSettingsEnhanced());

      const diff = result.current.getSettingsDiff();
      expect(diff).toEqual({});
    });
  });

  describe('Utility Methods', () => {
    it('isReady returns true when initialized and not loading', () => {
      const { result } = renderHook(() => useSettingsEnhanced());

      expect(result.current.isReady()).toBe(true);
    });

    it.skip('hasError returns true when error exists', () => {
      const { useSettings } = require('../contexts/settingsHooks');
      useSettings.mockReturnValue({
        settings: mockSettings,
        isLoading: false,
        error: 'Test error',
        validationErrors: {},
        isInitialized: true,
        updateSetting: mockUpdateSetting,
        updateSettings: mockUpdateSettings,
        resetSettings: mockResetSettings,
        getSettings: mockGetSettings,
        getSetting: mockGetSetting,
        getDefaultSettings: mockGetDefaultSettings,
        clearError: mockClearError,
        clearValidationErrors: mockClearValidationErrors,
      });

      const { result } = renderHook(() => useSettingsEnhanced());

      expect(result.current.hasError()).toBe(true);
    });

    it.skip('hasValidationErrors returns true when validation errors exist', () => {
      const { useSettings } = require('../contexts/settingsHooks');
      useSettings.mockReturnValue({
        settings: mockSettings,
        isLoading: false,
        error: null,
        validationErrors: { difficulty: 'Invalid difficulty' },
        isInitialized: true,
        updateSetting: mockUpdateSetting,
        updateSettings: mockUpdateSettings,
        resetSettings: mockResetSettings,
        getSettings: mockGetSettings,
        getSetting: mockGetSetting,
        getDefaultSettings: mockGetDefaultSettings,
        clearError: mockClearError,
        clearValidationErrors: mockClearValidationErrors,
      });

      const { result } = renderHook(() => useSettingsEnhanced());

      expect(result.current.hasValidationErrors()).toBe(true);
    });

    it.skip('getValidationError returns specific error', () => {
      const { useSettings } = require('../contexts/settingsHooks');
      useSettings.mockReturnValue({
        settings: mockSettings,
        isLoading: false,
        error: null,
        validationErrors: { difficulty: 'Invalid difficulty' },
        isInitialized: true,
        updateSetting: mockUpdateSetting,
        updateSettings: mockUpdateSettings,
        resetSettings: mockResetSettings,
        getSettings: mockGetSettings,
        getSetting: mockGetSetting,
        getDefaultSettings: mockGetDefaultSettings,
        clearError: mockClearError,
        clearValidationErrors: mockClearValidationErrors,
      });

      const { result } = renderHook(() => useSettingsEnhanced());

      expect(result.current.getValidationError('difficulty')).toBe(
        'Invalid difficulty'
      );
      expect(result.current.getValidationError('nonexistent')).toBeUndefined();
    });

    it('clearAllErrors clears both error and validation errors', () => {
      const { result } = renderHook(() => useSettingsEnhanced());

      act(() => {
        result.current.clearAllErrors();
      });

      expect(mockClearError).toHaveBeenCalled();
      expect(mockClearValidationErrors).toHaveBeenCalled();
    });
  });

  describe('useSettingWatcher Hook', () => {
    it('watches for specific setting changes', () => {
      const callback = vi.fn();
      const { result } = renderHook(() =>
        useSettingWatcher('difficulty', callback)
      );

      // The hook should be available but the callback won't be called in this test
      // since we're not simulating setting changes
      expect(typeof result.current).toBe('undefined'); // useSettingWatcher doesn't return anything
    });
  });

  describe('useSettingsWithErrorHandling Hook', () => {
    it('provides settings with error handling', () => {
      const { result } = renderHook(() => useSettingsWithErrorHandling());

      expect(result.current.settings).toEqual(mockSettings);
      expect(typeof result.current.updateSettingWithValidation).toBe(
        'function'
      );
    });
  });

  describe('useSettingsWithChangeTracking Hook', () => {
    it('provides settings with change tracking', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useSettingsWithChangeTracking(onChange)
      );

      expect(result.current.settings).toEqual(mockSettings);
      expect(typeof result.current.updateSettingWithValidation).toBe(
        'function'
      );
    });
  });

  describe('Safe Mode', () => {
    it('uses safe context when safe option is true', () => {
      const { result } = renderHook(() => useSettingsEnhanced({ safe: true }));

      expect(result.current.settings).toEqual(mockSettings);
      expect(typeof result.current.updateSettingWithValidation).toBe(
        'function'
      );
    });
  });

  describe('Change Callbacks', () => {
    it.skip('calls onChange callback when settings change', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => useSettingsEnhanced({ onChange }));

      // Simulate settings change by re-rendering with different settings
      const { useSettings } = require('../contexts/settingsHooks');
      useSettings.mockReturnValue({
        settings: { ...mockSettings, difficulty: 'hard' },
        isLoading: false,
        error: null,
        validationErrors: {},
        isInitialized: true,
        updateSetting: mockUpdateSetting,
        updateSettings: mockUpdateSettings,
        resetSettings: mockResetSettings,
        getSettings: mockGetSettings,
        getSetting: mockGetSetting,
        getDefaultSettings: mockGetDefaultSettings,
        clearError: mockClearError,
        clearValidationErrors: mockClearValidationErrors,
      });

      // Re-render to trigger the effect
      renderHook(() => useSettingsEnhanced({ onChange }));

      // The callback should be called with the new settings
      expect(onChange).toHaveBeenCalled();
    });

    it.skip('calls onError callback when error changes', () => {
      const onError = vi.fn();
      const { result } = renderHook(() => useSettingsEnhanced({ onError }));

      // Simulate error change
      const { useSettings } = require('../contexts/settingsHooks');
      useSettings.mockReturnValue({
        settings: mockSettings,
        isLoading: false,
        error: 'New error',
        validationErrors: {},
        isInitialized: true,
        updateSetting: mockUpdateSetting,
        updateSettings: mockUpdateSettings,
        resetSettings: mockResetSettings,
        getSettings: mockGetSettings,
        getSetting: mockGetSetting,
        getDefaultSettings: mockGetDefaultSettings,
        clearError: mockClearError,
        clearValidationErrors: mockClearValidationErrors,
      });

      // Re-render to trigger the effect
      renderHook(() => useSettingsEnhanced({ onError }));

      expect(onError).toHaveBeenCalled();
    });

    it.skip('calls onValidationError callback when validation errors change', () => {
      const onValidationError = vi.fn();
      const { result } = renderHook(() =>
        useSettingsEnhanced({ onValidationError })
      );

      // Simulate validation error change
      const { useSettings } = require('../contexts/settingsHooks');
      useSettings.mockReturnValue({
        settings: mockSettings,
        isLoading: false,
        error: null,
        validationErrors: { difficulty: 'Invalid difficulty' },
        isInitialized: true,
        updateSetting: mockUpdateSetting,
        updateSettings: mockUpdateSettings,
        resetSettings: mockResetSettings,
        getSettings: mockGetSettings,
        getSetting: mockGetSetting,
        getDefaultSettings: mockGetDefaultSettings,
        clearError: mockClearError,
        clearValidationErrors: mockClearValidationErrors,
      });

      // Re-render to trigger the effect
      renderHook(() => useSettingsEnhanced({ onValidationError }));

      expect(onValidationError).toHaveBeenCalled();
    });
  });
});
