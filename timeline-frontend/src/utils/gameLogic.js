/**
 * Game Logic Utilities for Timeline Game
 *
 * This module contains core game logic functions for the Timeline Game, including
 * score calculation, win condition checking, game session management, and card
 * placement validation. These utilities provide the mathematical and logical
 * foundation for the game mechanics.
 *
 * @module gameLogic
 * @example
 * ```js
 * import { calculateScore, checkWinCondition, createGameSession } from './gameLogic';
 *
 * // Calculate score for correct placement
 * const score = calculateScore(true, 3.5, 1, 2); // 225 points
 *
 * // Check if player has won
 * const hasWon = checkWinCondition(playerHand); // true if hand is empty
 *
 * // Create new game session
 * const session = createGameSession(events, { cardCount: 8, difficulty: 'medium' });
 * ```
 */

/**
 * Calculate score based on placement accuracy and speed
 *
 * This function calculates the points earned for placing a card correctly on the timeline.
 * The score is based on the card's difficulty level, time taken to place it, and number
 * of attempts made. Higher difficulty cards earn more points, faster placement provides
 * time bonuses, and multiple attempts incur penalties.
 *
 * @param {boolean} isCorrect - Whether placement was correct
 * @param {number} [timeToPlace=0] - Time taken to place card in seconds
 * @param {number} [attempts=1] - Number of attempts for this card
 * @param {number} [difficulty=1] - Card difficulty level (1-5)
 * @returns {number} Points earned (minimum 10 points for correct placement)
 *
 * @example
 * ```js
 * // Perfect placement: 100 base + 50 time bonus - 0 penalty = 150 points
 * calculateScore(true, 2.5, 1, 1); // 150
 *
 * // Multiple attempts: 200 base + 30 time bonus - 25 penalty = 205 points
 * calculateScore(true, 4.0, 2, 2); // 205
 *
 * // Incorrect placement: 0 points
 * calculateScore(false, 3.0, 1, 1); // 0
 * ```
 */
import { GAME_LOGIC } from '../constants/gameConstants';

export const calculateScore = (
  isCorrect,
  timeToPlace = 0,
  attempts = 1,
  difficulty = 1
) => {
  if (!isCorrect) return 0;

  let baseScore = GAME_LOGIC.BASE_SCORE * difficulty; // Base score increases with difficulty

  // Time bonus (max 50 points for placing within 5 seconds)
  const timeBonus = Math.max(
    0,
    GAME_LOGIC.TIME_BONUS_MAX - timeToPlace * GAME_LOGIC.TIME_BONUS_RATE
  );

  // Attempt penalty (lose 25 points per additional attempt)
  const attemptPenalty = (attempts - 1) * GAME_LOGIC.ATTEMPT_PENALTY;

  const finalScore = Math.max(
    GAME_LOGIC.MIN_SCORE,
    baseScore + timeBonus - attemptPenalty
  );

  return Math.round(finalScore);
};

/**
 * Check if the player has won the game by playing all their cards
 * The win condition is met when the player's hand is empty, meaning all cards
 * have been successfully placed on the timeline
 *
 * @param {Array} playerHand - Array of remaining cards in player's hand
 * @returns {boolean} True if player has won (no cards remaining), false otherwise
 *
 * @example
 * ```js
 * const emptyHand = [];
 * const hasWon = checkWinCondition(emptyHand); // true
 *
 * const remainingCards = [{id: 1, title: 'Event'}];
 * const stillPlaying = checkWinCondition(remainingCards); // false
 * ```
 */
export const checkWinCondition = playerHand => {
  return playerHand.length === 0;
};

/**
 * Create a new game session with initialized game state
 * Sets up the initial timeline with one revealed event and distributes remaining
 * events to the player's hand. Creates tracking data for scoring and game progress.
 *
 * @param {Array} events - Array of available historical events to use in game
 * @param {Object} [settings={}] - Game configuration options
 * @param {number} [settings.cardCount=5] - Total number of cards to include in game
 * @param {string} [settings.difficulty] - Difficulty level setting
 * @param {string[]} [settings.categories] - Selected event categories
 * @returns {Object} Complete game session object with initial state
 * @returns {string} returns.sessionId - Unique identifier for the game session
 * @returns {Array} returns.timeline - Initial timeline with first event revealed
 * @returns {Array} returns.playerHand - Cards available for player to place
 * @returns {Object} returns.settings - Game configuration settings
 * @returns {number} returns.score - Starting score (0)
 * @returns {number} returns.startTime - Game start timestamp
 * @returns {Object} returns.attempts - Tracking object for card placement attempts
 * @returns {number} returns.hintsUsed - Count of hints used (starts at 0)
 * @returns {string} returns.status - Current game status ('playing')
 *
 * @example
 * ```js
 * const events = [{id: 1, title: 'Event 1', dateOccurred: '1969-07-20'}];
 * const settings = {cardCount: 8, difficulty: 'medium'};
 * const session = createGameSession(events, settings);
 * // Returns initialized game session ready for play
 * ```
 */
