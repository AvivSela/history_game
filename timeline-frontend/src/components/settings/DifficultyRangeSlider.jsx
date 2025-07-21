import React from 'react';
import { DIFFICULTY_LEVELS } from '../../constants/gameConstants.js';
import './DifficultyRangeSlider.css';

/**
 * DifficultyRangeSlider - Checkbox-based difficulty selector with star representations
 *
 * This component provides a user-friendly way to select difficulty levels using checkboxes
 * with star representations. Each difficulty level is represented by a checkbox with
 * corresponding stars (1 star for Easy, 4 stars for Expert).
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
 * @param {boolean} [props.disabled=false] - Whether the selector is disabled
 * @param {string} [props.className] - Additional CSS classes
 * @param {Object} props.rest - Additional props passed to the container element
 *
 * @returns {JSX.Element} The difficulty selector component
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

  const difficultyOptions = [
    { value: 1, label: 'Easy', icon: '😊', color: '#10b981', description: 'Simple events with clear dates', stars: 1 },
    { value: 2, label: 'Medium', icon: '😐', color: '#f59e0b', description: 'Balanced challenge with moderate time pressure', stars: 2 },
    { value: 3, label: 'Hard', icon: '😰', color: '#ef4444', description: 'Complex events requiring historical knowledge', stars: 3 },
    { value: 4, label: 'Expert', icon: '😱', color: '#7c3aed', description: 'Very challenging events for history experts', stars: 4 },
  ];

  /**
   * Handle checkbox change for individual difficulty levels
   * @param {number} difficultyValue - The difficulty value being toggled
   */
  const handleDifficultyToggle = (difficultyValue) => {
    if (disabled) return;

    let newRange = { ...safeValue };

    // If this difficulty is currently in range, remove it
    if (difficultyValue >= safeValue.min && difficultyValue <= safeValue.max) {
      // If it's the only selected difficulty, don't allow deselection
      if (safeValue.min === safeValue.max) {
        return;
      }
      
      // If it's the min value, increase min
      if (difficultyValue === safeValue.min) {
        newRange.min = safeValue.min + 1;
      }
      // If it's the max value, decrease max
      else if (difficultyValue === safeValue.max) {
        newRange.max = safeValue.max - 1;
      }
      // If it's in the middle, split the range
      else {
        // Create two separate ranges and choose the larger one
        const range1 = { min: safeValue.min, max: difficultyValue - 1 };
        const range2 = { min: difficultyValue + 1, max: safeValue.max };
        
        const size1 = range1.max - range1.min + 1;
        const size2 = range2.max - range2.min + 1;
        
        newRange = size1 >= size2 ? range1 : range2;
      }
    } else {
      // Add this difficulty to the range
      newRange.min = Math.min(safeValue.min, difficultyValue);
      newRange.max = Math.max(safeValue.max, difficultyValue);
    }

    onChange(newRange);
  };

  /**
   * Check if a difficulty level is currently selected
   * @param {number} difficultyValue - The difficulty value to check
   * @returns {boolean} Whether the difficulty is selected
   */
  const isDifficultySelected = (difficultyValue) => {
    return difficultyValue >= safeValue.min && difficultyValue <= safeValue.max;
  };

  /**
   * Render stars for a difficulty level
   * @param {number} starCount - Number of stars to render
   * @param {boolean} isSelected - Whether the difficulty is selected
   * @returns {JSX.Element} Star elements
   */
  const renderStars = (starCount, isSelected) => {
    return (
      <div className="difficulty-checkbox__stars">
        {Array.from({ length: starCount }, (_, index) => (
          <span
            key={index}
            className={`difficulty-checkbox__star ${isSelected ? 'difficulty-checkbox__star--selected' : ''}`}
            aria-hidden="true"
          >
            ★
          </span>
        ))}
      </div>
    );
  };

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

  const containerClasses = [
    'difficulty-range-slider',
    disabled ? 'difficulty-range-slider--disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses} {...rest}>
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

      <div className="difficulty-checkbox__container">
        {difficultyOptions.map((option) => {
          const isSelected = isDifficultySelected(option.value);
          const isDisabled = disabled || (safeValue.min === safeValue.max && isSelected);
          
          return (
            <label
              key={option.value}
              className={`difficulty-checkbox__label ${isSelected ? 'difficulty-checkbox__label--selected' : ''} ${isDisabled ? 'difficulty-checkbox__label--disabled' : ''}`}
            >
              <input
                type="checkbox"
                className="difficulty-checkbox__input"
                checked={isSelected}
                onChange={() => handleDifficultyToggle(option.value)}
                disabled={isDisabled}
                aria-label={`Select ${option.label} difficulty`}
              />
              <div className="difficulty-checkbox__content">
                <div className="difficulty-checkbox__header">
                  <span className="difficulty-checkbox__icon">{option.icon}</span>
                  <span className="difficulty-checkbox__label-text">{option.label}</span>
                </div>
                {renderStars(option.stars, isSelected)}
                <p className="difficulty-checkbox__description">{option.description}</p>
              </div>
            </label>
          );
        })}
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