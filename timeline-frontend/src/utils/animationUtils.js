// Animation timing constants with detailed breakdown
export const ANIMATION_DELAYS = {
  SHAKE_DURATION: 600,
  FADE_OUT_DURATION: 500,
  FEEDBACK_DELAY: 300,
  NEW_CARD_DELAY: 800,
  BOUNCE_IN_DURATION: 800,
  HIGHLIGHT_DURATION: 1200,
  WRONG_PLACEMENT_DURATION: 1200,
  TIMELINE_SHAKE_DURATION: 800,
  INSERTION_POINT_ERROR_DURATION: 600,
  TOTAL_ANIMATION_DURATION: 2900 // Total time for complete sequence
};

// Animation easing functions for smooth transitions
export const EASING = {
  SHAKE: 'cubic-bezier(0.36, 0, 0.66, 1)',
  FADE_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
  BOUNCE_IN: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  HIGHLIGHT: 'cubic-bezier(0.4, 0, 0.2, 1)',
  WRONG_PLACEMENT: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  TIMELINE_SHAKE: 'cubic-bezier(0.36, 0, 0.66, 1)',
  INSERTION_POINT_ERROR: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
};

// Utility to add/remove animation classes with error handling
export const animateCard = (element, animationClass, duration) => {
  return new Promise((resolve, reject) => {
    if (!element) {
      reject(new Error('Element not found for animation'));
      return;
    }

    try {
      // Add performance optimization class
      element.classList.add('card-animating');
      element.classList.add(animationClass);
      
      // Use requestAnimationFrame for smooth timing
      const startTime = performance.now();
      
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        
        if (elapsed >= duration) {
          element.classList.remove(animationClass);
          element.classList.remove('card-animating');
          resolve();
        } else {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    } catch (error) {
      reject(error);
    }
  });
};

// Enhanced animation sequence with proper timing
export const animateCardSequence = async (element, sequence) => {
  const results = [];
  
  for (const { animation, duration, delay = 0 } of sequence) {
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    try {
      await animateCard(element, animation, duration);
      results.push({ animation, success: true });
    } catch (error) {
      console.error(`Animation failed: ${animation}`, error);
      results.push({ animation, success: false, error });
    }
  }
  
  return results;
};

// Animate wrong card placement with timeline shake and insertion point error
export const animateWrongPlacement = async (cardElement, timelineElement, insertionPointElement) => {
  const startTime = performance.now();
  
  try {
    // Check for reduced motion preference
    if (prefersReducedMotion()) {
      // Apply instant state changes for reduced motion
      if (cardElement) {
        cardElement.style.opacity = '0';
        cardElement.style.transform = 'scale(0.8)';
      }
      return;
    }

    const animations = [];

    // Animate the card wrong placement
    if (cardElement) {
      animations.push(
        animateCard(cardElement, 'card-wrong-placement', ANIMATION_DELAYS.WRONG_PLACEMENT_DURATION)
      );
    }

    // Animate timeline shake
    if (timelineElement) {
      animations.push(
        animateCard(timelineElement, 'timeline-wrong-placement', ANIMATION_DELAYS.TIMELINE_SHAKE_DURATION)
      );
    }

    // Animate insertion point error
    if (insertionPointElement) {
      animations.push(
        animateCard(insertionPointElement, 'insertion-point-error', ANIMATION_DELAYS.INSERTION_POINT_ERROR_DURATION)
      );
    }

    // Run all animations in parallel
    await Promise.all(animations);

    // Cleanup animations
    if (cardElement) cleanupAnimations(cardElement);
    if (timelineElement) cleanupAnimations(timelineElement);
    if (insertionPointElement) cleanupAnimations(insertionPointElement);

    // Measure and log performance
    measureAnimationPerformance('wrong_placement', startTime);

  } catch (error) {
    console.error('Wrong placement animation failed:', error);
    // Fallback: apply instant state changes
    if (cardElement) {
      cleanupAnimations(cardElement);
      cardElement.style.opacity = '0';
      cardElement.style.transform = 'scale(0.8)';
    }
  }
};

// Check for reduced motion preference with fallback
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (error) {
    console.warn('Could not detect reduced motion preference:', error);
    return false;
  }
};

// Performance monitoring for animations
export const measureAnimationPerformance = (animationName, startTime) => {
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  // Log performance data for optimization
  if (duration > 16.67) { // Longer than one frame at 60fps
    console.warn(`Animation ${animationName} took ${duration.toFixed(2)}ms`);
  }
  
  return duration;
};

// Cleanup function to remove all animation classes
export const cleanupAnimations = (element) => {
  if (!element) return;
  
  const animationClasses = [
    'card-shake',
    'card-fade-out', 
    'card-bounce-in',
    'card-highlight',
    'card-wrong-placement',
    'timeline-wrong-placement',
    'insertion-point-error',
    'card-animating'
  ];
  
  animationClasses.forEach(className => {
    element.classList.remove(className);
  });
};

// Debounce function to prevent rapid animation triggers
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}; 