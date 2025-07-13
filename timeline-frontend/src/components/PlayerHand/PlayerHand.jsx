import React, { useState, useEffect } from 'react';
import Card from '../Card/Card';

const PlayerHand = ({ 
  cards = [], 
  selectedCard = null,
  onCardSelect,
  onCardPlay,
  isPlayerTurn = true,
  playerName = "You",
  maxCards = 8,
}) => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [cardPositions, setCardPositions] = useState([]);

  // Calculate card positions for spread layout
  useEffect(() => {
    const positions = cards.map((_, index) => {
      const totalCards = cards.length;
      if (totalCards <= 3) {
        const cardWidth = 160;
        const spacing = cardWidth + 20;
        const totalWidth = (totalCards - 1) * spacing;
        const startX = -totalWidth / 2;
        return {
          angle: 0,
          translateX: startX + (index * spacing),
          translateY: 0,
          zIndex: index
        };
      } else {
        const cardWidth = 160;
        const overlapFactor = Math.max(0.3, 1 - (totalCards * 0.05));
        const spacing = cardWidth * overlapFactor;
        const totalWidth = (totalCards - 1) * spacing;
        const startX = -totalWidth / 2;
        const maxAngle = Math.min(totalCards * 3, 25);
        const angleStep = totalCards > 1 ? maxAngle / (totalCards - 1) : 0;
        const angle = (-maxAngle / 2) + (index * angleStep);
        return {
          angle,
          translateX: startX + (index * spacing),
          translateY: Math.abs(angle) * 0.8,
          zIndex: index
        };
      }
    });
    setCardPositions(positions);
  }, [cards, cards.length]);

  const handleCardClick = (card) => {
    if (!isPlayerTurn) return;
    if (selectedCard && selectedCard.id === card.id) {
      onCardSelect && onCardSelect(null);
    } else {
      onCardSelect && onCardSelect(card);
    }
  };

  const getCardStyle = (index) => {
    if (cardPositions.length === 0) return {};
    const position = cardPositions[index];
    if (!position) return {};
    const isSelected = selectedCard && selectedCard.id === cards[index].id;
    const isHovered = hoveredCard === cards[index].id;
    let transform = `translateX(${position.translateX}px) translateY(${position.translateY}px) rotate(${position.angle}deg)`;
    if (isSelected) {
      transform = `translateX(${position.translateX}px) translateY(-50px) rotate(0deg)`;
    } else if (isHovered) {
      transform = `translateX(${position.translateX}px) translateY(${position.translateY}px) rotate(${position.angle}deg) scale(1.1)`;
    }
    return {
      transform,
      zIndex: isSelected ? 1000 : (isHovered ? 999 : position.zIndex),
      transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      transformOrigin: 'center bottom'
    };
  };

  if (cards.length === 0) {
    return (
      <div className="bg-card rounded-lg p-5 shadow-md my-5 border-2 border-border transition-all duration-300 relative overflow-visible w-full max-w-none" data-testid="player-hand-container">
        <div className="flex justify-between items-start mb-5 pb-4 border-b-2 border-border">
          <h3 className="text-primary text-xl font-bold m-0 mb-2">🎴 {playerName}'s Hand</h3>
          <span className="bg-accent text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">0 cards</span>
        </div>
        <div className="text-center py-12">
          <div className="bg-gradient-to-br from-success/10 to-success/5 rounded-lg p-8 border border-success/20" data-testid="hand-victory-message">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h4 className="text-primary text-lg font-bold mb-2">No cards remaining!</h4>
            <p className="text-text-light mb-4">Congratulations! You've placed all your cards on the timeline.</p>
            <div className="flex justify-center gap-2">
              <span className="text-2xl animate-pulse">⭐</span>
              <span className="text-2xl animate-pulse delay-75">⭐</span>
              <span className="text-2xl animate-pulse delay-150">⭐</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`player-hand-container bg-card rounded-lg p-5 shadow-md my-5 border-2 border-border transition-all duration-300 relative overflow-visible w-full max-w-none ${!isPlayerTurn ? 'opacity-70 pointer-events-none filter grayscale' : ''} ${isPlayerTurn ? 'border-success shadow-[0_0_0_3px_rgba(39,174,96,0.2)] shadow-lg' : ''}`} data-testid="player-hand-container" style={{ overflow: 'visible' }}>
      {isPlayerTurn && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-success via-green-500 to-success animate-pulse"></div>
      )}
      <div className="flex justify-between items-start mb-5 pb-4 border-b-2 border-border">
        <div className="player-info">
          <h3 className="text-primary text-xl font-bold m-0 mb-2">🎴 {playerName}'s Hand</h3>
          <div className="text-xs font-semibold uppercase tracking-wider">
            {isPlayerTurn ? (
              <span className="text-success bg-success/10 px-2 py-1 rounded-xl border border-success/30">Your Turn</span>
            ) : (
              <span className="text-text-light bg-background px-2 py-1 rounded-xl border border-border">Waiting...</span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className="bg-accent text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            {cards.length} / {maxCards} cards
          </span>
          {selectedCard && (
            <span className="text-xs text-success font-semibold italic bg-success/10 px-2 py-0.5 rounded-lg border border-success/30 max-w-48 overflow-hidden text-ellipsis whitespace-nowrap">
              "{selectedCard.title}" selected
            </span>
          )}
        </div>
      </div>
      <div className="mb-5 relative">
        <div className="card-area relative flex justify-center items-center py-[80px] px-[60px] min-h-[395px] w-full bg-gradient-to-br from-blue-50/5 to-purple-50/5 rounded-lg border border-blue-200/10 overflow-x-auto overflow-y-visible md:py-[60px] md:px-5 md:min-h-[355px] sm:py-[40px] sm:px-2 sm:min-h-[335px]">
          {cards.map((card, index) => {
            const isSelected = selectedCard && selectedCard.id === card.id;
            return (
              <div
                key={card.id}
                className="absolute cursor-pointer drop-shadow-md player-card-wrapper"
                style={{
                  ...getCardStyle(index),
                  willChange: 'transform',
                  overflow: 'visible',
                  clipPath: 'none'
                }}
                data-testid="player-card-wrapper"
                {...(isSelected ? { 'data-testid': 'hand-selected-card' } : {})}
              >
                <Card
                  event={card}
                  isSelected={isSelected}
                  size="small"
                  onClick={() => handleCardClick(card)}
                  onMouseEnter={() => setHoveredCard(card.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className="player-card"
                />
              </div>
            );
          })}
        </div>
        <div className="mt-4 text-center">
          <div className="w-full h-2 bg-border rounded overflow-hidden mb-2">
            <div 
              className="h-full bg-gradient-to-r from-success to-green-500 transition-all duration-500 rounded"
              style={{ width: `${((maxCards - cards.length) / maxCards) * 100}%` }}
            ></div>
          </div>
          <div className="text-xs text-text-light font-medium">
            {maxCards - cards.length} / {maxCards} cards placed
          </div>
        </div>
      </div>
      <div className="bg-background rounded-lg p-4 border border-border">
        {selectedCard ? (
          <div className="flex flex-col gap-4">
            <div>
              <h4 className="m-0 mb-2 text-primary text-base">Selected: {selectedCard.title}</h4>
              <p className="m-0 text-text-light text-sm italic">Click on the timeline to place this card</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button 
                className="btn btn-secondary flex-1 min-w-30 text-sm px-4 py-2.5"
                onClick={() => onCardSelect && onCardSelect(null)}
              >
                ❌ Deselect
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            {isPlayerTurn ? (
              <div>
                <h4 className="m-0 mb-3 text-primary text-base">How to play:</h4>
                <ol className="text-left list-decimal list-inside space-y-1 text-sm text-text-light">
                  <li>Click a card to select it</li>
                  <li>Click on the timeline where it belongs</li>
                  <li>If correct, it stays! If wrong, try again</li>
                </ol>
              </div>
            ) : (
              <div>
                <div className="text-2xl mb-2 animate-spin">⏳</div>
                <p className="text-text-light">Waiting for your turn...</p>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};

export default PlayerHand;