export const createGameSession = (events, settings = {}) => {
  const cardCount = settings.cardCount || 5;
  const shuffledEvents = [...events].sort(() => 0.5 - Math.random());
  let gameEvents = shuffledEvents.slice(0, cardCount + 1);
  // First event goes on timeline, rest go to player hand
  const startingEvent = gameEvents[0];
  const playerCards = gameEvents.slice(1);
  return {
    sessionId: `game_${Date.now()}`,
    timeline: startingEvent ? [{ ...startingEvent, isRevealed: true }] : [],
    playerHand: playerCards,
    settings: settings,
    score: 0,
    startTime: Date.now(),
    attempts: {},
    hintsUsed: 0,
    status: 'playing',
  };
};

/**
 * Validate whether a card placement on the timeline is correct
 * Compares the user's chosen position with the chronologically correct position
 * and generates appropriate feedback for the placement attempt.
 *
 * @param {Object} card - The card being placed on the timeline
 * @param {string} card.title - Title of the historical event
 * @param {string} card.dateOccurred - ISO date string of when event occurred
 * @param {number} card.id - Unique identifier for the card
 * @param {Array} timeline - Current timeline array with existing events
 * @param {number} userPosition - Index where user attempted to place the card
 * @returns {Object} Validation result with placement details
 * @returns {boolean} returns.isCorrect - Whether the placement was chronologically correct
 * @returns {number} returns.correctPosition - The chronologically correct position index
 * @returns {number} returns.userPosition - The position where user attempted to place
 * @returns {string} returns.dateOccurred - Date the event occurred (for reference)
 * @returns {string} returns.feedback - Human-readable feedback message about the placement
 *
 * @example
 * ```js
 * const card = {id: 1, title: 'Moon Landing', dateOccurred: '1969-07-20'};
 * const timeline = [{title: 'WWI End', dateOccurred: '1918-11-11'}];
 * const result = validateCardPlacement(card, timeline, 1);
 * // Returns: {isCorrect: true, correctPosition: 1, userPosition: 1, ...}
 * ```
 */
export const validateCardPlacement = (card, timeline, userPosition) => {
  const correctPosition = findCorrectPosition(card, timeline);
  const isCorrect = userPosition === correctPosition;
  const feedback = generatePlacementFeedback(
    card,
    timeline,
    userPosition,
    correctPosition,
    isCorrect
  );
  return {
    isCorrect,
    correctPosition,
    userPosition,
    dateOccurred: card.dateOccurred,
    feedback,
  };
};

/**
 * Verify that all events in the timeline are arranged in chronological order
 * Checks each adjacent pair of events to ensure dates are properly ordered
 * from earliest to latest. Used for validating timeline integrity.
 *
 * @param {Array} timeline - Array of timeline events to validate
 * @param {string} timeline[].dateOccurred - ISO date string for each event
 * @returns {boolean} True if timeline is in chronological order, false otherwise
 *
 * @example
 * ```js
 * const orderedTimeline = [
 *   {dateOccurred: '1914-07-28'}, // WWI starts
 *   {dateOccurred: '1969-07-20'}  // Moon landing
 * ];
 * const isValid = isTimelineChronological(orderedTimeline); // true
 *
 * const unorderedTimeline = [
 *   {dateOccurred: '1969-07-20'}, // Later event first
 *   {dateOccurred: '1914-07-28'}  // Earlier event second
 * ];
 * const isInvalid = isTimelineChronological(unorderedTimeline); // false
 * ```
 */
export const isTimelineChronological = timeline => {
  for (let i = 1; i < timeline.length; i++) {
    if (
      new Date(timeline[i - 1].dateOccurred) >
      new Date(timeline[i].dateOccurred)
    ) {
      return false;
    }
  }
  return true;
};

/**
 * Determine the chronologically correct position for a card in the timeline
 * Compares the card's date with existing timeline events to find where it
 * should be inserted to maintain chronological order.
 *
 * @param {Object} card - The card to find position for
 * @param {string} card.dateOccurred - ISO date string of the card's event
 * @param {Array} timeline - Current timeline with existing events
 * @param {string} timeline[].dateOccurred - ISO date strings of timeline events
 * @returns {number} Index where card should be placed to maintain chronological order
 *
 * @example
 * ```js
 * const card = {dateOccurred: '1945-08-15'}; // End of WWII
 * const timeline = [
 *   {dateOccurred: '1939-09-01'}, // WWII starts
 *   {dateOccurred: '1969-07-20'}  // Moon landing
 * ];
 * const position = findCorrectPosition(card, timeline); // Returns 1
 * // Card should be inserted at index 1 (between WWII start and moon landing)
 * ```
 */
