import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import * as animationsModule from '../utils/animation';
import { TIMING } from '../constants/gameConstants';
import useWrongPlacementAnimation from './useWrongPlacementAnimation';

describe('useWrongPlacementAnimation', () => {
  let timelineRef, insertionRefs, wrongPlacementMock, cleanupMock;
  function createMockElement(id) {
    return {
      id,
      classList: {
        remove: vi.fn(),
        add: vi.fn(),
      },
    };
  }
  beforeEach(() => {
    wrongPlacementMock = vi.fn();
    cleanupMock = vi.fn();
    vi.spyOn(animationsModule, 'animations', 'get').mockReturnValue({
      wrongPlacement: wrongPlacementMock,
      cleanup: cleanupMock,
    });
    timelineRef = { current: createMockElement('timeline') };
    insertionRefs = {
      current: new Map([[1, createMockElement('insertion-1')]]),
    };
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should trigger wrong placement animation and cleanup', () => {
    const { result } = renderHook(() =>
      useWrongPlacementAnimation({ timelineRef, insertionRefs })
    );
    act(() => {
      result.current.triggerWrongPlacement(1);
    });
    expect(wrongPlacementMock).toHaveBeenCalledWith(
      null,
      timelineRef.current,
      insertionRefs.current.get(1)
    );
    // Fast-forward timer
    act(() => {
      vi.advanceTimersByTime(TIMING.WRONG_PLACEMENT_INDICATOR);
    });
    expect(cleanupMock).toHaveBeenCalledWith(insertionRefs.current.get(1));
    expect(cleanupMock).toHaveBeenCalledWith(timelineRef.current);
  });

  it('should cleanup all animations', () => {
    const { result } = renderHook(() =>
      useWrongPlacementAnimation({ timelineRef, insertionRefs })
    );
    act(() => {
      result.current.cleanupAnimations();
    });
    expect(cleanupMock).toHaveBeenCalledWith(timelineRef.current);
    expect(cleanupMock).toHaveBeenCalledWith(insertionRefs.current.get(1));
  });

  it('should do nothing if timelineRef is not set', () => {
    const emptyTimelineRef = { current: null };
    const { result } = renderHook(() =>
      useWrongPlacementAnimation({
        timelineRef: emptyTimelineRef,
        insertionRefs,
      })
    );
    act(() => {
      result.current.triggerWrongPlacement(1);
      result.current.cleanupAnimations();
    });
    // No error should be thrown
  });
});
