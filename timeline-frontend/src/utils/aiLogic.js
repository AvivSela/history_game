// AI Opponent Logic for Timeline Game

/**
 * AI difficulty levels and their characteristics
 */
export const AI_DIFFICULTIES = {
  easy: {
    name: 'Beginner Bot',
    accuracy: 0.6,
    thinkingTime: { min: 2000, max: 4000 },
    mistakeChance: 0.4,
    learningRate: 0.1,
    description: 'Makes frequent mistakes, good for beginners'
  },
  medium: {
    name: 'Scholar Bot',
    accuracy: 0.8,
    thinkingTime: { min: 1500, max: 3000 },
    mistakeChance: 0.2,
    learningRate: 0.3,
    description: 'Balanced opponent, makes occasional errors'
  },
  hard: {
    name: 'Historian Pro',
    accuracy: 0.95,
    thinkingTime: { min: 1000, max: 2000 },
    mistakeChance: 0.05,
    learningRate: 0.5,
    description: 'Expert-level AI, rarely makes mistakes'
  },
  expert: {
    name: 'Timeline Master',
    accuracy: 0.98,
    thinkingTime: { min: 800, max: 1500 },
    mistakeChance: 0.02,
    learningRate: 0.7,
    description: 'Near-perfect AI, extremely challenging'
  }
};

/**
 * AI decision-making class
 */
export class TimelineAI {
  constructor(difficulty = 'medium') {
    this.difficulty = AI_DIFFICULTIES[difficulty] || AI_DIFFICULTIES.medium;
    this.name = this.difficulty.name;
    this.memory = new Map(); // Stores learned patterns
    this.gameHistory = [];
    this.currentStrategy = 'analytical';
  }

  /**
   * AI selects which card to play
   * @param {Array} hand - AI's current hand
   * @param {Array} timeline - Current timeline
   * @param {Object} gameState - Current game state
   * @returns {Object} - Selected card with confidence
   */
  selectCard(hand, timeline, gameState) {
    if (hand.length === 0) return null;

    const cardAnalysis = hand.map(card => ({
      card,
      confidence: this.analyzeCardPlacement(card, timeline),
      strategicValue: this.calculateStrategicValue(card, hand, timeline),
      difficulty: card.difficulty || 1
    }));

    // Sort by combined score (confidence + strategic value)
    cardAnalysis.sort((a, b) => {
      const scoreA = (a.confidence * 0.7) + (a.strategicValue * 0.3);
      const scoreB = (b.confidence * 0.7) + (b.strategicValue * 0.3);
      return scoreB - scoreA;
    });

    // Add some randomness based on AI difficulty
    const randomFactor = 1 - this.difficulty.accuracy;
    const selectedIndex = this.weightedRandomSelection(cardAnalysis, randomFactor);

    const selection = cardAnalysis[selectedIndex];
    
    console.log(`🤖 ${this.name} selected: ${selection.card.title} (confidence: ${selection.confidence.toFixed(2)})`);

    return {
      card: selection.card,
      confidence: selection.confidence,
      reasoning: this.generateReasoning(selection, timeline)
    };
  }

  /**
   * AI determines where to place the selected card
   * @param {Object} card - Card to place
   * @param {Array} timeline - Current timeline
   * @returns {Object} - Placement decision
   */
  determineCardPlacement(card, timeline) {
    const correctPosition = this.findCorrectPosition(card, timeline);
    
    // Calculate if AI should make a mistake based on difficulty
    const shouldMakeMistake = Math.random() < this.difficulty.mistakeChance;
    
    let finalPosition = correctPosition;
    let confidence = this.difficulty.accuracy;

    if (shouldMakeMistake) {
      finalPosition = this.introduceError(correctPosition, timeline.length);
      confidence *= 0.6; // Reduce confidence when making mistakes
    }

    // Ensure position is within bounds
    finalPosition = Math.max(0, Math.min(timeline.length, finalPosition));

    return {
      position: finalPosition,
      correctPosition,
      confidence,
      isMistake: shouldMakeMistake,
      reasoning: this.generatePlacementReasoning(card, timeline, finalPosition)
    };
  }

