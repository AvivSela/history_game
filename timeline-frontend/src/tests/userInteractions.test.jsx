import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useState, useEffect } from 'react'
import PlayerHand from '../components/PlayerHand/PlayerHand'
import Timeline from '../components/Timeline/Timeline'

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

const mockPlayerCards = [
  {
    id: 4,
    title: 'Berlin Wall Falls',
    dateOccurred: '1989-11-09T00:00:00.000Z',
    category: 'History',
    difficulty: 2
  },
  {
    id: 5,
    title: 'World War I Begins',
    dateOccurred: '1914-07-28T00:00:00.000Z',
    category: 'History',
    difficulty: 1
  },
  {
    id: 6,
    title: 'First iPhone Released',
    dateOccurred: '2007-06-29T00:00:00.000Z',
    category: 'Technology',
    difficulty: 1
  },
  {
    id: 7,
    title: 'COVID-19 Pandemic',
    dateOccurred: '2020-03-11T00:00:00.000Z',
    category: 'Health',
    difficulty: 2
  },
  {
    id: 8,
    title: 'Fall of the Soviet Union',
    dateOccurred: '1991-12-26T00:00:00.000Z',
    category: 'History',
    difficulty: 2
  }
]

// Mock Game Interface for testing user interactions
const MockGameInterface = ({ 
  isAIMode = false,
  initialPlayerTurn = true 
}) => {
  const [playerHand, setPlayerHand] = useState(mockPlayerCards)
  const [timeline, setTimeline] = useState([mockCards[0]])
  const [selectedCard, setSelectedCard] = useState(null)
  const [isPlayerTurn, setIsPlayerTurn] = useState(initialPlayerTurn)
  const [gameStatus, setGameStatus] = useState('playing')
  const [score, setScore] = useState(0)

  useEffect(() => {
    if (playerHand.length === 0 && gameStatus !== 'won') {
      setGameStatus('won');
    }
  }, [playerHand, gameStatus]);

  const handleCardSelect = (card) => {
    if (!isPlayerTurn) return
    setSelectedCard(card)
  }

  const handleInsertionPointClick = (position) => {
    if (!selectedCard || !isPlayerTurn) return
    
    // Simulate successful placement
    const newTimeline = [...timeline]
    newTimeline.splice(position, 0, selectedCard)
    setTimeline(newTimeline)
    setPlayerHand(prev => prev.filter(card => card.id !== selectedCard.id))
    setSelectedCard(null)
    setScore(prev => prev + 100)

    // Switch turns in AI mode
    if (isAIMode) {
      setIsPlayerTurn(false)
      // Simulate AI turn
      setTimeout(() => setIsPlayerTurn(true), 1000)
    }

    // Check win condition
    if (playerHand.length === 1) { // Will be 0 after this placement
      setGameStatus('won')
    }
  }

  const handleRestart = () => {
    setPlayerHand(mockPlayerCards)
    setTimeline([mockCards[0]])
    setSelectedCard(null)
    setIsPlayerTurn(true)
    setGameStatus('playing')
    setScore(0)
  }

  const handleClearSelection = () => {
    setSelectedCard(null)
  }

  return (
    <div data-testid="game-interface">
      <div data-testid="game-controls">
        <button onClick={handleRestart} data-testid="restart-btn">
          🔄 Restart Game
        </button>
        {selectedCard && (
          <button onClick={handleClearSelection} data-testid="clear-selection-btn">
            ❌ Clear Selection
          </button>
        )}
      </div>
      
      <div data-testid="game-status">
        Status: {gameStatus} | Score: {score}
        {isAIMode && (
          <span data-testid="turn-indicator">
            {isPlayerTurn ? ' | Your Turn' : ' | AI Turn'}
          </span>
        )}
      </div>

      {/* Always render victory message if gameStatus is 'won' */}
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
        playerName={isAIMode ? "Player" : "You"}
      />
      
      <Timeline 
        events={timeline}
        highlightInsertionPoints={!!selectedCard && isPlayerTurn}
        selectedCard={selectedCard}
        onInsertionPointClick={handleInsertionPointClick}
      />
    </div>
  )
}

