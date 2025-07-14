# Timeline Game Animation Implementation Plan

## Overview

This document provides a detailed, step-by-step implementation plan for improving the Timeline Game's animation system based on the recommendations in `future_animation.md`. Each phase includes specific code changes, testing strategies, and success criteria.

## Phase 1: Core Duration Optimizations (Week 1)

### 1.1 Update Animation Constants

**File**: `src/utils/animationUtils.js`
**Timeline**: Day 1-2

```javascript
// Replace existing timing constants
const ANIMATION_DELAYS = {
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

// Update easing constants
const EASING = {
  SHAKE: 'cubic-bezier(0.36, 0, 0.66, 1)',
  FADE_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
  BOUNCE_IN: 'cubic-bezier(0.4, 0, 0.2, 1)',         // Changed to ease-out
  HIGHLIGHT: 'cubic-bezier(0.4, 0, 0.2, 1)',
  WRONG_PLACEMENT: 'cubic-bezier(0.36, 0, 0.66, 1)', // Changed to shake easing
  TIMELINE_SHAKE: 'cubic-bezier(0.36, 0, 0.66, 1)',
  INSERTION_POINT_ERROR: 'cubic-bezier(0.4, 0, 0.2, 1)' // Changed to ease-out
};
```

**Testing**: Update existing animation tests to use new durations

### 1.2 Optimize CSS Animations

**File**: `src/index.css`
**Timeline**: Day 2-3

```css
/* Replace wrong placement animation */
.card-wrong-placement {
  animation: wrongPlacementShake 600ms cubic-bezier(0.36, 0, 0.66, 1);
  animation-fill-mode: both;
}

@keyframes wrongPlacementShake {
  0%, 100% { 
    transform: translateX(0) scale(1); 
    opacity: 1; 
    filter: brightness(1);
  }
  10%, 30%, 50% { 
    transform: translateX(-8px) scale(0.95); 
    opacity: 0.8; 
    filter: brightness(1.1) hue-rotate(0deg);
  }
  20%, 40% { 
    transform: translateX(8px) scale(0.95); 
    opacity: 0.8; 
    filter: brightness(1.1) hue-rotate(0deg);
  }
  60% { 
    transform: translateX(0) scale(0.9); 
    opacity: 0.6; 
    filter: brightness(0.9);
  }
  80% { 
    transform: translateX(0) scale(0.8); 
    opacity: 0.3; 
    filter: brightness(0.8);
  }
  100% { 
    transform: translateX(0) scale(0.7); 
    opacity: 0; 
    filter: brightness(0.7);
  }
}

/* Optimize highlight animation */
.card-highlight {
  animation: quickHighlight 400ms cubic-bezier(0.4, 0, 0.2, 1);
  animation-fill-mode: both;
}

@keyframes quickHighlight {
  0% { 
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.6);
    transform: scale(1) translateZ(0);
  }
  50% { 
    box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.3);
    transform: scale(1.02) translateZ(0);
  }
  100% { 
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
    transform: scale(1) translateZ(0);
  }
}

/* Optimize timeline shake */
.timeline-wrong-placement {
  animation: timelineShake 600ms cubic-bezier(0.36, 0, 0.66, 1);
  animation-fill-mode: both;
}

@keyframes timelineShake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50% { transform: translateX(-6px); }
  20%, 40% { transform: translateX(6px); }
  60% { transform: translateX(-3px); }
  70% { transform: translateX(3px); }
  80% { transform: translateX(-1px); }
  90% { transform: translateX(1px); }
}
```

**Testing**: Visual testing of all animation durations

### 1.3 Update Game Component Animation Sequence

**File**: `src/pages/Game.jsx`
**Timeline**: Day 3-4

```javascript
// Update the wrong placement handling
const handleWrongPlacement = async (position) => {
  // Trigger all animations simultaneously with optimized timing
  if (timelineRef.current) {
    timelineRef.current.animateWrongPlacement(position);
  }
  
  if (playerHandRef.current && selectedCard) {
    playerHandRef.current.animateCardRemoval(selectedCard.id);
  }
  
  // Reduced delay for new card animation
  setTimeout(() => {
    if (playerHandRef.current && poolResult?.newCard) {
      playerHandRef.current.animateNewCard(poolResult.newCard.id);
    }
  }, 600); // Reduced from 800ms
};
```

**Testing**: Update `gameWrongPlacement.test.jsx` to verify new timing

## Phase 2: Performance Enhancements (Week 2)

### 2.1 Implement Animation Queue System

**File**: `src/utils/animationQueue.js` (new file)
**Timeline**: Day 1-3

