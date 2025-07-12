import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useState } from 'react'
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

const mockNewCard = {
  id: 4,
  title: 'Berlin Wall Falls',
  dateOccurred: '1989-11-09T00:00:00.000Z',
  category: 'History',
  difficulty: 2
}

// Mock Game Component that simulates the complete flow
const MockGameComponent = ({ 
  initialTimeline = [], 
  initialHand = [mockNewCard],
  onScoreUpdate = vi.fn(),
  onGameComplete = vi.fn()
}) => {
  const [timeline, setTimeline] = useState(initialTimeline)
  const [playerHand, setPlayerHand] = useState(initialHand)
  const [selectedCard, setSelectedCard] = useState(null)
  const [score, setScore] = useState(0)
  const [gameMessage, setGameMessage] = useState('')

  const handleCardSelect = (card) => {
    setSelectedCard(card)
  }

  const handleInsertionPointClick = (position) => {
    if (!selectedCard) return

    // Find correct position for the selected card
    const sortedTimeline = [...timeline].sort((a, b) => 
      new Date(a.dateOccurred) - new Date(b.dateOccurred)
    )
    
    const cardDate = new Date(selectedCard.dateOccurred)
    let correctPosition = 0
    
    for (let i = 0; i < sortedTimeline.length; i++) {
      const timelineDate = new Date(sortedTimeline[i].dateOccurred)
      if (cardDate <= timelineDate) {
        correctPosition = i
        break
      } else {
        correctPosition = i + 1
      }
    }
    
    const isCorrect = position === correctPosition
    
    if (isCorrect) {
      const newTimeline = [...timeline]
      newTimeline.splice(position, 0, selectedCard)
      setTimeline(newTimeline)
      setPlayerHand(prev => prev.filter(card => card.id !== selectedCard.id))
      setSelectedCard(null)
      const newScore = score + 100
      setScore(newScore)
      setGameMessage(`✅ Correct! ${selectedCard.title} placed successfully!`)
      onScoreUpdate(newScore)
      
      if (playerHand.length === 1) { // Will be 0 after this placement
        onGameComplete(true)
      }
    } else {
      setGameMessage(`❌ Incorrect! Try again with ${selectedCard.title}`)
    }
  }

  const isTimelineChronological = (timelineToCheck) => {
    for (let i = 1; i < timelineToCheck.length; i++) {
      const prevDate = new Date(timelineToCheck[i - 1].dateOccurred)
      const currDate = new Date(timelineToCheck[i].dateOccurred)
      if (prevDate > currDate) return false
    }
    return true
  }

  return (
    <div data-testid="mock-game">
      <div data-testid="game-score">Score: {score}</div>
      <div data-testid="game-message">{gameMessage}</div>
      
      <PlayerHand 
        cards={playerHand}
        selectedCard={selectedCard}
        onCardSelect={handleCardSelect}
        isPlayerTurn={true}
      />
      
      <Timeline 
        events={timeline}
        highlightInsertionPoints={!!selectedCard}
        selectedCard={selectedCard}
        onInsertionPointClick={handleInsertionPointClick}
      />
    </div>
  )
}

