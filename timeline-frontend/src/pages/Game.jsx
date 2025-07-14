import React, { useState, useEffect } from 'react';
import GameBoard from '../components/game/GameBoard';
import useGameControls from '../components/game/GameControls.jsx';
import { 
  LoadingScreen, 
  ErrorScreen 
} from '../components/ui';
import { 
  calculateScore, 
  checkWinCondition 
} from '../utils/gameLogic';
import { 
  validatePlacementWithTolerance, 
  generateSmartInsertionPoints 
} from '../utils/timelineLogic';
import { GAME_STATUS, PLAYER_TYPES } from '../constants/gameConstants';
import performanceMonitor from '../utils/performanceMonitor';

/**
 * Main Game component that manages the Timeline Game state and logic
 * 
 * This component orchestrates the entire game flow including:
 * - Game initialization and state management
 * - Player interactions and card placement
 * - AI opponent logic
 * - Game status updates and win conditions
 * - Performance monitoring
 * 
 * @component
 * @example
 * ```jsx
 * <Game />
 * ```
 */
const Game = () => {
  const [gameState, setGameState] = useState({
    // Core game data
    timeline: [],
    playerHand: [],
    aiHand: [],
    cardPool: [],
    
    // Game status
    gameStatus: GAME_STATUS.LOBBY,
    currentPlayer: PLAYER_TYPES.HUMAN,
    gameMode: 'single',
    difficulty: 'medium',
    
    // UI state
    selectedCard: null,
    showInsertionPoints: false,
    feedback: null,
    
    // Game metrics
    score: { human: 0, ai: 0 },
    attempts: {},
    startTime: null,
    turnStartTime: null,
    gameStats: {
      totalMoves: 0,
      correctMoves: 0,
      averageTimePerMove: 0
    },
    
    // AI
    aiOpponent: null,
    insertionPoints: []
  });

  const {
    isLoading,
    error,
    playerHandRef,
    timelineRef,
    initializeGame,
    getNewCardFromPool,
    executeAITurn
  } = useGameControls();

  useEffect(() => {
    handleInitializeGame();
  }, []);

  /**
   * Initializes a new game session
   * Fetches cards from API, sets up game state, and starts the game
   */
  const handleInitializeGame = async () => {
    try {
      performanceMonitor.startTimer('Game', 'initialization');
      const newGameState = await initializeGame('single', 'medium');
      setGameState(newGameState);
      performanceMonitor.endTimer('Game', 'initialization', {
        gameMode: newGameState.gameMode,
        cardCount: newGameState.playerHand.length
      });
    } catch (error) {
      console.error('Failed to initialize game:', error);
    }
  };

  /**
   * Handles card selection from player hand
   * @param {Object} card - The selected card object
   */
  const handleCardSelect = (card) => {
    if (gameState.gameStatus !== GAME_STATUS.PLAYING || gameState.currentPlayer !== PLAYER_TYPES.HUMAN) {
      return;
    }

    performanceMonitor.trackInteraction('cardSelect', () => {
      const insertionPoints = card ? 
        generateSmartInsertionPoints(gameState.timeline, card) : [];

      setGameState(prev => ({
        ...prev,
        selectedCard: card,
        showInsertionPoints: !!card,
        insertionPoints,
        feedback: null
      }));
    }, { cardId: card?.id });
  };

  /**
   * Handles card play action (alias for card select)
   * @param {Object} card - The card to play
   */
  const handleCardPlay = (card) => {
    handleCardSelect(card);
  };

  /**
   * Handles insertion point click for card placement
   * @param {number} position - Position in timeline to place card
   */
  const handleInsertionPointClick = async (position) => {
    if (!gameState.selectedCard || gameState.gameStatus !== GAME_STATUS.PLAYING || gameState.currentPlayer !== PLAYER_TYPES.HUMAN) {
      return;
    }

    await placeCard(position, PLAYER_TYPES.HUMAN);
  };

  /**
   * Places a card on the timeline and handles game logic
   * @param {number} position - Position to place the card
   * @param {string} player - Player type ('human' or 'ai')
   */
  const placeCard = async (position, player = PLAYER_TYPES.HUMAN) => {
    const selectedCard = player === PLAYER_TYPES.HUMAN ? gameState.selectedCard : null;
    if (!selectedCard || gameState.gameStatus !== GAME_STATUS.PLAYING) {
      return;
    }

    performanceMonitor.startTimer('Game', 'cardPlacement');

    const turnTime = (Date.now() - gameState.turnStartTime) / 1000;
    const cardAttempts = (gameState.attempts[selectedCard.id] || 0) + 1;

    // Validate placement
    const validation = validatePlacementWithTolerance(
      selectedCard, 
      gameState.timeline, 
      position, 
      getDifficultyTolerance(gameState.difficulty)
    );

    let newState = { ...gameState };

    if (validation.isCorrect) {
      // Successful placement
      const scoreEarned = Math.round(
        calculateScore(true, turnTime, cardAttempts, selectedCard.difficulty)
      );

      // Add card to timeline
      const newTimeline = [...gameState.timeline];
      newTimeline.splice(position, 0, {
        ...selectedCard,
        isRevealed: true,
        placedAt: Date.now(),
        placedBy: player
      });

      // Remove card from player's hand
      const handKey = player === PLAYER_TYPES.HUMAN ? 'playerHand' : 'aiHand';
      const newHand = gameState[handKey].filter(card => card.id !== selectedCard.id);

      // Update scores
      const newScore = { ...gameState.score };
      newScore[player] += scoreEarned;

      // Check win condition
      const hasWon = checkWinCondition(newHand);
      let newGameStatus = gameState.gameStatus;
      
      if (hasWon) {
        if (gameState.gameMode === 'ai') {
          const otherHandKey = player === PLAYER_TYPES.HUMAN ? 'aiHand' : 'playerHand';
          const otherHandEmpty = gameState[otherHandKey].length === 0;
          
          if (otherHandEmpty || newHand.length === 0) {
            newGameStatus = GAME_STATUS.WON;
          }
        } else {
          newGameStatus = GAME_STATUS.WON;
        }
      }

      // Calculate next player
      let nextPlayer = gameState.currentPlayer;
      if (gameState.gameMode === 'ai' && newGameStatus === GAME_STATUS.PLAYING) {
        nextPlayer = player === PLAYER_TYPES.HUMAN ? PLAYER_TYPES.AI : PLAYER_TYPES.HUMAN;
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
        attempts: { ...gameState.attempts, [selectedCard.id]: cardAttempts },
        gameStats: {
          ...gameState.gameStats,
          totalMoves: gameState.gameStats.totalMoves + 1,
          correctMoves: gameState.gameStats.correctMoves + 1,
          averageTimePerMove: calculateAverageTime(gameState.gameStats, turnTime)
        },
        feedback: {
          type: 'success',
          message: 'Correct placement!',
          points: scoreEarned,
          attempts: cardAttempts
        }
      };

      // Execute AI turn if needed
      if (newState.gameMode === 'ai' && newState.currentPlayer === PLAYER_TYPES.AI && newState.gameStatus === GAME_STATUS.PLAYING) {
        setTimeout(async () => {
          const aiState = await executeAITurn(newState);
          setGameState(aiState);
        }, 1000);
      }

    } else {
      // Incorrect placement - trigger animations
      if (timelineRef.current) {
        timelineRef.current.animateWrongPlacement(position);
      }

      // Trigger card removal animation for the selected card
      if (playerHandRef.current && selectedCard) {
        playerHandRef.current.animateCardRemoval(selectedCard.id);
      }

      const newHand = [...gameState.playerHand];
      const cardIndex = newHand.findIndex(card => card.id === selectedCard.id);
      
      if (cardIndex !== -1) {
        // Get a new card from the pool
        const poolResult = await getNewCardFromPool(gameState);
        if (poolResult) {
          newHand[cardIndex] = poolResult.newCard;
          newState = {
            ...newState,
            playerHand: newHand,
            cardPool: poolResult.updatedPool
          };
          
          // Trigger new card animation after a delay
          setTimeout(() => {
            if (playerHandRef.current) {
              playerHandRef.current.animateNewCard(poolResult.newCard.id);
            }
          }, 600); // Reduced from 800ms to match optimized timing
        }
      }

      newState = {
        ...newState,
        selectedCard: null,
        showInsertionPoints: false,
        insertionPoints: [],
        attempts: { ...gameState.attempts, [selectedCard.id]: cardAttempts },
        gameStats: {
          ...gameState.gameStats,
          totalMoves: gameState.gameStats.totalMoves + 1,
          averageTimePerMove: calculateAverageTime(gameState.gameStats, turnTime)
        },
        feedback: {
          type: 'error',
          message: 'Incorrect placement. Try again!',
          attempts: cardAttempts
        }
      };
    }

    setGameState(newState);
    performanceMonitor.endTimer('Game', 'cardPlacement', {
      success: validation.isCorrect,
      position,
      player
    });

    // Clear feedback after delay
    setTimeout(() => {
      setGameState(prev => ({ ...prev, feedback: null }));
    }, 2000);
  };

  /**
   * Restarts the game with a new session
   */
  const handleRestartGame = () => {
    handleInitializeGame();
  };

  /**
   * Handles timeline card click events
   * @param {Event} event - Click event
   */
  const handleTimelineCardClick = (event) => {
    // Handle timeline card click if needed
  };

  /**
   * Toggles game pause state
   */
  const togglePause = () => {
    setGameState(prev => ({
      ...prev,
      gameStatus: prev.gameStatus === GAME_STATUS.PLAYING ? GAME_STATUS.PAUSED : GAME_STATUS.PLAYING
    }));
  };

  /**
   * Gets tolerance level based on difficulty
   * @param {string} difficulty - Game difficulty level
   * @returns {number} Tolerance in years
   */
  const getDifficultyTolerance = (difficulty) => {
    const tolerances = { easy: 50, medium: 25, hard: 10 };
    return tolerances[difficulty] || 25;
  };

  /**
   * Calculates average time per move
   * @param {Object} gameStats - Current game statistics
   * @param {number} newTime - Time for current move
   * @returns {number} Updated average time
   */
  const calculateAverageTime = (gameStats, newTime) => {
    const totalMoves = gameStats.totalMoves + 1;
    const currentTotal = gameStats.averageTimePerMove * gameStats.totalMoves;
    return (currentTotal + newTime) / totalMoves;
  };

  // Performance tracking
  performanceMonitor.trackGameMetric('gameState', {
    status: gameState.gameStatus,
    playerHandSize: gameState.playerHand.length,
    timelineSize: gameState.timeline.length,
    score: gameState.score
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen error={error} onRetry={handleRestartGame} onGoHome={() => window.location.href = '/'} />;
  }

  return (
    <GameBoard
      gameState={gameState}
      onCardSelect={handleCardSelect}
      onCardPlay={handleCardPlay}
      onInsertionPointClick={handleInsertionPointClick}
      onTimelineCardClick={handleTimelineCardClick}
      onRestartGame={handleRestartGame}
      onTogglePause={togglePause}
      playerHandRef={playerHandRef}
      timelineRef={timelineRef}
    />
  );
};

export default Game;