```javascript
class AnimationQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.maxConcurrent = 3;
    this.activeAnimations = 0;
  }
  
  add(animation, priority = 'normal') {
    const queueItem = {
      id: Date.now() + Math.random(),
      animation,
      priority,
      timestamp: Date.now()
    };
    
    this.queue.push(queueItem);
    this.queue.sort((a, b) => {
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (b.priority === 'high' && a.priority !== 'high') return 1;
      return a.timestamp - b.timestamp;
    });
    
    if (!this.isProcessing) {
      this.process();
    }
  }
  
  async process() {
    this.isProcessing = true;
    
    while (this.queue.length > 0 && this.activeAnimations < this.maxConcurrent) {
      const item = this.queue.shift();
      this.activeAnimations++;
      
      try {
        await item.animation();
      } catch (error) {
        console.error('Animation failed:', error);
      } finally {
        this.activeAnimations--;
      }
    }
    
    if (this.queue.length > 0) {
      setTimeout(() => this.process(), 16); // 60fps
    } else {
      this.isProcessing = false;
    }
  }
  
  clear() {
    this.queue = [];
    this.isProcessing = false;
  }
  
  getQueueLength() {
    return this.queue.length;
  }
}

export const animationQueue = new AnimationQueue();
```

**Testing**: Create `animationQueue.test.js` with comprehensive queue testing

### 2.2 Enhance GPU Acceleration

**File**: `src/index.css`
**Timeline**: Day 3-4

```css
/* Enhanced GPU acceleration for all animated elements */
.card-animating,
.timeline-animating,
.player-hand-animating {
  will-change: transform, opacity;
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
  transform-style: preserve-3d;
}

/* Optimize specific animation containers */
.timeline-container {
  will-change: transform;
  transform: translateZ(0);
}

.player-hand-container {
  will-change: transform;
  transform: translateZ(0);
}

/* Ensure smooth animations on mobile */
@media (max-width: 768px) {
  .card-animating,
  .timeline-animating,
  .player-hand-animating {
    transform: translate3d(0, 0, 0);
  }
}
```

**Testing**: Performance testing on various devices

### 2.3 Update Animation Utilities

**File**: `src/utils/animationUtils.js`
**Timeline**: Day 4-5

```javascript
import { animationQueue } from './animationQueue.js';

// Enhanced animation functions with queue support
export const animateWrongPlacement = async (cardElement, position) => {
  if (prefersReducedMotion()) {
    return;
  }
  
  return new Promise((resolve) => {
    animationQueue.add(async () => {
      try {
        // Add animation class
        cardElement.classList.add('card-wrong-placement');
        
        // Wait for animation to complete
        await new Promise(resolve => {
          setTimeout(resolve, 600);
        });
        
        // Clean up
        cardElement.classList.remove('card-wrong-placement');
        resolve();
      } catch (error) {
        console.error('Wrong placement animation failed:', error);
        resolve();
      }
    }, 'high');
  });
};

// Enhanced performance monitoring
export const measureAnimationPerformance = (animationName, startTime) => {
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  if (duration > 16.67) {
    console.warn(`Animation ${animationName} took ${duration.toFixed(2)}ms (target: <16.67ms)`);
  }
  
  return duration;
};
```

**Testing**: Update existing animation utility tests

## Phase 3: Accessibility Improvements (Week 3)

### 3.1 Enhanced Reduced Motion Support

**File**: `src/utils/accessibility.js` (new file)
**Timeline**: Day 1-3

```javascript
export const getAnimationPreferences = () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const prefersReducedData = window.matchMedia('(prefers-reduced-data: reduce)').matches;
  const isLowPowerMode = navigator.hardwareConcurrency <= 2;
  
  return {
    shouldAnimate: !prefersReducedMotion && !prefersReducedData && !isLowPowerMode,
    durationMultiplier: prefersReducedMotion ? 0.5 : 1,
    shouldUseSubtleAnimations: prefersReducedMotion,
    shouldSkipComplexAnimations: prefersReducedData || isLowPowerMode
  };
};

export const getAnimationIntensity = (context) => {
  const preferences = getAnimationPreferences();
  const baseIntensity = 1;
  
  const multipliers = {
    'error': preferences.shouldUseSubtleAnimations ? 0.8 : 1.2,
    'success': 0.8,
    'neutral': 1.0,
    'gameplay': preferences.shouldUseSubtleAnimations ? 0.9 : 1.1
  };
  
  return baseIntensity * (multipliers[context] || 1.0);
};

export const createAccessibleAnimation = (element, animationType, context = 'neutral') => {
  const preferences = getAnimationPreferences();
  const intensity = getAnimationIntensity(context);
  
  if (!preferences.shouldAnimate) {
    // Apply instant state change
    element.classList.add(`${animationType}-instant`);
    return Promise.resolve();
  }
  
  if (preferences.shouldSkipComplexAnimations && animationType === 'complex') {
    // Use simplified animation
    element.classList.add(`${animationType}-simple`);
    return new Promise(resolve => setTimeout(resolve, 200));
  }
  
  // Apply full animation with intensity adjustment
  element.classList.add(`${animationType}-full`);
  element.style.setProperty('--animation-intensity', intensity);
  
  return new Promise(resolve => {
    const duration = getAnimationDuration(animationType) * preferences.durationMultiplier;
    setTimeout(resolve, duration);
  });
};
```

**Testing**: Create accessibility tests for reduced motion scenarios

### 3.2 Animation Skip Functionality

**File**: `src/components/ui/AnimationControls.jsx` (new file)
**Timeline**: Day 3-5

