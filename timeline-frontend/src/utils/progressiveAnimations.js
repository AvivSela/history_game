// Progressive Animation Loading System
// Loads animations dynamically based on user interaction and context

// Track which animations have been loaded
const loadedAnimations = new Set();
const animationLoadPromises = new Map();

// Animation definitions with their dependencies
const ANIMATION_DEFINITIONS = {
  'card-shake': {
    css: `
      @keyframes cardShake {
        0%, 100% { transform: translateX(0) translateZ(0); }
        10% { transform: translateX(-4px) translateZ(0); }
        20% { transform: translateX(4px) translateZ(0); }
        30% { transform: translateX(-4px) translateZ(0); }
        40% { transform: translateX(4px) translateZ(0); }
        50% { transform: translateX(-2px) translateZ(0); }
        60% { transform: translateX(2px) translateZ(0); }
        70% { transform: translateX(-1px) translateZ(0); }
        80% { transform: translateX(1px) translateZ(0); }
        90% { transform: translateX(-0.5px) translateZ(0); }
      }
      .card-shake {
        animation: cardShake 0.4s cubic-bezier(0.36, 0, 0.66, 1);
        animation-fill-mode: both;
      }
    `,
    priority: 'high',
    context: ['error', 'feedback']
  },
  
  'card-fade-out': {
    css: `
      @keyframes fadeOut {
        0% { opacity: 1; transform: scale(1) translateZ(0); }
        100% { opacity: 0; transform: scale(0.9) translateZ(0); }
      }
      .card-fade-out {
        animation: fadeOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      }
    `,
    priority: 'medium',
    context: ['removal', 'transition']
  },
  
  'card-bounce-in': {
    css: `
      @keyframes bounceIn {
        0% { opacity: 0; transform: scale(0.2) translateY(60px) translateZ(0); }
        50% { opacity: 1; transform: scale(1.1) translateY(-8px) translateZ(0); }
        100% { opacity: 1; transform: scale(1) translateY(0) translateZ(0); }
      }
      .card-bounce-in {
        animation: bounceIn 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        animation-fill-mode: both;
      }
    `,
    priority: 'high',
    context: ['addition', 'success']
  },
  
  'card-highlight': {
    css: `
      @keyframes highlight {
        0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.8); transform: scale(1) translateZ(0); }
        50% { box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.3); transform: scale(1.02) translateZ(0); }
        100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); transform: scale(1) translateZ(0); }
      }
      .card-highlight {
        animation: highlight 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }
    `,
    priority: 'medium',
    context: ['attention', 'success']
  },
  
  'wrong-placement': {
    css: `
      @keyframes wrongPlacement {
        0%, 100% { transform: translateX(0) scale(1) translateZ(0); opacity: 1; }
        10%, 30%, 50% { transform: translateX(-8px) scale(0.95) translateZ(0); opacity: 0.8; }
        20%, 40% { transform: translateX(8px) scale(0.95) translateZ(0); opacity: 0.8; }
        60% { transform: translateX(0) scale(0.9) translateZ(0); opacity: 0.6; }
        80% { transform: translateX(0) scale(0.8) translateZ(0); opacity: 0.3; }
        100% { transform: translateX(0) scale(0.7) translateZ(0); opacity: 0; }
      }
      .card-wrong-placement {
        animation: wrongPlacement 0.8s cubic-bezier(0.36, 0, 0.66, 1);
        animation-fill-mode: both;
      }
    `,
    priority: 'high',
    context: ['error', 'feedback']
  }
};

// Load animation CSS dynamically
const loadAnimationCSS = (animationName) => {
  if (loadedAnimations.has(animationName)) {
    return Promise.resolve();
  }

  // Check if already loading
  if (animationLoadPromises.has(animationName)) {
    return animationLoadPromises.get(animationName);
  }

  const definition = ANIMATION_DEFINITIONS[animationName];
  if (!definition) {
    console.warn(`Animation definition not found: ${animationName}`);
    return Promise.resolve();
  }

  const loadPromise = new Promise((resolve) => {
    // Create style element
    const style = document.createElement('style');
    style.textContent = definition.css;
    style.setAttribute('data-animation', animationName);
    
    // Add to document
    document.head.appendChild(style);
    
    // Mark as loaded
    loadedAnimations.add(animationName);
    
    // Resolve after a small delay to ensure CSS is applied
    setTimeout(resolve, 10);
  });

  animationLoadPromises.set(animationName, loadPromise);
  return loadPromise;
};

// Load animation if needed
export const loadAnimationIfNeeded = async (animationName) => {
  try {
    await loadAnimationCSS(animationName);
  } catch (error) {
    console.error(`Failed to load animation ${animationName}:`, error);
  }
};

// Load animations by context
export const loadAnimationsByContext = async (context) => {
  const animationsToLoad = [];
  
  Object.entries(ANIMATION_DEFINITIONS).forEach(([name, definition]) => {
    if (definition.context.includes(context)) {
      animationsToLoad.push(name);
    }
  });
  
  await Promise.all(animationsToLoad.map(loadAnimationIfNeeded));
};

// Load animations by priority
export const loadAnimationsByPriority = async (priority) => {
  const animationsToLoad = [];
  
  Object.entries(ANIMATION_DEFINITIONS).forEach(([name, definition]) => {
    if (definition.priority === priority) {
      animationsToLoad.push(name);
    }
  });
  
  await Promise.all(animationsToLoad.map(loadAnimationIfNeeded));
};

// Preload essential animations
export const preloadEssentialAnimations = async () => {
  await loadAnimationsByPriority('high');
};

// Get animation loading status
export const getAnimationLoadingStatus = () => {
  return {
    loaded: Array.from(loadedAnimations),
    loading: Array.from(animationLoadPromises.keys()),
    total: Object.keys(ANIMATION_DEFINITIONS).length,
    progress: (loadedAnimations.size / Object.keys(ANIMATION_DEFINITIONS).length) * 100
  };
};

// Context-aware animation loading
export const loadContextAwareAnimations = async (userContext) => {
  const contexts = [];
  
  // Determine contexts based on user behavior
  if (userContext.isFirstTime) {
    contexts.push('tutorial', 'introduction');
  }
  
  if (userContext.hasErrors) {
    contexts.push('error', 'feedback');
  }
  
  if (userContext.isSuccess) {
    contexts.push('success', 'celebration');
  }
  
  // Load animations for all relevant contexts
  await Promise.all(contexts.map(loadAnimationsByContext));
};

// Performance monitoring for animation loading
export const measureAnimationLoadPerformance = async (animationName) => {
  const startTime = performance.now();
  
  try {
    await loadAnimationIfNeeded(animationName);
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    if (duration > 50) {
      console.warn(`Animation ${animationName} took ${duration.toFixed(2)}ms to load`);
    }
    
    return duration;
  } catch (error) {
    console.error(`Animation loading failed: ${animationName}`, error);
    return -1;
  }
};

// Cleanup function to remove loaded animations
export const cleanupLoadedAnimations = () => {
  // Remove style elements
  document.querySelectorAll('style[data-animation]').forEach(style => {
    style.remove();
  });
  
  // Clear tracking
  loadedAnimations.clear();
  animationLoadPromises.clear();
};

// Export animation definitions for external use
export { ANIMATION_DEFINITIONS }; 