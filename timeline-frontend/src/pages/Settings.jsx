import React, { useState } from 'react';
import './Settings.css';

const Settings = () => {
  const [settings, setSettings] = useState({
    difficulty: 'medium',
    cardCount: 5,
    category: 'all',
    soundEnabled: true,
    animationsEnabled: true,
    theme: 'light'
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    console.log(`Setting changed: ${key} = ${value}`);
  };

  const resetSettings = () => {
    setSettings({
      difficulty: 'medium',
      cardCount: 5,
      category: 'all',
      soundEnabled: true,
      animationsEnabled: true,
      theme: 'light'
    });
    console.log('Settings reset to defaults');
  };

  const saveSettings = () => {
    // In a real app, this would save to localStorage or backend
    console.log('Settings saved:', settings);
    alert('Settings saved successfully!');
  };

  return (
    <div className="settings-page">
      <div className="container">
        <div className="settings-header">
          <h1>⚙️ Game Settings</h1>
          <p>Customize your Timeline gaming experience</p>
        </div>

        <div className="settings-content">
          <div className="settings-grid">
            {/* Game Difficulty */}
            <div className="setting-card">
              <div className="setting-header">
                <h3>🎯 Difficulty Level</h3>
                <p>Choose how challenging you want the game to be</p>
              </div>
              <div className="setting-options">
                {['easy', 'medium', 'hard'].map(level => (
                  <label key={level} className="radio-option">
                    <input
                      type="radio"
                      name="difficulty"
                      value={level}
                      checked={settings.difficulty === level}
                      onChange={(e) => handleSettingChange('difficulty', e.target.value)}
                    />
                    <span className="radio-label">
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                      {level === 'easy' && ' (3 cards)'}
                      {level === 'medium' && ' (5 cards)'}
                      {level === 'hard' && ' (8 cards)'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Card Count */}
            <div className="setting-card">
              <div className="setting-header">
                <h3>🎴 Number of Cards</h3>
                <p>How many cards do you want in your hand?</p>
              </div>
              <div className="setting-control">
                <input
                  type="range"
                  min="3"
                  max="10"
                  value={settings.cardCount}
                  onChange={(e) => handleSettingChange('cardCount', parseInt(e.target.value))}
                  className="slider"
                />
                <div className="slider-value">{settings.cardCount} cards</div>
              </div>
            </div>

            {/* Category Filter */}
            <div className="setting-card">
              <div className="setting-header">
                <h3>📂 Event Category</h3>
                <p>Focus on specific types of historical events</p>
              </div>
              <div className="setting-control">
                <select
                  value={settings.category}
                  onChange={(e) => handleSettingChange('category', e.target.value)}
                  className="select-input"
                >
                  <option value="all">All Categories</option>
                  <option value="history">History</option>
                  <option value="science">Science</option>
                  <option value="technology">Technology</option>
                  <option value="space">Space</option>
                  <option value="aviation">Aviation</option>
                </select>
              </div>
            </div>

            {/* Sound Settings */}
            <div className="setting-card">
              <div className="setting-header">
                <h3>🔊 Sound Effects</h3>
                <p>Enable or disable game sounds</p>
              </div>
              <div className="setting-control">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                  <span className="toggle-label">
                    {settings.soundEnabled ? 'Sound On' : 'Sound Off'}
                  </span>
                </label>
              </div>
            </div>

            {/* Animation Settings */}
            <div className="setting-card">
              <div className="setting-header">
                <h3>✨ Animations</h3>
                <p>Enable or disable card animations</p>
              </div>
              <div className="setting-control">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.animationsEnabled}
                    onChange={(e) => handleSettingChange('animationsEnabled', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                  <span className="toggle-label">
                    {settings.animationsEnabled ? 'Animations On' : 'Animations Off'}
                  </span>
                </label>
              </div>
            </div>

            {/* Theme Settings */}
            <div className="setting-card">
              <div className="setting-header">
                <h3>🎨 Theme</h3>
                <p>Choose your preferred color scheme</p>
              </div>
              <div className="setting-options">
                {['light', 'dark', 'auto'].map(theme => (
                  <label key={theme} className="radio-option">
                    <input
                      type="radio"
                      name="theme"
                      value={theme}
                      checked={settings.theme === theme}
                      onChange={(e) => handleSettingChange('theme', e.target.value)}
                    />
                    <span className="radio-label">
                      {theme.charAt(0).toUpperCase() + theme.slice(1)}
                      {theme === 'auto' && ' (System)'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Settings Preview */}
          <div className="settings-preview">
            <h3>⚡ Current Settings</h3>
            <div className="preview-grid">
              <div className="preview-item">
                <span className="preview-label">Difficulty:</span>
                <span className="preview-value">{settings.difficulty}</span>
              </div>
              <div className="preview-item">
                <span className="preview-label">Cards:</span>
                <span className="preview-value">{settings.cardCount}</span>
              </div>
              <div className="preview-item">
                <span className="preview-label">Category:</span>
                <span className="preview-value">{settings.category}</span>
              </div>
              <div className="preview-item">
                <span className="preview-label">Sound:</span>
                <span className="preview-value">{settings.soundEnabled ? 'On' : 'Off'}</span>
              </div>
              <div className="preview-item">
                <span className="preview-label">Animations:</span>
                <span className="preview-value">{settings.animationsEnabled ? 'On' : 'Off'}</span>
              </div>
              <div className="preview-item">
                <span className="preview-label">Theme:</span>
                <span className="preview-value">{settings.theme}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="settings-actions">
            <button onClick={saveSettings} className="btn btn-primary btn-large">
              💾 Save Settings
            </button>
            <button onClick={resetSettings} className="btn btn-secondary">
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
                  <li><strong>Easy:</strong> 3 cards, simpler events</li>
                  <li><strong>Medium:</strong> 5 cards, mixed difficulty</li>
                  <li><strong>Hard:</strong> 8+ cards, challenging events</li>
                </ul>
              </div>
              <div className="help-item">
                <h4>Categories</h4>
                <ul>
                  <li><strong>History:</strong> Wars, politics, social events</li>
                  <li><strong>Science:</strong> Discoveries, inventions</li>
                  <li><strong>Technology:</strong> Computing, engineering</li>
                  <li><strong>Space:</strong> Space exploration, astronomy</li>
                </ul>
              </div>
              <div className="help-item">
                <h4>Performance Tips</h4>
                <ul>
                  <li>Disable animations on slower devices</li>
                  <li>Use fewer cards for quicker games</li>
                  <li>Choose specific categories to focus learning</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