```javascript
import React, { useState, useEffect } from 'react';
import { getAnimationPreferences } from '../../utils/accessibility';

export const AnimationControls = () => {
  const [preferences, setPreferences] = useState(getAnimationPreferences());
  const [showControls, setShowControls] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => setPreferences(getAnimationPreferences());
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  const skipAllAnimations = () => {
    // Remove all animation classes
    document.querySelectorAll('[class*="-animating"]').forEach(element => {
      element.classList.remove(...Array.from(element.classList).filter(cls => cls.includes('-animating')));
    });
    
    // Apply instant state changes
    document.body.classList.add('animations-disabled');
  };
  
  const enableAnimations = () => {
    document.body.classList.remove('animations-disabled');
  };
  
  if (!showControls) {
    return (
      <button
        className="animation-controls-toggle"
        onClick={() => setShowControls(true)}
        aria-label="Animation controls"
      >
        ⚙️
      </button>
    );
  }
  
  return (
    <div className="animation-controls">
      <button onClick={() => setShowControls(false)}>✕</button>
      <h3>Animation Settings</h3>
      
      <div className="animation-option">
        <label>
          <input
            type="checkbox"
            checked={preferences.shouldAnimate}
            onChange={(e) => {
              if (e.target.checked) {
                enableAnimations();
              } else {
                skipAllAnimations();
              }
            }}
          />
          Enable Animations
        </label>
      </div>
      
      <div className="animation-option">
        <label>
          <input
            type="checkbox"
            checked={preferences.shouldUseSubtleAnimations}
            onChange={() => {
              // Toggle subtle animations
            }}
          />
          Use Subtle Animations
        </label>
      </div>
      
      <div className="animation-info">
        <p>Current system preference: {preferences.shouldAnimate ? 'Animations enabled' : 'Reduced motion'}</p>
      </div>
    </div>
  );
};
```

**Testing**: Create component tests for animation controls

## Phase 4: Progressive Animation Loading (Week 4)

### 4.1 Dynamic Animation Loading

**File**: `src/utils/progressiveAnimations.js` (new file)
**Timeline**: Day 1-3

```javascript
class ProgressiveAnimationLoader {
  constructor() {
    this.loadedAnimations = new Set();
    this.animationCSS = new Map();
    this.loadingPromises = new Map();
  }
  
  async loadAnimationIfNeeded(animationType) {
    if (this.loadedAnimations.has(animationType)) {
      return;
    }
    
    if (this.loadingPromises.has(animationType)) {
      return this.loadingPromises.get(animationType);
    }
    
    const loadPromise = this.loadAnimationCSS(animationType);
    this.loadingPromises.set(animationType, loadPromise);
    
    try {
      await loadPromise;
      this.loadedAnimations.add(animationType);
    } finally {
      this.loadingPromises.delete(animationType);
    }
  }
  
  async loadAnimationCSS(animationType) {
    const cssMap = {
      'wrong-placement': `
        .card-wrong-placement {
          animation: wrongPlacementShake 600ms cubic-bezier(0.36, 0, 0.66, 1);
          animation-fill-mode: both;
        }
        @keyframes wrongPlacementShake {
          /* Animation keyframes */
        }
      `,
      'highlight': `
        .card-highlight {
          animation: quickHighlight 400ms cubic-bezier(0.4, 0, 0.2, 1);
          animation-fill-mode: both;
        }
        @keyframes quickHighlight {
          /* Animation keyframes */
        }
      `,
      // Add more animations as needed
    };
    
    const css = cssMap[animationType];
    if (!css) {
      throw new Error(`Unknown animation type: ${animationType}`);
    }
    
    return this.injectCSS(css, animationType);
  }
  
  injectCSS(css, id) {
    return new Promise((resolve, reject) => {
      const style = document.createElement('style');
      style.id = `animation-${id}`;
      style.textContent = css;
      
      style.onload = () => resolve();
      style.onerror = () => reject(new Error(`Failed to load animation: ${id}`));
      
      document.head.appendChild(style);
    });
  }
  
  preloadCriticalAnimations() {
    const criticalAnimations = ['wrong-placement', 'highlight', 'shake'];
    return Promise.all(
      criticalAnimations.map(animation => this.loadAnimationIfNeeded(animation))
    );
  }
}

export const progressiveLoader = new ProgressiveAnimationLoader();
```

**Testing**: Create tests for progressive loading functionality

### 4.2 Context-Aware Animation Intensity

**File**: `src/utils/contextAwareAnimations.js` (new file)
**Timeline**: Day 3-5

