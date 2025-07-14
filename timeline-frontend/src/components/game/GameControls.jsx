import React, { useState, useEffect, useRef } from 'react';
import { gameAPI, extractData, handleAPIError } from '../../utils/api.js';
import { createAIOpponent, getAIThinkingTime } from '../../utils/aiLogic.js';
import { createGameSession } from '../../utils/gameLogic.js';

const useGameControls = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const playerHandRef = useRef(null);
  const timelineRef = useRef(null);

  const initializeGame = async (mode = 'single', diff = 'medium') => {
    try {
      setIsLoading(true);
      setError(null);
      
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
      const poolResponse = await gameAPI.getRandomEvents(10);
      const poolEvents = extractData(poolResponse);
      
      // Create game session
      const session = createGameSession(events, { 
        cardCount: cardCount - 1,
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
      
      const gameState = {
        timeline: session.timeline,
        playerHand: humanCards,
        aiHand: aiCards,
        cardPool: poolEvents,
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
      };
      
      console.log('✅ Game initialized successfully');
      setIsLoading(false);
      
      return gameState;
      
    } catch (error) {
      console.error('❌ Error initializing game:', error);
      const errorMessage = handleAPIError(error, 'Failed to load game');
      setError(errorMessage);
      setIsLoading(false);
      throw error;
    }
  };

  const getNewCardFromPool = async (currentGameState) => {
    // Gather all card IDs currently in the timeline and playerHand
    const timelineIds = new Set(currentGameState.timeline.map(card => card.id));
    const handIds = new Set(currentGameState.playerHand.map(card => card.id));
    const forbiddenIds = new Set([...timelineIds, ...handIds]);

    // Filter pool to only cards not in timeline or hand
    const availablePool = currentGameState.cardPool.filter(card => !forbiddenIds.has(card.id));

    if (availablePool.length > 0) {
      // Get a random card from the filtered pool
      const randomIndex = Math.floor(Math.random() * availablePool.length);
      const newCard = availablePool[randomIndex];
      // Remove the card from the pool
      const updatedPool = currentGameState.cardPool.filter(card => card.id !== newCard.id);
      
      return { newCard, updatedPool };
    }
    
    // If pool is empty, fetch more cards
    try {
      const response = await gameAPI.getRandomEvents(5);
      const newPoolCards = extractData(response);
      const newCard = newPoolCards[0];
      const updatedPool = [...currentGameState.cardPool, ...newPoolCards.slice(1)];
      
      return { newCard, updatedPool };
    } catch (error) {
      console.error('Failed to fetch new cards:', error);
      return null;
    }
  };

  const executeAITurn = async (currentState) => {
    if (currentState.gameStatus !== 'playing' || currentState.currentPlayer !== 'ai') {
      return currentState;
    }

    const thinkingTime = getAIThinkingTime(currentState.difficulty);
    
    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, thinkingTime));
    
    // AI logic would go here - for now, just pass turn back to human
    return {
      ...currentState,
      currentPlayer: 'human',
      turnStartTime: Date.now()
    };
  };

  return {
    isLoading,
    error,
    playerHandRef,
    timelineRef,
    initializeGame,
    getNewCardFromPool,
    executeAITurn
  };
};

export default useGameControls; 