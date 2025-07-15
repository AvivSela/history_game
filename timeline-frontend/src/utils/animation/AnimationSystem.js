// Unified Animation System
// Main class that brings together all animation components with a clean API

import { OPTIMIZED_TIMINGS, OPTIMIZED_EASING, ANIMATION_PRIORITY } from './constants.js';
import { generateOptimizedCSS } from './keyframes.js';
import deviceOptimizer from './DeviceOptimizer.js';
import accessibilityManager from './AccessibilityManager.js';
import { globalAnimationQueue, queueCardAnimation, queueParallelAnimations, queueSequentialAnimations } from './AnimationQueue.js';
import animationPerformanceMonitor from './PerformanceMonitor.js';

class AnimationSystem {
  constructor(options = {}) {
    this.options = {
      enablePerformanceMonitoring: true,
      enableAccessibility: true,
      enableDeviceOptimization: true,
      autoInjectCSS: true,
      ...options
    };
    
    this.isInitialized = false;
    this.cssInjected = false;
    
    // Initialize the system
    this.initialize();
  }

  // Initialize the animation system
  initialize() {
    if (this.isInitialized) return;
    
    // Inject optimized CSS if enabled
    if (this.options.autoInjectCSS) {
      this.injectOptimizedCSS();
    }
    
    // Setup event listeners
    this.setupEventListeners();
    
    this.isInitialized = true;
    

  }

  // Inject optimized CSS into the document
  injectOptimizedCSS() {
    if (this.cssInjected || typeof document === 'undefined') return;
    
    try {
      const css = generateOptimizedCSS();
      const style = document.createElement('style');
      style.textContent = css;
      style.setAttribute('data-animation-system', 'optimized');
      
      document.head.appendChild(style);
      this.cssInjected = true;
      

    } catch (error) {
      // Failed to inject optimized CSS
    }
  }

