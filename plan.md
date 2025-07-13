# Visual Feedback Animation Plan: Incorrect Card Placement

## Overview
Implement smooth, engaging animations to provide visual feedback when users place cards incorrectly, enhancing the educational experience and user engagement. This feature will transform the learning moment from a simple error into an engaging, educational experience that encourages continued play.

## Animation Sequence
1. **Incorrect card shakes** (quick left-right shake) and fades out
2. **Feedback message appears** ("Try again! Here's a new card.")
3. **After a short delay**, the new card fades/slides/bounces in to the hand, with a brief highlight

## Technical Requirements
- **Performance**: 60fps animations on mid-range devices
- **Accessibility**: Full support for reduced motion preferences
- **Cross-browser**: Support for Chrome, Firefox, Safari, Edge
- **Mobile**: Optimized for touch devices and lower-end hardware
- **Memory**: Efficient animation cleanup to prevent memory leaks

---

## Phase 1: Animation Infrastructure Setup

### 1.1 CSS Animation Classes
**File:** `timeline-frontend/src/index.css`

Create reusable CSS animation classes with performance optimizations:

```css
/* Performance optimization for animations */
.card-animating {
  will-change: transform, opacity;
  backface-visibility: hidden;
  transform: translateZ(0); /* Force GPU acceleration */
}

/* Card shake animation - subtle but noticeable */
@keyframes cardShake {
  0%, 100% { transform: translateX(0) translateZ(0); }
  10% { transform: translateX(-4px) translateZ(0); }
  20% { transform: translateX(4px) translateZ(0); }
  30% { transform: translateX(-4px) translateZ(0); }
  40% { transform: translateX(4px) translateZ(0); }
  50% { transform: translateX(-2px) translateZ(0); }
  60% { transform: translateX(2px) translateZ(0); }
  70% { transform: translateX(-1px) translateZ(0); }
  80% { transform: translateX(1px) translateZ(0); }
  90% { transform: translateX(-0.5px) translateZ(0); }
}

.card-shake {
  animation: cardShake 0.6s cubic-bezier(0.36, 0, 0.66, 1);
  animation-fill-mode: both;
}

/* Card fade out with scale reduction */
.card-fade-out {
  animation: fadeOut 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes fadeOut {
  0% { 
    opacity: 1; 
    transform: scale(1) translateZ(0);
    filter: brightness(1);
  }
  50% { 
    opacity: 0.5; 
    transform: scale(0.95) translateZ(0);
    filter: brightness(0.8);
  }
  100% { 
    opacity: 0; 
    transform: scale(0.9) translateZ(0);
    filter: brightness(0.6);
  }
}

/* Card bounce in with spring effect */
.card-bounce-in {
  animation: bounceIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  animation-fill-mode: both;
}

@keyframes bounceIn {
  0% { 
    opacity: 0; 
    transform: scale(0.2) translateY(60px) translateZ(0);
  }
  50% { 
    opacity: 1; 
    transform: scale(1.1) translateY(-8px) translateZ(0);
  }
  70% { 
    transform: scale(0.95) translateY(2px) translateZ(0);
  }
  85% { 
    transform: scale(1.02) translateY(-1px) translateZ(0);
  }
  100% { 
    opacity: 1; 
    transform: scale(1) translateY(0) translateZ(0);
  }
}

/* Card highlight with pulsing glow */
.card-highlight {
  animation: highlight 1.2s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes highlight {
  0% { 
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.8);
    transform: scale(1) translateZ(0);
  }
  25% { 
    box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.4);
    transform: scale(1.02) translateZ(0);
  }
  50% { 
    box-shadow: 0 0 0 12px rgba(59, 130, 246, 0.2);
    transform: scale(1.05) translateZ(0);
  }
  75% { 
    box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.1);
    transform: scale(1.02) translateZ(0);
  }
  100% { 
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
    transform: scale(1) translateZ(0);
  }
}

/* Reduced motion alternatives */
@media (prefers-reduced-motion: reduce) {
  .card-shake {
    animation: none;
    transform: translateX(0);
  }
  
  .card-fade-out {
    animation: none;
    opacity: 0;
    transform: scale(0.9);
  }
  
  .card-bounce-in {
    animation: none;
    opacity: 1;
    transform: scale(1);
  }
  
  .card-highlight {
    animation: none;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
  }
}
```

