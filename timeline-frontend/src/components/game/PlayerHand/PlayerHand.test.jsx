import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import PlayerHand from './PlayerHand';

// Mock the Card component
vi.mock('../Card', () => ({
  default: ({
    event,
    isSelected,
    onClick,
    onMouseEnter,
    onMouseLeave,
    className,
    'data-card-id': cardId,
  }) => (
    <div
      className={className}
      data-card-id={cardId}
      data-testid={`card-${event.id}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div data-testid="card-title">{event.title}</div>
      <div data-testid="card-date">{event.dateOccurred}</div>
    </div>
  ),
}));

// Mock animation utilities
vi.mock('@utils/animation', () => ({
  animations: {
    sequence: vi.fn(),
    cleanup: vi.fn(),
  },
  accessibility: {
    shouldAnimate: vi.fn(() => true),
  },
}));

// Mock game constants
vi.mock('@constants/gameConstants', () => ({
  UI_DIMENSIONS: {
    CARD_WIDTH: 120,
    CARD_SPACING: 20,
    CARD_OVERLAP_FACTOR: 0.8,
    CARD_OVERLAP_REDUCTION: 0.1,
    HAND_ANGLE_MULTIPLIER: 2,
    HAND_MAX_ANGLE: 15,
    HAND_SELECTED_OFFSET: 20,
    HAND_HOVER_SCALE: 1.1,
    Z_INDEX: {
      SELECTED_CARD: 100,
      HOVERED_CARD: 50,
    },
  },
  TIMING: {
    TRANSITION_DURATION: 300,
  },
  STYLING: {
    TRANSITION_EASING: 'ease-in-out',
  },
}));

describe('PlayerHand Component', () => {
  const mockCards = [
    {
      id: 1,
      title: 'World War II',
      dateOccurred: '1939-09-01',
      category: 'Military',
    },
    {
      id: 2,
      title: 'Moon Landing',
      dateOccurred: '1969-07-20',
      category: 'Space',
    },
    {
      id: 3,
      title: 'Internet Creation',
      dateOccurred: '1989-03-12',
      category: 'Technology',
    },
  ];

  const mockOnCardSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Empty Hand State', () => {
    it('displays victory message when no cards remain', () => {
      render(
        <PlayerHand
          cards={[]}
          selectedCard={null}
          onCardSelect={mockOnCardSelect}
          isPlayerTurn={true}
          playerName="Player 1"
          maxCards={8}
        />
      );

      expect(screen.getByText("🎴 Player 1's Hand")).toBeInTheDocument();
      expect(screen.getByText('0 cards')).toBeInTheDocument();
      expect(screen.getByText('No cards remaining!')).toBeInTheDocument();
      expect(
        screen.getByText(/Congratulations! You've placed all your cards/)
      ).toBeInTheDocument();
      expect(screen.getByTestId('hand-victory-message')).toBeInTheDocument();
    });

    it('shows celebration stars in victory message', () => {
      render(
        <PlayerHand
          cards={[]}
          selectedCard={null}
          onCardSelect={mockOnCardSelect}
          isPlayerTurn={true}
          playerName="Player 1"
          maxCards={8}
        />
      );

      const stars = screen.getAllByText('⭐');
      expect(stars).toHaveLength(3);
    });
  });

  describe('Card Rendering', () => {
    it('renders all cards in hand', () => {
      render(
        <PlayerHand
          cards={mockCards}
          selectedCard={null}
          onCardSelect={mockOnCardSelect}
          isPlayerTurn={true}
          playerName="Player 1"
          maxCards={8}
        />
      );

      expect(screen.getByTestId('card-1')).toBeInTheDocument();
      expect(screen.getByTestId('card-2')).toBeInTheDocument();
      expect(screen.getByTestId('card-3')).toBeInTheDocument();
    });

    it('displays correct card information', () => {
      render(
        <PlayerHand
          cards={mockCards}
          selectedCard={null}
          onCardSelect={mockOnCardSelect}
          isPlayerTurn={true}
          playerName="Player 1"
          maxCards={8}
        />
      );

      expect(screen.getByText('World War II')).toBeInTheDocument();
      expect(screen.getByText('Moon Landing')).toBeInTheDocument();
      expect(screen.getByText('Internet Creation')).toBeInTheDocument();
    });

    it('shows correct card count', () => {
      render(
        <PlayerHand
          cards={mockCards}
          selectedCard={null}
          onCardSelect={mockOnCardSelect}
          isPlayerTurn={true}
          playerName="Player 1"
          maxCards={8}
        />
      );

      expect(screen.getByText('5 / 8 cards placed')).toBeInTheDocument();
    });
  });

  describe('Card Selection', () => {
    it('calls onCardSelect when card is clicked', () => {
      render(
        <PlayerHand
          cards={mockCards}
          selectedCard={null}
          onCardSelect={mockOnCardSelect}
          isPlayerTurn={true}
          playerName="Player 1"
          maxCards={8}
        />
      );

      const firstCard = screen.getByTestId('card-1');
      fireEvent.click(firstCard);

      expect(mockOnCardSelect).toHaveBeenCalledWith(mockCards[0]);
    });

    it('deselects card when same card is clicked again', () => {
      render(
        <PlayerHand
          cards={mockCards}
          selectedCard={mockCards[0]}
          onCardSelect={mockOnCardSelect}
          isPlayerTurn={true}
          playerName="Player 1"
          maxCards={8}
        />
      );

      const firstCard = screen.getByTestId('card-1');
      fireEvent.click(firstCard);

      expect(mockOnCardSelect).toHaveBeenCalledWith(null);
    });

    it('selects new card when different card is clicked', () => {
      render(
        <PlayerHand
          cards={mockCards}
          selectedCard={mockCards[0]}
          onCardSelect={mockOnCardSelect}
          isPlayerTurn={true}
          playerName="Player 1"
          maxCards={8}
        />
      );

      const secondCard = screen.getByTestId('card-2');
      fireEvent.click(secondCard);

      expect(mockOnCardSelect).toHaveBeenCalledWith(mockCards[1]);
    });
  });

  describe('Turn State', () => {
    it('shows "Your Turn" when isPlayerTurn is true', () => {
      render(
        <PlayerHand
          cards={mockCards}
          selectedCard={null}
          onCardSelect={mockOnCardSelect}
          isPlayerTurn={true}
          playerName="Player 1"
          maxCards={8}
        />
      );

      expect(screen.getByText('Your Turn')).toBeInTheDocument();
    });

    it('shows "Waiting..." when isPlayerTurn is false', () => {
      render(
        <PlayerHand
          cards={mockCards}
          selectedCard={null}
          onCardSelect={mockOnCardSelect}
          isPlayerTurn={false}
          playerName="Player 1"
          maxCards={8}
        />
      );

      expect(screen.getByText('Waiting...')).toBeInTheDocument();
    });

    it('applies disabled styling when not player turn', () => {
      const { container } = render(
        <PlayerHand
          cards={mockCards}
          selectedCard={null}
          onCardSelect={mockOnCardSelect}
          isPlayerTurn={false}
          playerName="Player 1"
          maxCards={8}
        />
      );

      const handContainer = container.querySelector('.player-hand-container');
      expect(handContainer).toHaveClass(
        'opacity-70',
        'pointer-events-none',
        'filter',
        'grayscale'
      );
    });

    it('applies active styling when player turn', () => {
      const { container } = render(
        <PlayerHand
          cards={mockCards}
          selectedCard={null}
          onCardSelect={mockOnCardSelect}
          isPlayerTurn={true}
          playerName="Player 1"
          maxCards={8}
        />
      );

      const handContainer = container.querySelector('.player-hand-container');
      expect(handContainer).toHaveClass('border-success', 'shadow-lg');
    });
  });

  describe('Selected Card Display', () => {
    it('shows selected card information when card is selected', () => {
      render(
        <PlayerHand
          cards={mockCards}
          selectedCard={mockCards[0]}
          onCardSelect={mockOnCardSelect}
          isPlayerTurn={true}
          playerName="Player 1"
          maxCards={8}
        />
      );

      expect(screen.getByText('Selected: World War II')).toBeInTheDocument();
      expect(
        screen.getByText('Click on the timeline to place this card')
      ).toBeInTheDocument();
      expect(screen.getByText('❌ Deselect')).toBeInTheDocument();
    });

    it('calls onCardSelect with null when deselect button is clicked', () => {
      render(
        <PlayerHand
          cards={mockCards}
          selectedCard={mockCards[0]}
          onCardSelect={mockOnCardSelect}
          isPlayerTurn={true}
          playerName="Player 1"
          maxCards={8}
        />
      );

      const deselectButton = screen.getByText('❌ Deselect');
      fireEvent.click(deselectButton);

      expect(mockOnCardSelect).toHaveBeenCalledWith(null);
    });

    it('shows instructions when no card is selected and player turn', () => {
      render(
        <PlayerHand
          cards={mockCards}
          selectedCard={null}
          onCardSelect={mockOnCardSelect}
          isPlayerTurn={true}
          playerName="Player 1"
          maxCards={8}
        />
      );

      expect(screen.getByText('How to play:')).toBeInTheDocument();
      expect(screen.getByText(/Click a card to select it/)).toBeInTheDocument();
      expect(
        screen.getByText(/Click on the timeline where it belongs/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/If correct, it stays! If wrong, try again/)
      ).toBeInTheDocument();
    });

    it('shows waiting message when no card is selected and not player turn', () => {
      render(
        <PlayerHand
          cards={mockCards}
          selectedCard={null}
          onCardSelect={mockOnCardSelect}
          isPlayerTurn={false}
          playerName="Player 1"
          maxCards={8}
        />
      );

      expect(screen.getByText('⏳')).toBeInTheDocument();
      expect(screen.getByText('Waiting for your turn...')).toBeInTheDocument();
    });
  });

  describe('Progress Bar', () => {
    it('shows progress bar with correct percentage', () => {
      render(
        <PlayerHand
          cards={mockCards}
          selectedCard={null}
          onCardSelect={mockOnCardSelect}
          isPlayerTurn={true}
          playerName="Player 1"
          maxCards={8}
        />
      );

      expect(screen.getByText('5 / 8 cards placed')).toBeInTheDocument();
    });

    it('updates progress when cards are placed', () => {
      const { rerender } = render(
        <PlayerHand
          cards={mockCards}
          selectedCard={null}
          onCardSelect={mockOnCardSelect}
          isPlayerTurn={true}
          playerName="Player 1"
          maxCards={8}
        />
      );

      expect(screen.getByText('5 / 8 cards placed')).toBeInTheDocument();

      // Simulate having fewer cards (more placed)
      rerender(
        <PlayerHand
          cards={[mockCards[0]]}
          selectedCard={null}
          onCardSelect={mockOnCardSelect}
          isPlayerTurn={true}
          playerName="Player 1"
          maxCards={8}
        />
      );

      expect(screen.getByText('7 / 8 cards placed')).toBeInTheDocument();
    });
  });

  describe('Animation Methods', () => {
    it('exposes animation methods via ref', () => {
      const ref = React.createRef();

      render(
        <PlayerHand
          ref={ref}
          cards={mockCards}
          selectedCard={null}
          onCardSelect={mockOnCardSelect}
          isPlayerTurn={true}
          playerName="Player 1"
          maxCards={8}
        />
      );

      expect(ref.current).toHaveProperty('animateCardRemoval');
      expect(ref.current).toHaveProperty('animateNewCard');
      expect(ref.current).toHaveProperty('isAnimating');
    });

    it('tracks animation state correctly', () => {
      const ref = React.createRef();

      render(
        <PlayerHand
          ref={ref}
          cards={mockCards}
          selectedCard={null}
          onCardSelect={mockOnCardSelect}
          isPlayerTurn={true}
          playerName="Player 1"
          maxCards={8}
        />
      );

      expect(ref.current.isAnimating).toBe(false);
    });
  });

  describe('Accessibility', () => {
    it('has proper test IDs for testing', () => {
      render(
        <PlayerHand
          cards={mockCards}
          selectedCard={null}
          onCardSelect={mockOnCardSelect}
          isPlayerTurn={true}
          playerName="Player 1"
          maxCards={8}
        />
      );

      expect(screen.getByTestId('player-hand-container')).toBeInTheDocument();
      expect(screen.getAllByTestId('player-card-wrapper')).toHaveLength(3);
    });

    it('marks selected card with test ID', () => {
      render(
        <PlayerHand
          cards={mockCards}
          selectedCard={mockCards[0]}
          onCardSelect={mockOnCardSelect}
          isPlayerTurn={true}
          playerName="Player 1"
          maxCards={8}
        />
      );

      expect(screen.getByTestId('hand-selected-card')).toBeInTheDocument();
    });
  });
});
