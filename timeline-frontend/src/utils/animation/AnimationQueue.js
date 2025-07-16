// Optimized Animation Queue System
// Manages multiple animations with performance optimization and device-specific adjustments

import { PERFORMANCE_THRESHOLDS, ANIMATION_PRIORITY } from './constants.js';
import deviceOptimizer from './DeviceOptimizer.js';
import accessibilityManager from './AccessibilityManager.js';

class AnimationQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.currentAnimation = null;
    this.activeAnimations = new Set();
    this.performanceMetrics = {
      totalAnimations: 0,
      averageDuration: 0,
      frameDrops: 0,
      lastFrameTime: 0,
    };

    // Get device-specific settings
    this.deviceSettings = deviceOptimizer.getDeviceSettings();
    this.maxConcurrentAnimations = this.deviceSettings.maxConcurrentAnimations;

    // Setup performance monitoring
    this.setupPerformanceMonitoring();
  }

  // Setup performance monitoring
  setupPerformanceMonitoring() {
    if (typeof window === 'undefined') return;

    let lastFrameTime = performance.now();

    const monitorFrameRate = () => {
      const currentTime = performance.now();
      const frameTime = currentTime - lastFrameTime;

      // Check for frame drops (frame time > 16.67ms for 60fps)
      if (frameTime > PERFORMANCE_THRESHOLDS.FRAME_BUDGET) {
        this.performanceMetrics.frameDrops++;
      }

      lastFrameTime = currentTime;
      this.performanceMetrics.lastFrameTime = frameTime;

      requestAnimationFrame(monitorFrameRate);
    };

    requestAnimationFrame(monitorFrameRate);
  }

  // Add animation to queue with priority
  add(animation, priority = ANIMATION_PRIORITY.NORMAL, options = {}) {
    const queueItem = {
      id: Date.now() + Math.random(),
      animation,
      priority,
      options,
      timestamp: Date.now(),
      deviceSettings: this.deviceSettings,
    };

    // Insert based on priority
    if (priority === ANIMATION_PRIORITY.CRITICAL) {
      this.queue.unshift(queueItem);
    } else if (priority === ANIMATION_PRIORITY.HIGH) {
      // Insert after critical items
      const criticalIndex = this.queue.findIndex(
        item => item.priority !== ANIMATION_PRIORITY.CRITICAL
      );
      if (criticalIndex === -1) {
        this.queue.push(queueItem);
      } else {
        this.queue.splice(criticalIndex, 0, queueItem);
      }
    } else {
      this.queue.push(queueItem);
    }

    // Start processing if not already running
    if (!this.isProcessing) {
      this.process();
    }

    return queueItem.id;
  }

  // Process queue with performance optimization
  async process() {
    if (this.isProcessing) return;

    this.isProcessing = true;

    while (
      this.queue.length > 0 &&
      this.activeAnimations.size < this.maxConcurrentAnimations
    ) {
      const item = this.queue.shift();

      if (item) {
        try {
          this.activeAnimations.add(item.id);
          this.currentAnimation = item;

          // Check accessibility preferences
          if (!accessibilityManager.shouldAnimate()) {
            // Skip animation, apply instant state change
            await this.executeInstantStateChange(item);
          } else {
            // Execute animation with performance monitoring
            await this.executeAnimation(item);
          }
        } catch (error) {
          // Fallback to instant state change
          await this.executeInstantStateChange(item);
        } finally {
          this.activeAnimations.delete(item.id);
          this.currentAnimation = null;
        }
      }
    }

    this.isProcessing = false;

    // Continue processing if there are more items
    if (this.queue.length > 0) {
      // Use requestAnimationFrame for better performance
      requestAnimationFrame(() => this.process());
    }
  }

  // Execute animation with performance monitoring
  async executeAnimation(queueItem) {
    const startTime = performance.now();

    try {
      // Apply device-specific optimizations
      const optimizedOptions = this.optimizeForDevice(queueItem.options);

      // Execute the animation
      await queueItem.animation(optimizedOptions);

      // Update performance metrics
      const duration = performance.now() - startTime;
      this.updatePerformanceMetrics(duration);
    } catch (error) {
      // Handle animation error
    }
  }

  // Execute instant state change for accessibility
  async executeInstantStateChange(queueItem) {
    try {
      // Extract state change from animation options
      const { instantState } = queueItem.options;
      if (instantState && typeof instantState === 'function') {
        await instantState();
      }
    } catch (error) {
      // Instant state change failed
    }
  }

  // Optimize animation options for current device
  optimizeForDevice(options = {}) {
    const optimizedOptions = { ...options };

    // Apply device-specific timing adjustments
    if (options.duration) {
      optimizedOptions.duration = deviceOptimizer.getOptimizedTimings({
        duration: options.duration,
      }).duration;
    }

    // Apply accessibility adjustments
    if (accessibilityManager.shouldAnimate()) {
      optimizedOptions.duration = accessibilityManager.getAccessibleDuration(
        optimizedOptions.duration || 400
      );
    } else {
      optimizedOptions.duration = 0;
      optimizedOptions.useInstantTransition = true;
    }

    // Apply device-specific quality settings
    optimizedOptions.quality = this.deviceSettings.animationQuality;
    optimizedOptions.enableGPUAcceleration =
      this.deviceSettings.enableGPUAcceleration;

    return optimizedOptions;
  }

  // Update performance metrics
  updatePerformanceMetrics(duration) {
    this.performanceMetrics.totalAnimations++;

    // Calculate running average
    const total =
      this.performanceMetrics.averageDuration *
      (this.performanceMetrics.totalAnimations - 1);
    this.performanceMetrics.averageDuration =
      (total + duration) / this.performanceMetrics.totalAnimations;
  }

  // Remove specific animation from queue
  remove(animationId) {
    this.queue = this.queue.filter(item => item.id !== animationId);
  }

  // Clear all animations
  clear() {
    this.queue = [];
    this.activeAnimations.clear();
    this.currentAnimation = null;
  }

  // Wait for all animations to complete
  async waitForAll() {
    while (this.queue.length > 0 || this.activeAnimations.size > 0) {
      await new Promise(resolve => setTimeout(resolve, 16)); // Wait one frame
    }
  }

  // Get queue status
  getStatus() {
    return {
      queueLength: this.queue.length,
      isProcessing: this.isProcessing,
      activeAnimations: this.activeAnimations.size,
      currentAnimation: this.currentAnimation,
      deviceSettings: this.deviceSettings,
      performanceMetrics: this.performanceMetrics,
    };
  }

  // Get performance summary
  getPerformanceSummary() {
    const status = this.getStatus();

    return {
      ...status,
      performance: {
        averageQueueTime:
          status.performanceMetrics.averageDuration.toFixed(2) + 'ms',
        activeAnimationCount: status.activeAnimations,
        frameDropRate: status.performanceMetrics.frameDrops,
        isOptimal: status.activeAnimations <= this.maxConcurrentAnimations,
      },
    };
  }

  // Update device settings (call when device changes)
  updateDeviceSettings() {
    this.deviceSettings = deviceOptimizer.getDeviceSettings();
    this.maxConcurrentAnimations = this.deviceSettings.maxConcurrentAnimations;
  }
}

