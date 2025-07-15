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
import { createAIOpponent } from '@utils/aiLogic.js';
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
 * - Turn-based gameplay with AI opponent support
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
 * @returns {Function} returns.executeAITurn - Execute AI turn logic
 */
export const useGameState = () => {
  const [state, setState] = useState({
    // Core game data
    timeline: [],
    playerHand: [],
    aiHand: [],
    cardPool: [], // Added: Card pool for replacement cards
    
    // Game status
    gameStatus: GAME_STATUS.LOBBY,
    currentPlayer: PLAYER_TYPES.HUMAN,
    gameMode: 'single', // 'single', 'ai', 'multiplayer'
    difficulty: 'medium', // 'easy', 'medium', 'hard'
    
    // UI state
    selectedCard: null,
    showInsertionPoints: false,
    feedback: null,
    isLoading: false,
    error: null,
    
    // Game metrics
    score: { human: 0, ai: 0 },
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
    achievements: [],
    
    // AI
    aiOpponent: null // Added: AI opponent
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
    state.aiHand,
    state.cardPool,
    state.gameStatus,
    state.currentPlayer,
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
    state.aiOpponent,
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
      
      // Create AI opponent if needed
      let aiOpponent = null;
      if (mode === 'ai') {
        aiOpponent = createAIOpponent(diff);
      }
      
      // Fetch events from API
      const cardCount = mode === 'ai' ? CARD_COUNTS.AI : CARD_COUNTS.SINGLE;
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

      // Split cards between human and AI if needed
      let humanCards = session.playerHand;
      let aiCards = [];
      
      if (mode === 'ai' && session.playerHand.length > 2) {
        const half = Math.ceil(session.playerHand.length / 2);
        humanCards = session.playerHand.slice(0, half);
        aiCards = session.playerHand.slice(half);
      }

      setState(prev => ({
        ...prev,
        timeline: session.timeline,
        playerHand: humanCards,
        aiHand: aiCards,
        cardPool: poolEvents, // Added: Card pool
        gameStatus: 'playing',
        currentPlayer: 'human',
        gameMode: mode,
        difficulty: diff,
        aiOpponent, // Added: AI opponent
        score: { human: 0, ai: 0 },
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
        ...humanCards.map(card => card.id),
        ...aiCards.map(card => card.id)
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

  // AI turn execution - defined before placeCard to avoid circular dependency
  const executeAITurn = useCallback(() => {
    if (state.currentPlayer !== 'ai' || state.aiHand.length === 0) {
      return;
    }

    // Simple AI strategy: pick a random card and try to place it correctly
    const availableCards = state.aiHand;
    const selectedCard = availableCards[Math.floor(Math.random() * availableCards.length)];
    
    // AI calculates the correct position
    const validation = validatePlacementWithTolerance(selectedCard, state.timeline, 0);
    const aiPosition = validation.correctPosition;
    
    // Add some randomness to AI placement based on difficulty
    let finalPosition = aiPosition;
    if (state.difficulty === 'easy') {
      // AI makes more mistakes on easy (to help player feel better)
      if (Math.random() < 0.3) {
        finalPosition += Math.random() < 0.5 ? -1 : 1;
      }
    } else if (state.difficulty === 'hard') {
      // AI is more accurate on hard
      // AI chooses correct position 90% of the time
      if (Math.random() > 0.9) {
        finalPosition += Math.random() < 0.5 ? -1 : 1;
      }
    }

    finalPosition = Math.max(0, Math.min(state.timeline.length, finalPosition));

    // Temporarily set selected card for AI
    setState(prev => ({ ...prev, selectedCard }));
    
    // Execute AI placement after a short delay
    setTimeout(() => {
      // Instead of calling placeCard, we'll implement the AI logic directly here
      // This avoids the circular dependency issue
      const aiSelectedCard = selectedCard;
      const aiPosition = finalPosition;
      const aiPlayer = 'ai';
      
      // Validate the AI's placement
      const aiValidation = validatePlacementWithTolerance(
        aiSelectedCard, 
        state.timeline, 
        aiPosition
      );

      const aiTurnTime = (Date.now() - state.turnStartTime) / GAME_LOGIC.SECONDS_TO_MILLISECONDS;
      const aiCardAttempts = (state.attempts[aiSelectedCard.id] || 0) + 1;

      // Record AI turn in history
      const aiTurnRecord = {
        id: `turn_${Date.now()}`,
        player: aiPlayer,
        card: aiSelectedCard,
        position: aiPosition,
        validation: aiValidation,
        turnTime: aiTurnTime,
        attempts: aiCardAttempts,
        timestamp: Date.now()
      };

      if (aiValidation.isCorrect) {
        // AI successful placement
        const aiScoreEarned = Math.round(
          calculateScore(true, aiTurnTime, aiCardAttempts, aiSelectedCard.difficulty)
        );

        // Add card to timeline at AI's chosen position
        const newTimeline = [...state.timeline];
        newTimeline.splice(aiPosition, 0, {
          ...aiSelectedCard,
          isRevealed: true,
          placedAt: Date.now(),
          placedBy: aiPlayer
        });

        // Remove card from AI's hand
        const newAiHand = state.aiHand.filter(card => card.id !== aiSelectedCard.id);

        // Update scores
        const newScore = { ...state.score };
        newScore[aiPlayer] += aiScoreEarned;

        // Check win condition
        const hasWon = checkWinCondition(newAiHand);
        let newGameStatus = state.gameStatus;
        
        if (hasWon) {
          if (state.gameMode === 'ai') {
            const humanHandEmpty = state.playerHand.length === 0;
            if (humanHandEmpty || newAiHand.length === 0) {
              newGameStatus = 'won';
            }
          } else {
            newGameStatus = 'won';
          }
        }

        // Switch back to human player
        const nextPlayer = newGameStatus === 'playing' ? 'human' : state.currentPlayer;

        setState(prev => ({
          ...prev,
          timeline: newTimeline,
          aiHand: newAiHand,
          score: newScore,
          selectedCard: null,
          showInsertionPoints: false,
          insertionPoints: [],
          currentPlayer: nextPlayer,
          turnStartTime: Date.now(),
          gameStatus: newGameStatus,
          attempts: { ...prev.attempts, [aiSelectedCard.id]: aiCardAttempts },
          turnHistory: [...prev.turnHistory, aiTurnRecord],
          gameStats: {
            ...prev.gameStats,
            totalMoves: prev.gameStats.totalMoves + 1,
            correctMoves: prev.gameStats.correctMoves + 1,
            averageTimePerMove: calculateAverageTime(prev.gameStats, aiTurnTime)
          },
          feedback: {
            type: 'success',
            message: `AI placed ${aiSelectedCard.title} correctly!`,
            points: aiScoreEarned,
            isClose: false
          },
          timelineAnalysis: null
        }));

        // Clear AI feedback after delay
        setTimeout(() => {
          setState(prev => ({ ...prev, feedback: null }));
        }, 3000);

      } else {
        // AI incorrect placement
        setState(prev => ({
          ...prev,
          selectedCard: null,
          showInsertionPoints: false,
          insertionPoints: [],
          attempts: { ...prev.attempts, [aiSelectedCard.id]: aiCardAttempts },
          turnHistory: [...prev.turnHistory, aiTurnRecord],
          gameStats: {
            ...prev.gameStats,
            totalMoves: prev.gameStats.totalMoves + 1,
            averageTimePerMove: calculateAverageTime(prev.gameStats, aiTurnTime)
          },
          feedback: {
            type: 'error',
            message: `AI placed ${aiSelectedCard.title} incorrectly!`,
            correctPosition: aiValidation.correctPosition,
            attempts: aiCardAttempts
          },
          currentPlayer: 'human',
          turnStartTime: Date.now()
        }));

        // Clear AI feedback after delay
        setTimeout(() => {
          setState(prev => ({ ...prev, feedback: null }));
        }, 4000);
      }
    }, 500);

  }, [state.currentPlayer, state.aiHand, state.timeline, state.difficulty]);

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
        aiHand: [],
        cardPool: [],
        gameStatus: 'lobby',
        currentPlayer: 'human',
        selectedCard: null,
        showInsertionPoints: false,
        feedback: null,
        error: null,
        score: { human: 0, ai: 0 },
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
        achievements: [],
        aiOpponent: null
      };
    });
  }, []);

  // Select a card
  const selectCard = useCallback((card) => {
    
    if (state.gameStatus !== 'playing' || state.currentPlayer !== 'human') {
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
  }, [state.gameStatus, state.currentPlayer, state.timeline]);

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
          console.log('⚠️ Could not get replacement card from pool');
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

        // Trigger animations for incorrect placement
        // Note: Animation triggers would need to be passed from Game component
        // For now, we'll rely on the feedback system to show the error
        console.log('🎬 Incorrect placement animations should trigger here');

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
    executeAITurn,
    clearSavedGame,
    
    // Persistence
    hasSavedGame: () => hasSavedGameState(),
    
    // Computed values
    isPlayerTurn: state.currentPlayer === 'human',
    canSelectCard: state.gameStatus === 'playing' && state.currentPlayer === 'human',
    canPlaceCard: state.selectedCard && state.gameStatus === 'playing',
    gameProgress: {
      human: state.gameMode === 'ai' ? 
        (state.aiHand.length + state.playerHand.length > 0 ? 
          (1 - state.playerHand.length / (state.aiHand.length + state.playerHand.length)) : 1) :
        (state.playerHand.length === 0 ? 1 : (4 - state.playerHand.length) / 4),
      ai: state.gameMode === 'ai' ? 
        (state.aiHand.length + state.playerHand.length > 0 ? 
          (1 - state.aiHand.length / (state.aiHand.length + state.playerHand.length)) : 1) : 0
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