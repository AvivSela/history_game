// Accessibility utilities for animations
export const accessibilityConfig = {
  // Reduced motion detection with fallback
  prefersReducedMotion: () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },
  
  // Screen reader announcements
  announceToScreenReader: (message, priority = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement);
      }
    }, 1000);
  },
  
  // Focus management for animations
  manageFocus: (element, shouldFocus = true) => {
    if (!element) return;
    
    if (shouldFocus) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  },
  
  // Keyboard navigation support
  handleKeyboardNavigation: (event, onEnter, onEscape) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        onEnter?.();
        break;
      case 'Escape':
        event.preventDefault();
        onEscape?.();
        break;
    }
  }
};

// ARIA labels for animation states
export const getAnimationAriaLabel = (animationType, cardTitle) => {
  const labels = {
    'removal': `${cardTitle} is being removed due to incorrect placement`,
    'addition': `New card ${cardTitle} is being added to your hand`,
    'shake': `${cardTitle} is shaking to indicate incorrect placement`,
    'highlight': `${cardTitle} is highlighted as a new card`
  };
  return labels[animationType] || '';
}; 