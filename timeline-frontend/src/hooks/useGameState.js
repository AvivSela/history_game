import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  calculateScore, 
  checkWinCondition, 
  createGameSession 
} from '../utils/gameLogic';
import { 
  validatePlacementWithTolerance, 
  generateSmartInsertionPoints
} from '../utils/timelineLogic';
import { GAME_STATUS, PLAYER_TYPES, TIMING, GAME_LOGIC, CARD_COUNTS, POOL_CARD_COUNT, DIFFICULTY_LEVELS } from '../constants/gameConstants';
import { gameAPI, extractData, handleAPIError } from '@utils/api.js';
import { SettingsManager } from '../utils/settingsManager.js';

import { 
  saveGameStateToStorage, 
  loadGameStateFromStorage, 
  clearGameStateFromStorage,
  hasSavedGameState 
} from '../utils/statePersistence.js';

/**
 * useGameState - Comprehensive game state management hook with settings integration
 * 
 * This hook provides complete game state management for the Timeline Game, including
 * game initialization, turn management, card placement validation, score calculation,
 * and win condition checking. It integrates with the settings system to apply user
 * preferences for difficulty, card count, categories, and other game settings.
 * 
 * Key features:
 * - Game session initialization and management with settings integration
 * - Card selection and placement logic
 * - Single-player gameplay
 * - Score calculation and game statistics tracking
 * - Win condition validation and game state transitions
 * - Error handling and loading states
 * - Card pool management for replacement cards
 * - Settings-based game configuration
 * 
 * @example
 * ```jsx
 * const {
 *   state,
 *   initializeGame,
 *   selectCard,
 *   placeCard,
 *   restartGame,
 *   pauseGame
 * } = useGameState();
 * 
 * // Initialize a new game with settings
 * await initializeGame('single', 'medium');
 * 
 * // Select a card
 * selectCard(card);
 * 
 * // Place card at position
 * placeCard(2);
 * ```
 * 
 * @returns {Object} Game state management object
 * @returns {Object} returns.state - Current game state
 * @returns {Function} returns.initializeGame - Initialize new game session
 * @returns {Function} returns.selectCard - Select a card from hand
 * @returns {Function} returns.placeCard - Place card on timeline
 * @returns {Function} returns.restartGame - Restart current game
 * @returns {Function} returns.pauseGame - Pause/unpause game
 * @returns {Function} returns.getGameStats - Get current game statistics
 * @returns {Function} returns.getNewCardFromPool - Get replacement card from pool
 * @returns {Object} returns.settings - Current game settings
 * @returns {Function} returns.updateGameSettings - Update game settings
 */
