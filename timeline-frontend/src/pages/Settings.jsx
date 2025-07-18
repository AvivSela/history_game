import React, { useState, useEffect } from 'react';
import { SettingsProvider } from '../contexts/SettingsContext';
import { useSettingsEnhanced } from '../hooks/useSettings';
import SettingsSection from '../components/settings/SettingsSection';
import DifficultySelector from '../components/settings/DifficultySelector';
import CardCountSlider from '../components/settings/CardCountSlider';
import CategorySelector from '../components/settings/CategorySelector';
import { DIFFICULTY_LEVELS } from '../constants/gameConstants';
import './Settings.css';

/**
 * Settings Page - Main settings interface for the Timeline game
 *
 * This component provides a comprehensive settings interface with sections for
 * game settings, accessibility options, and performance preferences. It integrates
 * with the settings context for persistence and validation.
 *
 * @component
 * @example
 * ```jsx
 * <Settings />
 * ```
 *
 * @returns {JSX.Element} The settings page component
 */
const SettingsContent = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState({ type: '', message: '' });
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Use enhanced settings hook with error handling
  const {
    settings,
    isLoading: settingsLoading,
    error: settingsError,
    updateSetting,
    resetSettings,
    clearAllErrors,
    isReady,
    hasError,
    getValidationError,
  } = useSettingsEnhanced({
    onError: error => {
      setSaveStatus({ type: 'error', message: `Settings error: ${error}` });
    },
    onValidationError: () => {
      setSaveStatus({
        type: 'warning',
        message: 'Some settings have validation errors',
      });
    },
  });

  // Available categories from the backend
  const [availableCategories, setAvailableCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Load available categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          const categories = data.data.map(category => ({
            id: category.toLowerCase(),
            name: category,
            description: `${category} events and discoveries`,
          }));
          setAvailableCategories(categories);
        } else {
          setAvailableCategories([
            {
              id: 'history',
              name: 'History',
              description: 'Historical events and wars',
            },
            {
              id: 'science',
              name: 'Science',
              description: 'Scientific discoveries and inventions',
            },
            {
              id: 'technology',
              name: 'Technology',
              description: 'Technological advancements',
            },
            {
              id: 'space',
              name: 'Space',
              description: 'Space exploration and astronomy',
            },
            {
              id: 'aviation',
              name: 'Aviation',
              description: 'Aviation and flight history',
            },
          ]);
        }
      } catch {
        setAvailableCategories([
          {
            id: 'history',
            name: 'History',
            description: 'Historical events and wars',
          },
          {
            id: 'science',
            name: 'Science',
            description: 'Scientific discoveries and inventions',
          },
          {
            id: 'technology',
            name: 'Technology',
            description: 'Technological advancements',
          },
          {
            id: 'space',
            name: 'Space',
            description: 'Space exploration and astronomy',
          },
          {
            id: 'aviation',
            name: 'Aviation',
            description: 'Aviation and flight history',
          },
        ]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Update loading state when settings are ready
  useEffect(() => {
    if (isReady() && !categoriesLoading) {
      setIsLoading(false);
    }
  }, [isReady, categoriesLoading]);

  // Handle setting changes
  const handleSettingChange = (key, value) => {
    const result = updateSetting(key, value);
    if (result && result.success) {
      setSaveStatus({ type: 'success', message: 'Setting updated' });
      setTimeout(() => setSaveStatus({ type: '', message: '' }), 2000);
    }
  };

  // Handle save settings
  const handleSaveSettings = () => {
    try {
      // Settings are auto-saved, but we can show a confirmation
      setSaveStatus({
        type: 'success',
        message: 'Settings saved successfully!',
      });
      setTimeout(() => setSaveStatus({ type: '', message: '' }), 3000);
    } catch {
      setSaveStatus({ type: 'error', message: 'Failed to save settings' });
    }
  };

  // Handle reset settings
  const handleResetSettings = () => {
    try {
      resetSettings();
      setSaveStatus({ type: 'success', message: 'Settings reset to defaults' });
      setShowResetConfirm(false);
      setTimeout(() => setSaveStatus({ type: '', message: '' }), 3000);
    } catch {
      setSaveStatus({ type: 'error', message: 'Failed to reset settings' });
    }
  };

  // Show loading state
  if (isLoading || settingsLoading) {
    return (
      <div className="settings-page">
        <div className="container">
          <div className="settings-loading">
            <div className="loading-spinner"></div>
            <p>Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (hasError()) {
    return (
      <div className="settings-page">
        <div className="container">
          <div className="settings-error">
            <h2>❌ Settings Error</h2>
            <p>{settingsError}</p>
            <button onClick={clearAllErrors} className="btn btn-primary">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="container">
        <div className="settings-header">
          <h1>⚙️ Game Settings</h1>
          <p>Customize your Timeline gaming experience</p>

          {/* Status Messages */}
          {saveStatus.message && (
            <div
              className={`settings-status settings-status--${saveStatus.type}`}
            >
              {saveStatus.message}
            </div>
          )}
        </div>

        <div className="settings-content">
          {/* Game Settings Section */}
          <SettingsSection title="🎮 Game Settings">
            <div className="settings-grid">
              {/* Difficulty Selector */}
              <div className="setting-card">
                <DifficultySelector
                  value={settings.difficulty || DIFFICULTY_LEVELS.MEDIUM}
                  onChange={value => handleSettingChange('difficulty', value)}
                  disabled={false}
                />
                {getValidationError('difficulty') && (
                  <div className="setting-error">
                    {getValidationError('difficulty')}
                  </div>
                )}
              </div>

              {/* Card Count Slider */}
              <div className="setting-card">
                <CardCountSlider
                  value={settings.cardCount || 5}
                  min={3}
                  max={10}
                  onChange={value => handleSettingChange('cardCount', value)}
                  disabled={false}
                  label="Number of Cards"
                  valueSuffix=" cards"
                />
                {getValidationError('cardCount') && (
                  <div className="setting-error">
                    {getValidationError('cardCount')}
                  </div>
                )}
              </div>

              {/* Category Selector */}
              <div className="setting-card">
                <CategorySelector
                  value={settings.categories || []}
                  categories={availableCategories}
                  onChange={value => handleSettingChange('categories', value)}
                  disabled={categoriesLoading}
                />
                {getValidationError('categories') && (
                  <div className="setting-error">
                    {getValidationError('categories')}
                  </div>
                )}
              </div>
            </div>
          </SettingsSection>

          {/* Action Buttons */}
          <div className="settings-actions">
            <button
              onClick={handleSaveSettings}
              className="btn btn-primary btn-large"
            >
              💾 Save Settings
            </button>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="btn btn-secondary"
            >
              🔄 Reset to Defaults
            </button>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>🔄 Reset Settings</h3>
            <p>
              Are you sure you want to reset all settings to their default
              values? This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button onClick={handleResetSettings} className="btn btn-danger">
                Yes, Reset Settings
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Settings Page Wrapper - Provides settings context
 *
 * @component
 * @returns {JSX.Element} The settings page with context provider
 */
const Settings = () => {
  return (
    <SettingsProvider>
      <SettingsContent />
    </SettingsProvider>
  );
};

export default Settings;
