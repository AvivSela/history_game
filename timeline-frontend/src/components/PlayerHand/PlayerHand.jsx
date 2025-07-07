import React, { useState, useEffect } from 'react';
import Card from '../Card/Card';
import './PlayerHand.css';

const PlayerHand = ({ 
  cards = [], 
  selectedCard = null,
  onCardSelect,
  onCardPlay,
  isPlayerTurn = true,
  playerName = "You",
  maxCards = 8
}) => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [cardPositions, setCardPositions] = useState([]);

  // Calculate card positions for spread layout
  useEffect(() => {
    const positions = cards.map((_, index) => {
      const totalCards = cards.length;
      
      // Use a more spaced-out layout approach
      if (totalCards <= 3) {
        // For few cards, use simple spacing without overlap
        const cardWidth = 160; // Approximate card width
        const spacing = cardWidth + 20; // Space between cards
        const totalWidth = (totalCards - 1) * spacing;
        const startX = -totalWidth / 2;
        
        return {
          angle: 0,
          translateX: startX + (index * spacing),
          translateY: 0,
          zIndex: index
        };
      } else {
        // For many cards, use controlled overlap with wider spread
        const cardWidth = 160;
        const overlapFactor = Math.max(0.3, 1 - (totalCards * 0.05)); // Less overlap as cards increase
        const spacing = cardWidth * overlapFactor;
        const totalWidth = (totalCards - 1) * spacing;
        const startX = -totalWidth / 2;
        
        // Slight fan angle for visual appeal
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
  }, [cards.length]);

  const handleCardClick = (card) => {
    if (!isPlayerTurn) return;
    
    if (selectedCard && selectedCard.id === card.id) {
      // Deselect if clicking the same card
      onCardSelect && onCardSelect(null);
    } else {
      // Select the card
      onCardSelect && onCardSelect(card);
    }
  };

  const handleCardDoubleClick = (card) => {
    if (!isPlayerTurn) return;
    // Double-click to play card (will be used in Sprint 2)
    onCardPlay && onCardPlay(card);
  };

  const getCardStyle = (index) => {
    if (cardPositions.length === 0) return {};
    
    const position = cardPositions[index];
    const isSelected = selectedCard && selectedCard.id === cards[index].id;
    const isHovered = hoveredCard === cards[index].id;
    
    let transform = `translateX(${position.translateX}px) translateY(${position.translateY}px) rotate(${position.angle}deg)`;
    
    if (isSelected) {
      transform = `translateX(${position.translateX}px) translateY(-50px) rotate(0deg) scale(1.1)`;
    } else if (isHovered) {
      transform = `translateX(${position.translateX}px) translateY(-35px) rotate(0deg) scale(1.05)`;
    }
    
    return {
      transform,
      zIndex: isSelected ? 1000 : (isHovered ? 999 : position.zIndex),
      transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    };
  };

  if (cards.length === 0) {
    return (
      <div className="player-hand-container">
        <div className="player-hand-header">
          <h3>🎴 {playerName}'s Hand</h3>
          <span className="hand-count">0 cards</span>
        </div>
        <div className="player-hand-empty">
          <div className="empty-hand-message">
            <div className="empty-hand-icon">🎉</div>
            <h4>No cards remaining!</h4>
            <p>Congratulations! You've placed all your cards on the timeline.</p>
            <div className="victory-animation">
              <span className="victory-star">⭐</span>
              <span className="victory-star">⭐</span>
              <span className="victory-star">⭐</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`player-hand-container ${!isPlayerTurn ? 'disabled' : ''} ${isPlayerTurn ? 'active-turn' : ''}`}>
      <div className="player-hand-header">
        <div className="player-info">
          <h3>🎴 {playerName}'s Hand</h3>
          <div className="turn-indicator">
            {isPlayerTurn ? (
              <span className="turn-active">Your Turn</span>
            ) : (
              <span className="turn-waiting">Waiting...</span>
            )}
          </div>
        </div>
        <div className="hand-stats">
          <span className="hand-count">
            {cards.length} / {maxCards} cards
          </span>
          {selectedCard && (
            <span className="selected-indicator">
              "{selectedCard.title}" selected
            </span>
          )}
        </div>
      </div>
      
      <div className="player-hand-area">
        <div className="hand-cards" style={{ height: '280px' }}>
          {cards.map((card, index) => (
            <div
              key={card.id}
              className={`hand-card-wrapper ${selectedCard && selectedCard.id === card.id ? 'selected' : ''}`}
              style={getCardStyle(index)}
            >
              <Card
                event={card}
                isRevealed={false}
                isSelected={selectedCard && selectedCard.id === card.id}
                size="medium"
                onClick={() => handleCardClick(card)}
                onDoubleClick={() => handleCardDoubleClick(card)}
                onMouseEnter={() => setHoveredCard(card.id)}
                onMouseLeave={() => setHoveredCard(null)}
                showHint={false}
                className="player-card"
              />
            </div>
          ))}
        </div>
        
        <div className="hand-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${((maxCards - cards.length) / maxCards) * 100}%` }}
            ></div>
          </div>
          <div className="progress-text">
            {maxCards - cards.length} / {maxCards} cards placed
          </div>
        </div>
      </div>
      
      <div className="player-hand-actions">
        {selectedCard ? (
          <div className="selected-card-actions">
            <div className="selected-card-info">
              <h4>Selected: {selectedCard.title}</h4>
              <p>Click on the timeline to place this card</p>
            </div>
            <div className="action-buttons">
              <button 
                className="btn btn-primary"
                onClick={() => handleCardDoubleClick(selectedCard)}
                disabled={!isPlayerTurn}
                title="Quick place (will show insertion points)"
              >
                📍 Place Card
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => onCardSelect && onCardSelect(null)}
              >
                ❌ Deselect
              </button>
            </div>
          </div>
        ) : (
          <div className="hand-instructions">
            {isPlayerTurn ? (
              <div className="instruction-content">
                <h4>How to play:</h4>
                <ol>
                  <li>Click a card to select it</li>
                  <li>Click on the timeline where it belongs</li>
                  <li>If correct, it stays! If wrong, try again</li>
                </ol>
              </div>
            ) : (
              <div className="waiting-content">
                <div className="waiting-spinner">⏳</div>
                <p>Waiting for your turn...</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Hand capacity warning */}
      {cards.length >= maxCards * 0.8 && (
        <div className="capacity-warning">
          <span className="warning-icon">⚠️</span>
          <span>Hand is getting full! Place some cards on the timeline.</span>
        </div>
      )}
    </div>
  );
};

export default PlayerHand;