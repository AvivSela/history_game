import { useContext } from 'react';
import { SettingsContext } from './SettingsContext';

// Custom hook to use settings context
export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

// Hook for accessing settings with error handling
export function useSettingsSafe() {
  try {
    return useSettings();
  } catch (error) {
    return {
      settings: {},
      isLoading: false,
      error: 'Settings context not available',
      validationErrors: {},
      isInitialized: false,
      lastUpdated: null,
      updateSetting: () => false,
      updateSettings: () => false,
      resetSettings: () => false,
      getSetting: () => undefined,
      getSettings: () => ({}),
      getDefaultSettings: () => ({}),
      clearError: () => {},
      clearValidationErrors: () => {}
    };
  }
} 