```javascript
import { getAnimationPreferences } from './accessibility.js';

class ContextAwareAnimationManager {
  constructor() {
    this.contextHistory = new Map();
    this.intensityMultipliers = {
      'error': 1.2,
      'success': 0.8,
      'neutral': 1.0,
      'gameplay': 1.1,
      'subtle': 0.6,
      'dramatic': 1.4
    };
  }
  
  getContextIntensity(context, element = null) {
    const preferences = getAnimationPreferences();
    const baseIntensity = this.intensityMultipliers[context] || 1.0;
    
    // Adjust based on user preferences
    let adjustedIntensity = baseIntensity;
    if (preferences.shouldUseSubtleAnimations) {
      adjustedIntensity *= 0.7;
    }
    
    // Adjust based on element size (larger elements get more subtle animations)
    if (element) {
      const rect = element.getBoundingClientRect();
      const area = rect.width * rect.height;
      if (area > 10000) { // Large element
        adjustedIntensity *= 0.8;
      } else if (area < 1000) { // Small element
        adjustedIntensity *= 1.2;
      }
    }
    
    // Adjust based on context history (avoid repetitive intense animations)
    const contextCount = this.contextHistory.get(context) || 0;
    if (contextCount > 3) {
      adjustedIntensity *= 0.9;
    }
    
    // Update context history
    this.contextHistory.set(context, contextCount + 1);
    
    return Math.max(0.3, Math.min(2.0, adjustedIntensity));
  }
  
  applyContextAwareAnimation(element, animationType, context = 'neutral') {
    const intensity = this.getContextIntensity(context, element);
    
    element.style.setProperty('--animation-intensity', intensity);
    element.classList.add(`${animationType}-context-aware`);
    
    // Clean up context history periodically
    if (this.contextHistory.size > 20) {
      this.contextHistory.clear();
    }
  }
  
  resetContextHistory() {
    this.contextHistory.clear();
  }
}

export const contextAwareManager = new ContextAwareAnimationManager();
```

**Testing**: Create tests for context-aware animation behavior

## Phase 5: Testing and Validation (Week 5)

### 5.1 Unit Testing Animations - Core Testing Strategy

**File**: `src/tests/unit/animationUnitTests.test.js` (new file)
**Timeline**: Day 1-2

```javascript
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { animateWrongPlacement, animateCardRemoval, animateNewCard } from '../../utils/animationUtils';
import { getAnimationPreferences } from '../../utils/accessibility';

describe('Animation Unit Tests', () => {
  let testElement;
  
  beforeEach(() => {
    testElement = document.createElement('div');
    testElement.className = 'test-card';
    document.body.appendChild(testElement);
  });
  
  afterEach(() => {
    document.body.removeChild(testElement);
    vi.clearAllTimers();
  });
  
  describe('Animation State Management', () => {
    it('should add animation class when animation starts', async () => {
      const animationPromise = animateWrongPlacement(testElement, 0);
      
      expect(testElement.classList.contains('card-wrong-placement')).toBe(true);
      
      await animationPromise;
    });
    
    it('should remove animation class when animation completes', async () => {
      await animateWrongPlacement(testElement, 0);
      
      expect(testElement.classList.contains('card-wrong-placement')).toBe(false);
    });
    
    it('should handle multiple animation classes correctly', async () => {
      testElement.classList.add('existing-class');
      
      await animateWrongPlacement(testElement, 0);
      
      expect(testElement.classList.contains('existing-class')).toBe(true);
      expect(testElement.classList.contains('card-wrong-placement')).toBe(false);
    });
  });
  
  describe('Animation Timing', () => {
    it('should complete animation within expected duration', async () => {
      const startTime = performance.now();
      
      await animateWrongPlacement(testElement, 0);
      
      const duration = performance.now() - startTime;
      expect(duration).toBeGreaterThanOrEqual(580); // Allow 20ms buffer
      expect(duration).toBeLessThan(650); // Max 50ms over expected
    });
    
    it('should respect reduced motion preferences', async () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query.includes('prefers-reduced-motion'),
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });
      
      const startTime = performance.now();
      await animateWrongPlacement(testElement, 0);
      const duration = performance.now() - startTime;
      
      // Should be much faster with reduced motion
      expect(duration).toBeLessThan(100);
    });
  });
  
  describe('Animation Interruptions', () => {
    it('should handle animation interruption gracefully', async () => {
      const firstAnimation = animateWrongPlacement(testElement, 0);
      
      // Interrupt with second animation
      setTimeout(() => {
        animateCardRemoval(testElement);
      }, 100);
      
      await firstAnimation;
      
      // Should not have both animation classes
      expect(testElement.classList.contains('card-wrong-placement')).toBe(false);
    });
    
    it('should clean up interrupted animations', async () => {
      const animationPromise = animateWrongPlacement(testElement, 0);
      
      // Force interruption
      testElement.classList.remove('card-wrong-placement');
      
      await animationPromise;
      
      // Should not have leftover animation classes
      expect(testElement.classList.contains('card-wrong-placement')).toBe(false);
    });
  });
  
  describe('Animation Error Handling', () => {
    it('should handle missing element gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      await animateWrongPlacement(null, 0);
      
      expect(consoleSpy).toHaveBeenCalledWith('Animation failed: Element is null');
      consoleSpy.mockRestore();
    });
    
    it('should handle animation failures without crashing', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock a failing animation
      vi.spyOn(testElement, 'classList').mockImplementation(() => {
        throw new Error('DOM manipulation failed');
      });
      
      await animateWrongPlacement(testElement, 0);
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
  
  describe('Animation Performance', () => {
    it('should not cause memory leaks', async () => {
      const initialMemory = performance.memory?.usedJSHeapSize || 0;
      
      // Trigger multiple animations
      for (let i = 0; i < 50; i++) {
        await animateWrongPlacement(testElement, i);
      }
      
      const finalMemory = performance.memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be minimal
      expect(memoryIncrease).toBeLessThan(1024 * 1024); // <1MB
    });
    
    it('should maintain consistent performance across multiple calls', async () => {
      const durations = [];
      
      for (let i = 0; i < 10; i++) {
        const startTime = performance.now();
        await animateWrongPlacement(testElement, i);
        durations.push(performance.now() - startTime);
      }
      
      const averageDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      const maxDeviation = Math.max(...durations) - Math.min(...durations);
      
      // Performance should be consistent
      expect(maxDeviation).toBeLessThan(100); // Max 100ms variation
    });
  });
});
```

