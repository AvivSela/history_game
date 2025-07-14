import React, { memo } from 'react';

/**
 * AIHand - Component for displaying the AI opponent's hand of cards
 * 
 * This component shows a visual representation of the AI's hand without revealing
 * the actual card details. It displays placeholder cards to indicate how many
 * cards the AI has remaining, providing players with strategic information
 * about the game state.
 * 
 * @component
 * @example
 * ```jsx
 * <AIHand aiHand={[1, 2, 3]} />
 * ```
 * 
 * @param {Object} props - Component props
 * @param {Array} [props.aiHand] - Array representing AI's hand (length indicates card count)
 * 
 * @returns {JSX.Element|null} AI hand display or null if no cards
 */
const AIHand = memo(({ aiHand }) => {
  if (!aiHand || aiHand.length === 0) {
    return null;
  }

  return (
    <div className="bg-card rounded-lg p-5 shadow-md my-5 border border-border">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-primary text-lg font-bold">🤖 AI Hand</h3>
        <span className="bg-accent text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
          {aiHand.length} cards
        </span>
      </div>
      <div className="flex gap-2 flex-wrap">
        {aiHand.map((_, index) => (
          <div key={index} className="w-12 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 border border-gray-300">
            🎴
          </div>
        ))}
      </div>
    </div>
  );
});

AIHand.displayName = 'AIHand';

export default AIHand; 