// Global animation queue instance
export const globalAnimationQueue = new AnimationQueue();

// Utility functions for common animation patterns
export const queueAnimation = (
  animation,
  priority = ANIMATION_PRIORITY.NORMAL,
  options = {}
) => {
  return globalAnimationQueue.add(animation, priority, options);
};

export const queueCardAnimation = (
  element,
  animationClass,
  duration,
  priority = ANIMATION_PRIORITY.NORMAL,
  options = {}
) => {
  return queueAnimation(
    async optimizedOptions => {
      if (!element) return;

      const finalDuration = optimizedOptions.duration || duration;

      if (finalDuration === 0) {
        // Instant state change
        element.classList.add(animationClass);
        return;
      }

      element.classList.add('card-animating');
      element.classList.add(animationClass);

      await new Promise(resolve => {
        setTimeout(() => {
          element.classList.remove(animationClass);
          element.classList.remove('card-animating');
          resolve();
        }, finalDuration);
      });
    },
    priority,
    {
      ...options,
      duration,
      instantState: () => {
        if (element) {
          element.classList.add(animationClass);
        }
      },
    }
  );
};

export const queueParallelAnimations = (
  animations,
  priority = ANIMATION_PRIORITY.NORMAL,
  options = {}
) => {
  return queueAnimation(
    async optimizedOptions => {
      await Promise.all(animations.map(anim => anim(optimizedOptions)));
    },
    priority,
    options
  );
};

export const queueSequentialAnimations = (
  animations,
  priority = ANIMATION_PRIORITY.NORMAL,
  options = {}
) => {
  return queueAnimation(
    async optimizedOptions => {
      for (const animation of animations) {
        await animation(optimizedOptions);
      }
    },
    priority,
    options
  );
};

// Export the queue class for custom implementations
export { AnimationQueue };
