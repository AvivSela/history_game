import React from 'react';
import PropTypes from 'prop-types';

/**
 * ScrollControls - Navigation buttons for timeline scrolling
 *
 * This component renders left and right scroll buttons that allow users
 * to navigate through the timeline when there are many events. The buttons
 * are only shown when there are more than 2 events to scroll through.
 *
 * @component
 * @example
 * ```jsx
 * <ScrollControls
 *   onScrollLeft={handleScrollLeft}
 *   onScrollRight={handleScrollRight}
 * />
 * ```
 *
 * @param {Object} props - Component props
 * @param {Function} props.onScrollLeft - Callback when left scroll button is clicked
 * @param {Function} props.onScrollRight - Callback when right scroll button is clicked
 *
 * @returns {JSX.Element} The scroll controls component
 */
const ScrollControls = ({ onScrollLeft, onScrollRight }) => {
  return (
    <div
      className="absolute top-1/2 transform -translate-y-1/2 left-2 right-2 lg:left-4 lg:right-4 flex justify-between pointer-events-none"
      data-testid="timeline-scroll"
    >
      <button
        className="w-10 h-10 lg:w-12 lg:h-12 bg-white/80 hover:bg-white text-primary text-xl lg:text-2xl font-bold rounded-full shadow-lg border border-gray-200 flex items-center justify-center transition-all duration-200 hover:scale-110 pointer-events-auto focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        onClick={onScrollLeft}
        title="Scroll left"
        aria-label="Scroll timeline to the left"
        aria-describedby="scroll-left-description"
      >
        ‹
        <span id="scroll-left-description" className="sr-only">
          Navigate to previous timeline events
        </span>
      </button>
      <button
        className="w-10 h-10 lg:w-12 lg:h-12 bg-white/80 hover:bg-white text-primary text-xl lg:text-2xl font-bold rounded-full shadow-lg border border-gray-200 flex items-center justify-center transition-all duration-200 hover:scale-110 pointer-events-auto focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        onClick={onScrollRight}
        title="Scroll right"
        aria-label="Scroll timeline to the right"
        aria-describedby="scroll-right-description"
      >
        ›
        <span id="scroll-right-description" className="sr-only">
          Navigate to next timeline events
        </span>
      </button>
    </div>
  );
};

ScrollControls.propTypes = {
  onScrollLeft: PropTypes.func.isRequired,
  onScrollRight: PropTypes.func.isRequired,
};

export default ScrollControls;