### 1.2 Animation Utility Functions
**File:** `timeline-frontend/src/utils/animationUtils.js`

Create comprehensive utility functions for managing animations:

```javascript
// Animation timing constants with detailed breakdown
export const ANIMATION_DELAYS = {
  SHAKE_DURATION: 600,
  FADE_OUT_DURATION: 500,
  FEEDBACK_DELAY: 300,
  NEW_CARD_DELAY: 800,
  BOUNCE_IN_DURATION: 800,
  HIGHLIGHT_DURATION: 1200,
  TOTAL_ANIMATION_DURATION: 2900 // Total time for complete sequence
};

// Animation easing functions for smooth transitions
export const EASING = {
  SHAKE: 'cubic-bezier(0.36, 0, 0.66, 1)',
  FADE_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
  BOUNCE_IN: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  HIGHLIGHT: 'cubic-bezier(0.4, 0, 0.2, 1)'
};

// Utility to add/remove animation classes with error handling
export const animateCard = (element, animationClass, duration) => {
  return new Promise((resolve, reject) => {
    if (!element) {
      reject(new Error('Element not found for animation'));
      return;
    }

    try {
      // Add performance optimization class
      element.classList.add('card-animating');
      element.classList.add(animationClass);
      
      // Use requestAnimationFrame for smooth timing
      const startTime = performance.now();
      
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        
        if (elapsed >= duration) {
          element.classList.remove(animationClass);
          element.classList.remove('card-animating');
          resolve();
        } else {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    } catch (error) {
      reject(error);
    }
  });
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
```

---

## Phase 2: Component Updates

### 2.1 PlayerHand Component Updates
**File:** `timeline-frontend/src/components/PlayerHand/PlayerHand.jsx`

Add comprehensive animation state management with error handling and performance monitoring:

