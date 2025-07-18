import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SettingsSection from './SettingsSection.jsx';

/**
 * SettingsSection Component Tests
 *
 * Tests for the SettingsSection component including rendering and accessibility.
 */

describe('SettingsSection', () => {
  const defaultProps = {
    title: 'Test Section',
    children: <div data-testid="test-content">Test content</div>,
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

    test('renders content as always visible', () => {
      render(<SettingsSection {...defaultProps} />);

      const content = screen
        .getByTestId('test-content')
        .closest('.settings-section__content');
      expect(content).toHaveClass('settings-section__content--expanded');
    });

    test('renders with disabled state', () => {
      render(<SettingsSection {...defaultProps} disabled={true} />);

      const section = screen.getByRole('region');
      const header = screen.getByRole('heading', { name: 'Test Section' }).closest('header');
      
      expect(section).toHaveClass('settings-section--disabled');
      expect(header).toHaveClass('settings-section__header--disabled');
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA attributes', () => {
      render(<SettingsSection {...defaultProps} />);

      const section = screen.getByRole('region');
      const header = screen.getByRole('heading', { name: 'Test Section' }).closest('header');
      const content = screen.getByTestId('test-content').closest('.settings-section__content');

      expect(section).toHaveAttribute('aria-labelledby');
      expect(header).toHaveAttribute('id');
      expect(content).toHaveAttribute('id');
    });

    test('generates proper IDs from title', () => {
      render(<SettingsSection {...defaultProps} />);

      const header = screen.getByRole('heading', { name: 'Test Section' }).closest('header');
      expect(header).toHaveAttribute('id', 'settings-section-test-section');
    });
  });

  describe('CSS Classes', () => {
    test('applies correct classes when disabled', () => {
      render(<SettingsSection {...defaultProps} disabled={true} />);

      const section = screen.getByRole('region');
      const header = screen.getByRole('heading', { name: 'Test Section' }).closest('header');

      expect(section).toHaveClass('settings-section--disabled');
      expect(header).toHaveClass('settings-section__header--disabled');
    });

    test('applies correct classes for content', () => {
      render(<SettingsSection {...defaultProps} />);

      const content = screen
        .getByTestId('test-content')
        .closest('.settings-section__content');

      expect(content).toHaveClass('settings-section__content--expanded');
    });
  });

  describe('Edge Cases', () => {
    test('handles special characters in title for ID generation', () => {
      render(
        <SettingsSection title="Test & Section (with) [special] chars!" />
      );

      const header = screen.getByRole('heading', { name: /test & section/i }).closest('header');
      expect(header).toHaveAttribute(
        'id',
        'settings-section-test-&-section-(with)-[special]-chars!'
      );
    });

    test('handles empty title', () => {
      render(
        <SettingsSection title="">
          <div data-testid="test-content">Test content</div>
        </SettingsSection>
      );

      const header = screen.getByRole('heading', { name: '' }).closest('header');
      expect(header).toHaveAttribute('id', 'settings-section-');
    });

    test('handles very long title', () => {
      const longTitle = 'A'.repeat(100);
      render(
        <SettingsSection title={longTitle}>
          <div data-testid="test-content">Test content</div>
        </SettingsSection>
      );

      const header = screen.getByRole('heading', {
        name: new RegExp(longTitle.substring(0, 20)),
      }).closest('header');
      expect(header).toHaveAttribute('id');
      // The ID should be generated from the title, so it will be long
      expect(header.getAttribute('id')).toContain('settings-section-');
    });
  });
});
