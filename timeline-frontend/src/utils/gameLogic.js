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
 * Check win condition
 * @param {Array} playerHand - Remaining cards in player's hand
 * @returns {boolean}
 */
export const checkWinCondition = playerHand => {
  return playerHand.length === 0;
};

/**
 * Create game session data
 * @param {Array} events - Available events
 * @param {Object} settings - Game settings
 * @returns {Object} - Game session object
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
 * Validate card placement in the timeline
 * @param {Object} card - Card to place
 * @param {Array} timeline - Current timeline
 * @param {number} userPosition - User's attempted position
 * @returns {Object} - Validation result
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
 * Check if timeline is in chronological order
 * @param {Array} timeline
 * @returns {boolean}
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
 * Find the correct position for a card in the timeline
 * @param {Object} card
 * @param {Array} timeline
 * @returns {number}
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
 * Generate feedback for placement
 * @param {Object} card
 * @param {Array} timeline
 * @param {number} userPosition
 * @param {number} correctPosition
 * @param {boolean} isCorrect
 * @returns {string}
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
 * Shuffle an array (Fisher-Yates)
 * @param {Array} array
 * @returns {Array}
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
 * Format time in seconds to mm:ss or ss
 * @param {number} seconds
 * @returns {string}
 */
export const formatTime = seconds => {
  const rounded = Math.round(seconds);
  if (rounded < 60) return `${rounded}s`;
  const m = Math.floor(rounded / 60);
  const s = rounded % 60;
  return `${m}m ${s}s`;
};