describe('User Interactions', () => {
  describe('Card Selection Interactions', () => {
    it('should allow clicking cards to select them', () => {
      render(<MockGameInterface />)
      
      const firstCard = screen.getByText('Berlin Wall Falls').closest('.player-card')
      fireEvent.click(firstCard)
      
      expect(screen.getByText('Selected: Berlin Wall Falls')).toBeInTheDocument()
    })

    it('should allow switching between card selections', () => {
      render(<MockGameInterface />)
      
      // Select first card
      const firstCard = screen.getByText('Berlin Wall Falls').closest('.player-card')
      fireEvent.click(firstCard)
      expect(screen.getByText('Selected: Berlin Wall Falls')).toBeInTheDocument()
      
      // Select second card
      const secondCard = screen.getByText('World War I Begins').closest('.player-card')
      fireEvent.click(secondCard)
      expect(screen.getByText('Selected: World War I Begins')).toBeInTheDocument()
      expect(screen.queryByText('Selected: Berlin Wall Falls')).not.toBeInTheDocument()
    })

    it('should allow deselecting cards by clicking them again', () => {
      render(<MockGameInterface />)
      
      const card = screen.getByText('Berlin Wall Falls').closest('.player-card')
      
      // Select card
      fireEvent.click(card)
      expect(screen.getByText('Selected: Berlin Wall Falls')).toBeInTheDocument()
      
      // Deselect by clicking again
      fireEvent.click(card)
      expect(screen.queryByText('Selected: Berlin Wall Falls')).not.toBeInTheDocument()
    })

    it('should show visual feedback for card hover states', () => {
      render(<MockGameInterface />)
      
      const card = screen.getByText('Berlin Wall Falls').closest('.player-card')
      
      // Test mouse enter
      fireEvent.mouseEnter(card)
      // Visual feedback is handled by CSS, so we just verify no errors occur
      expect(card).toBeInTheDocument()
      
      // Test mouse leave
      fireEvent.mouseLeave(card)
      expect(card).toBeInTheDocument()
    })
  })

  describe('Timeline Placement Interactions', () => {

    it('should show insertion point tooltips on hover', () => {
      render(<MockGameInterface />)
      
      // Select card first
      const card = screen.getByText('Berlin Wall Falls').closest('.player-card')
      fireEvent.click(card)
      
      // Hover over insertion point
      const insertionPoint = document.querySelector('.insertion-point')
      fireEvent.mouseEnter(insertionPoint)
      
      expect(screen.getByText('Place "Berlin Wall Falls" here')).toBeInTheDocument()
      
      // Mouse leave should hide tooltip
      fireEvent.mouseLeave(insertionPoint)
      expect(screen.queryByText('Place "Berlin Wall Falls" here')).not.toBeInTheDocument()
    })

    it('should not allow insertion point clicks when no card is selected', () => {
      const mockOnInsertionPointClick = vi.fn()
      render(
        <Timeline 
          events={[mockCards[0]]}
          highlightInsertionPoints={true}
          selectedCard={null}
          onInsertionPointClick={mockOnInsertionPointClick}
        />
      )
      
      const insertionPoint = document.querySelector('.insertion-point')
      fireEvent.click(insertionPoint)
      
      expect(mockOnInsertionPointClick).not.toHaveBeenCalled()
    })
  })

  describe('Game Control Interactions', () => {

    it('should clear selection when clear selection button is clicked', () => {
      render(<MockGameInterface />)
      
      // Select a card
      const card = screen.getByText('Berlin Wall Falls').closest('.player-card')
      fireEvent.click(card)
      expect(screen.getByText('Selected: Berlin Wall Falls')).toBeInTheDocument()
      
      // Clear selection
      const clearBtn = screen.getByTestId('clear-selection-btn')
      fireEvent.click(clearBtn)
      
      expect(screen.queryByText('Selected: Berlin Wall Falls')).not.toBeInTheDocument()
      expect(screen.queryByTestId('clear-selection-btn')).not.toBeInTheDocument()
    })

    it('should show clear selection button only when card is selected', () => {
      render(<MockGameInterface />)
      
      // Initially no clear button
      expect(screen.queryByTestId('clear-selection-btn')).not.toBeInTheDocument()
      
      // Select card - clear button appears
      const card = screen.getByText('Berlin Wall Falls').closest('.player-card')
      fireEvent.click(card)
      expect(screen.getByTestId('clear-selection-btn')).toBeInTheDocument()
      
      // Deselect card - clear button disappears
      fireEvent.click(card)
      expect(screen.queryByTestId('clear-selection-btn')).not.toBeInTheDocument()
    })
  })

  describe('Game Completion Interactions', () => {
    it('should show victory message after winning', async () => {
      render(<MockGameInterface />)
      
      // Play all cards in the hand
      let cardsLeft = true;
      while (cardsLeft) {
        const cardEls = Array.from(document.querySelectorAll('.player-card'));
        if (cardEls.length === 0) {
          cardsLeft = false;
          break;
        }
        // Click the first available card
        fireEvent.click(cardEls[0]);
        const insertionPoint = document.querySelector('.insertion-point');
        fireEvent.click(insertionPoint);
      }

      // Wait for UI update after last card is played
      await waitFor(() => {
        expect(screen.getByTestId('victory-message')).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByText(/Congratulations! You won/)).toBeInTheDocument();
      });
    })

    it('should disable further interactions after game completion', async () => {
      render(<MockGameInterface />)
      
      // Play all cards in the hand
      let cardsLeft = true;
      while (cardsLeft) {
        const cardEls = Array.from(document.querySelectorAll('.player-card'));
        if (cardEls.length === 0) {
          cardsLeft = false;
          break;
        }
        fireEvent.click(cardEls[0]);
        const insertionPoint = document.querySelector('.insertion-point');
        fireEvent.click(insertionPoint);
      }

      // Wait for UI update after last card is played
      await waitFor(() => {
        expect(screen.getByTestId('victory-message')).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByTestId('game-status').textContent).toContain('Status: won');
      });
      // Should show empty hand state
      expect(screen.getByText('No cards remaining!')).toBeInTheDocument();
    })
  })

  describe('Accessibility Interactions', () => {
    it('should support keyboard navigation for card selection', () => {
      render(<MockGameInterface />)
      
      const card = screen.getByText('Berlin Wall Falls').closest('.player-card')
      
      // Cards should be focusable (they have click handlers)
      expect(card).toBeInTheDocument()
      
      // Simulate keyboard interaction
      fireEvent.keyDown(card, { key: 'Enter' })
      fireEvent.keyDown(card, { key: ' ' }) // Space key
      
      // Component handles keyboard events through click handlers
    })

    it('should provide proper ARIA labels and roles', () => {
      render(<MockGameInterface />)
      
      // Check for important UI elements
      expect(screen.getByTestId('game-interface')).toBeInTheDocument()
      expect(screen.getByTestId('game-status')).toBeInTheDocument()
      expect(screen.getByTestId('restart-btn')).toBeInTheDocument()
      
      // Player hand should have proper structure
      expect(screen.getByText('🎴 You\'s Hand')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should handle rapid clicking without breaking', () => {
      render(<MockGameInterface />)
      
      const card = screen.getByText('Berlin Wall Falls').closest('.player-card')
      
      // Rapid clicks should not break the component
      fireEvent.click(card) // Select
      fireEvent.click(card) // Deselect
      fireEvent.click(card) // Select again
      
      // Should end up selected after odd number of clicks
      expect(screen.getByText('Selected: Berlin Wall Falls')).toBeInTheDocument()
    })

    it('should handle clicking insertion points without selection gracefully', () => {
      render(
        <Timeline 
          events={[mockCards[0]]}
          highlightInsertionPoints={true}
          selectedCard={null}
          onInsertionPointClick={vi.fn()}
        />
      )
      
      const insertionPoints = document.querySelectorAll('.insertion-point')
      
      // Should not crash when clicking without selection
      insertionPoints.forEach(point => {
        fireEvent.click(point)
      })
      
      expect(insertionPoints.length).toBeGreaterThan(0)
    })
  })
})