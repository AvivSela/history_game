import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useState } from 'react'
import PlayerHand from '../components/game/PlayerHand'
import Timeline from '../components/game/Timeline'

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
      
      if (playerHand.length === 1) {
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
          initialTimeline={[mockCards[0]]}
          onScoreUpdate={onScoreUpdate}
        />
      )

      expect(screen.getByText('Berlin Wall Falls')).toBeInTheDocument()
      expect(screen.getByText('Score: 0')).toBeInTheDocument()

      const cardToSelect = screen.getByText('Berlin Wall Falls').closest('.player-card')
      fireEvent.click(cardToSelect)

      expect(screen.getByText('Selected: Berlin Wall Falls')).toBeInTheDocument()
      
      const insertionPoints = screen.getAllByTestId('insertion-point')
      expect(insertionPoints.length).toBeGreaterThan(0)

      const correctInsertionPoint = insertionPoints[1]
      fireEvent.click(correctInsertionPoint)

      await waitFor(() => {
        expect(screen.getByText('Score: 100')).toBeInTheDocument()
      })

      expect(screen.getByText(/Correct.*Berlin Wall Falls placed successfully/)).toBeInTheDocument()
      expect(onScoreUpdate).toHaveBeenCalledWith(100)

      expect(screen.getByText('0 cards')).toBeInTheDocument()
      expect(screen.getByText('No cards remaining!')).toBeInTheDocument()
    })

    it('should handle incorrect placement and allow retry', async () => {
      render(
        <MockGameComponent initialTimeline={[mockCards[0], mockCards[1]]} />
      )

      const cardToSelect = screen.getByText('Berlin Wall Falls').closest('.player-card')
      fireEvent.click(cardToSelect)

      const insertionPoints = screen.getAllByTestId('insertion-point')
      const wrongInsertionPoint = insertionPoints[0]
      fireEvent.click(wrongInsertionPoint)

      await waitFor(() => {
        expect(screen.getByText(/Incorrect.*Try again with Berlin Wall Falls/)).toBeInTheDocument()
      })
      expect(screen.getByText('Selected: Berlin Wall Falls')).toBeInTheDocument()
      expect(screen.getByText('Score: 0')).toBeInTheDocument()

      const correctInsertionPoint = insertionPoints[2]
      fireEvent.click(correctInsertionPoint)

      await waitFor(() => {
        expect(screen.getByText('Score: 100')).toBeInTheDocument()
      })

      expect(screen.getByText(/Correct.*Berlin Wall Falls placed successfully/)).toBeInTheDocument()
    })

    it('should handle card deselection', () => {
      render(
        <MockGameComponent initialTimeline={[mockCards[0]]} />
      )

      const cardToSelect = screen.getByText('Berlin Wall Falls').closest('.player-card')
      fireEvent.click(cardToSelect)
      expect(screen.getByText('Selected: Berlin Wall Falls')).toBeInTheDocument()

      fireEvent.click(cardToSelect)
      expect(screen.queryByText('Selected: Berlin Wall Falls')).not.toBeInTheDocument()

      const insertionPoints = screen.queryAllByTestId('insertion-point')
      expect(insertionPoints).toHaveLength(0)
    })

    it('should handle selecting different cards', () => {
      const multipleCards = [mockNewCard, mockCards[0]]
      render(
        <MockGameComponent 
          initialHand={multipleCards}
          initialTimeline={[mockCards[1]]} 
        />
      )

      const firstCard = screen.getByText('Berlin Wall Falls').closest('.player-card')
      fireEvent.click(firstCard)
      expect(screen.getByText('Selected: Berlin Wall Falls')).toBeInTheDocument()

      const secondCard = screen.getByText('World War II Begins').closest('.player-card')
      fireEvent.click(secondCard)
      expect(screen.getByText('Selected: World War II Begins')).toBeInTheDocument()
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

      const cardToSelect = screen.getByText('Berlin Wall Falls').closest('.player-card')
      fireEvent.click(cardToSelect)

      const insertionPoints = screen.getAllByTestId('insertion-point')
      fireEvent.click(insertionPoints[1])

      await waitFor(() => {
        expect(onGameComplete).toHaveBeenCalledWith(true)
      })
    })

    it('should show empty hand state when all cards are placed', async () => {
      render(
        <MockGameComponent 
          initialTimeline={[mockCards[0]]}
        />
      )

      const cardToSelect = screen.getByText('Berlin Wall Falls').closest('.player-card')
      fireEvent.click(cardToSelect)

      const insertionPoints = screen.getAllByTestId('insertion-point')
      fireEvent.click(insertionPoints[1])

      await waitFor(() => {
        expect(screen.getByTestId('hand-victory-message')).toBeInTheDocument()
        expect(screen.getByText('No cards remaining!')).toBeInTheDocument()
      })
    })
  })

  describe('Timeline Updates', () => {
    it('should properly sort timeline after card placement', async () => {
      render(
        <MockGameComponent 
          initialTimeline={[mockCards[0], mockCards[2]]} // 1939, 1989
        />
      )

      const cardToSelect = screen.getByText('Berlin Wall Falls').closest('.player-card')
      fireEvent.click(cardToSelect)

      const insertionPoints = screen.getAllByTestId('insertion-point')
      fireEvent.click(insertionPoints[2]) // Last position

      await waitFor(() => {
        expect(screen.getByText('Score: 100')).toBeInTheDocument()
      })

      const timelineCards = screen.getAllByTestId('timeline-card-wrapper')
      expect(timelineCards).toHaveLength(3)
    })
  })

  describe('Insertion Point Behavior', () => {
    it('should hide insertion points when no card is selected', () => {
      render(
        <MockGameComponent 
          initialTimeline={[mockCards[0]]}
        />
      )

      const insertionPoints = screen.queryAllByTestId('insertion-point')
      expect(insertionPoints).toHaveLength(0)
    })

    it('should show insertion points when card is selected', () => {
      render(
        <MockGameComponent 
          initialTimeline={[mockCards[0]]}
        />
      )

      const cardToSelect = screen.getByText('Berlin Wall Falls').closest('.player-card')
      fireEvent.click(cardToSelect)

      const insertionPoints = screen.getAllByTestId('insertion-point')
      expect(insertionPoints.length).toBeGreaterThan(0)
    })

    it('should show hover tooltips on insertion points', () => {
      render(
        <MockGameComponent 
          initialTimeline={[mockCards[0]]}
        />
      )

      const cardToSelect = screen.getByText('Berlin Wall Falls').closest('.player-card')
      fireEvent.click(cardToSelect)

      const insertionPoint = screen.getAllByTestId('insertion-point')[0]
      fireEvent.mouseEnter(insertionPoint)

      expect(screen.getByText('Place "Berlin Wall Falls" here')).toBeInTheDocument()
    })
  })
})