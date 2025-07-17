import { useCallback } from 'react';

/**
 * useKeyboardNavigation - Hook for keyboard navigation among insertion points
 *
 * Handles arrow key navigation and focus management for insertion points.
 *
 * @param {Object} options
 * @param {React.RefObject} options.insertionRefs - Map of insertion point refs
 * @param {Function} options.onSelect - Callback when an insertion point is selected
 * @returns {Object} { handleKeyDown }
 */
export default function useKeyboardNavigation({ insertionRefs, onSelect }) {
  /**
   * Handles keydown events for keyboard navigation
   * @param {KeyboardEvent} e
   * @param {number} currentIndex - The currently focused insertion point index
   */
  const handleKeyDown = useCallback(
    (e, currentIndex) => {
      const keys = ['ArrowLeft', 'ArrowRight', 'Enter', ' ', 'Spacebar'];
      if (!keys.includes(e.key)) return;
      const indices = Array.from(insertionRefs.current.keys()).sort(
        (a, b) => a - b
      );
      const currentPos = indices.indexOf(currentIndex);
      if (e.key === 'ArrowLeft') {
        const prevIndex =
          indices[(currentPos - 1 + indices.length) % indices.length];
        const prevRef = insertionRefs.current.get(prevIndex);
        if (prevRef && prevRef.focus) prevRef.focus();
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        const nextIndex = indices[(currentPos + 1) % indices.length];
        const nextRef = insertionRefs.current.get(nextIndex);
        if (nextRef && nextRef.focus) nextRef.focus();
        e.preventDefault();
      } else if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        if (onSelect) onSelect(currentIndex);
        e.preventDefault();
      }
    },
    [insertionRefs, onSelect]
  );

  return { handleKeyDown };
}
