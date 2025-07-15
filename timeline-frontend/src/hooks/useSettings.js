import { useEffect, useCallback, useRef } from 'react';
import { useSettings, useSettingsSafe } from '../contexts/SettingsContext';
import { validateSettings } from '../utils/settingsValidation';

/**
 * Enhanced useSettings hook with additional functionality
 * @param {Object} options - Hook options
 * @param {boolean} options.safe - Whether to use safe mode (won't throw if context not available)
 * @param {Function} options.onChange - Callback when settings change
 * @param {Function} options.onError - Callback when errors occur
 * @param {Function} options.onValidationError - Callback when validation errors occur
 * @returns {Object} Settings hook interface
 */
export function useSettingsEnhanced(options = {}) {
  const {
    safe = false,
    onChange,
    onError,
    onValidationError
  } = options;

  // Use safe or regular settings context
  const settingsContext = safe ? useSettingsSafe() : useSettings();
  
  // Refs for tracking previous values
  const prevSettingsRef = useRef({});
  const prevErrorRef = useRef(null);
  const prevValidationErrorsRef = useRef({});

  // Call change callback when settings change
  useEffect(() => {
    if (onChange && typeof onChange === 'function') {
      const currentSettings = settingsContext.settings;
      const prevSettings = prevSettingsRef.current;
      
      // Check if settings actually changed
      const hasChanged = JSON.stringify(currentSettings) !== JSON.stringify(prevSettings);
      
      if (hasChanged) {
        onChange(currentSettings, prevSettings);
        prevSettingsRef.current = { ...currentSettings };
      }
    }
  }, [settingsContext.settings, onChange]);

  // Call error callback when errors change
  useEffect(() => {
    if (onError && typeof onError === 'function') {
      const currentError = settingsContext.error;
      const prevError = prevErrorRef.current;
      
      if (currentError !== prevError) {
        onError(currentError, prevError);
        prevErrorRef.current = currentError;
      }
    }
  }, [settingsContext.error, onError]);

  // Call validation error callback when validation errors change
  useEffect(() => {
    if (onValidationError && typeof onValidationError === 'function') {
      const currentValidationErrors = settingsContext.validationErrors;
      const prevValidationErrors = prevValidationErrorsRef.current;
      
      const hasValidationErrorsChanged = JSON.stringify(currentValidationErrors) !== JSON.stringify(prevValidationErrors);
      
      if (hasValidationErrorsChanged) {
        onValidationError(currentValidationErrors, prevValidationErrors);
        prevValidationErrorsRef.current = { ...currentValidationErrors };
      }
    }
  }, [settingsContext.validationErrors, onValidationError]);

  // Enhanced update setting with validation
  const updateSettingWithValidation = useCallback((key, value, options = {}) => {
    const { validate = true, immediate = false } = options;
    
    if (validate) {
      const validation = validateSettings({ [key]: value });
      if (validation.errors[key]) {
        if (onValidationError) {
          onValidationError({ [key]: validation.errors[key] }, {});
        }
        return { success: false, error: validation.errors[key] };
      }
    }

    const success = settingsContext.updateSetting(key, value);
    return { success, error: success ? null : 'Failed to update setting' };
  }, [settingsContext.updateSetting, onValidationError]);

  // Enhanced update multiple settings with validation
  const updateMultipleSettingsWithValidation = useCallback((updates, options = {}) => {
    const { validate = true, immediate = false } = options;
    
    if (validate) {
      const validation = validateSettings(updates);
      if (Object.keys(validation.errors).length > 0) {
        if (onValidationError) {
          onValidationError(validation.errors, {});
        }
        return { success: false, errors: validation.errors };
      }
    }

    const success = settingsContext.updateSettings(updates);
    return { success, errors: success ? {} : { general: 'Failed to update settings' } };
  }, [settingsContext.updateSettings, onValidationError]);

  // Restore settings from backup
  const restoreSettings = useCallback((backupSettings) => {
    try {
      const validation = validateSettings(backupSettings);
      if (Object.keys(validation.errors).length > 0) {
        return { success: false, errors: validation.errors };
      }

      const success = settingsContext.updateSettings(backupSettings);
      return { success, errors: success ? {} : { general: 'Failed to restore settings' } };
    } catch (error) {
      return { success: false, errors: { general: error.message } };
    }
  }, [settingsContext.updateSettings]);



  // Check if settings have unsaved changes
  const hasUnsavedChanges = useCallback(() => {
    const currentSettings = settingsContext.getSettings();
    const defaultSettings = settingsContext.getDefaultSettings();
    
    return JSON.stringify(currentSettings) !== JSON.stringify(defaultSettings);
  }, [settingsContext.getSettings, settingsContext.getDefaultSettings]);

  // Get settings diff (what has changed from defaults)
  const getSettingsDiff = useCallback(() => {
    const currentSettings = settingsContext.getSettings();
    const defaultSettings = settingsContext.getDefaultSettings();
    const diff = {};

    Object.keys(currentSettings).forEach(key => {
      if (currentSettings[key] !== defaultSettings[key]) {
        diff[key] = {
          current: currentSettings[key],
          default: defaultSettings[key]
        };
      }
    });

    return diff;
  }, [settingsContext.getSettings, settingsContext.getDefaultSettings]);

  // Watch a specific setting for changes
  const useSettingWatcher = useCallback((key, callback) => {
    useEffect(() => {
      const currentValue = settingsContext.getSetting(key);
      const prevValue = prevSettingsRef.current[key];
      
      if (currentValue !== prevValue) {
        callback(currentValue, prevValue, key);
      }
    }, [settingsContext.getSetting(key), callback, key]);
  }, [settingsContext.getSetting]);

  // Enhanced interface
  return {
    // Original context interface
    ...settingsContext,
    
    // Enhanced methods
    updateSettingWithValidation,
    updateMultipleSettingsWithValidation,
    restoreSettings,

    hasUnsavedChanges,
    getSettingsDiff,
    useSettingWatcher,
    
    // Utility methods
    isReady: () => settingsContext.isInitialized && !settingsContext.isLoading,
    hasError: () => !!settingsContext.error,
    hasValidationErrors: () => Object.keys(settingsContext.validationErrors).length > 0,
    getValidationError: (key) => settingsContext.validationErrors[key],
    clearAllErrors: () => {
      settingsContext.clearError();
      settingsContext.clearValidationErrors();
    }
  };
}

// Convenience hook for watching specific settings
export function useSettingWatcher(key, callback) {
  const { useSettingWatcher } = useSettingsEnhanced();
  useSettingWatcher(key, callback);
}

// Hook for settings with automatic error handling
export function useSettingsWithErrorHandling() {
  const settings = useSettingsEnhanced({
    onError: (error) => {
      // Settings error
    },
    onValidationError: (errors) => {
      // Settings validation errors
    }
  });

  return settings;
}

// Hook for settings with change tracking
export function useSettingsWithChangeTracking(onChange) {
  return useSettingsEnhanced({ onChange });
}

// Default export for backward compatibility
export default useSettingsEnhanced; 