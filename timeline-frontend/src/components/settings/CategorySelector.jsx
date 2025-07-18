import React, { useState, useMemo, useRef, useEffect } from 'react';
import useLayoutMode from './useLayoutMode';
import './CategorySelector.css';

/**
 * CategorySelector - Multi-select component for choosing game categories
 *
 * This component provides a user-friendly way to select multiple game categories
 * with search functionality, favorites system, and proper accessibility.
 * It automatically adapts its layout based on screen size.
 *
 * @component
 * @example
 * ```jsx
 * <CategorySelector
 *   value={['history', 'science']}
 *   categories={availableCategories}
 *   onChange={(categories) => {}}
 *   disabled={false}
 * />
 * ```
 */
const CategorySelector = ({
  value = [],
  categories = [],
  onChange,
  disabled = false,
  className = '',
  ...rest
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem('timeline-game-favorites');
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
        'timeline-game-favorites',
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

  // Filter categories based on search term
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) {
      return categories;
    }

    const term = searchTerm.toLowerCase();
    return categories.filter(
      category =>
        category.name.toLowerCase().includes(term) ||
        category.description.toLowerCase().includes(term)
    );
  }, [categories, searchTerm]);

  const handleToggleCategory = categoryId => {
    if (disabled) return;

    const newValue = value.includes(categoryId)
      ? value.filter(id => id !== categoryId)
      : [...value, categoryId];

    onChange(newValue);
  };

  const handleToggleFavorite = categoryId => {
    const newFavorites = favorites.includes(categoryId)
      ? favorites.filter(id => id !== categoryId)
      : [...favorites, categoryId];

    setFavorites(newFavorites);
  };

  const handleSelectAll = () => {
    if (disabled) return;
    const allCategoryIds = categories.map(cat => cat.id);
    onChange(allCategoryIds);
  };

  const handleClearAll = () => {
    if (disabled) return;
    onChange([]);
  };

  const handleSelectFavorites = () => {
    if (disabled) return;
    const favoriteCategories = favorites.filter(favId =>
      categories.some(cat => cat.id === favId)
    );
    onChange(favoriteCategories);
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
  const totalCount = categories.length;
  const favoriteCount = favorites.length;

  const containerClasses = [
    'category-selector',
    `category-selector--${layout}`,
    disabled ? 'category-selector--disabled' : '',
    showDropdown ? 'category-selector--open' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const getSelectedText = () => {
    if (selectedCount === 0) return 'Select categories';
    if (selectedCount === totalCount) return 'All categories';
    if (selectedCount === 1) return '1 category selected';
    return `${selectedCount} categories selected`;
  };

  const renderSearchBar = () => (
    <div className="category-selector__search">
      <input
        ref={searchInputRef}
        type="text"
        className="category-selector__search-input"
        placeholder="Search categories..."
        value={searchTerm}
        onChange={handleSearchChange}
        onKeyDown={handleSearchKeyDown}
        disabled={disabled}
        aria-label="Search categories"
      />
      {searchTerm && (
        <button
          type="button"
          className="category-selector__search-clear"
          onClick={() => setSearchTerm('')}
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  );

  const renderControls = () => (
    <div className="category-selector__controls">
      <button
        type="button"
        className="category-selector__control-button"
        onClick={handleSelectAll}
        disabled={disabled}
      >
        Select All
      </button>
      <button
        type="button"
        className="category-selector__control-button"
        onClick={handleClearAll}
        disabled={disabled}
      >
        Clear All
      </button>
      {favoriteCount > 0 && (
        <button
          type="button"
          className="category-selector__control-button"
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
            <div className="category-selector__grid">
              {filteredCategories.map(category => (
                <div
                  key={category.id}
                  className={`category-selector__grid-item ${
                    value.includes(category.id)
                      ? 'category-selector__grid-item--selected'
                      : ''
                  }`}
                  onClick={() => handleToggleCategory(category.id)}
                >
                  <div className="category-selector__grid-item-header">
                    <span className="category-selector__grid-item-name">
                      {category.name}
                    </span>
                    <button
                      type="button"
                      className={`category-selector__favorite ${
                        favorites.includes(category.id)
                          ? 'category-selector__favorite--active'
                          : ''
                      }`}
                      onClick={e => {
                        e.stopPropagation();
                        handleToggleFavorite(category.id);
                      }}
                      aria-label={`${favorites.includes(category.id) ? 'Remove from' : 'Add to'} favorites`}
                    >
                      ★
                    </button>
                  </div>
                  <p className="category-selector__grid-item-description">
                    {category.description}
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
            <div className="category-selector__compact">
              {filteredCategories.map(category => (
                <button
                  key={category.id}
                  className={`category-selector__compact-item ${
                    value.includes(category.id)
                      ? 'category-selector__compact-item--selected'
                      : ''
                  }`}
                  onClick={() => handleToggleCategory(category.id)}
                  disabled={disabled}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </>
        );

      case 'list':
      default:
        return (
          <div className="category-selector__dropdown">
            <button
              type="button"
              className="category-selector__dropdown-button"
              onClick={toggleDropdown}
              disabled={disabled}
              aria-expanded={showDropdown}
              aria-haspopup="true"
            >
              <span>{getSelectedText()}</span>
              <span className="category-selector__button-icon">▼</span>
            </button>
            {showDropdown && (
              <div className="category-selector__dropdown-content">
                {renderSearchBar()}
                {renderControls()}
                <div className="category-selector__list">
                  {filteredCategories.map(category => (
                    <div
                      key={category.id}
                      className={`category-selector__item ${
                        value.includes(category.id)
                          ? 'category-selector__item--selected'
                          : ''
                      }`}
                    >
                      <label className="category-selector__item-label">
                        <input
                          type="checkbox"
                          className="category-selector__item-checkbox"
                          checked={value.includes(category.id)}
                          onChange={() => handleToggleCategory(category.id)}
                          disabled={disabled}
                        />
                        <span className="category-selector__item-text">
                          {category.name}
                        </span>
                      </label>
                      <button
                        type="button"
                        className={`category-selector__favorite ${
                          favorites.includes(category.id)
                            ? 'category-selector__favorite--active'
                            : ''
                        }`}
                        onClick={() => handleToggleFavorite(category.id)}
                        aria-label={`${favorites.includes(category.id) ? 'Remove from' : 'Add to'} favorites`}
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

export default CategorySelector;
