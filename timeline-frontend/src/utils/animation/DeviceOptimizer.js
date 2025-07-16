// Device Optimizer for Animation Performance
// Provides device-specific optimizations and timing adjustments

import { DEVICE_TIMING_MULTIPLIERS } from './constants.js';

class DeviceOptimizer {
  constructor() {
    this.deviceInfo = this.detectDevice();
    this.performanceMetrics = this.measurePerformance();
  }

  // Detect device capabilities
  detectDevice() {
    if (typeof window === 'undefined') {
      return {
        type: 'unknown',
        isMobile: false,
        isLowEnd: false,
        cores: 1,
        memory: 4,
        userAgent: 'unknown',
      };
    }

    const userAgent = navigator.userAgent;
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        userAgent
      );
    const cores = navigator.hardwareConcurrency || 1;
    const memory = navigator.deviceMemory || 4;

    // Determine device type
    let deviceType = 'desktop';
    if (isMobile) {
      if (cores <= 2 || memory <= 2) {
        deviceType = 'low-end-mobile';
      } else if (cores <= 4 || memory <= 4) {
        deviceType = 'mobile';
      } else {
        deviceType = 'high-end-mobile';
      }
    } else if (cores >= 8 && memory >= 8) {
      deviceType = 'high-end';
    }

    return {
      type: deviceType,
      isMobile,
      isLowEnd: deviceType === 'low-end-mobile',
      cores,
      memory,
      userAgent,
    };
  }

  // Measure device performance
  measurePerformance() {
    if (typeof window === 'undefined') {
      return {
        frameRate: 60,
        memoryUsage: 0,
        isOptimal: true,
      };
    }

    // Simple performance measurement
    const startTime = performance.now();
    let frameCount = 0;

    const measureFrame = () => {
      frameCount++;
      if (performance.now() - startTime < 1000) {
        requestAnimationFrame(measureFrame);
      }
    };

    requestAnimationFrame(measureFrame);

    // Estimate memory usage (if available)
    let memoryUsage = 0;
    if (performance.memory) {
      memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024; // MB
    }

    return {
      frameRate: frameCount,
      memoryUsage,
      isOptimal: frameCount >= 55, // Consider 55+ fps as optimal
    };
  }

  // Get optimized timing for current device
  getOptimizedTimings(baseTimings) {
    const multiplier = DEVICE_TIMING_MULTIPLIERS[this.deviceInfo.type] || 1.0;

    // Apply performance-based adjustments
    let performanceMultiplier = 1.0;
    if (!this.performanceMetrics.isOptimal) {
      performanceMultiplier = 0.8; // Reduce timing by 20% for suboptimal performance
    }

    const finalMultiplier = multiplier * performanceMultiplier;

    return Object.fromEntries(
      Object.entries(baseTimings).map(([key, value]) => [
        key,
        Math.round(value * finalMultiplier),
      ])
    );
  }

  // Get device-specific animation settings
  getDeviceSettings() {
    const settings = {
      maxConcurrentAnimations: 3,
      enableGPUAcceleration: true,
      useReducedMotion: false,
      animationQuality: 'high',
    };

    // Adjust based on device type
    switch (this.deviceInfo.type) {
      case 'low-end-mobile':
        settings.maxConcurrentAnimations = 1;
        settings.animationQuality = 'low';
        settings.useReducedMotion = true;
        break;
      case 'mobile':
        settings.maxConcurrentAnimations = 2;
        settings.animationQuality = 'medium';
        break;
      case 'high-end-mobile':
        settings.maxConcurrentAnimations = 2;
        settings.animationQuality = 'high';
        break;
      case 'high-end':
        settings.maxConcurrentAnimations = 4;
        settings.animationQuality = 'ultra';
        break;
      default:
        // Desktop - use default settings
        break;
    }

    // Adjust based on performance metrics
    if (!this.performanceMetrics.isOptimal) {
      settings.maxConcurrentAnimations = Math.max(
        1,
        settings.maxConcurrentAnimations - 1
      );
      settings.animationQuality = 'low';
    }

    return settings;
  }

  // Check if device supports advanced animations
  supportsAdvancedAnimations() {
    if (typeof window === 'undefined') return false;

    // Check for CSS animation support
    const supportsAnimations = CSS.supports('animation', 'name 1s');

    // Check for transform3d support (GPU acceleration)
    const supportsTransform3d = CSS.supports('transform', 'translateZ(0)');

    // Check for will-change support
    const supportsWillChange = CSS.supports('will-change', 'transform');

    return supportsAnimations && supportsTransform3d && supportsWillChange;
  }

  // Get recommended animation strategy
  getAnimationStrategy() {
    const deviceSettings = this.getDeviceSettings();
    const supportsAdvanced = this.supportsAdvancedAnimations();

    if (!supportsAdvanced || deviceSettings.useReducedMotion) {
      return 'minimal';
    }

    switch (deviceSettings.animationQuality) {
      case 'low':
        return 'basic';
      case 'medium':
        return 'standard';
      case 'high':
        return 'enhanced';
      case 'ultra':
        return 'premium';
      default:
        return 'standard';
    }
  }

  // Get device info for debugging
  getDeviceInfo() {
    return {
      ...this.deviceInfo,
      performance: this.performanceMetrics,
      settings: this.getDeviceSettings(),
      strategy: this.getAnimationStrategy(),
      supportsAdvanced: this.supportsAdvancedAnimations(),
    };
  }

  // Update performance metrics (call periodically)
  updatePerformanceMetrics() {
    this.performanceMetrics = this.measurePerformance();
  }
}

// Create singleton instance
const deviceOptimizer = new DeviceOptimizer();

// Export singleton and class
export default deviceOptimizer;
export { DeviceOptimizer };
