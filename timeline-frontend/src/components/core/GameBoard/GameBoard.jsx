import React, { memo } from 'react';
import Timeline from '../../game/Timeline';
import PlayerHand from '../../game/PlayerHand';
import GameHeader from '../GameHeader';
import GameStatus from '../GameStatus';

/**
 * GameBoard - Main game interface component that orchestrates the timeline game layout
 *
 * This component serves as the central hub for the timeline game, managing the layout
 * and coordination between different game elements including the timeline, player hand,
 * AI hand, game status, and turn indicators. It handles the visual arrangement and
 * state flow between game components.
 *
 * @component
 * @example
 * ```jsx
 * <GameBoard
 *   gameState={gameState}
 *   onCardSelect={handleCardSelect}
 *   onCardPlay={handleCardPlay}
 *   onInsertionPointClick={handleInsertionPointClick}
 *   onTimelineCardClick={handleTimelineCardClick}
 *   onRestartGame={handleRestartGame}
 *   onTogglePause={handleTogglePause}
 *   playerHandRef={playerHandRef}
 *   timelineRef={timelineRef}
 * />
 * ```
 *
 * @param {Object} props - Component props
 * @param {Object} props.gameState - Current game state object containing all game data
 * @param {string} props.gameState.gameMode - Game mode ('single')
 * @param {string} props.gameState.gameStatus - Current game status ('playing', 'paused', 'won', 'lost')
 * @param {Array} props.gameState.timeline - Array of events currently on the timeline
 * @param {Array} props.gameState.playerHand - Array of cards in player's hand
 * @param {Object|null} props.gameState.selectedCard - Currently selected card object
 * @param {boolean} props.gameState.showInsertionPoints - Whether to show insertion points on timeline
 * @param {Function} props.onCardSelect - Callback when a card is selected from player hand
 * @param {Function} props.onCardPlay - Callback when a card is played
 * @param {Function} props.onInsertionPointClick - Callback when an insertion point is clicked
 * @param {Function} props.onTimelineCardClick - Callback when a timeline card is clicked
 * @param {Function} props.onRestartGame - Callback to restart the game
 * @param {Function} props.onTogglePause - Callback to toggle game pause state
 * @param {React.RefObject} props.playerHandRef - Ref to the player hand component
 * @param {React.RefObject} props.timelineRef - Ref to the timeline component
 *
 * @returns {JSX.Element} The main game board layout
 */
const GameBoard = memo(
  ({
    gameState,
    onCardSelect,
    onCardPlay,
    onInsertionPointClick,
    onTimelineCardClick,
    onRestartGame,
    onTogglePause,
    playerHandRef,
    timelineRef,
  }) => {
    const isPlayerTurn = true; // Always player's turn in single-player mode

    return (
      <div
        className="min-h-[calc(100vh-140px)] bg-gradient-to-br from-gray-50 to-blue-100 p-5 px-6 w-full max-w-none"
        style={{ overflow: 'visible' }}
      >
        {/* Game Status Overlay */}
        <GameStatus
          gameState={gameState}
          onRestartGame={onRestartGame}
          onTogglePause={onTogglePause}
        />

        {/* Game Header */}
        <GameHeader
          gameState={gameState}
          onRestartGame={onRestartGame}
          onTogglePause={onTogglePause}
        />

        {/* Game Board */}
        <div className="flex flex-col gap-8" style={{ overflow: 'visible' }}>
          <div className="flex-1" style={{ overflow: 'visible' }}>
            <Timeline
              ref={timelineRef}
              events={gameState.timeline}
              onCardClick={onTimelineCardClick}
              highlightInsertionPoints={gameState.showInsertionPoints}
              onInsertionPointClick={onInsertionPointClick}
              selectedCard={gameState.selectedCard}
            />
          </div>

          <div className="flex-1" style={{ overflow: 'visible' }}>
            <PlayerHand
              ref={playerHandRef}
              cards={gameState.playerHand}
              selectedCard={gameState.selectedCard}
              onCardSelect={onCardSelect}
              onCardPlay={onCardPlay}
              isPlayerTurn={isPlayerTurn}
              playerName="Player 1"
              maxCards={
                gameState.playerHand.length + (gameState.timeline.length - 1)
              }
            />
          </div>
        </div>
      </div>
    );
  }
);

GameBoard.displayName = 'GameBoard';

export default GameBoard;
