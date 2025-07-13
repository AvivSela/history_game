import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { prefersReducedMotion, cleanupAnimations } from '../utils/animationUtils';

// Mock window.matchMedia for tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('Animation Utility Tests', () => {
  describe('prefersReducedMotion', () => {
    it('should return false when window is undefined', () => {
      const originalWindow = global.window;
      delete global.window;
      
      expect(prefersReducedMotion()).toBe(false);
      
      global.window = originalWindow;
    });

    it('should return false when matchMedia is not supported', () => {
      const originalMatchMedia = window.matchMedia;
      delete window.matchMedia;
      
      expect(prefersReducedMotion()).toBe(false);
      
      window.matchMedia = originalMatchMedia;
    });

    it('should return true when user prefers reduced motion', () => {
      const originalMatchMedia = window.matchMedia;
      window.matchMedia = vi.fn().mockReturnValue({
        matches: true
      });
      
      expect(prefersReducedMotion()).toBe(true);
      
      window.matchMedia = originalMatchMedia;
    });

    it('should return false when user does not prefer reduced motion', () => {
      const originalMatchMedia = window.matchMedia;
      window.matchMedia = vi.fn().mockReturnValue({
        matches: false
      });
      
      expect(prefersReducedMotion()).toBe(false);
      
      window.matchMedia = originalMatchMedia;
    });
  });

  describe('cleanupAnimations', () => {
    it('should remove all animation classes', () => {
      const element = document.createElement('div');
      element.classList.add('card-shake');
      element.classList.add('card-animating');
      
      cleanupAnimations(element);
      
      expect(element.classList.contains('card-shake')).toBe(false);
      expect(element.classList.contains('card-animating')).toBe(false);
    });

    it('should handle null element gracefully', () => {
      expect(() => cleanupAnimations(null)).not.toThrow();
    });
  });
});

describe('Card Animation Integration Tests', () => {
  it('should animate card removal on incorrect placement', async () => {
    // This would test the full integration of animations in the game flow
    // Implementation would depend on the specific game state and component structure
  });

  it('should animate new card appearance', async () => {
    // This would test the bounce-in and highlight animations for new cards
  });

  it('should respect reduced motion preferences', () => {
    // This would test that animations are disabled when user prefers reduced motion
  });
}); 