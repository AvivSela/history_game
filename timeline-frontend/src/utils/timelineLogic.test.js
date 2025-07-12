import { describe, it, expect, vi } from 'vitest'
import {
  validatePlacementWithTolerance,
  findCorrectPosition,
  generateExactMatchFeedback,
  generateCloseMatchFeedback,
  generateMissedFeedback,
  generateSmartInsertionPoints,
  calculateInsertionPointRelevance
} from './timelineLogic'

const mockTimeline = [
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

const testCard = {
  id: 4,
  title: 'Berlin Wall Falls',
  dateOccurred: '1989-11-09T00:00:00.000Z',
  category: 'History',
  difficulty: 2
}

const earlyCard = {
  id: 5,
  title: 'World War I Begins',
  dateOccurred: '1914-07-28T00:00:00.000Z',
  category: 'History',
  difficulty: 2
}

describe('timelineLogic', () => {
  describe('validatePlacementWithTolerance', () => {
    it('should validate exact correct placement', () => {
      const result = validatePlacementWithTolerance(testCard, mockTimeline, 3)
      
      expect(result.isCorrect).toBe(true)
      expect(result.isClose).toBe(false)
      expect(result.correctPosition).toBe(3)
      expect(result.userPosition).toBe(3)
      expect(result.positionDiff).toBe(0)
      expect(result.feedbackType).toBe('perfect')
      expect(result.feedback).toContain('Berlin Wall Falls')
    })

    it('should detect incorrect placement', () => {
      const result = validatePlacementWithTolerance(testCard, mockTimeline, 0)
      
      expect(result.isCorrect).toBe(false)
      expect(result.isClose).toBe(false)
      expect(result.correctPosition).toBe(3)
      expect(result.userPosition).toBe(0)
      expect(result.positionDiff).toBe(3)
      expect(result.feedbackType).toBe('miss')
    })

    it('should calculate position difference correctly', () => {
      const result1 = validatePlacementWithTolerance(testCard, mockTimeline, 1)
      const result2 = validatePlacementWithTolerance(testCard, mockTimeline, 2)
      
      expect(result1.positionDiff).toBe(2)
      expect(result2.positionDiff).toBe(1)
    })

    it('should provide detailed feedback information', () => {
      const result = validatePlacementWithTolerance(testCard, mockTimeline, 1)
      
      expect(result.feedback).toContain('1989')
      expect(result.feedback).toContain('later')
    })
  })

  describe('findCorrectPosition', () => {
    it('should find position at beginning', () => {
      const position = findCorrectPosition(earlyCard, mockTimeline)
      expect(position).toBe(0)
    })

    it('should find position in middle', () => {
      const middleCard = { dateOccurred: '1950-01-01T00:00:00.000Z' }
      const position = findCorrectPosition(middleCard, mockTimeline)
      expect(position).toBe(1)
    })

    it('should find position at end', () => {
      const position = findCorrectPosition(testCard, mockTimeline)
      expect(position).toBe(3)
    })

    it('should handle unsorted timeline', () => {
      const unsortedTimeline = [mockTimeline[1], mockTimeline[0], mockTimeline[2]]
      const position = findCorrectPosition(testCard, unsortedTimeline)
      expect(position).toBe(3)
    })

    it('should handle empty timeline', () => {
      const position = findCorrectPosition(testCard, [])
      expect(position).toBe(0)
    })

    it('should handle single item timeline', () => {
      const position = findCorrectPosition(testCard, [mockTimeline[0]])
      expect(position).toBe(1)
    })
  })

  describe('generateExactMatchFeedback', () => {
    it('should generate positive feedback', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0)
      const feedback = generateExactMatchFeedback(testCard)
      
      expect(feedback).toContain('🎯')
      expect(feedback).toContain('Perfect placement!')
      expect(feedback).toContain('Berlin Wall Falls')
      
      Math.random.mockRestore()
    })

    it('should include card title in feedback', () => {
      const feedback = generateExactMatchFeedback(testCard)
      expect(feedback).toContain('Berlin Wall Falls')
    })

    it('should include encouraging emoji and text', () => {
      const feedback = generateExactMatchFeedback(testCard)
      const hasEmoji = /[🎯⭐🏆💎🎉]/.test(feedback)
      expect(hasEmoji).toBe(true)
    })
  })

  describe('generateCloseMatchFeedback', () => {
    it('should generate directional feedback for positive difference', () => {
      const feedback = generateCloseMatchFeedback(testCard, 1)
      
      expect(feedback).toContain('Berlin Wall Falls')
      expect(feedback).toContain('1989')
      expect(feedback).toContain('earlier')
    })

    it('should generate directional feedback for negative difference', () => {
      const feedback = generateCloseMatchFeedback(testCard, -1)
      
      expect(feedback).toContain('Berlin Wall Falls')
      expect(feedback).toContain('1989')
      expect(feedback).toContain('later')
    })

    it('should include encouraging language', () => {
      const feedback = generateCloseMatchFeedback(testCard, 1)
      const hasEncouragement = /Very close|Almost perfect|Great attempt|Good work/.test(feedback)
      expect(hasEncouragement).toBe(true)
    })
  })

  describe('generateMissedFeedback', () => {
    it('should provide hint for card between two timeline events', () => {
      const card = { 
        title: 'Test Event',
        dateOccurred: '1955-01-01T00:00:00.000Z'
      }
      const feedback = generateMissedFeedback(card, 0, 1, mockTimeline)
      
      expect(feedback).toContain('Test Event')
      expect(feedback).toContain('1955')
      expect(feedback).toContain('between')
      expect(feedback).toContain('1939')
      expect(feedback).toContain('1969')
    })

    it('should provide hint for card before all timeline events', () => {
      const feedback = generateMissedFeedback(earlyCard, 2, 0, mockTimeline)
      
      expect(feedback).toContain('World War I Begins')
      expect(feedback).toContain('1914')
      expect(feedback).toContain('before 1939')
      expect(feedback).toContain('earlier')
    })

    it('should provide hint for card after all timeline events', () => {
      const futureCard = {
        title: 'Future Event',
        dateOccurred: '2000-01-01T00:00:00.000Z'
      }
      const feedback = generateMissedFeedback(futureCard, 0, 3, mockTimeline)
      
      expect(feedback).toContain('Future Event')
      expect(feedback).toContain('2000')
      expect(feedback).toContain('after 1989')
      expect(feedback).toContain('later')
    })

    it('should include directional guidance', () => {
      const feedback1 = generateMissedFeedback(testCard, 0, 3, mockTimeline)
      const feedback2 = generateMissedFeedback(testCard, 3, 0, mockTimeline)
      
      expect(feedback1).toContain('later')
      expect(feedback2).toContain('earlier')
    })

    it('should include decade information', () => {
      const feedback = generateMissedFeedback(testCard, 0, 3, mockTimeline)
      expect(feedback).toContain('1980s')
    })
  })

  describe('generateSmartInsertionPoints', () => {
    it('should generate correct number of insertion points', () => {
      const points = generateSmartInsertionPoints(mockTimeline)
      
      // Should have: before first (1) + between each (2) + after last (1) = 4 total
      expect(points).toHaveLength(4)
    })

    it('should generate insertion point before first card', () => {
      const points = generateSmartInsertionPoints(mockTimeline)
      const firstPoint = points[0]
      
      expect(firstPoint.index).toBe(0)
      expect(firstPoint.position).toBe('before')
      expect(firstPoint.hint).toContain('Before 1939')
    })

    it('should generate insertion points between cards', () => {
      const points = generateSmartInsertionPoints(mockTimeline)
      const betweenPoint = points[1]
      
      expect(betweenPoint.index).toBe(1)
      expect(betweenPoint.position).toBe('between')
      expect(betweenPoint.hint).toContain('Between 1939 and 1969')
      expect(betweenPoint.gap).toBe(30)
    })

    it('should generate insertion point after last card', () => {
      const points = generateSmartInsertionPoints(mockTimeline)
      const lastPoint = points[3]
      
      expect(lastPoint.index).toBe(3)
      expect(lastPoint.position).toBe('after')
      expect(lastPoint.hint).toContain('After 1989')
    })

    it('should assign difficulty based on year gaps', () => {
      const points = generateSmartInsertionPoints(mockTimeline)
      const betweenPoints = points.filter(p => p.position === 'between')
      
      // Gap between 1939 and 1969 is 30 years (medium)
      // Gap between 1969 and 1989 is 20 years (medium)
      betweenPoints.forEach(point => {
        expect(['easy', 'medium', 'hard']).toContain(point.difficulty)
      })
    })

    it('should handle empty timeline', () => {
      const points = generateSmartInsertionPoints([])
      
      expect(points).toHaveLength(1)
      expect(points[0].position).toBe('before')
      expect(points[0].hint).toBe('First position')
    })

    it('should add relevance scores when selected card provided', () => {
      const points = generateSmartInsertionPoints(mockTimeline, testCard)
      
      points.forEach(point => {
        expect(point.relevance).toBeDefined()
        expect(typeof point.relevance).toBe('number')
        expect(point.relevance).toBeGreaterThanOrEqual(0)
        expect(point.relevance).toBeLessThanOrEqual(1)
      })
    })
  })

  describe('calculateInsertionPointRelevance', () => {
    const insertionPoint = {
      referenceCard: mockTimeline[0], // 1939
      nextCard: mockTimeline[1] // 1969
    }


    it('should return lower relevance for distant cards', () => {
      const distantCard = new Date('2000-01-01T00:00:00.000Z')
      const relevance = calculateInsertionPointRelevance(insertionPoint, distantCard)
      
      expect(relevance).toBe(0.3)
    })

    it('should handle insertion point without next card', () => {
      const endPoint = {
        referenceCard: mockTimeline[2], // 1989
        nextCard: null
      }
      const cardDate = new Date('1990-01-01T00:00:00.000Z')
      const relevance = calculateInsertionPointRelevance(endPoint, cardDate)
      
      expect(relevance).toBe(0.9) // Close to reference card
    })

    it('should return base relevance when no reference card', () => {
      const noRefPoint = {
        referenceCard: null,
        nextCard: null
      }
      const cardDate = new Date('1950-01-01T00:00:00.000Z')
      const relevance = calculateInsertionPointRelevance(noRefPoint, cardDate)
      
      expect(relevance).toBe(0.5)
    })
  })
})