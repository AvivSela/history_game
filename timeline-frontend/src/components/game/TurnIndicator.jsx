import React from 'react';

const TurnIndicator = ({ isPlayerTurn }) => {
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
};

export default TurnIndicator; 