/**
 * Centralized Game Constants Mock
 * 
 * This mock provides consistent game constants across all tests
 * and can be easily updated when constants change.
 */

export const GAME_STATUS = {
  LOBBY: 'lobby',
  LOADING: 'loading',
  PLAYING: 'playing',
  PAUSED: 'paused',
  WON: 'won',
  LOST: 'lost',
  ERROR: 'error'
};

export const PLAYER_TYPES = {
  HUMAN: 'human'
};

export const CARD_COUNTS = {
  SINGLE: 5
};

export const POOL_CARD_COUNT = 10;

export const API = {
  BASE_URL: 'http://localhost:5000/api',
  TIMEOUT: 10000,
  STATUS_CODES: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
  }
};

// Export all constants as default for easy importing
export default {
  GAME_STATUS,
  PLAYER_TYPES,
  CARD_COUNTS,
  POOL_CARD_COUNT,
  API
}; 