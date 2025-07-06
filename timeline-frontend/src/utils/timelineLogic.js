// Timeline Positioning Logic for Timeline Game

/**
 * Validate if a user's placement attempt is within acceptable range
 * @param {Object} card - Card being placed
 * @param {Array} timeline - Current timeline
 * @param {number} userPosition - Where user tried to place it
 * @param {number} tolerance - Tolerance level (0-1, where 1 is most forgiving)
 * @returns {Object} - Validation result with detailed feedback
 */
export const validatePlacementWithTolerance = (card, timeline, userPosition) => {
  const correctPosition = findCorrectPosition(card, timeline);
  const positionDiff = Math.abs(userPosition - correctPosition);
  const isExactMatch = positionDiff === 0;

  let feedback = '';
  let feedbackType = 'error';

  if (isExactMatch) {
    feedback = generateExactMatchFeedback(card);
    feedbackType = 'perfect';
  } else {
    feedback = generateMissedFeedback(card, userPosition, correctPosition, timeline);
    feedbackType = 'miss';
  }

  return {
    isCorrect: isExactMatch,
    isClose: false, // No tolerance - only exact matches are accepted
    correctPosition,
    userPosition,
    positionDiff,
    feedback,
    feedbackType
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
  const sortedTimeline = [...timeline].sort((a, b) => 
    new Date(a.dateOccurred) - new Date(b.dateOccurred)
  );
  
  for (let i = 0; i < sortedTimeline.length; i++) {
    const timelineDate = new Date(sortedTimeline[i].dateOccurred);
    if (cardDate <= timelineDate) {
      return i;
    }
  }
  
  // Card should go at the end
  return sortedTimeline.length;
};

/**
 * Generate feedback for exact matches
 */
export const generateExactMatchFeedback = (card) => {
  const encouragements = [
    `🎯 Perfect placement! ${card.title} is exactly where it belongs!`,
    `⭐ Excellent! You nailed the exact position for ${card.title}!`,
    `🏆 Outstanding! ${card.title} is perfectly positioned!`,
    `💎 Brilliant! You've mastered the chronology of ${card.title}!`,
    `🎉 Flawless! ${card.title} couldn't be placed better!`
  ];
  return encouragements[Math.floor(Math.random() * encouragements.length)];
};

/**
 * Generate feedback for close matches
 */
export const generateCloseMatchFeedback = (card, positionDiff) => {
  const cardYear = new Date(card.dateOccurred).getFullYear();
  const direction = positionDiff > 0 ? 'earlier' : 'later';
  
  const feedbacks = [
    `🎯 Very close! ${card.title} (${cardYear}) belongs ${direction} in the timeline.`,
    `⚡ Almost perfect! ${card.title} should go ${direction} in the sequence.`,
    `🔥 Great attempt! ${card.title} occurred ${direction} than where you placed it.`,
    `💫 Good work! ${card.title} needs to be positioned ${direction} by just a bit.`
  ];
  
  return feedbacks[Math.floor(Math.random() * feedbacks.length)];
};

/**
 * Generate feedback for missed placements
 */
export const generateMissedFeedback = (card, userPosition, correctPosition, timeline) => {
  const cardYear = new Date(card.dateOccurred).getFullYear();
  const decade = Math.floor(cardYear / 10) * 10;
  
  let hint = '';
  let direction = '';
  const sortedTimeline = [...timeline].sort((a, b) => 
    new Date(a.dateOccurred) - new Date(b.dateOccurred)
  );
  
  // Determine direction guidance
  if (userPosition > correctPosition) {
    direction = ' Try looking earlier in the timeline.';
  } else if (userPosition < correctPosition) {
    direction = ' Try looking later in the timeline.';
  }
  
  if (correctPosition > 0 && correctPosition < sortedTimeline.length) {
    const beforeYear = new Date(sortedTimeline[correctPosition - 1].dateOccurred).getFullYear();
    const afterYear = new Date(sortedTimeline[correctPosition].dateOccurred).getFullYear();
    hint = ` It happened between ${beforeYear} and ${afterYear}.`;
  } else if (correctPosition === 0 && sortedTimeline.length > 0) {
    const afterYear = new Date(sortedTimeline[0].dateOccurred).getFullYear();
    hint = ` It happened before ${afterYear}.`;
  } else if (correctPosition >= sortedTimeline.length && sortedTimeline.length > 0) {
    const beforeYear = new Date(sortedTimeline[sortedTimeline.length - 1].dateOccurred).getFullYear();
    hint = ` It happened after ${beforeYear}.`;
  }

  const feedbacks = [
    `❌ Incorrect placement! ${card.title} occurred in ${cardYear} (${decade}s).${hint}${direction}`,
    `🚫 Not quite right! ${card.title} happened in ${cardYear}.${hint}${direction}`,
    `⚠️ Wrong position! ${card.title} took place in ${cardYear}.${hint}${direction}`,
    `💭 Think again! ${card.title} was in ${cardYear}.${hint}${direction}`
  ];
  
  return feedbacks[Math.floor(Math.random() * feedbacks.length)];
};

/**
 * Generate insertion points with smart positioning
 * @param {Array} timeline - Current timeline
 * @param {Object} selectedCard - Currently selected card
 * @returns {Array} - Array of insertion point data
 */
export const generateSmartInsertionPoints = (timeline, selectedCard = null) => {
  const sortedTimeline = [...timeline].sort((a, b) => 
    new Date(a.dateOccurred) - new Date(b.dateOccurred)
  );

  const insertionPoints = [];

  // Add insertion point before first card
  insertionPoints.push({
    index: 0,
    position: 'before',
    referenceCard: sortedTimeline[0] || null,
    difficulty: 'easy',
    hint: sortedTimeline[0] ? `Before ${new Date(sortedTimeline[0].dateOccurred).getFullYear()}` : 'First position'
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
      hint: `Between ${currentYear} and ${nextYear}`
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
      hint: `After ${new Date(lastCard.dateOccurred).getFullYear()}`
    });
  }

  // If we have a selected card, calculate relevance scores
  if (selectedCard) {
    const selectedDate = new Date(selectedCard.dateOccurred);
    insertionPoints.forEach(point => {
      point.relevance = calculateInsertionPointRelevance(point, selectedDate);
    });
  }

  return insertionPoints;
};

/**
 * Calculate how relevant an insertion point is for a specific card
 */
export const calculateInsertionPointRelevance = (insertionPoint, selectedDate) => {
  let relevance = 0.5; // Base relevance

  if (insertionPoint.referenceCard) {
    const refDate = new Date(insertionPoint.referenceCard.dateOccurred);
    const yearDiff = Math.abs(selectedDate.getFullYear() - refDate.getFullYear());
    
    // Higher relevance for closer dates
    if (yearDiff < 5) relevance = 0.9;
    else if (yearDiff < 20) relevance = 0.7;
    else if (yearDiff < 50) relevance = 0.6;
    else relevance = 0.3;
  }

  if (insertionPoint.nextCard) {
    const nextDate = new Date(insertionPoint.nextCard.dateOccurred);
    const refDate = new Date(insertionPoint.referenceCard.dateOccurred);
    
    // Check if selected card fits in this gap
    if (selectedDate >= refDate && selectedDate <= nextDate) {
      relevance = 1.0; // Perfect fit
    }
  }

  return relevance;
};