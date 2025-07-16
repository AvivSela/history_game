// --- CRITICAL GLOBAL MOCKS: performance.now and requestAnimationFrame ---
function mockNow() {
  return Date.now();
}
if (typeof globalThis !== 'undefined') {
  globalThis.performance = globalThis.performance || {};
  globalThis.performance.now = mockNow;
}
if (typeof global !== 'undefined') {
  global.performance = global.performance || {};
  global.performance.now = mockNow;
}
if (typeof window !== 'undefined') {
  window.performance = window.performance || {};
  window.performance.now = mockNow;
}
globalThis.requestAnimationFrame =
  globalThis.requestAnimationFrame || (cb => setTimeout(cb, 0));
globalThis.cancelAnimationFrame =
  globalThis.cancelAnimationFrame || (id => clearTimeout(id));
// --- END CRITICAL GLOBAL MOCKS ---

import '@testing-library/jest-dom';
import { beforeEach, afterEach, vi } from 'vitest';

// Create a proper DOM container for React Testing Library
beforeEach(() => {
  // Create a root div if it doesn't exist
  if (!document.getElementById('root')) {
    const root = document.createElement('div');
    root.id = 'root';
    document.body.appendChild(root);
  }

  // Clean up between tests
  document.body.innerHTML = '<div id="root"></div>';

  // Reset document classes
  document.body.className = '';
  document.documentElement.className = '';

  // Clear any pending timeouts and intervals
  vi.clearAllTimers();
});

// Clean up after each test
afterEach(() => {
  // Clear any pending timeouts and intervals
  vi.clearAllTimers();

  // Clear any pending requestAnimationFrame calls
  if (global.requestAnimationFrame && global.requestAnimationFrame.mockClear) {
    global.requestAnimationFrame.mockClear();
  }
  if (global.cancelAnimationFrame && global.cancelAnimationFrame.mockClear) {
    global.cancelAnimationFrame.mockClear();
  }
});

// Mock ResizeObserver
global.ResizeObserver = class {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock CSS.supports
global.CSS = {
  supports: () => true,
};

// Mock window.matchMedia
global.window.matchMedia = vi.fn(() => ({
  matches: false,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}));

// Mock performance.memory
global.performance.memory = {
  usedJSHeapSize: 1000000,
  totalJSHeapSize: 2000000,
  jsHeapSizeLimit: 4000000,
};

// Mock navigator.hardwareConcurrency
Object.defineProperty(global.navigator, 'hardwareConcurrency', {
  value: 4,
  writable: true,
});

// Mock navigator.deviceMemory
Object.defineProperty(global.navigator, 'deviceMemory', {
  value: 4,
  writable: true,
});

// Mock document.elementFromPoint
global.document.elementFromPoint = vi.fn(() => null);

// Mock getBoundingClientRect
Element.prototype.getBoundingClientRect = vi.fn(() => ({
  x: 0,
  y: 0,
  width: 100,
  height: 100,
  top: 0,
  right: 100,
  bottom: 100,
  left: 0,
  toJSON: () => {},
}));

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

// Mock getComputedStyle
global.getComputedStyle = vi.fn(() => ({
  getPropertyValue: vi.fn(() => ''),
  setProperty: vi.fn(),
}));
