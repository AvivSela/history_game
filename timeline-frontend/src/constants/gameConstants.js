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
  HUMAN: 'human',
  AI: 'ai'
};

// Game Modes
export const GAME_MODES = {
  SINGLE: 'single',
  AI: 'ai',
  MULTIPLAYER: 'multiplayer'
};

// Difficulty Levels
export const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
};

// Card Counts
export const CARD_COUNTS = {
  SINGLE: 5,
  AI: 8
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
  FEEDBACK_SHOW: 2000,
  AI_THINKING: {
    EASY: 1000,
    MEDIUM: 2000,
    HARD: 3000
  }
};

// Score Multipliers
export const SCORE_MULTIPLIERS = {
  CORRECT_PLACEMENT: 100,
  TIME_BONUS: 10,
  ATTEMPT_PENALTY: 5
};

// Tolerance Levels for Card Placement
export const PLACEMENT_TOLERANCE = {
  EASY: 50, // years
  MEDIUM: 25,
  HARD: 10
}; 