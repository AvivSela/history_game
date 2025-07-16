import React, { useEffect, useCallback } from 'react';
import { GameBoard } from '../components/core';
import { LoadingScreen, ErrorScreen } from '../components/ui';
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
    togglePause,
    hasSavedGame,
  } = useGameState();

  // Get refs from useGameControls for DOM manipulation
  const { playerHandRef, timelineRef } = useGameControls();

  // Ref to prevent multiple initializations
  const hasInitialized = React.useRef(false);

  /**
   * Initializes a new game session
   * Uses the consolidated useGameState hook for initialization
   */
  const handleInitializeGame = useCallback(async () => {
    try {
      performanceMonitor.startTimer('Game', 'initialization');
      await initializeGame('single', 'medium');
      performanceMonitor.endTimer('Game', 'initialization', {
        gameMode: 'single',
        cardCount: 4, // Fixed card count for single player mode
      });
    } catch (error) {
      // Failed to initialize game
    }
  }, [initializeGame]);

  useEffect(() => {
    // Only initialize a new game if there's no saved game state
    if (!hasInitialized.current) {
      if (!hasSavedGame()) {
        handleInitializeGame();
      }
      hasInitialized.current = true;
    }
  // The initialization effect should only run once on mount.
  // Relying on function dependencies here causes unnecessary re-renders because
  // handleInitializeGame and hasSavedGame are recreated if their parent hooks
  // change reference. We intentionally provide an empty dependency array to
  // guarantee a single execution and disable the exhaustive-deps rule.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Handles card selection from player hand
   * @param {Object} card - The selected card object
   */
  const handleCardSelect = card => {
    performanceMonitor.trackInteraction(
      'cardSelect',
      () => {
        selectCard(card);
      },
      { cardId: card?.id }
    );
  };

  /**
   * Handles card play action (alias for card select)
   * @param {Object} card - The card to play
   */
  const handleCardPlay = card => {
    handleCardSelect(card);
  };

  /**
   * Handles insertion point click for card placement
   * @param {number} position - Position in timeline to place card
   */
  const handleInsertionPointClick = async position => {
    if (!gameState.selectedCard || gameState.gameStatus !== 'playing') {
      return;
    }

    const result = await placeCard(position, 'human');

    // Handle the result and trigger animations
    if (result && result.success) {
      if (!result.isCorrect) {
        // Trigger wrong placement animations
        if (timelineRef.current) {
          timelineRef.current.animateWrongPlacement(position);
        }

        if (playerHandRef.current && gameState.selectedCard) {
          playerHandRef.current.animateCardRemoval(gameState.selectedCard.id);
        }

        // Trigger new card animation after delay if card was replaced
        if (result.cardReplaced && playerHandRef.current) {
          setTimeout(() => {
            playerHandRef.current.animateNewCard(result.cardReplaced.id);
          }, 800); // Delay for new card animation
        }
      }
    }
  };

  /**
   * Handles restart game action
   */
  const handleRestartGame = async () => {
    // Clear the game state first
    restartGame();

    // Reset the initialization flag so we can start a new game
    hasInitialized.current = false;

    // Start a new game after clearing the state
    setTimeout(async () => {
      try {
        await handleInitializeGame();
      } catch (error) {
        // Failed to start new game
      }
    }, 100); // Small delay to ensure state is cleared
  };

  /**
   * Handles timeline card click (for card removal or inspection)
   */
  const handleTimelineCardClick = () => {
    // Timeline card click handling logic
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
    return (
      <ErrorScreen error={gameState.error} onRetry={handleInitializeGame} />
    );
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
