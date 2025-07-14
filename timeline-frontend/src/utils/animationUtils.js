// Import animation queue system
import { queueAnimation, queueCardAnimation, queueParallelAnimations } from './animationQueue.js';

// Animation timing constants with detailed breakdown
export const ANIMATION_DELAYS = {
  SHAKE_DURATION: 400,              // Reduced from 600ms
  FADE_OUT_DURATION: 300,           // Reduced from 500ms
  FEEDBACK_DELAY: 200,              // Reduced from 300ms
  NEW_CARD_DELAY: 600,              // Reduced from 800ms
  BOUNCE_IN_DURATION: 600,          // Reduced from 800ms
  HIGHLIGHT_DURATION: 400,          // Reduced from 1200ms
  WRONG_PLACEMENT_DURATION: 800,    // Reduced from 1200ms
  TIMELINE_SHAKE_DURATION: 600,     // Reduced from 800ms
  INSERTION_POINT_ERROR_DURATION: 400, // Reduced from 600ms
  TOTAL_ANIMATION_DURATION: 2000    // Reduced from 2900ms
};

// Animation easing functions for smooth transitions
export const EASING = {
  SHAKE: 'cubic-bezier(0.36, 0, 0.66, 1)',
  FADE_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
  BOUNCE_IN: 'cubic-bezier(0.4, 0, 0.2, 1)',         // Changed to ease-out
  HIGHLIGHT: 'cubic-bezier(0.4, 0, 0.2, 1)',
  WRONG_PLACEMENT: 'cubic-bezier(0.36, 0, 0.66, 1)', // Changed to shake easing
  TIMELINE_SHAKE: 'cubic-bezier(0.36, 0, 0.66, 1)',
  INSERTION_POINT_ERROR: 'cubic-bezier(0.4, 0, 0.2, 1)' // Changed to ease-out
};

// Utility to add/remove animation classes with error handling
export const animateCard = (element, animationClass, duration) => {
  return queueCardAnimation(element, animationClass, duration);
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
      animations.push(() => 
        animateCard(cardElement, 'card-wrong-placement', ANIMATION_DELAYS.WRONG_PLACEMENT_DURATION)
      );
    }

    // Animate timeline shake
    if (timelineElement) {
      animations.push(() => 
        animateCard(timelineElement, 'timeline-wrong-placement', ANIMATION_DELAYS.TIMELINE_SHAKE_DURATION)
      );
    }

    // Animate insertion point error
    if (insertionPointElement) {
      animations.push(() => 
        animateCard(insertionPointElement, 'insertion-point-error', ANIMATION_DELAYS.INSERTION_POINT_ERROR_DURATION)
      );
    }

    // Run all animations in parallel using queue
    await queueParallelAnimations(animations, 'high');

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