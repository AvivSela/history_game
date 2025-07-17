import React from 'react';
import PropTypes from 'prop-types';
import { UI_DIMENSIONS } from '@constants/gameConstants';

/**
 * InsertionPoint - Visual and interactive drop zone for placing cards on timeline
 *
 * This component renders a clickable insertion point that allows users to place
 * cards at specific positions on the timeline. It provides visual feedback for
 * hover states and shows tooltips when a card is selected.
 *
 * @component
 * @example
 * ```jsx
 * <InsertionPoint
 *   index={0}
 *   isHovered={false}
 *   isClickable={true}
 *   selectedCard={{ title: "Event Title" }}
 *   onClick={handleClick}
 *   onMouseEnter={handleMouseEnter}
 *   onMouseLeave={handleMouseLeave}
 * />
 * ```
 *
 * @param {Object} props - Component props
 * @param {number} props.index - Position index of the insertion point
 * @param {boolean} props.isHovered - Whether the insertion point is currently hovered
 * @param {boolean} props.isClickable - Whether the insertion point can be clicked
 * @param {Object|null} props.selectedCard - Currently selected card for placement
 * @param {Function} props.onClick - Callback when insertion point is clicked
 * @param {Function} props.onMouseEnter - Callback when mouse enters insertion point
 * @param {Function} props.onMouseLeave - Callback when mouse leaves insertion point
 * @param {Function} props.onRef - Callback to set ref for the insertion point element
 * @param {Function} props.onKeyDown - Callback for key down events
 *
 * @returns {JSX.Element} The insertion point component
 */
const InsertionPoint = ({
  index,
  isHovered,
  isClickable,
  selectedCard,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onRef,
  onKeyDown,
}) => {
  return (
    <div
      ref={onRef}
      className={`flex items-center justify-center cursor-pointer transition-all duration-200 flex-shrink-0 relative bg-transparent ${
        isHovered
          ? 'opacity-100 scale-110 bg-blue-500/5 rounded-lg'
          : 'opacity-60'
      } ${!isClickable ? 'opacity-30' : ''}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onKeyDown={onKeyDown}
      data-drop-zone={`timeline-${index}`}
      data-testid="insertion-point"
      role="button"
      tabIndex={isClickable ? 0 : -1}
      aria-label={
        selectedCard
          ? `Place "${selectedCard.title}" at position ${index + 1}`
          : `Insertion point at position ${index + 1}`
      }
      aria-pressed={isHovered}
      style={{
        width: `${UI_DIMENSIONS.TIMELINE_INSERTION_POINT_WIDTH}px`,
        minHeight: `${UI_DIMENSIONS.TIMELINE_INSERTION_POINT_HEIGHT}px`,
        padding: `${UI_DIMENSIONS.TIMELINE_INSERTION_POINT_PADDING}px`,
        margin: `-${UI_DIMENSIONS.TIMELINE_INSERTION_POINT_MARGIN}px`,
      }}
    >
      <div
        className={`border-4 border-dashed border-secondary rounded-full flex items-center justify-center bg-secondary/10 transition-all duration-200 relative`}
        style={{
          width: `${UI_DIMENSIONS.TIMELINE_INSERTION_POINT_CIRCLE_SIZE}px`,
          height: `${UI_DIMENSIONS.TIMELINE_INSERTION_POINT_CIRCLE_SIZE}px`,
        }}
      >
        <span
          className="inline-block"
          style={{ fontSize: `${UI_DIMENSIONS.TIMELINE_ICON_SIZE}px` }}
        >
          {isHovered && selectedCard ? '📍' : '+'}
        </span>
        {isHovered && selectedCard && (
          <div
            className={`absolute left-1/2 transform -translate-x-1/2 bg-white text-gray-800 rounded shadow-lg border border-gray-200 whitespace-nowrap`}
            style={{
              top: `-${UI_DIMENSIONS.TIMELINE_TOOLTIP_OFFSET}px`,
              fontSize: `${UI_DIMENSIONS.TIMELINE_TOOLTIP_TEXT_SIZE}px`,
              padding: `${UI_DIMENSIONS.TIMELINE_TOOLTIP_PADDING}px`,
              zIndex: UI_DIMENSIONS.Z_INDEX.TOOLTIP,
            }}
          >
            Place "{selectedCard.title}" here
          </div>
        )}
      </div>
    </div>
  );
};

InsertionPoint.propTypes = {
  index: PropTypes.number.isRequired,
  isHovered: PropTypes.bool.isRequired,
  isClickable: PropTypes.bool.isRequired,
  selectedCard: PropTypes.shape({
    title: PropTypes.string.isRequired,
  }),
  onClick: PropTypes.func.isRequired,
  onMouseEnter: PropTypes.func.isRequired,
  onMouseLeave: PropTypes.func.isRequired,
  onRef: PropTypes.func.isRequired,
  onKeyDown: PropTypes.func,
};

export default InsertionPoint;
