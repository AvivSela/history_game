import React, { useState, useMemo, useRef, useEffect } from 'react';
import './CategorySelector.css';

/**
 * CategorySelector - Multi-select component for choosing game categories
 * 
 * This component provides a user-friendly way to select multiple game categories
 * with search functionality, favorites system, and proper accessibility.
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
 * 
 * @param {Object} props - Component props
 * @param {Array<string>} props.value - Currently selected categories
 * @param {Array<Object>} props.categories - Available categories array
 * @param {Function} props.onChange - Change handler function
 * @param {boolean} [props.disabled=false] - Whether the selector is disabled
 * @param {string} [props.className] - Additional CSS classes
 * @param {Object} props.rest - Additional props passed to the div element
 * 
 * @returns {JSX.Element} The category selector component
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

  // Save favorites to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('timeline-game-favorites', JSON.stringify(favorites));
    } catch (error) {
      // Failed to save favorites to localStorage
    }
  }, [favorites]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
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
    return categories.filter(category => 
      category.name.toLowerCase().includes(term) ||
      category.description.toLowerCase().includes(term)
    );
  }, [categories, searchTerm]);

  const handleToggleCategory = (categoryId) => {
    if (disabled) return;

    const newValue = value.includes(categoryId)
      ? value.filter(id => id !== categoryId)
      : [...value, categoryId];
    
    onChange(newValue);
  };

  const handleToggleFavorite = (categoryId) => {
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

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === 'Escape') {
      setShowDropdown(false);
      setSearchTerm('');
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
    disabled ? 'category-selector--disabled' : '',
    showDropdown ? 'category-selector--open' : '',
    className
  ].filter(Boolean).join(' ');

  const getSelectedText = () => {
    if (selectedCount === 0) return 'Select categories';
    if (selectedCount === totalCount) return 'All categories';
    if (selectedCount === 1) return '1 category selected';
    return `${selectedCount} categories selected`;
  };

  return (
    <div 
      className={containerClasses}
      ref={containerRef}
      {...rest}
    >
      <div className="category-selector__header">
        <label className="category-selector__label">
          Game Categories
        </label>
        <div className="category-selector__summary">
          {selectedCount > 0 && (
            <span className="category-selector__count">
              {selectedCount}/{totalCount}
            </span>
          )}
        </div>
      </div>

      <div className="category-selector__trigger">
        <button
          type="button"
          className="category-selector__button"
          onClick={toggleDropdown}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={showDropdown}
          aria-describedby="category-selector-description"
        >
          <span className="category-selector__button-text">
            {getSelectedText()}
          </span>
          <svg 
            className="category-selector__button-icon" 
            viewBox="0 0 24 24" 
            aria-hidden="true"
          >
            <path d="M7 10l5 5 5-5z" />
          </svg>
        </button>
      </div>

      {showDropdown && (
        <div className="category-selector__dropdown">
          <div className="category-selector__search">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
              className="category-selector__search-input"
              aria-label="Search categories"
            />
          </div>

          <div className="category-selector__actions">
            <button
              type="button"
              onClick={handleSelectAll}
              className="category-selector__action"
              disabled={disabled}
            >
              Select All
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="category-selector__action"
              disabled={disabled}
            >
              Clear All
            </button>
            {favoriteCount > 0 && (
              <button
                type="button"
                onClick={handleSelectFavorites}
                className="category-selector__action"
                disabled={disabled}
              >
                Favorites ({favoriteCount})
              </button>
            )}
          </div>

          <div className="category-selector__list" role="listbox">
            {filteredCategories.length === 0 ? (
              <div className="category-selector__empty">
                No categories found matching "{searchTerm}"
              </div>
            ) : (
              filteredCategories.map((category) => {
                const isSelected = value.includes(category.id);
                const isFavorite = favorites.includes(category.id);
                
                return (
                  <div 
                    key={category.id}
                    className={`category-selector__item ${isSelected ? 'category-selector__item--selected' : ''}`}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <label className="category-selector__item-label">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleCategory(category.id)}
                        disabled={disabled}
                        className="category-selector__item-checkbox"
                      />
                      <span className="category-selector__item-text">
                        {category.name}
                      </span>
                    </label>
                    
                    <button
                      type="button"
                      onClick={() => handleToggleFavorite(category.id)}
                      className={`category-selector__favorite ${isFavorite ? 'category-selector__favorite--active' : ''}`}
                      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                      disabled={disabled}
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </button>
                    
                    {category.description && (
                      <div className="category-selector__item-description">
                        {category.description}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      <div 
        id="category-selector-description"
        className="category-selector__description"
      >
        Choose which categories of historical events to include in your game. 
        Leave empty to include all categories.
      </div>
    </div>
  );
};

export default CategorySelector; 