### 5.2 CSS Animation Testing

**File**: `src/tests/unit/cssAnimationTests.test.js` (new file)
**Timeline**: Day 2-3

```javascript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('CSS Animation Tests', () => {
  let testContainer;
  
  beforeEach(() => {
    testContainer = document.createElement('div');
    testContainer.innerHTML = `
      <div class="test-card card-wrong-placement"></div>
      <div class="test-timeline timeline-wrong-placement"></div>
      <div class="test-highlight card-highlight"></div>
    `;
    document.body.appendChild(testContainer);
  });
  
  afterEach(() => {
    document.body.removeChild(testContainer);
  });
  
  describe('Animation Properties', () => {
    it('should have correct animation duration', () => {
      const card = testContainer.querySelector('.card-wrong-placement');
      const computedStyle = window.getComputedStyle(card);
      
      expect(computedStyle.animationDuration).toBe('600ms');
    });
    
    it('should have correct easing function', () => {
      const card = testContainer.querySelector('.card-wrong-placement');
      const computedStyle = window.getComputedStyle(card);
      
      expect(computedStyle.animationTimingFunction).toBe('cubic-bezier(0.36, 0, 0.66, 1)');
    });
    
    it('should have correct animation fill mode', () => {
      const card = testContainer.querySelector('.card-wrong-placement');
      const computedStyle = window.getComputedStyle(card);
      
      expect(computedStyle.animationFillMode).toBe('both');
    });
  });
  
  describe('GPU Acceleration', () => {
    it('should use GPU acceleration for transforms', () => {
      const card = testContainer.querySelector('.card-wrong-placement');
      const computedStyle = window.getComputedStyle(card);
      
      expect(computedStyle.transform).toContain('translateZ(0)');
      expect(computedStyle.willChange).toContain('transform');
    });
    
    it('should have proper 3D transforms', () => {
      const card = testContainer.querySelector('.card-wrong-placement');
      const computedStyle = window.getComputedStyle(card);
      
      expect(computedStyle.backfaceVisibility).toBe('hidden');
      expect(computedStyle.perspective).toBe('1000px');
    });
  });
  
  describe('Animation Keyframes', () => {
    it('should have defined keyframes for wrong placement', () => {
      const styleSheets = Array.from(document.styleSheets);
      const keyframes = styleSheets.flatMap(sheet => {
        try {
          return Array.from(sheet.cssRules).filter(rule => rule.type === CSSRule.KEYFRAMES_RULE);
        } catch (e) {
          return [];
        }
      });
      
      const wrongPlacementKeyframes = keyframes.find(kf => kf.name === 'wrongPlacementShake');
      expect(wrongPlacementKeyframes).toBeDefined();
    });
    
    it('should have correct keyframe percentages', () => {
      const styleSheets = Array.from(document.styleSheets);
      const keyframes = styleSheets.flatMap(sheet => {
        try {
          return Array.from(sheet.cssRules).filter(rule => rule.type === CSSRule.KEYFRAMES_RULE);
        } catch (e) {
          return [];
        }
      });
      
      const wrongPlacementKeyframes = keyframes.find(kf => kf.name === 'wrongPlacementShake');
      const keyframeRules = Array.from(wrongPlacementKeyframes.cssRules);
      
      const percentages = keyframeRules.map(rule => rule.keyText);
      expect(percentages).toContain('0%');
      expect(percentages).toContain('100%');
    });
  });
  
  describe('Animation Responsiveness', () => {
    it('should adapt to mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 375
      });
      
      const card = testContainer.querySelector('.card-wrong-placement');
      const computedStyle = window.getComputedStyle(card);
      
      // Should use mobile-specific transforms
      expect(computedStyle.transform).toContain('translate3d');
    });
  });
});
```

### 5.3 Animation Queue Testing

**File**: `src/tests/unit/animationQueueTests.test.js` (new file)
**Timeline**: Day 3-4

