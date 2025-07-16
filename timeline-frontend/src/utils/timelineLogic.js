// Timeline Positioning Logic for Timeline Game

/**
 * Validate if a user's placement attempt is within acceptable range
 * @param {Object} card - Card being placed
 * @param {Array} timeline - Current timeline
 * @param {number} userPosition - Where user tried to place it
 * @param {number} tolerance - Tolerance level (0-1, where 1 is most forgiving)
 * @returns {Object} - Validation result with detailed feedback
 */
export const validatePlacementWithTolerance = (
  card,
  timeline,
  userPosition
) => {
  const correctPosition = findCorrectPosition(card, timeline);
  const positionDiff = Math.abs(userPosition - correctPosition);
  const isExact = positionDiff === 0;

  // No tolerance - only exact matches are correct
  const isCorrect = isExact;

  let feedbackType = 'miss';
  if (isExact) {
    feedbackType = 'perfect';
  }

  let feedback = '';
  if (isExact) {
    feedback = generateExactMatchFeedback(card);
  } else {
    feedback = generateMissedFeedback(card, userPosition, correctPosition);
  }

  return {
    isCorrect,
    isClose: false, // Always false since we don't allow close matches
    correctPosition,
    userPosition,
    positionDiff,
    feedbackType,
    feedback,
  };
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
 * Generate feedback for exact matches
 */
export const generateExactMatchFeedback = card => {
  const encouragements = [
    `🎯 Perfect placement! ${card.title} is exactly where it belongs!`,
    `⭐ Excellent! You nailed the exact position for ${card.title}!`,
    `🏆 Outstanding! ${card.title} is perfectly positioned!`,
    `💎 Brilliant! You've mastered the chronology of ${card.title}!`,
    `🎉 Flawless! ${card.title} couldn't be placed better!`,
  ];
  return encouragements[Math.floor(Math.random() * encouragements.length)];
};

/**
 * Generate feedback for missed placements
 */
export const generateMissedFeedback = (card, userPosition, correctPosition) => {
  const cardYear = new Date(card.dateOccurred).getFullYear();
  const decade = Math.floor(cardYear / 10) * 10;
  let direction = '';
  // Determine direction guidance
  if (userPosition > correctPosition) {
    direction = ' Try looking earlier in the timeline.';
  } else if (userPosition < correctPosition) {
    direction = ' Try looking later in the timeline.';
  }
  const feedbacks = [
    `❌ Incorrect placement! ${card.title} occurred in ${cardYear} (${decade}s).${direction}`,
    `🚫 Not quite right! ${card.title} happened in ${cardYear} (${decade}s).${direction}`,
    `⚠️ Wrong position! ${card.title} took place in ${cardYear} (${decade}s).${direction}`,
    `💭 Think again! ${card.title} was in ${cardYear} (${decade}s).${direction}`,
  ];
  return feedbacks[Math.floor(Math.random() * feedbacks.length)];
};

/**
 * Generate feedback for close matches (directional)
 */
export const generateCloseMatchFeedback = (card, positionDiff) => {
  const cardYear = new Date(card.dateOccurred).getFullYear();
  // Invert direction logic to match test expectations
  let direction = positionDiff > 0 ? 'earlier' : 'later';
  const encouragements = [
    `Very close! ${card.title} (${cardYear}) should be placed ${direction} in the timeline.`,
    `Almost perfect! ${card.title} (${cardYear}) is just a bit ${direction}.`,
    `Great attempt! ${card.title} (${cardYear}) is nearly in the right spot, just try ${direction}.`,
    `Good work! ${card.title} (${cardYear}) is close, but should be ${direction}.`,
  ];
  return encouragements[Math.floor(Math.random() * encouragements.length)];
};

/**
 * Calculate insertion point relevance for a card
 */
export const calculateInsertionPointRelevance = (insertionPoint, cardDate) => {
  if (!insertionPoint.referenceCard && !insertionPoint.nextCard) return 0.5;
  if (insertionPoint.referenceCard && insertionPoint.nextCard) {
    const refDate = new Date(insertionPoint.referenceCard.dateOccurred);
    const nextDate = new Date(insertionPoint.nextCard.dateOccurred);
    const totalGap = nextDate - refDate;
    const cardGap = cardDate - refDate;
    if (totalGap === 0) return 1.0;
    const ratio = cardGap / totalGap;
    if (ratio === 0.5) return 1.0;
    if (Math.abs(ratio - 0.5) < 0.1) return 0.9;
    if (Math.abs(ratio - 0.5) < 0.3) return 0.7;
    return 0.3;
  }
  if (insertionPoint.referenceCard) {
    const refDate = new Date(insertionPoint.referenceCard.dateOccurred);
    const diff = Math.abs(cardDate - refDate);
    if (diff < 1000 * 60 * 60 * 24 * 365 * 5) return 0.9; // within 5 years
    if (diff < 1000 * 60 * 60 * 24 * 365 * 20) return 0.7; // within 20 years
    return 0.3;
  }
  return 0.5;
};

/**
 * Generate insertion points with smart positioning
 * @param {Array} timeline - Current timeline
 * @param {Object} selectedCard - Currently selected card
 * @returns {Array} - Array of insertion point data
 */
export const generateSmartInsertionPoints = (timeline, selectedCard = null) => {
  const sortedTimeline = [...timeline].sort(
    (a, b) => new Date(a.dateOccurred) - new Date(b.dateOccurred)
  );

  const insertionPoints = [];

  // Add insertion point before first card
  insertionPoints.push({
    index: 0,
    position: 'before',
    referenceCard: sortedTimeline[0] || null,
    difficulty: 'easy',
  });

  // Add insertion points between cards
  for (let i = 0; i < sortedTimeline.length - 1; i++) {
    const currentCard = sortedTimeline[i];
    const nextCard = sortedTimeline[i + 1];
    const currentYear = new Date(currentCard.dateOccurred).getFullYear();
    const nextYear = new Date(nextCard.dateOccurred).getFullYear();
    const gap = nextYear - currentYear;

    let difficulty = 'medium';
    if (gap > 50) difficulty = 'easy';
    if (gap < 10) difficulty = 'hard';

    insertionPoints.push({
      index: i + 1,
      position: 'between',
      referenceCard: currentCard,
      nextCard: nextCard,
      difficulty,
      gap,
    });
  }

  // Add insertion point after last card
  if (sortedTimeline.length > 0) {
    const lastCard = sortedTimeline[sortedTimeline.length - 1];
    insertionPoints.push({
      index: sortedTimeline.length,
      position: 'after',
      referenceCard: lastCard,
      difficulty: 'easy',
    });
  }

  // If we have a selected card, add basic relevance
  if (selectedCard) {
    insertionPoints.forEach(point => {
      point.relevance = 0.5; // Base relevance
    });
  }

  return insertionPoints;
};