export const findCorrectPosition = (card, timeline) => {
  const cardDate = new Date(card.dateOccurred);
  for (let i = 0; i < timeline.length; i++) {
    if (cardDate < new Date(timeline[i].dateOccurred)) {
      return i;
    }
  }
  return timeline.length;
};

/**
 * Generate user-friendly feedback message for a card placement attempt
 * Provides encouraging messages for correct placements and helpful hints for
 * incorrect placements to guide the player toward the right position.
 *
 * @param {Object} card - The card that was placed
 * @param {string} card.title - Title of the historical event
 * @param {string} card.dateOccurred - ISO date string of the event
 * @param {Array} timeline - Current timeline state
 * @param {number} userPosition - Position where user placed the card
 * @param {number} correctPosition - Chronologically correct position
 * @param {boolean} isCorrect - Whether the placement was correct
 * @returns {string} Human-readable feedback message for the player
 *
 * @example
 * ```js
 * const card = {title: 'Moon Landing', dateOccurred: '1969-07-20'};
 * const timeline = [{dateOccurred: '1914-07-28'}];
 * 
 * // Correct placement
 * const successMsg = generatePlacementFeedback(card, timeline, 1, 1, true);
 * // Returns: "Perfect! Moon Landing is correctly placed in 1969."
 *
 * // Incorrect placement (too early)
 * const errorMsg = generatePlacementFeedback(card, timeline, 0, 1, false);
 * // Returns: "Moon Landing (1969) should be placed later in the timeline."
 * ```
 */
export const generatePlacementFeedback = (
  card,
  timeline,
  userPosition,
  correctPosition,
  isCorrect
) => {
  const cardYear = new Date(card.dateOccurred).getFullYear();
  if (timeline.length === 0) {
    return `${card.title} (${cardYear}) placed on an empty timeline. Try a different position if needed.`;
  }
  if (isCorrect) {
    const messages = [
      `Perfect! ${card.title} is correctly placed in ${cardYear}.`,
      `Great job! ${card.title} is correctly placed in ${cardYear}.`,
      `Well done! ${card.title} is correctly placed in ${cardYear}.`,
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  } else {
    if (userPosition < correctPosition) {
      return `${card.title} (${cardYear}) should be placed later in the timeline.`;
    } else {
      return `${card.title} (${cardYear}) should be placed earlier in the timeline.`;
    }
  }
};

/**
 * Shuffle an array using the Fisher-Yates algorithm for unbiased randomization
 * Creates a new array with elements in random order without modifying the original.
 * Ensures each possible permutation has equal probability of occurring.
 *
 * @param {Array} array - Array to shuffle (any type of elements)
 * @returns {Array} New array with elements in randomized order
 *
 * @example
 * ```js
 * const originalArray = [1, 2, 3, 4, 5];
 * const shuffled = shuffleArray(originalArray);
 * // Returns: [3, 1, 5, 2, 4] (or any other random permutation)
 * // originalArray remains unchanged: [1, 2, 3, 4, 5]
 *
 * const events = [{id: 1}, {id: 2}, {id: 3}];
 * const randomizedEvents = shuffleArray(events);
 * // Returns events in random order for game variety
 * ```
 */
export const shuffleArray = array => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

/**
 * Format time duration in seconds to human-readable string
 * Converts numeric seconds to either "Xs" format for short durations
 * or "Xm Ys" format for longer durations over one minute.
 *
 * @param {number} seconds - Time duration in seconds (can include decimals)
 * @returns {string} Formatted time string in appropriate unit
 *
 * @example
 * ```js
 * formatTime(45.7); // Returns: "46s"
 * formatTime(125.2); // Returns: "2m 5s"
 * formatTime(3661); // Returns: "61m 1s"
 * formatTime(0); // Returns: "0s"
 *
 * // Common use case: displaying game timer or placement speed
 * const placementTime = 23.8;
 * const display = `Placed in ${formatTime(placementTime)}`; // "Placed in 24s"
 * ```
 */
export const formatTime = seconds => {
  const rounded = Math.round(seconds);
  if (rounded < 60) return `${rounded}s`;
  const m = Math.floor(rounded / 60);
  const s = rounded % 60;
  return `${m}m ${s}s`;
};
