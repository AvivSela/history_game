import React, { useState, useEffect, useRef } from 'react';
import { gameAPI, extractData, handleAPIError } from '../utils/api';
import { 
  calculateScore, 
  checkWinCondition, 
  createGameSession 
} from '../utils/gameLogic';
import { 
  validatePlacementWithTolerance, 
  generateSmartInsertionPoints 
} from '../utils/timelineLogic';
import { createAIOpponent, getAIThinkingTime } from '../utils/aiLogic';

import Timeline from '../components/Timeline/Timeline';
import PlayerHand from '../components/PlayerHand/PlayerHand';

const Game = () => {
  
  const [gameState, setGameState] = useState({
    // Core game data
    playerHand: [],
    timeline: [],
    aiHand: [],
    cardPool: [], // Pool of additional cards for replacement
    
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
      averageTimePerMove: 0
    },
    
    // AI
    aiOpponent: null,
    insertionPoints: []
  });

  // Add refs for component communication
  const playerHandRef = useRef(null);
  const timelineRef = useRef(null);

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
        cardPool: [], // Clear card pool
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
      
      // Fetch additional cards for the pool (for replacement when cards are placed incorrectly)
      const poolResponse = await gameAPI.getRandomEvents(10); // Get 10 additional cards for the pool
      const poolEvents = extractData(poolResponse);
      
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
        cardPool: poolEvents, // Store additional cards for replacement
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

  const handleInsertionPointClick = async (position) => {
    if (!gameState.selectedCard || gameState.gameStatus !== 'playing' || gameState.currentPlayer !== 'human') {
      return;
    }

    await placeCard(position, 'human');
  };

  // Helper function to get a new card from the pool, avoiding duplicates
  const getNewCardFromPool = async () => {
    // Gather all card IDs currently in the timeline and playerHand
    const timelineIds = new Set(gameState.timeline.map(card => card.id));
    const handIds = new Set(gameState.playerHand.map(card => card.id));
    const forbiddenIds = new Set([...timelineIds, ...handIds]);

    // Filter pool to only cards not in timeline or hand
    const availablePool = gameState.cardPool.filter(card => !forbiddenIds.has(card.id));

    if (availablePool.length > 0) {
      // Get a random card from the filtered pool
      const randomIndex = Math.floor(Math.random() * availablePool.length);
      const newCard = availablePool[randomIndex];
      // Remove the card from the pool
      const updatedPool = gameState.cardPool.filter(card => card.id !== newCard.id);
      setGameState(prev => ({
        ...prev,
        cardPool: updatedPool
      }));
      return newCard;
    } else {
      // Pool is empty or all cards are duplicates, try to fetch more cards
      try {
        const response = await gameAPI.getRandomEvents(5);
        let newPoolCards = extractData(response);
        // Filter out any cards already in timeline or hand
        newPoolCards = newPoolCards.filter(card => !forbiddenIds.has(card.id));
        if (newPoolCards.length > 0) {
          setGameState(prev => ({
            ...prev,
            cardPool: newPoolCards
          }));
          return newPoolCards[0];
        }
      } catch (error) {
        console.error('Failed to fetch new cards:', error);
      }
      return null; // No new card available
    }
  };




  const placeCard = async (position, player = 'human') => {
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
          points: scoreEarned,
          attempts: cardAttempts
        }
      };

      // Execute AI turn if needed
      if (newGameStatus === 'playing' && nextPlayer === 'ai' && gameState.gameMode === 'ai') {
        setTimeout(async () => await executeAITurn(newState), getAIThinkingTime(gameState.difficulty));
      }

    } else {
      // Failed placement - trigger wrong placement animation
      if (player === 'human' && timelineRef.current) {
        timelineRef.current.animateWrongPlacement(position);
      }
      
      const handKey = player === 'human' ? 'playerHand' : 'aiHand';
      const currentHand = gameState[handKey];
      
      // Remove the incorrect card from hand
      const updatedHand = currentHand.filter(card => card.id !== selectedCard.id);
      
      // Get a new card from the pool (only for human player)
      let newCard = null;
      if (player === 'human') {
        newCard = await getNewCardFromPool();
      }
      
      // If we got a new card, add it to the hand
      const finalHand = newCard ? [...updatedHand, newCard] : updatedHand;
      
      // Update state with new hand immediately
      newState = {
        ...newState,
        [handKey]: finalHand,
        selectedCard: null,
        showInsertionPoints: false,
        insertionPoints: [],
        attempts: { ...gameState.attempts, [selectedCard.id]: cardAttempts },
        gameStats: {
          ...newState.gameStats,
          totalMoves: gameState.gameStats.totalMoves + 1,
          averageTimePerMove: calculateAverageTime(gameState.gameStats, turnTime)
        },
        feedback: {
          type: 'error',
          message: validation.feedback + (newCard ? ' You got a new card to try!' : ' No more cards available.'),
          attempts: cardAttempts,
          showAnimation: true // Flag to trigger feedback animation
        }
      };

      // Animate the new card in the player's hand
      if (player === 'human' && newCard && playerHandRef.current) {
        // Wait for the state to update and the new card to render
        setTimeout(() => {
          playerHandRef.current.animateNewCard(newCard.id);
        }, 100);
      }
    }

    setGameState(newState);

    // Clear feedback after 3 seconds
    setTimeout(() => {
      setGameState(prev => ({ ...prev, feedback: null }));
    }, 3000);
  };

  const executeAITurn = async (currentState) => {
    if (currentState.gameStatus !== 'playing' || currentState.currentPlayer !== 'ai') {
      return;
    }

    const aiCard = currentState.aiHand[0];
    if (!aiCard) return;

    // AI selects a card
    const aiState = { ...currentState, aiOpponent: { ...currentState.aiOpponent, selectedCard: aiCard } };

    // AI makes placement decision
    const insertionPoints = generateSmartInsertionPoints(aiState.timeline, aiCard);
    const bestPosition = insertionPoints.length > 0 ? insertionPoints[0] : 0;

    // Place the card
    await placeCard(bestPosition, 'ai');
  };

  const handleRestartGame = () => {
    initializeGame(gameState.gameMode, gameState.difficulty);
  };

  const handleTimelineCardClick = (event) => {
    console.log('📅 Timeline card clicked:', event.title);
  };

  const togglePause = () => {
    setGameState(prev => ({
      ...prev,
      gameStatus: prev.gameStatus === 'playing' ? 'paused' : 'playing'
    }));
  };

  const getGameStatusMessage = () => {
    switch (gameState.gameStatus) {
      case 'won':
        return {
          type: 'success',
          title: '🎉 Congratulations!',
          message: `You've successfully placed all your cards!\n\nFinal Score: ${gameState.score.human} points\nTotal Moves: ${gameState.gameStats.totalMoves}\nAccuracy: ${Math.round((gameState.gameStats.correctMoves / gameState.gameStats.totalMoves) * 100)}%`
        };
        
      case 'lost':
        return {
          type: 'error',
          title: '😔 Game Over',
          message: `The AI has won this round!\n\nYour Score: ${gameState.score.human}\nAI Score: ${gameState.score.ai}`
        };
        
      case 'paused':
        return {
          type: 'warning',
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
      <div className="min-h-[calc(100vh-140px)] bg-gradient-to-br from-gray-50 to-blue-100 p-5 px-6 w-full max-w-none">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center bg-card p-10 rounded-lg shadow-lg">
            <div className="inline-block w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin mb-5"></div>
            <h2 className="text-primary text-xl font-bold mb-2">Loading Timeline Game...</h2>
            <p className="text-text-light">Fetching historical events from our database</p>
          </div>
        </div>
      </div>
    );
  }

  if (gameState.error) {
    return (
      <div className="min-h-[calc(100vh-140px)] bg-gradient-to-br from-gray-50 to-blue-100 p-5 px-6 w-full max-w-none">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="bg-card p-10 rounded-lg shadow-lg text-center border-2 border-accent max-w-lg">
            <h2 className="text-accent text-xl font-bold mb-4">🚫 Oops! Something went wrong</h2>
            <p className="text-text-light mb-6 text-base">{gameState.error}</p>
            <div className="flex gap-3 justify-center">
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
    <div className="min-h-[calc(100vh-140px)] bg-gradient-to-br from-gray-50 to-blue-100 p-5 px-6 w-full max-w-none" style={{ overflow: 'visible' }}>
        {/* Game Status Overlay */}
        {statusMessage && (
          <div className={`fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in ${statusMessage.type === 'success' ? 'success' : statusMessage.type === 'error' ? 'error' : ''}`}>
            <div className="bg-white p-12 rounded-lg text-center max-w-lg shadow-xl animate-bounce-in border-4 border-success">
              <h3 className="text-3xl mb-4 text-primary">{statusMessage.title}</h3>
              <p className="text-lg text-text mb-8 leading-relaxed" style={{ whiteSpace: 'pre-line' }}>{statusMessage.message}</p>
              <div className="flex gap-4 justify-center flex-wrap">
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
          <div className={`fixed top-24 right-5 bg-card rounded-lg p-4 shadow-xl z-50 max-w-sm animate-slide-in-right border-l-4 ${gameState.feedback.type === 'success' ? 'border-success bg-gradient-to-br from-success/10 to-card' : 'border-accent bg-gradient-to-br from-accent/10 to-card'}`}>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-text font-medium m-0">{gameState.feedback.message}</p>
              {gameState.feedback.points && (
                <p className="text-base text-success font-bold m-0">+{gameState.feedback.points} points!</p>
              )}
              {gameState.feedback.attempts > 1 && (
                <p className="text-xs text-text-light m-0">Attempt #{gameState.feedback.attempts}</p>
              )}
            </div>
          </div>
        )}

        {/* Game Header */}
        <div className="flex justify-between items-center bg-gradient-to-r from-gray-50/60 to-blue-100/100 px-10 py-8 rounded-2xl shadow-lg my-8 border border-blue-200 relative gap-8">
          <div className="flex-1 min-w-[220px]">
            <h1 className="m-0 mb-2.5 text-slate-700 text-4xl font-extrabold tracking-wider drop-shadow-sm">🎮 Timeline Game</h1>
            <p className="m-0 text-gray-600 text-base font-medium">Place historical events in chronological order</p>
            {gameState.gameMode === 'ai' && gameState.aiOpponent && (
              <div className="mt-2">
                <span className="text-sm text-primary font-medium">🤖 vs {gameState.aiOpponent.name}</span>
              </div>
            )}
          </div>
          <div className="flex flex-row gap-5 items-center bg-white/70">
            <button onClick={handleRestartGame} className="btn btn-secondary">
              🔄 New Game
            </button>
            {gameState.gameStatus === 'playing' && (
              <button onClick={togglePause} className="btn btn-secondary">
                ⏸️ Pause
              </button>
            )}
          </div>
          <div className="flex gap-6">
            <div className="text-center bg-white/80 rounded-lg p-3 min-w-[80px] hover:bg-white transition-colors">
              <div className="text-xs text-text-light font-medium uppercase tracking-wider">Your Score</div>
              <div className="text-2xl font-bold text-primary">{gameState.score.human}</div>
            </div>
            {gameState.gameMode === 'ai' && (
              <div className="text-center bg-white/80 rounded-lg p-3 min-w-[80px] hover:bg-white transition-colors">
                <div className="text-xs text-text-light font-medium uppercase tracking-wider">AI Score</div>
                <div className="text-2xl font-bold text-primary">{gameState.score.ai}</div>
              </div>
            )}
            <div className="text-center bg-white/80 rounded-lg p-3 min-w-[80px] hover:bg-white transition-colors">
              <div className="text-xs text-text-light font-medium uppercase tracking-wider">Cards Left</div>
              <div className="text-2xl font-bold text-primary">{gameState.playerHand.length}</div>
            </div>
            <div className="text-center bg-white/80 rounded-lg p-3 min-w-[80px] hover:bg-white transition-colors">
              <div className="text-xs text-text-light font-medium uppercase tracking-wider">Timeline</div>
              <div className="text-2xl font-bold text-primary">{gameState.timeline.length}</div>
            </div>
          </div>
        </div>

        {/* Turn Indicator */}
        {gameState.gameMode === 'ai' && gameState.gameStatus === 'playing' && (
          <div className={`text-center py-3 px-6 rounded-lg mb-6 ${isPlayerTurn ? 'bg-success/10 border border-success/30 text-success' : 'bg-warning/10 border border-warning/30 text-warning'}`}>
            <div className="font-medium">
              {isPlayerTurn ? (
                <span>🎯 Your Turn - Select a card to play</span>
              ) : (
                <span>🤖 AI is thinking...</span>
              )}
            </div>
          </div>
        )}

        {/* Game Board */}
        <div className="flex flex-col lg:flex-row gap-8" style={{ overflow: 'visible' }}>
          <div className="flex-1" style={{ overflow: 'visible' }}>
            <Timeline
              ref={timelineRef}
              events={gameState.timeline}
              onCardClick={handleTimelineCardClick}
              highlightInsertionPoints={gameState.showInsertionPoints}
              onInsertionPointClick={handleInsertionPointClick}
              selectedCard={gameState.selectedCard}
            />
          </div>

          <div className="flex-1" style={{ overflow: 'visible' }}>
            <PlayerHand
              ref={playerHandRef}
              cards={gameState.playerHand}
              selectedCard={gameState.selectedCard}
              onCardSelect={handleCardSelect}
              onCardPlay={handleCardPlay}
              isPlayerTurn={isPlayerTurn}
              playerName="Player 1"
              maxCards={gameState.playerHand.length + (gameState.timeline.length - 1) + (gameState.aiHand?.length || 0)}
            />
            
            {/* AI Hand */}
            {gameState.gameMode === 'ai' && gameState.aiHand.length > 0 && (
              <div className="bg-card rounded-lg p-5 shadow-md my-5 border border-border">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-primary text-lg font-bold">🤖 AI Hand</h3>
                  <span className="bg-accent text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">{gameState.aiHand.length} cards</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {gameState.aiHand.map((_, index) => (
                    <div key={index} className="w-12 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 border border-gray-300">
                      🎴
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
    </div>
  );
};

export default Game;
