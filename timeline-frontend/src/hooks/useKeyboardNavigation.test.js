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

  // Additional tests moved to behavior tests - see src/tests/behavior/gameBehavior.test.jsx
});
