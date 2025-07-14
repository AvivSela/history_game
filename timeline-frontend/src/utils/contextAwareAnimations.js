// Context-Aware Animation System
// Adjusts animation intensity based on user context and behavior patterns

// User context tracking
let userContext = {
  isFirstTime: true,
  hasErrors: false,
  isSuccess: false,
  interactionCount: 0,
  errorCount: 0,
  successCount: 0,
  lastInteractionTime: Date.now(),
  sessionDuration: 0,
  preferredIntensity: 'normal'
};

// Animation intensity multipliers
const INTENSITY_MULTIPLIERS = {
  subtle: 0.5,
  normal: 1.0,
  enhanced: 1.5,
  dramatic: 2.0
};

// Context-based intensity adjustments
const CONTEXT_INTENSITY_ADJUSTMENTS = {
  error: 1.2,      // More intense for errors
  success: 0.8,    // Subtle for success
  neutral: 1.0,    // Standard for neutral
  gameplay: 1.1,   // Slightly enhanced for gameplay
  tutorial: 1.3,   // More pronounced for tutorials
  celebration: 1.4 // Enhanced for celebrations
};

// Update user context
export const updateUserContext = (updates) => {
  userContext = { ...userContext, ...updates };
  
  // Update session duration
  const now = Date.now();
  userContext.sessionDuration = now - userContext.lastInteractionTime;
  userContext.lastInteractionTime = now;
  
  // Increment interaction count
  userContext.interactionCount++;
  
  // Analyze patterns for automatic intensity adjustment
  analyzeUserPatterns();
};

// Analyze user patterns for automatic intensity adjustment
const analyzeUserPatterns = () => {
  const { interactionCount, errorCount, successCount, sessionDuration } = userContext;
  
  // Adjust based on error rate
  const errorRate = errorCount / Math.max(interactionCount, 1);
  if (errorRate > 0.3) {
    // High error rate - reduce intensity to avoid frustration
    userContext.preferredIntensity = 'subtle';
  } else if (errorRate < 0.1 && successCount > 5) {
    // Low error rate and good success - can handle more intensity
    userContext.preferredIntensity = 'enhanced';
  }
  
  // Adjust based on session duration
  if (sessionDuration > 300000) { // 5 minutes
    // Long session - reduce intensity to prevent fatigue
    userContext.preferredIntensity = 'subtle';
  }
  
  // Adjust based on interaction frequency
  const interactionsPerMinute = interactionCount / (sessionDuration / 60000);
  if (interactionsPerMinute > 10) {
    // High interaction rate - reduce intensity for efficiency
    userContext.preferredIntensity = 'subtle';
  }
};

// Get animation intensity based on context
export const getAnimationIntensity = (context = 'neutral') => {
  const baseMultiplier = INTENSITY_MULTIPLIERS[userContext.preferredIntensity] || 1.0;
  const contextMultiplier = CONTEXT_INTENSITY_ADJUSTMENTS[context] || 1.0;
  
  return baseMultiplier * contextMultiplier;
};

// Get context-aware animation duration
export const getContextAwareDuration = (baseDuration, context = 'neutral') => {
  const intensity = getAnimationIntensity(context);
  return baseDuration * intensity;
};

// Get context-aware easing function
export const getContextAwareEasing = (context = 'neutral') => {
  const intensity = getAnimationIntensity(context);
  
  if (intensity < 0.8) {
    // Subtle animations - use smoother easing
    return 'cubic-bezier(0.4, 0, 0.2, 1)';
  } else if (intensity > 1.3) {
    // Dramatic animations - use more pronounced easing
    return 'cubic-bezier(0.68, -0.55, 0.265, 1.55)';
  } else {
    // Normal animations - use standard easing
    return 'cubic-bezier(0.36, 0, 0.66, 1)';
  }
};

// Track user interaction for context analysis
export const trackInteraction = (type, details = {}) => {
  switch (type) {
    case 'error':
      userContext.hasErrors = true;
      userContext.errorCount++;
      updateUserContext({ hasErrors: true, errorCount: userContext.errorCount });
      break;
      
    case 'success':
      userContext.isSuccess = true;
      userContext.successCount++;
      updateUserContext({ isSuccess: true, successCount: userContext.successCount });
      break;
      
    case 'gameplay':
      updateUserContext({ isFirstTime: false });
      break;
      
    case 'tutorial':
      updateUserContext({ isFirstTime: true });
      break;
      
    default:
      updateUserContext({});
  }
  
  // Store interaction details for analysis
  if (details) {
    userContext.lastInteractionDetails = details;
  }
};

// Get recommended animation settings for a specific context
export const getRecommendedAnimationSettings = (context = 'neutral') => {
  const intensity = getAnimationIntensity(context);
  const duration = getContextAwareDuration(400, context); // Base 400ms
  const easing = getContextAwareEasing(context);
  
  return {
    intensity,
    duration: Math.round(duration),
    easing,
    context,
    userPreferences: {
      preferredIntensity: userContext.preferredIntensity,
      interactionCount: userContext.interactionCount,
      errorRate: userContext.errorCount / Math.max(userContext.interactionCount, 1)
    }
  };
};

// Reset user context (useful for new sessions)
export const resetUserContext = () => {
  userContext = {
    isFirstTime: true,
    hasErrors: false,
    isSuccess: false,
    interactionCount: 0,
    errorCount: 0,
    successCount: 0,
    lastInteractionTime: Date.now(),
    sessionDuration: 0,
    preferredIntensity: 'normal'
  };
};

// Get current user context for debugging/analytics
export const getCurrentUserContext = () => {
  return { ...userContext };
};

// Context-aware animation class generator
export const generateContextAwareAnimationClass = (baseClass, context = 'neutral') => {
  const settings = getRecommendedAnimationSettings(context);
  
  return {
    className: `${baseClass}-${context}`,
    duration: settings.duration,
    easing: settings.easing,
    intensity: settings.intensity
  };
};

// Performance monitoring for context-aware animations
export const measureContextAwarePerformance = (context, animationName, startTime) => {
  const endTime = performance.now();
  const duration = endTime - startTime;
  const settings = getRecommendedAnimationSettings(context);
  
  // Log performance data with context
  console.log(`Animation ${animationName} (${context}):`, {
    actualDuration: duration.toFixed(2) + 'ms',
    recommendedDuration: settings.duration + 'ms',
    intensity: settings.intensity.toFixed(2),
    userContext: {
      interactionCount: userContext.interactionCount,
      errorRate: (userContext.errorCount / Math.max(userContext.interactionCount, 1)).toFixed(2),
      preferredIntensity: userContext.preferredIntensity
    }
  });
  
  return {
    duration,
    settings,
    performance: duration <= settings.duration ? 'optimal' : 'suboptimal'
  };
};

// Export constants for external use
export { INTENSITY_MULTIPLIERS, CONTEXT_INTENSITY_ADJUSTMENTS }; 