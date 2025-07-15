import React, { useState, useEffect } from 'react';
import { SettingsProvider, useSettings } from '../contexts/SettingsContext';
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
    validationErrors,
    updateSetting,
    updateSettings,
    resetSettings,
    hasUnsavedChanges,
    getSettingsDiff,
    clearAllErrors,
    isReady,
    hasError,
    hasValidationErrors,
    getValidationError
  } = useSettingsEnhanced({
    onError: (error) => {
      setSaveStatus({ type: 'error', message: `Settings error: ${error}` });
    },
    onValidationError: (errors) => {
      setSaveStatus({ type: 'warning', message: 'Some settings have validation errors' });
    }
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
            description: `${category} events and discoveries`
          }));
          setAvailableCategories(categories);
        } else {
          setAvailableCategories([
            { id: 'history', name: 'History', description: 'Historical events and wars' },
            { id: 'science', name: 'Science', description: 'Scientific discoveries and inventions' },
            { id: 'technology', name: 'Technology', description: 'Technological advancements' },
            { id: 'space', name: 'Space', description: 'Space exploration and astronomy' },
            { id: 'aviation', name: 'Aviation', description: 'Aviation and flight history' }
          ]);
        }
      } catch (error) {
        setAvailableCategories([
          { id: 'history', name: 'History', description: 'Historical events and wars' },
          { id: 'science', name: 'Science', description: 'Scientific discoveries and inventions' },
          { id: 'technology', name: 'Technology', description: 'Technological advancements' },
          { id: 'space', name: 'Space', description: 'Space exploration and astronomy' },
          { id: 'aviation', name: 'Aviation', description: 'Aviation and flight history' }
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
    const success = updateSetting(key, value);
    if (success) {
      setSaveStatus({ type: 'success', message: 'Setting updated' });
      setTimeout(() => setSaveStatus({ type: '', message: '' }), 2000);
    }
  };

  // Handle save settings
  const handleSaveSettings = () => {
    try {
      // Settings are auto-saved, but we can show a confirmation
      setSaveStatus({ type: 'success', message: 'Settings saved successfully!' });
      setTimeout(() => setSaveStatus({ type: '', message: '' }), 3000);
    } catch (error) {
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
    } catch (error) {
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
            <div className={`settings-status settings-status--${saveStatus.type}`}>
              {saveStatus.message}
            </div>
          )}
        </div>

        <div className="settings-content">
          {/* Game Settings Section */}
          <SettingsSection title="🎮 Game Settings" defaultExpanded={true}>
            <div className="settings-grid">
              {/* Difficulty Selector */}
              <div className="setting-card">
                <DifficultySelector
                  value={settings.difficulty || DIFFICULTY_LEVELS.MEDIUM}
                  onChange={(value) => handleSettingChange('difficulty', value)}
                  disabled={false}
                />
                {getValidationError('difficulty') && (
                  <div className="setting-error">{getValidationError('difficulty')}</div>
                )}
              </div>

              {/* Card Count Slider */}
              <div className="setting-card">
                <CardCountSlider
                  value={settings.cardCount || 5}
                  min={3}
                  max={10}
                  onChange={(value) => handleSettingChange('cardCount', value)}
                  disabled={false}
                  label="Number of Cards"
                  valueSuffix=" cards"
                />
                {getValidationError('cardCount') && (
                  <div className="setting-error">{getValidationError('cardCount')}</div>
                )}
              </div>

              {/* Category Selector */}
              <div className="setting-card">
                <CategorySelector
                  value={settings.categories || []}
                  categories={availableCategories}
                  onChange={(value) => handleSettingChange('categories', value)}
                  disabled={categoriesLoading}
                />
                {getValidationError('categories') && (
                  <div className="setting-error">{getValidationError('categories')}</div>
                )}
              </div>
            </div>
          </SettingsSection>

          {/* Accessibility Settings Section */}
          <SettingsSection title="♿ Accessibility" defaultExpanded={false}>
            <div className="settings-grid">
              {/* Sound Effects */}
              <div className="setting-card">
                <div className="setting-header">
                  <h3>🔊 Sound Effects</h3>
                  <p>Enable or disable game sounds</p>
                </div>
                <div className="setting-control">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.soundEffects !== false}
                      onChange={(e) => handleSettingChange('soundEffects', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-label">
                      {settings.soundEffects !== false ? 'Sound On' : 'Sound Off'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Animations */}
              <div className="setting-card">
                <div className="setting-header">
                  <h3>✨ Animations</h3>
                  <p>Enable or disable card animations</p>
                </div>
                <div className="setting-control">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.animations !== false}
                      onChange={(e) => handleSettingChange('animations', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-label">
                      {settings.animations !== false ? 'Animations On' : 'Animations Off'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Reduced Motion */}
              <div className="setting-card">
                <div className="setting-header">
                  <h3>🚫 Reduced Motion</h3>
                  <p>Reduce animations for accessibility</p>
                </div>
                <div className="setting-control">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.reducedMotion === true}
                      onChange={(e) => handleSettingChange('reducedMotion', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-label">
                      {settings.reducedMotion ? 'Reduced Motion On' : 'Reduced Motion Off'}
                    </span>
                  </label>
                </div>
              </div>

              {/* High Contrast */}
              <div className="setting-card">
                <div className="setting-header">
                  <h3>🎨 High Contrast</h3>
                  <p>Enable high contrast mode</p>
                </div>
                <div className="setting-control">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.highContrast === true}
                      onChange={(e) => handleSettingChange('highContrast', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-label">
                      {settings.highContrast ? 'High Contrast On' : 'High Contrast Off'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Large Text */}
              <div className="setting-card">
                <div className="setting-header">
                  <h3>📝 Large Text</h3>
                  <p>Increase text size for better readability</p>
                </div>
                <div className="setting-control">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.largeText === true}
                      onChange={(e) => handleSettingChange('largeText', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-label">
                      {settings.largeText ? 'Large Text On' : 'Large Text Off'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Screen Reader Support */}
              <div className="setting-card">
                <div className="setting-header">
                  <h3>🔊 Screen Reader Support</h3>
                  <p>Enhanced screen reader compatibility</p>
                </div>
                <div className="setting-control">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.screenReaderSupport === true}
                      onChange={(e) => handleSettingChange('screenReaderSupport', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-label">
                      {settings.screenReaderSupport ? 'Screen Reader Support On' : 'Screen Reader Support Off'}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </SettingsSection>

          {/* Performance Settings Section */}
          <SettingsSection title="⚡ Performance" defaultExpanded={false}>
            <div className="settings-grid">
              {/* Auto Save */}
              <div className="setting-card">
                <div className="setting-header">
                  <h3>💾 Auto Save</h3>
                  <p>Automatically save game progress</p>
                </div>
                <div className="setting-control">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.autoSave !== false}
                      onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-label">
                      {settings.autoSave !== false ? 'Auto Save On' : 'Auto Save Off'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Performance Mode */}
              <div className="setting-card">
                <div className="setting-header">
                  <h3>🚀 Performance Mode</h3>
                  <p>Optimize for better performance on slower devices</p>
                </div>
                <div className="setting-control">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.performanceMode === true}
                      onChange={(e) => handleSettingChange('performanceMode', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-label">
                      {settings.performanceMode ? 'Performance Mode On' : 'Performance Mode Off'}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </SettingsSection>

          {/* Settings Preview */}
          <div className="settings-preview">
            <h3>⚡ Current Settings</h3>
            <div className="preview-grid">
              <div className="preview-item">
                <span className="preview-label">Difficulty:</span>
                <span className="preview-value">{settings.difficulty || 'medium'}</span>
              </div>
              <div className="preview-item">
                <span className="preview-label">Cards:</span>
                <span className="preview-value">{settings.cardCount || 5}</span>
              </div>
              <div className="preview-item">
                <span className="preview-label">Categories:</span>
                <span className="preview-value">
                  {settings.categories && settings.categories.length > 0 
                    ? settings.categories.join(', ') 
                    : 'All categories'}
                </span>
              </div>
              <div className="preview-item">
                <span className="preview-label">Sound:</span>
                <span className="preview-value">{settings.soundEffects !== false ? 'On' : 'Off'}</span>
              </div>
              <div className="preview-item">
                <span className="preview-label">Animations:</span>
                <span className="preview-value">{settings.animations !== false ? 'On' : 'Off'}</span>
              </div>
              <div className="preview-item">
                <span className="preview-label">Reduced Motion:</span>
                <span className="preview-value">{settings.reducedMotion ? 'On' : 'Off'}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="settings-actions">
            <button onClick={handleSaveSettings} className="btn btn-primary btn-large">
              💾 Save Settings
            </button>
            <button 
              onClick={() => setShowResetConfirm(true)} 
              className="btn btn-secondary"
              disabled={!hasUnsavedChanges()}
            >
              🔄 Reset to Defaults
            </button>

            <a href="/game" className="btn btn-success">
              🎮 Start Game
            </a>
          </div>

          {/* Help Section */}
          <div className="settings-help">
            <h3>❓ Need Help?</h3>
            <div className="help-grid">
              <div className="help-item">
                <h4>Difficulty Levels</h4>
                <ul>
                  <li><strong>Easy:</strong> Relaxed gameplay with generous time limits and hints</li>
                  <li><strong>Medium:</strong> Balanced challenge with moderate time pressure</li>
                  <li><strong>Hard:</strong> Challenging gameplay with strict time limits</li>
                  <li><strong>Expert:</strong> Maximum challenge with minimal assistance</li>
                </ul>
              </div>
              <div className="help-item">
                <h4>Categories</h4>
                <ul>
                  <li><strong>History:</strong> Wars, politics, social events</li>
                  <li><strong>Science:</strong> Discoveries, inventions, research</li>
                  <li><strong>Technology:</strong> Computing, engineering, innovations</li>
                  <li><strong>Space:</strong> Space exploration, astronomy</li>
                  <li><strong>Aviation:</strong> Flight history, aircraft development</li>
                </ul>
              </div>
              <div className="help-item">
                <h4>Accessibility Features</h4>
                <ul>
                  <li>Reduced motion for users with vestibular disorders</li>
                  <li>High contrast for better visibility</li>
                  <li>Large text for improved readability</li>
                  <li>Screen reader support for assistive technology</li>
                </ul>
              </div>
              <div className="help-item">
                <h4>Performance Tips</h4>
                <ul>
                  <li>Disable animations on slower devices</li>
                  <li>Use fewer cards for quicker games</li>
                  <li>Choose specific categories to focus learning</li>
                  <li>Enable performance mode for better frame rates</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>🔄 Reset Settings</h3>
            <p>Are you sure you want to reset all settings to their default values? This action cannot be undone.</p>
            <div className="modal-actions">
              <button onClick={handleResetSettings} className="btn btn-danger">
                Yes, Reset Settings
              </button>
              <button onClick={() => setShowResetConfirm(false)} className="btn btn-secondary">
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
