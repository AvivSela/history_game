// Performance Monitor for Animation System
// Tracks animation performance and provides optimization recommendations

import { PERFORMANCE_THRESHOLDS } from './constants.js';

class AnimationPerformanceMonitor {
  constructor() {
    this.metrics = {
      animations: new Map(),
      frameRates: [],
      memoryUsage: [],
      performanceIssues: [],
      optimizationRecommendations: []
    };
    
    this.isEnabled = process.env.NODE_ENV === 'development';
    this.startTime = Date.now();
    
    // Setup monitoring
    this.setupMonitoring();
  }

  // Setup performance monitoring
  setupMonitoring() {
    if (!this.isEnabled || typeof window === 'undefined') return;

    // Monitor frame rate
    this.monitorFrameRate();
    
    // Monitor memory usage
    this.monitorMemoryUsage();
    
    // Monitor animation performance
    this.monitorAnimationPerformance();
  }

  // Monitor frame rate
  monitorFrameRate() {
    let lastFrameTime = performance.now();
    let frameCount = 0;
    let frameRateSamples = [];
    
    const measureFrame = () => {
      const currentTime = performance.now();
      const frameTime = currentTime - lastFrameTime;
      frameCount++;
      
      // Calculate frame rate
      if (frameTime > 0) {
        const frameRate = 1000 / frameTime;
        frameRateSamples.push(frameRate);
        
        // Keep only last 60 samples
        if (frameRateSamples.length > 60) {
          frameRateSamples.shift();
        }
      }
      
      // Check for performance issues - use a more lenient threshold for frame drops
      const frameDropThreshold = PERFORMANCE_THRESHOLDS.FRAME_BUDGET * 1.5; // 25ms instead of 16.67ms
      if (frameTime > frameDropThreshold) {
        this.recordPerformanceIssue('frame_drop', {
          frameTime: frameTime.toFixed(2),
          expectedTime: PERFORMANCE_THRESHOLDS.FRAME_BUDGET,
          threshold: frameDropThreshold
        });
      }
      
      lastFrameTime = currentTime;
      
      // Update metrics every second
      if (frameCount % 60 === 0) {
        const averageFrameRate = frameRateSamples.reduce((sum, rate) => sum + rate, 0) / frameRateSamples.length;
        this.metrics.frameRates.push({
          timestamp: Date.now(),
          averageFrameRate: averageFrameRate.toFixed(2),
          minFrameRate: Math.min(...frameRateSamples).toFixed(2),
          maxFrameRate: Math.max(...frameRateSamples).toFixed(2)
        });
        
        // Keep only last 100 samples
        if (this.metrics.frameRates.length > 100) {
          this.metrics.frameRates.shift();
        }
      }
      
      requestAnimationFrame(measureFrame);
    };
    
    requestAnimationFrame(measureFrame);
  }

  // Monitor memory usage
  monitorMemoryUsage() {
    if (typeof performance === 'undefined' || !performance.memory) return;

    const monitorMemory = () => {
      const memoryInfo = performance.memory;
      const memoryUsage = {
        timestamp: Date.now(),
        usedJSHeapSize: memoryInfo.usedJSHeapSize / 1024 / 1024, // MB
        totalJSHeapSize: memoryInfo.totalJSHeapSize / 1024 / 1024, // MB
        jsHeapSizeLimit: memoryInfo.jsHeapSizeLimit / 1024 / 1024 // MB
      };
      
      this.metrics.memoryUsage.push(memoryUsage);
      
      // Keep only last 100 samples
      if (this.metrics.memoryUsage.length > 100) {
        this.metrics.memoryUsage.shift();
      }
      
      // Check for memory issues
      if (memoryUsage.usedJSHeapSize > PERFORMANCE_THRESHOLDS.MEMORY_LIMIT) {
        this.recordPerformanceIssue('high_memory_usage', memoryUsage);
      }
      
      // Monitor every 5 seconds
      setTimeout(monitorMemory, 5000);
    };
    
    monitorMemory();
  }

  // Monitor animation performance
  monitorAnimationPerformance() {
    // This will be called by individual animations
  }

  // Start timing an animation
  startAnimationTimer(animationName, options = {}) {
    if (!this.isEnabled) return null;
    
    const timerId = `${animationName}_${Date.now()}_${Math.random()}`;
    const timer = {
      id: timerId,
      name: animationName,
      startTime: performance.now(),
      options,
      status: 'running'
    };
    
    this.metrics.animations.set(timerId, timer);
    return timerId;
  }

  // End timing an animation
  endAnimationTimer(timerId, additionalData = {}) {
    if (!this.isEnabled || !timerId) return;
    
    const timer = this.metrics.animations.get(timerId);
    if (!timer) return;
    
    const endTime = performance.now();
    const duration = endTime - timer.startTime;
    
    // Update timer with results
    timer.endTime = endTime;
    timer.duration = duration;
    timer.status = 'completed';
    timer.additionalData = additionalData;
    
    // Check for performance issues
    if (duration > PERFORMANCE_THRESHOLDS.ANIMATION_TIMEOUT) {
      this.recordPerformanceIssue('animation_timeout', {
        animationName: timer.name,
        duration: duration.toFixed(2),
        timeout: PERFORMANCE_THRESHOLDS.ANIMATION_TIMEOUT
      });
    }
    
    // Log performance data
    if (duration > PERFORMANCE_THRESHOLDS.FRAME_BUDGET) {
      // Animation performance warning
    }
    
    // Generate optimization recommendations
    this.generateOptimizationRecommendations(timer);
  }

