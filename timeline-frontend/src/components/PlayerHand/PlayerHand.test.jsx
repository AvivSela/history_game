import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PlayerHand from './PlayerHand'

const mockCards = [
  {
    id: 1,
    title: 'World War II Begins',
    dateOccurred: '1939-09-01T00:00:00.000Z',
    category: 'History',
    difficulty: 2
  },
  {
    id: 2,
    title: 'Moon Landing',
    dateOccurred: '1969-07-20T00:00:00.000Z',
    category: 'Science',
    difficulty: 1
  },
  {
    id: 3,
    title: 'Internet Created',
    dateOccurred: '1989-03-12T00:00:00.000Z',
    category: 'Technology',
    difficulty: 3
  }
]

describe('PlayerHand', () => {
  describe('Card Selection', () => {
    it('should render cards with click handlers', () => {
      const onCardSelect = vi.fn()
      render(
        <PlayerHand 
          cards={mockCards}
          onCardSelect={onCardSelect}
          isPlayerTurn={true}
        />
      )
      
      const cards = document.querySelectorAll('.player-card')
      expect(cards).toHaveLength(mockCards.length) // Each card is rendered
    })

    it('should call onCardSelect when a card is clicked', () => {
      const onCardSelect = vi.fn()
      render(
        <PlayerHand 
          cards={mockCards}
          onCardSelect={onCardSelect}
          isPlayerTurn={true}
        />
      )
      
      const firstCard = screen.getByText('World War II Begins').closest('.player-card')
      fireEvent.click(firstCard)
      
      expect(onCardSelect).toHaveBeenCalledWith(mockCards[0])
    })

    it('should show visual feedback for selected card', () => {
      render(
        <PlayerHand 
          cards={mockCards}
          selectedCard={mockCards[0]}
          isPlayerTurn={true}
        />
      )
      
      const selectedWrapper = screen.getByText('World War II Begins').closest('.hand-card-wrapper')
      expect(selectedWrapper).toHaveClass('selected')
    })

    it('should deselect card when clicking the same card again', () => {
      const onCardSelect = vi.fn()
      render(
        <PlayerHand 
          cards={mockCards}
          selectedCard={mockCards[0]}
          onCardSelect={onCardSelect}
          isPlayerTurn={true}
        />
      )
      
      const selectedCard = screen.getByText('World War II Begins').closest('.player-card')
      fireEvent.click(selectedCard)
      
      expect(onCardSelect).toHaveBeenCalledWith(null)
    })

    it('should only allow one card selected at a time', () => {
      const onCardSelect = vi.fn()
      render(
        <PlayerHand 
          cards={mockCards}
          selectedCard={mockCards[0]}
          onCardSelect={onCardSelect}
          isPlayerTurn={true}
        />
      )
      
      const secondCard = screen.getByText('Moon Landing').closest('.player-card')
      fireEvent.click(secondCard)
      
      expect(onCardSelect).toHaveBeenCalledWith(mockCards[1])
    })

    it('should show selected card info when card is selected', () => {
      render(
        <PlayerHand 
          cards={mockCards}
          selectedCard={mockCards[0]}
          isPlayerTurn={true}
        />
      )
      
      expect(screen.getByText('Selected: World War II Begins')).toBeInTheDocument()
      expect(screen.getByText('Click on the timeline to place this card')).toBeInTheDocument()
    })

    it('should show deselect button when card is selected', () => {
      const onCardSelect = vi.fn()
      render(
        <PlayerHand 
          cards={mockCards}
          selectedCard={mockCards[0]}
          onCardSelect={onCardSelect}
          isPlayerTurn={true}
        />
      )
      
      const deselectButton = screen.getByText('❌ Deselect')
      fireEvent.click(deselectButton)
      
      expect(onCardSelect).toHaveBeenCalledWith(null)
    })
  })

  describe('Turn Management', () => {
    it('should disable card selection when not player turn', () => {
      const onCardSelect = vi.fn()
      render(
        <PlayerHand 
          cards={mockCards}
          onCardSelect={onCardSelect}
          isPlayerTurn={false}
        />
      )
      
      const firstCard = screen.getByText('World War II Begins').closest('.player-card')
      fireEvent.click(firstCard)
      
      expect(onCardSelect).not.toHaveBeenCalled()
    })

    it('should show "Your Turn" indicator when it is player turn', () => {
      render(
        <PlayerHand 
          cards={mockCards}
          isPlayerTurn={true}
        />
      )
      
      expect(screen.getByText('Your Turn')).toBeInTheDocument()
    })

    it('should show "Waiting..." indicator when not player turn', () => {
      render(
        <PlayerHand 
          cards={mockCards}
          isPlayerTurn={false}
        />
      )
      
      expect(screen.getByText('Waiting...')).toBeInTheDocument()
    })

    it('should apply disabled styling when not player turn', () => {
      render(
        <PlayerHand 
          cards={mockCards}
          isPlayerTurn={false}
        />
      )
      
      const container = screen.getByText('🎴 You\'s Hand').closest('.player-hand-container')
      expect(container).toHaveClass('disabled')
    })

    it('should apply active turn styling when it is player turn', () => {
      render(
        <PlayerHand 
          cards={mockCards}
          isPlayerTurn={true}
        />
      )
      
      const container = screen.getByText('🎴 You\'s Hand').closest('.player-hand-container')
      expect(container).toHaveClass('active-turn')
    })
  })

  describe('Empty Hand State', () => {
    it('should show victory message when no cards remain', () => {
      render(<PlayerHand cards={[]} />)
      
      expect(screen.getByText('No cards remaining!')).toBeInTheDocument()
      expect(screen.getByText('Congratulations! You\'ve placed all your cards on the timeline.')).toBeInTheDocument()
      expect(screen.getByText('0 cards')).toBeInTheDocument()
    })

    it('should show victory animation elements when hand is empty', () => {
      render(<PlayerHand cards={[]} />)
      
      const stars = screen.getAllByText('⭐')
      expect(stars).toHaveLength(3)
    })
  })

  describe('Hand Information Display', () => {
    it('should display correct card count', () => {
      render(
        <PlayerHand 
          cards={mockCards}
          maxCards={8}
        />
      )
      
      expect(screen.getByText('3 / 8 cards')).toBeInTheDocument()
    })

    it('should show progress of cards placed', () => {
      render(
        <PlayerHand 
          cards={mockCards}
          maxCards={8}
        />
      )
      
      expect(screen.getByText('5 / 8 cards placed')).toBeInTheDocument()
    })

    it('should show selected card name in header when card is selected', () => {
      render(
        <PlayerHand 
          cards={mockCards}
          selectedCard={mockCards[0]}
        />
      )
      
      expect(screen.getByText('"World War II Begins" selected')).toBeInTheDocument()
    })

    it('should show capacity warning when hand is nearly full', () => {
      const manyCards = Array.from({ length: 7 }, (_, i) => ({
        id: i + 1,
        title: `Card ${i + 1}`,
        dateOccurred: '2000-01-01T00:00:00.000Z',
        category: 'Test',
        difficulty: 1
      }))
      
      render(
        <PlayerHand 
          cards={manyCards}
          maxCards={8}
        />
      )
      
      expect(screen.getByText('Hand is getting full! Place some cards on the timeline.')).toBeInTheDocument()
    })
  })

  describe('Instructions', () => {
    it('should show game instructions when no card is selected and it is player turn', () => {
      render(
        <PlayerHand 
          cards={mockCards}
          isPlayerTurn={true}
        />
      )
      
      expect(screen.getByText('How to play:')).toBeInTheDocument()
      expect(screen.getByText('Click a card to select it')).toBeInTheDocument()
      expect(screen.getByText('Click on the timeline where it belongs')).toBeInTheDocument()
    })

    it('should show waiting message when not player turn', () => {
      render(
        <PlayerHand 
          cards={mockCards}
          isPlayerTurn={false}
        />
      )
      
      expect(screen.getByText('Waiting for your turn...')).toBeInTheDocument()
    })
  })

  describe('Custom Player Name', () => {
    it('should display custom player name', () => {
      render(
        <PlayerHand 
          cards={mockCards}
          playerName="Alice"
        />
      )
      
      expect(screen.getByText('🎴 Alice\'s Hand')).toBeInTheDocument()
    })
  })
})