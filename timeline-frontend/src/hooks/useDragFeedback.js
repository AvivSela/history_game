import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Enhanced drag and drop feedback hook
 * Provides visual feedback including ghost card, lift animations, and snap effects
 */
export const useDragFeedback = () => {
  const [dragState, setDragState] = useState({
    isDragging: false,
    isLifting: false,
    draggedItem: null,
    dragOffset: { x: 0, y: 0 },
    ghostPosition: { x: 0, y: 0 },
    dropZone: null,
    dragStartTime: null
  });

  const ghostCardRef = useRef(null);
  const dragElementRef = useRef(null);
  const animationFrameRef = useRef(null);
  const timeoutRef = useRef(null);

  // Create ghost card element
  const createGhostCard = useCallback((originalElement) => {
    const ghost = originalElement.cloneNode(true);
    ghost.className = 'ghost-card-preview';
    ghost.style.position = 'fixed';
    ghost.style.pointerEvents = 'none';
    ghost.style.zIndex = '9999';
    ghost.style.opacity = '0.7';
    ghost.style.transform = 'rotate(5deg)';
    ghost.style.transition = 'none';
    
    // Add visual enhancements
    const cardElement = ghost.querySelector('.card');
    if (cardElement) {
      cardElement.style.border = '2px dashed #3498db';
      cardElement.style.background = 'rgba(255, 255, 255, 0.9)';
      cardElement.style.backdropFilter = 'blur(2px)';
    }
    
    document.body.appendChild(ghost);
    return ghost;
  }, []);

  // Update ghost card position
  const updateGhostPosition = useCallback((x, y) => {
    if (ghostCardRef.current) {
      const transform = `translate(${x - dragState.dragOffset.x}px, ${y - dragState.dragOffset.y}px) rotate(5deg)`;
      ghostCardRef.current.style.transform = transform;
    }
  }, [dragState.dragOffset]);

  // Handle mouse move during drag
  const handleMouseMove = useCallback((e) => {
    if (!dragState.isDragging) return;
    
    const newPosition = { x: e.clientX, y: e.clientY };
    setDragState(prev => ({ ...prev, ghostPosition: newPosition }));
    updateGhostPosition(newPosition.x, newPosition.y);
  }, [dragState.isDragging, updateGhostPosition]);

  // Handle drag start with lift animation
  const handleDragStart = useCallback((item, event) => {
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    
    // Calculate offset from mouse to element center
    const offsetX = event.clientX - rect.left - rect.width / 2;
    const offsetY = event.clientY - rect.top - rect.height / 2;
    
    // Start lift animation
    setDragState(prev => ({
      ...prev,
      isLifting: true,
      draggedItem: item,
      dragOffset: { x: offsetX, y: offsetY },
      dragStartTime: Date.now()
    }));
    
    // Add lift class
    element.classList.add('drag-lifting');
    
    // Add body class for global cursor change
    document.body.classList.add('dragging-active');
    
    // After lift animation, start dragging
    timeoutRef.current = setTimeout(() => {
      element.classList.remove('drag-lifting');
      element.classList.add('dragging');
      
      // Create ghost card
      const ghost = createGhostCard(element);
      ghostCardRef.current = ghost;
      
      // Set initial ghost position
      updateGhostPosition(event.clientX, event.clientY);
      
      setDragState(prev => ({
        ...prev,
        isDragging: true,
        isLifting: false,
        ghostPosition: { x: event.clientX, y: event.clientY }
      }));
      
      // Add mouse move listener
      document.addEventListener('mousemove', handleMouseMove);
      
      // Hide default drag image
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', '');
        
        // Create transparent drag image
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext('2d');
        ctx.globalAlpha = 0.1;
        event.dataTransfer.setDragImage(canvas, 0, 0);
      }
    }, 200); // 200ms lift animation duration
    
    dragElementRef.current = element;
  }, [createGhostCard, updateGhostPosition, handleMouseMove]);

  // Handle drag end with snap animation
  const handleDragEnd = useCallback((wasSuccessful = false) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Remove mouse move listener
    document.removeEventListener('mousemove', handleMouseMove);
    
    // Remove ghost card
    if (ghostCardRef.current) {
      document.body.removeChild(ghostCardRef.current);
      ghostCardRef.current = null;
    }
    
    // Remove drag classes
    if (dragElementRef.current) {
      dragElementRef.current.classList.remove('drag-lifting', 'dragging');
      
      // Add snap animation
      if (wasSuccessful) {
        dragElementRef.current.classList.add('successful-drop');
        setTimeout(() => {
          if (dragElementRef.current) {
            dragElementRef.current.classList.remove('successful-drop');
          }
        }, 600);
      } else {
        dragElementRef.current.classList.add('snap-animation');
        setTimeout(() => {
          if (dragElementRef.current) {
            dragElementRef.current.classList.remove('snap-animation');
          }
        }, 300);
      }
    }
    
    // Remove body class
    document.body.classList.remove('dragging-active');
    
    // Reset state
    setDragState({
      isDragging: false,
      isLifting: false,
      draggedItem: null,
      dragOffset: { x: 0, y: 0 },
      ghostPosition: { x: 0, y: 0 },
      dropZone: null,
      dragStartTime: null
    });
    
    dragElementRef.current = null;
  }, [handleMouseMove]);

  // Handle drag over drop zones
  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    
    const dropZone = event.target.closest('[data-drop-zone]');
    if (dropZone) {
      const dropZoneId = dropZone.getAttribute('data-drop-zone');
      
      // Add visual feedback to drop zone
      dropZone.classList.add('drag-over');
      
      setDragState(prev => ({
        ...prev,
        dropZone: dropZoneId
      }));
    }
  }, []);

  // Handle drag leave drop zones
  const handleDragLeave = useCallback((event) => {
    const dropZone = event.target.closest('[data-drop-zone]');
    if (dropZone) {
      dropZone.classList.remove('drag-over');
    }
    
    setDragState(prev => ({
      ...prev,
      dropZone: null
    }));
  }, []);

  // Handle drop with success animation
  const handleDrop = useCallback((event) => {
    event.preventDefault();
    
    const dropZone = event.target.closest('[data-drop-zone]');
    if (dropZone) {
      dropZone.classList.remove('drag-over');
      
      // Trigger successful drop animation
      handleDragEnd(true);
    } else {
      handleDragEnd(false);
    }
  }, [handleDragEnd]);

  // Get drag props for draggable elements
  const getDragProps = useCallback((item) => ({
    draggable: true,
    className: `card-container draggable ${dragState.isDragging && dragState.draggedItem?.id === item?.id ? 'dragging' : ''} ${dragState.isLifting && dragState.draggedItem?.id === item?.id ? 'drag-lifting' : ''}`,
    onDragStart: (event) => handleDragStart(item, event),
    onDragEnd: () => handleDragEnd(false)
  }), [dragState, handleDragStart, handleDragEnd]);

  // Get drop props for drop zones
  const getDropProps = useCallback((dropZoneId) => ({
    'data-drop-zone': dropZoneId,
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop,
    className: `insertion-point ${dragState.dropZone === dropZoneId ? 'drag-over' : ''}`
  }), [dragState.dropZone, handleDragOver, handleDragLeave, handleDrop]);

  // Check if item is being dragged
  const isItemDragging = useCallback((item) => {
    return dragState.isDragging && dragState.draggedItem?.id === item?.id;
  }, [dragState.isDragging, dragState.draggedItem]);

  // Cleanup on unmount
  useEffect(() => {
    const currentAnimationFrame = animationFrameRef.current;
    const currentTimeout = timeoutRef.current;
    const currentGhostCard = ghostCardRef.current;
    
    return () => {
      if (currentTimeout) {
        clearTimeout(currentTimeout);
      }
      if (currentAnimationFrame) {
        cancelAnimationFrame(currentAnimationFrame);
      }
      if (currentGhostCard && document.body.contains(currentGhostCard)) {
        document.body.removeChild(currentGhostCard);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.body.classList.remove('dragging-active');
    };
  }, [handleMouseMove]);

  return {
    dragState,
    getDragProps,
    getDropProps,
    isItemDragging,
    handleDragEnd
  };
};

export default useDragFeedback;