```javascript
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { AnimationQueue } from '../../utils/animationQueue';

describe('Animation Queue Tests', () => {
  let queue;
  
  beforeEach(() => {
    queue = new AnimationQueue();
  });
  
  afterEach(() => {
    queue.clear();
  });
  
  describe('Queue Management', () => {
    it('should add animations to queue', () => {
      const animation = vi.fn().mockResolvedValue();
      
      queue.add(animation);
      
      expect(queue.getQueueLength()).toBe(1);
    });
    
    it('should process animations in priority order', async () => {
      const results = [];
      
      queue.add(() => {
        results.push('normal');
        return Promise.resolve();
      }, 'normal');
      
      queue.add(() => {
        results.push('high');
        return Promise.resolve();
      }, 'high');
      
      queue.add(() => {
        results.push('normal2');
        return Promise.resolve();
      }, 'normal');
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(results).toEqual(['high', 'normal', 'normal2']);
    });
    
    it('should respect timestamp order for same priority', async () => {
      const results = [];
      
      queue.add(() => {
        results.push('first');
        return Promise.resolve();
      }, 'normal');
      
      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 1));
      
      queue.add(() => {
        results.push('second');
        return Promise.resolve();
      }, 'normal');
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(results).toEqual(['first', 'second']);
    });
  });
  
  describe('Concurrent Processing', () => {
    it('should limit concurrent animations', async () => {
      const activeAnimations = [];
      
      // Add more animations than max concurrent
      for (let i = 0; i < 5; i++) {
        queue.add(async () => {
          activeAnimations.push(i);
          await new Promise(resolve => setTimeout(resolve, 50));
          activeAnimations.splice(activeAnimations.indexOf(i), 1);
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Should not exceed max concurrent
      expect(activeAnimations.length).toBeLessThanOrEqual(3);
    });
    
    it('should process remaining animations after completion', async () => {
      const completed = [];
      
      for (let i = 0; i < 6; i++) {
        queue.add(async () => {
          await new Promise(resolve => setTimeout(resolve, 20));
          completed.push(i);
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      expect(completed.length).toBe(6);
    });
  });
  
  describe('Error Handling', () => {
    it('should handle animation failures gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      queue.add(() => {
        throw new Error('Animation failed');
      });
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(consoleSpy).toHaveBeenCalledWith('Animation failed:', expect.any(Error));
      consoleSpy.mockRestore();
    });
    
    it('should continue processing after failed animation', async () => {
      const results = [];
      
      queue.add(() => {
        throw new Error('Failed');
      });
      
      queue.add(() => {
        results.push('success');
        return Promise.resolve();
      });
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(results).toContain('success');
    });
  });
  
  describe('Queue Cleanup', () => {
    it('should clear queue completely', () => {
      queue.add(() => Promise.resolve());
      queue.add(() => Promise.resolve());
      
      expect(queue.getQueueLength()).toBe(2);
      
      queue.clear();
      
      expect(queue.getQueueLength()).toBe(0);
    });
    
    it('should stop processing after clear', async () => {
      const results = [];
      
      queue.add(() => {
        results.push('should not run');
        return Promise.resolve();
      });
      
      queue.clear();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(results).toHaveLength(0);
    });
  });
});
```

### 5.4 Accessibility Testing

**File**: `src/tests/unit/accessibilityTests.test.js` (new file)
**Timeline**: Day 4-5

```javascript
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { getAnimationPreferences, createAccessibleAnimation } from '../../utils/accessibility';

describe('Animation Accessibility Tests', () => {
  let testElement;
  
  beforeEach(() => {
    testElement = document.createElement('div');
    document.body.appendChild(testElement);
  });
  
  afterEach(() => {
    document.body.removeChild(testElement);
    vi.clearAllTimers();
  });
  
  describe('Reduced Motion Detection', () => {
    it('should detect reduced motion preference', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query.includes('prefers-reduced-motion'),
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });
      
      const preferences = getAnimationPreferences();
      expect(preferences.shouldAnimate).toBe(false);
      expect(preferences.durationMultiplier).toBe(0.5);
    });
    
    it('should detect reduced data preference', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query.includes('prefers-reduced-data'),
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });
      
      const preferences = getAnimationPreferences();
      expect(preferences.shouldAnimate).toBe(false);
      expect(preferences.shouldSkipComplexAnimations).toBe(true);
    });
    
    it('should detect low power mode', () => {
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        writable: true,
        value: 1
      });
      
      const preferences = getAnimationPreferences();
      expect(preferences.shouldAnimate).toBe(false);
    });
  });
  
  describe('Accessible Animation Creation', () => {
    it('should create instant animation for reduced motion', async () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query.includes('prefers-reduced-motion'),
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });
      
      const startTime = performance.now();
      await createAccessibleAnimation(testElement, 'test', 'neutral');
      const duration = performance.now() - startTime;
      
      expect(duration).toBeLessThan(10); // Should be nearly instant
      expect(testElement.classList.contains('test-instant')).toBe(true);
    });
    
    it('should create simplified animation for complex cases', async () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query.includes('prefers-reduced-data'),
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });
      
      await createAccessibleAnimation(testElement, 'complex', 'neutral');
      
      expect(testElement.classList.contains('complex-simple')).toBe(true);
    });
    
    it('should apply intensity adjustment', async () => {
      await createAccessibleAnimation(testElement, 'test', 'error');
      
      const intensity = testElement.style.getPropertyValue('--animation-intensity');
      expect(parseFloat(intensity)).toBeGreaterThan(1.0); // Error context should be more intense
    });
  });
  
  describe('Animation Skip Functionality', () => {
    it('should skip all animations when requested', () => {
      testElement.classList.add('test-animating');
      testElement.classList.add('another-animating');
      
      // Mock skip function
      const skipAllAnimations = () => {
        document.querySelectorAll('[class*="-animating"]').forEach(element => {
          element.classList.remove(...Array.from(element.classList).filter(cls => cls.includes('-animating')));
          element.classList.add('animation-skipped');
        });
      };
      
      skipAllAnimations();
      
      expect(testElement.classList.contains('test-animating')).toBe(false);
      expect(testElement.classList.contains('another-animating')).toBe(false);
      expect(testElement.classList.contains('animation-skipped')).toBe(true);
    });
  });
});
```

