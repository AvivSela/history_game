// Game Logic Utilities for Timeline Game





/**
 * Calculate score based on placement accuracy and speed
 * @param {boolean} isCorrect - Whether placement was correct
 * @param {number} timeToPlace - Time taken to place card (seconds)
 * @param {number} attempts - Number of attempts for this card
 * @param {number} difficulty - Card difficulty (1-3)
 * @returns {number} - Points earned
 */
export const calculateScore = (isCorrect, timeToPlace = 0, attempts = 1, difficulty = 1) => {
  if (!isCorrect) return 0;
  
  let baseScore = 100 * difficulty; // Base score increases with difficulty
  
  // Time bonus (max 50 points for placing within 5 seconds)
  const timeBonus = Math.max(0, 50 - (timeToPlace * 10));
  
  // Attempt penalty (lose 25 points per additional attempt)
  const attemptPenalty = (attempts - 1) * 25;
  
  const finalScore = Math.max(10, baseScore + timeBonus - attemptPenalty);
  
  return Math.round(finalScore);
};

/**
 * Check win condition
 * @param {Array} playerHand - Remaining cards in player's hand
 * @returns {boolean}
 */
export const checkWinCondition = (playerHand) => {
  return playerHand.length === 0;
};

/**
 * Generate hint for card placement
 * @param {Object} card - Card to give hint for
 * @param {Array} timeline - Current timeline
 * @returns {string} - Hint message
 */
export const generateHint = (card, timeline) => {
  const cardYear = new Date(card.dateOccurred).getFullYear();
  const cardDecade = Math.floor(cardYear / 10) * 10;
  if (timeline.length === 0) {
    return `💡 This event happened in the ${cardDecade}s!`;
  }
  const timelineYears = timeline.map(event => new Date(event.dateOccurred).getFullYear());
  const minYear = Math.min(...timelineYears);
  const maxYear = Math.max(...timelineYears);
  let hint = `💡 This event occurred in ${cardYear}. `;
  if (cardYear <= minYear) {
    hint += "It happened before all events currently on the timeline.";
  } else if (cardYear >= maxYear) {
    hint += "It happened after all events currently on the timeline.";
  } else {
    hint += "It fits somewhere in the middle of your current timeline. (middle)";
  }
  return hint;
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
    status: 'playing'
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
  const feedback = generatePlacementFeedback(card, timeline, userPosition, correctPosition, isCorrect);
  return {
    isCorrect,
    correctPosition,
    userPosition,
    dateOccurred: card.dateOccurred,
    feedback
  };
};

/**
 * Check if timeline is in chronological order
 * @param {Array} timeline
 * @returns {boolean}
 */
export const isTimelineChronological = (timeline) => {
  for (let i = 1; i < timeline.length; i++) {
    if (new Date(timeline[i - 1].dateOccurred) > new Date(timeline[i].dateOccurred)) {
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
export const generatePlacementFeedback = (card, timeline, userPosition, correctPosition, isCorrect) => {
  const cardYear = new Date(card.dateOccurred).getFullYear();
  if (timeline.length === 0) {
    return `${card.title} (${cardYear}) placed on an empty timeline. Try a different position if needed.`;
  }
  if (isCorrect) {
    const messages = [
      `Perfect! ${card.title} is correctly placed in ${cardYear}.`,
      `Great job! ${card.title} is correctly placed in ${cardYear}.`,
      `Well done! ${card.title} is correctly placed in ${cardYear}.`
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
export const shuffleArray = (array) => {
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
export const formatTime = (seconds) => {
  const rounded = Math.round(seconds);
  if (rounded < 60) return `${rounded}s`;
  const m = Math.floor(rounded / 60);
  const s = rounded % 60;
  return `${m}m ${s}s`;
};