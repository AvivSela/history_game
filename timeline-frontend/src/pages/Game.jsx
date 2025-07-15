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
    togglePause,
    hasSavedGame
  } = useGameState();

  // Get refs from useGameControls for DOM manipulation
  const {
    playerHandRef,
    timelineRef
  } = useGameControls();

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
        cardCount: 4 // Fixed card count for single player mode
      });
    } catch (error) {
      console.error('Failed to initialize game:', error);
    }
  }, [initializeGame]);

  useEffect(() => {
    console.log('🔄 useEffect running, hasInitialized:', hasInitialized.current);
    // Only initialize a new game if there's no saved game state
    if (!hasInitialized.current) {
      if (!hasSavedGame()) {
        console.log('🆕 No saved game found, starting new game');
        handleInitializeGame();
      } else {
        console.log('🔄 Saved game found, resuming existing game');
      }
      hasInitialized.current = true;
      console.log('🔄 hasInitialized set to true');
    } else {
      console.log('🔄 hasInitialized is true, skipping initialization');
    }
  }, []); // Empty dependency array - only run once on mount

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
    if (!gameState.selectedCard || gameState.gameStatus !== 'playing') {
      return;
    }

    const result = await placeCard(position, 'human');
    
    // Handle the result and trigger animations
    if (result && result.success) {
      if (!result.isCorrect) {
        console.log('🎬 Triggering wrong placement animations');
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
      } else {
        console.log('✅ Correct placement - no animations needed');
      }
    }
  };

  /**
   * Handles restart game action
   */
  const handleRestartGame = async () => {
    console.log('🔄 handleRestartGame called');
    console.log('🔄 hasInitialized before reset:', hasInitialized.current);
    
    // Clear the game state first
    restartGame();
    
    // Reset the initialization flag so we can start a new game
    hasInitialized.current = false;
    console.log('🔄 hasInitialized after reset:', hasInitialized.current);
    
    // Start a new game after clearing the state
    setTimeout(async () => {
      console.log('🆕 Starting new game after restart');
      try {
        await handleInitializeGame();
        console.log('✅ New game started successfully');
      } catch (error) {
        console.error('❌ Failed to start new game:', error);
      }
    }, 100); // Small delay to ensure state is cleared
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
