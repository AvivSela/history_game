import { useState, useCallback, useRef } from 'react';
import { 
  calculateScore, 
  checkWinCondition, 
  createGameSession 
} from '../utils/gameLogic';
import { 
  validatePlacementWithTolerance, 
  generateSmartInsertionPoints,
  validateTimeline 
} from '../utils/timelineLogic';

/**
 * Comprehensive game state management hook
 * Handles all game logic, state updates, and turn management
 */
export const useGameState = () => {
  const [state, setState] = useState({
    // Core game data
    timeline: [],
    playerHand: [],
    aiHand: [],
    
    // Game status
    gameStatus: 'lobby', // 'lobby', 'playing', 'paused', 'won', 'lost', 'draw'
    currentPlayer: 'human', // 'human', 'ai'
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
    achievements: []
  });

  const gameSessionRef = useRef(null);

  // Initialize new game
  const initializeGame = useCallback(async (events, settings = {}) => {
    try {
      setState(prev => ({ 
        ...prev, 
        isLoading: true, 
        error: null,
        gameStatus: 'loading'
      }));

      // Create game session
      const session = createGameSession(events, {
        cardCount: settings.cardCount || 4,
        difficulty: settings.difficulty || 'medium',
        gameMode: settings.gameMode || 'single'
      });

      gameSessionRef.current = session;

      // Split cards between human and AI if needed
      let humanCards = session.playerHand;
      let aiCards = [];
      
      if (settings.gameMode === 'ai') {
        const totalCards = session.playerHand.length;
        const humanCardCount = Math.ceil(totalCards / 2);
        humanCards = session.playerHand.slice(0, humanCardCount);
        aiCards = session.playerHand.slice(humanCardCount);
      }

      setState(prev => ({
        ...prev,
        timeline: session.timeline,
        playerHand: humanCards,
        aiHand: aiCards,
        gameStatus: 'playing',
        currentPlayer: 'human',
        gameMode: settings.gameMode || 'single',
        difficulty: settings.difficulty || 'medium',
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
        isLoading: false,
        error: null
      }));

      console.log('🎮 Game initialized:', {
        mode: settings.gameMode,
        humanCards: humanCards.length,
        aiCards: aiCards.length,
        timeline: session.timeline.length
      });

    } catch (error) {
      console.error('❌ Error initializing game:', error);
      setState(prev => ({
        ...prev,
        error: error.message,
        isLoading: false,
        gameStatus: 'error'
      }));
    }
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

  // Place a card on the timeline
  const placeCard = useCallback((position, player = 'human') => {
    const selectedCard = player === 'human' ? state.selectedCard : null;
    if (!selectedCard || state.gameStatus !== 'playing') {
      console.warn('No card selected or game not in playing state');
      return;
    }

    const turnTime = (Date.now() - state.turnStartTime) / 1000;
    const cardAttempts = (state.attempts[selectedCard.id] || 0) + 1;

    // Advanced validation with tolerance
    const validation = validatePlacementWithTolerance(
      selectedCard, 
      state.timeline, 
      position, 
      getDifficultyTolerance(state.difficulty)
    );

    console.log('🎯 Card placement validation:', validation);

    // Record turn in history
    const turnRecord = {
      id: `turn_${Date.now()}`,
      player,
      card: selectedCard,
      position,
      validation,
      turnTime,
      attempts: cardAttempts,
      timestamp: Date.now()
    };

    let newState = { ...state };

    if (validation.isCorrect) {
      // Successful placement - only exact matches accepted
      const scoreEarned = Math.round(
        calculateScore(true, turnTime, cardAttempts, selectedCard.difficulty)
      );

      // Add card to timeline at user's chosen position
      const newTimeline = [...state.timeline];
      newTimeline.splice(position, 0, {
        ...selectedCard,
        isRevealed: true,
        placedAt: Date.now(),
        placedBy: player
      });

      // Remove card from player's hand
      const handKey = player === 'human' ? 'playerHand' : 'aiHand';
      const newHand = state[handKey].filter(card => card.id !== selectedCard.id);

      // Update scores
      const newScore = { ...state.score };
      newScore[player] += scoreEarned;

      // Check win condition
      const hasWon = checkWinCondition(newHand);
      let newGameStatus = state.gameStatus;
      
      if (hasWon) {
        if (state.gameMode === 'ai') {
          // In AI mode, check if both players are out of cards
          const otherHandKey = player === 'human' ? 'aiHand' : 'playerHand';
          const otherHandEmpty = state[otherHandKey].length === 0;
          
          if (otherHandEmpty || newHand.length === 0) {
            newGameStatus = 'won';
          }
        } else {
          newGameStatus = 'won';
        }
      }

      // Calculate next player
      let nextPlayer = state.currentPlayer;
      if (state.gameMode === 'ai' && newGameStatus === 'playing') {
        nextPlayer = player === 'human' ? 'ai' : 'human';
      }

      newState = {
        ...newState,
        timeline: newTimeline,
        [handKey]: newHand,
        score: newScore,
        selectedCard: null,
        showInsertionPoints: false,
        insertionPoints: [],
        currentPlayer: nextPlayer,
        turnStartTime: Date.now(),
        gameStatus: newGameStatus,
        attempts: { ...state.attempts, [selectedCard.id]: cardAttempts },
        turnHistory: [...state.turnHistory, turnRecord],
        gameStats: {
          ...state.gameStats,
          totalMoves: state.gameStats.totalMoves + 1,
          correctMoves: state.gameStats.correctMoves + 1,
          averageTimePerMove: calculateAverageTime(state.gameStats, turnTime)
        },
        feedback: {
          type: validation.isCorrect ? 'success' : 'close',
          message: validation.feedback,
          points: scoreEarned,
          isClose: validation.isClose && !validation.isCorrect
        },
        timelineAnalysis: validateTimeline(newTimeline)
      };

    } else {
      // Incorrect placement
      newState = {
        ...newState,
        selectedCard: null,
        showInsertionPoints: false,
        insertionPoints: [],
        attempts: { ...state.attempts, [selectedCard.id]: cardAttempts },
        turnHistory: [...state.turnHistory, turnRecord],
        gameStats: {
          ...state.gameStats,
          totalMoves: state.gameStats.totalMoves + 1,
          averageTimePerMove: calculateAverageTime(state.gameStats, turnTime)
        },
        feedback: {
          type: 'error',
          message: validation.feedback,
          correctPosition: validation.correctPosition,
          attempts: cardAttempts
        }
      };

      // In AI mode, switch turns even on incorrect placement
      if (state.gameMode === 'ai') {
        newState.currentPlayer = player === 'human' ? 'ai' : 'human';
        newState.turnStartTime = Date.now();
      }
    }

    setState(newState);

    // Clear feedback after delay
    setTimeout(() => {
      setState(prev => ({ ...prev, feedback: null }));
    }, validation.isCorrect || validation.isClose ? 3000 : 4000);

    // Trigger AI turn if it's AI's turn
    if (newState.currentPlayer === 'ai' && newState.gameStatus === 'playing') {
      setTimeout(() => {
        executeAITurn();
      }, 1500); // Give AI a thinking delay
    }

  }, [state, executeAITurn]);

  // AI turn execution
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

    console.log('🤖 AI placing card:', selectedCard.title, 'at position', finalPosition);

    // Temporarily set selected card for AI
    setState(prev => ({ ...prev, selectedCard }));
    
    // Execute AI placement after a short delay
    setTimeout(() => {
      placeCard(finalPosition, 'ai');
    }, 500);

  }, [state.currentPlayer, state.aiHand, state.timeline, state.difficulty, placeCard]);

  // Get hint for current selection
  const getHint = useCallback(() => {
    if (!state.selectedCard) return;

    const insertionPoints = state.insertionPoints;
    const relevantPoints = insertionPoints
      .filter(point => point.relevance > 0.7)
      .sort((a, b) => b.relevance - a.relevance);

    let hint = '';
    if (relevantPoints.length > 0) {
      hint = `💡 Try looking ${relevantPoints[0].hint}`;
    } else {
      const cardYear = new Date(state.selectedCard.dateOccurred).getFullYear();
      hint = `💡 This event happened in ${cardYear}`;
    }

    setState(prev => ({
      ...prev,
      feedback: { type: 'hint', message: hint },
      gameStats: { ...prev.gameStats, hintsUsed: prev.gameStats.hintsUsed + 1 }
    }));

    setTimeout(() => {
      setState(prev => ({ ...prev, feedback: null }));
    }, 3000);
  }, [state.selectedCard, state.insertionPoints]);

  // Restart game
  const restartGame = useCallback(() => {
    setState(prev => ({
      ...prev,
      gameStatus: 'lobby',
      selectedCard: null,
      showInsertionPoints: false,
      feedback: null,
      error: null
    }));
  }, []);

  // Pause/Resume game
  const togglePause = useCallback(() => {
    setState(prev => ({
      ...prev,
      gameStatus: prev.gameStatus === 'playing' ? 'paused' : 'playing'
    }));
  }, []);

  return {
    // State
    gameState: state,
    
    // Actions
    initializeGame,
    selectCard,
    placeCard,
    getHint,
    restartGame,
    togglePause,
    
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