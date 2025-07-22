import { useState, useCallback, useRef, useEffect } from 'react';
import { calculateScore, createGameSession } from '../utils/gameLogic';
import {
  validatePlacementWithTolerance,
  generateSmartInsertionPoints,
} from '../utils/timelineLogic';
import {
  GAME_STATUS,
  PLAYER_TYPES,
  TIMING,
  GAME_LOGIC,
  CARD_COUNTS,
  POOL_CARD_COUNT,
  DIFFICULTY_LEVELS,
} from '../constants/gameConstants';
import { gameAPI, extractData, handleAPIError } from '@utils/api.js';
import { SettingsManager } from '../utils/settingsManager.js';

import {
  saveGameStateToStorage,
  loadGameStateFromStorage,
  clearGameStateFromStorage,
  hasSavedGameState,
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
 *   togglePause,
 *   getGameSettings
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
 * @returns {Function} returns.togglePause - Pause/unpause game
 * @returns {Function} returns.getGameStats - Get current game statistics
 * @returns {Function} returns.getNewCardFromPool - Get replacement card from pool
 * @returns {Object} returns.settings - Current game settings
 * @returns {Function} returns.updateGameSettings - Update game settings
 * @returns {Function} returns.getGameSettings - Get current game settings object
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
    difficulty: 3, // Average difficulty (will be updated from settings)

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
      averageTimePerMove: 0,
    },

    // Advanced features
    insertionPoints: [],
    timelineAnalysis: null,
    turnHistory: [],
    achievements: [],
  });

  // Settings integration
  const [settings, setSettings] = useState({
    difficulty: { min: 1, max: 4 }, // Default to medium range
    cardCount: CARD_COUNTS.SINGLE,
    categories: [],
    animations: true,
    soundEffects: true,
    reducedMotion: false,
    highContrast: false,
    largeText: false,
    screenReaderSupport: true,
    autoSave: true,
    performanceMode: false,
  });

  const gameSessionRef = useRef(null);
  const restartTimeoutRef = useRef(null);
  const feedbackTimeoutRef = useRef(null);
  const settingsManagerRef = useRef(null);
  const stateRef = useRef(state);

  // Keep stateRef up to date
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  /**
   * Apply settings changes to an active game session
   * Updates game state when settings are changed during gameplay to ensure
   * the game reflects current user preferences without requiring a restart
   *
   * @param {string} key - The setting key that was changed
   * @param {*} newValue - The new value for the setting
   *
   * @example
   * ```js
   * // When user changes difficulty setting during game
   * applySettingsToActiveGame('difficulty', {min: 2, max: 5});
   *
   * // When user toggles animations
   * applySettingsToActiveGame('animations', false);
   * ```
   */
  const applySettingsToActiveGame = useCallback((key, newValue) => {
    switch (key) {
      case 'difficulty':
        // Update difficulty tolerance for current game
        setState(prev => ({
          ...prev,
          difficulty: newValue,
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
      const handleSettingsChange = (key, newValue) => {
        setSettings(prev => ({ ...prev, [key]: newValue }));

        // Apply settings changes to active game if relevant
        if (
          stateRef.current.gameStatus === GAME_STATUS.PLAYING ||
          stateRef.current.gameStatus === GAME_STATUS.PAUSED
        ) {
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
    /**
     * Load saved game state from localStorage on component mount
     * Attempts to restore a previously saved game session if auto-save is enabled
     * Resets UI-only state while preserving game progress
     */
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
            insertionPoints: [],
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
    if (
      (state.gameStatus === 'playing' || state.gameStatus === 'paused') &&
      settings.autoSave
    ) {
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
    settings.autoSave,
  ]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
        feedbackTimeoutRef.current = null;
      }
    };
  }, []);

  /**
   * Get the number of cards to use in a game based on current settings
   * Retrieves the card count preference from user settings with fallback to default
   *
   * @returns {number} Number of cards to include in the game (typically 5-10)
   *
   * @example
   * ```js
   * const cardCount = getCardCountFromSettings();
   * // Returns: 8 (if user has set cardCount to 8 in settings)
   * // Returns: 5 (default fallback if no setting configured)
   * ```
   */
  const getCardCountFromSettings = useCallback(() => {
    // Use settings card count if available, otherwise fall back to constants
    return settings.cardCount || CARD_COUNTS.SINGLE;
  }, [settings.cardCount]);

  /**
   * Get the difficulty range configuration from user settings
   * Retrieves the min/max difficulty level preferences for filtering game events
   *
   * @param {Object} [fallbackRange={min: 1, max: 4}] - Default range if no settings available
   * @param {number} fallbackRange.min - Minimum difficulty level (1-5)
   * @param {number} fallbackRange.max - Maximum difficulty level (1-5)
   * @returns {Object} Difficulty range object with min and max properties
   * @returns {number} returns.min - Minimum difficulty level to include
   * @returns {number} returns.max - Maximum difficulty level to include
   *
   * @example
   * ```js
   * const range = getDifficultyFromSettings();
   * // Returns: {min: 2, max: 4} (medium difficulty range)
   *
   * const customRange = getDifficultyFromSettings({min: 4, max: 5});
   * // Returns: {min: 4, max: 5} (hard difficulty only)
   * ```
   */
  const getDifficultyFromSettings = useCallback(
    (fallbackRange = { min: 1, max: 4 }) => {
      return settings.difficulty || fallbackRange;
    },
    [settings.difficulty]
  );

  /**
   * Get the selected event categories from user settings
   * Retrieves which historical categories the user wants to include in their games
   *
   * @returns {string[]} Array of category names to include in the game
   *
   * @example
   * ```js
   * const categories = getCategoriesFromSettings();
   * // Returns: ['Science', 'Technology', 'Politics']
   * // Returns: [] (all categories if none specifically selected)
   * ```
   */
  const getCategoriesFromSettings = useCallback(() => {
    return settings.categories || [];
  }, [settings.categories]);

  /**
   * Initialize a new game session with backend API integration
   * Creates a new game session on the backend, fetches filtered events based on user
   * settings, sets up the initial timeline and player hand, and configures all
   * game state for a fresh game start
   *
   * @param {string} [mode='single'] - Game mode (currently only 'single' supported)
   * @param {Object|null} [diff=null] - Override difficulty range, uses settings if null
   * @param {number} diff.min - Minimum difficulty level
   * @param {number} diff.max - Maximum difficulty level
   * @throws {Error} If API calls fail or game initialization encounters errors
   *
   * @example
   * ```js
   * // Initialize with default settings
   * await initializeGame();
   *
   * // Initialize with custom difficulty
   * await initializeGame('single', {min: 3, max: 5});
   *
   * // Handle initialization errors
   * try {
   *   await initializeGame();
   * } catch (error) {
   *   console.error('Failed to start game:', error);
   * }
   * ```
   */
  const initializeGame = useCallback(
    async (mode = 'single', diff = null) => {
      try {
        // Clear any saved state when starting a new game
        clearGameStateFromStorage();

        setState(prev => ({
          ...prev,
          isLoading: true,
          error: null,
          gameStatus: GAME_STATUS.LOADING,
        }));

        // Get settings-based configuration
        const cardCount = getCardCountFromSettings();
        const difficultyRange = diff || getDifficultyFromSettings();
        const categories = getCategoriesFromSettings();

        // Use the middle of the difficulty range for game mechanics
        const averageDifficulty = Math.round((difficultyRange.min + difficultyRange.max) / 2);

        // Create game session on backend
        const sessionSettings = {
          player_name: 'Player', // TODO: Get from user settings
          difficulty_level: averageDifficulty,
          card_count: cardCount,
          categories: categories,
          difficulty_range: difficultyRange // Store the full range for filtering
        };

        const sessionResponse = await gameAPI.createGameSession(sessionSettings);
        const sessionData = extractData(sessionResponse);
        
        // Store session ID for future API calls
        gameSessionRef.current = {
          id: sessionData.session_id,
          settings: sessionSettings
        };

        // Fetch events from API with category and difficulty filtering
        const response = await gameAPI.getRandomEvents(cardCount, categories, difficultyRange);
        const events = extractData(response);

        // Fetch additional cards for the pool (for replacement when cards are placed incorrectly)
        const poolResponse = await gameAPI.getRandomEvents(
          POOL_CARD_COUNT,
          categories,
          difficultyRange
        );
        const poolEvents = extractData(poolResponse);

        // Create local game session with events
        const localSession = createGameSession(events, {
          cardCount: cardCount - 1,
          difficulty: averageDifficulty,
          gameMode: mode,
        });

        // All cards go to human player
        const humanCards = localSession.playerHand;

        setState(prev => ({
          ...prev,
          timeline: localSession.timeline,
          playerHand: humanCards,
          cardPool: poolEvents, // Added: Card pool
          gameStatus: 'playing',
          gameMode: mode,
          difficulty: averageDifficulty,
          difficultyRange: difficultyRange,
          score: { human: 0 },
          startTime: localSession.startTime,
          turnStartTime: Date.now(),
          attempts: {},
          gameStats: {
            totalMoves: 0,
            correctMoves: 0,
            hintsUsed: 0,
            averageTimePerMove: 0,
          },
          turnHistory: [],
          achievements: [],
          selectedCard: null,
          showInsertionPoints: false,
          feedback: null,
          insertionPoints: [],
          isLoading: false,
          error: null,
        }));

        // Check for duplicate IDs
        const allCardIds = [
          ...localSession.timeline.map(card => card.id),
          ...humanCards.map(card => card.id),
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
          gameStatus: 'error',
        }));
        throw error;
      }
    },
    [
      getCardCountFromSettings,
      getDifficultyFromSettings,
      getCategoriesFromSettings,
      clearGameStateFromStorage,
    ]
  );

  /**
   * Clear any saved game state from persistent storage
   * Removes saved game data from localStorage, useful for starting fresh
   * or when user wants to clear their saved progress
   *
   * @example
   * ```js
   * // Clear saved game when user starts new game
   * clearSavedGame();
   * ```
   */
  const clearSavedGame = useCallback(() => {
    clearGameStateFromStorage();
  }, []);

  /**
   * Restart the current game by resetting all game state to initial values
   * Clears the timeline, player hand, scores, and returns to lobby state
   * Also clears any saved game data and pending UI timeouts
   *
   * @example
   * ```js
   * // User clicks restart button
   * restartGame();
   *
   * // Automatically restart after game ends (if configured)
   * if (gameEnded) {
   *   setTimeout(restartGame, 3000);
   * }
   * ```
   */
  const restartGame = useCallback(() => {
    // Clear any pending timeouts
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = null;
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
          averageTimePerMove: 0,
        },
        insertionPoints: [],
        timelineAnalysis: null,
        turnHistory: [],
        achievements: [],
      };
    });
  }, []);

  /**
   * Select a card from the player's hand for placement
   * Highlights the selected card and generates insertion points on the timeline
   * to guide the player on where they can place the card
   *
   * @param {Object|null} card - The card to select, or null to deselect
   * @param {number} card.id - Unique identifier for the card
   * @param {string} card.title - Title of the historical event
   * @param {string} card.dateOccurred - ISO date string of when event occurred
   *
   * @example
   * ```js
   * // Select a card for placement
   * const moonLandingCard = {id: 1, title: 'Moon Landing', dateOccurred: '1969-07-20'};
   * selectCard(moonLandingCard);
   *
   * // Deselect current card
   * selectCard(null);
   * ```
   */
  const selectCard = useCallback(
    card => {
      if (state.gameStatus !== 'playing') {
        return;
      }

      const insertionPoints = card
        ? generateSmartInsertionPoints(state.timeline, card)
        : [];

      setState(prev => ({
        ...prev,
        selectedCard: card,
        showInsertionPoints: !!card,
        insertionPoints,
        feedback: null,
      }));
    },
    [state.gameStatus, state.timeline]
  );

  /**
   * Get a new card from the pool to replace an incorrectly placed card
   * First tries to get a card from the local pool, filtering out cards already
   * in play. If pool is empty, fetches new cards from the API with category filtering
   *
   * @param {Object} currentGameState - Current game state object
   * @param {Array} currentGameState.timeline - Cards currently on timeline
   * @param {Array} currentGameState.playerHand - Cards in player's hand
   * @param {Array} currentGameState.cardPool - Available replacement cards
   * @returns {Promise<Object|null>} Card replacement data or null if unavailable
   * @returns {Object} returns.newCard - The replacement card object
   * @returns {Array} returns.updatedPool - Pool with the selected card removed
   *
   * @example
   * ```js
   * // Get replacement card after incorrect placement
   * const replacement = await getNewCardFromPool(gameState);
   * if (replacement) {
   *   // Update hand with new card
   *   updatePlayerHand(replacement.newCard);
   * }
   * ```
   */
  const getNewCardFromPool = useCallback(
    async currentGameState => {
      // Gather all card IDs currently in the timeline and playerHand
      const timelineIds = new Set(
        currentGameState.timeline.map(card => card.id)
      );
      const handIds = new Set(currentGameState.playerHand.map(card => card.id));
      const forbiddenIds = new Set([...timelineIds, ...handIds]);

      // Filter pool to only cards not in timeline or hand
      const availablePool = currentGameState.cardPool.filter(
        card => !forbiddenIds.has(card.id)
      );

      if (availablePool.length > 0) {
        // Get a random card from the filtered pool
        const randomIndex = Math.floor(Math.random() * availablePool.length);
        const newCard = availablePool[randomIndex];
        // Remove the card from the pool
        const updatedPool = currentGameState.cardPool.filter(
          card => card.id !== newCard.id
        );

        return { newCard, updatedPool };
      }

      // If pool is empty, fetch more cards with category filtering
      try {
        const categories = getCategoriesFromSettings();
        const response = await gameAPI.getRandomEvents(
          CARD_COUNTS.SINGLE,
          categories
        );
        const newPoolCards = extractData(response);
        const newCard = newPoolCards[0];
        const updatedPool = [
          ...currentGameState.cardPool,
          ...newPoolCards.slice(1),
        ];

        return { newCard, updatedPool };
      } catch (error) {
        return null;
      }
    },
    [getCategoriesFromSettings]
  );

  /**
   * Place the currently selected card at a specific position on the timeline
   * Validates the placement, records the move with the backend API, calculates score,
   * and updates game state. Handles both correct and incorrect placements with
   * appropriate feedback and card replacement logic
   *
   * @param {number} position - Index position where to place the card on timeline
   * @returns {Promise<Object>} Result object indicating success and placement details
   * @returns {boolean} returns.success - Whether the placement operation succeeded
   * @returns {boolean} returns.isCorrect - Whether the placement was chronologically correct
   * @returns {Object|null} returns.cardReplaced - New card given for incorrect placement
   * @returns {Object} returns.validation - Detailed validation results
   * @returns {string} [returns.reason] - Error reason if success is false
   *
   * @example
   * ```js
   * // Place selected card at position 2
   * const result = await placeCard(2);
   * if (result.success && result.isCorrect) {
   *   console.log('Correct placement!');
   * } else if (result.success && !result.isCorrect) {
   *   console.log('Incorrect, got replacement:', result.cardReplaced);
   * }
   * ```
   */
  const placeCard = useCallback(
    async position => {
      if (!state.selectedCard || state.gameStatus !== 'playing') {
        return { success: false, reason: 'invalid_state' };
      }

      const selectedCard = state.selectedCard;

      try {
        // Validate placement
        const validation = validatePlacementWithTolerance(
          selectedCard,
          state.timeline,
          position
        );

        // Record move in backend if session exists
        if (gameSessionRef.current?.id) {
          try {
            const moveData = {
              card_id: selectedCard.id,
              position_before: 0, // Card starts in hand
              position_after: position,
              is_correct: validation.isCorrect,
              time_taken_seconds: Math.floor((Date.now() - state.turnStartTime) / 1000)
            };

            await gameAPI.recordMove(gameSessionRef.current.id, moveData);
          } catch (error) {
            // Log error but don't fail the game
            console.warn('Failed to record move in backend:', error);
          }
        }

        if (validation.isCorrect) {
          // Update timeline
          const newTimeline = [...state.timeline];
          newTimeline.splice(position, 0, selectedCard);

          // Remove card from player's hand
          const newPlayerHand = state.playerHand.filter(
            card => card.id !== selectedCard.id
          );

          // Calculate score
          const scoreEarned = calculateScore(validation);
          const newScore = {
            ...state.score,
            human: state.score.human + scoreEarned,
          };

          // Update attempts
          const newAttempts = { ...state.attempts };
          if (!newAttempts[selectedCard.id]) {
            newAttempts[selectedCard.id] = 0;
          }
          newAttempts[selectedCard.id]++;

          // Check win condition
          const isGameWon = newPlayerHand.length === 0;

          // Complete game session in backend if won
          if (isGameWon && gameSessionRef.current?.id) {
            try {
              const gameResult = {
                final_score: newScore.human,
                total_moves: state.gameStats.totalMoves + 1,
                completed: true,
                duration_ms: Date.now() - state.startTime
              };

              await gameAPI.completeGame(gameSessionRef.current.id, gameResult);
            } catch (error) {
              // Log error but don't fail the game
              console.warn('Failed to complete game session in backend:', error);
            }
          }

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
              correctMoves: state.gameStats.correctMoves + 1,
            },
            feedback: {
              type: 'success',
              message: validation.feedback,
              points: scoreEarned,
            },
          };

          if (isGameWon) {
            newGameState.gameStatus = 'won';
          }

          setState(newGameState);
          saveGameStateToStorage(newGameState);

          // Clear any existing feedback timeout
          if (feedbackTimeoutRef.current) {
            clearTimeout(feedbackTimeoutRef.current);
            feedbackTimeoutRef.current = null;
          }

          // Set feedback timeout only if game is not won
          if (!isGameWon) {
            feedbackTimeoutRef.current = setTimeout(() => {
              // Check if component is still mounted before updating state
              if (feedbackTimeoutRef.current) {
                setState(prev => ({ ...prev, feedback: null }));
                feedbackTimeoutRef.current = null;
              }
            }, 3000);
          }

          // If game is won, show feedback (no automatic restart)
          if (isGameWon) {
            // Clear any existing restart timeout
            if (restartTimeoutRef.current) {
              clearTimeout(restartTimeoutRef.current);
              restartTimeoutRef.current = null;
            }
            // Don't automatically restart - let user choose when to restart
          }

          return {
            success: true,
            isCorrect: true,
            cardReplaced: null,
            validation,
          };
        } else {
          // Calculate score for incorrect placement (usually 0 or negative)
          const scoreEarned = calculateScore(validation);
          const newScore = {
            ...state.score,
            human: state.score.human + scoreEarned,
          };

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
              totalMoves: state.gameStats.totalMoves + 1,
            },
            feedback: {
              type: 'error',
              message: validation.feedback,
              correctPosition: validation.correctPosition,
              attempts: newAttempts[selectedCard.id],
            },
          };

          setState(newGameState);
          saveGameStateToStorage(newGameState);

          // Clear any existing feedback timeout
          if (feedbackTimeoutRef.current) {
            clearTimeout(feedbackTimeoutRef.current);
            feedbackTimeoutRef.current = null;
          }

          // Set feedback timeout
          feedbackTimeoutRef.current = setTimeout(() => {
            // Check if component is still mounted before updating state
            if (feedbackTimeoutRef.current) {
              setState(prev => ({ ...prev, feedback: null }));
              feedbackTimeoutRef.current = null;
            }
          }, 3000);

          return {
            success: true,
            isCorrect: false,
            cardReplaced: cardReplacement?.newCard || null,
            validation,
            newCardPool: newCardPool,
          };
        }
      } catch (error) {
        return { success: false, reason: 'error', error: error.message };
      }
    },
    [
      state,
      validatePlacementWithTolerance,
      calculateScore,
      saveGameStateToStorage,
      restartGame,
      getNewCardFromPool,
    ]
  );

  /**
   * Toggle game pause state between playing and paused
   * Allows players to pause the game timer and resume when ready
   *
   * @example
   * ```js
   * // Toggle pause when user clicks pause button
   * togglePause();
   *
   * // Check current state
   * if (gameState.gameStatus === 'paused') {
   *   console.log('Game is paused');
   * }
   * ```
   */
  const togglePause = useCallback(() => {
    setState(prev => ({
      ...prev,
      gameStatus: prev.gameStatus === 'playing' ? 'paused' : 'playing',
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
      human:
        state.playerHand.length === 0 ? 1 : (4 - state.playerHand.length) / 4,
    },

    // Settings integration
    settings,
    updateGameSettings: newSettings => {
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
    /**
     * Get current game settings
     * @returns {Object} Current game settings object with difficulty, cardCount, categories, and other preferences
     * @throws {Error} If there's an error retrieving settings (will fallback to default settings)
     */
    getGameSettings: () => {
      try {
        if (settingsManagerRef.current) {
          return settingsManagerRef.current.getSettings();
        } else {
          return settings;
        }
      } catch (error) {
        console.warn('Error retrieving game settings:', error);
        return settings; // Fallback to default settings
      }
    },
  };
};
