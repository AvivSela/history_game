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
import { GAME_STATUS, PLAYER_TYPES, TIMING, GAME_LOGIC, CARD_COUNTS, POOL_CARD_COUNT } from '../constants/gameConstants';
import { gameAPI, extractData, handleAPIError } from '@utils/api.js';

import { 
  saveGameStateToStorage, 
  loadGameStateFromStorage, 
  clearGameStateFromStorage,
  hasSavedGameState 
} from '../utils/statePersistence.js';

/**
 * useGameState - Comprehensive game state management hook
 * 
 * This hook provides complete game state management for the Timeline Game, including
 * game initialization, turn management, card placement validation, score calculation,
 * and win condition checking. It encapsulates all game logic and provides a clean
 * interface for components to interact with the game state.
 * 
 * Key features:
 * - Game session initialization and management
 * - Card selection and placement logic
 * - Single-player gameplay
 * - Score calculation and game statistics tracking
 * - Win condition validation and game state transitions
 * - Error handling and loading states
 * - Card pool management for replacement cards
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
 * // Initialize a new game
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

  const gameSessionRef = useRef(null);
  const restartTimeoutRef = useRef(null);

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
        console.error('❌ Error loading saved state:', error);
      }
    };

    loadSavedState();
  }, []);

  // Save state to storage whenever relevant state changes
  useEffect(() => {
    // Only save if game is in progress
    if (state.gameStatus === 'playing' || state.gameStatus === 'paused') {
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
    state.selectedCard
  ]);

  // Initialize new game - Consolidated from GameControls
  const initializeGame = useCallback(async (mode = 'single', diff = 'medium') => {
    try {
      // Clear any saved state when starting a new game
      clearGameStateFromStorage();
      
      setState(prev => ({ 
        ...prev, 
        isLoading: true, 
        error: null,
        gameStatus: GAME_STATUS.LOADING
      }));
      
      // Fetch events from API
      const cardCount = CARD_COUNTS.SINGLE;
      const response = await gameAPI.getRandomEvents(cardCount);
      const events = extractData(response);
      
      // Fetch additional cards for the pool (for replacement when cards are placed incorrectly)
      const poolResponse = await gameAPI.getRandomEvents(POOL_CARD_COUNT);
      const poolEvents = extractData(poolResponse);
      
      // Create game session
      const session = createGameSession(events, {
        cardCount: cardCount - 1,
        difficulty: diff,
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
        difficulty: diff,
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

      // Debug: Check for duplicate IDs
      const allCardIds = [
        ...session.timeline.map(card => card.id),
        ...humanCards.map(card => card.id)
      ];
      const uniqueIds = new Set(allCardIds);
      if (allCardIds.length !== uniqueIds.size) {
        console.warn('⚠️ Duplicate card IDs detected in new game!', {
          totalCards: allCardIds.length,
          uniqueCards: uniqueIds.size,
          duplicates: allCardIds.filter((id, index) => allCardIds.indexOf(id) !== index)
        });
      }

    } catch (error) {
      console.error('❌ Error initializing game:', error);
      const errorMessage = handleAPIError(error, 'Failed to load game');
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
        gameStatus: 'error'
      }));
      throw error;
    }
  }, []);



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
    
    // If pool is empty, fetch more cards
    try {
      const response = await gameAPI.getRandomEvents(CARD_COUNTS.SINGLE);
      const newPoolCards = extractData(response);
      const newCard = newPoolCards[0];
      const updatedPool = [...currentGameState.cardPool, ...newPoolCards.slice(1)];
      
      return { newCard, updatedPool };
    } catch (error) {
      console.error('Failed to fetch new cards:', error);
      return null;
    }
  }, []);

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
      console.error('❌ Error in placeCard:', error);
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