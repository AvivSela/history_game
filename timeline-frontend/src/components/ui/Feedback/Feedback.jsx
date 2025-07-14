import React, { useState, useEffect } from 'react';
import './Feedback.css';

const Feedback = ({ message, type, isVisible, onAnimationComplete }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible && !isAnimating) {
      setIsAnimating(true);
      // Animate feedback message appearance
      setTimeout(() => {
        setIsAnimating(false);
        onAnimationComplete?.();
      }, 2000);
    }
  }, [isVisible, isAnimating, onAnimationComplete]);

  if (!isVisible) return null;

  return (
    <div className={`feedback-message ${type} ${isVisible ? 'visible' : ''} ${isAnimating ? 'animating' : ''}`}>
      {message}
    </div>
  );
};

export default Feedback; 