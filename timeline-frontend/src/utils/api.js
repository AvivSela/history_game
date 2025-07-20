import axios from 'axios';
import { API } from '../constants/gameConstants';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API.BASE_URL,
  timeout: API.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  config => {
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      switch (status) {
        case API.STATUS_CODES.NOT_FOUND:
          throw new Error('Resource not found');
        case API.STATUS_CODES.INTERNAL_SERVER_ERROR:
          throw new Error('Server error. Please try again later.');
        default:
          throw new Error(data?.error || 'An unexpected error occurred');
      }
    } else if (error.request) {
      // Request was made but no response received
      throw new Error(
        'Unable to connect to server. Please check your connection.'
      );
    } else {
      // Something else happened
      throw new Error('An unexpected error occurred');
    }
  }
);

// API methods
export const gameAPI = {
  // Health check
  healthCheck: () => api.get('/health'),

  // Events
  getAllEvents: () => api.get('/events'),
  getRandomEvents: (count = 5, categories = []) => {
    const params = new URLSearchParams();
    if (categories && categories.length > 0) {
      params.append('categories', categories.join(','));
    }
    const queryString = params.toString();
    const url = `/events/random/${count}${queryString ? `?${queryString}` : ''}`;
    return api.get(url);
  },
  getEventsByCategory: category => api.get(`/events/category/${category}`),
  getEventsByDifficulty: level => api.get(`/events/difficulty/${level}`),

  // Categories
  getCategories: () => api.get('/categories'),

  // Statistics
  getPlayerStatistics: (playerName) => api.get(`/statistics/player/${playerName}`),
  getPlayerCategoryStatistics: (playerName, category = null) => {
    const url = category 
      ? `/statistics/player/${playerName}/categories?category=${category}`
      : `/statistics/player/${playerName}/categories`;
    return api.get(url);
  },
  getPlayerDifficultyStatistics: (playerName, level = null) => {
    const url = level 
      ? `/statistics/player/${playerName}/difficulty?level=${level}`
      : `/statistics/player/${playerName}/difficulty`;
    return api.get(url);
  },
  getPlayerProgress: (playerName) => api.get(`/statistics/player/${playerName}/progress`),
  getPlayerDailyStats: (playerName, days = 30) => api.get(`/statistics/player/${playerName}/daily?days=${days}`),
  getPlayerWeeklyStats: (playerName, weeks = 12) => api.get(`/statistics/player/${playerName}/weekly?weeks=${weeks}`),
  getPlayerSummary: (playerName) => api.get(`/statistics/player/${playerName}/summary`),
  getPlayerComparison: (players) => api.get(`/statistics/players?players=${players.join(',')}`),

  // Leaderboards
  getGlobalLeaderboard: (sortBy = 'score', sortOrder = 'desc', limit = 100) => 
    api.get(`/statistics/leaderboards/global?sort_by=${sortBy}&sort_order=${sortOrder}&limit=${limit}`),
  getCategoryLeaderboard: (category, sortBy = 'score', sortOrder = 'desc', limit = 100) => 
    api.get(`/statistics/leaderboards/category/${category}?sort_by=${sortBy}&sort_order=${sortOrder}&limit=${limit}`),
  getDailyLeaderboard: (limit = 100) => api.get(`/statistics/leaderboards/daily?limit=${limit}`),
  getWeeklyLeaderboard: (limit = 100) => api.get(`/statistics/leaderboards/weekly?limit=${limit}`),
  getPlayerRankings: (playerName) => api.get(`/statistics/leaderboards/player/${playerName}`),
  getLeaderboardSummary: () => api.get('/statistics/leaderboards/summary'),

  // Analytics
  getAnalyticsOverview: () => api.get('/analytics/overview'),
  getAnalyticsTrends: (timePeriod = '30d') => api.get(`/analytics/trends?time_period=${timePeriod}`),
  getDifficultyAnalytics: (level) => api.get(`/analytics/difficulty/${level}`),
  getCategoryAnalytics: (category) => api.get(`/analytics/category/${category}`),
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
