// Accessibility utilities for animations
export const accessibilityConfig = {
  // Enhanced reduced motion detection with fallback
  prefersReducedMotion: () => {
    if (typeof window === 'undefined') return false;

    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (error) {
      return false;
    }
  },

  // Enhanced animation preferences detection
  getAnimationPreferences: () => {
    if (typeof window === 'undefined') {
      return {
        shouldAnimate: false,
        durationMultiplier: 0.5,
        shouldUseSubtleAnimations: true,
      };
    }

    try {
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;
      const prefersReducedData = window.matchMedia(
        '(prefers-reduced-data: reduce)'
      ).matches;

      return {
        shouldAnimate: !prefersReducedMotion && !prefersReducedData,
        durationMultiplier: prefersReducedMotion ? 0.5 : 1,
        shouldUseSubtleAnimations: prefersReducedMotion,
      };
    } catch (error) {
      return {
        shouldAnimate: true,
        durationMultiplier: 1,
        shouldUseSubtleAnimations: false,
      };
    }
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
  },
};

// ARIA labels for animation states
export const getAnimationAriaLabel = (animationType, cardTitle) => {
  const labels = {
    removal: `${cardTitle} is being removed due to incorrect placement`,
    addition: `New card ${cardTitle} is being added to your hand`,
    shake: `${cardTitle} is shaking to indicate incorrect placement`,
    highlight: `${cardTitle} is highlighted as a new card`,
  };
  return labels[animationType] || '';
};
