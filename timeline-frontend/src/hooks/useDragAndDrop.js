import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Custom hook for drag and drop functionality
 * Provides a simpler alternative to react-dnd for our specific use case
 */
export const useDragAndDrop = () => {
  const [dragState, setDragState] = useState({
    isDragging: false,
    draggedItem: null,
    dragOffset: { x: 0, y: 0 },
    dropZone: null
  });

  const dragElementRef = useRef(null);
  const startPositionRef = useRef({ x: 0, y: 0 });
  const handlersRef = useRef({});

  // End dragging
  const handleDragEnd = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedItem: null,
      dragOffset: { x: 0, y: 0 },
      dropZone: null
    });

    // Remove global event listeners
    document.removeEventListener('dragover', handlersRef.current.handleDragOver);
    document.removeEventListener('drop', handlersRef.current.handleDrop);
    document.removeEventListener('dragend', handlersRef.current.handleDragEnd);
  }, []);

  // Handle drag over (for drop zones)
  const handleDragOver = useCallback((event) => {
    event.preventDefault(); // Allow drop
    
    // Find the closest drop zone
    const dropZone = event.target.closest('[data-drop-zone]');
    if (dropZone) {
      const dropZoneId = dropZone.getAttribute('data-drop-zone');
      setDragState(prev => ({
        ...prev,
        dropZone: dropZoneId
      }));
    } else {
      setDragState(prev => ({
        ...prev,
        dropZone: null
      }));
    }
  }, []);

  // Handle drop
  const handleDrop = useCallback((event) => {
    event.preventDefault();
    
    const dropZone = event.target.closest('[data-drop-zone]');
    if (dropZone && dragState.draggedItem) {
      const dropZoneId = dropZone.getAttribute('data-drop-zone');
      const dropData = dropZone.getAttribute('data-drop-data');
      
      // Call the drop handler if provided
      if (dropZone.onDrop) {
        dropZone.onDrop(dragState.draggedItem, dropZoneId, dropData);
      }
      
      // Dispatch custom event for drop
      const dropEvent = new CustomEvent('timelineCardDrop', {
        detail: {
          item: dragState.draggedItem,
          dropZone: dropZoneId,
          dropData: dropData ? JSON.parse(dropData) : null,
          position: { x: event.clientX, y: event.clientY }
        }
      });
      document.dispatchEvent(dropEvent);
    }

    handleDragEnd();
  }, [dragState.draggedItem, handleDragEnd]);

  // Store handlers in ref
  handlersRef.current = {
    handleDragOver,
    handleDrop,
    handleDragEnd
  };

  // Start dragging
  const handleDragStart = useCallback((item, event) => {
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    
    // Calculate offset from mouse to element center
    const offsetX = event.clientX - rect.left - rect.width / 2;
    const offsetY = event.clientY - rect.top - rect.height / 2;
    
    setDragState({
      isDragging: true,
      draggedItem: item,
      dragOffset: { x: offsetX, y: offsetY },
      dropZone: null
    });

    startPositionRef.current = { x: event.clientX, y: event.clientY };
    dragElementRef.current = element;

    // Add ghost image or hide default drag image
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', ''); // Required for drag to work
      
      // Create custom drag image
      const dragImage = element.cloneNode(true);
      dragImage.style.transform = 'rotate(8deg) scale(1.1)';
      dragImage.style.opacity = '0.8';
      document.body.appendChild(dragImage);
      event.dataTransfer.setDragImage(dragImage, rect.width / 2, rect.height / 2);
      
      // Remove the temporary element after a short delay
      setTimeout(() => {
        if (document.body.contains(dragImage)) {
          document.body.removeChild(dragImage);
        }
      }, 0);
    }

    // Add global event listeners
    document.addEventListener('dragover', handlersRef.current.handleDragOver);
    document.addEventListener('drop', handlersRef.current.handleDrop);
    document.addEventListener('dragend', handlersRef.current.handleDragEnd);
  }, []);

  // Check if item is being dragged
  const isItemDragging = useCallback((item) => {
    return dragState.isDragging && dragState.draggedItem?.id === item?.id;
  }, [dragState.isDragging, dragState.draggedItem]);

  // Get drag props for draggable elements
  const getDragProps = useCallback((item) => ({
    draggable: true,
    onDragStart: (event) => handleDragStart(item, event),
    'data-dragging': isItemDragging(item),
    style: {
      cursor: dragState.isDragging ? 'grabbing' : 'grab',
      opacity: isItemDragging(item) ? 0.5 : 1,
      transform: isItemDragging(item) ? 'rotate(8deg) scale(1.1)' : 'none',
      transition: dragState.isDragging ? 'none' : 'all 0.3s ease'
    }
  }), [dragState.isDragging, handleDragStart, isItemDragging]);

  // Get drop props for drop zones
  const getDropProps = useCallback((dropZoneId, dropData = null) => ({
    'data-drop-zone': dropZoneId,
    'data-drop-data': dropData ? JSON.stringify(dropData) : null,
    'data-drop-active': dragState.dropZone === dropZoneId,
    className: dragState.dropZone === dropZoneId ? 'drop-zone-active' : 'drop-zone',
    style: {
      transition: 'all 0.3s ease',
      opacity: dragState.isDragging ? 1 : 0.6,
      transform: dragState.dropZone === dropZoneId ? 'scale(1.05)' : 'scale(1)'
    }
  }), [dragState.isDragging, dragState.dropZone]);

  return {
    dragState,
    getDragProps,
    getDropProps,
    isItemDragging,
    handleDragEnd
  };
};

