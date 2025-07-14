// Unified Animation System - Main Export
// Provides a clean API for all animation functionality

// Main animation system
import { default as animationSystem } from './AnimationSystem.js';
export { default as AnimationSystem } from './AnimationSystem.js';
export { default as animationSystem } from './AnimationSystem.js';

// Core components
import { default as deviceOptimizer } from './DeviceOptimizer.js';
export { default as DeviceOptimizer } from './DeviceOptimizer.js';
export { default as deviceOptimizer } from './DeviceOptimizer.js';

import { default as accessibilityManager } from './AccessibilityManager.js';
export { default as AccessibilityManager } from './AccessibilityManager.js';
export { default as accessibilityManager } from './AccessibilityManager.js';

export { AnimationQueue, globalAnimationQueue } from './AnimationQueue.js';
export { 
  queueAnimation, 
  queueCardAnimation, 
  queueParallelAnimations, 
  queueSequentialAnimations 
} from './AnimationQueue.js';

import { default as animationPerformanceMonitor } from './PerformanceMonitor.js';
export { default as AnimationPerformanceMonitor } from './PerformanceMonitor.js';
export { default as animationPerformanceMonitor } from './PerformanceMonitor.js';

// Constants and utilities
export { 
  OPTIMIZED_TIMINGS, 
  OPTIMIZED_EASING, 
  DEVICE_TIMING_MULTIPLIERS,
  ANIMATION_PRIORITY,
  PERFORMANCE_THRESHOLDS 
} from './constants.js';

export { 
  OPTIMIZED_KEYFRAMES, 
  OPTIMIZED_CLASSES, 
  generateOptimizedCSS 
} from './keyframes.js';

// Convenience exports for common animations
export const animations = {
  // Card animations
  cardShake: (element, options = {}) => animationSystem.animateCardShake(element, options),
  cardFadeOut: (element, options = {}) => animationSystem.animateCardFadeOut(element, options),
  cardBounceIn: (element, options = {}) => animationSystem.animateCardBounceIn(element, options),
  cardHighlight: (element, options = {}) => animationSystem.animateCardHighlight(element, options),
  
  // Complex animations
  wrongPlacement: (cardElement, timelineElement, insertionPointElement, options = {}) => 
    animationSystem.animateWrongPlacement(cardElement, timelineElement, insertionPointElement, options),
  
  // Utility methods
  sequence: (elements, sequence, options = {}) => animationSystem.animateSequence(elements, sequence, options),
  parallel: (elements, animation, options = {}) => animationSystem.animateParallel(elements, animation, options),
  cleanup: (element) => animationSystem.cleanupAnimations(element)
};

// Performance utilities
export const performance = {
  getStatus: () => animationSystem.getStatus(),
  getRecommendations: () => animationSystem.getPerformanceRecommendations(),
  logSummary: () => animationSystem.logPerformanceSummary(),
  monitor: animationPerformanceMonitor
};

// Device utilities
export const device = {
  getInfo: () => deviceOptimizer.getDeviceInfo(),
  getSettings: () => deviceOptimizer.getDeviceSettings(),
  getOptimizedTimings: (baseTimings) => deviceOptimizer.getOptimizedTimings(baseTimings),
  supportsAdvancedAnimations: () => deviceOptimizer.supportsAdvancedAnimations()
};

// Accessibility utilities
export const accessibility = {
  getState: () => accessibilityManager.getAccessibilityState(),
  shouldAnimate: () => accessibilityManager.shouldAnimate(),
  getAccessibleDuration: (baseDuration) => accessibilityManager.getAccessibleDuration(baseDuration),
  announceToScreenReader: (message, priority) => accessibilityManager.announceToScreenReader(message, priority),
  getAnimationAriaLabel: (animationType, context) => accessibilityManager.getAnimationAriaLabel(animationType, context)
};

// Default export for easy importing
export default animationSystem; 