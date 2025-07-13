// Performance monitoring for animations
export class AnimationPerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.frameCount = 0;
    this.lastFrameTime = performance.now();
  }
  
  // Start monitoring an animation
  startMonitoring(animationId) {
    this.metrics.set(animationId, {
      startTime: performance.now(),
      frameCount: 0,
      frameDrops: 0,
      lastFrameTime: performance.now()
    });
  }
  
  // Record frame during animation
  recordFrame(animationId) {
    const metric = this.metrics.get(animationId);
    if (!metric) return;
    
    const currentTime = performance.now();
    const frameTime = currentTime - metric.lastFrameTime;
    
    metric.frameCount++;
    metric.lastFrameTime = currentTime;
    
    // Detect frame drops (frames taking longer than 16.67ms at 60fps)
    if (frameTime > 16.67) {
      metric.frameDrops++;
    }
  }
  
  // End monitoring and get results
  endMonitoring(animationId) {
    const metric = this.metrics.get(animationId);
    if (!metric) return null;
    
    const totalTime = performance.now() - metric.startTime;
    const fps = (metric.frameCount / totalTime) * 1000;
    const frameDropRate = (metric.frameDrops / metric.frameCount) * 100;
    
    const result = {
      animationId,
      totalTime: totalTime.toFixed(2),
      frameCount: metric.frameCount,
      fps: fps.toFixed(1),
      frameDropRate: frameDropRate.toFixed(1),
      performance: fps >= 55 ? 'excellent' : fps >= 45 ? 'good' : 'poor'
    };
    
    // Log performance issues
    if (result.performance === 'poor') {
      console.warn(`Poor animation performance: ${animationId}`, result);
    }
    
    this.metrics.delete(animationId);
    return result;
  }
  
  // Get overall performance summary
  getPerformanceSummary() {
    const results = Array.from(this.metrics.values());
    if (results.length === 0) return null;
    
    const avgFps = results.reduce((sum, r) => sum + r.fps, 0) / results.length;
    const avgFrameDropRate = results.reduce((sum, r) => sum + r.frameDropRate, 0) / results.length;
    
    return {
      averageFps: avgFps.toFixed(1),
      averageFrameDropRate: avgFrameDropRate.toFixed(1),
      totalAnimations: results.length
    };
  }
}

// Global performance monitor instance
export const performanceMonitor = new AnimationPerformanceMonitor(); 