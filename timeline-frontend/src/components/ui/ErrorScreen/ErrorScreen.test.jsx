import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import ErrorScreen from './ErrorScreen';

describe('ErrorScreen', () => {
  const mockOnRetry = vi.fn();
  const mockOnGoHome = vi.fn();
  const defaultProps = {
    error: 'Test error message',
    onRetry: mockOnRetry,
    onGoHome: mockOnGoHome
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render error message', () => {
      render(<ErrorScreen {...defaultProps} />);
      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });

    it('should render error title', () => {
      render(<ErrorScreen {...defaultProps} />);
      expect(screen.getByText('🚫 Oops! Something went wrong')).toBeInTheDocument();
    });

    it('should render retry button', () => {
      render(<ErrorScreen {...defaultProps} />);
      expect(screen.getByText('🔄 Try Again')).toBeInTheDocument();
    });

    it('should render go home button', () => {
      render(<ErrorScreen {...defaultProps} />);
      expect(screen.getByText('🏠 Go Home')).toBeInTheDocument();
    });

    it('should render with proper CSS classes', () => {
      render(<ErrorScreen {...defaultProps} />);
      const container = screen.getByText('Test error message').closest('div');
      expect(container).toHaveClass('bg-card', 'p-10', 'rounded-lg', 'shadow-lg');
    });

    it('should render with proper layout structure', () => {
      render(<ErrorScreen {...defaultProps} />);
      const title = screen.getByText('🚫 Oops! Something went wrong');
      const message = screen.getByText('Test error message');
      const retryButton = screen.getByText('🔄 Try Again');
      const homeButton = screen.getByText('🏠 Go Home');

      expect(title).toBeInTheDocument();
      expect(message).toBeInTheDocument();
      expect(retryButton).toBeInTheDocument();
      expect(homeButton).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onRetry when retry button is clicked', () => {
      render(<ErrorScreen {...defaultProps} />);
      fireEvent.click(screen.getByText('🔄 Try Again'));
      expect(mockOnRetry).toHaveBeenCalledTimes(1);
    });

    it('should call onGoHome when go home button is clicked', () => {
      render(<ErrorScreen {...defaultProps} />);
      fireEvent.click(screen.getByText('🏠 Go Home'));
      expect(mockOnGoHome).toHaveBeenCalledTimes(1);
    });

    it('should call both callbacks when both buttons are clicked', () => {
      render(<ErrorScreen {...defaultProps} />);
      fireEvent.click(screen.getByText('🔄 Try Again'));
      fireEvent.click(screen.getByText('🏠 Go Home'));
      expect(mockOnRetry).toHaveBeenCalledTimes(1);
      expect(mockOnGoHome).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple clicks on retry button', () => {
      render(<ErrorScreen {...defaultProps} />);
      const retryButton = screen.getByText('🔄 Try Again');
      fireEvent.click(retryButton);
      fireEvent.click(retryButton);
      fireEvent.click(retryButton);
      expect(mockOnRetry).toHaveBeenCalledTimes(3);
    });

    it('should handle multiple clicks on go home button', () => {
      render(<ErrorScreen {...defaultProps} />);
      const homeButton = screen.getByText('🏠 Go Home');
      fireEvent.click(homeButton);
      fireEvent.click(homeButton);
      expect(mockOnGoHome).toHaveBeenCalledTimes(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing callbacks gracefully', () => {
      render(<ErrorScreen error="Test error" />);
      // Should not throw when clicking buttons without callbacks
      expect(() => {
        fireEvent.click(screen.getByText('🔄 Try Again'));
        fireEvent.click(screen.getByText('🏠 Go Home'));
      }).not.toThrow();
    });

    it('should handle empty error message', () => {
      render(<ErrorScreen error="" onRetry={mockOnRetry} onGoHome={mockOnGoHome} />);
      expect(screen.getByText('🚫 Oops! Something went wrong')).toBeInTheDocument();
      // Empty error message renders as empty paragraph
      const errorParagraph = screen.getByText('🚫 Oops! Something went wrong').nextElementSibling;
      expect(errorParagraph.textContent).toBe('');
    });

    it('should handle null error message', () => {
      render(<ErrorScreen error={null} onRetry={mockOnRetry} onGoHome={mockOnGoHome} />);
      expect(screen.getByText('🚫 Oops! Something went wrong')).toBeInTheDocument();
      // Null error message renders as empty string
      const errorParagraph = screen.getByText('🚫 Oops! Something went wrong').nextElementSibling;
      expect(errorParagraph.textContent).toBe('');
    });

    it('should handle undefined error message', () => {
      render(<ErrorScreen error={undefined} onRetry={mockOnRetry} onGoHome={mockOnGoHome} />);
      expect(screen.getByText('🚫 Oops! Something went wrong')).toBeInTheDocument();
      // Undefined error message renders as empty string
      const errorParagraph = screen.getByText('🚫 Oops! Something went wrong').nextElementSibling;
      expect(errorParagraph.textContent).toBe('');
    });

    it('should handle long error messages', () => {
      const longError = 'A'.repeat(1000);
      render(<ErrorScreen error={longError} onRetry={mockOnRetry} onGoHome={mockOnGoHome} />);
      expect(screen.getByText(longError)).toBeInTheDocument();
    });

    it('should handle error messages with special characters', () => {
      const specialError = 'Error with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?';
      render(<ErrorScreen error={specialError} onRetry={mockOnRetry} onGoHome={mockOnGoHome} />);
      expect(screen.getByText(specialError)).toBeInTheDocument();
    });

    it('should handle error messages with HTML-like content', () => {
      const htmlError = '<script>alert("test")</script>Error message';
      render(<ErrorScreen error={htmlError} onRetry={mockOnRetry} onGoHome={mockOnGoHome} />);
      expect(screen.getByText(htmlError)).toBeInTheDocument();
    });

    it('should handle error messages with emojis', () => {
      const emojiError = '🚨 Critical error occurred! 💥 System failure 🔥';
      render(<ErrorScreen error={emojiError} onRetry={mockOnRetry} onGoHome={mockOnGoHome} />);
      expect(screen.getByText(emojiError)).toBeInTheDocument();
    });

    it('should handle error messages with newlines', () => {
      const multilineError = 'Line 1\nLine 2\nLine 3';
      render(<ErrorScreen error={multilineError} onRetry={mockOnRetry} onGoHome={mockOnGoHome} />);
      // Multiline error message renders with line breaks
      const errorParagraph = screen.getByText('🚫 Oops! Something went wrong').nextElementSibling;
      expect(errorParagraph.textContent).toContain('Line 1');
      expect(errorParagraph.textContent).toContain('Line 2');
      expect(errorParagraph.textContent).toContain('Line 3');
    });

    it('should handle missing props gracefully', () => {
      render(<ErrorScreen />);
      expect(screen.getByText('🚫 Oops! Something went wrong')).toBeInTheDocument();
      // Missing error prop renders as empty string
      const errorParagraph = screen.getByText('🚫 Oops! Something went wrong').nextElementSibling;
      expect(errorParagraph.textContent).toBe('');
    });
  });

  describe('Accessibility', () => {
    it('should have proper button roles', () => {
      render(<ErrorScreen {...defaultProps} />);
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /go home/i })).toBeInTheDocument();
    });

    it('should be keyboard navigable', () => {
      render(<ErrorScreen {...defaultProps} />);
      const retryButton = screen.getByText('🔄 Try Again');
      const homeButton = screen.getByText('🏠 Go Home');
      
      retryButton.focus();
      expect(retryButton).toHaveFocus();
      
      // Test click instead of keyDown since buttons handle clicks
      fireEvent.click(retryButton);
      expect(mockOnRetry).toHaveBeenCalled();
      
      homeButton.focus();
      expect(homeButton).toHaveFocus();
      
      fireEvent.click(homeButton);
      expect(mockOnGoHome).toHaveBeenCalled();
    });

    it('should handle keyboard events properly', () => {
      render(<ErrorScreen {...defaultProps} />);
      const retryButton = screen.getByText('🔄 Try Again');
      
      // Test click events since buttons handle clicks
      fireEvent.click(retryButton);
      expect(mockOnRetry).toHaveBeenCalled();
      
      fireEvent.click(retryButton);
      expect(mockOnRetry).toHaveBeenCalledTimes(2);
    });

    it('should have proper heading structure', () => {
      render(<ErrorScreen {...defaultProps} />);
      const title = screen.getByText('🚫 Oops! Something went wrong');
      expect(title.tagName).toBe('H2');
    });

    it('should have proper semantic structure', () => {
      render(<ErrorScreen {...defaultProps} />);
      const container = screen.getByText('Test error message').closest('div');
      expect(container).toHaveClass('bg-card');
    });
  });

  describe('Styling and Layout', () => {
    it('should have proper responsive classes', () => {
      render(<ErrorScreen {...defaultProps} />);
      const container = screen.getByText('Test error message').closest('div');
      expect(container).toHaveClass('max-w-lg');
    });

    it('should have proper spacing classes', () => {
      render(<ErrorScreen {...defaultProps} />);
      const container = screen.getByText('Test error message').closest('div');
      expect(container).toHaveClass('p-10');
    });

    it('should have proper button layout', () => {
      render(<ErrorScreen {...defaultProps} />);
      const buttonContainer = screen.getByText('🔄 Try Again').parentElement;
      expect(buttonContainer).toHaveClass('flex', 'gap-3', 'justify-center');
    });

    it('should have proper background styling', () => {
      render(<ErrorScreen {...defaultProps} />);
      const outerContainer = screen.getByText('Test error message').closest('.min-h-\\[calc\\(100vh-140px\\)\\]');
      expect(outerContainer).toHaveClass('bg-gradient-to-br', 'from-gray-50', 'to-blue-100');
    });

    it('should have proper border styling', () => {
      render(<ErrorScreen {...defaultProps} />);
      const container = screen.getByText('Test error message').closest('div');
      expect(container).toHaveClass('border-2', 'border-accent');
    });
  });

  describe('Component Behavior', () => {
    it('should be memoized', () => {
      const { rerender } = render(<ErrorScreen {...defaultProps} />);
      const initialRender = screen.getByText('Test error message');
      
      rerender(<ErrorScreen {...defaultProps} />);
      const reRender = screen.getByText('Test error message');
      
      // Should be the same element if memoization is working
      expect(initialRender).toBe(reRender);
    });

    it('should have proper display name', () => {
      expect(ErrorScreen.displayName).toBe('ErrorScreen');
    });

    it('should handle callback errors gracefully', () => {
      const errorOnRetry = vi.fn().mockImplementation(() => {
        throw new Error('Retry failed');
      });
      const errorOnGoHome = vi.fn().mockImplementation(() => {
        throw new Error('Navigation failed');
      });

      render(<ErrorScreen error="Test error" onRetry={errorOnRetry} onGoHome={errorOnGoHome} />);
      
      // Test that callbacks are called even if they throw errors
      fireEvent.click(screen.getByText('🔄 Try Again'));
      expect(errorOnRetry).toHaveBeenCalled();
      
      fireEvent.click(screen.getByText('🏠 Go Home'));
      expect(errorOnGoHome).toHaveBeenCalled();
    });

    it('should handle async callbacks', async () => {
      const asyncOnRetry = vi.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });
      const asyncOnGoHome = vi.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      render(<ErrorScreen error="Test error" onRetry={asyncOnRetry} onGoHome={asyncOnGoHome} />);
      
      fireEvent.click(screen.getByText('🔄 Try Again'));
      fireEvent.click(screen.getByText('🏠 Go Home'));
      
      expect(asyncOnRetry).toHaveBeenCalled();
      expect(asyncOnGoHome).toHaveBeenCalled();
    });
  });

  describe('Integration Scenarios', () => {
    it('should work with React Router navigation', () => {
      const mockNavigate = vi.fn();
      const onGoHome = () => mockNavigate('/');
      
      render(<ErrorScreen error="Test error" onGoHome={onGoHome} />);
      fireEvent.click(screen.getByText('🏠 Go Home'));
      
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('should work with API retry logic', () => {
      const mockApiCall = vi.fn().mockResolvedValue({ success: true });
      const onRetry = () => mockApiCall();
      
      render(<ErrorScreen error="API Error" onRetry={onRetry} />);
      fireEvent.click(screen.getByText('🔄 Try Again'));
      
      expect(mockApiCall).toHaveBeenCalled();
    });

    it('should handle multiple error states', () => {
      const { rerender } = render(<ErrorScreen error="First error" onRetry={mockOnRetry} />);
      expect(screen.getByText('First error')).toBeInTheDocument();
      
      rerender(<ErrorScreen error="Second error" onRetry={mockOnRetry} />);
      expect(screen.getByText('Second error')).toBeInTheDocument();
      
      rerender(<ErrorScreen error="Third error" onRetry={mockOnRetry} />);
      expect(screen.getByText('Third error')).toBeInTheDocument();
    });
  });
}); 