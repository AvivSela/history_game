import React, { useState, useEffect } from 'react';
import { gameAPI, extractData, handleAPIError } from '../utils/api';
import Timeline from '../components/Timeline/Timeline';
import PlayerHand from '../components/PlayerHand/PlayerHand';
import './Game.css';

const Game = () => {
  const [gameState, setGameState] = useState({
    playerHand: [],
    timeline: [],
    isLoading: true,
    error: null,
    currentPlayer: 1,
    gameStatus: 'playing', // 'playing', 'won', 'lost'
    score: 0,
    selectedCard: null,
    showInsertionPoints: false
  });

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = async () => {
    try {
      setGameState(prev => ({ 
        ...prev, 
        isLoading: true, 
        error: null,
        selectedCard: null,
        showInsertionPoints: false
      }));
      
      console.log('🎮 Initializing new game...');
      
      // Fetch random events for the game
      const response = await gameAPI.getRandomEvents(5);
      const events = extractData(response);
      
      console.log('📊 Fetched events:', events);
      
      // Take first event as starting timeline card
      const startingCard = events[0];
      const playerCards = events.slice(1);
      
      setGameState(prev => ({
        ...prev,
        playerHand: playerCards,
        timeline: [{ ...startingCard, isRevealed: true }],
        isLoading: false,
        error: null,
        gameStatus: 'playing',
        score: 0,
        selectedCard: null,
        showInsertionPoints: false
      }));
      
      console.log('✅ Game initialized successfully');
      console.log('🎯 Starting timeline card:', startingCard.title);
      console.log('🎴 Player hand:', playerCards.map(c => c.title));
      
    } catch (error) {
      console.error('❌ Error initializing game:', error);
      const errorMessage = handleAPIError(error, 'Failed to load game');
      setGameState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }));
    }
  };

  const handleCardSelect = (card) => {
    console.log('🎯 Card selected:', card?.title || 'none');
    setGameState(prev => ({
      ...prev,
      selectedCard: card,
      showInsertionPoints: !!card // Show insertion points when card is selected
    }));
  };

  const handleCardPlay = (card) => {
    console.log('🎮 Attempting to play card:', card.title);
    // Auto-select the card and show insertion points
    handleCardSelect(card);
  };

  const handleInsertionPointClick = (position) => {
    if (!gameState.selectedCard) {
      console.log('❌ No card selected');
      return;
    }

    console.log(`🎯 Placing card "${gameState.selectedCard.title}" at position ${position}`);
    
    // This is where we'll implement the actual placement logic in Sprint 2
    // For now, let's simulate placing the card correctly
    const newTimeline = [...gameState.timeline];
    const cardToPlace = { ...gameState.selectedCard, isRevealed: true };
    
    // Sort timeline to find correct insertion point
    const sortedTimeline = [...newTimeline].sort((a, b) => 
      new Date(a.dateOccurred) - new Date(b.dateOccurred)
    );
    
    // For demonstration, let's just add it to the timeline
    newTimeline.push(cardToPlace);
    
    // Remove card from player hand
    const newPlayerHand = gameState.playerHand.filter(card => 
      card.id !== gameState.selectedCard.id
    );
    
    // Update game state
    setGameState(prev => ({
      ...prev,
      timeline: newTimeline,
      playerHand: newPlayerHand,
      selectedCard: null,
      showInsertionPoints: false,
      score: prev.score + 10,
      gameStatus: newPlayerHand.length === 0 ? 'won' : 'playing'
    }));

    console.log('✅ Card placed successfully!');
  };

  const handleTimelineCardClick = (event) => {
    console.log('🔍 Timeline card clicked:', event.title);
    // Future feature: show event details modal
  };

  const handleRestartGame = () => {
    console.log('🔄 Restarting game...');
    initializeGame();
  };

  const getGameStatusMessage = () => {
    switch (gameState.gameStatus) {
      case 'won':
        return {
          type: 'success',
          title: '🎉 Congratulations!',
          message: `You've successfully placed all cards on the timeline! Final score: ${gameState.score}`
        };
      case 'lost':
        return {
          type: 'error',
          title: '😔 Game Over',
          message: 'Better luck next time! Try again to improve your historical knowledge.'
        };
      case 'playing':
      default:
        return null;
    }
  };

  if (gameState.isLoading) {
    return (
      <div className="game-page">
        <div className="container">
          <div className="game-loading">
            <div className="loading-spinner">
              <div className="loading loading-large"></div>
              <h2>Loading Timeline Game...</h2>
              <p>Fetching historical events from our database</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState.error) {
    return (
      <div className="game-page">
        <div className="container">
          <div className="game-error">
            <div className="error-card">
              <h2>🚫 Oops! Something went wrong</h2>
              <p className="error-message">{gameState.error}</p>
              <div className="error-actions">
                <button onClick={handleRestartGame} className="btn btn-primary">
                  🔄 Try Again
                </button>
                <button onClick={() => window.location.href = '/'} className="btn btn-secondary">
                  🏠 Go Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusMessage = getGameStatusMessage();

  return (
    <div className="game-page">
      <div className="container">
        {statusMessage && (
          <div className={`game-status-overlay ${statusMessage.type}`}>
            <div className="status-content">
              <h3>{statusMessage.title}</h3>
              <p>{statusMessage.message}</p>
              <div className="status-actions">
                <button onClick={handleRestartGame} className="btn btn-primary btn-large">
                  🎮 Play Again
                </button>
                <button onClick={() => window.location.href = '/'} className="btn btn-secondary">
                  🏠 Home
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="game-header">
          <div className="game-title-section">
            <h1>🎮 Timeline Game</h1>
            <p>Place historical events in chronological order</p>
          </div>
          <div className="game-stats">
            <div className="stat-item">
              <span className="stat-label">Score</span>
              <span className="stat-value">{gameState.score}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Cards Left</span>
              <span className="stat-value">{gameState.playerHand.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Timeline</span>
              <span className="stat-value">{gameState.timeline.length}</span>
            </div>
          </div>
        </div>

        <div className="game-board">
          <div className="timeline-section">
            <Timeline
              events={gameState.timeline}
              onCardClick={handleTimelineCardClick}
              highlightInsertionPoints={gameState.showInsertionPoints}
              onInsertionPointClick={handleInsertionPointClick}
              selectedCard={gameState.selectedCard}
            />
          </div>

          <div className="player-section">
            <PlayerHand
              cards={gameState.playerHand}
              selectedCard={gameState.selectedCard}
              onCardSelect={handleCardSelect}
              onCardPlay={handleCardPlay}
              isPlayerTurn={gameState.gameStatus === 'playing'}
              playerName="Player 1"
              maxCards={8}
            />
          </div>
        </div>

        <div className="game-controls">
          <div className="control-buttons">
            <button onClick={handleRestartGame} className="btn btn-secondary">
              🔄 New Game
            </button>
            <button 
              onClick={() => handleCardSelect(null)} 
              className="btn btn-secondary"
              disabled={!gameState.selectedCard}
            >
              ❌ Clear Selection
            </button>
          </div>
          
          <div className="game-info">
            <div className="info-panel">
              <h3>📖 How to Play</h3>
              <ol>
                <li>Select a card from your hand</li>
                <li>Click where it belongs on the timeline</li>
                <li>If correct, it stays! If wrong, try again</li>
                <li>Place all cards to win!</li>
              </ol>
            </div>
            
            {gameState.selectedCard && (
              <div className="selected-info">
                <h3>🎯 Selected Card</h3>
                <h4>"{gameState.selectedCard.title}"</h4>
                <p>{gameState.selectedCard.description}</p>
                <p className="hint">💡 Click on the timeline to place it!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;