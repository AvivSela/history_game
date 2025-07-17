import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useState, useEffect } from 'react';
import PlayerHand from '../components/game/PlayerHand';
import Timeline from '../components/game/Timeline';

const mockCards = [
  {
    id: 1,
    title: 'World War II Begins',
    dateOccurred: '1939-09-01T00:00:00.000Z',
    category: 'History',
    difficulty: 2,
  },
  {
    id: 2,
    title: 'Moon Landing',
    dateOccurred: '1969-07-20T00:00:00.000Z',
    category: 'Science',
    difficulty: 1,
  },
  {
    id: 3,
    title: 'Internet Created',
    dateOccurred: '1989-03-12T00:00:00.000Z',
    category: 'Technology',
    difficulty: 3,
  },
];

const mockPlayerCards = [
  {
    id: 4,
    title: 'Berlin Wall Falls',
    dateOccurred: '1989-11-09T00:00:00.000Z',
    category: 'History',
    difficulty: 2,
  },
  {
    id: 5,
    title: 'World War I Begins',
    dateOccurred: '1914-07-28T00:00:00.000Z',
    category: 'History',
    difficulty: 1,
  },
  {
    id: 6,
    title: 'First iPhone Released',
    dateOccurred: '2007-06-29T00:00:00.000Z',
    category: 'Technology',
    difficulty: 1,
  },
  {
    id: 7,
    title: 'COVID-19 Pandemic',
    dateOccurred: '2020-03-11T00:00:00.000Z',
    category: 'Health',
    difficulty: 2,
  },
  {
    id: 8,
    title: 'Fall of the Soviet Union',
    dateOccurred: '1991-12-26T00:00:00.000Z',
    category: 'History',
    difficulty: 2,
  },
];

const MockGameInterface = ({ isAIMode = false, initialPlayerTurn = true }) => {
  const [playerHand, setPlayerHand] = useState(mockPlayerCards);
  const [timeline, setTimeline] = useState([mockCards[0]]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isPlayerTurn, setIsPlayerTurn] = useState(initialPlayerTurn);
  const [gameStatus, setGameStatus] = useState('playing');
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (playerHand.length === 0 && gameStatus !== 'won') {
      setGameStatus('won');
    }
  }, [playerHand, gameStatus]);

  const handleCardSelect = card => {
    if (!isPlayerTurn) return;
    setSelectedCard(card);
  };

  const handleInsertionPointClick = position => {
    if (!selectedCard || !isPlayerTurn) return;

    const newTimeline = [...timeline];
    newTimeline.splice(position, 0, selectedCard);
    setTimeline(newTimeline);
    setPlayerHand(prev => prev.filter(card => card.id !== selectedCard.id));
    setSelectedCard(null);
    setScore(prev => prev + 100);

    if (isAIMode) {
      setIsPlayerTurn(false);
      setTimeout(() => setIsPlayerTurn(true), 1000);
    }

    if (playerHand.length === 1) {
      setGameStatus('won');
    }
  };

  const handleRestart = () => {
    setPlayerHand(mockPlayerCards);
    setTimeline([mockCards[0]]);
    setSelectedCard(null);
    setIsPlayerTurn(true);
    setGameStatus('playing');
    setScore(0);
  };

  return (
    <div data-testid="game-interface">
      <div data-testid="game-controls">
        <button onClick={handleRestart} data-testid="restart-btn">
          🔄 Restart Game
        </button>
      </div>

      <div data-testid="game-status">
        Status: {gameStatus} | Score: {score}
        {isAIMode && (
          <span data-testid="turn-indicator">
            {isPlayerTurn ? ' | Your Turn' : ' | AI Turn'}
          </span>
        )}
      </div>

      {gameStatus === 'won' && (
        <div data-testid="victory-message">
          🎉 Congratulations! You won with a score of {score}!
        </div>
      )}

      <PlayerHand
        cards={playerHand}
        selectedCard={selectedCard}
        onCardSelect={handleCardSelect}
        isPlayerTurn={isPlayerTurn}
        playerName={isAIMode ? 'Player' : 'You'}
      />

      <Timeline
        events={timeline}
        highlightInsertionPoints={!!selectedCard && isPlayerTurn}
        selectedCard={selectedCard}
        onInsertionPointClick={handleInsertionPointClick}
      />
    </div>
  );
};

