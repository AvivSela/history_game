/**
 * App Component Tests
 * @description Tests for the main App component and routing
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the lazy-loaded components
vi.mock('./pages/Home', () => ({
  default: function MockHome() {
    return <div data-testid="home-page">Home Page</div>;
  }
}));

vi.mock('./pages/Game', () => ({
  default: function MockGame() {
    return <div data-testid="game-page">Game Page</div>;
  }
}));

vi.mock('./pages/Settings', () => ({
  default: function MockSettings() {
    return <div data-testid="settings-page">Settings Page</div>;
  }
}));

describe('App Component', () => {
  it('should render navigation with correct links', () => {
    render(<App />);

    expect(screen.getByText('⏰ Timeline')).toBeInTheDocument();
    expect(screen.getByText('Historical Card Game')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Play')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('should render footer with correct content', () => {
    render(<App />);

    expect(screen.getByText(/© 2025 Timeline Game/)).toBeInTheDocument();
    expect(screen.getByText(/Built with React & Node.js/)).toBeInTheDocument();
  });

  it('should render home page by default', () => {
    render(<App />);

    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  it('should render home page by default', () => {
    render(<App />);

    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  it('should have navigation links for all pages', () => {
    render(<App />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Play')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('should highlight home as active by default', () => {
    render(<App />);

    const homeLink = screen.getByText('Home').closest('a');
    expect(homeLink).toHaveClass('nav-link', 'active');
  });

  it('should have correct navigation link structure', () => {
    render(<App />);

    const homeLink = screen.getByText('Home').closest('a');
    const playLink = screen.getByText('Play').closest('a');
    const settingsLink = screen.getByText('Settings').closest('a');

    expect(homeLink).toHaveAttribute('href', '/');
    expect(playLink).toHaveAttribute('href', '/game');
    expect(settingsLink).toHaveAttribute('href', '/settings');
  });

  it('should have proper semantic structure', () => {
    render(<App />);

    expect(screen.getByRole('banner')).toBeInTheDocument(); // header
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // footer
  });
}); 