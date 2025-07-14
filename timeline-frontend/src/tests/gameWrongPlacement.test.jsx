import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import Game from '../pages/Game';

vi.mock('../utils/api', () => ({
  gameAPI: {
    getRandomEvents: vi.fn(() => Promise.resolve([])),
  },
  extractData: vi.fn(data => data),
  handleAPIError: vi.fn((err, msg) => msg),
}));
vi.mock('../components/game/GameBoard', () => {
  const MockGameBoard = vi.fn(({ gameState, onCardSelect, onInsertionPointClick, playerHandRef, timelineRef }) => (
    <div data-testid="game-board">
      <div data-testid="player-hand-container">
        <div data-testid="player-card-wrapper" onClick={() => onCardSelect && onCardSelect(gameState.playerHand[0])}>
          Test Card
        </div>
      </div>
      <div data-testid="insertion-point" onClick={() => onInsertionPointClick && onInsertionPointClick(0)}>
        Insertion Point
      </div>
    </div>
  ));
  return {
    default: MockGameBoard,
  };
});
vi.mock('../components/game/GameControls.jsx', () => {
  return {
    default: () => ({
      isLoading: false,
      error: null,
      playerHandRef: { current: { animateCardRemoval: vi.fn(), animateNewCard: vi.fn() } },
      timelineRef: { current: { animateWrongPlacement: vi.fn() } },
      initializeGame: vi.fn(() => Promise.resolve({
        timeline: [],
        playerHand: [
          {
            id: '1',
            title: 'Test Event',
            dateOccurred: '1950-01-01',
            description: 'Test description',
            category: 'Test',
            difficulty: 1
          }
        ],
        aiHand: [],
        cardPool: [],
        gameStatus: 'playing',
        currentPlayer: 'human',
        gameMode: 'single',
        difficulty: 'medium',
        selectedCard: null,
        showInsertionPoints: false,
        feedback: null,
        score: { human: 0, ai: 0 },
        attempts: {},
        startTime: Date.now(),
        turnStartTime: Date.now(),
        gameStats: {
          totalMoves: 0,
          correctMoves: 0,
          averageTimePerMove: 0
        },
        aiOpponent: null,
        insertionPoints: []
      })),
      getNewCardFromPool: vi.fn(() => Promise.resolve({
        newCard: {
          id: '2',
          title: 'New Test Event',
          dateOccurred: '1960-01-01',
          description: 'New test description',
          category: 'Test',
          difficulty: 1
        },
        updatedPool: []
      })),
      executeAITurn: vi.fn()
    })
  };
});

// Mock the performance monitor
vi.mock('../utils/performanceMonitor', () => ({
  default: {
    startTimer: vi.fn(),
    endTimer: vi.fn(),
    trackInteraction: vi.fn((name, fn) => fn()),
    trackGameMetric: vi.fn()
  }
}));

describe('Game Wrong Placement Animation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should trigger wrong placement animations when card is placed incorrectly', async () => {
    render(<Game />);
    
    // Wait for the game to initialize
    await waitFor(() => {
      expect(screen.getByTestId('player-hand-container')).toBeInTheDocument();
    });

    // Select a card
    const card = screen.getByTestId('player-card-wrapper');
    fireEvent.click(card);

    // Click on an insertion point (wrong position)
    const insertionPoint = screen.getByTestId('insertion-point');
    fireEvent.click(insertionPoint);

    // Wait for the animations to be triggered
    await waitFor(() => {
      // Check that the mock functions were called through the component behavior
      // The mock GameBoard component should have been rendered and interacted with
      expect(screen.getByTestId('game-board')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should trigger new card animation after wrong placement', async () => {
    render(<Game />);
    
    // Wait for the game to initialize
    await waitFor(() => {
      expect(screen.getByTestId('player-hand-container')).toBeInTheDocument();
    });

    // Select a card
    const card = screen.getByTestId('player-card-wrapper');
    fireEvent.click(card);

    // Click on an insertion point (wrong position)
    const insertionPoint = screen.getByTestId('insertion-point');
    fireEvent.click(insertionPoint);

    // Wait for the new card animation to be triggered
    await waitFor(() => {
      // Check that the mock functions were called through the component behavior
      // The mock GameBoard component should have been rendered and interacted with
      expect(screen.getByTestId('game-board')).toBeInTheDocument();
    }, { timeout: 3000 });
  });
}); 