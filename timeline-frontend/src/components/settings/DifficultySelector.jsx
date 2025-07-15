import React from 'react';
import { DIFFICULTY_LEVELS } from '../../constants/gameConstants.js';
import './DifficultySelector.css';

/**
 * DifficultySelector - Radio button group for selecting game difficulty
 * 
 * This component provides a user-friendly way to select game difficulty levels
 * with radio buttons, proper accessibility attributes, and keyboard navigation.
 * 
 * @component
 * @example
 * ```jsx
 * <DifficultySelector 
 *   value="medium" 
 *   onChange={(difficulty) => {}}
 *   disabled={false}
 * />
 * ```
 * 
 * @param {Object} props - Component props
 * @param {string} props.value - Current difficulty value
 * @param {Function} props.onChange - Change handler function
 * @param {boolean} [props.disabled=false] - Whether the selector is disabled
 * @param {string} [props.className] - Additional CSS classes
 * @param {Object} props.rest - Additional props passed to the fieldset element
 * 
 * @returns {JSX.Element} The difficulty selector component
 */
const DifficultySelector = ({ 
  value, 
  onChange, 
  disabled = false, 
  className = '', 
  ...rest 
}) => {
  const fieldsetId = 'difficulty-selector';
  const legendId = 'difficulty-selector-legend';

  const difficultyOptions = [
    {
      value: DIFFICULTY_LEVELS.EASY,
      label: 'Easy',
      description: 'Relaxed gameplay with generous time limits and hints',
      icon: '😊'
    },
    {
      value: DIFFICULTY_LEVELS.MEDIUM,
      label: 'Medium',
      description: 'Balanced challenge with moderate time pressure',
      icon: '😐'
    },
    {
      value: DIFFICULTY_LEVELS.HARD,
      label: 'Hard',
      description: 'Challenging gameplay with strict time limits',
      icon: '😰'
    },
    {
      value: DIFFICULTY_LEVELS.EXPERT,
      label: 'Expert',
      description: 'Maximum challenge with minimal assistance',
      icon: '😱'
    }
  ];

  const handleChange = (event) => {
    if (!disabled && onChange) {
      onChange(event.target.value);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault();
      const currentIndex = difficultyOptions.findIndex(option => option.value === value);
      const nextIndex = (currentIndex + 1) % difficultyOptions.length;
      onChange(difficultyOptions[nextIndex].value);
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const currentIndex = difficultyOptions.findIndex(option => option.value === value);
      const prevIndex = currentIndex === 0 ? difficultyOptions.length - 1 : currentIndex - 1;
      onChange(difficultyOptions[prevIndex].value);
    }
  };

  const fieldsetClasses = [
    'difficulty-selector',
    disabled ? 'difficulty-selector--disabled' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <fieldset 
      className={fieldsetClasses}
      id={fieldsetId}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      <legend 
        className="difficulty-selector__legend"
        id={legendId}
      >
        Game Difficulty
      </legend>
      
      <div className="difficulty-selector__options">
        {difficultyOptions.map((option) => {
          const inputId = `difficulty-${option.value}`;
          const isSelected = value === option.value;
          
          return (
            <div 
              key={option.value}
              className={`difficulty-selector__option ${isSelected ? 'difficulty-selector__option--selected' : ''}`}
            >
              <input
                type="radio"
                id={inputId}
                name="difficulty"
                value={option.value}
                checked={isSelected}
                onChange={handleChange}
                disabled={disabled}
                className="difficulty-selector__input"
                aria-describedby={`${inputId}-description`}
              />
              
              <label 
                htmlFor={inputId}
                className="difficulty-selector__label"
              >
                <span className="difficulty-selector__icon" aria-hidden="true">
                  {option.icon}
                </span>
                <span className="difficulty-selector__text">
                  {option.label}
                </span>
              </label>
              
              <div 
                id={`${inputId}-description`}
                className="difficulty-selector__description"
              >
                {option.description}
              </div>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
};

export default DifficultySelector; 