// Optimized Animation Timing Constants
// Reduced durations for better performance while maintaining UX quality

export const OPTIMIZED_TIMINGS = {
  // Quick feedback animations
  QUICK_FEEDBACK: 100,      // Reduced from 300ms
  CARD_SELECTION: 150,      // Reduced from 250ms
  
  // Card animations
  CARD_SHAKE: 400,          // Reduced from 600ms
  CARD_HIGHLIGHT: 400,      // Reduced from 1200ms
  CARD_FADE_OUT: 300,       // Reduced from 500ms
  CARD_BOUNCE_IN: 600,      // Reduced from 800ms
  
  // Wrong placement sequence
  WRONG_PLACEMENT: 800,     // Reduced from 1200ms
  TIMELINE_SHAKE: 600,      // Reduced from 800ms
  INSERTION_POINT_ERROR: 400, // Reduced from 600ms
  TOTAL_SEQUENCE: 2000,     // Reduced from 2900ms
  
  // Transition animations
  TRANSITION_DURATION: 250, // Reduced from 400ms
  LOADING_DURATION: 500,    // Reduced from 800ms
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
  FRAME_BUDGET: 16.67,      // 60fps target (16.67ms per frame)
  ANIMATION_TIMEOUT: 5000,  // 5 second timeout for animations
  MEMORY_LIMIT: 50,         // 50MB memory limit for animations
  CONCURRENT_LIMIT: 3       // Maximum 3 concurrent animations
}; 