import React, { memo } from 'react';

const GameStatus = memo(({ gameState, onRestartGame, onTogglePause }) => {
  const getGameStatusMessage = () => {
    switch (gameState.gameStatus) {
      case 'won':
        return {
          type: 'success',
          title: '🎉 Congratulations!',
          message: `You've successfully placed all cards in chronological order!\n\nFinal Score: ${gameState.score.human} points\nTotal Moves: ${gameState.gameStats.totalMoves}\nCorrect Moves: ${gameState.gameStats.correctMoves}\nAverage Time: ${gameState.gameStats.averageTimePerMove.toFixed(1)}s per move`
        };
      case 'lost':
        return {
          type: 'error',
          title: '😔 Game Over',
          message: `The AI has won this round!\n\nYour Score: ${gameState.score.human} points\nAI Score: ${gameState.score.ai} points\n\nBetter luck next time!`
        };
      case 'paused':
        return {
          type: 'info',
          title: '⏸️ Game Paused',
          message: 'Your game is currently paused.\n\nClick "Resume Game" to continue playing.'
        };
      default:
        return null;
    }
  };

  const statusMessage = getGameStatusMessage();

  return (
    <>
      {/* Game Status Overlay */}
      {statusMessage && (
        <div className={`fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in ${statusMessage.type === 'success' ? 'success' : statusMessage.type === 'error' ? 'error' : ''}`}>
          <div className="bg-white p-12 rounded-lg text-center max-w-lg shadow-xl animate-bounce-in border-4 border-success">
            <h3 className="text-3xl mb-4 text-primary">{statusMessage.title}</h3>
            <p className="text-lg text-text mb-8 leading-relaxed" style={{ whiteSpace: 'pre-line' }}>
              {statusMessage.message}
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              {gameState.gameStatus === 'paused' ? (
                <button onClick={onTogglePause} className="btn btn-primary btn-large">
                  ▶️ Resume Game
                </button>
              ) : (
                <button onClick={onRestartGame} className="btn btn-primary btn-large">
                  🎮 Play Again
                </button>
              )}
              <button onClick={() => window.location.href = '/'} className="btn btn-secondary">
                🏠 Home
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Toast */}
      {gameState.feedback && (
        <div className={`fixed top-24 right-5 bg-card rounded-lg p-4 shadow-xl z-50 max-w-sm animate-slide-in-right border-l-4 ${gameState.feedback.type === 'success' ? 'border-success bg-gradient-to-br from-success/10 to-card' : 'border-accent bg-gradient-to-br from-accent/10 to-card'}`}>
          <div className="flex flex-col gap-2">
            <p className="text-sm text-text font-medium m-0">{gameState.feedback.message}</p>
            {gameState.feedback.points && (
              <p className="text-base text-success font-bold m-0">+{gameState.feedback.points} points!</p>
            )}
            {gameState.feedback.attempts > 1 && (
              <p className="text-xs text-text-light m-0">Attempt #{gameState.feedback.attempts}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
});

GameStatus.displayName = 'GameStatus';

export default GameStatus; 