### 5.5 Comprehensive Animation Testing Suite

**File**: `src/tests/animationSuite.test.js` (new file)
**Timeline**: Day 5

```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { animationQueue } from '../utils/animationQueue';
import { progressiveLoader } from '../utils/progressiveAnimations';
import { contextAwareManager } from '../utils/contextAwareAnimations';
import { getAnimationPreferences } from '../utils/accessibility';

describe('Animation System Integration Tests', () => {
  beforeEach(() => {
    // Reset animation systems
    animationQueue.clear();
    contextAwareManager.resetContextHistory();
  });
  
  describe('Animation Queue', () => {
    it('should process animations in priority order', async () => {
      const results = [];
      
      animationQueue.add(() => {
        results.push('normal');
        return Promise.resolve();
      }, 'normal');
      
      animationQueue.add(() => {
        results.push('high');
        return Promise.resolve();
      }, 'high');
      
      animationQueue.add(() => {
        results.push('normal2');
        return Promise.resolve();
      }, 'normal');
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(results).toEqual(['high', 'normal', 'normal2']);
    });
    
    it('should handle animation failures gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      animationQueue.add(() => {
        throw new Error('Animation failed');
      });
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(consoleSpy).toHaveBeenCalledWith('Animation failed:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });
  
  describe('Progressive Loading', () => {
    it('should load animations only when needed', async () => {
      const loadSpy = vi.spyOn(progressiveLoader, 'loadAnimationCSS');
      
      await progressiveLoader.loadAnimationIfNeeded('wrong-placement');
      expect(loadSpy).toHaveBeenCalledWith('wrong-placement');
      
      // Second call should not load again
      await progressiveLoader.loadAnimationIfNeeded('wrong-placement');
      expect(loadSpy).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('Context-Aware Animations', () => {
    it('should adjust intensity based on context', () => {
      const errorIntensity = contextAwareManager.getContextIntensity('error');
      const successIntensity = contextAwareManager.getContextIntensity('success');
      
      expect(errorIntensity).toBeGreaterThan(successIntensity);
    });
    
    it('should reduce intensity for repetitive contexts', () => {
      const firstIntensity = contextAwareManager.getContextIntensity('error');
      
      // Simulate multiple error animations
      for (let i = 0; i < 5; i++) {
        contextAwareManager.getContextIntensity('error');
      }
      
      const laterIntensity = contextAwareManager.getContextIntensity('error');
      expect(laterIntensity).toBeLessThan(firstIntensity);
    });
  });
  
  describe('Accessibility', () => {
    it('should respect reduced motion preferences', () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query.includes('prefers-reduced-motion'),
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });
      
      const preferences = getAnimationPreferences();
      expect(preferences.shouldAnimate).toBe(false);
    });
  });
});
```

### 5.2 Performance Testing

**File**: `src/tests/performanceTests.test.js` (new file)
**Timeline**: Day 3-5

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { measureAnimationPerformance } from '../utils/animationUtils';

