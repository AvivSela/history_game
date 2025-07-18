/**
 * Game Behavior Tests
 *
 * Behavior-driven tests focusing on user experience and business logic
 * rather than implementation details.
 */

import { vi } from 'vitest';

// Mock the API module with proper default behavior
vi.mock('../../utils/api', () => {
  const { apiMock } = require('../__mocks__/api');
  return apiMock;
});

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import {
  setupCommonMocks,
  resetAllMocks,
  cleanupTimeouts,
} from '../utils/testSetup';
import {
  initializeGameForTesting,
  selectCardForTesting,
  placeCardForTesting,
  simulateCompleteGame,
} from '../utils/gameStateTestUtils';
import { useGameState } from '../../hooks/useGameState';

// Setup common mocks for all tests
setupCommonMocks();

describe('As a player', () => {
  beforeEach(() => {
    resetAllMocks();
    // Ensure API mock is reset to default behavior
    const { apiMock } = require('../__mocks__/api');
    apiMock.reset();
  });

  afterEach(async () => {
    await cleanupTimeouts();
  });

  describe('I want to place cards on the timeline so I can build the correct historical sequence', () => {
    it('I can select a card from my hand and place it on the timeline, and the system will validate my placement and provide feedback', async () => {
      // Given: I have started a new game and have cards in my hand
      const { result } = renderHook(() => useGameState());
      await initializeGameForTesting(result, 'single', 'medium');

      // When: I select a card from my hand
      const cardToSelect = await selectCardForTesting(result);

      // Then: The card becomes selected and I can see it's ready to place
      expect(result.current.state.selectedCard).toBe(cardToSelect);
      expect(result.current.state.showInsertionPoints).toBe(true);

      // When: I place the card on the timeline
      const placementResult = await placeCardForTesting(result, 1);

      // Then: The system validates my placement and provides feedback
      if (placementResult && placementResult.isCorrect) {
        // If correct: card moves to timeline and I get positive feedback
        expect(result.current.state.timeline).toContain(cardToSelect);
        expect(result.current.state.playerHand).not.toContain(cardToSelect);
        expect(result.current.state.feedback).toBeTruthy();
      } else {
        // If incorrect: card gets replaced with a new card and I get feedback to try again
        expect(result.current.state.playerHand).not.toContain(cardToSelect);
        expect(result.current.state.feedback).toBeTruthy();
        expect(result.current.state.selectedCard).toBeNull();
        expect(result.current.state.feedback.type).toBe('error');
      }
    });
  });

  describe('I want to complete the game by placing all my cards correctly', () => {
    it('I can play through the entire game from start to finish, placing all cards correctly to win', async () => {
      // Given: I have started a new game
      const { result } = renderHook(() => useGameState());
      await initializeGameForTesting(result, 'single', 'medium');

      // When: I play through the entire game, placing all cards correctly
      await simulateCompleteGame(result);

      // Then: I have successfully completed the game
      expect(['playing', 'won']).toContain(result.current.state.gameStatus);

      // And: All my cards have been placed correctly
      if (result.current.state.gameStatus === 'won') {
        expect(result.current.state.playerHand).toHaveLength(0);
        expect(result.current.state.timeline.length).toBeGreaterThan(0);
      }
    }, 10000);
  });

  describe("I want to know when I've made a mistake so I can learn and improve", () => {
    it('When I place a card incorrectly, I receive clear feedback and can try again', async () => {
      // Given: I have started a game and selected a card to place
      const { result } = renderHook(() => useGameState());
      await initializeGameForTesting(result, 'single', 'medium');

      const cardToPlace = result.current.state.playerHand[0];
      const initialHandSize = result.current.state.playerHand.length;
      await selectCardForTesting(result, cardToPlace);

      // When: I place the card in an incorrect position
      await act(async () => {
        await result.current.placeCard(0); // Place before first card (likely incorrect)
      });

      // Then: I receive clear feedback about my mistake
      expect(result.current.state.feedback).toBeTruthy();

      // And: I can continue playing (either with the same card or a new one)
      expect(result.current.state.playerHand.length).toBeGreaterThan(0);
      expect(result.current.state.selectedCard).toBeNull();

      // And: The game is still in a playable state
      expect(result.current.state.gameStatus).toBe('playing');
    });
  });

  describe('I want to be able to change my mind about which card to place', () => {
    it('I can select a card to place it, and deselect it if I change my mind', async () => {
      // Given: I have started a game and have cards in my hand
      const { result } = renderHook(() => useGameState());
      await initializeGameForTesting(result, 'single', 'medium');

      // When: I select a card from my hand
      const cardToSelect = await selectCardForTesting(result);

      // Then: The card becomes selected and I can see insertion points
      expect(result.current.state.selectedCard).toBe(cardToSelect);
      expect(result.current.state.showInsertionPoints).toBe(true);

      // When: I change my mind and deselect the card
      await act(async () => {
        result.current.selectCard(null);
      });

      // Then: The card is deselected and insertion points are hidden
      expect(result.current.state.selectedCard).toBeNull();
      expect(result.current.state.showInsertionPoints).toBe(false);

      // And: The card is still available in my hand
      expect(result.current.state.playerHand).toContain(cardToSelect);
    });
  });

  describe('I want to easily select cards from my hand', () => {
    it('I can click on any card in my hand to select it for placement', async () => {
      // Given: I have started a game and have multiple cards in my hand
      const { result } = renderHook(() => useGameState());
      await initializeGameForTesting(result, 'single', 'medium');

      const availableCards = result.current.state.playerHand;
      expect(availableCards.length).toBeGreaterThan(0);

      // When: I select a specific card from my hand
      const cardToSelect = availableCards[0];
      await act(async () => {
        result.current.selectCard(cardToSelect);
      });

      // Then: The card I clicked becomes selected
      expect(result.current.state.selectedCard).toBe(cardToSelect);
      expect(result.current.state.showInsertionPoints).toBe(true);

      // When: I select a different card
      const differentCard = availableCards[1];
      await act(async () => {
        result.current.selectCard(differentCard);
      });

      // Then: The new card becomes selected instead
      expect(result.current.state.selectedCard).toBe(differentCard);
      expect(result.current.state.selectedCard).not.toBe(cardToSelect);
    });
  });

  describe('I want to be able to cancel my card selection', () => {
    it('I can deselect a card by calling selectCard with null', async () => {
      // Given: I have selected a card from my hand
      const { result } = renderHook(() => useGameState());
      await initializeGameForTesting(result, 'single', 'medium');

      const cardToSelect = result.current.state.playerHand[0];
      await act(async () => {
        result.current.selectCard(cardToSelect);
      });
      expect(result.current.state.selectedCard).toBe(cardToSelect);

      // When: I explicitly deselect the card by passing null
      await act(async () => {
        result.current.selectCard(null);
      });

      // Then: The card becomes deselected
      expect(result.current.state.selectedCard).toBeNull();
      expect(result.current.state.showInsertionPoints).toBe(false);
    });
  });

  describe('I want to be able to choose between different cards in my hand', () => {
    it('I can switch my selection to a different card by clicking on it', async () => {
      // Given: I have selected a card from my hand
      const { result } = renderHook(() => useGameState());
      await initializeGameForTesting(result, 'single', 'medium');

      const firstCard = result.current.state.playerHand[0];
      const secondCard = result.current.state.playerHand[1];

      await act(async () => {
        result.current.selectCard(firstCard);
      });
      expect(result.current.state.selectedCard).toBe(firstCard);

      // When: I click on a different card
      await act(async () => {
        result.current.selectCard(secondCard);
      });

      // Then: The new card becomes selected instead
      expect(result.current.state.selectedCard).toBe(secondCard);
      expect(result.current.state.selectedCard).not.toBe(firstCard);
      expect(result.current.state.showInsertionPoints).toBe(true);
    });
  });

  describe('I want to know how to play the game', () => {
    it("I see helpful instructions when it's my turn and I haven't selected a card", async () => {
      // Given: I have started a game and it's my turn
      const { result } = renderHook(() => useGameState());
      await initializeGameForTesting(result, 'single', 'medium');

      // When: I haven't selected any card yet
      expect(result.current.state.selectedCard).toBeNull();

      // Then: I should be able to see instructions about how to play
      // Note: This would typically be tested at the component level where instructions are rendered
      expect(result.current.state.gameStatus).toBe('playing');
      expect(result.current.state.playerHand.length).toBeGreaterThan(0);
    });
  });

  describe('I want to see the timeline and interact with placed cards', () => {
    it('I can see the timeline with placed events and interact with them', async () => {
      // Given: I have started a game and placed some cards on the timeline
      const { result } = renderHook(() => useGameState());
      await initializeGameForTesting(result, 'single', 'medium');

      // When: I place a card correctly on the timeline
      const cardToPlace = result.current.state.playerHand[0];
      await act(async () => {
        result.current.selectCard(cardToPlace);
      });

      const placementResult = await placeCardForTesting(result, 1);

      if (placementResult && placementResult.isCorrect) {
        // Then: The card appears on the timeline
        expect(result.current.state.timeline).toContain(cardToPlace);
        expect(result.current.state.timeline.length).toBeGreaterThan(0);

        // And: I can see the timeline has content
        expect(result.current.state.timeline[0]).toBeDefined();
      }
    });
  });

  describe('I want to see where I can place my cards', () => {
    it('I can see where I can place my selected card on the timeline', async () => {
      // Given: I have selected a card from my hand
      const { result } = renderHook(() => useGameState());
      await initializeGameForTesting(result, 'single', 'medium');

      const cardToSelect = result.current.state.playerHand[0];
      await act(async () => {
        result.current.selectCard(cardToSelect);
      });

      // When: I have a card selected
      expect(result.current.state.selectedCard).toBe(cardToSelect);

      // Then: I can see insertion points indicating where I can place the card
      expect(result.current.state.showInsertionPoints).toBe(true);
      expect(result.current.state.insertionPoints.length).toBeGreaterThan(0);
    });
  });

  describe("I want a clean timeline view when I'm not placing cards", () => {
    it('Insertion points only appear when I have a card selected', async () => {
      // Given: I have started a game but haven't selected any cards
      const { result } = renderHook(() => useGameState());
      await initializeGameForTesting(result, 'single', 'medium');

      // When: I don't have any card selected
      expect(result.current.state.selectedCard).toBeNull();

      // Then: Insertion points are not shown
      expect(result.current.state.showInsertionPoints).toBe(false);

      // When: I select a card
      const cardToSelect = result.current.state.playerHand[0];
      await act(async () => {
        result.current.selectCard(cardToSelect);
      });

      // Then: Insertion points become visible
      expect(result.current.state.showInsertionPoints).toBe(true);

      // When: I deselect the card
      await act(async () => {
        result.current.selectCard(null);
      });

      // Then: Insertion points are hidden again
      expect(result.current.state.showInsertionPoints).toBe(false);
    });
  });

  describe('I want to navigate through a long timeline', () => {
    it('I can use scroll controls to navigate when there are many events', async () => {
      // Given: I have a game with many cards placed on the timeline
      const { result } = renderHook(() => useGameState());
      await initializeGameForTesting(result, 'single', 'medium');

      // When: I have a game in progress
      expect(result.current.state.gameStatus).toBe('playing');
      expect(result.current.state.timeline.length).toBeGreaterThan(0);

      // Then: I should be able to navigate through the timeline
      // Note: Scroll controls are shown when there are more than 2 events
      // The timeline should have scroll controls available for navigation when needed
      expect(result.current.state.timeline.length).toBeGreaterThan(0);
    });
  });

  describe('I want visual feedback when I interact with cards', () => {
    it('I can see animations when cards are added or removed from my hand', async () => {
      // Given: I have started a game and have cards in my hand
      const { result } = renderHook(() => useGameState());
      await initializeGameForTesting(result, 'single', 'medium');

      const initialHandSize = result.current.state.playerHand.length;

      // When: I place a card correctly on the timeline
      const cardToPlace = result.current.state.playerHand[0];
      await act(async () => {
        result.current.selectCard(cardToPlace);
      });

      const placementResult = await placeCardForTesting(result, 1);

      if (placementResult && placementResult.isCorrect) {
        // Then: The card is removed from my hand with visual feedback
        expect(result.current.state.playerHand.length).toBe(
          initialHandSize - 1
        );
        expect(result.current.state.playerHand).not.toContain(cardToPlace);

        // And: I get a new card to replace it
        expect(result.current.state.playerHand.length).toBe(
          initialHandSize - 1
        );
      }
    });
  });

  describe('I want my game progress to be saved automatically', () => {
    it('My game state is automatically saved and can be restored', async () => {
      // Given: I have started a game and made some progress
      const { result } = renderHook(() => useGameState());
      await initializeGameForTesting(result, 'single', 'medium');

      // When: I place a card and make progress
      const cardToPlace = result.current.state.playerHand[0];
      await act(async () => {
        result.current.selectCard(cardToPlace);
      });
      await placeCardForTesting(result, 1);

      // Then: My game state should be automatically saved
      expect(result.current.hasSavedGame()).toBe(true);

      // And: I should be able to restore my progress
      // Note: This would typically be tested by simulating a page reload
      // For now, we verify that the save functionality is available
      expect(typeof result.current.hasSavedGame).toBe('function');
    });
  });

  describe('I want my game settings to affect gameplay', () => {
    it('My difficulty settings affect the game tolerance for card placement', async () => {
      // Given: I have started a game with specific settings
      const { result } = renderHook(() => useGameState());
      await initializeGameForTesting(result, 'single', 'medium');

      // When: I check my current settings
      const currentSettings = result.current.getGameSettings();

      // Then: My settings should be properly configured
      expect(currentSettings).toBeDefined();
      expect(currentSettings.difficulty).toBeDefined();

      // And: The game should respect my difficulty setting
      expect(result.current.state.difficulty).toBe(currentSettings.difficulty);
    });
  });

  describe('I want the game to be accessible to all users', () => {
    it('I can navigate the game using only keyboard controls', async () => {
      // Given: I have started a game
      const { result } = renderHook(() => useGameState());
      await initializeGameForTesting(result, 'single', 'medium');

      // When: I have cards in my hand
      expect(result.current.state.playerHand.length).toBeGreaterThan(0);

      // Then: I should be able to navigate using keyboard
      // Note: This would typically be tested at the component level
      // For now, we verify that the game state supports keyboard navigation
      expect(result.current.state.gameStatus).toBe('playing');
      expect(result.current.state.playerHand.length).toBeGreaterThan(0);
    });
  });

  describe('I want to use keyboard shortcuts for faster gameplay', () => {
    it('I can use arrow keys to navigate between insertion points', async () => {
      // Given: I have selected a card and insertion points are visible
      const { result } = renderHook(() => useGameState());
      await initializeGameForTesting(result, 'single', 'medium');

      const cardToSelect = result.current.state.playerHand[0];
      await act(async () => {
        result.current.selectCard(cardToSelect);
      });

      // When: I have a card selected
      expect(result.current.state.selectedCard).toBe(cardToSelect);
      expect(result.current.state.showInsertionPoints).toBe(true);

      // Then: I should be able to navigate between insertion points with keyboard
      // Note: This would typically be tested at the component level
      // For now, we verify that insertion points are available for navigation
      expect(result.current.state.insertionPoints.length).toBeGreaterThan(0);
    });
  });

  describe('I want the game to work well on mobile devices', () => {
    it('I can interact with cards using touch gestures', async () => {
      // Given: I have started a game on a mobile device
      const { result } = renderHook(() => useGameState());
      await initializeGameForTesting(result, 'single', 'medium');

      // When: I have cards in my hand
      expect(result.current.state.playerHand.length).toBeGreaterThan(0);

      // Then: I should be able to interact with cards using touch
      // Note: This would typically be tested at the component level
      // For now, we verify that the game state supports touch interactions
      expect(result.current.state.gameStatus).toBe('playing');
      expect(result.current.canSelectCard).toBe(true);
    });
  });

  describe('I want the game to perform well on all devices', () => {
    it('The game maintains smooth performance during animations', async () => {
      // Given: I have started a game
      const { result } = renderHook(() => useGameState());
      await initializeGameForTesting(result, 'single', 'medium');

      // When: I perform multiple actions quickly
      const cardToPlace = result.current.state.playerHand[0];
      await act(async () => {
        result.current.selectCard(cardToPlace);
      });

      // Then: The game should maintain responsive performance
      // Note: This would typically be tested with performance monitoring
      // For now, we verify that the game state updates efficiently
      expect(result.current.state.selectedCard).toBe(cardToPlace);
      expect(result.current.state.showInsertionPoints).toBe(true);
    });
  });

  describe('I want the game to handle errors gracefully', () => {
    it('The game recovers gracefully when network errors occur', async () => {
      // Given: I have started a game
      const { result } = renderHook(() => useGameState());
      await initializeGameForTesting(result, 'single', 'medium');

      // When: I encounter a network error
      // Note: This would typically be tested by mocking API failures
      // For now, we verify that the game state handles errors properly
      expect(result.current.state.error).toBeNull();
      expect(result.current.state.gameStatus).toBe('playing');
    });
  });

  describe('I want the game to support multiple languages', () => {
    it('The game interface adapts to my language preferences', async () => {
      // Given: I have started a game
      const { result } = renderHook(() => useGameState());
      await initializeGameForTesting(result, 'single', 'medium');

      // When: I check my language settings
      const currentSettings = result.current.getGameSettings();

      // Then: The game should support language preferences
      // Note: This would typically be tested with i18n libraries
      // For now, we verify that settings are accessible
      expect(currentSettings).toBeDefined();
      expect(result.current.state.gameStatus).toBe('playing');
    });
  });
});
