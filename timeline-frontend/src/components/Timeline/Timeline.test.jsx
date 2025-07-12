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
      
      const insertionPoints = screen.queryAllByText('+')
      expect(insertionPoints).toHaveLength(0)
    })

    it('should show insertion points when highlightInsertionPoints is true', () => {
      render(
        <Timeline 
          events={mockEvents}
          highlightInsertionPoints={true}
        />
      )
      
      const insertionPoints = screen.getAllByText('+')
      expect(insertionPoints).toHaveLength(4) // Before first + after each event
    })

    it('should show insertion points with proper positioning', () => {
      render(
        <Timeline 
          events={mockEvents}
          highlightInsertionPoints={true}
        />
      )
      
      const insertionPoints = document.querySelectorAll('.insertion-point')
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
      
      const insertionPoints = document.querySelectorAll('.insertion-point')
      insertionPoints.forEach(point => {
        expect(point).toHaveClass('clickable')
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
      
      const firstInsertionPoint = document.querySelector('.insertion-point')
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
      
      const firstInsertionPoint = document.querySelector('.insertion-point')
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
      
      const firstInsertionPoint = document.querySelector('.insertion-point')
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
      
      const firstInsertionPoint = document.querySelector('.insertion-point')
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
      
      const firstInsertionPoint = document.querySelector('.insertion-point')
      fireEvent.mouseEnter(firstInsertionPoint)
      
      expect(firstInsertionPoint).toHaveClass('hovered')
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

    it('should display event count in header', () => {
      render(<Timeline events={mockEvents} />)
      
      expect(screen.getByText('📅 3 events')).toBeInTheDocument()
    })

    it('should display singular form for single event', () => {
      render(<Timeline events={[mockEvents[0]]} />)
      
      expect(screen.getByText('📅 1 event')).toBeInTheDocument()
    })

    it('should display year range for multiple events', () => {
      render(<Timeline events={mockEvents} />)
      
      expect(screen.getByText('1939 - 1989')).toBeInTheDocument()
    })
  })

  describe('Empty Timeline', () => {
    it('should show empty state when no events exist', () => {
      render(<Timeline events={[]} />)
      
      expect(screen.getByText('📅 Empty Timeline')).toBeInTheDocument()
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
      
      const insertionPoint = screen.getByText('+')
      expect(insertionPoint).toBeInTheDocument()
    })
  })

  describe('Scroll Controls', () => {
    it('should show scroll controls when there are more than 2 events', () => {
      render(<Timeline events={mockEvents} />)
      
      const leftScrollBtn = screen.getByTitle('Scroll left')
      const rightScrollBtn = screen.getByTitle('Scroll right')
      
      expect(leftScrollBtn).toBeInTheDocument()
      expect(rightScrollBtn).toBeInTheDocument()
    })

    it('should not show scroll controls when there are 2 or fewer events', () => {
      render(<Timeline events={mockEvents.slice(0, 2)} />)
      
      const leftScrollBtn = screen.queryByTitle('Scroll left')
      const rightScrollBtn = screen.queryByTitle('Scroll right')
      
      expect(leftScrollBtn).not.toBeInTheDocument()
      expect(rightScrollBtn).not.toBeInTheDocument()
    })

    it('should call scroll function when scroll buttons are clicked', () => {
      // Mock scrollTo method and scrollLeft property
      const mockScrollTo = vi.fn()
      Object.defineProperty(Element.prototype, 'scrollTo', {
        value: mockScrollTo,
        writable: true
      })
      
      // Mock scrollLeft to simulate current scroll position
      Object.defineProperty(Element.prototype, 'scrollLeft', {
        value: 0,
        writable: true
      })

      render(<Timeline events={mockEvents} />)
      
      const leftScrollBtn = screen.getByTitle('Scroll left')
      const rightScrollBtn = screen.getByTitle('Scroll right')
      
      fireEvent.click(leftScrollBtn)
      expect(mockScrollTo).toHaveBeenCalledWith({
        left: -300, // currentScroll (0) - scrollAmount (300) = -300
        behavior: 'smooth'
      })
      
      fireEvent.click(rightScrollBtn)
      expect(mockScrollTo).toHaveBeenCalledWith({
        left: 300, // currentScroll (0) + scrollAmount (300) = 300
        behavior: 'smooth'
      })
    })
  })

  describe('Timeline Structure', () => {
    it('should have proper timeline structure elements', () => {
      render(<Timeline events={mockEvents} />)
      
      expect(document.querySelector('.timeline-container')).toBeInTheDocument()
      expect(document.querySelector('.timeline-content')).toBeInTheDocument()
      expect(document.querySelector('.timeline-scroll')).toBeInTheDocument()
      expect(document.querySelector('.timeline-track')).toBeInTheDocument()
      expect(document.querySelector('.timeline-line')).toBeInTheDocument()
      expect(document.querySelector('.timeline-events')).toBeInTheDocument()
    })

    it('should wrap each event in proper structure', () => {
      render(<Timeline events={mockEvents} />)
      
      const cardWrappers = document.querySelectorAll('.timeline-card-wrapper')
      expect(cardWrappers).toHaveLength(3)
      
      const timelinePositions = document.querySelectorAll('.timeline-position')
      expect(timelinePositions).toHaveLength(3)
      
      const timelineCards = document.querySelectorAll('.timeline-card')
      expect(timelineCards).toHaveLength(3)
    })
  })
})