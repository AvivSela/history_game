import axios from 'axios';
import { API } from '../constants/gameConstants';

// Enhanced axios instance with retry logic
const api = axios.create({
  baseURL: API.BASE_URL,
  timeout: API.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Retry configuration
/**
 * Configuration object for API retry logic
 * @type {Object}
 */
const retryConfig = {
  retries: API.RETRY_ATTEMPTS,
  retryDelay: API.RETRY_DELAY,
  maxRetryDelay: API.MAX_RETRY_DELAY,
  /**
   * Determines whether a failed request should be retried
   * @param {Error} error - The error object from the failed request
   * @returns {boolean} True if the request should be retried
   */
  retryCondition: (error) => {
    // Retry on network errors or 5xx server errors
    return (
      !error.response ||
      (error.response.status >= 500 && error.response.status < 600) ||
      error.code === 'ECONNABORTED'
    );
  },
};

/**
 * Request interceptor for logging and preprocessing requests
 * Currently passes requests through unchanged but available for future enhancements
 */
api.interceptors.request.use(
  /**
   * Successful request handler
   * @param {Object} config - Axios request configuration
   * @returns {Object} Modified or unchanged request configuration
   */
  config => {
    return config;
  },
  /**
   * Request error handler
   * @param {Error} error - Request setup error
   * @returns {Promise} Rejected promise with error
   */
  error => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor for enhanced error handling and response processing
 * Converts HTTP status codes to meaningful error messages
 */
api.interceptors.response.use(
  /**
   * Successful response handler
   * @param {Object} response - Axios response object
   * @returns {Object} The response object unchanged
   */
  response => {
    return response;
  },
  /**
   * Response error handler that provides detailed error messages based on HTTP status codes
   * @param {Error} error - The error object from the failed request
   * @throws {Error} Throws descriptive error messages based on status codes and error types
   * @returns {Promise} Never returns, always throws an error
   */
  error => {
    // Handle different error types with enhanced error messages
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      switch (status) {
        case API.STATUS_CODES.BAD_REQUEST:
          throw new Error(data?.error || API.ERROR_MESSAGES.VALIDATION_ERROR);
        case API.STATUS_CODES.UNAUTHORIZED:
          throw new Error(API.ERROR_MESSAGES.UNAUTHORIZED_ERROR);
        case API.STATUS_CODES.FORBIDDEN:
          throw new Error('Access forbidden. Please check your permissions.');
        case API.STATUS_CODES.NOT_FOUND:
          throw new Error(API.ERROR_MESSAGES.NOT_FOUND_ERROR);
        case API.STATUS_CODES.CONFLICT:
          throw new Error(data?.error || 'Resource conflict. Please try again.');
        case API.STATUS_CODES.UNPROCESSABLE_ENTITY:
          throw new Error(data?.error || API.ERROR_MESSAGES.VALIDATION_ERROR);
        case API.STATUS_CODES.TOO_MANY_REQUESTS:
          throw new Error(API.ERROR_MESSAGES.RATE_LIMIT_ERROR);
        case API.STATUS_CODES.INTERNAL_SERVER_ERROR:
          throw new Error(API.ERROR_MESSAGES.SERVER_ERROR);
        case API.STATUS_CODES.SERVICE_UNAVAILABLE:
          throw new Error('Service temporarily unavailable. Please try again later.');
        default:
          throw new Error(data?.error || 'An unexpected error occurred');
      }
    } else if (error.request) {
      // Request was made but no response received
      throw new Error(API.ERROR_MESSAGES.NETWORK_ERROR);
    } else if (error.code === 'ECONNABORTED') {
      // Request timeout
      throw new Error(API.ERROR_MESSAGES.TIMEOUT_ERROR);
    } else {
      // Something else happened
      throw new Error('An unexpected error occurred');
    }
  }
);

/**
 * Main API object containing all game-related API methods
 * Provides comprehensive access to backend endpoints for game functionality
 * @namespace gameAPI
 */
export const gameAPI = {
  /**
   * Performs a health check on the backend API
   * @returns {Promise<Object>} Promise resolving to health status response
   */
  healthCheck: () => api.get(API.ENDPOINTS.HEALTH),

  /**
   * Retrieves all historical events from the backend
   * @returns {Promise<Object>} Promise resolving to array of all events
   */
  getAllEvents: () => api.get(API.ENDPOINTS.EVENTS),
  
  /**
   * Retrieves a random selection of historical events with optional filtering
   * @param {number} [count=5] - Number of random events to retrieve
   * @param {string[]} [categories=[]] - Array of category names to filter by
   * @param {Object} [difficultyRange=null] - Difficulty range filter with min/max properties
   * @param {number} difficultyRange.min - Minimum difficulty level
   * @param {number} difficultyRange.max - Maximum difficulty level
   * @returns {Promise<Object>} Promise resolving to array of filtered random events
   */
  getRandomEvents: (count = 5, categories = [], difficultyRange = null) => {
    const params = new URLSearchParams();
    if (categories && categories.length > 0) {
      params.append('categories', categories.join(','));
    }
    if (difficultyRange && typeof difficultyRange === 'object') {
      // Convert range to array of difficulties
      const difficulties = [];
      for (let i = difficultyRange.min; i <= difficultyRange.max; i++) {
        difficulties.push(i);
      }
      params.append('difficulties', difficulties.join(','));
    }
    const queryString = params.toString();
    const url = `${API.ENDPOINTS.EVENTS}/random/${count}${queryString ? `?${queryString}` : ''}`;
    return api.get(url);
  },
  
  /**
   * Retrieves events filtered by a specific category
   * @param {string} category - The category name to filter by
   * @returns {Promise<Object>} Promise resolving to array of events in the specified category
   */
  getEventsByCategory: category => api.get(`${API.ENDPOINTS.EVENTS}/category?name=${encodeURIComponent(category)}`),
  
  /**
   * Retrieves events filtered by difficulty level
   * @param {number} level - The difficulty level to filter by
   * @returns {Promise<Object>} Promise resolving to array of events at the specified difficulty
   */
  getEventsByDifficulty: level => api.get(`${API.ENDPOINTS.EVENTS}/difficulty/${level}`),

  /**
   * Retrieves all available event categories
   * @returns {Promise<Object>} Promise resolving to array of available categories
   */
  getCategories: () => api.get(API.ENDPOINTS.CATEGORIES),

  /**
   * Creates a new game session with specified settings
   * @param {Object} settings - Game session configuration object
   * @param {string} settings.playerName - Name of the player
   * @param {string[]} settings.categories - Selected game categories
   * @param {number} settings.difficulty - Game difficulty level
   * @param {number} settings.cardCount - Number of cards in the game
   * @returns {Promise<Object>} Promise resolving to created game session data
   */
  createGameSession: (settings) => api.post(API.ENDPOINTS.GAME_SESSIONS, settings),
  
  /**
   * Retrieves details of a specific game session
   * @param {string} sessionId - Unique identifier of the game session
   * @returns {Promise<Object>} Promise resolving to game session details
   */
  getGameSession: (sessionId) => api.get(`${API.ENDPOINTS.GAME_SESSIONS}/${sessionId}`),
  
  /**
   * Records a player move in a game session
   * @param {string} sessionId - Unique identifier of the game session
   * @param {Object} move - Move data object
   * @param {number} move.cardId - ID of the card being placed
   * @param {number} move.position - Position where card is placed
   * @param {boolean} move.isCorrect - Whether the placement was correct
   * @returns {Promise<Object>} Promise resolving to move recording confirmation
   */
  recordMove: (sessionId, move) => api.post(`${API.ENDPOINTS.GAME_SESSIONS}/${sessionId}/moves`, move),
  
  /**
   * Marks a game session as completed with final results
   * @param {string} sessionId - Unique identifier of the game session
   * @param {Object} result - Final game results
   * @param {number} result.score - Final game score
   * @param {number} result.correctMoves - Number of correct moves
   * @param {number} result.totalMoves - Total number of moves
   * @returns {Promise<Object>} Promise resolving to completion confirmation
   */
  completeGame: (sessionId, result) => api.put(`${API.ENDPOINTS.GAME_SESSIONS}/${sessionId}/complete`, result),
  
  /**
   * Retrieves game session history for a specific player
   * @param {string} playerName - Name of the player
   * @param {number} [limit=10] - Maximum number of sessions to retrieve
   * @returns {Promise<Object>} Promise resolving to array of player's game sessions
   */
  getGameSessionHistory: (playerName, limit = 10) => 
    api.get(`${API.ENDPOINTS.GAME_SESSIONS}/history?player=${encodeURIComponent(playerName)}&limit=${limit}`),

  // Statistics
  getPlayerStatistics: (playerName) => api.get(`${API.ENDPOINTS.STATISTICS}/player/${encodeURIComponent(playerName)}`),
  getPlayerCategoryStatistics: (playerName, category = null) => {
    const url = category 
      ? `${API.ENDPOINTS.STATISTICS}/player/${encodeURIComponent(playerName)}/categories?category=${encodeURIComponent(category)}`
      : `${API.ENDPOINTS.STATISTICS}/player/${encodeURIComponent(playerName)}/categories`;
    return api.get(url);
  },

  // Admin Card Management
  getAdminCards: (params = '') => api.get(`/admin/cards${params ? `?${params}` : ''}`),
  createAdminCard: (cardData) => api.post('/admin/cards', cardData),
  updateAdminCard: (cardId, cardData) => api.put(`/admin/cards/${cardId}`, cardData),
  deleteAdminCard: (cardId) => api.delete(`/admin/cards/${cardId}`),
  bulkCreateAdminCards: (cardsData) => api.post('/admin/cards/bulk', cardsData),
  getPlayerDifficultyStatistics: (playerName, level = null) => {
    const url = level 
      ? `${API.ENDPOINTS.STATISTICS}/player/${encodeURIComponent(playerName)}/difficulty?level=${encodeURIComponent(level)}`
      : `${API.ENDPOINTS.STATISTICS}/player/${encodeURIComponent(playerName)}/difficulty`;
    return api.get(url);
  },
  getPlayerProgress: (playerName) => api.get(`${API.ENDPOINTS.STATISTICS}/player/${encodeURIComponent(playerName)}/progress`),
  getPlayerDailyStats: (playerName, days = 30) => api.get(`${API.ENDPOINTS.STATISTICS}/player/${encodeURIComponent(playerName)}/daily?days=${days}`),
  getPlayerWeeklyStats: (playerName, weeks = 12) => api.get(`${API.ENDPOINTS.STATISTICS}/player/${encodeURIComponent(playerName)}/weekly?weeks=${weeks}`),
  getPlayerSummary: (playerName) => api.get(`${API.ENDPOINTS.STATISTICS}/player/${encodeURIComponent(playerName)}/summary`),
  getPlayerComparison: (players) => api.get(`${API.ENDPOINTS.STATISTICS}/players?players=${players.map(p => encodeURIComponent(p)).join(',')}`),

  // Leaderboards
  getGlobalLeaderboard: (sortBy = 'score', sortOrder = 'desc', limit = 100) => 
    api.get(`${API.ENDPOINTS.STATISTICS}/leaderboards/global?sort_by=${sortBy}&sort_order=${sortOrder}&limit=${limit}`),
  getCategoryLeaderboard: (category, sortBy = 'score', sortOrder = 'desc', limit = 100) => 
    api.get(`${API.ENDPOINTS.STATISTICS}/leaderboards/category/${encodeURIComponent(category)}?sort_by=${sortBy}&sort_order=${sortOrder}&limit=${limit}`),
  getDailyLeaderboard: (limit = 100) => api.get(`${API.ENDPOINTS.STATISTICS}/leaderboards/daily?limit=${limit}`),
  getWeeklyLeaderboard: (limit = 100) => api.get(`${API.ENDPOINTS.STATISTICS}/leaderboards/weekly?limit=${limit}`),
  getPlayerRankings: (playerName) => api.get(`${API.ENDPOINTS.STATISTICS}/leaderboards/player/${encodeURIComponent(playerName)}`),
  getLeaderboardSummary: () => api.get(`${API.ENDPOINTS.STATISTICS}/leaderboards/summary`),

  // Analytics
  getAnalyticsOverview: () => api.get(`${API.ENDPOINTS.ANALYTICS}/overview`),
  getAnalyticsTrends: (timePeriod = '30d') => api.get(`${API.ENDPOINTS.ANALYTICS}/trends?time_period=${timePeriod}`),
  getDifficultyAnalytics: (level) => api.get(`${API.ENDPOINTS.ANALYTICS}/difficulty/${encodeURIComponent(level)}`),
  getCategoryAnalytics: (category) => api.get(`${API.ENDPOINTS.ANALYTICS}/category/${encodeURIComponent(category)}`),
};

/**
 * Helper function to extract data from API response objects
 * Handles different response formats by checking for nested data properties
 * @param {Object} response - Axios response object
 * @param {Object} response.data - Response data object
 * @returns {*} The actual data payload from the response
 */
export const extractData = response => {
  return response.data?.data || response.data;
};

/**
 * Helper function for consistent error handling in React components
 * Extracts meaningful error messages from API errors with fallback support
 * @param {Error} error - Error object from API call
 * @param {string} [fallbackMessage='Something went wrong'] - Default message if no specific error message available
 * @returns {string} Human-readable error message for display to users
 */
export const handleAPIError = (
  error,
  fallbackMessage = 'Something went wrong'
) => {
  return error.message || fallbackMessage;
};

export default api;
