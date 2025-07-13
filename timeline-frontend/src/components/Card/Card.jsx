import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { cleanupAnimations } from '../../utils/animationUtils';

const Card = forwardRef(({ 
  event, 
  isSelected = false,
  isAnimating = false, 
  isNewCard = false, 
  size = 'medium',
  onClick,
  onDoubleClick,
  onMouseEnter,
  onMouseLeave,
  style = {},
  className = '',
  ...props 
}, ref) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);
  
  // Combine refs
  useEffect(() => {
    if (ref) {
      if (typeof ref === 'function') {
        ref(cardRef.current);
      } else {
        ref.current = cardRef.current;
      }
    }
  }, [ref]);

  // Cleanup animations on unmount
  useEffect(() => {
    const currentRef = cardRef.current;
    return () => {
      if (currentRef) {
        cleanupAnimations(currentRef);
      }
    };
  }, []);

  // Determine if this is a timeline card
  const isTimelineCard = className.includes('timeline-card');

  // Get category class for color coding
  const getCategoryClass = (category) => {
    const categoryMap = {
      'Military': 'text-accent',
      'Disaster': 'text-warning', 
      'Political': 'text-primary',
      'Cultural': 'text-success',
      'Science': 'text-secondary',
      'Technology': 'text-secondary',
      'Space': 'text-secondary',
      'Aviation': 'text-secondary',
      'History': 'text-success',
      'default': 'text-success'
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

  // Generate dynamic classes
  const cardClasses = [
    'cursor-pointer transition-transform duration-300 transition-filter duration-300 relative select-none',
    size === 'small' ? 'w-44 h-60' : size === 'large' ? 'w-64 h-80' : 'w-55 h-75',
    isSelected ? '-translate-y-3 z-50' : '',
    isHovered ? 'scale-105 -translate-y-2' : '',
    isTimelineCard ? 'timeline-card' : 'player-hand-card',
    isAnimating && 'card-animating',
    isNewCard && 'new-card',
    className
  ].filter(Boolean).join(' ');

  // Generate dynamic styles
  const cardStyles = {
    '--card-id': event.id,
    '--animation-state': isAnimating ? 'running' : 'paused',
    '--selection-state': isSelected ? 'selected' : 'unselected',
    ...style
  };

  // Render player hand card content with new design
  const renderPlayerHandContent = () => (
    <>
      <div className="bg-gray-50 p-2 flex justify-between items-center text-gray-800 flex-shrink-0 border-b border-gray-200">
        <div className="flex gap-1 items-center">
          {Array.from({ length: event.difficulty }, (_, i) => (
            <span key={i} className="text-lg text-star drop-shadow-sm">★</span>
          ))}
        </div>
        <div className={`flex items-center gap-1.5 bg-black/5 rounded-xl px-2 py-1 border border-gray-200 ${getCategoryClass(event.category)}`}>
          <div className="text-sm">{getCategoryIcon(event.category)}</div>
          <div className="text-[10px] uppercase tracking-wider font-bold text-gray-800 drop-shadow-sm">{event.category}</div>
        </div>
      </div>
      
      <div className="font-card text-sm font-bold text-gray-800 text-center leading-tight px-3 py-2.5 pb-1 border-b border-gray-200 bg-white m-0 flex-shrink-0 drop-shadow-sm overflow-hidden">
        <div className="line-clamp-2">{event.title}</div>
      </div>
      
      <div className="bg-white border-t border-gray-200 px-3 py-4 flex-grow flex flex-col">
        <div className="font-card text-xs font-bold text-gray-800 uppercase tracking-wider text-center mb-2.5 drop-shadow-sm">Event Description</div>
        <div className="font-card text-xs text-gray-800 leading-relaxed text-justify flex-grow overflow-hidden">
          <div className="line-clamp-3">
            {event.description || 'A significant historical event that shaped the course of history.'}
          </div>
        </div>
      </div>
    </>
  );

  // Render timeline card content with same design as player hand
  const renderTimelineContent = () => (
    <>
      <div className="bg-gray-50 p-2 flex justify-between items-center text-gray-800 flex-shrink-0 border-b border-gray-200">
        <div className="flex gap-1 items-center">
          {Array.from({ length: event.difficulty }, (_, i) => (
            <span key={i} className="text-lg text-star drop-shadow-sm">★</span>
          ))}
        </div>
        <div className={`flex items-center gap-1.5 bg-black/5 rounded-xl px-2 py-1 border border-gray-200 ${getCategoryClass(event.category)}`}>
          <div className="text-sm">{getCategoryIcon(event.category)}</div>
          <div className="text-[10px] uppercase tracking-wider font-bold text-gray-800 drop-shadow-sm">{event.category}</div>
        </div>
      </div>
      
      <div className="font-card text-sm font-bold text-gray-800 text-center leading-tight px-3 py-2.5 pb-1 border-b border-gray-200 bg-white m-0 flex-shrink-0 drop-shadow-sm overflow-hidden">
        <div className="line-clamp-2">{event.title}</div>
      </div>
      
      <div className="bg-white border-t border-gray-200 px-3 py-4 flex-grow flex flex-col">
        <div className="font-card text-xs font-bold text-gray-800 uppercase tracking-wider text-center mb-2.5 drop-shadow-sm">Event Description</div>
        <div className="font-card text-xs text-gray-800 leading-relaxed text-justify flex-grow overflow-hidden">
          <div className="line-clamp-3">
            {event.description || 'A significant historical event that shaped the course of history.'}
          </div>
        </div>
      </div>
    </>
  );

  
  return (
    <div 
      ref={cardRef}
      className={`${cardClasses} ${isSelected ? 'border-success border-2' : 'border-gray-200'}`}
      style={cardStyles}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="button"
      tabIndex={0}
      aria-label={`${event.title} - ${new Date(event.dateOccurred).getFullYear()}`}
      aria-selected={isSelected}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick(e);
        }
      }}
      {...props}
    >
      <div className="relative w-full h-full rounded-card shadow-lg bg-card border border-gray-200 flex flex-col p-0 box-border overflow-visible transition-all duration-300 hover:shadow-xl">
        {isTimelineCard ? renderTimelineContent() : renderPlayerHandContent()}
        
        {/* Animation overlay for visual effects */}
        {isAnimating && (
          <div className="card-animation-overlay" aria-hidden="true" />
        )}
      </div>
    </div>
  );
});

Card.displayName = 'Card';

export default Card;