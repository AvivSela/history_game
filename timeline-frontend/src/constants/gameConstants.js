// Game Status Constants
export const GAME_STATUS = {
  LOBBY: 'lobby',
  LOADING: 'loading',
  PLAYING: 'playing',
  PAUSED: 'paused',
  WON: 'won',
  LOST: 'lost',
  ERROR: 'error'
};

// Player Types
export const PLAYER_TYPES = {
  HUMAN: 'human'
};

// Game Modes
export const GAME_MODES = {
  SINGLE: 'single'
};

// Difficulty Levels
export const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
  EXPERT: 'expert'
};

// Card Counts by Game Mode
export const CARD_COUNTS = {
  SINGLE: 5
};

// Pool Card Count
export const POOL_CARD_COUNT = 10;

// Feedback Types
export const FEEDBACK_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info'
};

// Animation Durations (in milliseconds)
export const ANIMATION_DURATIONS = {
  CARD_PLACE: 300,
  FEEDBACK_SHOW: 2000
};

// Score Multipliers
export const SCORE_MULTIPLIERS = {
  CORRECT_PLACEMENT: 100,
  TIME_BONUS: 10,
  ATTEMPT_PENALTY: 5
};

// Tolerance Levels for Card Placement (in years)
export const PLACEMENT_TOLERANCE = {
  EASY: 50,
  MEDIUM: 25,
  HARD: 10
};

// UI Dimensions and Layout Constants
export const UI_DIMENSIONS = {
  // Card dimensions
  CARD_WIDTH: 160,
  CARD_SPACING: 20,
  CARD_OVERLAP_FACTOR: 0.3,
  CARD_OVERLAP_REDUCTION: 0.05,
  
  // Timeline dimensions
  TIMELINE_SCROLL_AMOUNT: 300,
  TIMELINE_MIN_HEIGHT: 320,
  TIMELINE_INSERTION_POINT_WIDTH: 80,
  TIMELINE_INSERTION_POINT_HEIGHT: 320,
  
  // Player hand dimensions
  HAND_MAX_ANGLE: 25,
  HAND_ANGLE_MULTIPLIER: 3,
  HAND_SELECTED_OFFSET: 20,
  HAND_HOVER_SCALE: 1.1,
  
  // Z-index layers
  Z_INDEX: {
    SELECTED_CARD: 1000,
    HOVERED_CARD: 999,
    ANIMATION_CONTROLS: 1000,
    TOOLTIP: 50
  }
};

// Timing Constants (in milliseconds)
export const TIMING = {
  // Animation timings
  QUICK_FEEDBACK: 100,
  CARD_SELECTION: 150,
  CARD_SHAKE: 400,
  CARD_HIGHLIGHT: 400,
  CARD_FADE_OUT: 300,
  CARD_BOUNCE_IN: 600,
  WRONG_PLACEMENT: 800,
  TIMELINE_SHAKE: 600,
  INSERTION_POINT_ERROR: 400,
  TOTAL_SEQUENCE: 2000,
  TRANSITION_DURATION: 250,
  LOADING_DURATION: 500,
  

  FEEDBACK_DISPLAY: 2000,
  WRONG_PLACEMENT_INDICATOR: 1000,
  ACCESSIBILITY_DELAY: 1000,
  
  // Performance thresholds
  FRAME_BUDGET: 16.67, // 60fps target
  ANIMATION_TIMEOUT: 5000,
  MEMORY_LIMIT: 50, // MB
  CONCURRENT_ANIMATION_LIMIT: 3,
  
  // API timeouts
  API_TIMEOUT: 10000,
  PERFORMANCE_MONITOR_INTERVAL: 5000
};



// Game Logic Constants
export const GAME_LOGIC = {
  // Scoring
  BASE_SCORE: 100,
  TIME_BONUS_MAX: 50,
  TIME_BONUS_RATE: 10,
  ATTEMPT_PENALTY: 25,
  MIN_SCORE: 10,
  
  // Time calculations
  SECONDS_TO_MILLISECONDS: 1000,
  MINUTES_TO_SECONDS: 60,
  
  // Validation
  NEARBY_YEAR_THRESHOLD: 10,
  VERY_CLOSE_YEAR_THRESHOLD: 2,
  TIMELINE_EXTENSION_BONUS: 0.2,
  EASY_CARD_BONUS: 0.1,
  
  // Strategic values
  BASE_STRATEGIC_VALUE: 0.5,
  MIN_STRATEGIC_VALUE: 0.1,
  MAX_STRATEGIC_VALUE: 1.0
};

// Performance and Device Constants
export const PERFORMANCE = {
  // Device timing multipliers
  DEVICE_TIMING_MULTIPLIERS: {
    LOW_END_MOBILE: 0.7,
    MOBILE: 0.9,
    DESKTOP: 1.0,
    HIGH_END: 1.1
  },
  
  // Animation priority levels
  ANIMATION_PRIORITY: {
    CRITICAL: 'critical',
    HIGH: 'high',
    NORMAL: 'normal',
    LOW: 'low',
    IDLE: 'idle'
  },
  
  // Memory thresholds
  MEMORY_WARNING_THRESHOLD: 1000000, // 1MB
  MEMORY_CRITICAL_THRESHOLD: 2000000, // 2MB
  HEAP_SIZE_WARNING: 1000000,
  HEAP_SIZE_CRITICAL: 2000000
};

// API and Network Constants
export const API = {
  BASE_URL: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || 'http://localhost:5000/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  
  // Status codes
  STATUS_CODES: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
  }
};

// Accessibility Constants
export const ACCESSIBILITY = {
  REDUCED_MOTION_PREFERENCE: 'prefers-reduced-motion',
  SCREEN_READER_DELAY: 1000,
  FOCUS_INDICATOR_DURATION: 2000,
  KEYBOARD_NAVIGATION_DELAY: 150
};

// CSS and Styling Constants
export const STYLING = {
  // Transition durations
  TRANSITION_DURATION: '0.3s',
  TRANSITION_EASING: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  
  // Border radius
  BORDER_RADIUS: {
    SMALL: '0.25rem',
    MEDIUM: '0.5rem',
    LARGE: '1rem'
  },
  
  // Shadow levels
  SHADOW: {
    SMALL: '0 1px 3px rgba(0, 0, 0, 0.1)',
    MEDIUM: '0 4px 6px rgba(0, 0, 0, 0.1)',
    LARGE: '0 10px 15px rgba(0, 0, 0, 0.1)'
  }
};

// Test and Development Constants
export const DEVELOPMENT = {
  // Test timeouts
  TEST_TIMEOUT: 10000,
  ANIMATION_TEST_TIMEOUT: 2000,
  
  // Mock data
  MOCK_HEAP_SIZE: 1000000,
  MOCK_TOTAL_HEAP_SIZE: 2000000,
  
  // Performance testing
  PERFORMANCE_ITERATIONS: 100,
  PERFORMANCE_THRESHOLD: 50 // ms
}; 