  // Record performance issue
  recordPerformanceIssue(type, details) {
    const issue = {
      type,
      details,
      timestamp: Date.now(),
      sessionDuration: Date.now() - this.startTime
    };
    
    this.metrics.performanceIssues.push(issue);
    
    // Keep only last 50 issues
    if (this.metrics.performanceIssues.length > 50) {
      this.metrics.performanceIssues.shift();
    }
    
    // Throttle frame drop warnings to reduce console noise
    if (type === 'frame_drop') {
      const now = Date.now();
      if (!this.lastFrameDropWarning || now - this.lastFrameDropWarning > 5000) {
        this.lastFrameDropWarning = now;
      }
    }
  }

  // Generate optimization recommendations
  generateOptimizationRecommendations(animationData) {
    const recommendations = [];
    
    // Check animation duration
    if (animationData.duration > PERFORMANCE_THRESHOLDS.FRAME_BUDGET) {
      recommendations.push({
        type: 'reduce_duration',
        priority: 'high',
        message: `Reduce animation duration from ${animationData.duration.toFixed(2)}ms to <${PERFORMANCE_THRESHOLDS.FRAME_BUDGET}ms`,
        animationName: animationData.name
      });
    }
    
    // Check for concurrent animations
    const concurrentAnimations = Array.from(this.metrics.animations.values())
      .filter(anim => anim.status === 'running').length;
    
    if (concurrentAnimations > PERFORMANCE_THRESHOLDS.CONCURRENT_LIMIT) {
      recommendations.push({
        type: 'limit_concurrent',
        priority: 'medium',
        message: `Limit concurrent animations to ${PERFORMANCE_THRESHOLDS.CONCURRENT_LIMIT} (current: ${concurrentAnimations})`,
        animationName: animationData.name
      });
    }
    
    // Add recommendations
    recommendations.forEach(rec => {
      this.metrics.optimizationRecommendations.push({
        ...rec,
        timestamp: Date.now(),
        animationData
      });
    });
    
    // Keep only last 100 recommendations
    if (this.metrics.optimizationRecommendations.length > 100) {
      this.metrics.optimizationRecommendations.shift();
    }
  }

  // Get performance summary
  getPerformanceSummary() {
    const completedAnimations = Array.from(this.metrics.animations.values())
      .filter(anim => anim.status === 'completed');
    
    const averageDuration = completedAnimations.length > 0
      ? completedAnimations.reduce((sum, anim) => sum + anim.duration, 0) / completedAnimations.length
      : 0;
    
    const recentFrameRates = this.metrics.frameRates.slice(-10);
    const averageFrameRate = recentFrameRates.length > 0
      ? recentFrameRates.reduce((sum, rate) => sum + parseFloat(rate.averageFrameRate), 0) / recentFrameRates.length
      : 60;
    
    const recentMemoryUsage = this.metrics.memoryUsage.slice(-5);
    const averageMemoryUsage = recentMemoryUsage.length > 0
      ? recentMemoryUsage.reduce((sum, mem) => sum + mem.usedJSHeapSize, 0) / recentMemoryUsage.length
      : 0;
    
    return {
      sessionDuration: Date.now() - this.startTime,
      animations: {
        total: completedAnimations.length,
        averageDuration: averageDuration.toFixed(2) + 'ms',
        performanceIssues: this.metrics.performanceIssues.length
      },
      frameRate: {
        average: averageFrameRate.toFixed(2) + 'fps',
        isOptimal: averageFrameRate >= 55
      },
      memory: {
        averageUsage: averageMemoryUsage.toFixed(2) + 'MB',
        isOptimal: averageMemoryUsage < PERFORMANCE_THRESHOLDS.MEMORY_LIMIT
      },
      recommendations: this.metrics.optimizationRecommendations.length,
      overallPerformance: this.calculateOverallPerformance(averageDuration, averageFrameRate, averageMemoryUsage)
    };
  }

  // Calculate overall performance score
  calculateOverallPerformance(averageDuration, averageFrameRate, averageMemoryUsage) {
    let score = 100;
    
    // Deduct points for performance issues
    if (averageDuration > PERFORMANCE_THRESHOLDS.FRAME_BUDGET) {
      score -= 20;
    }
    
    if (averageFrameRate < 55) {
      score -= 30;
    }
    
    if (averageMemoryUsage > PERFORMANCE_THRESHOLDS.MEMORY_LIMIT) {
      score -= 25;
    }
    
    // Deduct points for performance issues
    score -= this.metrics.performanceIssues.length * 5;
    
    return Math.max(0, Math.round(score));
  }

  // Get optimization recommendations
  getOptimizationRecommendations() {
    const recentRecommendations = this.metrics.optimizationRecommendations
      .slice(-10)
      .filter(rec => rec.priority === 'high');
    
    return recentRecommendations.map(rec => ({
      message: rec.message,
      priority: rec.priority,
      timestamp: rec.timestamp
    }));
  }

  // Clear all metrics
  clear() {
    this.metrics = {
      animations: new Map(),
      frameRates: [],
      memoryUsage: [],
      performanceIssues: [],
      optimizationRecommendations: []
    };
    this.startTime = Date.now();
  }

  // Log performance summary
  logPerformanceSummary() {
    if (!this.isEnabled) return;
    
    const summary = this.getPerformanceSummary();
    const recommendations = this.getOptimizationRecommendations();
  }
}

// Create singleton instance
const animationPerformanceMonitor = new AnimationPerformanceMonitor();

// Export singleton and class
export default animationPerformanceMonitor;
export { AnimationPerformanceMonitor }; 