  // Setup event listeners
  setupEventListeners() {
    if (typeof window === 'undefined') return;
    
    // Listen for accessibility preference changes
    window.addEventListener('accessibilityPreferencesChanged', () => {
      this.onAccessibilityPreferencesChanged();
    });
    
    // Listen for device changes (orientation, resize, etc.)
    window.addEventListener('resize', this.debounce(() => {
      this.onDeviceChanged();
    }, 250));
    
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.onDeviceChanged(), 100);
    });
  }

  // Handle accessibility preference changes
  onAccessibilityPreferencesChanged() {
  }

  // Handle device changes
  onDeviceChanged() {
    deviceOptimizer.updatePerformanceMetrics();
    globalAnimationQueue.updateDeviceSettings();
  }

  // Core animation method
  async animate(element, animation, options = {}) {
    if (!this.isInitialized) {
      this.initialize();
    }
    
    const timerId = animationPerformanceMonitor.startAnimationTimer(animation, options);
    
    try {
      // Get optimized options
      const optimizedOptions = this.getOptimizedOptions(options);
      
      // Check if animation should be skipped
      if (!accessibilityManager.shouldAnimate()) {
        await this.applyInstantState(element, animation, optimizedOptions);
        return;
      }
      
      // Execute animation
      const result = await this.executeAnimation(element, animation, optimizedOptions);
      
      // End performance monitoring
      animationPerformanceMonitor.endAnimationTimer(timerId, { success: true });
      
      return result;
    } catch (error) {
      animationPerformanceMonitor.endAnimationTimer(timerId, { success: false, error });
      throw error;
    }
  }

  // Execute animation with device and accessibility optimizations
  async executeAnimation(element, animation, options) {
    const { duration, easing, className, instantState } = options;
    
    if (!element) {
      throw new Error('Element is required for animation');
    }
    
    // Apply GPU acceleration
    if (options.enableGPUAcceleration) {
      element.style.transform = 'translateZ(0)';
      element.style.willChange = 'transform, opacity';
    }
    
    // Add animation class
    if (className) {
      element.classList.add(className);
    }
    
    // Wait for animation to complete
    if (duration > 0) {
      await new Promise(resolve => {
        setTimeout(() => {
          if (className) {
            element.classList.remove(className);
          }
          resolve();
        }, duration);
      });
    }
    
    // Cleanup
    if (options.enableGPUAcceleration) {
      element.style.willChange = 'auto';
    }
  }

  // Apply instant state change for accessibility
  async applyInstantState(element, animation, options) {
    const { instantState } = options;
    
    if (instantState && typeof instantState === 'function') {
      await instantState(element);
    } else {
      // Default instant state changes
      switch (animation) {
        case 'card-shake':
        case 'card-wrong-placement':
          element.style.opacity = '0.8';
          break;
        case 'card-fade-out':
          element.style.opacity = '0';
          break;
        case 'card-bounce-in':
          element.style.opacity = '1';
          element.style.transform = 'scale(1) translateZ(0)';
          break;
        default:
          // No default instant state
          break;
      }
    }
  }

  // Get optimized options for current device and accessibility settings
  getOptimizedOptions(options = {}) {
    let optimizedOptions = { ...options };
    
    // Apply device-specific optimizations
    if (this.options.enableDeviceOptimization) {
      const deviceTimings = deviceOptimizer.getOptimizedTimings(OPTIMIZED_TIMINGS);
      optimizedOptions = {
        ...optimizedOptions,
        duration: deviceTimings[options.durationKey] || options.duration || 400,
        easing: options.easing || OPTIMIZED_EASING.TRANSITION
      };
    }
    
    // Apply accessibility optimizations
    if (this.options.enableAccessibility) {
      optimizedOptions = accessibilityManager.getAccessibleAnimationSettings(optimizedOptions);
    }
    
    return optimizedOptions;
  }

  // Animate card shake
  async animateCardShake(element, options = {}) {
    return this.animate(element, 'card-shake', {
      duration: OPTIMIZED_TIMINGS.CARD_SHAKE,
      easing: OPTIMIZED_EASING.SHAKE,
      className: 'card-shake',
      ...options
    });
  }

  // Animate card fade out
  async animateCardFadeOut(element, options = {}) {
    return this.animate(element, 'card-fade-out', {
      duration: OPTIMIZED_TIMINGS.CARD_FADE_OUT,
      easing: OPTIMIZED_EASING.FADE_OUT,
      className: 'card-fade-out',
      ...options
    });
  }

  // Animate card bounce in
  async animateCardBounceIn(element, options = {}) {
    return this.animate(element, 'card-bounce-in', {
      duration: OPTIMIZED_TIMINGS.CARD_BOUNCE_IN,
      easing: OPTIMIZED_EASING.BOUNCE_IN,
      className: 'card-bounce-in',
      ...options
    });
  }

  // Animate card highlight
  async animateCardHighlight(element, options = {}) {
    return this.animate(element, 'card-highlight', {
      duration: OPTIMIZED_TIMINGS.CARD_HIGHLIGHT,
      easing: OPTIMIZED_EASING.HIGHLIGHT,
      className: 'card-highlight',
      ...options
    });
  }

  // Animate wrong placement sequence
  async animateWrongPlacement(cardElement, timelineElement, insertionPointElement, options = {}) {
    const animations = [];
    
    // Card wrong placement animation
    if (cardElement) {
      animations.push(() => this.animate(cardElement, 'card-wrong-placement', {
        duration: OPTIMIZED_TIMINGS.WRONG_PLACEMENT,
        easing: OPTIMIZED_EASING.WRONG_PLACEMENT,
        className: 'card-wrong-placement',
        ...options
      }));
    }
    
    // Timeline shake animation
    if (timelineElement) {
      animations.push(() => this.animate(timelineElement, 'timeline-shake', {
        duration: OPTIMIZED_TIMINGS.TIMELINE_SHAKE,
        easing: OPTIMIZED_EASING.TIMELINE_SHAKE,
        className: 'timeline-wrong-placement',
        ...options
      }));
    }
    
    // Insertion point error animation
    if (insertionPointElement) {
      animations.push(() => this.animate(insertionPointElement, 'insertion-point-error', {
        duration: OPTIMIZED_TIMINGS.INSERTION_POINT_ERROR,
        easing: OPTIMIZED_EASING.INSERTION_POINT_ERROR,
        className: 'insertion-point-error',
        ...options
      }));
    }
    
    // Run all animations in parallel
    return queueParallelAnimations(animations, ANIMATION_PRIORITY.HIGH, options);
  }

  // Animate sequence of animations
  async animateSequence(elements, sequence, options = {}) {
    const animations = sequence.map(({ element, animation, ...animationOptions }) => {
      return () => this.animate(element, animation, { ...options, ...animationOptions });
    });
    
    return queueSequentialAnimations(animations, options.priority || ANIMATION_PRIORITY.NORMAL, options);
  }

  // Animate parallel animations
  async animateParallel(elements, animation, options = {}) {
    const animations = elements.map(element => {
      return () => this.animate(element, animation, options);
    });
    
    return queueParallelAnimations(animations, options.priority || ANIMATION_PRIORITY.NORMAL, options);
  }

  // Cleanup animations
  cleanupAnimations(element) {
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
    
    // Reset styles
    element.style.transform = '';
    element.style.opacity = '';
    element.style.willChange = 'auto';
  }

  // Get system status
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      cssInjected: this.cssInjected,
      device: deviceOptimizer.getDeviceInfo(),
      accessibility: accessibilityManager.getAccessibilityState(),
      performance: animationPerformanceMonitor.getPerformanceSummary(),
      queue: globalAnimationQueue.getStatus()
    };
  }

  // Get performance recommendations
  getPerformanceRecommendations() {
    return animationPerformanceMonitor.getOptimizationRecommendations();
  }

  // Log performance summary
  logPerformanceSummary() {
    animationPerformanceMonitor.logPerformanceSummary();
  }

  // Utility method for debouncing
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// Create singleton instance
const animationSystem = new AnimationSystem();

// Export singleton and class
export default animationSystem;
export { AnimationSystem }; 