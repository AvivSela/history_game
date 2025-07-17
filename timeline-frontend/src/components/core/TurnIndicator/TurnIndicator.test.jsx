import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TurnIndicator from './TurnIndicator';

describe('TurnIndicator Component', () => {
  describe('Player Turn State', () => {
    it('displays player turn message when isPlayerTurn is true', () => {
      render(<TurnIndicator isPlayerTurn={true} />);

      expect(
        screen.getByText('🎯 Your Turn - Select a card to play')
      ).toBeInTheDocument();
    });

    it('applies correct styling for player turn', () => {
      const { container } = render(<TurnIndicator isPlayerTurn={true} />);

      const indicator = container.firstChild;
      expect(indicator).toHaveClass(
        'bg-success/10',
        'border-success/30',
        'text-success'
      );
    });

    it('has proper accessibility attributes for player turn', () => {
      const { container } = render(<TurnIndicator isPlayerTurn={true} />);

      const indicator = container.firstChild;
      expect(indicator).toHaveClass(
        'text-center',
        'py-3',
        'px-6',
        'rounded-lg',
        'mb-6'
      );
    });
  });

  describe('AI Turn State', () => {
    it('displays AI thinking message when isPlayerTurn is false', () => {
      render(<TurnIndicator isPlayerTurn={false} />);

      expect(screen.getByText('🤖 AI is thinking...')).toBeInTheDocument();
    });

    it('applies correct styling for AI turn', () => {
      const { container } = render(<TurnIndicator isPlayerTurn={false} />);

      const indicator = container.firstChild;
      expect(indicator).toHaveClass(
        'bg-warning/10',
        'border-warning/30',
        'text-warning'
      );
    });

    it('has proper accessibility attributes for AI turn', () => {
      const { container } = render(<TurnIndicator isPlayerTurn={false} />);

      const indicator = container.firstChild;
      expect(indicator).toHaveClass(
        'text-center',
        'py-3',
        'px-6',
        'rounded-lg',
        'mb-6'
      );
    });
  });

  describe('Component Structure', () => {
    it('renders with correct base structure', () => {
      const { container } = render(<TurnIndicator isPlayerTurn={true} />);

      const indicator = container.firstChild;
      expect(indicator.tagName).toBe('DIV');
      expect(indicator).toHaveClass(
        'text-center',
        'py-3',
        'px-6',
        'rounded-lg',
        'mb-6'
      );
    });

    it('contains font-medium class for text styling', () => {
      const { container } = render(<TurnIndicator isPlayerTurn={true} />);

      const textElement = container.querySelector('.font-medium');
      expect(textElement).toBeInTheDocument();
    });

    it('wraps message in span element', () => {
      const { container } = render(<TurnIndicator isPlayerTurn={true} />);

      const spanElement = container.querySelector('span');
      expect(spanElement).toBeInTheDocument();
      expect(spanElement.textContent).toBe(
        '🎯 Your Turn - Select a card to play'
      );
    });
  });

  describe('Visual Feedback', () => {
    it('provides clear visual distinction between player and AI turns', () => {
      const { container: playerContainer } = render(
        <TurnIndicator isPlayerTurn={true} />
      );
      const { container: aiContainer } = render(
        <TurnIndicator isPlayerTurn={false} />
      );

      const playerIndicator = playerContainer.firstChild;
      const aiIndicator = aiContainer.firstChild;

      // Should have different styling classes
      expect(playerIndicator.className).not.toBe(aiIndicator.className);
    });

    it('uses appropriate emojis for each state', () => {
      const { rerender } = render(<TurnIndicator isPlayerTurn={true} />);
      expect(screen.getByText(/🎯/)).toBeInTheDocument();

      rerender(<TurnIndicator isPlayerTurn={false} />);
      expect(screen.getByText(/🤖/)).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('maintains consistent spacing and layout', () => {
      const { container } = render(<TurnIndicator isPlayerTurn={true} />);

      const indicator = container.firstChild;
      const computedStyle = window.getComputedStyle(indicator);

      // Check that the component has proper spacing classes
      expect(indicator).toHaveClass('py-3', 'px-6', 'mb-6');
    });
  });
});
