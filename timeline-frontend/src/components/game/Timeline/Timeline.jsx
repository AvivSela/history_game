import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useCallback,
} from 'react';
import PropTypes from 'prop-types';
import Card from '../Card';
import InsertionPoint from './InsertionPoint';
import { animations } from '@utils/animation';
import { UI_DIMENSIONS, TIMING } from '@constants/gameConstants';
import useKeyboardNavigation from '@hooks/useKeyboardNavigation';
import ScrollControls from './ScrollControls';
import './Timeline.css';

/**
 * Timeline - Horizontal timeline component for displaying historical events in chronological order
 *
 * This component renders a horizontal timeline with historical events arranged chronologically.
 * It supports insertion points for placing new cards, scroll controls for navigation,
 * and animations for wrong placement feedback. The timeline automatically sorts events
 * by date and provides visual indicators for the chronological flow.
 *
 * @component
 * @example
 * ```jsx
 * <Timeline
 *   events={[
 *     {
 *       id: 1,
 *       title: "World War II",
 *       dateOccurred: "1939-09-01",
 *       category: "Military"
 *     }
 *   ]}
 *   onCardClick={handleTimelineCardClick}
 *   highlightInsertionPoints={true}
 *   onInsertionPointClick={handleInsertionPointClick}
 *   selectedCard={selectedCard}
 * />
 * ```
 *
 * @param {Object} props - Component props
 * @param {Array} [props.events=[]] - Array of event objects to display on timeline
 * @param {Object} props.events[].id - Unique identifier for the event
 * @param {string} props.events[].title - Title of the historical event
 * @param {string} props.events[].dateOccurred - Date when the event occurred (ISO format)
 * @param {string} props.events[].category - Category of the event
 * @param {Function} [props.onCardClick] - Callback when a timeline card is clicked
 * @param {boolean} [props.highlightInsertionPoints=false] - Whether to show insertion points
 * @param {Function} [props.onInsertionPointClick] - Callback when insertion point is clicked
 * @param {Object|null} [props.selectedCard=null] - Currently selected card for placement
 * @param {React.Ref} ref - Forwarded ref with animation methods
 *
 * @returns {JSX.Element} The timeline component with chronological event display
 */