describe('Animation Performance Tests', () => {
  beforeEach(() => {
    // Setup DOM for testing
    document.body.innerHTML = `
      <div id="test-card" class="card"></div>
      <div id="test-timeline" class="timeline"></div>
    `;
  });
  
  it('should complete animations within 16.67ms per frame', async () => {
    const startTime = performance.now();
    
    const card = document.getElementById('test-card');
    card.classList.add('card-wrong-placement');
    
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const duration = measureAnimationPerformance('wrong-placement', startTime);
    expect(duration).toBeLessThan(700); // Allow some buffer
  });
  
  it('should maintain 60fps during animation sequences', async () => {
    const frameTimes = [];
    let lastFrameTime = performance.now();
    
    const measureFrame = () => {
      const currentTime = performance.now();
      frameTimes.push(currentTime - lastFrameTime);
      lastFrameTime = currentTime;
    };
    
    // Start measuring frames
    const interval = setInterval(measureFrame, 16);
    
    // Trigger animation sequence
    const card = document.getElementById('test-card');
    card.classList.add('card-wrong-placement');
    
    await new Promise(resolve => setTimeout(resolve, 600));
    
    clearInterval(interval);
    
    // Check frame times
    const averageFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
    expect(averageFrameTime).toBeLessThan(16.67);
  });
  
  it('should not cause memory leaks during animations', async () => {
    const initialMemory = performance.memory?.usedJSHeapSize || 0;
    
    // Trigger multiple animations
    for (let i = 0; i < 10; i++) {
      const card = document.getElementById('test-card');
      card.classList.add('card-wrong-placement');
      await new Promise(resolve => setTimeout(resolve, 100));
      card.classList.remove('card-wrong-placement');
    }
    
    // Force garbage collection if available
    if (window.gc) {
      window.gc();
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const finalMemory = performance.memory?.usedJSHeapSize || 0;
    const memoryIncrease = finalMemory - initialMemory;
    
    // Memory increase should be reasonable (less than 1MB)
    expect(memoryIncrease).toBeLessThan(1024 * 1024);
  });
});
```

## Phase 6: Integration and Deployment (Week 6)

### 6.1 Update Main Components

**Files**: Multiple component files
**Timeline**: Day 1-3

```javascript
// Update Game.jsx to use new animation system
import { animationQueue } from '../utils/animationQueue';
import { progressiveLoader } from '../utils/progressiveAnimations';
import { contextAwareManager } from '../utils/contextAwareAnimations';
import { createAccessibleAnimation } from '../utils/accessibility';

// Update placeCard function
const placeCard = async (position) => {
  // Preload critical animations
  await progressiveLoader.loadAnimationIfNeeded('wrong-placement');
  
  // Use context-aware animations
  if (isCorrectPlacement) {
    contextAwareManager.applyContextAwareAnimation(
      selectedCardElement, 
      'correct-placement', 
      'success'
    );
  } else {
    contextAwareManager.applyContextAwareAnimation(
      selectedCardElement, 
      'wrong-placement', 
      'error'
    );
  }
  
  // Use animation queue for complex sequences
  animationQueue.add(async () => {
    await handleWrongPlacement(position);
  }, 'high');
};
```

### 6.2 Add Animation Controls to UI

**File**: `src/components/game/GameControls.jsx`
**Timeline**: Day 3-4

```javascript
import { AnimationControls } from '../ui/AnimationControls';

// Add to GameControls component
export const GameControls = ({ /* existing props */ }) => {
  return (
    <div className="game-controls">
      {/* Existing controls */}
      
      {/* Animation controls */}
      <div className="animation-controls-section">
        <AnimationControls />
      </div>
    </div>
  );
};
```

### 6.3 Final Testing and Validation

**Timeline**: Day 4-5

1. **End-to-End Testing**: Test complete animation flows
2. **Performance Validation**: Ensure 60fps on target devices
3. **Accessibility Testing**: Verify reduced motion support
4. **Cross-Browser Testing**: Test on Chrome, Firefox, Safari, Edge
5. **Mobile Testing**: Test on iOS and Android devices

## Success Criteria and Metrics

### Performance Metrics
- [ ] All animations complete within 500ms
- [ ] Maintain 60fps during animation sequences
- [ ] Memory usage increase <5MB during animations
- [ ] Animation CSS load time <100ms

### User Experience Metrics
- [ ] User satisfaction rating >4.5/5 for animations
- [ ] Error rate <2% increase in user errors
- [ ] 100% reduced motion preference compliance
- [ ] Animation completion rate >95%

### Technical Metrics
- [ ] All tests passing
- [ ] Code coverage >90% for animation code
- [ ] Bundle size increase <10KB
- [ ] Zero console errors during animations

## Rollout Strategy

### Phase 1 (Week 1): Core Optimizations
- Deploy duration optimizations
- Monitor performance metrics
- Gather initial user feedback

### Phase 2 (Week 2): Performance Enhancements
- Deploy animation queue system
- Monitor frame rates and memory usage
- Test on various devices

### Phase 3 (Week 3): Accessibility Features
- Deploy enhanced accessibility support
- Test with screen readers and reduced motion
- Validate accessibility compliance

### Phase 4 (Week 4-5): Advanced Features
- Deploy progressive loading and context awareness
- Monitor user engagement metrics
- Gather comprehensive feedback

### Phase 5 (Week 6): Final Integration
- Deploy complete animation system
- Monitor all success metrics
- Plan future iterations based on data

## Risk Mitigation

### Technical Risks
- **Animation conflicts**: Mitigated by queue system
- **Performance degradation**: Mitigated by GPU acceleration and optimization
- **Browser compatibility**: Mitigated by progressive enhancement

### User Experience Risks
- **Animation fatigue**: Mitigated by context-aware intensity
- **Accessibility issues**: Mitigated by comprehensive reduced motion support
- **Mobile performance**: Mitigated by device-specific optimizations

## Conclusion

This implementation plan provides a structured approach to improving the Timeline Game's animation system. By following this plan, we can achieve:

1. **31% faster** wrong placement feedback
2. **67% faster** card selection feedback
3. **Better accessibility** for all users
4. **Improved performance** with 60fps guarantee
5. **Enhanced user satisfaction** through appropriate animation types

The plan is designed to be implemented incrementally, allowing for testing and validation at each phase while maintaining the game's functionality throughout the process. 