import React, { useState } from 'react';
import './Card.css';

const Card = ({ 
  event, 
  isDragging = false, 
  isSelected = false,
  size = 'medium',
  onClick,
  onDoubleClick,
  onMouseEnter,
  onMouseLeave,
  style = {},
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Determine if this is a timeline card
  const isTimelineCard = className.includes('timeline-card');

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get year only for timeline display
  const getYear = (dateString) => {
    return new Date(dateString).getFullYear();
  };

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      'History': '#e74c3c',
      'Science': '#3498db',
      'Technology': '#2ecc71',
      'Space': '#9b59b6',
      'Aviation': '#f39c12',
      'default': '#34495e'
    };
    return colors[category] || colors.default;
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    const icons = {
      'History': '📜',
      'Science': '🔬',
      'Technology': '💻',
      'Space': '🚀',
      'Aviation': '✈️',
      'default': '📋'
    };
    return icons[category] || icons.default;
  };

  // Handle card click
  const handleClick = (e) => {
    e.stopPropagation();
    
    if (onClick) {
      onClick(event, e);
    }
  };

  // Handle double click
  const handleDoubleClick = (e) => {
    e.stopPropagation();
    if (onDoubleClick) {
      onDoubleClick(event, e);
    }
  };

  // Handle mouse enter
  const handleMouseEnter = (e) => {
    setIsHovered(true);
    if (onMouseEnter) {
      onMouseEnter(event, e);
    }
  };

  // Handle mouse leave
  const handleMouseLeave = (e) => {
    setIsHovered(false);
    if (onMouseLeave) {
      onMouseLeave(event, e);
    }
  };

  // Build CSS classes
  const cardClasses = [
    'card-container',
    size,
    isDragging ? 'dragging' : '',
    isSelected ? 'selected' : '',
    isHovered ? 'hovered' : '',
    className
  ].filter(Boolean).join(' ');

  // Render player hand card content
  const renderPlayerHandContent = () => (
    <>
      <div className="card-header">
        <div 
          className="category-badge"
          style={{ backgroundColor: getCategoryColor(event.category) }}
        >
          {event.category}
        </div>
        <div className="difficulty-indicator">
          {Array.from({ length: event.difficulty }, (_, i) => (
            <span key={i} className="difficulty-star">★</span>
          ))}
        </div>
      </div>
      
      <div className="card-content">
        <h3 className="event-title">{event.title}</h3>
        {event.description && (
          <div className="event-description">
            <p>{event.description}</p>
          </div>
        )}
      </div>
      
      <div className="card-footer">
        <span className="mystery-date">When did this happen?</span>
      </div>
    </>
  );

  // Render timeline card content
  const renderTimelineContent = () => (
    <>
      <div className="card-header">
        <h3 className="event-title">{event.title}</h3>
        <div className="category-icon">
          {getCategoryIcon(event.category)}
        </div>
      </div>
      
      <div className="card-content">
        <div className="event-date">
          <span className="date-text">{formatDate(event.dateOccurred)}</span>
          <span className="year-highlight">
            {getYear(event.dateOccurred)}
          </span>
        </div>
        {event.description && (
          <div className="event-description">
            <p>{event.description}</p>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div 
      className={cardClasses}
      style={style}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="card">
        {isTimelineCard ? renderTimelineContent() : renderPlayerHandContent()}
      </div>
      
      {/* Selection indicator */}
      {isSelected && (
        <div className="selection-indicator">
          <div className="selection-ring"></div>
          <div className="selection-pulse"></div>
        </div>
      )}
      
      {/* Drag indicator */}
      {isDragging && (
        <div className="drag-indicator">
          <span className="drag-icon">✋</span>
        </div>
      )}
    </div>
  );
};

export default Card;