import React from 'react';

const AIHand = ({ aiHand }) => {
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
};

export default AIHand; 