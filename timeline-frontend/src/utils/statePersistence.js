/**
 * State Persistence Utilities
 * 
 * Handles saving, loading, and clearing game state from localStorage
 * with proper error handling, versioning, and fallbacks.
 */

const STORAGE_KEY = 'timelineGameState-v1.0.0';
const VERSION = '1.0.0';

// Cache storage availability to avoid repeated checks
let storageCache = null;
let localStorageAvailable = null;
let sessionStorageAvailable = null;

/**
 * Check if localStorage is available
 * @returns {boolean}
 */
const isLocalStorageAvailable = () => {
  if (localStorageAvailable !== null) {
    return localStorageAvailable;
  }
  
  try {
    // Check if localStorage exists and is accessible
    if (typeof localStorage === 'undefined') {
      localStorageAvailable = false;
      return false;
    }
    
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    localStorageAvailable = true;
    return true;
  } catch (e) {
    localStorageAvailable = false;
    return false;
  }
};

/**
 * Check if sessionStorage is available
 * @returns {boolean}
 */
const isSessionStorageAvailable = () => {
  if (sessionStorageAvailable !== null) {
    return sessionStorageAvailable;
  }
  
  try {
    // Check if sessionStorage exists and is accessible
    if (typeof sessionStorage === 'undefined') {
      sessionStorageAvailable = false;
      return false;
    }
    
    const test = '__sessionStorage_test__';
    sessionStorage.setItem(test, test);
    sessionStorage.removeItem(test);
    sessionStorageAvailable = true;
    return true;
  } catch (e) {
    sessionStorageAvailable = false;
    return false;
  }
};

/**
 * Get the appropriate storage object (cached)
 * @returns {Storage|null}
 */
const getStorage = () => {
  if (storageCache !== null) {
    return storageCache;
  }

  if (isLocalStorageAvailable()) {
    storageCache = localStorage;
    return storageCache;
  }
  if (isSessionStorageAvailable()) {
    console.warn('localStorage not available, falling back to sessionStorage');
    storageCache = sessionStorage;
    return storageCache;
  }
  console.warn('No storage available');
  storageCache = null;
  return null;
};

/**
 * Reset storage cache (useful for testing)
 */
export const resetStorageCache = () => {
  storageCache = null;
  localStorageAvailable = null;
  sessionStorageAvailable = null;
};

/**
 * Save game state to storage
 * @param {Object} state - The game state to save
 * @returns {boolean} - Success status
 */
export const saveGameStateToStorage = (state) => {
  try {
    const storage = getStorage();
    if (!storage) {
      return false;
    }

    // Filter out UI-only and transient state
    const stateToPersist = {
      version: VERSION,
      timestamp: Date.now(),
      // Core game data
      timeline: state.timeline,
      playerHand: state.playerHand,
      cardPool: state.cardPool,
      
      // Game status
      gameStatus: state.gameStatus,
      gameMode: state.gameMode,
      difficulty: state.difficulty,
      
      // Game metrics
      score: state.score,
      attempts: state.attempts,
      startTime: state.startTime,
      turnStartTime: state.turnStartTime,
      gameStats: state.gameStats,
      
      // Advanced features
      timelineAnalysis: state.timelineAnalysis,
      turnHistory: state.turnHistory,
      achievements: state.achievements,
      
      selectedCard: state.selectedCard
    };

    const serializedState = JSON.stringify(stateToPersist);
    
    // Check storage quota
    if (serializedState.length > 4.5 * 1024 * 1024) { // 4.5MB limit
      console.warn('Game state too large for storage, clearing old data');
      // Clear old data directly instead of calling clearGameStateFromStorage
      try {
        storage.removeItem(STORAGE_KEY);
      } catch (clearError) {
        console.error('❌ Error clearing old data:', clearError);
      }
      return false;
    }

    storage.setItem(STORAGE_KEY, serializedState);
    return true;
  } catch (error) {
    console.error('❌ Error saving game state:', error);
    return false;
  }
};

/**
 * Load game state from storage
 * @returns {Object|null} - The loaded state or null if not found/invalid
 */
export const loadGameStateFromStorage = () => {
  try {
    const storage = getStorage();
    if (!storage) {
      return null;
    }

    const serializedState = storage.getItem(STORAGE_KEY);
    if (!serializedState) {
      return null;
    }

    const loadedState = JSON.parse(serializedState);
    
    // Validate version
    if (loadedState.version !== VERSION) {
      console.warn(`Version mismatch: expected ${VERSION}, got ${loadedState.version}`);
      // For now, we'll ignore version mismatches and try to load anyway
      // In the future, we could implement migration logic here
    }

    // Validate required fields
    const requiredFields = ['timeline', 'playerHand', 'gameStatus'];
    for (const field of requiredFields) {
      if (!(field in loadedState)) {
        console.warn(`Missing required field: ${field}`);
        return null;
      }
    }

    return loadedState;
  } catch (error) {
    console.error('❌ Error loading game state:', error);
    // Clear corrupted data directly instead of calling clearGameStateFromStorage
    try {
      const storage = getStorage();
      if (storage) {
        storage.removeItem(STORAGE_KEY);
      }
    } catch (clearError) {
      console.error('❌ Error clearing corrupted data:', clearError);
    }
    return null;
  }
};

/**
 * Clear game state from storage
 * @returns {boolean} - Success status
 */
export const clearGameStateFromStorage = () => {
  try {
    const storage = getStorage();
    if (!storage) {
      return false;
    }

    storage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('❌ Error clearing game state:', error);
    return false;
  }
};

/**
 * Check if there's a saved game state
 * @returns {boolean}
 */
export const hasSavedGameState = () => {
  try {
    const storage = getStorage();
    if (!storage) {
      return false;
    }

    return storage.getItem(STORAGE_KEY) !== null;
  } catch (error) {
    console.error('❌ Error checking saved game state:', error);
    return false;
  }
};

/**
 * Get storage info for debugging
 * @returns {Object}
 */
export const getStorageInfo = () => {
  const storage = getStorage();
  if (!storage) {
    return { available: false };
  }

  try {
    const serializedState = storage.getItem(STORAGE_KEY);
    return {
      available: true,
      hasSavedState: serializedState !== null,
      stateSize: serializedState ? serializedState.length : 0,
      storageType: storage === localStorage ? 'localStorage' : 'sessionStorage'
    };
  } catch (error) {
    return { available: true, error: error.message };
  }
}; 