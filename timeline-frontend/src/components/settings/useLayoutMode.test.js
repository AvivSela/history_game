import { renderHook, act } from '@testing-library/react';
import { useLayoutMode } from './useLayoutMode';

describe('useLayoutMode', () => {
  const originalInnerWidth = window.innerWidth;

  afterEach(() => {
    // Reset window.innerWidth after each test
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: originalInnerWidth,
    });
  });

  it('returns compact layout for mobile screens (<768px)', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 767,
    });

    const { result } = renderHook(() => useLayoutMode());
    expect(result.current).toBe('compact');
  });

  it('returns list layout for tablet screens (768px-1024px)', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 800,
    });

    const { result } = renderHook(() => useLayoutMode());
    expect(result.current).toBe('list');
  });

  it('returns grid layout for desktop screens (>1024px)', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 1025,
    });

    const { result } = renderHook(() => useLayoutMode());
    expect(result.current).toBe('grid');
  });

  it('updates layout on window resize', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 1025,
    });

    const { result } = renderHook(() => useLayoutMode());
    expect(result.current).toBe('grid');

    // Simulate resize to tablet size
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 800,
      });
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current).toBe('list');
  });
});
