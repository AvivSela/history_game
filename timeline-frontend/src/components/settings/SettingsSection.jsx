import React from 'react';
import './SettingsSection.css';

/**
 * SettingsSection - Section component for grouping related settings
 *
 * This component provides a consistent way to organize settings into logical groups
 * with proper accessibility attributes and styling.
 *
 * @component
 * @example
 * ```jsx
 * <SettingsSection title="Game Settings">
 *   <DifficultySelector />
 *   <CardCountSlider />
 * </SettingsSection>
 * ```
 *
 * @param {Object} props - Component props
 * @param {string} props.title - Section title
 * @param {boolean} [props.disabled=false] - Whether the section is disabled
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.ReactNode} props.children - Section content
 * @param {Object} props.rest - Additional props passed to the section element
 *
 * @returns {JSX.Element} The settings section component
 */
const SettingsSection = ({
  title,
  disabled = false,
  className = '',
  children,
  ...rest
}) => {
  const sectionId = `settings-section-${title.toLowerCase().replace(/\s+/g, '-')}`;
  const contentId = `${sectionId}-content`;

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
    'settings-section__content--expanded',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section className={sectionClasses} aria-labelledby={sectionId} {...rest}>
      <header
        className={headerClasses}
        id={sectionId}
      >
        <h3 className="settings-section__title">{title}</h3>
      </header>

      <div className={contentClasses} id={contentId}>
        <div className="settings-section__content-inner">{children}</div>
      </div>
    </section>
  );
};

export default SettingsSection;
