import React, { memo } from 'react';
import Timeline from '../Timeline/Timeline';
import PlayerHand from '../PlayerHand/PlayerHand';
import AIHand from '../player/AIHand';
import GameHeader from './GameHeader';
import GameStatus from './GameStatus';
import TurnIndicator from './TurnIndicator';

const GameBoard = memo(({
  gameState,
  onCardSelect,
  onCardPlay,
  onInsertionPointClick,
  onTimelineCardClick,
  onRestartGame,
  onTogglePause,
  playerHandRef,
  timelineRef
}) => {
  const isPlayerTurn = gameState.currentPlayer === 'human';

  return (
    <div className="min-h-[calc(100vh-140px)] bg-gradient-to-br from-gray-50 to-blue-100 p-5 px-6 w-full max-w-none" style={{ overflow: 'visible' }}>
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

      {/* Turn Indicator */}
      {gameState.gameMode === 'ai' && gameState.gameStatus === 'playing' && (
        <TurnIndicator isPlayerTurn={isPlayerTurn} />
      )}

      {/* Game Board */}
      <div className="flex flex-col lg:flex-row gap-8" style={{ overflow: 'visible' }}>
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
            maxCards={gameState.playerHand.length + (gameState.timeline.length - 1) + (gameState.aiHand?.length || 0)}
          />
          
          {/* AI Hand */}
          {gameState.gameMode === 'ai' && <AIHand aiHand={gameState.aiHand} />}
        </div>
      </div>
    </div>
  );
});

GameBoard.displayName = 'GameBoard';

export default GameBoard; 