// Optimized CSS Keyframes with GPU Acceleration
// All animations use translateZ(0) for GPU acceleration and will-change for optimization

export const OPTIMIZED_KEYFRAMES = {
  // Card shake animation - optimized for performance
  cardShake: `
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
  `,

  // Card fade out animation - optimized
  cardFadeOut: `
    @keyframes cardFadeOut {
      0% { opacity: 1; transform: scale(1) translateZ(0); }
      100% { opacity: 0; transform: scale(0.9) translateZ(0); }
    }
  `,

  // Card bounce in animation - optimized
  cardBounceIn: `
    @keyframes cardBounceIn {
      0% { opacity: 0; transform: scale(0.2) translateY(60px) translateZ(0); }
      50% { opacity: 1; transform: scale(1.1) translateY(-8px) translateZ(0); }
      100% { opacity: 1; transform: scale(1) translateY(0) translateZ(0); }
    }
  `,

  // Card highlight animation - optimized
  cardHighlight: `
    @keyframes cardHighlight {
      0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.8); transform: scale(1) translateZ(0); }
      50% { box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.3); transform: scale(1.02) translateZ(0); }
      100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); transform: scale(1) translateZ(0); }
    }
  `,

  // Wrong placement animation - optimized
  wrongPlacement: `
    @keyframes wrongPlacement {
      0%, 100% { transform: translateX(0) scale(1) translateZ(0); opacity: 1; }
      10%, 30%, 50% { transform: translateX(-8px) scale(0.95) translateZ(0); opacity: 0.8; }
      20%, 40% { transform: translateX(8px) scale(0.95) translateZ(0); opacity: 0.8; }
      60% { transform: translateX(0) scale(0.9) translateZ(0); opacity: 0.6; }
      80% { transform: translateX(0) scale(0.8) translateZ(0); opacity: 0.3; }
      100% { transform: translateX(0) scale(0.7) translateZ(0); opacity: 0; }
    }
  `,

  // Timeline shake animation - optimized
  timelineShake: `
    @keyframes timelineShake {
      0%, 100% { transform: translateX(0) translateZ(0); }
      10% { transform: translateX(-6px) translateZ(0); }
      20% { transform: translateX(6px) translateZ(0); }
      30% { transform: translateX(-6px) translateZ(0); }
      40% { transform: translateX(6px) translateZ(0); }
      50% { transform: translateX(-3px) translateZ(0); }
      60% { transform: translateX(3px) translateZ(0); }
      70% { transform: translateX(-1px) translateZ(0); }
      80% { transform: translateX(1px) translateZ(0); }
      90% { transform: translateX(-0.5px) translateZ(0); }
    }
  `,

  // Insertion point error animation - optimized
  insertionPointError: `
    @keyframes insertionPointError {
      0%, 100% { transform: scale(1) translateZ(0); opacity: 1; }
      25% { transform: scale(1.1) translateZ(0); opacity: 0.8; }
      50% { transform: scale(0.9) translateZ(0); opacity: 0.6; }
      75% { transform: scale(1.05) translateZ(0); opacity: 0.9; }
    }
  `,

  // Quick feedback animation - optimized
  quickFeedback: `
    @keyframes quickFeedback {
      0% { transform: scale(1) translateZ(0); }
      50% { transform: scale(1.05) translateZ(0); }
      100% { transform: scale(1) translateZ(0); }
    }
  `,

  // Loading animation - optimized
  loading: `
    @keyframes loading {
      0% { transform: rotate(0deg) translateZ(0); }
      100% { transform: rotate(360deg) translateZ(0); }
    }
  `,
};

// Optimized CSS classes with GPU acceleration
export const OPTIMIZED_CLASSES = {
  // Base animation class with GPU acceleration
  animatedElement: `
    .animated-element {
      transform: translateZ(0);
      will-change: transform, opacity;
      backface-visibility: hidden;
      perspective: 1000px;
    }
  `,

  // Card shake class
  cardShake: `
    .card-shake {
      animation: cardShake 0.4s cubic-bezier(0.36, 0, 0.66, 1);
      animation-fill-mode: both;
      transform: translateZ(0);
      will-change: transform;
    }
  `,

  // Card fade out class
  cardFadeOut: `
    .card-fade-out {
      animation: cardFadeOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      transform: translateZ(0);
      will-change: transform, opacity;
    }
  `,

  // Card bounce in class
  cardBounceIn: `
    .card-bounce-in {
      animation: cardBounceIn 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      animation-fill-mode: both;
      transform: translateZ(0);
      will-change: transform, opacity;
    }
  `,

  // Card highlight class
  cardHighlight: `
    .card-highlight {
      animation: cardHighlight 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      transform: translateZ(0);
      will-change: transform, box-shadow;
    }
  `,

  // Wrong placement class
  wrongPlacement: `
    .card-wrong-placement {
      animation: wrongPlacement 0.8s cubic-bezier(0.36, 0, 0.66, 1);
      animation-fill-mode: both;
      transform: translateZ(0);
      will-change: transform, opacity;
    }
  `,

  // Timeline shake class
  timelineShake: `
    .timeline-wrong-placement {
      animation: timelineShake 0.6s cubic-bezier(0.36, 0, 0.66, 1);
      transform: translateZ(0);
      will-change: transform;
    }
  `,

  // Insertion point error class
  insertionPointError: `
    .insertion-point-error {
      animation: insertionPointError 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      transform: translateZ(0);
      will-change: transform, opacity;
    }
  `,

  // Quick feedback class
  quickFeedback: `
    .quick-feedback {
      animation: quickFeedback 0.1s cubic-bezier(0.4, 0, 0.2, 1);
      transform: translateZ(0);
      will-change: transform;
    }
  `,

  // Loading class
  loading: `
    .loading {
      animation: loading 1s linear infinite;
      transform: translateZ(0);
      will-change: transform;
    }
  `,
};

// Generate all CSS for injection
export const generateOptimizedCSS = () => {
  let css = '';

  // Add keyframes
  Object.values(OPTIMIZED_KEYFRAMES).forEach(keyframe => {
    css += keyframe + '\n';
  });

  // Add classes
  Object.values(OPTIMIZED_CLASSES).forEach(className => {
    css += className + '\n';
  });

  return css;
};