export const useGameState = () => {
  const [state, setState] = useState({
    // Core game data
    timeline: [],
    playerHand: [],
    cardPool: [], // Added: Card pool for replacement cards
    
    // Game status
    gameStatus: GAME_STATUS.LOBBY,
    gameMode: 'single', // 'single' only
    difficulty: 'medium', // 'easy', 'medium', 'hard'
    
    // UI state
    selectedCard: null,
    showInsertionPoints: false,
    feedback: null,
    isLoading: false,
    error: null,
    
    // Game metrics
    score: { human: 0 },
    attempts: {},
    startTime: null,
    turnStartTime: null,
    gameStats: {
      totalMoves: 0,
      correctMoves: 0,
      hintsUsed: 0,
      averageTimePerMove: 0
    },
    
    // Advanced features
    insertionPoints: [],
    timelineAnalysis: null,
    turnHistory: [],
    achievements: []
  });

  // Settings integration
  const [settings, setSettings] = useState({
    difficulty: DIFFICULTY_LEVELS.MEDIUM,
    cardCount: CARD_COUNTS.SINGLE,
    categories: [],
    animations: true,
    soundEffects: true,
    reducedMotion: false,
    highContrast: false,
    largeText: false,
    screenReaderSupport: true,
    autoSave: true,
    performanceMode: false
  });

  const gameSessionRef = useRef(null);
  const restartTimeoutRef = useRef(null);
  const settingsManagerRef = useRef(null);
  const stateRef = useRef(state);

  // Keep stateRef up to date
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  /**
   * Apply settings changes to active game
   * @param {string} key - Setting key that changed
   * @param {*} newValue - New setting value
   */
  const applySettingsToActiveGame = useCallback((key, newValue) => {
    switch (key) {
      case 'difficulty':
        // Update difficulty tolerance for current game
        setState(prev => ({
          ...prev,
          difficulty: newValue
        }));
        break;
        
      case 'animations':
      case 'reducedMotion':
        // These settings affect UI behavior but not game logic
        // They're handled by the animation system
        break;
        
      case 'autoSave':
        // Auto-save setting affects persistence behavior
        // Handled by the persistence system
        break;
        
      default:
        // Other settings don't affect active game
        break;
    }
  }, []);

  // Initialize settings manager
  useEffect(() => {
    try {
      settingsManagerRef.current = new SettingsManager();
      
      // Load initial settings
      const initialSettings = settingsManagerRef.current.getSettings();
      setSettings(initialSettings);
      
      // Listen for settings changes
      const handleSettingsChange = (key, newValue, oldValue) => {
        setSettings(prev => ({ ...prev, [key]: newValue }));
        
        // Apply settings changes to active game if relevant
        if (stateRef.current.gameStatus === GAME_STATUS.PLAYING || stateRef.current.gameStatus === GAME_STATUS.PAUSED) {
          applySettingsToActiveGame(key, newValue);
        }
      };
      
      settingsManagerRef.current.onChange(handleSettingsChange);
    } catch (error) {
      // Continue with default settings
    }
  }, [applySettingsToActiveGame]);

  // Load saved game state on mount
  useEffect(() => {
    const loadSavedState = () => {
      try {
        const savedState = loadGameStateFromStorage();
        if (savedState && savedState.gameStatus !== 'lobby') {
          setState(prev => ({
            ...prev,
            ...savedState,
            // Reset UI-only state
            showInsertionPoints: false,
            feedback: null,
            isLoading: false,
            error: null,
            insertionPoints: []
          }));
        }
      } catch (error) {
        // Error loading saved state
      }
    };

    loadSavedState();
  }, []);

  // Save state to storage whenever relevant state changes
  useEffect(() => {
    // Only save if game is in progress and auto-save is enabled
    if ((state.gameStatus === 'playing' || state.gameStatus === 'paused') && settings.autoSave) {
      saveGameStateToStorage(state);
    }
  }, [
    state.timeline,
    state.playerHand,
    state.cardPool,
    state.gameStatus,
    state.gameMode,
    state.difficulty,
    state.score,
    state.attempts,
    state.startTime,
    state.turnStartTime,
    state.gameStats,
    state.timelineAnalysis,
    state.turnHistory,
    state.achievements,
    state.selectedCard,
    settings.autoSave
  ]);

  /**
   * Get card count based on settings
   * @param {string} mode - Game mode
   * @returns {number} Card count for the game
   */
  const getCardCountFromSettings = useCallback((mode = 'single') => {
    // Use settings card count if available, otherwise fall back to constants
    return settings.cardCount || CARD_COUNTS.SINGLE;
  }, [settings.cardCount]);

  /**
   * Get difficulty from settings
   * @param {string} fallbackDifficulty - Fallback difficulty if settings not available
   * @returns {string} Difficulty level
   */
  const getDifficultyFromSettings = useCallback((fallbackDifficulty = 'medium') => {
    return settings.difficulty || fallbackDifficulty;
  }, [settings.difficulty]);

  /**
   * Get categories filter from settings
   * @returns {Array} Array of category filters
   */
  const getCategoriesFromSettings = useCallback(() => {
    return settings.categories || [];
  }, [settings.categories]);

  // Initialize new game - Consolidated from GameControls with settings integration
  const initializeGame = useCallback(async (mode = 'single', diff = null) => {
    try {
      // Clear any saved state when starting a new game
      clearGameStateFromStorage();
      
      setState(prev => ({ 
        ...prev, 
        isLoading: true, 
        error: null,
        gameStatus: GAME_STATUS.LOADING
      }));
      
      // Get settings-based configuration
      const cardCount = getCardCountFromSettings(mode);
      const difficulty = diff || getDifficultyFromSettings();
      const categories = getCategoriesFromSettings();
      

      
      // Fetch events from API with category filtering
      const response = await gameAPI.getRandomEvents(cardCount, categories);
      const events = extractData(response);
      
      // Fetch additional cards for the pool (for replacement when cards are placed incorrectly)
      const poolResponse = await gameAPI.getRandomEvents(POOL_CARD_COUNT, categories);
      const poolEvents = extractData(poolResponse);
      
      // Create game session with settings-based configuration
      const session = createGameSession(events, {
        cardCount: cardCount - 1,
        difficulty: difficulty,
        gameMode: mode
      });

      gameSessionRef.current = session;

      // All cards go to human player
      const humanCards = session.playerHand;

      setState(prev => ({
        ...prev,
        timeline: session.timeline,
        playerHand: humanCards,
        cardPool: poolEvents, // Added: Card pool
        gameStatus: 'playing',
        gameMode: mode,
        difficulty: difficulty,
        score: { human: 0 },
        startTime: session.startTime,
        turnStartTime: Date.now(),
        attempts: {},
        gameStats: {
          totalMoves: 0,
          correctMoves: 0,
          hintsUsed: 0,
          averageTimePerMove: 0
        },
        turnHistory: [],
        achievements: [],
        selectedCard: null,
        showInsertionPoints: false,
        feedback: null,
        insertionPoints: [],
        isLoading: false,
        error: null
      }));

      // Check for duplicate IDs
      const allCardIds = [
        ...session.timeline.map(card => card.id),
        ...humanCards.map(card => card.id)
      ];
      const uniqueIds = new Set(allCardIds);
      if (allCardIds.length !== uniqueIds.size) {
        // Duplicate card IDs detected in new game
      }

    } catch (error) {
      const errorMessage = handleAPIError(error, 'Failed to load game');
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
        gameStatus: 'error'
      }));
      throw error;
    }
  }, [getCardCountFromSettings, getDifficultyFromSettings, getCategoriesFromSettings]);



  // Clear saved game state
  const clearSavedGame = useCallback(() => {
    clearGameStateFromStorage();
  }, []);

  // Restart game
  const restartGame = useCallback(() => {
    
    // Clear any pending restart timeout
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    
    // Clear saved state when restarting
    clearGameStateFromStorage();
    
    setState(prev => {
      return {
        ...prev,
        // Clear all game data
        timeline: [],
        playerHand: [],
        cardPool: [],
        gameStatus: 'lobby',
        selectedCard: null,
        showInsertionPoints: false,
        feedback: null,
        error: null,
        score: { human: 0 },
        attempts: {},
        startTime: null,
        turnStartTime: null,
        gameStats: {
          totalMoves: 0,
          correctMoves: 0,
          hintsUsed: 0,
          averageTimePerMove: 0
        },
        insertionPoints: [],
        timelineAnalysis: null,
        turnHistory: [],
        achievements: []
      };
    });
  }, []);

  // Select a card
  const selectCard = useCallback((card) => {
    
    if (state.gameStatus !== 'playing') {
      return;
    }

    const insertionPoints = card ? 
      generateSmartInsertionPoints(state.timeline, card) : [];

    setState(prev => ({
      ...prev,
      selectedCard: card,
      showInsertionPoints: !!card,
      insertionPoints,
      feedback: null
    }));
  }, [state.gameStatus, state.timeline]);

  // Get new card from pool - Consolidated from GameControls
  const getNewCardFromPool = useCallback(async (currentGameState) => {
    // Gather all card IDs currently in the timeline and playerHand
    const timelineIds = new Set(currentGameState.timeline.map(card => card.id));
    const handIds = new Set(currentGameState.playerHand.map(card => card.id));
    const forbiddenIds = new Set([...timelineIds, ...handIds]);

    // Filter pool to only cards not in timeline or hand
    const availablePool = currentGameState.cardPool.filter(card => !forbiddenIds.has(card.id));

    if (availablePool.length > 0) {
      // Get a random card from the filtered pool
      const randomIndex = Math.floor(Math.random() * availablePool.length);
      const newCard = availablePool[randomIndex];
      // Remove the card from the pool
      const updatedPool = currentGameState.cardPool.filter(card => card.id !== newCard.id);
      
      return { newCard, updatedPool };
    }
    
    // If pool is empty, fetch more cards with category filtering
    try {
      const categories = getCategoriesFromSettings();
      const response = await gameAPI.getRandomEvents(CARD_COUNTS.SINGLE, categories);
      const newPoolCards = extractData(response);
      const newCard = newPoolCards[0];
      const updatedPool = [...currentGameState.cardPool, ...newPoolCards.slice(1)];
      
      return { newCard, updatedPool };
    } catch (error) {
      return null;
    }
  }, [getCategoriesFromSettings]);

  // Place a card on the timeline
  const placeCard = useCallback(async (position, player = 'human') => {
    
    if (!state.selectedCard || state.gameStatus !== 'playing') {
      return { success: false, reason: 'invalid_state' };
    }

    const selectedCard = state.selectedCard;

    try {
      // Validate placement
      const validation = validatePlacementWithTolerance(selectedCard, state.timeline, position);

      if (validation.isCorrect) {
        
        // Update timeline
        const newTimeline = [...state.timeline];
        newTimeline.splice(position, 0, selectedCard);

        // Remove card from player's hand
        const newPlayerHand = state.playerHand.filter(card => card.id !== selectedCard.id);

        // Calculate score
        const scoreEarned = calculateScore(validation);
        const newScore = { ...state.score, human: state.score.human + scoreEarned };

        // Update attempts
        const newAttempts = { ...state.attempts };
        if (!newAttempts[selectedCard.id]) {
          newAttempts[selectedCard.id] = 0;
        }
        newAttempts[selectedCard.id]++;

        // Check win condition
        const isGameWon = newPlayerHand.length === 0;

        const newGameState = {
          ...state,
          timeline: newTimeline,
          playerHand: newPlayerHand,
          score: newScore,
          attempts: newAttempts,
          selectedCard: null,
          showInsertionPoints: false,
          gameStats: {
            ...state.gameStats,
            totalMoves: state.gameStats.totalMoves + 1,
            correctMoves: state.gameStats.correctMoves + 1
          },
          feedback: {
            type: 'success',
            message: validation.feedback,
            points: scoreEarned
          }
        };

        if (isGameWon) {
          newGameState.gameStatus = 'won';
        }

        setState(newGameState);
        saveGameStateToStorage(newGameState);

        // If game is won, show feedback and restart after delay
        if (isGameWon) {
          // Clear any existing restart timeout
          if (restartTimeoutRef.current) {
            clearTimeout(restartTimeoutRef.current);
          }
          // Set new restart timeout
          restartTimeoutRef.current = setTimeout(() => {
            restartGame();
          }, 3000);
        }

        return { 
          success: true, 
          isCorrect: true, 
          cardReplaced: null,
          validation 
        };
      } else {
        
        // Calculate score for incorrect placement (usually 0 or negative)
        const scoreEarned = calculateScore(validation);
        const newScore = { ...state.score, human: state.score.human + scoreEarned };

        // Update attempts
        const newAttempts = { ...state.attempts };
        if (!newAttempts[selectedCard.id]) {
          newAttempts[selectedCard.id] = 0;
        }
        newAttempts[selectedCard.id]++;

        // Get a new card from the pool to replace the incorrectly placed card
        const cardReplacement = await getNewCardFromPool(state);
        let newPlayerHand = [...state.playerHand];
        let newCardPool = [...state.cardPool];

        if (cardReplacement) {
          // Replace the incorrectly placed card with the new card
          newPlayerHand = newPlayerHand.map(card => 
            card.id === selectedCard.id ? cardReplacement.newCard : card
          );
          newCardPool = cardReplacement.updatedPool;
        } else {
          // Continue to next position
        }

        // Update game state for incorrect placement
        const newGameState = {
          ...state,
          playerHand: newPlayerHand,
          cardPool: newCardPool,
          score: newScore,
          attempts: newAttempts,
          selectedCard: null,
          showInsertionPoints: false,
          gameStats: {
            ...state.gameStats,
            totalMoves: state.gameStats.totalMoves + 1
          },
          feedback: {
            type: 'error',
            message: validation.feedback,
            correctPosition: validation.correctPosition,
            attempts: newAttempts[selectedCard.id]
          }
        };

        setState(newGameState);
        saveGameStateToStorage(newGameState);

        // Clear feedback after delay
        setTimeout(() => {
          setState(prev => ({ ...prev, feedback: null }));
        }, 3000);

        return { 
          success: true, 
          isCorrect: false, 
          cardReplaced: cardReplacement?.newCard || null,
          validation,
          newCardPool: newCardPool
        };
      }
    } catch (error) {
      return { success: false, reason: 'error', error: error.message };
    }
  }, [state, validatePlacementWithTolerance, calculateScore, saveGameStateToStorage, restartGame, getNewCardFromPool]);

  // Pause/Resume game
  const togglePause = useCallback(() => {
    setState(prev => ({
      ...prev,
      gameStatus: prev.gameStatus === 'playing' ? 'paused' : 'playing'
    }));
  }, []);

  return {
    // State
    state,
    gameState: state, // Alias for backward compatibility
    
    // Actions
    initializeGame,
    selectCard,
    placeCard,
    restartGame,
    togglePause,
    getNewCardFromPool,
    clearSavedGame,
    
    // Persistence
    hasSavedGame: () => hasSavedGameState(),
    
    // Computed values
    isPlayerTurn: true, // Always player's turn in single-player mode
    canSelectCard: state.gameStatus === 'playing',
    canPlaceCard: state.selectedCard && state.gameStatus === 'playing',
    gameProgress: {
      human: state.playerHand.length === 0 ? 1 : (4 - state.playerHand.length) / 4
    },
    
    // Settings integration
    settings,
    updateGameSettings: (newSettings) => {
      if (settingsManagerRef.current) {
        return settingsManagerRef.current.updateSettings(newSettings);
      } else {
        return false;
      }
    },
    updateGameSetting: (key, value) => {
      if (settingsManagerRef.current) {
        return settingsManagerRef.current.updateSetting(key, value);
      } else {
        return false;
      }
    },
    getGameSettings: () => {
      if (settingsManagerRef.current) {
        return settingsManagerRef.current.getSettings();
      } else {
        return settings;
      }
    }
  };
};

// Helper functions
const getDifficultyTolerance = (difficulty) => {
  switch (difficulty) {
    case 'easy': return 0.8;
    case 'medium': return 0.5;
    case 'hard': return 0.2;
    default: return 0.5;
  }
};

const calculateAverageTime = (gameStats, newTime) => {
  const totalMoves = gameStats.totalMoves + 1;
  const currentTotal = gameStats.averageTimePerMove * gameStats.totalMoves;
  return (currentTotal + newTime) / totalMoves;
};