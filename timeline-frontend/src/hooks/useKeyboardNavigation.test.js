import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import useKeyboardNavigation from './useKeyboardNavigation';

describe('useKeyboardNavigation', () => {
  let insertionRefs, onSelect, focusMocks;
  beforeEach(() => {
    focusMocks = [vi.fn(), vi.fn(), vi.fn()];
    insertionRefs = {
      current: new Map([
        [0, { focus: focusMocks[0] }],
        [1, { focus: focusMocks[1] }],
        [2, { focus: focusMocks[2] }],
      ]),
    };
    onSelect = vi.fn();
  });

  it('should focus previous insertion point on ArrowLeft', () => {
    const { result } = renderHook(() =>
      useKeyboardNavigation({ insertionRefs, onSelect })
    );
    const event = { key: 'ArrowLeft', preventDefault: vi.fn() };
    act(() => {
      result.current.handleKeyDown(event, 1);
    });
    expect(focusMocks[0]).toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should focus next insertion point on ArrowRight', () => {
    const { result } = renderHook(() =>
      useKeyboardNavigation({ insertionRefs, onSelect })
    );
    const event = { key: 'ArrowRight', preventDefault: vi.fn() };
    act(() => {
      result.current.handleKeyDown(event, 1);
    });
    expect(focusMocks[2]).toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should wrap around to last on ArrowLeft from first', () => {
    const { result } = renderHook(() =>
      useKeyboardNavigation({ insertionRefs, onSelect })
    );
    const event = { key: 'ArrowLeft', preventDefault: vi.fn() };
    act(() => {
      result.current.handleKeyDown(event, 0);
    });
    expect(focusMocks[2]).toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should wrap around to first on ArrowRight from last', () => {
    const { result } = renderHook(() =>
      useKeyboardNavigation({ insertionRefs, onSelect })
    );
    const event = { key: 'ArrowRight', preventDefault: vi.fn() };
    act(() => {
      result.current.handleKeyDown(event, 2);
    });
    expect(focusMocks[0]).toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should call onSelect on Enter', () => {
    const { result } = renderHook(() =>
      useKeyboardNavigation({ insertionRefs, onSelect })
    );
    const event = { key: 'Enter', preventDefault: vi.fn() };
    act(() => {
      result.current.handleKeyDown(event, 1);
    });
    expect(onSelect).toHaveBeenCalledWith(1);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should call onSelect on Space', () => {
    const { result } = renderHook(() =>
      useKeyboardNavigation({ insertionRefs, onSelect })
    );
    const event = { key: ' ', preventDefault: vi.fn() };
    act(() => {
      result.current.handleKeyDown(event, 1);
    });
    expect(onSelect).toHaveBeenCalledWith(1);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should do nothing for unrelated keys', () => {
    const { result } = renderHook(() =>
      useKeyboardNavigation({ insertionRefs, onSelect })
    );
    const event = { key: 'Tab', preventDefault: vi.fn() };
    act(() => {
      result.current.handleKeyDown(event, 1);
    });
    expect(focusMocks[0]).not.toHaveBeenCalled();
    expect(focusMocks[1]).not.toHaveBeenCalled();
    expect(focusMocks[2]).not.toHaveBeenCalled();
    expect(onSelect).not.toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled();
  });
});
