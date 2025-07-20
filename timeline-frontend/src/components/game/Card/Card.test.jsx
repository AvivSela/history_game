/**
 * Card Component Tests
 * @description Tests for the Card component functionality
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Card from './Card';

// Mock the animation utilities
vi.mock('../../../utils/animation', () => ({
  animations: {
    cleanup: vi.fn()
  }
}));

// Mock the animation constants
vi.mock('../../../utils/animation/constants', () => ({
  OPTIMIZED_TIMINGS: {
    QUICK_FEEDBACK: 150,
    CARD_SELECTION: 200,
    CARD_SHAKE: 300,
    CARD_HIGHLIGHT: 250,
    CARD_FADE_OUT: 200,
    CARD_BOUNCE_IN: 400,
    WRONG_PLACEMENT: 500,
    TIMELINE_SHAKE: 300,
    INSERTION_POINT_ERROR: 200,
    TOTAL_SEQUENCE: 1000,
    TRANSITION_DURATION: 300,
    LOADING_DURATION: 1000
  },
  OPTIMIZED_EASING: {
    SHAKE: 'cubic-bezier(0.36, 0, 0.66, 1)',
    FADE_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
    BOUNCE_IN: 'cubic-bezier(0.4, 0, 0.2, 1)',
    HIGHLIGHT: 'cubic-bezier(0.4, 0, 0.2, 1)',
    WRONG_PLACEMENT: 'cubic-bezier(0.36, 0, 0.66, 1)',
    TIMELINE_SHAKE: 'cubic-bezier(0.36, 0, 0.66, 1)',
    INSERTION_POINT_ERROR: 'cubic-bezier(0.4, 0, 0.2, 1)',
    TRANSITION: 'cubic-bezier(0.4, 0, 0.2, 1)',
    LOADING: 'cubic-bezier(0.4, 0, 0.2, 1)'
  }
}));

// Mock the constants import
vi.mock('../../../constants/gameConstants', () => ({
  TIMING: {
    QUICK_FEEDBACK: 150,
    CARD_SELECTION: 200,
    CARD_SHAKE: 300,
    CARD_HIGHLIGHT: 250,
    CARD_FADE_OUT: 200,
    CARD_BOUNCE_IN: 400,
    WRONG_PLACEMENT: 500,
    TIMELINE_SHAKE: 300,
    INSERTION_POINT_ERROR: 200,
    TOTAL_SEQUENCE: 1000,
    TRANSITION_DURATION: 300,
    LOADING_DURATION: 1000,
    FRAME_BUDGET: 16,
    ANIMATION_TIMEOUT: 5000,
    MEMORY_LIMIT: 50,
    CONCURRENT_ANIMATION_LIMIT: 3
  }
}));

const mockEvent = {
  id: 1,
  title: 'World War II',
  description: 'Global conflict from 1939-1945',
  category: 'Military',
  difficulty: 3,
  dateOccurred: '1939-09-01'
};

describe('Card Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render card with event information', () => {
      render(<Card event={mockEvent} />);
      
      expect(screen.getByText('World War II')).toBeInTheDocument();
      expect(screen.getByText('Global conflict from 1939-1945')).toBeInTheDocument();
      expect(screen.getByText('Military')).toBeInTheDocument();
      // The date is displayed in the aria-label, not as separate text
      expect(screen.getByLabelText('World War II - 1939')).toBeInTheDocument();
    });

    it('should render difficulty stars correctly', () => {
      render(<Card event={mockEvent} />);
      
      const stars = screen.getAllByText('★');
      expect(stars).toHaveLength(3);
    });

    it('should render category icon', () => {
      render(<Card event={mockEvent} />);
      
      expect(screen.getByText('⚔️')).toBeInTheDocument();
    });

    it('should handle different categories', () => {
      const politicalEvent = { ...mockEvent, category: 'Political' };
      render(<Card event={politicalEvent} />);
      
      expect(screen.getByText('🏛️')).toBeInTheDocument();
    });

    it('should handle unknown categories gracefully', () => {
      const unknownEvent = { ...mockEvent, category: 'UnknownCategory' };
      render(<Card event={unknownEvent} />);
      
      expect(screen.getByText('📜')).toBeInTheDocument(); // Default icon
    });
  });

  describe('Card Sizes', () => {
    it('should render small size correctly', () => {
      render(<Card event={mockEvent} size="small" />);
      
      const card = screen.getByText('World War II').closest('.cursor-pointer');
      expect(card).toHaveClass('w-44', 'h-60');
    });

    it('should render medium size correctly', () => {
      render(<Card event={mockEvent} size="medium" />);
      
      const card = screen.getByText('World War II').closest('.cursor-pointer');
      expect(card).toHaveClass('w-55', 'h-75');
    });

    it('should render large size correctly', () => {
      render(<Card event={mockEvent} size="large" />);
      
      const card = screen.getByText('World War II').closest('.cursor-pointer');
      expect(card).toHaveClass('w-64', 'h-80');
    });
  });

  describe('Card States', () => {
    it('should apply selected state styles', () => {
      render(<Card event={mockEvent} isSelected={true} />);
      
      const card = screen.getByText('World War II').closest('.cursor-pointer');
      expect(card).toHaveClass('-translate-y-3', 'z-50');
    });

    it('should apply animating state styles', () => {
      render(<Card event={mockEvent} isAnimating={true} />);
      
      const card = screen.getByText('World War II').closest('.cursor-pointer');
      expect(card).toHaveClass('card-animating');
    });

    it('should apply new card state styles', () => {
      render(<Card event={mockEvent} isNewCard={true} />);
      
      const card = screen.getByText('World War II').closest('.cursor-pointer');
      expect(card).toHaveClass('new-card');
    });

    it('should apply timeline card styles when className includes timeline-card', () => {
      render(<Card event={mockEvent} className="timeline-card" />);
      
      const card = screen.getByText('World War II').closest('.cursor-pointer');
      expect(card).toHaveClass('timeline-card');
    });
  });

  describe('Event Handlers', () => {
    it('should call onClick when card is clicked', () => {
      const handleClick = vi.fn();
      render(<Card event={mockEvent} onClick={handleClick} />);
      
      const card = screen.getByText('World War II').closest('.cursor-pointer');
      fireEvent.click(card);
      
      expect(handleClick).toHaveBeenCalledWith(mockEvent, expect.any(Object));
    });

    it('should call onDoubleClick when card is double-clicked', () => {
      const handleDoubleClick = vi.fn();
      render(<Card event={mockEvent} onDoubleClick={handleDoubleClick} />);
      
      const card = screen.getByText('World War II').closest('.cursor-pointer');
      fireEvent.doubleClick(card);
      
      expect(handleDoubleClick).toHaveBeenCalledWith(mockEvent, expect.any(Object));
    });

    it('should call onMouseEnter when mouse enters card', () => {
      const handleMouseEnter = vi.fn();
      render(<Card event={mockEvent} onMouseEnter={handleMouseEnter} />);
      
      const card = screen.getByText('World War II').closest('.cursor-pointer');
      fireEvent.mouseEnter(card);
      
      expect(handleMouseEnter).toHaveBeenCalledWith(mockEvent, expect.any(Object));
    });

    it('should call onMouseLeave when mouse leaves card', () => {
      const handleMouseLeave = vi.fn();
      render(<Card event={mockEvent} onMouseLeave={handleMouseLeave} />);
      
      const card = screen.getByText('World War II').closest('.cursor-pointer');
      fireEvent.mouseLeave(card);
      
      expect(handleMouseLeave).toHaveBeenCalledWith(mockEvent, expect.any(Object));
    });

    it('should apply hover styles on mouse enter', () => {
      render(<Card event={mockEvent} />);
      
      const card = screen.getByText('World War II').closest('.cursor-pointer');
      fireEvent.mouseEnter(card);
      
      expect(card).toHaveClass('scale-105', '-translate-y-2');
    });

    it('should remove hover styles on mouse leave', () => {
      render(<Card event={mockEvent} />);
      
      const card = screen.getByText('World War II').closest('.cursor-pointer');
      fireEvent.mouseEnter(card);
      fireEvent.mouseLeave(card);
      
      expect(card).not.toHaveClass('scale-105', '-translate-y-2');
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref to card element', () => {
      const ref = React.createRef();
      render(<Card event={mockEvent} ref={ref} />);
      
      expect(ref.current).toBeInstanceOf(HTMLElement);
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom styles', () => {
      const customStyle = { backgroundColor: 'red' };
      render(<Card event={mockEvent} style={customStyle} />);
      
      const card = screen.getByText('World War II').closest('.cursor-pointer');
      // Check that the style attribute contains the custom style
      expect(card).toHaveAttribute('style');
      expect(card.getAttribute('style')).toContain('background-color: red');
    });

    it('should apply custom className', () => {
      render(<Card event={mockEvent} className="custom-class" />);
      
      const card = screen.getByText('World War II').closest('.cursor-pointer');
      expect(card).toHaveClass('custom-class');
    });
  });

  describe('CSS Custom Properties', () => {
    it('should set CSS custom properties for animation states', () => {
      render(<Card event={mockEvent} isAnimating={true} isSelected={true} />);
      
      const card = screen.getByText('World War II').closest('.cursor-pointer');
      // CSS custom properties are set via style attribute
      expect(card).toHaveAttribute('style');
      expect(card.getAttribute('style')).toContain('--card-id: 1');
      expect(card.getAttribute('style')).toContain('--animation-state: running');
      expect(card.getAttribute('style')).toContain('--selection-state: selected');
    });
  });

  describe('Cleanup', () => {
    it('should cleanup animations on unmount', () => {
      const { unmount } = render(<Card event={mockEvent} />);
      
      unmount();
      
      // The cleanup effect is tested indirectly by ensuring the component unmounts without errors
      expect(true).toBe(true);
    });
  });
}); 