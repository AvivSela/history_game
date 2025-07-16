import React, { useState } from 'react';
import './SettingsSection.css';

/**
 * SettingsSection - Collapsible section component for grouping related settings
 *
 * This component provides a consistent way to organize settings into logical groups
 * with collapsible functionality, proper accessibility attributes, and keyboard navigation.
 *
 * @component
 * @example
 * ```jsx
 * <SettingsSection title="Game Settings" defaultExpanded={true}>
 *   <DifficultySelector />
 *   <CardCountSlider />
 * </SettingsSection>
 * ```
 *
 * @param {Object} props - Component props
 * @param {string} props.title - Section title
 * @param {boolean} [props.defaultExpanded=true] - Whether section is expanded by default
 * @param {boolean} [props.disabled=false] - Whether the section is disabled
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.ReactNode} props.children - Section content
 * @param {Object} props.rest - Additional props passed to the section element
 *
 * @returns {JSX.Element} The settings section component
 */
const SettingsSection = ({
  title,
  defaultExpanded = true,
  disabled = false,
  className = '',
  children,
  ...rest
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const sectionId = `settings-section-${title.toLowerCase().replace(/\s+/g, '-')}`;
  const contentId = `${sectionId}-content`;

  const handleToggle = () => {
    if (!disabled) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleKeyDown = event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggle();
    }
  };

  const sectionClasses = [
    'settings-section',
    disabled ? 'settings-section--disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const headerClasses = [
    'settings-section__header',
    disabled ? 'settings-section__header--disabled' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const contentClasses = [
    'settings-section__content',
    isExpanded ? 'settings-section__content--expanded' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section className={sectionClasses} aria-labelledby={sectionId} {...rest}>
      <header
        className={headerClasses}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-expanded={isExpanded}
        aria-controls={contentId}
        aria-disabled={disabled}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        id={sectionId}
      >
        <h3 className="settings-section__title">{title}</h3>
        <button
          className={`settings-section__toggle ${isExpanded ? 'settings-section__toggle--expanded' : ''}`}
          aria-label={isExpanded ? 'Collapse section' : 'Expand section'}
          disabled={disabled}
          onClick={e => {
            e.stopPropagation();
            handleToggle();
          }}
        >
          <svg
            className="settings-section__toggle-icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M7 10l5 5 5-5z" />
          </svg>
        </button>
      </header>

      <div className={contentClasses} id={contentId} aria-hidden={!isExpanded}>
        <div className="settings-section__content-inner">{children}</div>
      </div>
    </section>
  );
};

export default SettingsSection;
