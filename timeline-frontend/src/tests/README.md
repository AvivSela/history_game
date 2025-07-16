# Testing Best Practices

This directory contains robust testing utilities and mocks that follow best practices to prevent test failures when code changes.

## 🎯 **Key Principles**

### 1. **Centralized Mocks**

- All mocks are defined in `__mocks__/` directory
- Single source of truth for mock behavior
- Easy to update when real modules change

### 2. **Flexible Mock Structure**

- Mocks adapt to changes in real modules
- No tight coupling to specific implementation details
- Graceful handling of missing properties

### 3. **Consistent Test Setup**

- Common setup utilities in `utils/testSetup.js`
- Standardized mock initialization
- Easy cleanup between tests

## 📁 **File Structure**

```
src/tests/
├── __mocks__/
│   ├── api.js              # Centralized API mock
│   └── gameConstants.js    # Centralized constants mock
├── utils/
│   └── testSetup.js        # Common test utilities
└── README.md              # This file
```

## 🚀 **Usage Examples**

### Basic Test Setup

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { setupCommonMocks, resetAllMocks } from '../tests/utils/testSetup';
import { apiMock } from '../tests/__mocks__/api';

// Setup common mocks
setupCommonMocks();

describe('My Component', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  it('should work with default mocks', () => {
    // Your test here
  });
});
```

### Customizing API Responses

```javascript
it('should handle specific API response', () => {
  // Setup custom response
  apiMock.setResponse('getRandomEvents', {
    data: [{ id: 'custom', title: 'Custom Event' }],
  });

  // Your test here
});
```

### Testing Error Scenarios

```javascript
it('should handle API errors', () => {
  // Setup error response
  apiMock.setError('getRandomEvents', new Error('Network Error'));

  // Your test here
});
```

### Creating Mock Data

```javascript
import {
  createMockGameState,
  createMockEvents,
} from '../tests/utils/testSetup';

it('should work with mock data', () => {
  const mockState = createMockGameState({
    gameStatus: 'playing',
    score: 100,
  });

  const mockEvents = createMockEvents(3);

  // Your test here
});
```

## 🔧 **Mock Configuration**

### API Mock (`__mocks__/api.js`)

The API mock provides:

- **Default responses** for all API methods
- **Flexible response customization** via `setResponse()`
- **Error simulation** via `setError()`
- **Automatic cleanup** via `reset()`

```javascript
// Available methods
apiMock.gameAPI.getRandomEvents();
apiMock.gameAPI.getAllEvents();
apiMock.gameAPI.getEventsByCategory();
apiMock.gameAPI.getEventsByDifficulty();
apiMock.gameAPI.getCategories();
apiMock.gameAPI.healthCheck();

// Helper functions
apiMock.extractData();
apiMock.handleAPIError();

// Utility methods
apiMock.reset();
apiMock.setResponse(method, response);
apiMock.setError(method, error);
```

### Game Constants Mock (`__mocks__/gameConstants.js`)

Provides consistent game constants:

- `GAME_STATUS`
- `PLAYER_TYPES`
- `CARD_COUNTS`
- `API` configuration

## 🛠 **Test Utilities (`utils/testSetup.js`)**

### Setup Functions

- `setupCommonMocks()` - Initialize all common mocks
- `resetAllMocks()` - Clean up all mocks between tests

### Data Creation

- `createMockGameState(overrides)` - Create mock game state
- `createMockEvents(count)` - Create mock events

### API Configuration

- `setupAPIResponses(responses)` - Set multiple API responses
- `setupAPIErrors(errors)` - Set multiple API errors

### Utilities

- `waitForAsync(ms)` - Wait for async operations
- `mockConsole()` - Mock console methods

## ✅ **Benefits**

1. **Resilient to Changes**
   - Mocks don't break when implementation changes
   - Flexible structure adapts to new properties

2. **Consistent Behavior**
   - All tests use the same mock data
   - Predictable responses across test suites

3. **Easy Maintenance**
   - Single place to update mock behavior
   - Clear documentation of mock capabilities

4. **Better Test Isolation**
   - Proper cleanup between tests
   - No test interference

## 🚨 **Common Pitfalls to Avoid**

### ❌ **Don't Do This**

```javascript
// Fragile - breaks when API structure changes
vi.mock('../utils/api', () => ({
  gameAPI: {
    getRandomEvents: vi.fn().mockResolvedValue({ data: mockEvents }),
  },
}));

// Tight coupling to implementation
expect(mockedAPI.gameAPI.getRandomEvents).toHaveBeenCalledWith(5);
```

### ✅ **Do This Instead**

```javascript
// Robust - uses centralized mock
setupCommonMocks();

// Test behavior, not implementation
expect(result.current.state.timeline).toHaveLength(5);
```

## 🔄 **Migration Guide**

To migrate existing tests to the new system:

1. **Replace manual mocks** with `setupCommonMocks()`
2. **Use utility functions** for data creation
3. **Test behavior** instead of implementation details
4. **Use centralized mock configuration** for custom scenarios

## 📝 **Adding New Mocks**

When adding new modules to mock:

1. Create mock file in `__mocks__/` directory
2. Add to `setupCommonMocks()` in `testSetup.js`
3. Document the mock in this README
4. Update existing tests to use the new mock

This approach ensures your tests remain robust and maintainable as your codebase evolves.