  /**
   * Analyze how confident AI is about placing a card
   * @param {Object} card - Card to analyze
   * @param {Array} timeline - Current timeline
   * @returns {number} - Confidence score (0-1)
   */
  analyzeCardPlacement(card, timeline) {
    const cardDate = new Date(card.dateOccurred);
    let confidence = 0.8; // Base confidence

    if (timeline.length === 0) {
      return 0.9; // High confidence for first placement
    }

    // Check for nearby events that AI recognizes
    const nearbyEvents = timeline.filter(event => {
      const eventDate = new Date(event.dateOccurred);
      const yearDiff = Math.abs(cardDate.getFullYear() - eventDate.getFullYear());
      return yearDiff <= 10;
    });

    if (nearbyEvents.length > 0) {
      confidence += 0.1; // Boost confidence for familiar periods
    }

    // Reduce confidence for very close dates
    const veryCloseEvents = timeline.filter(event => {
      const eventDate = new Date(event.dateOccurred);
      const yearDiff = Math.abs(cardDate.getFullYear() - eventDate.getFullYear());
      return yearDiff <= 2;
    });

    if (veryCloseEvents.length > 0) {
      confidence -= 0.2; // Reduce confidence for very close dates
    }

    // Check AI's memory for similar cards
    const memoryKey = this.generateMemoryKey(card);
    if (this.memory.has(memoryKey)) {
      const pastPerformance = this.memory.get(memoryKey);
      confidence = (confidence + pastPerformance.accuracy) / 2;
    }

    return Math.max(0.2, Math.min(1.0, confidence));
  }

  /**
   * Calculate strategic value of playing a card
   * @param {Object} card - Card to evaluate
   * @param {Array} hand - AI's full hand
   * @param {Array} timeline - Current timeline
   * @returns {number} - Strategic value (0-1)
   */
  calculateStrategicValue(card, hand, timeline) {
    let strategicValue = 0.5; // Base value

    // Prefer easier cards early in the game
    if (timeline.length < 3) {
      strategicValue += (4 - card.difficulty) * 0.1;
    }

    // Prefer cards that create good spacing
    const cardDate = new Date(card.dateOccurred);
    const timelineYears = timeline.map(event => new Date(event.dateOccurred).getFullYear());
    
    if (timelineYears.length > 0) {
      const minYear = Math.min(...timelineYears);
      const maxYear = Math.max(...timelineYears);
      const cardYear = cardDate.getFullYear();
      
      // Prefer cards that extend the timeline range
      if (cardYear < minYear || cardYear > maxYear) {
        strategicValue += 0.2;
      }
    }

    // Consider hand composition
    const handDifficulties = hand.map(c => c.difficulty);
    const avgDifficulty = handDifficulties.reduce((a, b) => a + b, 0) / handDifficulties.length;
    
    if (card.difficulty < avgDifficulty) {
      strategicValue += 0.1; // Prefer easier cards when hand is difficult
    }

    return Math.max(0.1, Math.min(1.0, strategicValue));
  }

  /**
   * Find the correct position for a card
   * @param {Object} card - Card to place
   * @param {Array} timeline - Current timeline
   * @returns {number} - Correct position index
   */
  findCorrectPosition(card, timeline) {
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

    return sortedTimeline.length; // Place at end
  }

  /**
   * Introduce strategic errors based on AI difficulty
   * @param {number} correctPosition - The correct position
   * @param {number} timelineLength - Current timeline length
   * @returns {number} - Modified position
   */
  introduceError(correctPosition, timelineLength) {
    const maxError = Math.max(1, Math.floor(timelineLength * 0.3));
    const errorDirection = Math.random() < 0.5 ? -1 : 1;
    const errorMagnitude = Math.floor(Math.random() * maxError) + 1;
    
    return correctPosition + (errorDirection * errorMagnitude);
  }

  /**
   * Weighted random selection based on scores
   * @param {Array} options - Array of options with scores
   * @param {number} randomFactor - How much randomness to introduce
   * @returns {number} - Selected index
   */
  weightedRandomSelection(options, randomFactor) {
    if (Math.random() < randomFactor) {
      // Introduce randomness
      return Math.floor(Math.random() * Math.min(options.length, 3));
    }
    
    // Select best option most of the time
    return 0;
  }

  /**
   * Generate memory key for learning
   * @param {Object} card - Card to generate key for
   * @returns {string} - Memory key
   */
  generateMemoryKey(card) {
    const year = new Date(card.dateOccurred).getFullYear();
    const decade = Math.floor(year / 10) * 10;
    return `${card.category}_${decade}_${card.difficulty}`;
  }

