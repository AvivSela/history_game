// Game Logic Utilities for Timeline Game

/**
 * Check if a card is placed correctly in the timeline
 * @param {Object} card - The card being placed
 * @param {Array} timeline - Current timeline of cards
 * @param {number} position - Position where card is being placed (0-based index)
 * @returns {Object} - { isCorrect: boolean, correctPosition: number, feedback: string }
 */
export const validateCardPlacement = (card, timeline, position) => {
  // Sort timeline chronologically to find correct position
  const sortedTimeline = [...timeline].sort((a, b) => 
    new Date(a.dateOccurred) - new Date(b.dateOccurred)
  );
  
  // Create new timeline with the card inserted at the given position
  const newTimeline = [...sortedTimeline];
  newTimeline.splice(position, 0, card);
  
  // Check if the new timeline is still chronologically correct
  const isChronological = isTimelineChronological(newTimeline);
  
  // Find the actual correct position
  const correctPosition = findCorrectPosition(card, sortedTimeline);
  
  const feedback = generatePlacementFeedback(card, timeline, position, correctPosition, isChronological);
  
  return {
    isCorrect: isChronological,
    correctPosition,
    feedback,
    dateOccurred: card.dateOccurred
  };
};

/**
 * Check if timeline is in chronological order
 * @param {Array} timeline - Array of cards with dateOccurred
 * @returns {boolean}
 */
export const isTimelineChronological = (timeline) => {
  for (let i = 1; i < timeline.length; i++) {
    const prevDate = new Date(timeline[i - 1].dateOccurred);
    const currDate = new Date(timeline[i].dateOccurred);
    if (prevDate > currDate) {
      return false;
    }
  }
  return true;
};

/**
 * Find the correct position for a card in the timeline
 * @param {Object} card - Card to place
 * @param {Array} timeline - Current sorted timeline
 * @returns {number} - Correct 0-based index position
 */
export const findCorrectPosition = (card, timeline) => {
  const cardDate = new Date(card.dateOccurred);
  
  for (let i = 0; i < timeline.length; i++) {
    const timelineDate = new Date(timeline[i].dateOccurred);
    if (cardDate <= timelineDate) {
      return i;
    }
  }
  
  // Card should go at the end
  return timeline.length;
};

/**
 * Generate feedback message for card placement
 * @param {Object} card - Card being placed
 * @param {Array} timeline - Current timeline
 * @param {number} placedPosition - Where user placed it
 * @param {number} correctPosition - Where it should go
 * @param {boolean} isCorrect - Whether placement was correct
 * @returns {string} - Feedback message
 */
export const generatePlacementFeedback = (card, timeline, placedPosition, correctPosition, isCorrect) => {
  const cardYear = new Date(card.dateOccurred).getFullYear();
  
  if (isCorrect) {
    const encouragements = [
      "Perfect! 🎯",
      "Excellent placement! ⭐",
      "Spot on! 🎉",
      "Great historical knowledge! 🧠",
      "Nailed it! 💪"
    ];
    const encouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
    return `${encouragement} ${card.title} (${cardYear}) is correctly placed!`;
  }
  
  // Provide helpful feedback for incorrect placement
  if (timeline.length === 0) {
    return `Close! ${card.title} occurred in ${cardYear}. Try a different position.`;
  }
  
  const direction = placedPosition < correctPosition ? "later" : "earlier";
  const hints = [
    `${card.title} (${cardYear}) happened ${direction} in history. Try again! 🤔`,
    `Not quite! ${card.title} occurred in ${cardYear}. Think about the historical context. 📚`,
    `Good try! ${card.title} needs to be placed ${direction} on the timeline. 🔄`
  ];
  
  return hints[Math.floor(Math.random() * hints.length)];
};

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
  
  if (cardYear < minYear) {
    hint += "It happened before all events currently on the timeline.";
  } else if (cardYear > maxYear) {
    hint += "It happened after all events currently on the timeline.";
  } else {
    hint += "It fits somewhere in the middle of your current timeline.";
  }
  
  return hint;
};

/**
 * Shuffle an array (Fisher-Yates algorithm)
 * @param {Array} array - Array to shuffle
 * @returns {Array} - Shuffled array
 */
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Format time duration
 * @param {number} seconds - Time in seconds
 * @returns {string} - Formatted time string
 */
export const formatTime = (seconds) => {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
};

/**
 * Create game session data
 * @param {Array} events - Available events
 * @param {Object} settings - Game settings
 * @returns {Object} - Game session object
 */
export const createGameSession = (events, settings = {}) => {
  const cardCount = settings.cardCount || 5;
  const shuffledEvents = shuffleArray(events);
  const gameEvents = shuffledEvents.slice(0, cardCount + 1);
  
  // First event goes on timeline, rest go to player hand
  const startingEvent = gameEvents[0];
  const playerCards = gameEvents.slice(1);
  
  return {
    sessionId: `game_${Date.now()}`,
    timeline: [{ ...startingEvent, isRevealed: true }],
    playerHand: playerCards,
    settings: settings,
    score: 0,
    startTime: Date.now(),
    attempts: {},
    hintsUsed: 0,
    status: 'playing'
  };
};