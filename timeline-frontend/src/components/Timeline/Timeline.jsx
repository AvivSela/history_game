import React, { useState, useRef, useEffect } from 'react';
import Card from '../Card/Card';
import './Timeline.css';

const Timeline = ({ 
  events = [], 
  onCardClick,
  highlightInsertionPoints = false,
  onInsertionPointClick,
  selectedCard = null,
  isDragActive = false
}) => {
  const [hoveredInsertionPoint, setHoveredInsertionPoint] = useState(null);
  const timelineRef = useRef(null);

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
    if (!highlightInsertionPoints && !isDragActive) return null;
    
    const isHovered = hoveredInsertionPoint === index;
    const isClickable = selectedCard !== null;
    
    return (
      <div 
        key={`insertion-${index}`}
        className={`insertion-point ${isHovered ? 'hovered' : ''} ${isClickable ? 'clickable' : ''} ${isDragActive ? 'drag-active' : ''}`}
        onClick={() => handleInsertionPointClick(index)}
        onMouseEnter={() => handleInsertionPointHover(index, true)}
        onMouseLeave={() => handleInsertionPointHover(index, false)}
        data-drop-zone={`timeline-${index}`}
      >
        <div className="insertion-indicator">
          <span className="insertion-icon">
            {isDragActive ? '+' : (isHovered && selectedCard ? '📍' : '+')}
          </span>
          {isHovered && selectedCard && !isDragActive && (
            <div className="insertion-tooltip">
              Place "{selectedCard.title}" here
            </div>
          )}
        </div>
      </div>
    );
  };

  const scrollTimeline = (direction) => {
    if (timelineRef.current) {
      const scrollAmount = 300;
      const currentScroll = timelineRef.current.scrollLeft;
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
      <div className="timeline-container">
        <div className="timeline-header compact">
          <h3>📅 Empty Timeline</h3>
        </div>
        <div className="timeline-empty">
          <div className="empty-timeline-message">
            <div className="empty-icon">⏰</div>
            <h3>Timeline is empty</h3>
            <p>Cards will appear here as you place them correctly</p>
            {highlightInsertionPoints && renderInsertionPoint(0)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="timeline-container">
      <div className="timeline-header compact">
        <h3>📅 {sortedEvents.length} event{sortedEvents.length !== 1 ? 's' : ''}</h3>
        {sortedEvents.length > 1 && (
          <span className="year-range">
            {new Date(sortedEvents[0].dateOccurred).getFullYear()} - {' '}
            {new Date(sortedEvents[sortedEvents.length - 1].dateOccurred).getFullYear()}
          </span>
        )}
      </div>
      
      <div className="timeline-content">
        <div className="timeline-scroll" ref={timelineRef}>
          <div className="timeline-line"></div>
          
          <div className="timeline-events">
            {/* Insertion point before first card */}
            {renderInsertionPoint(0)}
            
            {sortedEvents.map((event, index) => (
              <React.Fragment key={event.id}>
                <div className="timeline-card-wrapper">
                  <div className="timeline-position">
                    <div className="timeline-date-info">
                      <div className="timeline-year">
                        {new Date(event.dateOccurred).getFullYear()}
                      </div>
                      <div className="timeline-date">
                        {new Date(event.dateOccurred).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                  
                  <Card
                    event={event}
                    size="medium"
                    onClick={() => onCardClick && onCardClick(event)}
                    className="timeline-card"
                  />
                </div>
                
                {/* Insertion point after each card */}
                {renderInsertionPoint(index + 1)}
              </React.Fragment>
            ))}
          </div>
        </div>
        
        {/* Scroll Controls */}
        {sortedEvents.length > 2 && (
          <div className="timeline-controls">
            <button 
              className="timeline-scroll-btn left" 
              onClick={() => scrollTimeline('left')}
              title="Scroll left"
            >
              ‹
            </button>
            <button 
              className="timeline-scroll-btn right" 
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
};

export default Timeline;