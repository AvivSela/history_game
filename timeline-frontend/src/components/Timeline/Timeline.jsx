import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import Card from '../Card/Card';
import { animations } from '../../utils/animation';

const Timeline = forwardRef(({ 
  events = [], 
  onCardClick,
  highlightInsertionPoints = false,
  onInsertionPointClick,
  selectedCard = null,
}, ref) => {
  const [hoveredInsertionPoint, setHoveredInsertionPoint] = useState(null);
  const [wrongPlacementPosition, setWrongPlacementPosition] = useState(null);
  const timelineRef = useRef(null);
  const insertionPointRefs = useRef(new Map());

  // Expose animation methods via ref
  useImperativeHandle(ref, () => ({
    animateWrongPlacement: (position) => {
      const timelineElement = timelineRef.current;
      const insertionPointElement = insertionPointRefs.current.get(position);
      
      // Show wrong placement indicator
      setWrongPlacementPosition(position);
      
      if (timelineElement) {
        animations.wrongPlacement(null, timelineElement, insertionPointElement);
      }
      
      // Clear indicator after animation
      setTimeout(() => {
        setWrongPlacementPosition(null);
      }, 1000);
    },
    cleanupAnimations: () => {
      if (timelineRef.current) {
        animations.cleanup(timelineRef.current);
      }
      insertionPointRefs.current.forEach(element => {
        if (element) animations.cleanup(element);
      });
    }
  }));

  // Sort events chronologically
  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.dateOccurred) - new Date(b.dateOccurred)
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
          inline: 'center'
        });
      }
    }
  }, [events.length]);

  const handleInsertionPointClick = (index) => {
    if (onInsertionPointClick && selectedCard) {
      onInsertionPointClick(index);
    }
  };

  const handleInsertionPointHover = (index, isEntering) => {
    if (isEntering) {
      setHoveredInsertionPoint(index);
    } else {
      setHoveredInsertionPoint(null);
    }
  };

  const renderInsertionPoint = (index) => {
    if (!highlightInsertionPoints) return null;
    const isHovered = hoveredInsertionPoint === index;
    const isClickable = selectedCard !== null;
    return (
      <div 
        key={`insertion-${index}`}
        ref={(el) => {
          if (el) {
            insertionPointRefs.current.set(index, el);
          } else {
            insertionPointRefs.current.delete(index);
          }
        }}
        className={`flex items-center justify-center h-80 w-20 cursor-pointer transition-all duration-200 opacity-0 flex-shrink-0 relative bg-transparent p-5 -m-5 ${isHovered ? 'opacity-100 scale-110 bg-blue-500/5 rounded-lg' : ''} ${isClickable ? 'opacity-60' : ''}`}
        onClick={() => handleInsertionPointClick(index)}
        onMouseEnter={() => handleInsertionPointHover(index, true)}
        onMouseLeave={() => handleInsertionPointHover(index, false)}
        data-drop-zone={`timeline-${index}`}
        data-testid="insertion-point"
        style={{
          width: '80px',
          minHeight: '320px',
        }}
      >
        <div className="w-12 h-12 border-4 border-dashed border-secondary rounded-full flex items-center justify-center bg-secondary/10 transition-all duration-200 relative">
          <span className="text-lg">
            {isHovered && selectedCard ? '📍' : '+'}
          </span>
          {isHovered && selectedCard && (
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 text-xs px-2 py-1 rounded shadow-lg border border-gray-200 whitespace-nowrap z-50">
              Place "{selectedCard.title}" here
            </div>
          )}
        </div>
      </div>
    );
  };

  const scrollTimeline = (direction) => {
    if (timelineRef.current && timelineRef.current.scrollTo) {
      const scrollAmount = 300;
      const currentScroll = timelineRef.current.scrollLeft || 0;
      const newScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      timelineRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  };

  if (sortedEvents.length === 0) {
    return (
      <div className="bg-card rounded-lg p-6 shadow-md my-5 border border-border relative overflow-visible w-full max-w-none" data-testid="timeline-container">
        <div className="relative">
          <div className="overflow-x-auto overflow-y-visible py-6 scroll-smooth md:py-4 sm:py-3" ref={timelineRef} style={{ scrollbarWidth: 'thin', scrollbarColor: '#3498db #ecf0f1' }} data-testid="timeline-content">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-sm z-0 shadow-sm"></div>
          </div>
          <div className="text-center py-16 md:py-10 sm:py-6">
            <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-lg p-8 border border-secondary/20">
              <div className="text-6xl mb-4">⏰</div>
              <h3 className="text-primary text-xl font-bold mb-2">Timeline is empty</h3>
              <p className="text-text-light">Cards will appear here as you place them correctly</p>
              {highlightInsertionPoints && renderInsertionPoint(0)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg p-6 shadow-md my-5 border border-border relative overflow-visible w-full max-w-none" data-testid="timeline-container">
      <div className="relative">
        <div className="overflow-x-auto overflow-y-visible py-6 scroll-smooth md:py-4 sm:py-3" ref={timelineRef} style={{ scrollbarWidth: 'thin', scrollbarColor: '#3498db #ecf0f1' }} data-testid="timeline-content">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-sm z-0 shadow-sm"></div>
          <div className="flex items-center justify-center gap-8 min-h-[320px] relative z-20 px-8 md:gap-6 md:px-4 sm:gap-4 sm:px-2">
            {/* Insertion point before first card */}
            {renderInsertionPoint(0)}
            {sortedEvents.map((event, index) => (
              <React.Fragment key={event.id}>
                <div className="flex flex-col items-center gap-4 flex-shrink-0 relative md:gap-3 sm:gap-2" data-testid="timeline-card-wrapper">
                  <div className="flex flex-col items-center gap-2 mb-2 md:gap-1 md:mb-1">
                    <div className="text-center bg-card px-3 py-2 rounded-lg shadow-sm border border-border min-w-[80px] md:px-2 md:py-1 md:min-w-[70px] sm:px-1 sm:py-1 sm:min-w-[60px]">
                      <div className="text-base font-bold text-primary leading-none md:text-sm sm:text-xs">
                        {new Date(event.dateOccurred).getFullYear()}
                      </div>
                      <div className="text-xs text-text-light mt-0.5 font-medium md:text-[10px] sm:text-[9px]">
                        {new Date(event.dateOccurred).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
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
                {/* Insertion point after each card */}
                {renderInsertionPoint(index + 1)}
              </React.Fragment>
            ))}
            
            {/* Wrong placement indicator */}
            {wrongPlacementPosition !== null && (
              <div className="wrong-placement-indicator">
                ❌
              </div>
            )}
          </div>
        </div>
        {/* Scroll Controls */}
        {sortedEvents.length > 2 && (
          <div className="absolute top-1/2 transform -translate-y-1/2 left-4 right-4 flex justify-between pointer-events-none" data-testid="timeline-scroll">
            <button 
              className="w-12 h-12 bg-white/80 hover:bg-white text-primary text-2xl font-bold rounded-full shadow-lg border border-gray-200 flex items-center justify-center transition-all duration-200 hover:scale-110 pointer-events-auto" 
              onClick={() => scrollTimeline('left')}
              title="Scroll left"
            >
              ‹
            </button>
            <button 
              className="w-12 h-12 bg-white/80 hover:bg-white text-primary text-2xl font-bold rounded-full shadow-lg border border-gray-200 flex items-center justify-center transition-all duration-200 hover:scale-110 pointer-events-auto" 
              onClick={() => scrollTimeline('right')}
              title="Scroll right"
            >
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

export default Timeline;