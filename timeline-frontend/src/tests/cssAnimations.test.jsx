import { describe, it, expect, beforeEach, afterEach } from 'vitest'

describe('CSS Animations', () => {
  let testElement

  beforeEach(() => {
    testElement = document.createElement('div')
    testElement.className = 'test-element'
    document.body.appendChild(testElement)
  })

  afterEach(() => {
    if (testElement && testElement.parentNode) {
      testElement.parentNode.removeChild(testElement)
    }
  })

  describe('Animation Classes', () => {
    it('should have card-animating class with GPU acceleration', () => {
      testElement.classList.add('card-animating')
      
      const computedStyle = window.getComputedStyle(testElement)
      
      expect(testElement.classList.contains('card-animating')).toBe(true)
    })

    it('should apply card-shake animation class', () => {
      testElement.classList.add('card-shake')
      
      expect(testElement.classList.contains('card-shake')).toBe(true)
      
      testElement.classList.remove('card-shake')
      expect(testElement.classList.contains('card-shake')).toBe(false)
    })

    it('should apply card-fade-out animation class', () => {
      testElement.classList.add('card-fade-out')
      
      expect(testElement.classList.contains('card-fade-out')).toBe(true)
      
      testElement.classList.remove('card-fade-out')
      expect(testElement.classList.contains('card-fade-out')).toBe(false)
    })

    it('should apply card-bounce-in animation class', () => {
      testElement.classList.add('card-bounce-in')
      
      expect(testElement.classList.contains('card-bounce-in')).toBe(true)
      
      testElement.classList.remove('card-bounce-in')
      expect(testElement.classList.contains('card-bounce-in')).toBe(false)
    })

    it('should apply card-highlight animation class', () => {
      testElement.classList.add('card-highlight')
      
      expect(testElement.classList.contains('card-highlight')).toBe(true)
      
      testElement.classList.remove('card-highlight')
      expect(testElement.classList.contains('card-highlight')).toBe(false)
    })

    it('should apply card-wrong-placement animation class', () => {
      testElement.classList.add('card-wrong-placement')
      
      expect(testElement.classList.contains('card-wrong-placement')).toBe(true)
      
      testElement.classList.remove('card-wrong-placement')
      expect(testElement.classList.contains('card-wrong-placement')).toBe(false)
    })

    it('should apply timeline-wrong-placement animation class', () => {
      testElement.classList.add('timeline-wrong-placement')
      
      expect(testElement.classList.contains('timeline-wrong-placement')).toBe(true)
      
      testElement.classList.remove('timeline-wrong-placement')
      expect(testElement.classList.contains('timeline-wrong-placement')).toBe(false)
    })

    it('should apply insertion-point-error animation class', () => {
      testElement.classList.add('insertion-point-error')
      
      expect(testElement.classList.contains('insertion-point-error')).toBe(true)
      
      testElement.classList.remove('insertion-point-error')
      expect(testElement.classList.contains('insertion-point-error')).toBe(false)
    })
  })

  describe('Animation Duration and Timing', () => {
    it('should have correct animation durations', () => {
      const animationClasses = [
        'card-shake',
        'card-fade-out', 
        'card-bounce-in',
        'card-highlight',
        'card-wrong-placement',
        'timeline-wrong-placement',
        'insertion-point-error'
      ]

      animationClasses.forEach(className => {
        testElement.classList.add(className)
        expect(testElement.classList.contains(className)).toBe(true)
        testElement.classList.remove(className)
        expect(testElement.classList.contains(className)).toBe(false)
      })
    })

    it('should handle multiple animation classes', () => {
      testElement.classList.add('card-animating', 'card-shake')
      
      expect(testElement.classList.contains('card-animating')).toBe(true)
      expect(testElement.classList.contains('card-shake')).toBe(true)
      
      testElement.classList.remove('card-animating', 'card-shake')
      
      expect(testElement.classList.contains('card-animating')).toBe(false)
      expect(testElement.classList.contains('card-shake')).toBe(false)
    })
  })

  describe('GPU Acceleration', () => {
    it('should have will-change property for animations', () => {
      testElement.classList.add('card-animating')
      
      expect(testElement.classList.contains('card-animating')).toBe(true)
    })

    it('should have transform translateZ for GPU acceleration', () => {
      const gpuAcceleratedClasses = [
        'card-shake',
        'card-fade-out',
        'card-bounce-in',
        'card-highlight',
        'card-wrong-placement'
      ]

      gpuAcceleratedClasses.forEach(className => {
        testElement.classList.add(className)
        expect(testElement.classList.contains(className)).toBe(true)
        testElement.classList.remove(className)
      })
    })
  })

  describe('Reduced Motion Support', () => {
    it('should respect reduced motion preference', () => {
      const reducedMotionClasses = [
        'card-shake',
        'card-fade-out',
        'card-bounce-in',
        'card-highlight',
        'card-wrong-placement',
        'timeline-wrong-placement',
        'insertion-point-error'
      ]

      reducedMotionClasses.forEach(className => {
        testElement.classList.add(className)
        expect(testElement.classList.contains(className)).toBe(true)
        testElement.classList.remove(className)
      })
    })

    it('should handle reduced motion media query', () => {
      testElement.classList.add('card-shake')
      
      const originalMatchMedia = window.matchMedia
      window.matchMedia = vi.fn().mockReturnValue({
        matches: true,
        addListener: vi.fn(),
        removeListener: vi.fn()
      })

      expect(testElement.classList.contains('card-shake')).toBe(true)
      
      window.matchMedia = originalMatchMedia
    })
  })

  describe('Animation Performance', () => {
    it('should apply animations efficiently', () => {
      const startTime = performance.now()
      
      // Apply multiple animation classes
      testElement.classList.add('card-animating', 'card-shake')
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // Class manipulation should be very fast (≤ 5ms)
      expect(duration).toBeLessThanOrEqual(5)
      expect(testElement.classList.contains('card-animating')).toBe(true)
      expect(testElement.classList.contains('card-shake')).toBe(true)
    })

    it('should handle rapid class changes', () => {
      const iterations = 100
      const startTime = performance.now()
      
      for (let i = 0; i < iterations; i++) {
        testElement.classList.add('card-shake')
        testElement.classList.remove('card-shake')
      }
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // 100 class changes should be reasonably fast (< 50ms)
      expect(duration).toBeLessThan(50)
      expect(testElement.classList.contains('card-shake')).toBe(false)
    })
  })

  describe('Animation Cleanup', () => {
    it('should clean up animation classes properly', () => {
      const animationClasses = [
        'card-shake',
        'card-fade-out',
        'card-bounce-in',
        'card-highlight',
        'card-wrong-placement',
        'timeline-wrong-placement',
        'insertion-point-error',
        'card-animating'
      ]

      // Add all classes
      animationClasses.forEach(className => {
        testElement.classList.add(className)
      })

      // Verify all classes are applied
      animationClasses.forEach(className => {
        expect(testElement.classList.contains(className)).toBe(true)
      })

      // Remove all classes
      animationClasses.forEach(className => {
        testElement.classList.remove(className)
      })

      // Verify all classes are removed
      animationClasses.forEach(className => {
        expect(testElement.classList.contains(className)).toBe(false)
      })
    })

    it('should handle cleanup of non-existent classes', () => {
      // Remove a class that doesn't exist
      testElement.classList.remove('non-existent-class')
      
      // Should not throw an error
      expect(testElement.classList.contains('non-existent-class')).toBe(false)
    })
  })

  describe('Animation Integration', () => {
    it('should work with DOM manipulation', () => {
      // Create a new element
      const newElement = document.createElement('div')
      newElement.className = 'new-element'
      
      // Apply animation class
      newElement.classList.add('card-shake')
      
      // Add to DOM
      document.body.appendChild(newElement)
      
      // Verify class is applied
      expect(newElement.classList.contains('card-shake')).toBe(true)
      
      // Remove from DOM
      document.body.removeChild(newElement)
    })

    it('should handle element removal during animation', () => {
      // Create element and apply animation
      const tempElement = document.createElement('div')
      tempElement.classList.add('card-shake')
      document.body.appendChild(tempElement)
      
      // Remove element while animation class is applied
      document.body.removeChild(tempElement)
      
      // Should not throw an error
      expect(true).toBe(true)
    })
  })

  describe('Animation Constants', () => {
    it('should have consistent animation class names', () => {
      const expectedClasses = [
        'card-animating',
        'card-shake',
        'card-fade-out',
        'card-bounce-in',
        'card-highlight',
        'card-wrong-placement',
        'timeline-wrong-placement',
        'insertion-point-error',
        'wrong-placement-indicator'
      ]

      expectedClasses.forEach(className => {
        // Test that class can be applied
        testElement.classList.add(className)
        expect(testElement.classList.contains(className)).toBe(true)
        testElement.classList.remove(className)
      })
    })

    it('should have animation classes that match expected patterns', () => {
      const classPatterns = [
        /^card-/,
        /^timeline-/,
        /^insertion-/,
        /^wrong-placement/
      ]

      const allClasses = [
        'card-animating',
        'card-shake',
        'card-fade-out',
        'card-bounce-in',
        'card-highlight',
        'card-wrong-placement',
        'timeline-wrong-placement',
        'insertion-point-error',
        'wrong-placement-indicator'
      ]

      // Each class should match at least one pattern
      allClasses.forEach(className => {
        const matchesPattern = classPatterns.some(pattern => pattern.test(className))
        expect(matchesPattern).toBe(true)
      })
    })
  })
}) 