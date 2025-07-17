import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import GameStatus from './GameStatus';

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: '',
  },
  writable: true,
});

describe('GameStatus Component', () => {
  const mockOnRestartGame = vi.fn();
  const mockOnTogglePause = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    window.location.href = '';
  });

  describe('Game Won State', () => {
    const wonGameState = {
      gameStatus: 'won',
      score: { human: 150 },
      gameStats: {
        totalMoves: 8,
        correctMoves: 6,
        averageTimePerMove: 2.5,
      },
      feedback: null,
    };

    it('displays victory overlay with correct information', () => {
      render(
        <GameStatus
          gameState={wonGameState}
          onRestartGame={mockOnRestartGame}
          onTogglePause={mockOnTogglePause}
        />
      );

      expect(screen.getByText('🎉 Congratulations!')).toBeInTheDocument();
      expect(
        screen.getByText(/You've successfully placed all cards/)
      ).toBeInTheDocument();
      expect(screen.getByText(/Final Score: 150 points/)).toBeInTheDocument();
      expect(screen.getByText(/Total Moves: 8/)).toBeInTheDocument();
      expect(screen.getByText(/Correct Moves: 6/)).toBeInTheDocument();
      expect(
        screen.getByText(/Average Time: 2.5s per move/)
      ).toBeInTheDocument();
    });

    it('shows play again button when game is won', () => {
      render(
        <GameStatus
          gameState={wonGameState}
          onRestartGame={mockOnRestartGame}
          onTogglePause={mockOnTogglePause}
        />
      );

      const playAgainButton = screen.getByText('🎮 Play Again');
      expect(playAgainButton).toBeInTheDocument();

      fireEvent.click(playAgainButton);
      expect(mockOnRestartGame).toHaveBeenCalledTimes(1);
    });

    it('shows home button and navigates when clicked', () => {
      render(
        <GameStatus
          gameState={wonGameState}
          onRestartGame={mockOnRestartGame}
          onTogglePause={mockOnTogglePause}
        />
      );

      const homeButton = screen.getByText('🏠 Home');
      expect(homeButton).toBeInTheDocument();

      fireEvent.click(homeButton);
      expect(window.location.href).toBe('/');
    });
  });

  describe('Game Paused State', () => {
    const pausedGameState = {
      gameStatus: 'paused',
      score: { human: 50 },
      gameStats: {
        totalMoves: 3,
        correctMoves: 2,
        averageTimePerMove: 1.8,
      },
      feedback: null,
    };

    it('displays pause overlay with correct information', () => {
      render(
        <GameStatus
          gameState={pausedGameState}
          onRestartGame={mockOnRestartGame}
          onTogglePause={mockOnTogglePause}
        />
      );

      expect(screen.getByText('⏸️ Game Paused')).toBeInTheDocument();
      expect(
        screen.getByText(/Your game is currently paused/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Click "Resume Game" to continue playing/)
      ).toBeInTheDocument();
    });

    it('shows resume button when game is paused', () => {
      render(
        <GameStatus
          gameState={pausedGameState}
          onRestartGame={mockOnRestartGame}
          onTogglePause={mockOnTogglePause}
        />
      );

      const resumeButton = screen.getByText('▶️ Resume Game');
      expect(resumeButton).toBeInTheDocument();

      fireEvent.click(resumeButton);
      expect(mockOnTogglePause).toHaveBeenCalledTimes(1);
    });
  });

  describe('Feedback Toast', () => {
    const gameStateWithFeedback = {
      gameStatus: 'playing',
      score: { human: 75 },
      gameStats: {
        totalMoves: 4,
        correctMoves: 3,
        averageTimePerMove: 2.0,
      },
      feedback: {
        type: 'success',
        message: 'Great job! That was correct!',
        points: 25,
        attempts: 1,
      },
    };

    it('displays success feedback toast with points', () => {
      render(
        <GameStatus
          gameState={gameStateWithFeedback}
          onRestartGame={mockOnRestartGame}
          onTogglePause={mockOnTogglePause}
        />
      );

      expect(
        screen.getByText('Great job! That was correct!')
      ).toBeInTheDocument();
      expect(screen.getByText('+25 points!')).toBeInTheDocument();
    });

    it('displays feedback toast with multiple attempts', () => {
      const gameStateWithMultipleAttempts = {
        ...gameStateWithFeedback,
        feedback: {
          type: 'error',
          message: 'Try again!',
          attempts: 3,
        },
      };

      render(
        <GameStatus
          gameState={gameStateWithMultipleAttempts}
          onRestartGame={mockOnRestartGame}
          onTogglePause={mockOnTogglePause}
        />
      );

      expect(screen.getByText('Try again!')).toBeInTheDocument();
      expect(screen.getByText('Attempt #3')).toBeInTheDocument();
    });

    it('displays error feedback toast without points', () => {
      const gameStateWithErrorFeedback = {
        ...gameStateWithFeedback,
        feedback: {
          type: 'error',
          message: 'Incorrect placement!',
        },
      };

      render(
        <GameStatus
          gameState={gameStateWithErrorFeedback}
          onRestartGame={mockOnRestartGame}
          onTogglePause={mockOnTogglePause}
        />
      );

      expect(screen.getByText('Incorrect placement!')).toBeInTheDocument();
      expect(screen.queryByText(/\+.*points!/)).not.toBeInTheDocument();
    });
  });

  describe('No Overlay States', () => {
    const playingGameState = {
      gameStatus: 'playing',
      score: { human: 25 },
      gameStats: {
        totalMoves: 2,
        correctMoves: 1,
        averageTimePerMove: 1.5,
      },
      feedback: null,
    };

    it('does not show overlay when game is playing', () => {
      render(
        <GameStatus
          gameState={playingGameState}
          onRestartGame={mockOnRestartGame}
          onTogglePause={mockOnTogglePause}
        />
      );

      expect(screen.queryByText('🎉 Congratulations!')).not.toBeInTheDocument();
      expect(screen.queryByText('⏸️ Game Paused')).not.toBeInTheDocument();
    });

    it('does not show feedback when no feedback is provided', () => {
      render(
        <GameStatus
          gameState={playingGameState}
          onRestartGame={mockOnRestartGame}
          onTogglePause={mockOnTogglePause}
        />
      );

      expect(screen.queryByText(/points!/)).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    const wonGameState = {
      gameStatus: 'won',
      score: { human: 100 },
      gameStats: {
        totalMoves: 5,
        correctMoves: 4,
        averageTimePerMove: 2.0,
      },
      feedback: null,
    };

    it('has proper button accessibility', () => {
      render(
        <GameStatus
          gameState={wonGameState}
          onRestartGame={mockOnRestartGame}
          onTogglePause={mockOnTogglePause}
        />
      );

      const playAgainButton = screen.getByRole('button', {
        name: /play again/i,
      });
      const homeButton = screen.getByRole('button', { name: /home/i });

      expect(playAgainButton).toBeInTheDocument();
      expect(homeButton).toBeInTheDocument();
    });
  });
});
