# Settings Tests Fix Plan

## Current Issues

The following tests in `useGameState.test.js` are currently skipped due to mock implementation issues:

1. `updates when settings change`
2. `returns correct values from getGameSettings`
3. `falls back to default settings when settings manager is unavailable`
4. `handles errors gracefully when getting settings`

## Root Cause

The tests are failing due to incorrect mock setup:
1. Mock functions are not properly set up as spies
2. Mock implementation methods are not available
3. Mock instance creation needs to be improved

## Fix Plan

### 1. Update Mock Setup

```javascript
// Before test suite
const mockGetSettings = vi.fn();
const mockUpdateSetting = vi.fn();
const mockUpdateSettings = vi.fn();
const mockOnChange = vi.fn();

vi.mock('../utils/settingsManager.js', () => ({
  SettingsManager: vi.fn().mockImplementation(() => ({
    getSettings: mockGetSettings.mockReturnValue(defaultSettings),
    updateSetting: mockUpdateSetting.mockReturnValue(true),
    updateSettings: mockUpdateSettings.mockReturnValue(true),
    onChange: mockOnChange,
    isInitialized: true
  }))
}));

// In beforeEach
beforeEach(() => {
  vi.clearAllMocks();
  mockGetSettings.mockReturnValue(defaultSettings);
  mockUpdateSetting.mockReturnValue(true);
  mockUpdateSettings.mockReturnValue(true);
});
```

### 2. Update Test Implementation

```javascript
test('updates when settings change', async () => {
  const { result } = renderHook(() => useGameState());
  
  await act(async () => {
    const success = result.current.updateGameSetting('animations', false);
    expect(success).toBe(true);
  });

  expect(mockUpdateSetting).toHaveBeenCalledWith('animations', false);
});
```

### 3. Error Case Testing

```javascript
test('handles errors gracefully', async () => {
  mockGetSettings.mockImplementationOnce(() => {
    throw new Error('Test error');
  });
  
  const { result } = renderHook(() => useGameState());
  const settings = result.current.getGameSettings();
  
  expect(settings).toEqual(defaultSettings);
});
```

## Implementation Steps

1. Update mock setup in test file
2. Fix individual test implementations
3. Add proper cleanup in afterEach
4. Add test coverage for edge cases
5. Document mock usage pattern

## Success Criteria

1. All tests pass consistently
2. Mock functions are properly tracked
3. Error cases are properly tested
4. No test interference
5. Clear mock setup pattern

## Timeline

1. Mock setup update: 1 hour
2. Test fixes: 2 hours
3. Testing and validation: 1 hour
4. Documentation: 30 minutes

Total: ~4.5 hours

## Notes

- Keep existing test implementations as reference
- Consider creating a mock utility for settings manager
- Document mock patterns for future test development 