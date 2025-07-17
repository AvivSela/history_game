import React from 'react';
import PropTypes from 'prop-types';
import Card from '../Card';

/**
 * TimelineCardWrapper - Wrapper component for timeline cards with date labels
 *
 * This component combines a date label with a Card component to display
 * historical events on the timeline. It handles the layout and styling
 * for the date information and card placement.
 *
 * @component
 * @example
 * ```jsx
 * <TimelineCardWrapper
 *   event={{
 *     id: 1,
 *     title: "World War II",
 *     dateOccurred: "1939-09-01",
 *     category: "Military"
 *   }}
 *   onCardClick={handleCardClick}
 * />
 * ```
 *
 * @param {Object} props - Component props
 * @param {Object} props.event - Event object to display
 * @param {string} props.event.id - Unique identifier for the event
 * @param {string} props.event.title - Title of the historical event
 * @param {string} props.event.dateOccurred - Date when the event occurred (ISO format)
 * @param {string} props.event.category - Category of the event
 * @param {Function} [props.onCardClick] - Callback when the card is clicked
 *
 * @returns {JSX.Element} The timeline card wrapper component
 */
const TimelineCardWrapper = ({ event, onCardClick }) => {
  const eventDate = new Date(event.dateOccurred);
  const year = eventDate.getFullYear();
  const monthDay = eventDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div
      className="flex flex-col items-center gap-3 flex-shrink-0 relative lg:gap-4 md:gap-3 sm:gap-2"
      data-testid="timeline-card-wrapper"
    >
      <div className="flex flex-col items-center gap-1.5 mb-1.5 lg:gap-2 lg:mb-2 md:gap-1 md:mb-1">
        <div className="text-center bg-card px-3 py-2 rounded-lg shadow-sm border border-border min-w-[80px] md:px-2 md:py-1 md:min-w-[70px] sm:px-1 sm:py-1 sm:min-w-[60px]">
          <div className="text-base font-bold text-primary leading-none md:text-sm sm:text-xs">
            {year}
          </div>
          <div className="text-xs text-text-light mt-0.5 font-medium md:text-[10px] sm:text-[9px]">
            {monthDay}
          </div>
        </div>
      </div>
      <Card
        event={event}
        size="small"
        onClick={() => onCardClick && onCardClick(event)}
        className="timeline-card"
      />
    </div>
  );
};

TimelineCardWrapper.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    dateOccurred: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
  }).isRequired,
  onCardClick: PropTypes.func,
};

export default TimelineCardWrapper;