```javascript
import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  animateCard, 
  animateCardSequence, 
  prefersReducedMotion, 
  cleanupAnimations,
  debounce,
  measureAnimationPerformance 
} from '../../utils/animationUtils';

// Add to component state
const [animatingCards, setAnimatingCards] = useState(new Set());
const [newCardId, setNewCardId] = useState(null);
const [animationQueue, setAnimationQueue] = useState([]);
const animationRefs = useRef(new Map());

// Debounced animation trigger to prevent rapid calls
const debouncedAnimateCard = useCallback(
  debounce(async (cardId, animationType) => {
    const startTime = performance.now();
    
    try {
      const cardElement = document.querySelector(`[data-card-id="${cardId}"]`);
      if (!cardElement) {
        console.warn(`Card element not found for ID: ${cardId}`);
        return;
      }

      if (prefersReducedMotion()) {
        // Apply instant state changes for reduced motion
        if (animationType === 'removal') {
          cardElement.style.opacity = '0';
          cardElement.style.transform = 'scale(0.9)';
        } else if (animationType === 'addition') {
          cardElement.style.opacity = '1';
          cardElement.style.transform = 'scale(1)';
        }
        return;
      }

      // Store animation reference for cleanup
      animationRefs.current.set(cardId, { element: cardElement, type: animationType });

      if (animationType === 'removal') {
        setAnimatingCards(prev => new Set([...prev, cardId]));
        
        const sequence = [
          { animation: 'card-shake', duration: ANIMATION_DELAYS.SHAKE_DURATION },
          { animation: 'card-fade-out', duration: ANIMATION_DELAYS.FADE_OUT_DURATION }
        ];
        
        await animateCardSequence(cardElement, sequence);
        
        // Cleanup after animation
        cleanupAnimations(cardElement);
        setAnimatingCards(prev => {
          const newSet = new Set(prev);
          newSet.delete(cardId);
          return newSet;
        });
        
      } else if (animationType === 'addition') {
        setNewCardId(cardId);
        
        // Delay before new card animation
        await new Promise(resolve => setTimeout(resolve, ANIMATION_DELAYS.NEW_CARD_DELAY));
        
        const sequence = [
          { animation: 'card-bounce-in', duration: ANIMATION_DELAYS.BOUNCE_IN_DURATION },
          { animation: 'card-highlight', duration: ANIMATION_DELAYS.HIGHLIGHT_DURATION }
        ];
        
        await animateCardSequence(cardElement, sequence);
        
        // Auto-select the new card
        if (onCardSelect) {
          const newCard = cards.find(card => card.id === cardId);
          if (newCard) {
            onCardSelect(newCard);
          }
        }
        
        setNewCardId(null);
      }
      
      // Measure and log performance
      measureAnimationPerformance(`${animationType}_${cardId}`, startTime);
      
    } catch (error) {
      console.error(`Animation failed for card ${cardId}:`, error);
      // Fallback: apply instant state change
      const cardElement = document.querySelector(`[data-card-id="${cardId}"]`);
      if (cardElement) {
        cleanupAnimations(cardElement);
      }
    } finally {
      // Cleanup animation reference
      animationRefs.current.delete(cardId);
    }
  }, 100),
  []
);

// Animation methods with proper error handling
const animateCardRemoval = useCallback(async (cardId) => {
  await debouncedAnimateCard(cardId, 'removal');
}, [debouncedAnimateCard]);

const animateNewCard = useCallback(async (cardId) => {
  await debouncedAnimateCard(cardId, 'addition');
}, [debouncedAnimateCard]);

// Cleanup animations on component unmount
useEffect(() => {
  return () => {
    // Cleanup all ongoing animations
    animationRefs.current.forEach(({ element }) => {
      cleanupAnimations(element);
    });
    animationRefs.current.clear();
  };
}, []);

// Expose animation methods via ref for parent component
useImperativeHandle(ref, () => ({
  animateCardRemoval,
  animateNewCard,
  isAnimating: animatingCards.size > 0 || newCardId !== null
}));
```

### 2.2 Card Component Updates
**File:** `timeline-frontend/src/components/Card/Card.jsx`

Add comprehensive animation support with performance optimizations:

```javascript
import { forwardRef, useEffect, useRef } from 'react';
import { cleanupAnimations } from '../../utils/animationUtils';

const Card = forwardRef(({ 
  card, 
  isAnimating = false, 
  isNewCard = false, 
  isSelected = false,
  onClick,
  className = '',
  size = 'medium',
  ...props 
}, ref) => {
  const cardRef = useRef(null);
  
  // Combine refs
  useEffect(() => {
    if (ref) {
      if (typeof ref === 'function') {
        ref(cardRef.current);
      } else {
        ref.current = cardRef.current;
      }
    }
  }, [ref]);

  // Cleanup animations on unmount
  useEffect(() => {
    return () => {
      if (cardRef.current) {
        cleanupAnimations(cardRef.current);
      }
    };
  }, []);

  // Generate dynamic classes
  const cardClasses = [
    'card',
    `card-${size}`,
    isAnimating && 'card-animating',
    isNewCard && 'new-card',
    isSelected && 'selected',
    className
  ].filter(Boolean).join(' ');

  // Generate dynamic styles
  const cardStyles = {
    '--card-id': card.id,
    '--animation-state': isAnimating ? 'running' : 'paused',
    '--selection-state': isSelected ? 'selected' : 'unselected'
  };

  return (
    <div 
      ref={cardRef}
      className={cardClasses}
      data-card-id={card.id}
      data-testid={`card-${card.id}`}
      style={cardStyles}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`${card.title} - ${new Date(card.dateOccurred).getFullYear()}`}
      aria-selected={isSelected}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      {...props}
    >
      {/* Card Header */}
      <div className="card-header">
        <div className="card-category">
          <span className="category-icon">{getCategoryIcon(card.category)}</span>
          <span className="category-name">{card.category}</span>
        </div>
        <div className="card-difficulty">
          {Array.from({ length: card.difficulty }, (_, i) => (
            <span key={i} className="difficulty-star">★</span>
          ))}
        </div>
      </div>

      {/* Card Title */}
      <div className="card-title">
        <h3>{card.title}</h3>
      </div>

      {/* Card Content */}
      <div className="card-content">
        <p>{card.description}</p>
      </div>

      {/* Card Footer */}
      <div className="card-footer">
        <div className="card-date">
          {formatDate(card.dateOccurred)}
        </div>
        {isNewCard && (
          <div className="new-card-badge" aria-label="New card">
            ✨
          </div>
        )}
      </div>

      {/* Animation overlay for visual effects */}
      {isAnimating && (
        <div className="card-animation-overlay" aria-hidden="true" />
      )}
    </div>
  );
});

// Helper functions
const getCategoryIcon = (category) => {
  const icons = {
    'History': '📜',
    'Science': '🔬',
    'Technology': '💻',
    'Art': '🎨',
    'Politics': '🏛️',
    'Sports': '⚽',
    'Music': '🎵',
    'Literature': '📚'
  };
  return icons[category] || '📄';
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

Card.displayName = 'Card';

export default Card;
```

