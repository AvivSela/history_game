import React, { useState, useRef, useEffect } from 'react';
import Card from '../Card/Card';
import './Timeline.css';

const Timeline = ({ 
  events = [], 
  onCardClick,
  highlightInsertionPoints = false,
  onInsertionPointClick,
  selectedCard = null
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
    if (!highlightInsertionPoints) return null;
    
    const isHovered = hoveredInsertionPoint === index;
    const isClickable = selectedCard !== null;
    
    return (
      <div 
        key={`insertion-${index}`}
        className={`insertion-point ${isHovered ? 'hovered' : ''} ${isClickable ? 'clickable' : ''}`}
        onClick={() => handleInsertionPointClick(index)}
        onMouseEnter={() => handleInsertionPointHover(index, true)}
        onMouseLeave={() => handleInsertionPointHover(index, false)}
      >
        <div className="insertion-indicator">
          <span className="insertion-icon">
            {isHovered && selectedCard ? '📍' : '+'}
          </span>
          {isHovered && selectedCard && (
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
        <div className="timeline-header">
          <h2>📅 Timeline</h2>
          <span className="timeline-count">Empty</span>
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
      <div className="timeline-header">
        <div className="timeline-title">
          <h2>📅 Timeline</h2>
          <p>Events in chronological order</p>
        </div>
        <div className="timeline-info">
          <span className="timeline-count">
            {sortedEvents.length} event{sortedEvents.length !== 1 ? 's' : ''}
          </span>
          <span className="timeline-span">
            {sortedEvents.length > 1 && (
              <>
                {new Date(sortedEvents[0].dateOccurred).getFullYear()} - {' '}
                {new Date(sortedEvents[sortedEvents.length - 1].dateOccurred).getFullYear()}
              </>
            )}
          </span>
        </div>
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
                    <div className="position-marker">
                      <span className="position-number">{index + 1}</span>
                    </div>
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
                    isRevealed={event.isRevealed || true}
                    size="medium"
                    onClick={() => onCardClick && onCardClick(event)}
                    className="timeline-card"
                  />
                  
                  <div className="timeline-connector">
                    <div className="connector-line"></div>
                  </div>
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
        
        {/* Timeline Legend */}
        <div className="timeline-legend">
          <div className="legend-item">
            <div className="legend-icon chronological">📅</div>
            <span>Chronological Order</span>
          </div>
          {highlightInsertionPoints && (
            <div className="legend-item">
              <div className="legend-icon insertion">+</div>
              <span>Drop Zones</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Timeline;