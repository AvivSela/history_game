// Optimized Animation Timing Constants
// Reduced durations for better performance while maintaining UX quality
import { TIMING } from '../../constants/gameConstants';

export const OPTIMIZED_TIMINGS = {
  // Quick feedback animations
  QUICK_FEEDBACK: TIMING.QUICK_FEEDBACK,
  CARD_SELECTION: TIMING.CARD_SELECTION,
  
  // Card animations
  CARD_SHAKE: TIMING.CARD_SHAKE,
  CARD_HIGHLIGHT: TIMING.CARD_HIGHLIGHT,
  CARD_FADE_OUT: TIMING.CARD_FADE_OUT,
  CARD_BOUNCE_IN: TIMING.CARD_BOUNCE_IN,
  
  // Wrong placement sequence
  WRONG_PLACEMENT: TIMING.WRONG_PLACEMENT,
  TIMELINE_SHAKE: TIMING.TIMELINE_SHAKE,
  INSERTION_POINT_ERROR: TIMING.INSERTION_POINT_ERROR,
  TOTAL_SEQUENCE: TIMING.TOTAL_SEQUENCE,
  
  // Transition animations
  TRANSITION_DURATION: TIMING.TRANSITION_DURATION,
  LOADING_DURATION: TIMING.LOADING_DURATION,
};

// Optimized easing functions for smooth transitions
export const OPTIMIZED_EASING = {
  SHAKE: 'cubic-bezier(0.36, 0, 0.66, 1)',
  FADE_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
  BOUNCE_IN: 'cubic-bezier(0.4, 0, 0.2, 1)',
  HIGHLIGHT: 'cubic-bezier(0.4, 0, 0.2, 1)',
  WRONG_PLACEMENT: 'cubic-bezier(0.36, 0, 0.66, 1)',
  TIMELINE_SHAKE: 'cubic-bezier(0.36, 0, 0.66, 1)',
  INSERTION_POINT_ERROR: 'cubic-bezier(0.4, 0, 0.2, 1)',
  TRANSITION: 'cubic-bezier(0.4, 0, 0.2, 1)',
  LOADING: 'cubic-bezier(0.4, 0, 0.2, 1)'
};

// Device-specific timing multipliers
export const DEVICE_TIMING_MULTIPLIERS = {
  LOW_END_MOBILE: 0.7,      // 30% faster for low-end devices
  MOBILE: 0.9,              // 10% faster for mobile devices
  DESKTOP: 1.0,             // Standard timing for desktop
  HIGH_END: 1.1             // Slightly slower for high-end devices (better quality)
};

// Animation priority levels
export const ANIMATION_PRIORITY = {
  CRITICAL: 'critical',     // Must run immediately
  HIGH: 'high',             // High priority animations
  NORMAL: 'normal',         // Standard animations
  LOW: 'low',               // Background animations
  IDLE: 'idle'              // Only run when idle
};

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  FRAME_BUDGET: TIMING.FRAME_BUDGET,
  ANIMATION_TIMEOUT: TIMING.ANIMATION_TIMEOUT,
  MEMORY_LIMIT: TIMING.MEMORY_LIMIT,
  CONCURRENT_LIMIT: TIMING.CONCURRENT_ANIMATION_LIMIT
}; 