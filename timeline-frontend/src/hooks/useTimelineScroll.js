import { useRef, useCallback } from 'react';

/**
 * useTimelineScroll - Custom hook for handling timeline scrolling logic
 *
 * Provides a ref for the timeline container and exposes methods to scroll left, right,
 * or to the end. Handles smooth scrolling and can be used with scroll controls.
 *
 * @param {Object} options - Hook options
 * @param {number} options.scrollAmount - Amount of pixels to scroll per action
 * @returns {Object} { timelineRef, scrollLeft, scrollRight, scrollToEnd }
 */
export default function useTimelineScroll({ scrollAmount }) {
  const timelineRef = useRef(null);

  /**
   * Scrolls the timeline to the left by scrollAmount
   */
  const scrollLeft = useCallback(() => {
    if (timelineRef.current && timelineRef.current.scrollTo) {
      const currentScroll = timelineRef.current.scrollLeft || 0;
      timelineRef.current.scrollTo({
        left: currentScroll - scrollAmount,
        behavior: 'smooth',
      });
    }
  }, [scrollAmount]);

  /**
   * Scrolls the timeline to the right by scrollAmount
   */
  const scrollRight = useCallback(() => {
    if (timelineRef.current && timelineRef.current.scrollTo) {
      const currentScroll = timelineRef.current.scrollLeft || 0;
      timelineRef.current.scrollTo({
        left: currentScroll + scrollAmount,
        behavior: 'smooth',
      });
    }
  }, [scrollAmount]);

  /**
   * Scrolls the timeline to the end (rightmost position)
   */
  const scrollToEnd = useCallback(() => {
    if (timelineRef.current) {
      timelineRef.current.scrollTo({
        left: timelineRef.current.scrollWidth,
        behavior: 'smooth',
      });
    }
  }, []);

  return {
    timelineRef,
    scrollLeft,
    scrollRight,
    scrollToEnd,
  };
}
