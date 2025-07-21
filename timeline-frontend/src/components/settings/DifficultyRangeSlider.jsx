import React, { useState, useRef, useEffect, useCallback } from 'react';
import { DIFFICULTY_LEVELS } from '../../constants/gameConstants.js';
import './DifficultyRangeSlider.css';

/**
 * DifficultyRangeSlider - Dual-handle slider for selecting difficulty range
 *
 * This component provides a user-friendly way to select a range of difficulty levels
 * using a dual-handle slider. It allows filtering cards by minimum and maximum difficulty.
 *
 * @component
 * @example
 * ```jsx
 * <DifficultyRangeSlider
 *   value={{ min: 1, max: 4 }}
 *   onChange={(range) => {}}
 *   disabled={false}
 * />
 * ```
 *
 * @param {Object} props - Component props
 * @param {Object} props.value - Current range value { min: number, max: number }
 * @param {Function} props.onChange - Change handler function
 * @param {boolean} [props.disabled=false] - Whether the slider is disabled
 * @param {string} [props.className] - Additional CSS classes
 * @param {Object} props.rest - Additional props passed to the container element
 *
 * @returns {JSX.Element} The difficulty range slider component
 */
const DifficultyRangeSlider = ({
  value,
  onChange,
  disabled = false,
  className = '',
  ...rest
}) => {
  // Ensure value is always a valid object with min and max
  const safeValue = value && typeof value === 'object' && 
    typeof value.min === 'number' && typeof value.max === 'number' 
    ? value 
    : { min: 1, max: 4 };
  const [isDragging, setIsDragging] = useState(null); // 'min' or 'max' or null
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartValue, setDragStartValue] = useState({ min: 1, max: 4 });
  
  const containerRef = useRef(null);
  const trackRef = useRef(null);

  const difficultyOptions = [
    { value: 1, label: 'Easy', icon: '😊', color: '#10b981', description: 'Simple events with clear dates' },
    { value: 2, label: 'Medium', icon: '😐', color: '#f59e0b', description: 'Balanced challenge with moderate time pressure' },
    { value: 3, label: 'Hard', icon: '😰', color: '#ef4444', description: 'Complex events requiring historical knowledge' },
    { value: 4, label: 'Expert', icon: '😱', color: '#7c3aed', description: 'Very challenging events for history experts' },
  ];

  const minDifficulty = 1;
  const maxDifficulty = 4;

  /**
   * Convert difficulty value to percentage position
   * @param {number} difficulty - Difficulty value (1-4)
   * @returns {number} Percentage position (0-100)
   */
  const valueToPercentage = useCallback((difficulty) => {
    return ((difficulty - minDifficulty) / (maxDifficulty - minDifficulty)) * 100;
  }, []);

  /**
   * Convert percentage position to difficulty value
   * @param {number} percentage - Percentage position (0-100)
   * @returns {number} Difficulty value (1-4)
   */
  const percentageToValue = useCallback((percentage) => {
    const clampedPercentage = Math.max(0, Math.min(100, percentage));
    return Math.round(
      minDifficulty + (clampedPercentage / 100) * (maxDifficulty - minDifficulty)
    );
  }, []);

  /**
   * Get position from mouse/touch event
   * @param {Event} event - Mouse or touch event
   * @returns {number} Percentage position
   */
  const getPositionFromEvent = useCallback((event) => {
    if (!trackRef.current) return 0;
    
    const rect = trackRef.current.getBoundingClientRect();
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const position = ((clientX - rect.left) / rect.width) * 100;
    return Math.max(0, Math.min(100, position));
  }, []);

  /**
   * Handle mouse/touch down events
   * @param {Event} event - Mouse or touch event
   * @param {string} handle - Which handle is being dragged ('min' or 'max')
   */
  const handleMouseDown = useCallback((event, handle) => {
    if (disabled) return;
    
    event.preventDefault();
    setIsDragging(handle);
    setDragStartX(event.touches ? event.touches[0].clientX : event.clientX);
    setDragStartValue({ ...safeValue });
  }, [disabled, value]);

  /**
   * Handle mouse/touch move events
   * @param {Event} event - Mouse or touch event
   */
  const handleMouseMove = useCallback((event) => {
    if (!isDragging || disabled) return;

    const position = getPositionFromEvent(event);
    const newValue = percentageToValue(position);
    
    let newRange = { ...safeValue };
    
    if (isDragging === 'min') {
      newRange.min = Math.min(newValue, safeValue.max - 1);
    } else if (isDragging === 'max') {
      newRange.max = Math.max(newValue, safeValue.min + 1);
    }
    
    if (newRange.min !== safeValue.min || newRange.max !== safeValue.max) {
      onChange(newRange);
    }
  }, [isDragging, disabled, value, onChange, getPositionFromEvent, percentageToValue]);

  /**
   * Handle mouse/touch up events
   */
  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  /**
   * Handle track click to set values
   * @param {Event} event - Click event
   */
  const handleTrackClick = useCallback((event) => {
    if (disabled) return;
    
    const position = getPositionFromEvent(event);
    const newValue = percentageToValue(position);
    
    // Determine which handle to move based on which is closer
    const minDistance = Math.abs(newValue - safeValue.min);
    const maxDistance = Math.abs(newValue - safeValue.max);
    
    let newRange = { ...safeValue };
    
    if (minDistance <= maxDistance) {
      // Move min handle
      newRange.min = Math.min(newValue, safeValue.max - 1);
    } else {
      // Move max handle
      newRange.max = Math.max(newValue, safeValue.min + 1);
    }
    
    if (newRange.min !== safeValue.min || newRange.max !== safeValue.max) {
      onChange(newRange);
    }
  }, [disabled, value, onChange, getPositionFromEvent, percentageToValue]);

  // Add global event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleMouseMove, { passive: false });
      document.addEventListener('touchend', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleMouseMove);
        document.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const minPercentage = valueToPercentage(safeValue.min);
  const maxPercentage = valueToPercentage(safeValue.max);

  const containerClasses = [
    'difficulty-range-slider',
    disabled ? 'difficulty-range-slider--disabled' : '',
    isDragging ? 'difficulty-range-slider--dragging' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const getSelectedText = () => {
    if (safeValue.min === safeValue.max) {
      const difficulty = difficultyOptions.find(d => d.value === safeValue.min);
      return `${difficulty?.label} (Level ${safeValue.min})`;
    }
    return `Level ${safeValue.min} - ${safeValue.max}`;
  };

  const getSelectedDescription = () => {
    if (safeValue.min === safeValue.max) {
      const difficulty = difficultyOptions.find(d => d.value === safeValue.min);
      return difficulty?.description || '';
    }
    
    const minDifficulty = difficultyOptions.find(d => d.value === safeValue.min);
    const maxDifficulty = difficultyOptions.find(d => d.value === safeValue.max);
    
    if (safeValue.max - safeValue.min === 1) {
      return `${minDifficulty?.label} and ${maxDifficulty?.label} cards`;
    }
    
    return `Cards from ${minDifficulty?.label} to ${maxDifficulty?.label} difficulty`;
  };

  return (
    <div ref={containerRef} className={containerClasses} {...rest}>
      <div className="difficulty-range-slider__header">
        <h3 className="difficulty-range-slider__title">Difficulty Range</h3>
        <div className="difficulty-range-slider__selected">
          <span className="difficulty-range-slider__selected-text">
            {getSelectedText()}
          </span>
          <p className="difficulty-range-slider__selected-description">
            {getSelectedDescription()}
          </p>
        </div>
      </div>

      <div className="difficulty-range-slider__track-container">
        <div
          ref={trackRef}
          className="difficulty-range-slider__track"
          onClick={handleTrackClick}
        >
          {/* Background gradient showing difficulty levels */}
          <div className="difficulty-range-slider__track-background">
            {difficultyOptions.map((option, index) => (
              <div
                key={option.value}
                className="difficulty-range-slider__track-segment"
                style={{
                  backgroundColor: option.color,
                  left: `${valueToPercentage(option.value)}%`,
                  width: index === difficultyOptions.length - 1 
                    ? `${100 - valueToPercentage(option.value)}%` 
                    : `${valueToPercentage(option.value + 1) - valueToPercentage(option.value)}%`
                }}
              />
            ))}
          </div>

          {/* Selected range highlight */}
          <div
            className="difficulty-range-slider__range"
            style={{
              left: `${minPercentage}%`,
              width: `${maxPercentage - minPercentage}%`,
            }}
          />

          {/* Min handle */}
          <div
            className="difficulty-range-slider__handle difficulty-range-slider__handle--min"
            style={{ left: `${minPercentage}%` }}
            onMouseDown={(e) => handleMouseDown(e, 'min')}
            onTouchStart={(e) => handleMouseDown(e, 'min')}
            role="slider"
            aria-label="Minimum difficulty"
            aria-valuemin={minDifficulty}
            aria-valuemax={maxDifficulty}
            aria-valuenow={safeValue.min}
            tabIndex={disabled ? -1 : 0}
          >
            <div className="difficulty-range-slider__handle-label">
              {safeValue.min}
            </div>
          </div>

          {/* Max handle */}
          <div
            className="difficulty-range-slider__handle difficulty-range-slider__handle--max"
            style={{ left: `${maxPercentage}%` }}
            onMouseDown={(e) => handleMouseDown(e, 'max')}
            onTouchStart={(e) => handleMouseDown(e, 'max')}
            role="slider"
            aria-label="Maximum difficulty"
            aria-valuemin={minDifficulty}
            aria-valuemax={maxDifficulty}
            aria-valuenow={safeValue.max}
            tabIndex={disabled ? -1 : 0}
          >
            <div className="difficulty-range-slider__handle-label">
              {safeValue.max}
            </div>
          </div>
        </div>

        {/* Difficulty level markers */}
        <div className="difficulty-range-slider__markers">
          {difficultyOptions.map((option) => (
            <div
              key={option.value}
              className="difficulty-range-slider__marker"
              style={{ left: `${valueToPercentage(option.value)}%` }}
            >
              <span className="difficulty-range-slider__marker-icon">
                {option.icon}
              </span>
              <span className="difficulty-range-slider__marker-label">
                {option.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick preset buttons */}
      <div className="difficulty-range-slider__presets">
        <button
          type="button"
          className="difficulty-range-slider__preset-button"
          onClick={() => onChange({ min: 1, max: 2 })}
          disabled={disabled}
        >
          Easy Only
        </button>
        <button
          type="button"
          className="difficulty-range-slider__preset-button"
          onClick={() => onChange({ min: 1, max: 3 })}
          disabled={disabled}
        >
          Easy & Medium
        </button>
        <button
          type="button"
          className="difficulty-range-slider__preset-button"
          onClick={() => onChange({ min: 2, max: 4 })}
          disabled={disabled}
        >
          Medium & Up
        </button>
        <button
          type="button"
          className="difficulty-range-slider__preset-button"
          onClick={() => onChange({ min: 1, max: 4 })}
          disabled={disabled}
        >
          All Levels
        </button>
      </div>
    </div>
  );
};

export default DifficultyRangeSlider; 