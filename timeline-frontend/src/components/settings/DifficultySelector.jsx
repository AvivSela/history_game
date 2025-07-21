import React, { useState, useMemo, useRef, useEffect } from 'react';
import { DIFFICULTY_LEVELS } from '../../constants/gameConstants.js';
import useLayoutMode from './useLayoutMode';
import './DifficultySelector.css';

/**
 * DifficultySelector - Multi-select component for choosing game difficulty levels
 *
 * This component provides a user-friendly way to select multiple difficulty levels
 * for card filtering, similar to the CategorySelector. It supports search functionality,
 * favorites system, and proper accessibility with adaptive layout.
 *
 * @component
 * @example
 * ```jsx
 * <DifficultySelector
 *   value={['easy', 'medium']}
 *   onChange={(difficulties) => {}}
 *   disabled={false}
 * />
 * ```
 *
 * @param {Object} props - Component props
 * @param {Array} props.value - Current selected difficulty values
 * @param {Function} props.onChange - Change handler function
 * @param {boolean} [props.disabled=false] - Whether the selector is disabled
 * @param {string} [props.className] - Additional CSS classes
 * @param {Object} props.rest - Additional props passed to the container element
 *
 * @returns {JSX.Element} The difficulty selector component
 */
const DifficultySelector = ({
  value = [],
  onChange,
  disabled = false,
  className = '',
  ...rest
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem('timeline-game-difficulty-favorites');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const layout = useLayoutMode();

  // Save favorites to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem(
        'timeline-game-difficulty-favorites',
        JSON.stringify(favorites)
      );
    } catch (error) {
      // Failed to save favorites to localStorage
    }
  }, [favorites]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const difficultyOptions = [
    {
      value: DIFFICULTY_LEVELS.EASY,
      label: 'Easy',
      description: 'Relaxed gameplay with generous time limits and hints',
      icon: '😊',
      numericLevel: 1,
    },
    {
      value: DIFFICULTY_LEVELS.MEDIUM,
      label: 'Medium',
      description: 'Balanced challenge with moderate time pressure',
      icon: '😐',
      numericLevel: 2,
    },
    {
      value: DIFFICULTY_LEVELS.HARD,
      label: 'Hard',
      description: 'Challenging gameplay with strict time limits',
      icon: '😰',
      numericLevel: 3,
    },
    {
      value: DIFFICULTY_LEVELS.EXPERT,
      label: 'Expert',
      description: 'Maximum challenge with minimal assistance',
      icon: '😱',
      numericLevel: 4,
    },
  ];

  // Filter difficulties based on search term
  const filteredDifficulties = useMemo(() => {
    if (!searchTerm.trim()) {
      return difficultyOptions;
    }

    const term = searchTerm.toLowerCase();
    return difficultyOptions.filter(
      difficulty =>
        difficulty.label.toLowerCase().includes(term) ||
        difficulty.description.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  const handleToggleDifficulty = difficultyValue => {
    if (disabled) return;

    const newValue = value.includes(difficultyValue)
      ? value.filter(val => val !== difficultyValue)
      : [...value, difficultyValue];

    onChange(newValue);
  };

  const handleToggleFavorite = difficultyValue => {
    const newFavorites = favorites.includes(difficultyValue)
      ? favorites.filter(val => val !== difficultyValue)
      : [...favorites, difficultyValue];

    setFavorites(newFavorites);
  };

  const handleSelectAll = () => {
    if (disabled) return;
    const allDifficultyValues = difficultyOptions.map(diff => diff.value);
    onChange(allDifficultyValues);
  };

  const handleClearAll = () => {
    if (disabled) return;
    onChange([]);
  };

  const handleSelectFavorites = () => {
    if (disabled) return;
    const favoriteDifficulties = favorites.filter(favValue =>
      difficultyOptions.some(diff => diff.value === favValue)
    );
    onChange(favoriteDifficulties);
  };

  const handleSearchChange = event => {
    setSearchTerm(event.target.value);
  };

  const handleSearchKeyDown = event => {
    if (event.key === 'Escape') {
      setSearchTerm('');
      if (layout === 'list') {
        setShowDropdown(false);
      }
    }
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setShowDropdown(!showDropdown);
      if (!showDropdown) {
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
    }
  };

  const selectedCount = value.length;
  const totalCount = difficultyOptions.length;
  const favoriteCount = favorites.length;

  const containerClasses = [
    'difficulty-selector',
    `difficulty-selector--${layout}`,
    disabled ? 'difficulty-selector--disabled' : '',
    showDropdown ? 'difficulty-selector--open' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const getSelectedText = () => {
    if (selectedCount === 0) return 'Select difficulties';
    if (selectedCount === totalCount) return 'All difficulties';
    if (selectedCount === 1) return '1 difficulty selected';
    return `${selectedCount} difficulties selected`;
  };

  const renderSearchBar = () => (
    <div className="difficulty-selector__search">
      <input
        ref={searchInputRef}
        type="text"
        className="difficulty-selector__search-input"
        placeholder="Search difficulties..."
        value={searchTerm}
        onChange={handleSearchChange}
        onKeyDown={handleSearchKeyDown}
        disabled={disabled}
        aria-label="Search difficulties"
      />
      {searchTerm && (
        <button
          type="button"
          className="difficulty-selector__search-clear"
          onClick={() => setSearchTerm('')}
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  );

  const renderControls = () => (
    <div className="difficulty-selector__controls">
      <button
        type="button"
        className="difficulty-selector__control-button"
        onClick={handleSelectAll}
        disabled={disabled}
      >
        Select All
      </button>
      <button
        type="button"
        className="difficulty-selector__control-button"
        onClick={handleClearAll}
        disabled={disabled}
      >
        Clear All
      </button>
      {favoriteCount > 0 && (
        <button
          type="button"
          className="difficulty-selector__control-button"
          onClick={handleSelectFavorites}
          disabled={disabled}
        >
          Select Favorites
        </button>
      )}
    </div>
  );

  const renderLayout = () => {
    switch (layout) {
      case 'grid':
        return (
          <>
            {renderSearchBar()}
            {renderControls()}
            <div className="difficulty-selector__grid">
              {filteredDifficulties.map(difficulty => (
                <div
                  key={difficulty.value}
                  className={`difficulty-selector__grid-item ${
                    value.includes(difficulty.value)
                      ? 'difficulty-selector__grid-item--selected'
                      : ''
                  }`}
                  onClick={() => handleToggleDifficulty(difficulty.value)}
                >
                  <div className="difficulty-selector__grid-item-header">
                    <span className="difficulty-selector__grid-item-name">
                      {difficulty.label}
                    </span>
                    <button
                      type="button"
                      className={`difficulty-selector__favorite ${
                        favorites.includes(difficulty.value)
                          ? 'difficulty-selector__favorite--active'
                          : ''
                      }`}
                      onClick={e => {
                        e.stopPropagation();
                        handleToggleFavorite(difficulty.value);
                      }}
                      aria-label={`${favorites.includes(difficulty.value) ? 'Remove from' : 'Add to'} favorites`}
                    >
                      ★
                    </button>
                  </div>
                  <p className="difficulty-selector__grid-item-description">
                    {difficulty.description}
                  </p>
                </div>
              ))}
            </div>
          </>
        );

      case 'compact':
        return (
          <>
            {renderSearchBar()}
            {renderControls()}
            <div className="difficulty-selector__compact">
              {filteredDifficulties.map(difficulty => (
                <button
                  key={difficulty.value}
                  className={`difficulty-selector__compact-item ${
                    value.includes(difficulty.value)
                      ? 'difficulty-selector__compact-item--selected'
                      : ''
                  }`}
                  onClick={() => handleToggleDifficulty(difficulty.value)}
                  disabled={disabled}
                >
                  {difficulty.label}
                </button>
              ))}
            </div>
          </>
        );

      case 'list':
      default:
        return (
          <div className="difficulty-selector__dropdown">
            <button
              type="button"
              className="difficulty-selector__dropdown-button"
              onClick={toggleDropdown}
              disabled={disabled}
              aria-expanded={showDropdown}
              aria-haspopup="true"
            >
              <span>{getSelectedText()}</span>
              <span className="difficulty-selector__button-icon">▼</span>
            </button>
            {showDropdown && (
              <div className="difficulty-selector__dropdown-content">
                {renderSearchBar()}
                {renderControls()}
                <div className="difficulty-selector__list">
                  {filteredDifficulties.map(difficulty => (
                    <div
                      key={difficulty.value}
                      className={`difficulty-selector__item ${
                        value.includes(difficulty.value)
                          ? 'difficulty-selector__item--selected'
                          : ''
                      }`}
                    >
                      <label className="difficulty-selector__item-label">
                        <input
                          type="checkbox"
                          className="difficulty-selector__item-checkbox"
                          checked={value.includes(difficulty.value)}
                          onChange={() => handleToggleDifficulty(difficulty.value)}
                          disabled={disabled}
                        />
                        <span className="difficulty-selector__item-text">
                          {difficulty.label}
                        </span>
                      </label>
                      <button
                        type="button"
                        className={`difficulty-selector__favorite ${
                          favorites.includes(difficulty.value)
                            ? 'difficulty-selector__favorite--active'
                            : ''
                        }`}
                        onClick={() => handleToggleFavorite(difficulty.value)}
                        aria-label={`${favorites.includes(difficulty.value) ? 'Remove from' : 'Add to'} favorites`}
                      >
                        ★
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div ref={containerRef} className={containerClasses} {...rest}>
      {renderLayout()}
    </div>
  );
};

export default DifficultySelector;
