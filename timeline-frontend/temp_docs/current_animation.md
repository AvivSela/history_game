# Timeline Game Animation System Documentation

## Overview

The Timeline Game features a comprehensive animation system that provides rich visual feedback for all user interactions. This document details all animations, their triggers, durations, and visual effects.

## Animation System Architecture

### Core Components
- **Animation Utilities**: `src/utils/animationUtils.js`
- **CSS Animations**: `src/index.css`
- **Component Integration**: Timeline, PlayerHand, and Game components
- **Performance Monitoring**: Built-in performance tracking and reduced motion support

## 1. Wrong Placement Animations

### Timeline Shake Animation
- **Trigger**: When a card is placed in the wrong position on the timeline
- **Duration**: 0.8 seconds
- **CSS Class**: `.timeline-wrong-placement`
- **Effect**: The entire timeline shakes horizontally with decreasing intensity
- **Keyframes**:
  ```
  0%, 100%: translateX(0)
  10%: translateX(-6px)
  20%: translateX(6px)
  30%: translateX(-4px)
  40%: translateX(4px)
  50%: translateX(-2px)
  60%: translateX(2px)
  70%: translateX(-1px)
  80%: translateX(1px)
  90%: translateX(-0.5px)
  ```
- **Easing**: `cubic-bezier(0.36, 0, 0.66, 1)`

### Wrong Placement Indicator
- **Trigger**: Same time as timeline shake
- **Duration**: 1 second
- **CSS Class**: `.wrong-placement-indicator`
- **Effect**: A red ❌ symbol appears in the center of the timeline
- **Keyframes**:
  ```
  0%: opacity: 0, scale: 0.5
  50%: opacity: 1, scale: 1.2
  100%: opacity: 0, scale: 1
  ```
- **Easing**: `cubic-bezier(0.68, -0.55, 0.265, 1.55)`

### Insertion Point Error Animation
- **Trigger**: When wrong placement occurs at a specific insertion point
- **Duration**: 0.6 seconds
- **CSS Class**: `.insertion-point-error`
- **Effect**: The insertion point where the card was placed incorrectly flashes red
- **Keyframes**:
  ```
  0%: background-color: rgba(231, 76, 60, 0.3), scale: 1
  50%: background-color: rgba(231, 76, 60, 0.6), scale: 1.2
  100%: background-color: rgba(231, 76, 60, 0.3), scale: 1
  ```
- **Easing**: `cubic-bezier(0.68, -0.55, 0.265, 1.55)`

### Card Bounce Back Animation (Player Hand)
- **Trigger**: The selected card in player's hand animates out
- **Duration**: 1.2 seconds
- **CSS Class**: `.card-wrong-placement`
- **Effect**: Card appears to "bounce back" to the hand with multiple scale changes
- **Keyframes**:
  ```
  0%: opacity: 1, scale: 1, brightness: 1
  15%: opacity: 1, scale: 1.15, brightness: 1.2, red glow
  30%: opacity: 1, scale: 1.05, brightness: 1.1
  45%: opacity: 1, scale: 1.1, brightness: 1.05
  60%: opacity: 0.9, scale: 0.95, translateY(-10px)
  75%: opacity: 0.7, scale: 0.9, translateY(-20px)
  90%: opacity: 0.4, scale: 0.8, translateY(-30px)
  100%: opacity: 0, scale: 0.7, translateY(-40px)
  ```
- **Easing**: `cubic-bezier(0.68, -0.55, 0.265, 1.55)`

## 2. Card Removal Animations

### Card Shake + Fade Out
- **Trigger**: When a card is removed from player's hand (correct placement or wrong placement)
- **Duration**: 1.1 seconds total (600ms shake + 500ms fade)
- **CSS Classes**: `.card-shake` then `.card-fade-out`
- **Effect**: Card shakes horizontally then fades out
- **Shake Keyframes**:
  ```
  0%, 100%: translateX(0)
  10%, 30%, 50%, 70%, 90%: translateX(-10px)
  20%, 40%, 60%, 80%: translateX(10px)
  ```
- **Fade Keyframes**:
  ```
  0%: opacity: 1, scale: 1
  100%: opacity: 0, scale: 0.9
  ```

## 3. New Card Animations

### Card Bounce In + Highlight
- **Trigger**: When a new card is added to replace a wrong card
- **Duration**: 2 seconds total (800ms bounce + 1200ms highlight)
- **Delay**: 800ms after wrong placement
- **CSS Classes**: `.card-bounce-in` then `.card-highlight`
- **Bounce In Keyframes**:
  ```
  0%: opacity: 0, scale: 0.3, translateY(50px)
  50%: opacity: 1, scale: 1.1, translateY(-10px)
  100%: opacity: 1, scale: 1, translateY(0)
  ```
- **Highlight Keyframes**:
  ```
  0%: box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.8), scale: 1
  25%: box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.4), scale: 1.02
  50%: box-shadow: 0 0 0 12px rgba(59, 130, 246, 0.2), scale: 1.05
  75%: box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.1), scale: 1.02
  100%: box-shadow: 0 0 0 0 rgba(59, 130, 246, 0), scale: 1
  ```

## 4. Card Selection Animations

### Card Hover Effect
- **Trigger**: When mouse hovers over a card in hand
- **Duration**: 0.3 seconds
- **Effect**: Card scales up to 110% and moves up slightly
- **CSS**: Inline styles with `transform: scale(1.1)`
- **Easing**: `cubic-bezier(0.25, 0.46, 0.45, 0.94)`

