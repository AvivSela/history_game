import React, { useState, useEffect } from 'react';
import { accessibility, performance } from '../../utils/animation';

const AnimationControls = ({ onAnimationPreferenceChange }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [animationEnabled, setAnimationEnabled] = useState(true);
  const [animationIntensity, setAnimationIntensity] = useState('normal');
  const [queueStatus, setQueueStatus] = useState({ queueLength: 0, activeAnimations: 0 });

  useEffect(() => {
    // Check initial animation preferences
    const state = accessibility.getState();
    setAnimationEnabled(state.shouldAnimate);
    setAnimationIntensity(state.preferences.shouldUseSubtleAnimations ? 'subtle' : 'normal');

    // Update queue status periodically
    const interval = setInterval(() => {
      const status = performance.getStatus();
      setQueueStatus({
        queueLength: status.queue.queueLength,
        activeAnimations: status.queue.activeAnimations
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const handleAnimationToggle = (enabled) => {
    setAnimationEnabled(enabled);
    
    if (!enabled) {
      // Skip all current animations - this is handled by the animation system
    }
    
    // Notify parent component
    onAnimationPreferenceChange?.({
      shouldAnimate: enabled,
      intensity: animationIntensity
    });
  };

  const handleIntensityChange = (intensity) => {
    setAnimationIntensity(intensity);
    
    // Notify parent component
    onAnimationPreferenceChange?.({
      shouldAnimate: animationEnabled,
      intensity
    });
  };

  const skipCurrentAnimations = () => {
    // This functionality is now handled by the animation system
    setQueueStatus({ queueLength: 0, activeAnimations: 0 });
  };

  const getIntensityMultiplier = () => {
    switch (animationIntensity) {
      case 'subtle': return 0.5;
      case 'normal': return 1;
      case 'enhanced': return 1.5;
      default: return 1;
    }
  };

  return (
    <div className="animation-controls">
      {/* Toggle button */}
      <button
        className="btn btn-secondary btn-small"
        onClick={() => setIsVisible(!isVisible)}
        aria-label="Animation controls"
        title="Animation settings"
      >
        {isVisible ? '⚙️' : '🎬'}
      </button>

      {/* Controls panel */}
      {isVisible && (
        <div className="animation-controls-panel">
          <div className="animation-controls-header">
            <h4>Animation Settings</h4>
            <button
              className="btn btn-small"
              onClick={() => setIsVisible(false)}
              aria-label="Close animation controls"
            >
              ✕
            </button>
          </div>

          <div className="animation-controls-content">
            {/* Animation toggle */}
            <div className="control-group">
              <label className="control-label">
                <input
                  type="checkbox"
                  checked={animationEnabled}
                  onChange={(e) => handleAnimationToggle(e.target.checked)}
                />
                Enable Animations
              </label>
            </div>

            {/* Animation intensity */}
            <div className="control-group">
              <label className="control-label">Animation Intensity:</label>
              <select
                value={animationIntensity}
                onChange={(e) => handleIntensityChange(e.target.value)}
                disabled={!animationEnabled}
              >
                <option value="subtle">Subtle (50%)</option>
                <option value="normal">Normal (100%)</option>
                <option value="enhanced">Enhanced (150%)</option>
              </select>
            </div>

            {/* Queue status */}
            <div className="control-group">
              <div className="queue-status">
                <span>Queue: {queueStatus.queueLength}</span>
                <span>Active: {queueStatus.activeAnimations}</span>
              </div>
            </div>

            {/* Skip animations button */}
            <div className="control-group">
              <button
                className="btn btn-warning btn-small"
                onClick={skipCurrentAnimations}
                disabled={queueStatus.queueLength === 0 && queueStatus.activeAnimations === 0}
              >
                Skip Current Animations
              </button>
            </div>

            {/* Accessibility info */}
            <div className="accessibility-info">
              <small>
                System preference: {accessibility.shouldAnimate() ? 'Normal' : 'Reduced motion'}
              </small>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .animation-controls {
          position: relative;
          display: inline-block;
        }

        .animation-controls-panel {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          min-width: 250px;
          z-index: 1000;
          margin-top: 8px;
        }

        .animation-controls-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid #eee;
        }

        .animation-controls-header h4 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
        }

        .animation-controls-content {
          padding: 16px;
        }

        .control-group {
          margin-bottom: 16px;
        }

        .control-group:last-child {
          margin-bottom: 0;
        }

        .control-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 500;
        }

        .control-label input[type="checkbox"] {
          margin: 0;
        }

        .control-label select {
          margin-left: 8px;
          padding: 4px 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .queue-status {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #666;
          background: #f5f5f5;
          padding: 8px 12px;
          border-radius: 4px;
        }

        .accessibility-info {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #eee;
        }

        .accessibility-info small {
          color: #666;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
};

export default AnimationControls; 