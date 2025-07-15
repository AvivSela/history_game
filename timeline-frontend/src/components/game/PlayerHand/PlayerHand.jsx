import React, { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import Card from '../Card';
import { animations, accessibility, performance } from '@utils/animation';
import { UI_DIMENSIONS, TIMING, STYLING } from '@constants/gameConstants';

/**
 * PlayerHand - Component for displaying and managing the player's hand of cards
 * 
 * This component renders the player's hand with cards arranged in a spread layout.
 * It supports card selection, animations for card addition/removal, and provides
 * visual feedback for hover and selection states. The component automatically
 * adjusts the card layout based on the number of cards and provides smooth
 * animations with accessibility support.
 * 
 * @component
 * @example
 * ```jsx
 * <PlayerHand
 *   cards={[
 *     {
 *       id: 1,
 *       title: "World War II",
 *       dateOccurred: "1939-09-01",
 *       category: "Military"
 *     }
 *   ]}
 *   selectedCard={selectedCard}
 *   onCardSelect={handleCardSelect}
 *   isPlayerTurn={true}
 *   playerName="Player 1"
 *   maxCards={8}
 * />
 * ```
 * 
 * @param {Object} props - Component props
 * @param {Array} [props.cards=[]] - Array of card objects in the player's hand
 * @param {Object} props.cards[].id - Unique identifier for the card
 * @param {string} props.cards[].title - Title of the historical event
 * @param {string} props.cards[].dateOccurred - Date when the event occurred (ISO format)
 * @param {string} props.cards[].category - Category of the event
 * @param {Object|null} [props.selectedCard=null] - Currently selected card
 * @param {Function} [props.onCardSelect] - Callback when a card is selected/deselected
 * @param {boolean} [props.isPlayerTurn=true] - Whether it's currently the player's turn
 * @param {string} [props.playerName="You"] - Name of the player to display
 * @param {number} [props.maxCards=8] - Maximum number of cards that can be in hand
 * @param {React.Ref} ref - Forwarded ref with animation methods
 * 
 * @returns {JSX.Element} The player hand component with spread card layout
 */
const PlayerHand = forwardRef(({ 
  cards = [], 
  selectedCard = null,
  onCardSelect,
  isPlayerTurn = true,
  playerName = "You",
  maxCards = 8,
}, ref) => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [cardPositions, setCardPositions] = useState([]);
  
  // Animation state management
  const [animatingCards, setAnimatingCards] = useState(new Set());
  const [newCardId, setNewCardId] = useState(null);
  const animationRefs = useRef(new Map());

  // Calculate card positions for spread layout
  useEffect(() => {
    const positions = cards.map((_, index) => {
      const totalCards = cards.length;
      if (totalCards <= 3) {
        const cardWidth = UI_DIMENSIONS.CARD_WIDTH;
        const spacing = cardWidth + UI_DIMENSIONS.CARD_SPACING;
        const totalWidth = (totalCards - 1) * spacing;
        const startX = -totalWidth / 2;
        return {
          angle: 0,
          translateX: startX + (index * spacing),
          translateY: 0,
          zIndex: index
        };
      } else {
        const cardWidth = UI_DIMENSIONS.CARD_WIDTH;
        const overlapFactor = Math.max(UI_DIMENSIONS.CARD_OVERLAP_FACTOR, 1 - (totalCards * UI_DIMENSIONS.CARD_OVERLAP_REDUCTION));
        const spacing = cardWidth * overlapFactor;
        const totalWidth = (totalCards - 1) * spacing;
        const startX = -totalWidth / 2;
        const maxAngle = Math.min(totalCards * UI_DIMENSIONS.HAND_ANGLE_MULTIPLIER, UI_DIMENSIONS.HAND_MAX_ANGLE);
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

  // Debounced animation trigger to prevent rapid calls
  const debouncedAnimateCard = useCallback(
    async (cardId, animationType) => {
      const startTime = window.performance.now();
      
      // Check if the card is actually in the current state
      const cardInState = cards.find(card => card.id === cardId);
      if (!cardInState) {
        return;
      }
      
      try {
        // Wait for element to be available in DOM with more robust retry logic
        let cardElement = document.querySelector(`[data-card-id="${cardId}"]`);
        if (!cardElement) {
          // More robust retry with longer delays and more attempts
          for (let i = 0; i < 20; i++) {
            await new Promise(resolve => setTimeout(resolve, 100)); // Longer delay
            cardElement = document.querySelector(`[data-card-id="${cardId}"]`);
            if (cardElement) {
              break;
            }
          }
        }
        
        if (!cardElement) {
          return;
        }

        if (!accessibility.shouldAnimate()) {
          // Apply instant state changes for reduced motion
          if (animationType === 'removal') {
            cardElement.style.opacity = '0';
            cardElement.style.transform = 'scale(0.9)';
          } else if (animationType === 'addition') {
            cardElement.style.opacity = '1';
            cardElement.style.transform = 'scale(1)';
          }
          return;
        }

        // Store animation reference for cleanup
        animationRefs.current.set(cardId, { element: cardElement, type: animationType });

        if (animationType === 'removal') {
          setAnimatingCards(prev => new Set([...prev, cardId]));
          
          // Use new animation system
          await animations.sequence([cardElement], [
            { element: cardElement, animation: 'card-shake' },
            { element: cardElement, animation: 'card-fade-out' }
          ]);
          
          // Cleanup after animation
          animations.cleanup(cardElement);
          setAnimatingCards(prev => {
            const newSet = new Set(prev);
            newSet.delete(cardId);
            return newSet;
          });
          
        } else if (animationType === 'addition') {
          setNewCardId(cardId);
          
          // Use new animation system
          await animations.sequence([cardElement], [
            { element: cardElement, animation: 'card-bounce-in' },
            { element: cardElement, animation: 'card-highlight' }
          ]);
          
          setNewCardId(null);
        }
        
        // Performance monitoring is handled by the animation system
        
      } catch (error) {
        // Fallback: apply instant state change
        const cardElement = document.querySelector(`[data-card-id="${cardId}"]`);
        if (cardElement) {
          animations.cleanup(cardElement);
        }
      } finally {
        // Cleanup animation reference
        animationRefs.current.delete(cardId);
      }
    },
    [cards, onCardSelect]
  );

  // Animation methods with proper error handling
  const animateCardRemoval = useCallback(async (cardId) => {
    await debouncedAnimateCard(cardId, 'removal');
  }, [debouncedAnimateCard]);

  const animateNewCard = useCallback(async (cardId) => {
    await debouncedAnimateCard(cardId, 'addition');
  }, [debouncedAnimateCard]);

  // Cleanup animations on component unmount
  useEffect(() => {
    const currentRefs = animationRefs.current;
    return () => {
      // Cleanup all ongoing animations
      currentRefs.forEach(({ element }) => {
        animations.cleanup(element);
      });
      currentRefs.clear();
    };
  }, []);

  // Expose animation methods via ref for parent component
  useImperativeHandle(ref, () => ({
    animateCardRemoval,
    animateNewCard,
    isAnimating: animatingCards.size > 0 || newCardId !== null
  }));

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
      transform = `translateX(${position.translateX}px) translateY(-${UI_DIMENSIONS.HAND_SELECTED_OFFSET}px) rotate(0deg)`;
    } else if (isHovered) {
      transform = `translateX(${position.translateX}px) translateY(${position.translateY}px) rotate(${position.angle}deg) scale(${UI_DIMENSIONS.HAND_HOVER_SCALE})`;
    }
    return {
      transform,
      zIndex: isSelected ? UI_DIMENSIONS.Z_INDEX.SELECTED_CARD : (isHovered ? UI_DIMENSIONS.Z_INDEX.HOVERED_CARD : position.zIndex),
      transition: `all ${TIMING.TRANSITION_DURATION}ms ${STYLING.TRANSITION_EASING}`,
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
                  isAnimating={animatingCards.has(card.id)}
                  isNewCard={newCardId === card.id}
                  size="small"
                  onClick={() => handleCardClick(card)}
                  onMouseEnter={() => setHoveredCard(card.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className="player-card"
                  data-card-id={card.id}
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
});

PlayerHand.displayName = 'PlayerHand';

export default PlayerHand;