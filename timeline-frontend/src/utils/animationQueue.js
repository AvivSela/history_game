// Animation Queue System for managing multiple animations
// Prevents conflicts and ensures smooth performance

class AnimationQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.currentAnimation = null;
    this.maxConcurrentAnimations = 3; // Limit concurrent animations for performance
    this.activeAnimations = new Set();
  }

  // Add animation to queue
  add(animation, priority = 'normal') {
    const queueItem = {
      id: Date.now() + Math.random(),
      animation,
      priority,
      timestamp: Date.now()
    };

    // Insert based on priority
    if (priority === 'high') {
      this.queue.unshift(queueItem);
    } else {
      this.queue.push(queueItem);
    }

    // Start processing if not already running
    if (!this.isProcessing) {
      this.process();
    }

    return queueItem.id;
  }

  // Process queue
  async process() {
    if (this.isProcessing) return;
    
    this.isProcessing = true;

    while (this.queue.length > 0 && this.activeAnimations.size < this.maxConcurrentAnimations) {
      const item = this.queue.shift();
      
      if (item) {
        try {
          this.activeAnimations.add(item.id);
          this.currentAnimation = item;
          
          await item.animation();
          
        } catch (error) {
          console.error('Animation failed:', error);
        } finally {
          this.activeAnimations.delete(item.id);
          this.currentAnimation = null;
        }
      }
    }

    this.isProcessing = false;

    // Continue processing if there are more items
    if (this.queue.length > 0) {
      // Use setTimeout instead of requestAnimationFrame for better test compatibility
      setTimeout(() => this.process(), 0);
    }
  }

  // Clear specific animation from queue
  remove(animationId) {
    this.queue = this.queue.filter(item => item.id !== animationId);
  }

  // Clear all animations
  clear() {
    this.queue = [];
    this.activeAnimations.clear();
    this.currentAnimation = null;
  }

  // Get queue status
  getStatus() {
    return {
      queueLength: this.queue.length,
      isProcessing: this.isProcessing,
      activeAnimations: this.activeAnimations.size,
      currentAnimation: this.currentAnimation
    };
  }

  // Wait for all animations to complete
  async waitForAll() {
    while (this.queue.length > 0 || this.activeAnimations.size > 0) {
      await new Promise(resolve => setTimeout(resolve, 16)); // Wait one frame
    }
  }
}

// Global animation queue instance
export const globalAnimationQueue = new AnimationQueue();

// Utility functions for common animation patterns
export const queueAnimation = (animation, priority = 'normal') => {
  return globalAnimationQueue.add(animation, priority);
};

export const queueCardAnimation = (element, animationClass, duration, priority = 'normal') => {
  return queueAnimation(async () => {
    if (!element) return;
    
    element.classList.add('card-animating');
    element.classList.add(animationClass);
    
    await new Promise(resolve => {
      setTimeout(() => {
        element.classList.remove(animationClass);
        element.classList.remove('card-animating');
        resolve();
      }, duration);
    });
  }, priority);
};

export const queueParallelAnimations = (animations, priority = 'normal') => {
  return queueAnimation(async () => {
    await Promise.all(animations.map(anim => anim()));
  }, priority);
};

export const queueSequentialAnimations = (animations, priority = 'normal') => {
  return queueAnimation(async () => {
    for (const animation of animations) {
      await animation();
    }
  }, priority);
};

// Performance monitoring for queue
export const getQueuePerformance = () => {
  const status = globalAnimationQueue.getStatus();
  
  return {
    ...status,
    performance: {
      averageQueueTime: status.queueLength > 0 ? 'calculating...' : '0ms',
      activeAnimationCount: status.activeAnimations,
      isOptimal: status.activeAnimations <= 3
    }
  };
};

// Export the queue class for custom implementations
export { AnimationQueue }; 