---

## Phase 3: Game Logic Integration

### 3.1 Update Game.jsx Animation Flow
**File:** `timeline-frontend/src/pages/Game.jsx`

Modify the failed placement logic to include comprehensive animations:

```javascript
import { useRef, useCallback } from 'react';
import { measureAnimationPerformance } from '../utils/animationUtils';

// Add animation state with detailed tracking
const [animationState, setAnimationState] = useState({
  isAnimating: false,
  removingCardId: null,
  addingCardId: null,
  animationPhase: 'idle', // 'idle', 'removing', 'feedback', 'adding', 'complete'
  animationStartTime: null
});

// Add refs for component communication
const playerHandRef = useRef(null);
const timelineRef = useRef(null);

// Enhanced animation coordination
const coordinateCardAnimation = useCallback(async (selectedCard, newCard, player) => {
  const animationStartTime = performance.now();
  
  try {
    setAnimationState({
      isAnimating: true,
      removingCardId: selectedCard.id,
      addingCardId: null,
      animationPhase: 'removing',
      animationStartTime
    });

    // Phase 1: Animate card removal
    if (player === 'human' && playerHandRef.current?.animateCardRemoval) {
      await playerHandRef.current.animateCardRemoval(selectedCard.id);
    }

    // Phase 2: Show feedback message
    setAnimationState(prev => ({
      ...prev,
      animationPhase: 'feedback'
    }));

    // Phase 3: Add new card and animate it
    if (newCard) {
      setAnimationState(prev => ({
        ...prev,
        addingCardId: newCard.id,
        animationPhase: 'adding'
      }));

      // Wait for DOM update to include new card
      await new Promise(resolve => setTimeout(resolve, 100));

      if (playerHandRef.current?.animateNewCard) {
        await playerHandRef.current.animateNewCard(newCard.id);
      }
    }

    // Phase 4: Complete animation
    setAnimationState({
      isAnimating: false,
      removingCardId: null,
      addingCardId: null,
      animationPhase: 'complete',
      animationStartTime
    });

    // Measure total animation performance
    measureAnimationPerformance('complete_card_replacement', animationStartTime);

  } catch (error) {
    console.error('Animation coordination failed:', error);
    // Reset animation state on error
    setAnimationState({
      isAnimating: false,
      removingCardId: null,
      addingCardId: null,
      animationPhase: 'idle',
      animationStartTime: null
    });
  }
}, []);

// Update placeCard function for failed placement with animations
} else {
  // Failed placement - coordinate complete animation sequence
  const handKey = player === 'human' ? 'playerHand' : 'aiHand';
  const currentHand = gameState[handKey];
  
  // Remove the incorrect card from hand
  const updatedHand = currentHand.filter(card => card.id !== selectedCard.id);
  
  // Get a new card from the pool (only for human player)
  let newCard = null;
  if (player === 'human') {
    newCard = await getNewCardFromPool();
  }
  
  // If we got a new card, add it to the hand
  const finalHand = newCard ? [...updatedHand, newCard] : updatedHand;
  
  // Update state with new hand immediately
  setGameState(prev => ({
    ...prev,
    [handKey]: finalHand,
    selectedCard: null,
    showInsertionPoints: false,
    insertionPoints: [],
    attempts: { ...gameState.attempts, [selectedCard.id]: cardAttempts },
    gameStats: {
      ...gameState.gameStats,
      totalMoves: gameState.gameStats.totalMoves + 1,
      averageTimePerMove: calculateAverageTime(gameState.gameStats, turnTime)
    },
    feedback: {
      type: 'error',
      message: validation.feedback + (newCard ? ' You got a new card to try!' : ' No more cards available.'),
      attempts: cardAttempts,
      showAnimation: true // Flag to trigger feedback animation
    }
  }));

  // Coordinate animations after state update
  if (player === 'human') {
    await coordinateCardAnimation(selectedCard, newCard, player);
  }
}
```

