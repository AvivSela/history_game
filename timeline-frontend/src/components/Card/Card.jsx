import React, { useState } from 'react';
import './Card.css';

const Card = ({ 
  event, 
 
  isSelected = false,
  size = 'medium',
  onClick,
  onDoubleClick,
  onMouseEnter,
  onMouseLeave,
  style = {},
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Determine if this is a timeline card
  const isTimelineCard = className.includes('timeline-card');

  // Remove unused date formatting functions since new design doesn't show dates on cards

  // Get category class for color coding
  const getCategoryClass = (category) => {
    const categoryMap = {
      'Military': 'category-military',
      'Disaster': 'category-disaster', 
      'Political': 'category-political',
      'Cultural': 'category-cultural',
      'Science': 'category-scientific',
      'Technology': 'category-scientific',
      'Space': 'category-scientific',
      'Aviation': 'category-scientific',
      'History': 'category-cultural',
      'default': 'category-cultural'
    };
    return categoryMap[category] || categoryMap.default;
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    const icons = {
      'Military': '⚔️',
      'Disaster': '🔥',
      'Political': '🏛️',
      'Cultural': '📜',
      'Science': '🔬',
      'Technology': '🔬',
      'Space': '🔬',
      'Aviation': '🔬',
      'History': '📜',
      'default': '📜'
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
    isSelected ? 'selected' : '',
    isHovered ? 'hovered' : '',
    isTimelineCard ? 'timeline-card' : 'player-hand-card',
    className
  ].filter(Boolean).join(' ');

  // Render player hand card content with new design
  const renderPlayerHandContent = () => (
    <>
      <div className="card-header">
        <div className="difficulty-stars">
          {Array.from({ length: event.difficulty }, (_, i) => (
            <span key={i} className="difficulty-star">★</span>
          ))}
        </div>
        <div className={`category-section ${getCategoryClass(event.category)}`}>
          <div className="category-icon">{getCategoryIcon(event.category)}</div>
          <div className="category-name">{event.category}</div>
        </div>
      </div>
      
      <div className="card-title">{event.title}</div>
      
      <div className="card-mechanics">
        <div className="mechanic-title">Event Description</div>
        <div className="mechanic-text">
          {event.description || 'A significant historical event that shaped the course of history.'}
        </div>
      </div>
    </>
  );

  // Render timeline card content with same design as player hand
  const renderTimelineContent = () => (
    <>
      <div className="card-header">
        <div className="difficulty-stars">
          {Array.from({ length: event.difficulty }, (_, i) => (
            <span key={i} className="difficulty-star">★</span>
          ))}
        </div>
        <div className={`category-section ${getCategoryClass(event.category)}`}>
          <div className="category-icon">{getCategoryIcon(event.category)}</div>
          <div className="category-name">{event.category}</div>
        </div>
      </div>
      
      <div className="card-title">{event.title}</div>
      
      <div className="card-mechanics">
        <div className="mechanic-title">Event Description</div>
        <div className="mechanic-text">
          {event.description || 'A significant historical event that shaped the course of history.'}
        </div>
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
      
    </div>
  );
};

export default Card;