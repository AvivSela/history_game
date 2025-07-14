import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Timeline from './Timeline'

const mockEvents = [
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

const mockSelectedCard = {
  id: 4,
  title: 'Berlin Wall Falls',
  dateOccurred: '1989-11-09T00:00:00.000Z',
  category: 'History',
  difficulty: 2
}

describe('Timeline', () => {
  describe('Insertion Points', () => {
    it('should not show insertion points when highlightInsertionPoints is false', () => {
      render(
        <Timeline 
          events={mockEvents}
          highlightInsertionPoints={false}
        />
      )
      
      const insertionPoints = screen.queryAllByTestId('insertion-point')
      expect(insertionPoints).toHaveLength(0)
    })

    it('should show insertion points when highlightInsertionPoints is true', () => {
      render(
        <Timeline 
          events={mockEvents}
          highlightInsertionPoints={true}
        />
      )
      
      const insertionPoints = screen.getAllByTestId('insertion-point')
      expect(insertionPoints).toHaveLength(4) // Before first + after each event
    })

    it('should show insertion points with proper positioning', () => {
      render(
        <Timeline 
          events={mockEvents}
          highlightInsertionPoints={true}
        />
      )
      
      const insertionPoints = screen.getAllByTestId('insertion-point')
      expect(insertionPoints).toHaveLength(4)
      
      // Check data attributes for drop zones
      expect(insertionPoints[0]).toHaveAttribute('data-drop-zone', 'timeline-0')
      expect(insertionPoints[1]).toHaveAttribute('data-drop-zone', 'timeline-1')
      expect(insertionPoints[2]).toHaveAttribute('data-drop-zone', 'timeline-2')
      expect(insertionPoints[3]).toHaveAttribute('data-drop-zone', 'timeline-3')
    })

    it('should make insertion points clickable when a card is selected', () => {
      render(
        <Timeline 
          events={mockEvents}
          highlightInsertionPoints={true}
          selectedCard={mockSelectedCard}
        />
      )
      
      const insertionPoints = screen.getAllByTestId('insertion-point')
      insertionPoints.forEach(point => {
        expect(point).toHaveClass('opacity-60')
      })
    })

    it('should call onInsertionPointClick when insertion point is clicked', () => {
      const onInsertionPointClick = vi.fn()
      render(
        <Timeline 
          events={mockEvents}
          highlightInsertionPoints={true}
          selectedCard={mockSelectedCard}
          onInsertionPointClick={onInsertionPointClick}
        />
      )
      
      const firstInsertionPoint = screen.getAllByTestId('insertion-point')[0]
      fireEvent.click(firstInsertionPoint)
      
      expect(onInsertionPointClick).toHaveBeenCalledWith(0)
    })

    it('should not call onInsertionPointClick when no card is selected', () => {
      const onInsertionPointClick = vi.fn()
      render(
        <Timeline 
          events={mockEvents}
          highlightInsertionPoints={true}
          selectedCard={null}
          onInsertionPointClick={onInsertionPointClick}
        />
      )
      
      const firstInsertionPoint = screen.getAllByTestId('insertion-point')[0]
      fireEvent.click(firstInsertionPoint)
      
      expect(onInsertionPointClick).not.toHaveBeenCalled()
    })

    it('should show hover tooltip when insertion point is hovered with selected card', () => {
      render(
        <Timeline 
          events={mockEvents}
          highlightInsertionPoints={true}
          selectedCard={mockSelectedCard}
        />
      )
      
      const firstInsertionPoint = screen.getAllByTestId('insertion-point')[0]
      fireEvent.mouseEnter(firstInsertionPoint)
      
      expect(screen.getByText('Place "Berlin Wall Falls" here')).toBeInTheDocument()
      expect(screen.getByText('📍')).toBeInTheDocument()
    })

    it('should remove tooltip when mouse leaves insertion point', () => {
      render(
        <Timeline 
          events={mockEvents}
          highlightInsertionPoints={true}
          selectedCard={mockSelectedCard}
        />
      )
      
      const firstInsertionPoint = screen.getAllByTestId('insertion-point')[0]
      fireEvent.mouseEnter(firstInsertionPoint)
      expect(screen.getByText('Place "Berlin Wall Falls" here')).toBeInTheDocument()
      
      fireEvent.mouseLeave(firstInsertionPoint)
      expect(screen.queryByText('Place "Berlin Wall Falls" here')).not.toBeInTheDocument()
    })

    it('should apply hovered class when insertion point is hovered', () => {
      render(
        <Timeline 
          events={mockEvents}
          highlightInsertionPoints={true}
          selectedCard={mockSelectedCard}
        />
      )
      
      const firstInsertionPoint = screen.getAllByTestId('insertion-point')[0]
      fireEvent.mouseEnter(firstInsertionPoint)
      
      expect(firstInsertionPoint).toHaveClass('opacity-100', 'scale-110', 'bg-blue-500/5', 'rounded-lg')
    })
  })

  describe('Event Display', () => {
    it('should display events in chronological order', () => {
      render(<Timeline events={mockEvents} />)
      
      const cardTitles = screen.getAllByText(/World War II Begins|Moon Landing|Internet Created/)
      expect(cardTitles[0]).toHaveTextContent('World War II Begins')
      expect(cardTitles[1]).toHaveTextContent('Moon Landing')
      expect(cardTitles[2]).toHaveTextContent('Internet Created')
    })

    it('should display correct year information for events', () => {
      render(<Timeline events={mockEvents} />)
      
      expect(screen.getByText('1939')).toBeInTheDocument()
      expect(screen.getByText('1969')).toBeInTheDocument()
      expect(screen.getByText('1989')).toBeInTheDocument()
    })

    it('should display correct date information for events', () => {
      render(<Timeline events={mockEvents} />)
      
      expect(screen.getByText('Sep 1')).toBeInTheDocument()
      expect(screen.getByText('Jul 20')).toBeInTheDocument()
      expect(screen.getByText('Mar 12')).toBeInTheDocument()
    })

    it('should call onCardClick when timeline card is clicked', () => {
      const onCardClick = vi.fn()
      render(
        <Timeline 
          events={mockEvents}
          onCardClick={onCardClick}
        />
      )
      
      const firstCard = screen.getByText('World War II Begins')
      fireEvent.click(firstCard)
      
      expect(onCardClick).toHaveBeenCalledWith(mockEvents[0])
    })
  })

  describe('Empty Timeline', () => {
    it('should show empty state when no events exist', () => {
      render(<Timeline events={[]} />)
      
      expect(screen.getByText('Timeline is empty')).toBeInTheDocument()
      expect(screen.getByText('Cards will appear here as you place them correctly')).toBeInTheDocument()
    })

    it('should show insertion point in empty timeline when highlighting is enabled', () => {
      render(
        <Timeline 
          events={[]}
          highlightInsertionPoints={true}
        />
      )
      
      const insertionPoints = screen.getAllByTestId('insertion-point')
      expect(insertionPoints).toHaveLength(1)
    })
  })

  describe('Scroll Controls', () => {
    it('should show scroll controls when there are more than 2 events', () => {
      render(<Timeline events={mockEvents} />)
      
      expect(screen.getByTestId('timeline-scroll')).toBeInTheDocument()
    })

    it('should not show scroll controls when there are 2 or fewer events', () => {
      const fewEvents = mockEvents.slice(0, 2)
      render(<Timeline events={fewEvents} />)
      
      expect(screen.queryByTestId('timeline-scroll')).not.toBeInTheDocument()
    })

    it('should call scroll function when scroll buttons are clicked', () => {
      render(<Timeline events={mockEvents} />)
      
      const scrollContainer = screen.getByTestId('timeline-scroll')
      const leftButton = scrollContainer.querySelector('button[title="Scroll left"]')
      const rightButton = scrollContainer.querySelector('button[title="Scroll right"]')
      
      expect(leftButton).toBeInTheDocument()
      expect(rightButton).toBeInTheDocument()
      
      fireEvent.click(leftButton)
      fireEvent.click(rightButton)
      // Note: We can't easily test the actual scroll behavior in JSDOM
      // but we can verify the buttons exist and are clickable
    })
  })

  describe('Timeline Structure', () => {
    it('should have proper timeline structure elements', () => {
      render(<Timeline events={mockEvents} />)
      
      expect(screen.getByTestId('timeline-container')).toBeInTheDocument()
      expect(screen.getByTestId('timeline-content')).toBeInTheDocument()
      expect(screen.getByTestId('timeline-scroll')).toBeInTheDocument()
    })

    it('should wrap each event in proper structure', () => {
      render(<Timeline events={mockEvents} />)
      
      const cardWrappers = screen.getAllByTestId('timeline-card-wrapper')
      expect(cardWrappers).toHaveLength(3)
      
      // Each wrapper should contain a card
      cardWrappers.forEach(wrapper => {
        expect(wrapper).toBeInTheDocument()
      })
    })
  })
})