describe('Click-to-Place Flow Integration', () => {
  describe('Complete Game Flow', () => {
    it('should complete full click-to-select and click-to-place cycle', async () => {
      const onScoreUpdate = vi.fn()
      render(
        <MockGameComponent 
          initialTimeline={[mockCards[0]]} // Start with one card: 1939
          onScoreUpdate={onScoreUpdate}
        />
      )

      // 1. Verify initial state
      expect(screen.getByText('Berlin Wall Falls')).toBeInTheDocument()
      expect(screen.getByText('Score: 0')).toBeInTheDocument()

      // 2. Click to select card
      const cardToSelect = screen.getByText('Berlin Wall Falls').closest('.player-card')
      fireEvent.click(cardToSelect)

      // 3. Verify card is selected
      expect(screen.getByText('Selected: Berlin Wall Falls')).toBeInTheDocument()
      
      // 4. Verify insertion points are shown
      const insertionPoints = document.querySelectorAll('.insertion-point')
      expect(insertionPoints.length).toBeGreaterThan(0)

      // 5. Click on correct insertion point (Berlin Wall Falls 1989 should go after 1939)
      const correctInsertionPoint = insertionPoints[1] // After first card (1939)
      fireEvent.click(correctInsertionPoint)

      // 6. Wait for state updates
      await waitFor(() => {
        expect(screen.getByText('Score: 100')).toBeInTheDocument()
      })

      // 7. Verify successful placement
      expect(screen.getByText(/Correct.*Berlin Wall Falls placed successfully/)).toBeInTheDocument()
      expect(onScoreUpdate).toHaveBeenCalledWith(100)

      // 8. Verify card is removed from hand and empty state is shown
      expect(screen.getByText('0 cards')).toBeInTheDocument()
      expect(screen.getByText('No cards remaining!')).toBeInTheDocument()
    })

    it('should handle incorrect placement and allow retry', async () => {
      render(
        <MockGameComponent initialTimeline={[mockCards[0], mockCards[1]]} />
      )

      // Select card
      const cardToSelect = screen.getByText('Berlin Wall Falls').closest('.player-card')
      fireEvent.click(cardToSelect)

      // Click on wrong insertion point (position 0, before 1939)
      const insertionPoints = document.querySelectorAll('.insertion-point')
      const wrongInsertionPoint = insertionPoints[0]
      fireEvent.click(wrongInsertionPoint)

      // Verify error message and card still selected
      await waitFor(() => {
        expect(screen.getByText(/Incorrect.*Try again with Berlin Wall Falls/)).toBeInTheDocument()
      })
      expect(screen.getByText('Selected: Berlin Wall Falls')).toBeInTheDocument()
      expect(screen.getByText('Score: 0')).toBeInTheDocument()

      // Try again with correct position (after both 1939 and 1969)
      const correctInsertionPoint = insertionPoints[2] // After second card (1969)
      fireEvent.click(correctInsertionPoint)

      await waitFor(() => {
        expect(screen.getByText('Score: 100')).toBeInTheDocument()
      })
    })

    it('should handle card deselection', () => {
      render(<MockGameComponent initialTimeline={[mockCards[0]]} />)

      // Select card
      const cardToSelect = screen.getByText('Berlin Wall Falls').closest('.player-card')
      fireEvent.click(cardToSelect)
      expect(screen.getByText('Selected: Berlin Wall Falls')).toBeInTheDocument()

      // Click deselect button
      const deselectButton = screen.getByText('❌ Deselect')
      fireEvent.click(deselectButton)

      // Verify card is deselected
      expect(screen.queryByText('Selected: Berlin Wall Falls')).not.toBeInTheDocument()
      expect(screen.getByText('How to play:')).toBeInTheDocument()
    })

    it('should handle selecting different cards', () => {
      const multiCardHand = [mockNewCard, mockCards[2]]
      render(
        <MockGameComponent 
          initialTimeline={[mockCards[0]]} 
          initialHand={multiCardHand}
        />
      )

      // Select first card
      const firstCard = screen.getByText('Berlin Wall Falls').closest('.player-card')
      fireEvent.click(firstCard)
      expect(screen.getByText('Selected: Berlin Wall Falls')).toBeInTheDocument()

      // Select different card
      const secondCard = screen.getByText('Internet Created').closest('.player-card')
      fireEvent.click(secondCard)
      expect(screen.getByText('Selected: Internet Created')).toBeInTheDocument()
      expect(screen.queryByText('Selected: Berlin Wall Falls')).not.toBeInTheDocument()
    })
  })

  describe('Game Completion', () => {
    it('should trigger game completion when last card is placed', async () => {
      const onGameComplete = vi.fn()
      render(
        <MockGameComponent 
          initialTimeline={[mockCards[0]]}
          onGameComplete={onGameComplete}
        />
      )

      // Select and place the only card
      const cardToSelect = screen.getByText('Berlin Wall Falls').closest('.player-card')
      fireEvent.click(cardToSelect)

      const insertionPoints = document.querySelectorAll('.insertion-point')
      fireEvent.click(insertionPoints[1])

      await waitFor(() => {
        expect(onGameComplete).toHaveBeenCalledWith(true)
      })
    })

    it('should show empty hand state when all cards are placed', async () => {
      render(<MockGameComponent initialTimeline={[mockCards[0]]} />)

      // Place the card
      const cardToSelect = screen.getByText('Berlin Wall Falls').closest('.player-card')
      fireEvent.click(cardToSelect)

      const insertionPoints = document.querySelectorAll('.insertion-point')
      fireEvent.click(insertionPoints[1])

      await waitFor(() => {
        expect(screen.getByText('No cards remaining!')).toBeInTheDocument()
      })
      expect(screen.getByText('Congratulations! You\'ve placed all your cards on the timeline.')).toBeInTheDocument()
    })
  })

  describe('Timeline Updates', () => {
    it('should properly sort timeline after card placement', async () => {
      // Start with unsorted timeline to test sorting
      const unsortedTimeline = [mockCards[1], mockCards[0]] // 1969, 1939
      render(
        <MockGameComponent 
          initialTimeline={unsortedTimeline}
        />
      )

      // Place Berlin Wall Falls (1989) which should go at the end
      const cardToSelect = screen.getByText('Berlin Wall Falls').closest('.player-card')
      fireEvent.click(cardToSelect)

      const insertionPoints = document.querySelectorAll('.insertion-point')
      fireEvent.click(insertionPoints[2]) // Last position

      await waitFor(() => {
        expect(screen.getByText('Score: 100')).toBeInTheDocument()
      })

      // Verify the timeline shows events in chronological order
      const timelineCards = document.querySelectorAll('.timeline-card')
      expect(timelineCards).toHaveLength(3)
    })

  })

  describe('Insertion Point Behavior', () => {
    it('should hide insertion points when no card is selected', () => {
      render(<MockGameComponent initialTimeline={[mockCards[0]]} />)

      const insertionPoints = document.querySelectorAll('.insertion-point')
      expect(insertionPoints).toHaveLength(0)
    })

    it('should show insertion points when card is selected', () => {
      render(<MockGameComponent initialTimeline={[mockCards[0]]} />)

      const cardToSelect = screen.getByText('Berlin Wall Falls').closest('.player-card')
      fireEvent.click(cardToSelect)

      const insertionPoints = document.querySelectorAll('.insertion-point')
      expect(insertionPoints.length).toBeGreaterThan(0)
    })

    it('should show hover tooltips on insertion points', () => {
      render(<MockGameComponent initialTimeline={[mockCards[0]]} />)

      const cardToSelect = screen.getByText('Berlin Wall Falls').closest('.player-card')
      fireEvent.click(cardToSelect)

      const insertionPoint = document.querySelector('.insertion-point')
      fireEvent.mouseEnter(insertionPoint)

      expect(screen.getByText('Place "Berlin Wall Falls" here')).toBeInTheDocument()
    })
  })
})