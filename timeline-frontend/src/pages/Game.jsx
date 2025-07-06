import React, { useState, useEffect } from 'react';
import { gameAPI, extractData, handleAPIError } from '../utils/api';
import { 
  validateCardPlacement, 
  calculateScore, 
  checkWinCondition, 
  generateHint,
  createGameSession 
} from '../utils/gameLogic';
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
    showInsertionPoints: false,
    feedback: null,
    attempts: {},
    startTime: null
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
        showInsertionPoints: false,
        feedback: null,
        attempts: {},
        startTime: Date.now()
      }));
      
      console.log('🎮 Initializing new game...');
      
      // Fetch random events for the game
      const response = await gameAPI.getRandomEvents(5);
      const events = extractData(response);
      
      console.log('📊 Fetched events:', events);
      
      // Create game session using game logic
      const gameSession = createGameSession(events, { cardCount: 4 });
      
      setGameState(prev => ({
        ...prev,
        playerHand: gameSession.playerHand,
        timeline: gameSession.timeline,
        isLoading: false,
        error: null,
        gameStatus: 'playing',
        score: gameSession.score,
        selectedCard: null,
        showInsertionPoints: false,
        startTime: gameSession.startTime
      }));
      
      console.log('✅ Game initialized successfully');
      console.log('🎯 Starting timeline card:', gameSession.timeline[0].title);
      console.log('🎴 Player hand:', gameSession.playerHand.map(c => c.title));
      
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
      showInsertionPoints: !!card, // Show insertion points when card is selected
      feedback: null // Clear previous feedback
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

    const card = gameState.selectedCard;
    const placementStartTime = Date.now();
    
    console.log(`🎯 Placing card "${card.title}" at position ${position}`);
    
    // Validate the card placement using game logic
    const validation = validateCardPlacement(card, gameState.timeline, position);
    console.log('🔍 Placement validation:', validation);
    
    // Calculate time taken to place card
    const timeToPlace = (placementStartTime - gameState.startTime) / 1000;
    
    // Track attempts for this card
    const cardAttempts = (gameState.attempts[card.id] || 0) + 1;
    const newAttempts = { ...gameState.attempts, [card.id]: cardAttempts };
    
    if (validation.isCorrect) {
      // Correct placement
      const scoreEarned = calculateScore(true, timeToPlace, cardAttempts, card.difficulty);
      
      // Add card to timeline at correct position
      const newTimeline = [...gameState.timeline];
      const sortedTimeline = newTimeline.sort((a, b) => 
        new Date(a.dateOccurred) - new Date(b.dateOccurred)
      );
      
      // Insert card at correct position
      sortedTimeline.splice(validation.correctPosition, 0, { 
        ...card, 
        isRevealed: true,
        placedAt: Date.now()
      });
      
      // Remove card from player hand
      const newPlayerHand = gameState.playerHand.filter(c => c.id !== card.id);
      
      // Check if game is won
      const hasWon = checkWinCondition(newPlayerHand);
      
      setGameState(prev => ({
        ...prev,
        timeline: sortedTimeline,
        playerHand: newPlayerHand,
        selectedCard: null,
        showInsertionPoints: false,
        score: prev.score + scoreEarned,
        feedback: {
          type: 'success',
          message: validation.feedback,
          points: scoreEarned
        },
        gameStatus: hasWon ? 'won' : 'playing',
        attempts: newAttempts
      }));

      console.log(`✅ Card placed correctly! +${scoreEarned} points`);
      
      // Clear feedback after 3 seconds
      setTimeout(() => {
        setGameState(prev => ({ ...prev, feedback: null }));
      }, 3000);
      
    } else {
      // Incorrect placement
      setGameState(prev => ({
        ...prev,
        selectedCard: null,
        showInsertionPoints: false,
        feedback: {
          type: 'error',
          message: validation.feedback,
          hint: generateHint(card, gameState.timeline)
        },
        attempts: newAttempts
      }));

      console.log('❌ Card placed incorrectly');
      
      // Clear feedback after 4 seconds
      setTimeout(() => {
        setGameState(prev => ({ ...prev, feedback: null }));
      }, 4000);
    }
  };

  const handleTimelineCardClick = (event) => {
    console.log('🔍 Timeline card clicked:', event.title);
    // Future feature: show event details modal
  };

  const handleRestartGame = () => {
    console.log('🔄 Restarting game...');
    initializeGame();
  };

  const handleShowHint = () => {
    if (!gameState.selectedCard) return;
    
    const hint = generateHint(gameState.selectedCard, gameState.timeline);
    setGameState(prev => ({
      ...prev,
      feedback: {
        type: 'hint',
        message: hint
      }
    }));
    
    // Clear hint after 3 seconds
    setTimeout(() => {
      setGameState(prev => ({ ...prev, feedback: null }));
    }, 3000);
  };

  const getGameStatusMessage = () => {
    switch (gameState.gameStatus) {
      case 'won':
        const totalTime = (Date.now() - gameState.startTime) / 1000;
        const avgTime = totalTime / (gameState.timeline.length - 1); // -1 for starting card
        
        return {
          type: 'success',
          title: '🎉 Congratulations!',
          message: `You've successfully placed all cards on the timeline!\n
                   Final Score: ${gameState.score} points\n
                   Time: ${Math.round(totalTime)}s (${Math.round(avgTime)}s per card)`
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
              <p style={{ whiteSpace: 'pre-line' }}>{statusMessage.message}</p>
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

        {/* Feedback Toast */}
        {gameState.feedback && (
          <div className={`feedback-toast ${gameState.feedback.type}`}>
            <div className="feedback-content">
              <p className="feedback-message">{gameState.feedback.message}</p>
              {gameState.feedback.points && (
                <p className="feedback-points">+{gameState.feedback.points} points!</p>
              )}
              {gameState.feedback.hint && (
                <p className="feedback-hint">{gameState.feedback.hint}</p>
              )}
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
            <button 
              onClick={handleShowHint} 
              className="btn btn-secondary"
              disabled={!gameState.selectedCard}
            >
              💡 Show Hint
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
                <div className="card-attempts">
                  Attempts: {gameState.attempts[gameState.selectedCard.id] || 0}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;