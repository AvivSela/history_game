import React, { memo } from 'react';

/**
 * TurnIndicator - Component for displaying current turn information
 * 
 * This component provides visual feedback about whose turn it currently is in the game.
 * It displays different messages and styling based on whether it's the player's turn
 * or the AI's turn, helping players understand the current game state.
 * 
 * @component
 * @example
 * ```jsx
 * <TurnIndicator isPlayerTurn={true} />
 * ```
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isPlayerTurn - Whether it's currently the player's turn
 * 
 * @returns {JSX.Element} Turn indicator with appropriate styling and message
 */
const TurnIndicator = memo(({ isPlayerTurn }) => {
  return (
    <div className={`text-center py-3 px-6 rounded-lg mb-6 ${isPlayerTurn ? 'bg-success/10 border border-success/30 text-success' : 'bg-warning/10 border border-warning/30 text-warning'}`}>
      <div className="font-medium">
        {isPlayerTurn ? (
          <span>🎯 Your Turn - Select a card to play</span>
        ) : (
          <span>🤖 AI is thinking...</span>
        )}
      </div>
    </div>
  );
});

TurnIndicator.displayName = 'TurnIndicator';

export default TurnIndicator; 