### 3.2 Animation Coordination
Add methods to coordinate animations between components:
```javascript
// Pass animation callbacks to PlayerHand
const handleCardRemovalAnimation = async (cardId) => {
  // Trigger card removal animation in PlayerHand
  if (playerHandRef.current?.animateCardRemoval) {
    await playerHandRef.current.animateCardRemoval(cardId);
  }
};

const handleNewCardAnimation = async (cardId) => {
  // Trigger new card animation in PlayerHand
  if (playerHandRef.current?.animateNewCard) {
    await playerHandRef.current.animateNewCard(cardId);
  }
};
```

---

## Phase 4: Feedback Message Enhancement

### 4.1 Enhanced Feedback Component
**File:** `timeline-frontend/src/components/Feedback/Feedback.jsx` (new file)

Create a dedicated feedback component with animations:
```javascript
const Feedback = ({ message, type, isVisible, onAnimationComplete }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible && !isAnimating) {
      setIsAnimating(true);
      // Animate feedback message appearance
      setTimeout(() => {
        setIsAnimating(false);
        onAnimationComplete?.();
      }, 2000);
    }
  }, [isVisible]);

  return (
    <div className={`feedback-message ${type} ${isVisible ? 'visible' : ''} ${isAnimating ? 'animating' : ''}`}>
      {message}
    </div>
  );
};
```

### 4.2 Feedback CSS
Add styles for feedback animations:
```css
.feedback-message {
  opacity: 0;
  transform: translateY(-20px);
  transition: all 0.3s ease-out;
}

.feedback-message.visible {
  opacity: 1;
  transform: translateY(0);
}

.feedback-message.animating {
  animation: feedbackPulse 0.5s ease-out;
}

@keyframes feedbackPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}
```

---

## Phase 5: Testing and Refinement

### 5.1 Animation Testing
**File:** `timeline-frontend/src/tests/animation.test.jsx`

Create tests for animation functionality:
```javascript
describe('Card Animation Tests', () => {
  it('should animate card removal on incorrect placement', async () => {
    // Test card shake and fade out animations
  });

  it('should animate new card appearance', async () => {
    // Test bounce in and highlight animations
  });

  it('should respect reduced motion preferences', () => {
    // Test that animations are disabled when user prefers reduced motion
  });
});
```

### 5.2 Performance Optimization
- Use `transform` and `opacity` for animations (GPU accelerated)
- Implement `will-change` CSS property for elements that will animate
- Use `requestAnimationFrame` for smooth animations
- Debounce rapid state changes to prevent animation conflicts

