import React, { useRef } from 'react';
import { useGameState } from '@hooks/useGameState';

/**
 * useGameControls - Game controls hook that provides refs and simplified interface
 * 
 * This hook provides game control functionality by leveraging the consolidated useGameState hook.
 * It focuses on providing refs for DOM manipulation and a simplified interface for components
 * that need direct access to game controls.
 * 
 * Key features:
 * - DOM refs for player hand and timeline components
 * - Simplified interface to useGameState functionality
 * - Backward compatibility for existing component usage
 * 
 * @example
 * ```jsx
 * const {
 *   isLoading,
 *   error,
 *   playerHandRef,
 *   timelineRef,
 *   initializeGame,
 *   executeAITurn
 * } = useGameControls();
 * ```
 * 
 * @returns {Object} Game controls object with refs and state access
 */
const useGameControls = () => {
  const {
    state,
    initializeGame,
    executeAITurn
  } = useGameState();
  
  const playerHandRef = useRef(null);
  const timelineRef = useRef(null);

  return {
    // State from useGameState
    isLoading: state.isLoading,
    error: state.error,
    
    // Refs for DOM manipulation
    playerHandRef,
    timelineRef,
    
    // Functions from useGameState
    initializeGame,
    executeAITurn
  };
};

export default useGameControls; 