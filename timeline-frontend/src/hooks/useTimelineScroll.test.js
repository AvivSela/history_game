import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import useTimelineScroll from './useTimelineScroll';

describe('useTimelineScroll', () => {
  let timeline;
  beforeEach(() => {
    timeline = {
      scrollLeft: 100,
      scrollWidth: 1000,
      scrollTo: vi.fn(function ({ left }) {
        this.scrollLeft = left;
      }),
    };
  });

  it('should provide a ref', () => {
    const { result } = renderHook(() =>
      useTimelineScroll({ scrollAmount: 200 })
    );
    expect(result.current.timelineRef).toBeDefined();
  });

  it('should scroll left by scrollAmount', () => {
    const { result } = renderHook(() =>
      useTimelineScroll({ scrollAmount: 200 })
    );
    result.current.timelineRef.current = timeline;
    act(() => {
      result.current.scrollLeft();
    });
    expect(timeline.scrollTo).toHaveBeenCalledWith({
      left: -100,
      behavior: 'smooth',
    });
    expect(timeline.scrollLeft).toBe(-100);
  });

  it('should scroll right by scrollAmount', () => {
    const { result } = renderHook(() =>
      useTimelineScroll({ scrollAmount: 200 })
    );
    result.current.timelineRef.current = timeline;
    act(() => {
      result.current.scrollRight();
    });
    expect(timeline.scrollTo).toHaveBeenCalledWith({
      left: 300,
      behavior: 'smooth',
    });
    expect(timeline.scrollLeft).toBe(300);
  });

  it('should scroll to end (scrollWidth)', () => {
    const { result } = renderHook(() =>
      useTimelineScroll({ scrollAmount: 200 })
    );
    result.current.timelineRef.current = timeline;
    act(() => {
      result.current.scrollToEnd();
    });
    expect(timeline.scrollTo).toHaveBeenCalledWith({
      left: 1000,
      behavior: 'smooth',
    });
    expect(timeline.scrollLeft).toBe(1000);
  });

  it('should do nothing if ref is not set', () => {
    const { result } = renderHook(() =>
      useTimelineScroll({ scrollAmount: 200 })
    );
    // No error should be thrown
    act(() => {
      result.current.scrollLeft();
      result.current.scrollRight();
      result.current.scrollToEnd();
    });
  });
});
