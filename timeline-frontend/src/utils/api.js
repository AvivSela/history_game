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
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message);
    
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
      throw new Error('Unable to connect to server. Please check your connection.');
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
  getEventsByCategory: (category) => api.get(`/events/category/${category}`),
  getEventsByDifficulty: (level) => api.get(`/events/difficulty/${level}`),
  
  // Categories
  getCategories: () => api.get('/categories'),
};

// Helper function to extract data from API response
export const extractData = (response) => {
  return response.data?.data || response.data;
};

// Helper function for error handling in components
export const handleAPIError = (error, fallbackMessage = 'Something went wrong') => {
  console.error('API Error:', error);
  return error.message || fallbackMessage;
};

export default api;
