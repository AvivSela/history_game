import React, { memo } from 'react';

const GameHeader = memo(({ gameState, onRestartGame, onTogglePause }) => {
  return (
    <div className="flex justify-between items-center bg-gradient-to-r from-gray-50/60 to-blue-100/100 px-10 py-8 rounded-2xl shadow-lg my-8 border border-blue-200 relative gap-8">
      <div className="flex-1 min-w-[220px]">
        <h1 className="m-0 mb-2.5 text-slate-700 text-4xl font-extrabold tracking-wider drop-shadow-sm">
          🎮 Timeline Game
        </h1>
        <p className="m-0 text-gray-600 text-base font-medium">
          Place historical events in chronological order
        </p>
        {gameState.gameMode === 'ai' && gameState.aiOpponent && (
          <div className="mt-2">
            <span className="text-sm text-primary font-medium">
              🤖 vs {gameState.aiOpponent.name}
            </span>
          </div>
        )}
      </div>
      
      <div className="flex flex-row gap-5 items-center bg-white/70">
        <button onClick={onRestartGame} className="btn btn-secondary">
          🔄 New Game
        </button>
        {gameState.gameStatus === 'playing' && (
          <button onClick={onTogglePause} className="btn btn-secondary">
            ⏸️ Pause
          </button>
        )}
      </div>
      
      <div className="flex gap-6">
        <div className="text-center bg-white/80 rounded-lg p-3 min-w-[80px] hover:bg-white transition-colors">
          <div className="text-xs text-text-light font-medium uppercase tracking-wider">
            Your Score
          </div>
          <div className="text-2xl font-bold text-primary">{gameState.score.human}</div>
        </div>
        
        {gameState.gameMode === 'ai' && (
          <div className="text-center bg-white/80 rounded-lg p-3 min-w-[80px] hover:bg-white transition-colors">
            <div className="text-xs text-text-light font-medium uppercase tracking-wider">
              AI Score
            </div>
            <div className="text-2xl font-bold text-primary">{gameState.score.ai}</div>
          </div>
        )}
        
        <div className="text-center bg-white/80 rounded-lg p-3 min-w-[80px] hover:bg-white transition-colors">
          <div className="text-xs text-text-light font-medium uppercase tracking-wider">
            Cards Left
          </div>
          <div className="text-2xl font-bold text-primary">{gameState.playerHand.length}</div>
        </div>
        
        <div className="text-center bg-white/80 rounded-lg p-3 min-w-[80px] hover:bg-white transition-colors">
          <div className="text-xs text-text-light font-medium uppercase tracking-wider">
            Timeline
          </div>
          <div className="text-2xl font-bold text-primary">{gameState.timeline.length}</div>
        </div>
      </div>
    </div>
  );
});

GameHeader.displayName = 'GameHeader';

export default GameHeader; 