  /**
   * Learn from placement results
   * @param {Object} card - Card that was placed
   * @param {boolean} wasCorrect - Whether placement was correct
   * @param {number} confidence - AI's confidence in the placement
   */
  learnFromPlacement(card, wasCorrect, confidence) {
    const memoryKey = this.generateMemoryKey(card);
    const learningRate = this.difficulty.learningRate;
    
    if (this.memory.has(memoryKey)) {
      const existing = this.memory.get(memoryKey);
      existing.attempts += 1;
      existing.successes += wasCorrect ? 1 : 0;
      existing.accuracy = existing.successes / existing.attempts;
      
      // Adjust accuracy based on learning rate
      if (wasCorrect) {
        existing.accuracy = Math.min(1.0, existing.accuracy + learningRate * 0.1);
      } else {
        existing.accuracy = Math.max(0.1, existing.accuracy - learningRate * 0.05);
      }
    } else {
      this.memory.set(memoryKey, {
        attempts: 1,
        successes: wasCorrect ? 1 : 0,
        accuracy: wasCorrect ? 0.8 : 0.4,
        category: card.category,
        difficulty: card.difficulty
      });
    }

    // Store in game history
    this.gameHistory.push({
      card,
      wasCorrect,
      confidence,
      timestamp: Date.now()
    });
  }

  /**
   * Generate reasoning for card selection
   * @param {Object} selection - Selected card analysis
   * @param {Array} timeline - Current timeline
   * @returns {string} - Human-readable reasoning
   */
  generateReasoning(selection, timeline) {
    const card = selection.card;
    const year = new Date(card.dateOccurred).getFullYear();
    
    const reasonings = [
      `I'm confident about ${card.title} from ${year}`,
      `${card.title} seems like a good strategic choice`,
      `I have high confidence in placing ${card.title}`,
      `${card.title} should fit well in the timeline`,
      `This ${card.category} event from ${year} looks promising`
    ];

    return reasonings[Math.floor(Math.random() * reasonings.length)];
  }

  /**
   * Generate reasoning for placement decision
   * @param {Object} card - Card being placed
   * @param {Array} timeline - Current timeline
   * @param {number} position - Chosen position
   * @returns {string} - Human-readable reasoning
   */
  generatePlacementReasoning(card, timeline, position) {
    const year = new Date(card.dateOccurred).getFullYear();
    
    if (timeline.length === 0) {
      return `Starting the timeline with ${card.title} from ${year}`;
    }

    if (position === 0) {
      return `${card.title} should go at the beginning`;
    } else if (position === timeline.length) {
      return `${card.title} belongs at the end of our timeline`;
    } else {
      return `${card.title} fits somewhere in the middle`;
    }
  }

  /**
   * Get AI's current performance stats
   * @returns {Object} - Performance statistics
   */
  getPerformanceStats() {
    const totalAttempts = this.gameHistory.length;
    if (totalAttempts === 0) return { accuracy: 0, confidence: 0, attempts: 0 };

    const successfulPlacements = this.gameHistory.filter(entry => entry.wasCorrect).length;
    const averageConfidence = this.gameHistory.reduce((sum, entry) => sum + entry.confidence, 0) / totalAttempts;

    return {
      accuracy: successfulPlacements / totalAttempts,
      confidence: averageConfidence,
      attempts: totalAttempts,
      memorySize: this.memory.size
    };
  }

  /**
   * Reset AI state for new game
   */
  resetForNewGame() {
    this.gameHistory = [];
    // Keep memory for learning across games
    this.currentStrategy = 'analytical';
  }
}

/**
 * Create AI opponent based on difficulty
 * @param {string} difficulty - Difficulty level
 * @returns {TimelineAI} - AI opponent instance
 */
export const createAIOpponent = (difficulty = 'medium') => {
  return new TimelineAI(difficulty);
};

/**
 * Get AI thinking time based on difficulty
 * @param {string} difficulty - AI difficulty level
 * @returns {number} - Thinking time in milliseconds
 */
export const getAIThinkingTime = (difficulty = 'medium') => {
  const config = AI_DIFFICULTIES[difficulty] || AI_DIFFICULTIES.medium;
  const { min, max } = config.thinkingTime;
  return Math.floor(Math.random() * (max - min)) + min;
};