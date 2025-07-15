/**
 * Performance monitoring utilities for the Timeline Game
 * Tracks component render times, bundle performance, and user interactions
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      componentRenders: new Map(),
      userInteractions: new Map(),
      bundleMetrics: {},
      gamePerformance: {}
    };
    
    this.isEnabled = process.env.NODE_ENV === 'development';
  }

  /**
   * Start timing a component render
   * @param {string} componentName - Name of the component
   * @param {string} operation - Operation being timed (e.g., 'render', 'update')
   */
  startTimer(componentName, operation = 'render') {
    if (!this.isEnabled) return;
    
    const key = `${componentName}:${operation}`;
    this.metrics.componentRenders.set(key, {
      startTime: performance.now(),
      componentName,
      operation
    });
  }

  /**
   * End timing a component render and log the duration
   * @param {string} componentName - Name of the component
   * @param {string} operation - Operation being timed
   * @param {Object} additionalData - Additional data to log
   */
  endTimer(componentName, operation = 'render', additionalData = {}) {
    if (!this.isEnabled) return;
    
    const key = `${componentName}:${operation}`;
    const timer = this.metrics.componentRenders.get(key);
    
    if (timer) {
      const duration = performance.now() - timer.startTime;
      
      // Store for analysis
      if (!this.metrics.gamePerformance[componentName]) {
        this.metrics.gamePerformance[componentName] = [];
      }
      this.metrics.gamePerformance[componentName].push({
        operation,
        duration,
        timestamp: Date.now(),
        ...additionalData
      });
    }
  }

  /**
   * Track user interaction performance
   * @param {string} interaction - Type of interaction
   * @param {Function} callback - Function to measure
   * @param {Object} context - Additional context
   */
  trackInteraction(interaction, callback, context = {}) {
    if (!this.isEnabled) {
      return callback();
    }

    const startTime = performance.now();
    const result = callback();
    const duration = performance.now() - startTime;


    
    if (!this.metrics.userInteractions.has(interaction)) {
      this.metrics.userInteractions.set(interaction, []);
    }
    this.metrics.userInteractions.get(interaction).push({
      duration,
      timestamp: Date.now(),
      context
    });

    return result;
  }

  /**
   * Track bundle performance metrics
   */
  trackBundlePerformance() {
    if (!this.isEnabled) return;

    // Track initial load time
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    this.metrics.bundleMetrics.initialLoadTime = loadTime;
    
    // Track DOM content loaded
    const domContentLoaded = performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart;
    this.metrics.bundleMetrics.domContentLoaded = domContentLoaded;
  }

  /**
   * Track game-specific performance metrics
   * @param {string} metric - Metric name
   * @param {any} value - Metric value
   */
  trackGameMetric(metric, value) {
    if (!this.isEnabled) return;
    
    this.metrics.gamePerformance[metric] = value;
  }

  /**
   * Get performance summary
   * @returns {Object} Performance summary
   */
  getSummary() {
    const summary = {
      componentAverages: {},
      interactionAverages: {},
      bundleMetrics: this.metrics.bundleMetrics,
      gamePerformance: this.metrics.gamePerformance
    };

    // Calculate component render averages
    for (const [componentName, renders] of Object.entries(this.metrics.gamePerformance)) {
      if (Array.isArray(renders)) {
        const avgDuration = renders.reduce((sum, render) => sum + render.duration, 0) / renders.length;
        summary.componentAverages[componentName] = avgDuration.toFixed(2);
      }
    }

    // Calculate interaction averages
    for (const [interaction, times] of this.metrics.userInteractions) {
      const avgDuration = times.reduce((sum, time) => sum + time.duration, 0) / times.length;
      summary.interactionAverages[interaction] = avgDuration.toFixed(2);
    }

    return summary;
  }

  /**
   * Log performance summary
   */
  logSummary() {
    if (!this.isEnabled) return;
    
    const summary = this.getSummary();
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics = {
      componentRenders: new Map(),
      userInteractions: new Map(),
      bundleMetrics: {},
      gamePerformance: {}
    };
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Auto-track bundle performance on load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    performanceMonitor.trackBundlePerformance();
  });
}

export default performanceMonitor;

// React performance HOC
export const withPerformanceTracking = (WrappedComponent, componentName) => {
  return function PerformanceTrackedComponent(props) {
    performanceMonitor.startTimer(componentName);
    
    const result = <WrappedComponent {...props} />;
    
    performanceMonitor.endTimer(componentName, 'render', {
      propsCount: Object.keys(props).length,
      hasChildren: !!props.children
    });
    
    return result;
  };
}; 