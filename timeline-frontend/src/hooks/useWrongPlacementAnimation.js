import { useCallback } from 'react';
import { animations } from '../utils/animation';
import { TIMING } from '../constants/gameConstants';

/**
 * useWrongPlacementAnimation - Hook to trigger and cleanup wrong placement animation
 *
 * @param {Object} options
 * @param {React.RefObject} options.timelineRef - Ref to the timeline container
 * @param {Map} options.insertionRefs - Map of insertion point refs
 * @returns {Object} { triggerWrongPlacement, cleanupAnimations }
 */
export default function useWrongPlacementAnimation({ timelineRef, insertionRefs }) {
  /**
   * Triggers the wrong placement animation at a given position
   * @param {number} position - The insertion point index
   */
  const triggerWrongPlacement = useCallback((position) => {
    const timelineElement = timelineRef.current;
    const insertionPointElement = insertionRefs.current.get(position);
    if (timelineElement) {
      animations.wrongPlacement(null, timelineElement, insertionPointElement);
      setTimeout(() => {
        if (insertionPointElement) {
          animations.cleanup(insertionPointElement);
        }
        if (timelineElement) {
          animations.cleanup(timelineElement);
        }
      }, TIMING.WRONG_PLACEMENT_INDICATOR);
    }
  }, [timelineRef, insertionRefs]);

  /**
   * Cleans up all wrong placement animations
   */
  const cleanupAnimations = useCallback(() => {
    if (timelineRef.current) {
      animations.cleanup(timelineRef.current);
    }
    if (insertionRefs.current) {
      insertionRefs.current.forEach(element => {
        if (element) animations.cleanup(element);
      });
    }
  }, [timelineRef, insertionRefs]);

  return {
    triggerWrongPlacement,
    cleanupAnimations,
  };
} 