// Accessibility Manager for Animation System
// Handles reduced motion preferences and accessibility features

class AccessibilityManager {
  constructor() {
    this.preferences = this.detectPreferences();
    this.screenReaderActive = this.detectScreenReader();
    this.setupEventListeners();
  }

  // Detect user accessibility preferences
  detectPreferences() {
    if (typeof window === 'undefined') {
      return {
        prefersReducedMotion: false,
        prefersReducedData: false,
        prefersHighContrast: false,
        shouldAnimate: true,
        durationMultiplier: 1.0,
        shouldUseSubtleAnimations: false
      };
    }

    try {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const prefersReducedData = window.matchMedia('(prefers-reduced-data: reduce)').matches;
      const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;

      return {
        prefersReducedMotion,
        prefersReducedData,
        prefersHighContrast,
        shouldAnimate: !prefersReducedMotion && !prefersReducedData,
        durationMultiplier: prefersReducedMotion ? 0.5 : 1.0,
        shouldUseSubtleAnimations: prefersReducedMotion
      };
    } catch (error) {
      console.warn('Could not detect accessibility preferences:', error);
      return {
        prefersReducedMotion: false,
        prefersReducedData: false,
        prefersHighContrast: false,
        shouldAnimate: true,
        durationMultiplier: 1.0,
        shouldUseSubtleAnimations: false
      };
    }
  }

  // Detect if screen reader is active
  detectScreenReader() {
    if (typeof window === 'undefined') return false;

    try {
      // Check for common screen reader indicators
      const hasScreenReader = 
        navigator.userAgent.includes('NVDA') ||
        navigator.userAgent.includes('JAWS') ||
        navigator.userAgent.includes('VoiceOver') ||
        navigator.userAgent.includes('TalkBack') ||
        document.querySelector('[aria-live]') !== null;

      return hasScreenReader;
    } catch (error) {
      console.warn('Could not detect screen reader:', error);
      return false;
    }
  }

  // Setup event listeners for preference changes
  setupEventListeners() {
    if (typeof window === 'undefined') return;

    try {
      // Listen for reduced motion preference changes
      const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      motionQuery.addEventListener('change', () => {
        this.preferences = this.detectPreferences();
        this.onPreferencesChanged();
      });

      // Listen for reduced data preference changes
      const dataQuery = window.matchMedia('(prefers-reduced-data: reduce)');
      dataQuery.addEventListener('change', () => {
        this.preferences = this.detectPreferences();
        this.onPreferencesChanged();
      });

      // Listen for high contrast preference changes
      const contrastQuery = window.matchMedia('(prefers-contrast: high)');
      contrastQuery.addEventListener('change', () => {
        this.preferences = this.detectPreferences();
        this.onPreferencesChanged();
      });
    } catch (error) {
      console.warn('Could not setup accessibility event listeners:', error);
    }
  }

  // Handle preference changes
  onPreferencesChanged() {
    // Emit custom event for other components to listen to
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('accessibilityPreferencesChanged', {
        detail: this.preferences
      }));
    }
  }

  // Check if animations should be enabled
  shouldAnimate() {
    return this.preferences.shouldAnimate;
  }

  // Get accessible animation duration
  getAccessibleDuration(baseDuration) {
    return Math.round(baseDuration * this.preferences.durationMultiplier);
  }

  // Get accessible animation settings
  getAccessibleAnimationSettings(baseSettings) {
    if (!this.shouldAnimate()) {
      return {
        ...baseSettings,
        duration: 0,
        shouldAnimate: false,
        useInstantTransition: true
      };
    }

    return {
      ...baseSettings,
      duration: this.getAccessibleDuration(baseSettings.duration || 400),
      shouldAnimate: true,
      useInstantTransition: false,
      shouldUseSubtleAnimations: this.preferences.shouldUseSubtleAnimations
    };
  }

  // Announce to screen reader
  announceToScreenReader(message, priority = 'polite') {
    if (typeof document === 'undefined') return;

    try {
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
    } catch (error) {
      console.warn('Could not announce to screen reader:', error);
    }
  }

  // Get ARIA label for animation
  getAnimationAriaLabel(animationType, context = {}) {
    const labels = {
      'card-shake': `${context.cardTitle || 'Card'} is shaking to indicate incorrect placement`,
      'card-fade-out': `${context.cardTitle || 'Card'} is being removed`,
      'card-bounce-in': `New card ${context.cardTitle || ''} is being added to your hand`,
      'card-highlight': `${context.cardTitle || 'Card'} is highlighted as a new card`,
      'wrong-placement': `${context.cardTitle || 'Card'} was placed incorrectly`,
      'timeline-shake': 'Timeline is shaking to indicate incorrect placement',
      'insertion-point-error': 'Insertion point is showing an error',
      'quick-feedback': 'Quick feedback animation is playing'
    };

    return labels[animationType] || '';
  }

  // Manage focus for animations
  manageFocus(element, shouldFocus = true, scrollBehavior = 'smooth') {
    if (!element || typeof window === 'undefined') return;

    try {
      if (shouldFocus) {
        element.focus();
        element.scrollIntoView({ 
          behavior: this.shouldAnimate() ? scrollBehavior : 'auto', 
          block: 'nearest' 
        });
      }
    } catch (error) {
      console.warn('Could not manage focus:', error);
    }
  }

  // Handle keyboard navigation
  handleKeyboardNavigation(event, handlers = {}) {
    if (!event) return;

    const { onEnter, onEscape, onArrowUp, onArrowDown, onArrowLeft, onArrowRight } = handlers;

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
      case 'ArrowUp':
        event.preventDefault();
        onArrowUp?.();
        break;
      case 'ArrowDown':
        event.preventDefault();
        onArrowDown?.();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        onArrowLeft?.();
        break;
      case 'ArrowRight':
        event.preventDefault();
        onArrowRight?.();
        break;
    }
  }

  // Get accessibility recommendations
  getAccessibilityRecommendations() {
    const recommendations = [];

    if (this.preferences.prefersReducedMotion) {
      recommendations.push('Use instant state changes instead of animations');
    }

    if (this.preferences.prefersReducedData) {
      recommendations.push('Minimize animation complexity and duration');
    }

    if (this.preferences.prefersHighContrast) {
      recommendations.push('Ensure high contrast for animated elements');
    }

    if (this.screenReaderActive) {
      recommendations.push('Provide ARIA labels for all animations');
      recommendations.push('Use polite announcements for state changes');
    }

    return recommendations;
  }

  // Get current accessibility state
  getAccessibilityState() {
    return {
      preferences: this.preferences,
      screenReaderActive: this.screenReaderActive,
      recommendations: this.getAccessibilityRecommendations(),
      shouldAnimate: this.shouldAnimate()
    };
  }
}

// Create singleton instance
const accessibilityManager = new AccessibilityManager();

// Export singleton and class
export default accessibilityManager;
export { AccessibilityManager }; 