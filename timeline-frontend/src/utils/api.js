// API utilities for the timeline game
// This is a stub file to resolve import issues in tests

/**
 * Make API calls to the backend
 * @param {string} endpoint - The API endpoint
 * @param {Object} options - Request options
 * @returns {Promise} - API response
 */
export const apiCall = async (endpoint, options = {}) => {
  // Stub implementation for testing
  console.log(`API call to ${endpoint}`, options);
  return Promise.resolve({ success: true });
};

/**
 * Get game state from backend
 * @returns {Promise} - Game state
 */
export const getGameState = async () => {
  return apiCall('/game/state');
};

/**
 * Submit card placement to backend
 * @param {Object} placement - Card placement data
 * @returns {Promise} - Placement result
 */
export const submitCardPlacement = async (placement) => {
  return apiCall('/game/place-card', {
    method: 'POST',
    body: JSON.stringify(placement)
  });
};

/**
 * Get new game from backend
 * @returns {Promise} - New game data
 */
export const getNewGame = async () => {
  return apiCall('/game/new');
};

// Mock API object that GameControls.jsx expects
export const gameAPI = {
  healthCheck: () => Promise.resolve({ data: { status: 'ok' } }),
  getAllEvents: () => Promise.resolve({ data: { data: [] } }),
  getRandomEvents: (count = 5) => Promise.resolve({ 
    data: { 
      data: Array.from({ length: count }, (_, i) => ({
        id: `event-${i}`,
        title: `Test Event ${i}`,
        year: 1900 + i,
        description: `Test description ${i}`
      }))
    } 
  }),
  getEventsByCategory: (category) => Promise.resolve({ data: { data: [] } }),
  getEventsByDifficulty: (level) => Promise.resolve({ data: { data: [] } }),
  getCategories: () => Promise.resolve({ data: { data: [] } })
};

/**
 * Helper function to extract data from API response
 * @param {Object} response - API response
 * @returns {*} - Extracted data
 */
export const extractData = (response) => {
  return response.data?.data || response.data || response;
};

/**
 * Helper function for error handling in components
 * @param {Error} error - Error object
 * @param {string} fallbackMessage - Fallback error message
 * @returns {string} - Error message
 */
export const handleAPIError = (error, fallbackMessage = 'Something went wrong') => {
  console.error('API Error:', error);
  return error.message || fallbackMessage;
};

export default {
  apiCall,
  getGameState,
  submitCardPlacement,
  getNewGame,
  gameAPI,
  extractData,
  handleAPIError
};