const Timeline = forwardRef(
  (
    {
      events = [],
      onCardClick,
      highlightInsertionPoints = false,
      onInsertionPointClick,
      selectedCard = null,
    },
    ref
  ) => {
    const [hoveredInsertionPoint, setHoveredInsertionPoint] = useState(null);
    const [wrongPlacementPosition, setWrongPlacementPosition] = useState(null);
    const timelineRef = useRef(null);
    const insertionPointRefs = useRef(new Map());

    // Keyboard navigation hook
    const { handleKeyDown } = useKeyboardNavigation({
      insertionRefs: insertionPointRefs,
      onSelect: onInsertionPointClick,
    });

    // Expose animation methods via ref
    useImperativeHandle(ref, () => ({
      animateWrongPlacement: position => {
        const timelineElement = timelineRef.current;
        const insertionPointElement = insertionPointRefs.current.get(position);

        // Show wrong placement indicator
        setWrongPlacementPosition(position);

        if (timelineElement) {
          animations.wrongPlacement(
            null,
            timelineElement,
            insertionPointElement
          );
        }

        // Clear indicator after animation
        setTimeout(() => {
          setWrongPlacementPosition(null);
        }, TIMING.WRONG_PLACEMENT_INDICATOR);
      },
      cleanupAnimations: () => {
        if (timelineRef.current) {
          animations.cleanup(timelineRef.current);
        }
        insertionPointRefs.current.forEach(element => {
          if (element) animations.cleanup(element);
        });
      },
    }));

    // Sort events chronologically
    const sortedEvents = useMemo(
      () =>
        [...events].sort(
          (a, b) => new Date(a.dateOccurred) - new Date(b.dateOccurred)
        ),
      [events]
    );

    // Auto-scroll to show new cards
    useEffect(() => {
      if (timelineRef.current && events.length > 0) {
        const timeline = timelineRef.current;
        const lastCard = timeline.querySelector('.timeline-card:last-child');
        if (lastCard) {
          lastCard.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center',
          });
        }
      }
    }, [events.length]);

    const handleCardClick = useCallback(
      event => {
        if (onCardClick) {
          onCardClick(event);
        }
      },
      [onCardClick]
    );

    const handleInsertionPointClick = useCallback(
      index => {
        if (onInsertionPointClick && selectedCard) {
          onInsertionPointClick(index);
        }
      },
      [onInsertionPointClick, selectedCard]
    );

    const handleInsertionPointHover = useCallback((index, isEntering) => {
      if (isEntering) {
        setHoveredInsertionPoint(index);
      } else {
        setHoveredInsertionPoint(null);
      }
    }, []);

    const renderInsertionPoint = useCallback(
      index => {
        if (!highlightInsertionPoints) return null;
        const isHovered = hoveredInsertionPoint === index;
        const isClickable = selectedCard !== null;

        return (
          <InsertionPoint
            key={`insertion-${index}`}
            index={index}
            isHovered={isHovered}
            isClickable={isClickable}
            selectedCard={selectedCard}
            onClick={() => handleInsertionPointClick(index)}
            onMouseEnter={() => handleInsertionPointHover(index, true)}
            onMouseLeave={() => handleInsertionPointHover(index, false)}
            onKeyDown={e => handleKeyDown(e, index)}
            onRef={el => {
              if (el) {
                insertionPointRefs.current.set(index, el);
              } else {
                insertionPointRefs.current.delete(index);
              }
            }}
          />
        );
      },
      [
        highlightInsertionPoints,
        hoveredInsertionPoint,
        selectedCard,
        handleInsertionPointClick,
        handleInsertionPointHover,
        handleKeyDown,
      ]
    );

    const scrollTimeline = useCallback(direction => {
      if (timelineRef.current && timelineRef.current.scrollTo) {
        const scrollAmount = UI_DIMENSIONS.TIMELINE_SCROLL_AMOUNT;
        const currentScroll = timelineRef.current.scrollLeft || 0;
        const newScroll =
          direction === 'left'
            ? currentScroll - scrollAmount
            : currentScroll + scrollAmount;
        timelineRef.current.scrollTo({
          left: newScroll,
          behavior: 'smooth',
        });
      }
    }, []);

    // Memoized scroll handlers for ScrollControls
    const handleScrollLeft = useCallback(
      () => scrollTimeline('left'),
      [scrollTimeline]
    );
    const handleScrollRight = useCallback(
      () => scrollTimeline('right'),
      [scrollTimeline]
    );

    if (sortedEvents.length === 0) {
      return (
        <div
          className={`bg-card rounded-lg shadow-md border border-border relative overflow-visible w-full max-w-none px-[${UI_DIMENSIONS.TIMELINE_CONTAINER_PADDING}px] my-[${UI_DIMENSIONS.TIMELINE_CONTAINER_MARGIN}px]`}
          data-testid="timeline-container"
        >
          <div className="relative">
            <div
              className={`overflow-x-auto overflow-y-visible scroll-smooth md:py-4 sm:py-3 pt-[${UI_DIMENSIONS.TIMELINE_CONTENT_PADDING}px] pb-[${UI_DIMENSIONS.TIMELINE_CONTENT_PADDING}px]`}
              ref={timelineRef}
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#3498db #ecf0f1',
              }}
              data-testid="timeline-content"
            >
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-sm z-0 shadow-sm"></div>
            </div>
            <div
              className={`text-center md:py-10 sm:py-6 pt-[${UI_DIMENSIONS.TIMELINE_EMPTY_STATE_PADDING}px] pb-[${UI_DIMENSIONS.TIMELINE_EMPTY_STATE_PADDING}px]`}
            >
              <div
                className={`bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-lg border border-secondary/20 p-[${UI_DIMENSIONS.TIMELINE_EMPTY_STATE_INNER_PADDING}px]`}
              >
                <div
                  className={`mb-[${UI_DIMENSIONS.TIMELINE_EMPTY_STATE_ICON_MARGIN}px]`}
                  style={{
                    fontSize: `${UI_DIMENSIONS.TIMELINE_EMPTY_STATE_ICON_SIZE}px`,
                  }}
                >
                  ⏰
                </div>
                <h3
                  className={`text-primary font-bold mb-[${UI_DIMENSIONS.TIMELINE_EMPTY_STATE_TITLE_MARGIN}px]`}
                  style={{
                    fontSize: `${UI_DIMENSIONS.TIMELINE_EMPTY_STATE_TITLE_SIZE}px`,
                  }}
                >
                  Timeline is empty
                </h3>
                <p className="text-text-light">
                  Cards will appear here as you place them correctly
                </p>
                {highlightInsertionPoints && renderInsertionPoint(0)}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        className={`bg-card rounded-lg p-6 shadow-md my-5 border border-border relative overflow-visible w-full max-w-none`}
        data-testid="timeline-container"
      >
        <div className="relative">
          <div
            className={`overflow-x-auto overflow-y-visible py-6 scroll-smooth md:py-4 sm:py-3`}
            ref={timelineRef}
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#3498db #ecf0f1',
            }}
            data-testid="timeline-content"
          >
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-sm z-0 shadow-sm"></div>
            <div
              className={`flex items-center justify-center gap-6 relative z-20 px-6 lg:gap-8 lg:px-8 md:gap-6 md:px-4 sm:gap-4 sm:px-2`}
              style={{ minHeight: `${UI_DIMENSIONS.TIMELINE_MIN_HEIGHT}px` }}
            >
              {/* Insertion point before first card */}
              {renderInsertionPoint(0)}
              {sortedEvents.map((event, index) => (
                <React.Fragment key={event.id}>
                  <div
                    className="flex flex-col items-center gap-3 flex-shrink-0 relative lg:gap-4 md:gap-3 sm:gap-2"
                    data-testid="timeline-card-wrapper"
                  >
                    <div className="flex flex-col items-center gap-1.5 mb-1.5 lg:gap-2 lg:mb-2 md:gap-1 md:mb-1">
                      <div className="text-center bg-card px-3 py-2 rounded-lg shadow-sm border border-border min-w-[80px] md:px-2 md:py-1 md:min-w-[70px] sm:px-1 sm:py-1 sm:min-w-[60px]">
                        <div className="text-base font-bold text-primary leading-none md:text-sm sm:text-xs">
                          {new Date(event.dateOccurred).getFullYear()}
                        </div>
                        <div className="text-xs text-text-light mt-0.5 font-medium md:text-[10px] sm:text-[9px]">
                          {new Date(event.dateOccurred).toLocaleDateString(
                            'en-US',
                            {
                              month: 'short',
                              day: 'numeric',
                            }
                          )}
                        </div>
                      </div>
                    </div>
                    <Card
                      event={event}
                      size="small"
                      onClick={() => handleCardClick(event)}
                      className="timeline-card"
                    />
                  </div>
                  {/* Insertion point after each card */}
                  {renderInsertionPoint(index + 1)}
                </React.Fragment>
              ))}

              {/* Wrong placement indicator */}
              {wrongPlacementPosition !== null && (
                <div className="wrong-placement-indicator">❌</div>
              )}
            </div>
          </div>
          {/* Scroll Controls */}
          {sortedEvents.length > 2 && (
            <ScrollControls
              onScrollLeft={handleScrollLeft}
              onScrollRight={handleScrollRight}
            />
          )}
        </div>
      </div>
    );
  }
);

Timeline.displayName = 'Timeline';

Timeline.propTypes = {
  events: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string.isRequired,
      dateOccurred: PropTypes.string.isRequired,
      category: PropTypes.string.isRequired,
    })
  ),
  onCardClick: PropTypes.func,
  highlightInsertionPoints: PropTypes.bool,
  onInsertionPointClick: PropTypes.func,
  selectedCard: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    dateOccurred: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
  }),
};

Timeline.defaultProps = {
  events: [],
  highlightInsertionPoints: false,
  selectedCard: null,
};

export default Timeline;
