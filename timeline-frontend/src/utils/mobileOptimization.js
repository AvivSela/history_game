// Mobile detection and optimization
export const mobileOptimization = {
  // Detect mobile device
  isMobile: () => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  },

  // Detect low-end device
  isLowEndDevice: () => {
    if (typeof navigator === 'undefined') return false;

    // Check for hardware concurrency (CPU cores)
    const cores = navigator.hardwareConcurrency || 1;

    // Check for device memory
    const memory = navigator.deviceMemory || 4;

    return cores <= 2 || memory <= 2;
  },

  // Adjust animation timing for mobile
  getMobileAnimationTiming: baseTiming => {
    if (mobileOptimization.isLowEndDevice()) {
      return baseTiming * 0.7; // Faster animations for low-end devices
    }
    if (mobileOptimization.isMobile()) {
      return baseTiming * 0.9; // Slightly faster for mobile
    }
    return baseTiming;
  },

  // Touch-friendly animation triggers
  addTouchSupport: (element, onTouch) => {
    if (!element) return;

    let touchStartTime = 0;
    const touchThreshold = 200; // ms

    element.addEventListener(
      'touchstart',
      () => {
        touchStartTime = Date.now();
      },
      { passive: true }
    );

    element.addEventListener(
      'touchend',
      () => {
        const touchDuration = Date.now() - touchStartTime;
        if (touchDuration < touchThreshold) {
          onTouch?.();
        }
      },
      { passive: true }
    );
  },
};
