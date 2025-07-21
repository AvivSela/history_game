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
const retryConfig = {
  retries: API.RETRY_ATTEMPTS,
  retryDelay: API.RETRY_DELAY,
  maxRetryDelay: API.MAX_RETRY_DELAY,
  retryCondition: (error) => {
    // Retry on network errors or 5xx server errors
    return (
      !error.response ||
      (error.response.status >= 500 && error.response.status < 600) ||
      error.code === 'ECONNABORTED'
    );
  },
};

// Request interceptor for logging
api.interceptors.request.use(
  config => {
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor for enhanced error handling
api.interceptors.response.use(
  response => {
    return response;
  },
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

// API methods
export const gameAPI = {
  // Health check
  healthCheck: () => api.get(API.ENDPOINTS.HEALTH),

  // Events
  getAllEvents: () => api.get(API.ENDPOINTS.EVENTS),
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
  getEventsByCategory: category => api.get(`${API.ENDPOINTS.EVENTS}/category?name=${encodeURIComponent(category)}`),
  getEventsByDifficulty: level => api.get(`${API.ENDPOINTS.EVENTS}/difficulty/${level}`),

  // Categories
  getCategories: () => api.get(API.ENDPOINTS.CATEGORIES),

  // Game Sessions
  createGameSession: (settings) => api.post(API.ENDPOINTS.GAME_SESSIONS, settings),
  getGameSession: (sessionId) => api.get(`${API.ENDPOINTS.GAME_SESSIONS}/${sessionId}`),
  recordMove: (sessionId, move) => api.post(`${API.ENDPOINTS.GAME_SESSIONS}/${sessionId}/moves`, move),
  completeGame: (sessionId, result) => api.put(`${API.ENDPOINTS.GAME_SESSIONS}/${sessionId}/complete`, result),
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

// Helper function to extract data from API response
export const extractData = response => {
  return response.data?.data || response.data;
};

// Helper function for error handling in components
export const handleAPIError = (
  error,
  fallbackMessage = 'Something went wrong'
) => {
  return error.message || fallbackMessage;
};

export default api;
