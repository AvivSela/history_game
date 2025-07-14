import React, { useEffect, useCallback } from 'react';
import { GameBoard } from '../components/core';
import { 
  LoadingScreen, 
  ErrorScreen 
} from '../components/ui';
import { useGameState } from '../hooks/useGameState';
import useGameControls from '../components/core/GameControls/GameControls';
import performanceMonitor from '../utils/performanceMonitor';

/**
 * Game - Main game page component that manages the Timeline Game state and logic
 * 
 * This component orchestrates the entire game flow using the consolidated useGameState hook.
 * It serves as the central controller for the timeline game, managing all game
 * state and coordinating between different game components.
 * 
 * Key responsibilities:
 * - Game initialization and state management (via useGameState)
 * - Player interactions and card placement validation
 * - AI opponent logic and turn management
 * - Game status updates and win condition checking
 * - Performance monitoring and analytics
 * - Score calculation and game statistics
 * 
 * @component
 * @example
 * ```jsx
 * <Game />
 * ```
 * 
 * @returns {JSX.Element} The complete game interface with all game components
 */
const Game = () => {
  const {
    state: gameState,
    initializeGame,
    selectCard,
    placeCard,
    restartGame,
    togglePause
  } = useGameState();

  // Get refs from useGameControls for DOM manipulation
  const {
    playerHandRef,
    timelineRef
  } = useGameControls();

  useEffect(() => {
    handleInitializeGame();
  }, [handleInitializeGame]);

  /**
   * Initializes a new game session
   * Uses the consolidated useGameState hook for initialization
   */
  const handleInitializeGame = useCallback(async () => {
    try {
      performanceMonitor.startTimer('Game', 'initialization');
      await initializeGame('single', 'medium');
      performanceMonitor.endTimer('Game', 'initialization', {
        gameMode: gameState.gameMode,
        cardCount: gameState.playerHand.length
      });
    } catch (error) {
      console.error('Failed to initialize game:', error);
    }
  }, [initializeGame, gameState.gameMode, gameState.playerHand.length]);

  /**
   * Handles card selection from player hand
   * @param {Object} card - The selected card object
   */
  const handleCardSelect = (card) => {
    performanceMonitor.trackInteraction('cardSelect', () => {
      selectCard(card);
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
    if (!gameState.selectedCard || gameState.gameStatus !== 'playing' || gameState.currentPlayer !== 'human') {
      return;
    }

    await placeCard(position, 'human');
  };

  /**
   * Handles restart game action
   */
  const handleRestartGame = () => {
    restartGame();
  };

  /**
   * Handles timeline card click (for card removal or inspection)
   * @param {Event} event - Click event
   */
  const handleTimelineCardClick = (event) => {
    // Timeline card click handling logic
    console.log('Timeline card clicked:', event);
  };

  /**
   * Handles pause/resume game action
   */
  const handleTogglePause = () => {
    togglePause();
  };

  // Show loading screen while initializing
  if (gameState.isLoading) {
    return <LoadingScreen />;
  }

  // Show error screen if there's an error
  if (gameState.error) {
    return <ErrorScreen error={gameState.error} onRetry={handleInitializeGame} />;
  }

  return (
    <div className="game-container">
      <GameBoard
        gameState={gameState}
        onCardSelect={handleCardSelect}
        onCardPlay={handleCardPlay}
        onInsertionPointClick={handleInsertionPointClick}
        onRestartGame={handleRestartGame}
        onTimelineCardClick={handleTimelineCardClick}
        onTogglePause={handleTogglePause}
        playerHandRef={playerHandRef}
        timelineRef={timelineRef}
      />
    </div>
  );
};

export default Game;