---

## Phase 6: Accessibility and Polish

### 6.1 Accessibility Features
**File:** `timeline-frontend/src/utils/accessibility.js`

Create comprehensive accessibility utilities:
```javascript
// Accessibility utilities for animations
export const accessibilityConfig = {
  // Reduced motion detection with fallback
  prefersReducedMotion: () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },
  
  // Screen reader announcements
  announceToScreenReader: (message, priority = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  },
  
  // Focus management for animations
  manageFocus: (element, shouldFocus = true) => {
    if (!element) return;
    
    if (shouldFocus) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  },
  
  // Keyboard navigation support
  handleKeyboardNavigation: (event, onEnter, onEscape) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        onEnter?.();
        break;
      case 'Escape':
        event.preventDefault();
        onEscape?.();
        break;
    }
  }
};

// ARIA labels for animation states
export const getAnimationAriaLabel = (animationType, cardTitle) => {
  const labels = {
    'removal': `${cardTitle} is being removed due to incorrect placement`,
    'addition': `New card ${cardTitle} is being added to your hand`,
    'shake': `${cardTitle} is shaking to indicate incorrect placement`,
    'highlight': `${cardTitle} is highlighted as a new card`
  };
  return labels[animationType] || '';
};
```

### 6.2 Mobile Optimization
**File:** `timeline-frontend/src/utils/mobileOptimization.js`

Create mobile-specific optimizations:
```javascript
// Mobile detection and optimization
export const mobileOptimization = {
  // Detect mobile device
  isMobile: () => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },
  
  // Detect low-end device
  isLowEndDevice: () => {
    if (typeof navigator === 'undefined') return false;
    
    // Check for hardware concurrency (CPU cores)
    const cores = navigator.hardwareConcurrency || 1;
    
    // Check for device memory
    const memory = navigator.deviceMemory || 4;
    
    return cores <= 2 || memory <= 2;
  },
  
  // Adjust animation timing for mobile
  getMobileAnimationTiming: (baseTiming) => {
    if (mobileOptimization.isLowEndDevice()) {
      return baseTiming * 0.7; // Faster animations for low-end devices
    }
    if (mobileOptimization.isMobile()) {
      return baseTiming * 0.9; // Slightly faster for mobile
    }
    return baseTiming;
  },
  
  // Touch-friendly animation triggers
  addTouchSupport: (element, onTouch) => {
    if (!element) return;
    
    let touchStartTime = 0;
    const touchThreshold = 200; // ms
    
    element.addEventListener('touchstart', (e) => {
      touchStartTime = Date.now();
    }, { passive: true });
    
    element.addEventListener('touchend', (e) => {
      const touchDuration = Date.now() - touchStartTime;
      if (touchDuration < touchThreshold) {
        onTouch?.(e);
      }
    }, { passive: true });
  }
};
```

### 6.3 Performance Monitoring
**File:** `timeline-frontend/src/utils/performanceMonitor.js`

Create performance monitoring utilities:
```javascript
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
```

---

## Implementation Timeline

1. **Week 1**: Phase 1-2 (Infrastructure and Component Updates)
2. **Week 2**: Phase 3-4 (Game Logic Integration and Feedback Enhancement)
3. **Week 3**: Phase 5-6 (Testing, Accessibility, and Polish)

---

## Success Metrics

- **User Engagement**: Increased time spent playing after incorrect placements
- **Learning Effectiveness**: Improved accuracy in subsequent card placements
- **User Satisfaction**: Positive feedback about visual feedback
- **Performance**: Smooth animations without frame drops
- **Accessibility**: Compliance with motion sensitivity preferences

---

## Future Enhancements

- **Sound Effects**: Optional audio feedback for animations
- **Haptic Feedback**: Vibration feedback on mobile devices
- **Customizable Animations**: User preferences for animation style
- **Advanced Effects**: Particle effects, card trails, etc.
- **Analytics**: Track animation performance and user interaction patterns 