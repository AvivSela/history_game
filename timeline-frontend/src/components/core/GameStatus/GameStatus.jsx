import React, { memo } from 'react';

/**
 * GameStatus - Component for displaying game status overlays and feedback messages
 *
 * This component handles the display of game status information including win/lose
 * screens, pause overlays, and feedback toast notifications. It provides different
 * visual treatments based on the game status and includes relevant game statistics
 * and action buttons for game flow control.
 *
 * @component
 * @example
 * ```jsx
 * <GameStatus
 *   gameState={gameState}
 *   onRestartGame={handleRestartGame}
 *   onTogglePause={handleTogglePause}
 * />
 * ```
 *
 * @param {Object} props - Component props
 * @param {Object} props.gameState - Current game state object
 * @param {string} props.gameState.gameStatus - Current game status ('playing', 'won', 'lost', 'paused')
 * @param {Object} props.gameState.score - Current score
 * @param {number} props.gameState.score.human - Human player's score
 * @param {Object} props.gameState.gameStats - Game statistics
 * @param {number} props.gameState.gameStats.totalMoves - Total number of moves made
 * @param {number} props.gameState.gameStats.correctMoves - Number of correct moves
 * @param {number} props.gameState.gameStats.averageTimePerMove - Average time per move in seconds
 * @param {Object|null} props.gameState.feedback - Current feedback message object
 * @param {string} props.gameState.feedback.type - Feedback type ('success' or 'error')
 * @param {string} props.gameState.feedback.message - Feedback message text
 * @param {number} [props.gameState.feedback.points] - Points earned (if applicable)
 * @param {number} [props.gameState.feedback.attempts] - Number of attempts (if applicable)
 * @param {Function} props.onRestartGame - Callback to restart the game
 * @param {Function} props.onTogglePause - Callback to toggle game pause state
 *
 * @returns {JSX.Element} Game status overlays and feedback messages
 */
const GameStatus = memo(({ gameState, onRestartGame, onTogglePause }) => {
  const getGameStatusMessage = () => {
    switch (gameState.gameStatus) {
      case 'won':
        return {
          type: 'success',
          title: '🎉 Congratulations!',
          message: `You've successfully placed all cards in chronological order!\n\nFinal Score: ${gameState.score.human} points\nTotal Moves: ${gameState.gameStats.totalMoves}\nCorrect Moves: ${gameState.gameStats.correctMoves}\nAverage Time: ${gameState.gameStats.averageTimePerMove.toFixed(1)}s per move`,
        };

      case 'paused':
        return {
          type: 'info',
          title: '⏸️ Game Paused',
          message:
            'Your game is currently paused.\n\nClick "Resume Game" to continue playing.',
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
        <div
          className={`fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in ${statusMessage.type === 'success' ? 'success' : statusMessage.type === 'error' ? 'error' : ''}`}
        >
          <div className="bg-white p-12 rounded-lg text-center max-w-lg shadow-xl animate-bounce-in border-4 border-success">
            <h3 className="text-3xl mb-4 text-primary">
              {statusMessage.title}
            </h3>
            <p
              className="text-lg text-text mb-8 leading-relaxed"
              style={{ whiteSpace: 'pre-line' }}
            >
              {statusMessage.message}
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              {gameState.gameStatus === 'paused' ? (
                <button
                  onClick={onTogglePause}
                  className="btn btn-primary btn-large"
                >
                  ▶️ Resume Game
                </button>
              ) : (
                <button
                  onClick={onRestartGame}
                  className="btn btn-primary btn-large"
                >
                  🎮 Play Again
                </button>
              )}
              <button
                onClick={() => (window.location.href = '/')}
                className="btn btn-secondary"
              >
                🏠 Home
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Toast */}
      {gameState.feedback && (
        <div
          className={`fixed top-24 right-5 bg-card rounded-lg p-4 shadow-xl z-50 max-w-sm animate-slide-in-right border-l-4 ${gameState.feedback.type === 'success' ? 'border-success bg-gradient-to-br from-success/10 to-card' : 'border-accent bg-gradient-to-br from-accent/10 to-card'}`}
        >
          <div className="flex flex-col gap-2">
            <p className="text-sm text-text font-medium m-0">
              {gameState.feedback.message}
            </p>
            {gameState.feedback.points && (
              <p className="text-base text-success font-bold m-0">
                +{gameState.feedback.points} points!
              </p>
            )}
            {gameState.feedback.attempts > 1 && (
              <p className="text-xs text-text-light m-0">
                Attempt #{gameState.feedback.attempts}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
});

GameStatus.displayName = 'GameStatus';

export default GameStatus;
