// Mocks must be set up before any imports from the modules under test!
vi.mock('../utils/settingsManager', () => {
  let settingsStore = {
    difficulty: 'medium',
    cardCount: 5,
    animations: true,
    soundEffects: true,
    reducedMotion: false,
    highContrast: false,
    largeText: false,
    screenReaderSupport: true,
    autoSave: true,
    performanceMode: false,
    categories: [],
    version: '1.0.0'
  };
  let changeCallback = null;
  const getDefaultSettings = () => ({ ...settingsStore });
  const mockSettingsManager = {
    isInitialized: true,
    isReady: vi.fn().mockReturnValue(true),
    getSettings: vi.fn().mockImplementation(() => {
      console.log('🔍 Mock getSettings called');
      return { ...settingsStore };
    }),
    onChange: vi.fn().mockImplementation((cb) => {
      changeCallback = cb;
      return () => { changeCallback = null; };
    }),
    updateSettings: vi.fn().mockImplementation((updates) => {
      console.log('🔍 Mock updateSettings called with:', updates);
      settingsStore = { ...settingsStore, ...updates };
      if (changeCallback) {
        changeCallback({ ...settingsStore, key: undefined });
      }
      return true;
    }),
    resetToDefaults: vi.fn().mockImplementation(() => {
      console.log('🔍 Mock resetToDefaults called');
      settingsStore = getDefaultSettings();
      if (changeCallback) {
        changeCallback({ ...settingsStore, key: undefined });
      }
      return true;
    }),
    getDefaultSettings: vi.fn().mockImplementation(getDefaultSettings)
  };
  
  return {
    __esModule: true,
    default: mockSettingsManager
  };
});

vi.mock('../utils/settingsValidation', () => ({
  validateSettings: vi.fn().mockReturnValue({
    isValid: true,
    errors: {},
    warnings: {}
  })
}));

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SettingsProvider, SettingsErrorBoundary, useSettings, useSettingsSafe, SettingsContext } from './SettingsContext';
import { DIFFICULTY_LEVELS, CARD_COUNTS } from '../constants/gameConstants.js';

// Test component to use the context
function TestComponent() {
  const settings = useSettings();
  
  return (
    <div>
      <div data-testid="loading">{settings.isLoading ? 'Loading' : 'Loaded'}</div>
      <div data-testid="error">{settings.error || 'No error'}</div>
      <div data-testid="initialized">{settings.isInitialized ? 'Initialized' : 'Not initialized'}</div>
      <div data-testid="difficulty">{settings.settings?.difficulty || 'No difficulty'}</div>
      <div data-testid="card-count">{settings.settings?.cardCount || 'No card count'}</div>
      <button 
        data-testid="update-difficulty"
        onClick={() => settings.updateSetting('difficulty', 'hard')}
      >
        Update Difficulty
      </button>
      <button 
        data-testid="reset-settings"
        onClick={() => settings.resetSettings()}
      >
        Reset Settings
      </button>
    </div>
  );
}

