import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Home from './Home';

// Mock the react-router-dom Link component
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Link: ({ to, children, className, ...props }) => (
      <a href={to} className={className} {...props}>
        {children}
      </a>
    ),
  };
});

describe('Home Page Component', () => {
  const renderHome = () => {
    return render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
  };

  describe('Hero Section', () => {
    it('displays main title and description', () => {
      renderHome();

      expect(screen.getByText('Welcome to Timeline')).toBeInTheDocument();
      expect(screen.getByText(/Test your knowledge of history/)).toBeInTheDocument();
      expect(screen.getByText(/place it correctly on the timeline to win/)).toBeInTheDocument();
    });

    it('renders call-to-action buttons', () => {
      renderHome();

      const startPlayingButton = screen.getByText('🎮 Start Playing');
      const settingsButton = screen.getByText('⚙️ Settings');

      expect(startPlayingButton).toBeInTheDocument();
      expect(settingsButton).toBeInTheDocument();
      expect(startPlayingButton.closest('a')).toHaveAttribute('href', '/game');
      expect(settingsButton.closest('a')).toHaveAttribute('href', '/settings');
    });

    it('displays demo cards in hero section', () => {
      renderHome();

      expect(screen.getByText('Moon Landing')).toBeInTheDocument();
      expect(screen.getByText('1969')).toBeInTheDocument();
      expect(screen.getByText('World War II')).toBeInTheDocument();
      expect(screen.getByText('1939-1945')).toBeInTheDocument();
      expect(screen.getByText('Internet')).toBeInTheDocument();
      expect(screen.getByText('1989')).toBeInTheDocument();
    });
  });

  describe('How to Play Section', () => {
    it('displays section title', () => {
      renderHome();

      expect(screen.getByText('How to Play')).toBeInTheDocument();
    });

    it('renders all four game steps', () => {
      renderHome();

      // Step 1: Draw Cards
      expect(screen.getByText('1. Draw Cards')).toBeInTheDocument();
      expect(screen.getByText(/Start with a hand of historical event cards/)).toBeInTheDocument();

      // Step 2: Place in Order
      expect(screen.getByText('2. Place in Order')).toBeInTheDocument();
      expect(screen.getByText(/Click cards to place where you think they belong/)).toBeInTheDocument();

      // Step 3: Check Your Answer
      expect(screen.getByText('3. Check Your Answer')).toBeInTheDocument();
      expect(screen.getByText(/The date is revealed - if correct, the card stays/)).toBeInTheDocument();

      // Step 4: Win the Game
      expect(screen.getByText('4. Win the Game')).toBeInTheDocument();
      expect(screen.getByText(/Place all your cards correctly to complete the timeline/)).toBeInTheDocument();
    });

    it('displays feature icons', () => {
      renderHome();

      expect(screen.getByText('🎴')).toBeInTheDocument(); // Draw Cards
      expect(screen.getByText('📍')).toBeInTheDocument(); // Place in Order
      expect(screen.getByText('✅')).toBeInTheDocument(); // Check Your Answer
      expect(screen.getByText('🏆')).toBeInTheDocument(); // Win the Game
    });
  });

  describe('Game Features Section', () => {
    it('displays section title', () => {
      renderHome();

      expect(screen.getByText('Game Features')).toBeInTheDocument();
    });

    it('renders all feature statistics', () => {
      renderHome();

      // Historical Events
      expect(screen.getByText('15+')).toBeInTheDocument();
      expect(screen.getByText('Historical Events')).toBeInTheDocument();

      // Different Categories
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('Different Categories')).toBeInTheDocument();

      // Difficulty Levels
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('Difficulty Levels')).toBeInTheDocument();

      // Replayability
      expect(screen.getByText('∞')).toBeInTheDocument();
      expect(screen.getByText('Replayability')).toBeInTheDocument();
    });
  });

  describe('Navigation Links', () => {
    it('start playing link navigates to game page', () => {
      renderHome();

      const startPlayingLink = screen.getByText('🎮 Start Playing').closest('a');
      expect(startPlayingLink).toHaveAttribute('href', '/game');
    });

    it('settings link navigates to settings page', () => {
      renderHome();

      const settingsLink = screen.getByText('⚙️ Settings').closest('a');
      expect(settingsLink).toHaveAttribute('href', '/settings');
    });

    it('links have proper styling classes', () => {
      renderHome();

      const startPlayingLink = screen.getByText('🎮 Start Playing').closest('a');
      const settingsLink = screen.getByText('⚙️ Settings').closest('a');

      expect(startPlayingLink).toHaveClass('btn', 'btn-primary', 'btn-large');
      expect(settingsLink).toHaveClass('btn', 'btn-secondary', 'btn-large');
    });
  });

  describe('Visual Elements', () => {
    it('renders demo cards with proper styling', () => {
      const { container } = renderHome();

      const demoCards = container.querySelectorAll('.demo-card');
      expect(demoCards).toHaveLength(3);

      // Check that cards have proper classes
      demoCards.forEach(card => {
        expect(card).toHaveClass('demo-card');
      });
    });

    it('displays feature cards with proper structure', () => {
      const { container } = renderHome();

      const featureCards = container.querySelectorAll('.feature');
      expect(featureCards).toHaveLength(4);

      // Check that each feature has an icon, title, and description
      featureCards.forEach(card => {
        expect(card.querySelector('.feature-icon')).toBeInTheDocument();
        expect(card.querySelector('h3')).toBeInTheDocument();
        expect(card.querySelector('p')).toBeInTheDocument();
      });
    });

    it('displays stat cards with proper structure', () => {
      const { container } = renderHome();

      const statCards = container.querySelectorAll('.stat-card');
      expect(statCards).toHaveLength(4);

      // Check that each stat card has a number and label
      statCards.forEach(card => {
        expect(card.querySelector('.stat-number')).toBeInTheDocument();
        expect(card.querySelector('.stat-label')).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    it('has proper container structure', () => {
      const { container } = renderHome();

      expect(container.querySelector('.home-page')).toBeInTheDocument();
      expect(container.querySelector('.container')).toBeInTheDocument();
    });

    it('has proper section structure', () => {
      const { container } = renderHome();

      expect(container.querySelector('.hero-section')).toBeInTheDocument();
      expect(container.querySelector('.features-section')).toBeInTheDocument();
      expect(container.querySelector('.stats-section')).toBeInTheDocument();
    });

    it('has proper grid layouts', () => {
      const { container } = renderHome();

      expect(container.querySelector('.features-grid')).toBeInTheDocument();
      expect(container.querySelector('.stats-grid')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      renderHome();

      const h1 = screen.getByRole('heading', { level: 1 });
      const h2s = screen.getAllByRole('heading', { level: 2 });

      expect(h1).toHaveTextContent('Welcome to Timeline');
      expect(h2s).toHaveLength(2); // "How to Play" and "Game Features"
    });

    it('has proper link accessibility', () => {
      renderHome();

      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(2); // Start Playing and Settings

      links.forEach(link => {
        expect(link).toHaveAttribute('href');
      });
    });

    it('has proper button styling for navigation', () => {
      renderHome();

      const startPlayingButton = screen.getByText('🎮 Start Playing').closest('a');
      const settingsButton = screen.getByText('⚙️ Settings').closest('a');

      expect(startPlayingButton).toHaveClass('btn');
      expect(settingsButton).toHaveClass('btn');
    });
  });

  describe('Content Accuracy', () => {
    it('displays accurate game description', () => {
      renderHome();

      const description = screen.getByText(/Test your knowledge of history by placing events in chronological order/);
      expect(description).toBeInTheDocument();
    });

    it('shows correct game mechanics', () => {
      renderHome();

      expect(screen.getByText(/Each card shows a historical event/)).toBeInTheDocument();
      expect(screen.getByText(/place it correctly on the timeline to win/)).toBeInTheDocument();
    });

    it('displays accurate feature counts', () => {
      renderHome();

      expect(screen.getByText('15+')).toBeInTheDocument(); // Historical Events
      expect(screen.getByText('5')).toBeInTheDocument(); // Categories
      expect(screen.getByText('3')).toBeInTheDocument(); // Difficulty Levels
      expect(screen.getByText('∞')).toBeInTheDocument(); // Replayability
    });
  });
}); 