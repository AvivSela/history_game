import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SettingsSection from './SettingsSection.jsx';
import { vi } from 'vitest';

/**
 * SettingsSection Component Tests
 * 
 * Tests for the SettingsSection component including rendering, accessibility,
 * keyboard navigation, and user interactions.
 */

describe('SettingsSection', () => {
  const defaultProps = {
    title: 'Test Section',
    children: <div data-testid="test-content">Test content</div>
  };

  describe('Rendering', () => {
    test('renders with title and children', () => {
      render(<SettingsSection {...defaultProps} />);
      
      expect(screen.getByText('Test Section')).toBeInTheDocument();
      expect(screen.getByTestId('test-content')).toBeInTheDocument();
    });

    test('renders with custom className', () => {
      render(<SettingsSection {...defaultProps} className="custom-class" />);
      
      const section = screen.getByRole('region');
      expect(section).toHaveClass('custom-class');
    });

    test('renders expanded by default', () => {
      render(<SettingsSection {...defaultProps} />);
      
      const content = screen.getByTestId('test-content').closest('.settings-section__content');
      expect(content).toHaveClass('settings-section__content--expanded');
    });

    test('renders collapsed when defaultExpanded is false', () => {
      render(<SettingsSection {...defaultProps} defaultExpanded={false} />);
      
      const content = screen.getByTestId('test-content').closest('.settings-section__content');
      expect(content).not.toHaveClass('settings-section__content--expanded');
    });

    test('generates unique IDs for accessibility', () => {
      render(<SettingsSection {...defaultProps} />);
      
      const header = screen.getByRole('button', { name: /test section/i });
      const content = screen.getByTestId('test-content').closest('.settings-section__content');
      
      expect(header).toHaveAttribute('id', 'settings-section-test-section');
      expect(header).toHaveAttribute('aria-controls', 'settings-section-test-section-content');
      expect(content).toHaveAttribute('id', 'settings-section-test-section-content');
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA attributes', () => {
      render(<SettingsSection {...defaultProps} />);
      
      const header = screen.getByRole('button', { name: /test section/i });
      const content = screen.getByTestId('test-content').closest('.settings-section__content');
      
      expect(header).toHaveAttribute('role', 'button');
      expect(header).toHaveAttribute('aria-expanded', 'true');
      expect(header).toHaveAttribute('aria-controls');
      expect(content).toHaveAttribute('aria-hidden', 'false');
    });

    test('has proper ARIA attributes when collapsed', () => {
      render(<SettingsSection {...defaultProps} defaultExpanded={false} />);
      
      const header = screen.getByRole('button', { name: /test section/i });
      const content = screen.getByTestId('test-content').closest('.settings-section__content');
      
      expect(header).toHaveAttribute('aria-expanded', 'false');
      expect(content).toHaveAttribute('aria-hidden', 'true');
    });

    test('has proper ARIA attributes when disabled', () => {
      render(<SettingsSection {...defaultProps} disabled={true} />);
      
      const header = screen.getByRole('button', { name: /test section/i });
      
      expect(header).toHaveAttribute('aria-disabled', 'true');
      expect(header).toHaveAttribute('tabIndex', '-1');
    });

    test('toggle button has proper aria-label', () => {
      render(<SettingsSection {...defaultProps} />);
      
      const toggleButton = screen.getByRole('button', { name: /collapse section/i });
      expect(toggleButton).toBeInTheDocument();
    });

    test('toggle button aria-label changes based on state', () => {
      render(<SettingsSection {...defaultProps} defaultExpanded={false} />);
      
      const toggleButton = screen.getByRole('button', { name: /expand section/i });
      expect(toggleButton).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    test('toggles expansion when header is clicked', () => {
      render(<SettingsSection {...defaultProps} />);
      
      const header = screen.getByRole('button', { name: /test section/i });
      const content = screen.getByTestId('test-content').closest('.settings-section__content');
      
      // Initially expanded
      expect(content).toHaveClass('settings-section__content--expanded');
      
      // Click to collapse
      fireEvent.click(header);
      expect(content).not.toHaveClass('settings-section__content--expanded');
      
      // Click to expand again
      fireEvent.click(header);
      expect(content).toHaveClass('settings-section__content--expanded');
    });

    test('toggles expansion when toggle button is clicked', () => {
      render(<SettingsSection {...defaultProps} />);
      
      const toggleButton = screen.getByRole('button', { name: /collapse section/i });
      const content = screen.getByTestId('test-content').closest('.settings-section__content');
      
      // Initially expanded
      expect(content).toHaveClass('settings-section__content--expanded');
      
      // Click to collapse
      fireEvent.click(toggleButton);
      expect(content).not.toHaveClass('settings-section__content--expanded');
      
      // Click to expand again
      fireEvent.click(toggleButton);
      expect(content).toHaveClass('settings-section__content--expanded');
    });

    test('does not toggle when disabled', () => {
      render(<SettingsSection {...defaultProps} disabled={true} />);
      
      const header = screen.getByRole('button', { name: /test section/i });
      const content = screen.getByTestId('test-content').closest('.settings-section__content');
      
      // Initially expanded
      expect(content).toHaveClass('settings-section__content--expanded');
      
      // Click should not change state
      fireEvent.click(header);
      expect(content).toHaveClass('settings-section__content--expanded');
    });

    test('prevents event bubbling from toggle button', () => {
      render(<SettingsSection {...defaultProps} />);
      
      const header = screen.getByRole('button', { name: /test section/i });
      const toggleButton = screen.getByRole('button', { name: /collapse section/i });
      const content = screen.getByTestId('test-content').closest('.settings-section__content');
      
      // Initially expanded
      expect(content).toHaveClass('settings-section__content--expanded');
      
      // Click toggle button should not trigger header click
      fireEvent.click(toggleButton);
      expect(content).not.toHaveClass('settings-section__content--expanded');
    });
  });

  describe('Keyboard Navigation', () => {
    test('toggles expansion with Enter key', () => {
      render(<SettingsSection {...defaultProps} />);
      
      const header = screen.getByRole('button', { name: /test section/i });
      const content = screen.getByTestId('test-content').closest('.settings-section__content');
      
      // Initially expanded
      expect(content).toHaveClass('settings-section__content--expanded');
      
      // Press Enter to collapse
      fireEvent.keyDown(header, { key: 'Enter' });
      expect(content).not.toHaveClass('settings-section__content--expanded');
      
      // Press Enter to expand again
      fireEvent.keyDown(header, { key: 'Enter' });
      expect(content).toHaveClass('settings-section__content--expanded');
    });

    test('toggles expansion with Space key', () => {
      render(<SettingsSection {...defaultProps} />);
      
      const header = screen.getByRole('button', { name: /test section/i });
      const content = screen.getByTestId('test-content').closest('.settings-section__content');
      
      // Initially expanded
      expect(content).toHaveClass('settings-section__content--expanded');
      
      // Press Space to collapse
      fireEvent.keyDown(header, { key: ' ' });
      expect(content).not.toHaveClass('settings-section__content--expanded');
      
      // Press Space to expand again
      fireEvent.keyDown(header, { key: ' ' });
      expect(content).toHaveClass('settings-section__content--expanded');
    });

    test('prevents default behavior for Enter and Space keys', () => {
      render(<SettingsSection {...defaultProps} />);
      
      const header = screen.getByRole('button', { name: /test section/i });
      
      // Use a real KeyboardEvent and check defaultPrevented
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
      header.dispatchEvent(enterEvent);
      expect(enterEvent.defaultPrevented).toBe(true);
      
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
      header.dispatchEvent(spaceEvent);
      expect(spaceEvent.defaultPrevented).toBe(true);
    });

    test('does not toggle with other keys', () => {
      render(<SettingsSection {...defaultProps} />);
      
      const header = screen.getByRole('button', { name: /test section/i });
      const content = screen.getByTestId('test-content').closest('.settings-section__content');
      
      // Initially expanded
      expect(content).toHaveClass('settings-section__content--expanded');
      
      // Press other keys should not change state
      fireEvent.keyDown(header, { key: 'Tab' });
      fireEvent.keyDown(header, { key: 'ArrowDown' });
      fireEvent.keyDown(header, { key: 'Escape' });
      
      expect(content).toHaveClass('settings-section__content--expanded');
    });

    test('does not respond to keyboard events when disabled', () => {
      render(<SettingsSection {...defaultProps} disabled={true} />);
      
      const header = screen.getByRole('button', { name: /test section/i });
      const content = screen.getByTestId('test-content').closest('.settings-section__content');
      
      // Initially expanded
      expect(content).toHaveClass('settings-section__content--expanded');
      
      // Press Enter should not change state
      fireEvent.keyDown(header, { key: 'Enter' });
      expect(content).toHaveClass('settings-section__content--expanded');
    });
  });

  describe('CSS Classes', () => {
    test('applies correct classes when disabled', () => {
      render(<SettingsSection {...defaultProps} disabled={true} />);
      
      const section = screen.getByRole('region');
      const header = screen.getByRole('button', { name: /test section/i });
      
      expect(section).toHaveClass('settings-section--disabled');
      expect(header).toHaveClass('settings-section__header--disabled');
    });

    test('applies correct classes for expanded state', () => {
      render(<SettingsSection {...defaultProps} />);
      
      const content = screen.getByTestId('test-content').closest('.settings-section__content');
      const toggleButton = screen.getByRole('button', { name: /collapse section/i });
      
      expect(content).toHaveClass('settings-section__content--expanded');
      expect(toggleButton).toHaveClass('settings-section__toggle--expanded');
    });

    test('applies correct classes for collapsed state', () => {
      render(<SettingsSection {...defaultProps} defaultExpanded={false} />);
      
      const content = screen.getByTestId('test-content').closest('.settings-section__content');
      const toggleButton = screen.getByRole('button', { name: /expand section/i });
      
      expect(content).not.toHaveClass('settings-section__content--expanded');
      expect(toggleButton).not.toHaveClass('settings-section__toggle--expanded');
    });
  });

  describe('Edge Cases', () => {
    test('handles special characters in title for ID generation', () => {
      render(<SettingsSection title="Test & Section (with) [special] chars!" />);
      
      const header = screen.getByRole('button', { name: /test & section/i });
      expect(header).toHaveAttribute('id', 'settings-section-test-&-section-(with)-[special]-chars!');
    });

    test('handles empty title', () => {
      render(<SettingsSection title="" children={<div data-testid="test-content">Test content</div>} />);
      
      const header = screen.getByRole('button', { name: '' });
      expect(header).toHaveAttribute('id', 'settings-section-');
    });

    test('handles very long title', () => {
      const longTitle = 'A'.repeat(100);
      render(<SettingsSection title={longTitle} children={<div data-testid="test-content">Test content</div>} />);
      
      const header = screen.getByRole('button', { name: new RegExp(longTitle.substring(0, 20)) });
      expect(header).toHaveAttribute('id');
      // The ID should be generated from the title, so it will be long
      expect(header.getAttribute('id')).toContain('settings-section-');
    });
  });
}); 