describe('User Interactions', () => {
  describe('Card Selection Interactions', () => {
    it('should allow clicking cards to select them', () => {
      render(<MockGameInterface />);

      const firstCard = screen
        .getByText('Berlin Wall Falls')
        .closest('.player-card');
      fireEvent.click(firstCard);

      expect(
        screen.getByText('Selected: Berlin Wall Falls')
      ).toBeInTheDocument();
    });

    it('should allow switching between card selections', () => {
      render(<MockGameInterface />);

      const firstCard = screen
        .getByText('Berlin Wall Falls')
        .closest('.player-card');
      fireEvent.click(firstCard);
      expect(
        screen.getByText('Selected: Berlin Wall Falls')
      ).toBeInTheDocument();

      const secondCard = screen
        .getByText('World War I Begins')
        .closest('.player-card');
      fireEvent.click(secondCard);
      expect(
        screen.getByText('Selected: World War I Begins')
      ).toBeInTheDocument();
      expect(
        screen.queryByText('Selected: Berlin Wall Falls')
      ).not.toBeInTheDocument();
    });

    it('should allow deselecting cards by clicking them again', () => {
      render(<MockGameInterface />);

      const card = screen
        .getByText('Berlin Wall Falls')
        .closest('.player-card');

      fireEvent.click(card);
      expect(
        screen.getByText('Selected: Berlin Wall Falls')
      ).toBeInTheDocument();

      fireEvent.click(card);
      expect(
        screen.queryByText('Selected: Berlin Wall Falls')
      ).not.toBeInTheDocument();
    });


  });

  describe('Timeline Placement Interactions', () => {
    it('should show insertion point tooltips on hover', () => {
      render(<MockGameInterface />);

      const card = screen
        .getByText('Berlin Wall Falls')
        .closest('.player-card');
      fireEvent.click(card);

      const insertionPoints = screen.getAllByTestId('insertion-point');
      expect(insertionPoints.length).toBeGreaterThan(0);

      const insertionPoint = insertionPoints[0];
      fireEvent.mouseEnter(insertionPoint);

      expect(
        screen.getByText('Place "Berlin Wall Falls" here')
      ).toBeInTheDocument();
    });

    it('should not allow insertion point clicks when no card is selected', () => {
      const mockOnInsertionPointClick = vi.fn();
      render(
        <Timeline
          events={mockCards}
          highlightInsertionPoints={true}
          selectedCard={null}
          onInsertionPointClick={mockOnInsertionPointClick}
        />
      );

      const insertionPoint = screen.getAllByTestId('insertion-point')[0];
      fireEvent.click(insertionPoint);

      expect(mockOnInsertionPointClick).not.toHaveBeenCalled();
    });
  });

  describe('Game Control Interactions', () => {
    it('should restart the game when restart button is clicked', () => {
      render(<MockGameInterface />);

      const card = screen
        .getByText('Berlin Wall Falls')
        .closest('.player-card');
      fireEvent.click(card);
      const insertionPoint = screen.getAllByTestId('insertion-point')[0];
      fireEvent.click(insertionPoint);

      expect(screen.getByTestId('game-status').textContent).toContain(
        'Status: playing'
      );

      const restartButton = screen.getByTestId('restart-btn');
      fireEvent.click(restartButton);

      expect(screen.getByTestId('game-status').textContent).toContain(
        'Score: 0'
      );
      expect(screen.getByText('Berlin Wall Falls')).toBeInTheDocument();
    });
  });

  describe('Game Completion Interactions', () => {
    it('should show victory message after winning', async () => {
      render(<MockGameInterface />);

      const cardWrappers = screen.getAllByTestId('player-card-wrapper');
      for (let i = 0; i < cardWrappers.length; i++) {
        const cardTexts = [
          'Berlin Wall Falls',
          'World War I Begins',
          'First iPhone Released',
          'COVID-19 Pandemic',
          'Fall of the Soviet Union',
        ];
        let card = null;
        for (const text of cardTexts) {
          const foundCard = screen.queryByText(text)?.closest('.player-card');
          if (foundCard) {
            card = foundCard;
            break;
          }
        }

        if (!card) break;

        fireEvent.click(card);
        const insertionPoint = screen.getAllByTestId('insertion-point')[0];
        fireEvent.click(insertionPoint);
      }

      await waitFor(() => {
        expect(screen.getByTestId('victory-message')).toBeInTheDocument();
      });
    });

    it('should disable further interactions after game completion', async () => {
      render(<MockGameInterface />);

      const cardWrappers = screen.getAllByTestId('player-card-wrapper');
      for (let i = 0; i < cardWrappers.length; i++) {
        const cardTexts = [
          'Berlin Wall Falls',
          'World War I Begins',
          'First iPhone Released',
          'COVID-19 Pandemic',
          'Fall of the Soviet Union',
        ];
        let card = null;
        for (const text of cardTexts) {
          const foundCard = screen.queryByText(text)?.closest('.player-card');
          if (foundCard) {
            card = foundCard;
            break;
          }
        }

        if (!card) break;

        fireEvent.click(card);
        const insertionPoint = screen.getAllByTestId('insertion-point')[0];
        fireEvent.click(insertionPoint);
      }

      await waitFor(() => {
        expect(screen.getByTestId('victory-message')).toBeInTheDocument();
      });

      const remainingCards = screen.queryAllByTestId('player-card-wrapper');
      expect(remainingCards).toHaveLength(0);
    });
  });


});
