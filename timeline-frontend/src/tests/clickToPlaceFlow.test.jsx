import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import Game from '../pages/Game';
import { setupCommonMocks, resetAllMocks, cleanupTimeouts } from './utils/testSetup';

// Setup common mocks for all tests
setupCommonMocks();

describe('Click-to-Place Flow', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  afterEach(async () => {
    await cleanupTimeouts();
  });

  describe('Complete Flow', () => {
    it('shows loading state initially', async () => {
      render(<Game />);

      // Should show loading state
      expect(screen.getByText(/Loading Timeline Game/)).toBeInTheDocument();
      expect(screen.getByText(/Fetching historical events/)).toBeInTheDocument();
    });
  });
});
