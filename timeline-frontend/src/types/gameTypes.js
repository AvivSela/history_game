/**
 * Game Types Documentation
 * 
 * ⚠️  DEAD CODE - NOT CURRENTLY USED
 * 
 * This file documents the structure of game-related data types
 * for better code understanding and future TypeScript migration.
 * 
 * STATUS: Excluded from coverage reports as it's prepared for future use.
 * TECHNICAL DEBT: FE-034 - Documented in technical debt tracker.
 * 
 * TODO: Integrate these type definitions into actual codebase when
 * migrating to TypeScript or implementing JSDoc type checking.
 */

/**
 * @typedef {Object} Card
 * @property {string} id - Unique identifier for the card
 * @property {string} title - Event title
 * @property {string} description - Event description
 * @property {number} year - Year the event occurred
 * @property {string} category - Event category (e.g., 'science', 'history')
 * @property {string} difficulty - Difficulty level ('easy', 'medium', 'hard')
 * @property {boolean} isRevealed - Whether the card is revealed on timeline
 * @property {number} [placedAt] - Timestamp when card was placed
 * @property {string} [placedBy] - Player who placed the card
 */

/**
 * @typedef {Object} GameState
 * @property {Card[]} timeline - Cards placed on the timeline
 * @property {Card[]} playerHand - Cards in player's hand
 * @property {Card[]} cardPool - Additional cards for replacement
 * @property {string} gameStatus - Current game status
 * @property {string} gameMode - Game mode ('single')
 * @property {string} difficulty - Game difficulty
 * @property {Card|null} selectedCard - Currently selected card
 * @property {boolean} showInsertionPoints - Whether to show insertion points
 * @property {Object|null} feedback - Current feedback message
 * @property {boolean} isLoading - Loading state
 * @property {string|null} error - Error message
 * @property {Object} score - Player score
 * @property {Object} attempts - Attempt counts per card
 * @property {number} startTime - Game start timestamp
 * @property {number} turnStartTime - Turn start timestamp
 * @property {Object} gameStats - Game statistics
 * @property {Array} insertionPoints - Available insertion points
 */

/**
 * @typedef {Object} GameStats
 * @property {number} totalMoves - Total moves made
 * @property {number} correctMoves - Correct moves made
 * @property {number} hintsUsed - Hints used
 * @property {number} averageTimePerMove - Average time per move
 */

/**
 * @typedef {Object} Score
 * @property {number} human - Human player score
 */

/**
 * @typedef {Object} Feedback
 * @property {string} type - Feedback type ('success', 'error', 'info')
 * @property {string} message - Feedback message
 * @property {number} [points] - Points earned
 * @property {number} [attempts] - Number of attempts
 */

/**
 * @typedef {Object} InsertionPoint
 * @property {number} position - Position in timeline
 * @property {number} confidence - Confidence score
 * @property {string} reason - Reason for suggestion
 */

/**
 * @typedef {Object} GameSession
 * @property {Card[]} timeline - Initial timeline
 * @property {Card[]} playerHand - Initial player hand
 * @property {number} startTime - Session start time
 * @property {Object} settings - Game settings
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} isCorrect - Whether placement is correct
 * @property {number} distance - Distance from correct position
 * @property {string} message - Validation message
 * @property {number} [score] - Score earned
 */

// Export types for documentation purposes
export const GAME_TYPES = {
  Card: 'Card',
  GameState: 'GameState',
  GameStats: 'GameStats',
  Score: 'Score',
  Feedback: 'Feedback',
  InsertionPoint: 'InsertionPoint',
  GameSession: 'GameSession',
  ValidationResult: 'ValidationResult',
};
