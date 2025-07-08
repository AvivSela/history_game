import React, { useState, useEffect } from 'react';
import { gameAPI, extractData, handleAPIError } from '../utils/api';
import { 
  calculateScore, 
  checkWinCondition, 
  generateHint,
  createGameSession 
} from '../utils/gameLogic';
import { 
  validatePlacementWithTolerance, 
  generateSmartInsertionPoints 
} from '../utils/timelineLogic';
import { createAIOpponent, getAIThinkingTime } from '../utils/aiLogic';
import Timeline from '../components/Timeline/Timeline';
import PlayerHand from '../components/PlayerHand/PlayerHand';
import './Game.css';

const Game = () => {
  const [gameState, setGameState] = useState({
    // Core game data
    playerHand: [],
    timeline: [],
    aiHand: [],
    
    // Game status
    isLoading: true,
    error: null,
    gameStatus: 'lobby', // 'lobby', 'playing', 'paused', 'won', 'lost'
    currentPlayer: 'human', // 'human', 'ai'
    gameMode: 'single', // 'single', 'ai'
    difficulty: 'medium',
    
    // UI state
    selectedCard: null,
    showInsertionPoints: false,
    feedback: null,
    
    // Game metrics
    score: { human: 0, ai: 0 },
    attempts: {},
    startTime: null,
    turnStartTime: null,
    gameStats: {
      totalMoves: 0,
      correctMoves: 0,
      hintsUsed: 0,
      averageTimePerMove: 0
    },
    
    // AI
    aiOpponent: null,
    insertionPoints: []
  });

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = async (mode = 'single', diff = 'medium') => {
    try {
      setGameState(prev => ({ 
        ...prev, 
        isLoading: true, 
        error: null,
        gameStatus: 'loading',
        timeline: [], // Clear timeline immediately
        playerHand: [],
        aiHand: [],
        selectedCard: null,
        showInsertionPoints: false,
        feedback: null
      }));
      
      console.log('🎮 Initializing game:', { mode, difficulty: diff });
      
      // Create AI opponent if needed
      let aiOpponent = null;
      if (mode === 'ai') {
        aiOpponent = createAIOpponent(diff);
        console.log('🤖 AI created:', aiOpponent.name);
      }
      
      // Fetch events from API
      const cardCount = mode === 'ai' ? 8 : 5;
      const response = await gameAPI.getRandomEvents(cardCount);
      const events = extractData(response);
      
      // Create game session
      const session = createGameSession(events, { 
        cardCount: cardCount - 1, // -1 for starting card
        difficulty: diff,
        gameMode: mode 
      });
      
      // Split cards for AI mode
      let humanCards = session.playerHand;
      let aiCards = [];
      
      if (mode === 'ai' && session.playerHand.length > 2) {
        const half = Math.ceil(session.playerHand.length / 2);
        humanCards = session.playerHand.slice(0, half);
        aiCards = session.playerHand.slice(half);
      }
      
      setGameState(prev => ({
        ...prev,
        timeline: session.timeline,
        playerHand: humanCards,
        aiHand: aiCards,
        gameMode: mode,
        difficulty: diff,
        aiOpponent,
        gameStatus: 'playing',
        currentPlayer: 'human',
        score: { human: 0, ai: 0 },
        startTime: session.startTime,
        turnStartTime: Date.now(),
        attempts: {},
        gameStats: {
          totalMoves: 0,
          correctMoves: 0,
          hintsUsed: 0,
          averageTimePerMove: 0
        },
        selectedCard: null,
        showInsertionPoints: false,
        feedback: null,
        insertionPoints: [],
        isLoading: false,
        error: null
      }));
      
      console.log('✅ Game initialized successfully');
      
    } catch (error) {
      console.error('❌ Error initializing game:', error);
      const errorMessage = handleAPIError(error, 'Failed to load game');
      setGameState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
        gameStatus: 'error'
      }));
    }
  };

  const handleCardSelect = (card) => {
    if (gameState.gameStatus !== 'playing' || gameState.currentPlayer !== 'human') {
      return;
    }

    const insertionPoints = card ? 
      generateSmartInsertionPoints(gameState.timeline, card) : [];

    setGameState(prev => ({
      ...prev,
      selectedCard: card,
      showInsertionPoints: !!card,
      insertionPoints,
      feedback: null
    }));
  };

  const handleCardPlay = (card) => {
    handleCardSelect(card);
  };

  const handleInsertionPointClick = (position) => {
    if (!gameState.selectedCard || gameState.gameStatus !== 'playing' || gameState.currentPlayer !== 'human') {
      return;
    }

    placeCard(position, 'human');
  };

  const placeCard = (position, player = 'human') => {
    const selectedCard = player === 'human' ? gameState.selectedCard : gameState.aiOpponent?.selectedCard;
    if (!selectedCard) return;

    const turnTime = (Date.now() - gameState.turnStartTime) / 1000;
    const cardAttempts = (gameState.attempts[selectedCard.id] || 0) + 1;

    // Validate placement
    const validation = validatePlacementWithTolerance(
      selectedCard, 
      gameState.timeline, 
      position
    );

    console.log('🎯 Placement validation:', validation);

    let newState = { ...gameState };

    if (validation.isCorrect) {
      // Successful placement - only exact matches accepted
      const scoreEarned = Math.round(
        calculateScore(true, turnTime, cardAttempts, selectedCard.difficulty)
      );

      // Add card to timeline at user's chosen position
      const newTimeline = [...gameState.timeline];
      newTimeline.splice(position, 0, {
        ...selectedCard,
        isRevealed: true,
        placedAt: Date.now(),
        placedBy: player
      });

      // Remove card from player's hand
      const handKey = player === 'human' ? 'playerHand' : 'aiHand';
      const newHand = gameState[handKey].filter(card => card.id !== selectedCard.id);

      // Update scores
      const newScore = { ...gameState.score };
      newScore[player] += scoreEarned;

      // Check win condition
      const hasWon = checkWinCondition(newHand);
      let newGameStatus = gameState.gameStatus;
      
      if (hasWon || (gameState.playerHand.length === 1 && gameState.aiHand.length === 0)) {
        newGameStatus = 'won';
      }

      // Determine next player
      let nextPlayer = gameState.currentPlayer;
      if (gameState.gameMode === 'ai' && newGameStatus === 'playing') {
        nextPlayer = player === 'human' ? 'ai' : 'human';
      }

      newState = {
        ...newState,
        timeline: newTimeline,
        [handKey]: newHand,
        score: newScore,
        selectedCard: null,
        showInsertionPoints: false,
        insertionPoints: [],
        currentPlayer: nextPlayer,
        turnStartTime: Date.now(),
        gameStatus: newGameStatus,
        attempts: { ...gameState.attempts, [selectedCard.id]: cardAttempts },
        gameStats: {
          ...gameState.gameStats,
          totalMoves: gameState.gameStats.totalMoves + 1,
          correctMoves: gameState.gameStats.correctMoves + 1,
          averageTimePerMove: calculateAverageTime(gameState.gameStats, turnTime)
        },
        feedback: {
          type: 'success',
          message: validation.feedback,
          points: scoreEarned
        }
      };

    } else {
      // Incorrect placement
      newState = {
        ...newState,
        selectedCard: null,
        showInsertionPoints: false,
        insertionPoints: [],
        attempts: { ...gameState.attempts, [selectedCard.id]: cardAttempts },
        gameStats: {
          ...gameState.gameStats,
          totalMoves: gameState.gameStats.totalMoves + 1,
          averageTimePerMove: calculateAverageTime(gameState.gameStats, turnTime)
        },
        feedback: {
          type: 'error',
          message: validation.feedback,
          correctPosition: validation.correctPosition,
          attempts: cardAttempts
        }
      };

      // Switch turns in AI mode
      if (gameState.gameMode === 'ai') {
        newState.currentPlayer = player === 'human' ? 'ai' : 'human';
        newState.turnStartTime = Date.now();
      }
    }

    setGameState(newState);

    // Clear feedback after delay
    setTimeout(() => {
      setGameState(prev => ({ ...prev, feedback: null }));
    }, validation.isCorrect || validation.isClose ? 3000 : 4000);

    // Trigger AI turn if needed
    if (newState.currentPlayer === 'ai' && newState.gameStatus === 'playing' && newState.aiOpponent) {
      setTimeout(() => {
        executeAITurn();
      }, getAIThinkingTime(gameState.difficulty));
    }
  };

  const executeAITurn = () => {
    if (gameState.currentPlayer !== 'ai' || !gameState.aiOpponent || gameState.aiHand.length === 0) {
      return;
    }

    console.log('🤖 AI taking turn...');

    // AI selects a card
    const aiSelection = gameState.aiOpponent.selectCard(gameState.aiHand, gameState.timeline, gameState);
    if (!aiSelection) return;

    // AI determines placement
    const aiPlacement = gameState.aiOpponent.determineCardPlacement(aiSelection.card, gameState.timeline);
    
    console.log('🤖 AI placing:', aiSelection.card.title, 'at position', aiPlacement.position);

    // Set AI's selected card temporarily
    setGameState(prev => ({ 
      ...prev, 
      selectedCard: aiSelection.card,
      aiOpponent: { ...prev.aiOpponent, selectedCard: aiSelection.card }
    }));

    // Execute AI placement
    setTimeout(() => {
      placeCard(aiPlacement.position, 'ai');
    }, 500);
  };

  const handleShowHint = () => {
    if (!gameState.selectedCard) return;
    
    const hint = generateHint(gameState.selectedCard, gameState.timeline);
    setGameState(prev => ({
      ...prev,
      feedback: { type: 'hint', message: hint },
      gameStats: { ...prev.gameStats, hintsUsed: prev.gameStats.hintsUsed + 1 }
    }));
    
    setTimeout(() => {
      setGameState(prev => ({ ...prev, feedback: null }));
    }, 3000);
  };

  const handleRestartGame = () => {
    initializeGame(gameState.gameMode, gameState.difficulty);
  };

  const handleModeChange = (newMode) => {
    initializeGame(newMode, gameState.difficulty);
  };

  const handleDifficultyChange = (newDifficulty) => {
    initializeGame(gameState.gameMode, newDifficulty);
  };

  const handleTimelineCardClick = (event) => {
    console.log('🔍 Timeline card clicked:', event.title);
  };

  const togglePause = () => {
    setGameState(prev => ({
      ...prev,
      gameStatus: prev.gameStatus === 'playing' ? 'paused' : 'playing'
    }));
  };

  const getGameStatusMessage = () => {
    switch (gameState.gameStatus) {
      case 'won': {
        const humanScore = gameState.score.human;
        const aiScore = gameState.score.ai;
        const totalTime = gameState.startTime ? (Date.now() - gameState.startTime) / 1000 : 0;
        
        let message = `🎉 Congratulations!\nFinal Score: ${humanScore} points`;
        
        if (gameState.gameMode === 'ai') {
          if (humanScore > aiScore) {
            message = `🏆 You Won!\nYour Score: ${humanScore}\nAI Score: ${aiScore}`;
          } else if (aiScore > humanScore) {
            message = `🤖 AI Won!\nYour Score: ${humanScore}\nAI Score: ${aiScore}`;
          } else {
            message = `🤝 It's a Tie!\nBoth scored: ${humanScore} points`;
          }
        }
        
        message += `\nTime: ${Math.round(totalTime)}s`;
        if (gameState.gameStats.totalMoves > 0) {
          message += `\nAccuracy: ${Math.round((gameState.gameStats.correctMoves / gameState.gameStats.totalMoves) * 100)}%`;
        }
        
        return {
          type: 'success',
          title: gameState.gameMode === 'ai' && aiScore > humanScore ? '🤖 AI Victory!' : '🎉 Game Complete!',
          message
        };
      }
        
      case 'paused':
        return {
          type: 'info',
          title: '⏸️ Game Paused',
          message: 'Click Resume to continue playing.'
        };
        
      default:
        return null;
    }
  };

  // Helper functions

  const calculateAverageTime = (gameStats, newTime) => {
    const totalMoves = gameStats.totalMoves + 1;
    const currentTotal = gameStats.averageTimePerMove * gameStats.totalMoves;
    return (currentTotal + newTime) / totalMoves;
  };

  const isPlayerTurn = gameState.currentPlayer === 'human';

  if (gameState.isLoading) {
    return (
      <div className="game-page">
        <div className="game-loading">
          <div className="loading-spinner">
            <div className="loading loading-large"></div>
            <h2>Loading Timeline Game...</h2>
            <p>Fetching historical events from our database</p>
          </div>
        </div>
      </div>
    );
  }

  if (gameState.error) {
    return (
      <div className="game-page">
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
    );
  }

  const statusMessage = getGameStatusMessage();

  return (
    <div className="game-page">
        {/* Game Status Overlay */}
        {statusMessage && (
          <div className={`game-status-overlay ${statusMessage.type}`}>
            <div className="status-content">
              <h3>{statusMessage.title}</h3>
              <p style={{ whiteSpace: 'pre-line' }}>{statusMessage.message}</p>
              <div className="status-actions">
                {gameState.gameStatus === 'paused' ? (
                  <button onClick={togglePause} className="btn btn-primary btn-large">
                    ▶️ Resume Game
                  </button>
                ) : (
                  <button onClick={handleRestartGame} className="btn btn-primary btn-large">
                    🎮 Play Again
                  </button>
                )}
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
              {gameState.feedback.attempts > 1 && (
                <p className="feedback-attempts">Attempt #{gameState.feedback.attempts}</p>
              )}
            </div>
          </div>
        )}

        {/* Game Header */}
        <div className="game-header">
          <div className="game-title-section">
            <h1>🎮 Timeline Game</h1>
            <p>Place historical events in chronological order</p>
            {gameState.gameMode === 'ai' && gameState.aiOpponent && (
              <div className="ai-info">
                <span className="ai-indicator">🤖 vs {gameState.aiOpponent.name}</span>
              </div>
            )}
          </div>
          
          <div className="game-stats">
            <div className="stat-item">
              <span className="stat-label">Your Score</span>
              <span className="stat-value">{gameState.score.human}</span>
            </div>
            {gameState.gameMode === 'ai' && (
              <div className="stat-item">
                <span className="stat-label">AI Score</span>
                <span className="stat-value">{gameState.score.ai}</span>
              </div>
            )}
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

        {/* Turn Indicator */}
        {gameState.gameMode === 'ai' && gameState.gameStatus === 'playing' && (
          <div className={`turn-indicator ${isPlayerTurn ? 'human-turn' : 'ai-turn'}`}>
            <div className="turn-content">
              {isPlayerTurn ? (
                <span>🎯 Your Turn - Select a card to play</span>
              ) : (
                <span>🤖 AI is thinking...</span>
              )}
            </div>
          </div>
        )}

        {/* Game Board */}
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
              isPlayerTurn={isPlayerTurn}
              playerName="Player 1"
              maxCards={8}
            />
            
            {/* AI Hand */}
            {gameState.gameMode === 'ai' && gameState.aiHand.length > 0 && (
              <div className="ai-hand-section">
                <div className="ai-hand-header">
                  <h3>🤖 AI Hand</h3>
                  <span className="hand-count">{gameState.aiHand.length} cards</span>
                </div>
                <div className="ai-cards-placeholder">
                  {gameState.aiHand.map((_, index) => (
                    <div key={index} className="ai-card-back">
                      🎴
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Game Controls */}
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
              disabled={!gameState.selectedCard || !isPlayerTurn}
            >
              💡 Show Hint
            </button>
            {gameState.gameStatus === 'playing' && (
              <button onClick={togglePause} className="btn btn-secondary">
                ⏸️ Pause
              </button>
            )}
          </div>
          
          <div className="game-info">
            <div className="info-panel">
              <h3>📖 How to Play</h3>
              <ol>
                <li>Select a card from your hand</li>
                <li>Click where it belongs on the timeline</li>
                <li>If correct, it stays! If wrong, try again</li>
                <li>{gameState.gameMode === 'ai' ? 'Score more points than the AI to win!' : 'Place all cards to win!'}</li>
              </ol>
            </div>
            
            {/* Game Mode Selector */}
            <div className="mode-selector">
              <h3>🎮 Game Mode</h3>
              <div className="mode-buttons">
                <button 
                  className={`mode-btn ${gameState.gameMode === 'single' ? 'active' : ''}`}
                  onClick={() => handleModeChange('single')}
                  disabled={gameState.gameStatus === 'playing'}
                >
                  👤 Solo
                </button>
                <button 
                  className={`mode-btn ${gameState.gameMode === 'ai' ? 'active' : ''}`}
                  onClick={() => handleModeChange('ai')}
                  disabled={gameState.gameStatus === 'playing'}
                >
                  🤖 vs AI
                </button>
              </div>
              
              {gameState.gameMode === 'ai' && (
                <div className="difficulty-selector">
                  <h4>AI Difficulty</h4>
                  <select 
                    value={gameState.difficulty} 
                    onChange={(e) => handleDifficultyChange(e.target.value)}
                    disabled={gameState.gameStatus === 'playing'}
                    className="difficulty-select"
                  >
                    <option value="easy">🟢 Easy - Beginner Bot</option>
                    <option value="medium">🟡 Medium - Scholar Bot</option>
                    <option value="hard">🔴 Hard - Historian Pro</option>
                    <option value="expert">⚫ Expert - Timeline Master</option>
                  </select>
                </div>
              )}
            </div>
            
            {/* Selected Card Info */}
            {gameState.selectedCard && (
              <div className="selected-info">
                <h3>🎯 Selected Card</h3>
                <h4>"{gameState.selectedCard.title}"</h4>
                <p>{gameState.selectedCard.description}</p>
                <p className="hint">💡 Click on the timeline to place it!</p>
                <div className="card-stats">
                  <span className="card-attempts">
                    Attempts: {gameState.attempts[gameState.selectedCard.id] || 0}
                  </span>
                  <span className="card-difficulty">
                    Difficulty: {'★'.repeat(gameState.selectedCard.difficulty)}
                  </span>
                </div>
              </div>
            )}
            
            {/* Game Statistics */}
            {gameState.gameStats.totalMoves > 0 && (
              <div className="game-statistics">
                <h3>📊 Game Stats</h3>
                <div className="stats-grid">
                  <div className="stat-row">
                    <span>Accuracy:</span>
                    <span>{Math.round((gameState.gameStats.correctMoves / gameState.gameStats.totalMoves) * 100)}%</span>
                  </div>
                  <div className="stat-row">
                    <span>Avg Time/Move:</span>
                    <span>{Math.round(gameState.gameStats.averageTimePerMove)}s</span>
                  </div>
                  <div className="stat-row">
                    <span>Hints Used:</span>
                    <span>{gameState.gameStats.hintsUsed}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
    </div>
  );
};

export default Game;