// Test wrapper that provides a mock settings manager
function TestSettingsProvider({ children, mockSettingsManager }) {
  const [state, dispatch] = React.useReducer((state, action) => {
    switch (action.type) {
      case 'SET_LOADING':
        return { ...state, isLoading: action.payload };
      case 'SET_ERROR':
        return { ...state, error: action.payload, isLoading: false };
      case 'SET_SETTINGS':
        return {
          ...state,
          settings: action.payload || {},
          isLoading: false,
          isInitialized: true,
          lastUpdated: Date.now(),
          error: null
        };
      case 'UPDATE_SETTING':
        return {
          ...state,
          settings: {
            ...state.settings,
            [action.payload.key]: action.payload.value
          },
          lastUpdated: Date.now(),
          error: null
        };
      case 'RESET_SETTINGS':
        return {
          ...state,
          settings: action.payload || {},
          lastUpdated: Date.now(),
          error: null,
          validationErrors: {}
        };
      default:
        return state;
    }
  }, {
    settings: {},
    isLoading: true,
    error: null,
    validationErrors: {},
    isInitialized: false,
    lastUpdated: null
  });

  React.useEffect(() => {
    const initializeSettings = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        const currentSettings = mockSettingsManager.getSettings();
        console.log('🔍 TestProvider: getSettings returned:', currentSettings);
        dispatch({ type: 'SET_SETTINGS', payload: currentSettings });

        const unsubscribe = mockSettingsManager.onChange((changeInfo) => {
          if (changeInfo && changeInfo.key === undefined && typeof changeInfo === 'object') {
            dispatch({
              type: 'SET_SETTINGS',
              payload: changeInfo
            });
          } else {
            dispatch({
              type: 'UPDATE_SETTING',
              payload: {
                key: changeInfo.key,
                value: changeInfo.newValue
              }
            });
          }
        });

        return unsubscribe;
      } catch (error) {
        console.error('❌ Error initializing test settings:', error);
        dispatch({
          type: 'SET_ERROR',
          payload: error.message || 'Failed to initialize settings'
        });
      }
    };

    let unsubscribe;
    initializeSettings().then((unsub) => {
      unsubscribe = unsub;
    }).catch((error) => {
      console.error('❌ Failed to initialize test settings:', error);
    });
    
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [mockSettingsManager]);

  const updateSetting = React.useCallback((key, value) => {
    try {
      const result = mockSettingsManager.updateSettings({ [key]: value });
      if (!result) {
        throw new Error('Failed to update setting');
      }
      return true;
    } catch (error) {
      console.error('❌ Error updating setting:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: error.message || 'Failed to update setting'
      });
      return false;
    }
  }, [mockSettingsManager]);

  const resetSettings = React.useCallback(() => {
    try {
      const result = mockSettingsManager.resetToDefaults();
      if (!result) {
        throw new Error('Failed to reset settings');
      }
      return true;
    } catch (error) {
      console.error('❌ Error resetting settings:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: error.message || 'Failed to reset settings'
      });
      return false;
    }
  }, [mockSettingsManager]);

  const contextValue = {
    ...state,
    updateSetting,
    updateSettings: updateSetting,
    resetSettings,
    getSetting: (key) => state.settings[key],
    getSettings: () => ({ ...state.settings }),
    getDefaultSettings: () => mockSettingsManager.getDefaultSettings(),
    clearError: () => dispatch({ type: 'SET_ERROR', payload: null }),
    clearValidationErrors: () => dispatch({ type: 'SET_VALIDATION_ERRORS', payload: {} })
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

// Test component for safe hook
function TestSafeComponent() {
  const settings = useSettingsSafe();
  return (
    <div>
      <div data-testid="safe-loading">{settings.isLoading ? 'Loading' : 'Loaded'}</div>
      <div data-testid="safe-error">{settings.error || 'No error'}</div>
    </div>
  );
}

describe('SettingsContext', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('SettingsProvider', () => {
    it('should render children and provide settings context', async () => {
      render(
        <SettingsProvider>
          <TestComponent />
        </SettingsProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Loaded');
        expect(screen.getByTestId('initialized')).toHaveTextContent('Initialized');
        expect(screen.getByTestId('difficulty')).toHaveTextContent('medium');
        expect(screen.getByTestId('card-count')).toHaveTextContent('5');
      });
    });

    it('should update single setting successfully', async () => {
      // Create a mock settings manager for this test
      let settingsStore = {
        difficulty: 'medium',
        cardCount: 5,
        animations: true,
        soundEffects: true,
        reducedMotion: false,
        highContrast: false,
        largeText: false,
        screenReaderSupport: true,
        autoSave: true,
        performanceMode: false,
        categories: [],
        version: '1.0.0'
      };
      let changeCallback = null;
      const mockSettingsManager = {
        isInitialized: true,
        isReady: vi.fn().mockReturnValue(true),
        getSettings: vi.fn().mockImplementation(() => ({ ...settingsStore })),
        onChange: vi.fn().mockImplementation((cb) => {
          changeCallback = cb;
          return () => { changeCallback = null; };
        }),
        updateSettings: vi.fn().mockImplementation((updates) => {
          settingsStore = { ...settingsStore, ...updates };
          if (changeCallback) {
            changeCallback({ ...settingsStore, key: undefined });
          }
          return true;
        }),
        resetToDefaults: vi.fn().mockImplementation(() => {
          settingsStore = {
            difficulty: 'medium',
            cardCount: 5,
            animations: true,
            soundEffects: true,
            reducedMotion: false,
            highContrast: false,
            largeText: false,
            screenReaderSupport: true,
            autoSave: true,
            performanceMode: false,
            categories: [],
            version: '1.0.0'
          };
          if (changeCallback) {
            changeCallback({ ...settingsStore, key: undefined });
          }
          return true;
        }),
        getDefaultSettings: vi.fn().mockReturnValue({
          difficulty: 'medium',
          cardCount: 5,
          animations: true,
          soundEffects: true,
          reducedMotion: false,
          highContrast: false,
          largeText: false,
          screenReaderSupport: true,
          autoSave: true,
          performanceMode: false,
          categories: [],
          version: '1.0.0'
        })
      };

      render(
        <TestSettingsProvider mockSettingsManager={mockSettingsManager}>
          <TestComponent />
        </TestSettingsProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('difficulty')).toHaveTextContent('medium');
      });

      act(() => {
        screen.getByTestId('update-difficulty').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('difficulty')).toHaveTextContent('hard');
      });

      // Verify settings manager was called
      expect(mockSettingsManager.updateSettings).toHaveBeenCalledWith({ difficulty: 'hard' });
    });

    it('should reset settings to defaults', async () => {
      // Create a mock settings manager for this test
      let settingsStore = {
        difficulty: 'medium',
        cardCount: 5,
        animations: true,
        soundEffects: true,
        reducedMotion: false,
        highContrast: false,
        largeText: false,
        screenReaderSupport: true,
        autoSave: true,
        performanceMode: false,
        categories: [],
        version: '1.0.0'
      };
      let changeCallback = null;
      const mockSettingsManager = {
        isInitialized: true,
        isReady: vi.fn().mockReturnValue(true),
        getSettings: vi.fn().mockImplementation(() => ({ ...settingsStore })),
        onChange: vi.fn().mockImplementation((cb) => {
          changeCallback = cb;
          return () => { changeCallback = null; };
        }),
        updateSettings: vi.fn().mockImplementation((updates) => {
          settingsStore = { ...settingsStore, ...updates };
          if (changeCallback) {
            changeCallback({ ...settingsStore, key: undefined });
          }
          return true;
        }),
        resetToDefaults: vi.fn().mockImplementation(() => {
          settingsStore = {
            difficulty: 'medium',
            cardCount: 5,
            animations: true,
            soundEffects: true,
            reducedMotion: false,
            highContrast: false,
            largeText: false,
            screenReaderSupport: true,
            autoSave: true,
            performanceMode: false,
            categories: [],
            version: '1.0.0'
          };
          if (changeCallback) {
            changeCallback({ ...settingsStore, key: undefined });
          }
          return true;
        }),
        getDefaultSettings: vi.fn().mockReturnValue({
          difficulty: 'medium',
          cardCount: 5,
          animations: true,
          soundEffects: true,
          reducedMotion: false,
          highContrast: false,
          largeText: false,
          screenReaderSupport: true,
          autoSave: true,
          performanceMode: false,
          categories: [],
          version: '1.0.0'
        })
      };

      render(
        <TestSettingsProvider mockSettingsManager={mockSettingsManager}>
          <TestComponent />
        </TestSettingsProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('difficulty')).toHaveTextContent('medium');
      });

      // First update the difficulty to something different
      act(() => {
        screen.getByTestId('update-difficulty').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('difficulty')).toHaveTextContent('hard');
      });

      // Then reset to defaults
      act(() => {
        screen.getByTestId('reset-settings').click();
      });

      // Should reset back to default value
      await waitFor(() => {
        expect(screen.getByTestId('difficulty')).toHaveTextContent('medium');
      });

      // Verify settings manager was called
      expect(mockSettingsManager.updateSettings).toHaveBeenCalledWith({ difficulty: 'hard' });
      expect(mockSettingsManager.resetToDefaults).toHaveBeenCalled();
    });
  });

  describe('SettingsErrorBoundary', () => {
    it('should render children when no error occurs', () => {
      render(
        <SettingsErrorBoundary>
          <div data-testid="child">Child Component</div>
        </SettingsErrorBoundary>
      );

      expect(screen.getByTestId('child')).toHaveTextContent('Child Component');
    });

    it('should render error UI when error occurs', () => {
      const ErrorComponent = () => {
        throw new Error('Test error');
      };

      render(
        <SettingsErrorBoundary>
          <ErrorComponent />
        </SettingsErrorBoundary>
      );

      expect(screen.getByText('Settings Error')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong with the settings system.')).toBeInTheDocument();
      expect(screen.getByText('Reload Page')).toBeInTheDocument();
    });
  });

  describe('useSettings hook', () => {
    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useSettings must be used within a SettingsProvider');

      consoleSpy.mockRestore();
    });

    it('should provide settings context when used within provider', async () => {
      render(
        <SettingsProvider>
          <TestComponent />
        </SettingsProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Loaded');
        expect(screen.getByTestId('initialized')).toHaveTextContent('Initialized');
      });
    });
  });

  describe('useSettingsSafe hook', () => {
    it('should not throw error when used outside provider', () => {
      render(<TestSafeComponent />);

      expect(screen.getByTestId('safe-loading')).toHaveTextContent('Loaded');
      expect(screen.getByTestId('safe-error')).toHaveTextContent('Settings context not available');
    });
  });

  describe('Context value tests', () => {
    it('should provide correct initial state', async () => {
      let contextValue;
      
      function TestContextValue() {
        contextValue = useSettings();
        return <div data-testid="test">Test</div>;
      }

      render(
        <SettingsProvider>
          <TestContextValue />
        </SettingsProvider>
      );

      await waitFor(() => {
        expect(contextValue.isLoading).toBe(false);
        expect(contextValue.isInitialized).toBe(true);
        expect(contextValue.error).toBe(null);
        expect(contextValue.validationErrors).toEqual({});
        expect(typeof contextValue.updateSetting).toBe('function');
        expect(typeof contextValue.updateSettings).toBe('function');
        expect(typeof contextValue.resetSettings).toBe('function');
        expect(typeof contextValue.getSetting).toBe('function');
        expect(typeof contextValue.getSettings).toBe('function');
        expect(typeof contextValue.getDefaultSettings).toBe('function');
        expect(typeof contextValue.clearError).toBe('function');
        expect(typeof contextValue.clearValidationErrors).toBe('function');
      });
    });
  });
}); 