/**
 * Hook for listening to drop events
 * @param {Function} onDrop - Callback function when drop occurs
 */
export const useDropListener = (onDrop) => {
  const handleDrop = useCallback((event) => {
    if (onDrop) {
      onDrop(event.detail);
    }
  }, [onDrop]);

  // Set up event listener
  useEffect(() => {
    document.addEventListener('timelineCardDrop', handleDrop);
    return () => {
      document.removeEventListener('timelineCardDrop', handleDrop);
    };
  }, [handleDrop]);
};

/**
 * Touch-friendly drag and drop for mobile devices
 */
export const useTouchDragAndDrop = () => {
  const [touchState, setTouchState] = useState({
    isDragging: false,
    draggedItem: null,
    startPosition: { x: 0, y: 0 },
    currentPosition: { x: 0, y: 0 }
  });

  const handleTouchStart = useCallback((item, event) => {
    const touch = event.touches[0];
    setTouchState({
      isDragging: true,
      draggedItem: item,
      startPosition: { x: touch.clientX, y: touch.clientY },
      currentPosition: { x: touch.clientX, y: touch.clientY }
    });

    // Prevent scrolling while dragging
    event.preventDefault();
  }, []);

  const handleTouchMove = useCallback((event) => {
    if (!touchState.isDragging) return;

    const touch = event.touches[0];
    setTouchState(prev => ({
      ...prev,
      currentPosition: { x: touch.clientX, y: touch.clientY }
    }));

    // Prevent scrolling
    event.preventDefault();
  }, [touchState.isDragging]);

  const handleTouchEnd = useCallback((event) => {
    if (!touchState.isDragging) return;

    const touch = event.changedTouches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    const dropZone = element?.closest('[data-drop-zone]');

    if (dropZone && touchState.draggedItem) {
      const dropZoneId = dropZone.getAttribute('data-drop-zone');
      const dropData = dropZone.getAttribute('data-drop-data');

      // Dispatch drop event
      const dropEvent = new CustomEvent('timelineCardDrop', {
        detail: {
          item: touchState.draggedItem,
          dropZone: dropZoneId,
          dropData: dropData ? JSON.parse(dropData) : null,
          position: { x: touch.clientX, y: touch.clientY }
        }
      });
      document.dispatchEvent(dropEvent);
    }

    setTouchState({
      isDragging: false,
      draggedItem: null,
      startPosition: { x: 0, y: 0 },
      currentPosition: { x: 0, y: 0 }
    });
  }, [touchState.isDragging, touchState.draggedItem]);

  const getTouchDragProps = useCallback((item) => ({
    onTouchStart: (event) => handleTouchStart(item, event),
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    style: {
      position: touchState.isDragging && touchState.draggedItem?.id === item?.id ? 'fixed' : 'relative',
      left: touchState.isDragging && touchState.draggedItem?.id === item?.id ? 
        touchState.currentPosition.x - 80 : 'auto',
      top: touchState.isDragging && touchState.draggedItem?.id === item?.id ? 
        touchState.currentPosition.y - 115 : 'auto',
      zIndex: touchState.isDragging && touchState.draggedItem?.id === item?.id ? 9999 : 'auto',
      transform: touchState.isDragging && touchState.draggedItem?.id === item?.id ? 
        'rotate(8deg) scale(1.1)' : 'none',
      opacity: touchState.isDragging && touchState.draggedItem?.id === item?.id ? 0.8 : 1,
      pointerEvents: touchState.isDragging ? 'none' : 'auto'
    }
  }), [touchState, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    touchState,
    getTouchDragProps
  };
};