### Card Selection Effect
- **Trigger**: When a card is clicked/selected
- **Duration**: 0.3 seconds
- **Effect**: Card moves up 20px and rotates to 0 degrees
- **CSS**: Inline styles with `translateY(-20px) rotate(0deg)`
- **Easing**: `cubic-bezier(0.25, 0.46, 0.45, 0.94)`

## 5. Timeline Card Placement Animation

### Card Place Animation
- **Trigger**: When a card is successfully placed on the timeline
- **Duration**: 0.6 seconds
- **CSS Class**: `.card-container.placing`
- **Effect**: Card scales and rotates into position
- **Keyframes**:
  ```
  0%: scale: 1.1, rotate: 5deg, opacity: 0.8
  50%: scale: 1.05, rotate: 0deg, opacity: 0.9
  100%: scale: 1, rotate: 0deg, opacity: 1
  ```
- **Easing**: `ease-out`

## 6. Performance Optimizations

### Reduced Motion Support
- **Trigger**: When user has `prefers-reduced-motion: reduce` enabled
- **Effect**: All animations are disabled, instant state changes applied
- **CSS**: `@media (prefers-reduced-motion: reduce)` rules
- **Implementation**: All animations check `prefersReducedMotion()` function

### Animation Performance Monitoring
- **Trigger**: During all animations
- **Effect**: Logs warnings if animations take longer than 16.67ms (60fps threshold)
- **Function**: `measureAnimationPerformance(animationName, startTime)`

### Animation Cleanup
- **Trigger**: After each animation completes
- **Effect**: Removes all animation classes to prevent conflicts
- **Function**: `cleanupAnimations(element)`

## 7. Animation Timing Constants

```javascript
ANIMATION_DELAYS = {
  SHAKE_DURATION: 600,
  FADE_OUT_DURATION: 500,
  FEEDBACK_DELAY: 300,
  NEW_CARD_DELAY: 800,
  BOUNCE_IN_DURATION: 800,
  HIGHLIGHT_DURATION: 1200,
  WRONG_PLACEMENT_DURATION: 1200,
  TIMELINE_SHAKE_DURATION: 800,
  INSERTION_POINT_ERROR_DURATION: 600,
  TOTAL_ANIMATION_DURATION: 2900
}
```

## 8. Animation Sequence for Wrong Placement

### Complete Timeline
1. **0ms**: Timeline shake + wrong placement indicator + insertion point error
2. **0ms**: Card removal animation starts in player hand
3. **800ms**: New card animation begins
4. **2900ms**: Complete sequence finishes

### Detailed Sequence
```
0ms     - Timeline shake starts (800ms)
0ms     - Wrong placement indicator appears (1000ms)
0ms     - Insertion point error flash (600ms)
0ms     - Card bounce back starts (1200ms)
800ms   - New card bounce in starts (800ms)
1600ms  - New card highlight starts (1200ms)
2900ms  - All animations complete
```

## 9. Animation Easing Functions

### Easing Types Used
- **Bounce effects**: `cubic-bezier(0.68, -0.55, 0.265, 1.55)` (elastic)
- **Shake effects**: `cubic-bezier(0.36, 0, 0.66, 1)` (smooth)
- **Fade effects**: `cubic-bezier(0.4, 0, 0.2, 1)` (ease-out)
- **Hover effects**: `cubic-bezier(0.25, 0.46, 0.45, 0.94)` (smooth)

### Easing Constants
```javascript
EASING = {
  SHAKE: 'cubic-bezier(0.36, 0, 0.66, 1)',
  FADE_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
  BOUNCE_IN: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  HIGHLIGHT: 'cubic-bezier(0.4, 0, 0.2, 1)',
  WRONG_PLACEMENT: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  TIMELINE_SHAKE: 'cubic-bezier(0.36, 0, 0.66, 1)',
  INSERTION_POINT_ERROR: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
}
```

## 10. Implementation Details

### Animation Trigger Points
- **Game.jsx**: Main animation triggers in `placeCard()` function
- **Timeline.jsx**: Timeline-specific animations via `useImperativeHandle`
- **PlayerHand.jsx**: Hand-specific animations via `useImperativeHandle`

### Animation State Management
- **Animation tracking**: `animatingCards` Set in PlayerHand
- **New card tracking**: `newCardId` state in PlayerHand
- **Animation refs**: `animationRefs` Map for cleanup

### Error Handling
- **Fallback animations**: Instant state changes if animations fail
- **Performance monitoring**: Automatic logging of slow animations
- **Cleanup**: Automatic cleanup of animation classes

## 11. Accessibility Features

### Reduced Motion Support
- **Detection**: `prefersReducedMotion()` function
- **Fallback**: Instant state changes instead of animations
- **CSS**: Media query support for reduced motion

### Performance Considerations
- **60fps target**: Animations optimized for smooth performance
- **GPU acceleration**: `translateZ(0)` for hardware acceleration
- **Debouncing**: Prevents rapid animation triggers

## 12. Future Enhancements

### Potential Improvements
- **Animation queuing**: Better handling of multiple simultaneous animations
- **Custom easing**: More sophisticated easing functions
- **Animation presets**: Reusable animation configurations
- **Performance metrics**: More detailed performance tracking

### Extension Points
- **New animation types**: Easy to add new CSS animations
- **Component integration**: Standardized animation API
- **Timing customization**: Configurable animation durations

---

*This document serves as the comprehensive guide to the Timeline Game's animation system. All animations are designed to provide clear visual feedback while maintaining smooth performance and accessibility.* 