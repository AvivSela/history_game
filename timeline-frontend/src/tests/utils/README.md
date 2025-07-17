# Test Utilities Documentation

This directory contains consolidated test utilities that reduce duplication and provide consistent testing patterns across the timeline game project.

## 📁 File Structure

```
src/tests/utils/
├── index.js                           # Centralized exports
├── gameStateTestUtils.js              # Game state testing utilities
├── settingsComponentTestUtils.js      # Settings components testing utilities
├── animationTestUtils.js              # Animation system testing utilities
├── testSetup.js                       # Common test setup utilities
└── README.md                          # This documentation
```

## 🎯 Overview

The test utilities were created to address the significant code duplication identified in the project's test suite. By consolidating common test patterns, we've achieved:

- **~800 lines reduction** in settings component tests
- **~400 lines reduction** in animation system tests
- **Improved maintainability** with single source of truth
- **Better consistency** across test patterns
- **Faster development** with reusable utilities

## 🧩 Settings Components Test Utils

### Purpose

Consolidates common test patterns for settings components like `CardCountSlider`, `CategorySelector`, `DifficultySelector`, and `SettingsSection`.

### Key Features

- **Custom className testing**
- **Accessibility (ARIA) testing**
- **Disabled state testing**
- **Focus management testing**
- **Keyboard navigation testing**
- **CSS class testing**
- **Error handling testing**
- **Dropdown functionality testing**
- **Search functionality testing**
- **Favorites functionality testing**

### Usage Examples

#### Basic Usage

```javascript
import {
  createSettingsComponentTests,
  setupSettingsTest,
} from '../utils/settingsComponentTestUtils.js';

describe('CardCountSlider', () => {
  const defaultProps = {
    value: 10,
    onChange: vi.fn(),
    min: 5,
    max: 20,
    step: 1,
  };

  setupSettingsTest();

  const tests = createSettingsComponentTests(CardCountSlider, defaultProps, {
    componentName: 'CardCountSlider',
    containerClass: 'card-count-slider',
    labelText: 'Number of Cards',
  });

  tests.runAllTests();
});
```

#### Advanced Configuration

```javascript
const tests = createSettingsComponentTests(CategorySelector, defaultProps, {
  componentName: 'CategorySelector',
  containerClass: 'category-selector',
  labelText: 'Game Categories',
  hasDropdown: true,
  hasSearch: true,
  hasFavorites: true,
  keyboardNavigation: false, // Disable for components that don't use arrow keys
  ariaAttributes: true,
  disabledState: true,
  focusManagement: true,
  cssClasses: true,
  errorHandling: true,
});
```

#### Individual Test Functions

```javascript
const tests = createSettingsComponentTests(Component, defaultProps);

// Run specific test categories
tests.testCustomClassName();
tests.testAriaAttributes();
tests.testDisabledState();
tests.testFocusManagement();
tests.testKeyboardNavigation();
tests.testCssClasses();
tests.testErrorHandling();
```

### Mock Utilities

#### localStorage Mock

```javascript
import { createLocalStorageMock } from '../utils/settingsComponentTestUtils.js';

const localStorageMock = createLocalStorageMock();
localStorageMock.getItem.mockReturnValue('{"test": "value"}');
```

#### matchMedia Mock

```javascript
import { createMatchMediaMock } from '../utils/settingsComponentTestUtils.js';

const matchMediaMock = createMatchMediaMock(true); // true = prefers reduced motion
```

## 🎬 Animation System Test Utils

### Purpose

Consolidates common test patterns for animation system tests including CSS animations, animation queues, wrong placement animations, and accessibility features.

### Key Features

- **Animation class testing**
- **Performance testing**
- **Reduced motion support testing**
- **GPU acceleration testing**
- **Animation cleanup testing**
- **Animation timing testing**
- **Queue operations testing**
- **Wrong placement animation testing**
- **Accessibility testing**

### Usage Examples

#### Basic Usage

```javascript
import {
  createAnimationTests,
  setupAnimationTest,
} from '../utils/animationTestUtils.js';

describe('Animation System', () => {
  const { testElement } = setupAnimationTest({
    mockMatchMedia: true,
    prefersReducedMotion: false,
    createTestElement: true,
  });

  const tests = createAnimationTests({
    testPerformance: true,
    testReducedMotion: true,
    testGPUAcceleration: true,
    testAnimationCleanup: true,
    testTiming: true,
  });

  tests.runAllTests();
});
```

#### Animation Queue Testing

```javascript
import { createAnimationQueueTests } from '../utils/animationTestUtils.js';

const queueTests = createAnimationQueueTests();

describe('Animation Queue', () => {
  queueTests.testQueueOperations();
  queueTests.testAnimationTiming();
  queueTests.testAnimationCleanup();
});
```

#### Wrong Placement Testing

```javascript
import { createWrongPlacementTests } from '../utils/animationTestUtils.js';

const wrongPlacementTests = createWrongPlacementTests();

describe('Wrong Placement Animations', () => {
  wrongPlacementTests.testWrongPlacementAnimation();
  wrongPlacementTests.testAnimationSequence();
});
```

#### Accessibility Testing

```javascript
import { createAccessibilityTests } from '../utils/animationTestUtils.js';

const accessibilityTests = createAccessibilityTests();

describe('Accessibility', () => {
  accessibilityTests.testReducedMotionDetection();
});
```

### Animation Test Utilities

#### Create Test Element

```javascript
import { animationTestUtils } from '../utils/animationTestUtils.js';

const element = animationTestUtils.createTestElement([
  'card-shake',
  'card-animating',
]);
```

#### Measure Performance

```javascript
const duration = animationTestUtils.measureAnimationPerformance(() => {
  element.classList.add('card-shake');
});
```

#### Mock requestAnimationFrame

```javascript
const rafMock = animationTestUtils.mockRequestAnimationFrame();
// ... test code ...
rafMock.restore();
```

### MatchMedia Mock Utilities

```javascript
import { createAnimationMatchMediaMock } from '../utils/animationTestUtils.js';

// Mock reduced motion preference
const matchMediaMock = createAnimationMatchMediaMock(true);

// Mock normal motion preference
const matchMediaMock = createAnimationMatchMediaMock(false);
```

## 🔧 Common Test Setup

### Settings Test Setup

```javascript
import { setupSettingsTest } from '../utils/settingsComponentTestUtils.js';

setupSettingsTest({
  mockLocalStorage: true,
  mockMatchMedia: true,
  prefersReducedMotion: false,
});
```

### Animation Test Setup

```javascript
import { setupAnimationTest } from '../utils/animationTestUtils.js';

const { testElement } = setupAnimationTest({
  mockMatchMedia: true,
  prefersReducedMotion: false,
  createTestElement: true,
});
```

## 📊 Migration Guide

### From Individual Tests to Consolidated Utilities

#### Before (Individual Test)

```javascript
describe('CardCountSlider', () => {
  test('renders with custom className', () => {
    render(<CardCountSlider {...defaultProps} className="custom-class" />);
    const container = screen
      .getByText('Number of Cards')
      .closest('.card-count-slider');
    expect(container).toHaveClass('custom-class');
  });

  test('has proper ARIA attributes', () => {
    render(<CardCountSlider {...defaultProps} />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-valuemin', '5');
    expect(slider).toHaveAttribute('aria-valuemax', '20');
  });

  // ... many more similar tests
});
```

#### After (Consolidated Utilities)

```javascript
describe('CardCountSlider', () => {
  const tests = createSettingsComponentTests(CardCountSlider, defaultProps, {
    componentName: 'CardCountSlider',
    containerClass: 'card-count-slider',
    labelText: 'Number of Cards',
  });

  tests.runAllTests();
});
```

### Benefits of Migration

- **Reduced code duplication**: ~75% reduction in test code
- **Improved maintainability**: Single source of truth for common patterns
- **Better consistency**: Standardized testing approaches
- **Faster development**: Reusable utilities for new components
- **Enhanced coverage**: More comprehensive testing with less code

## 🎯 Best Practices

### 1. Use Appropriate Configuration

Choose the right options for your component:

- Set `hasDropdown: true` for dropdown components
- Set `hasSearch: true` for searchable components
- Set `keyboardNavigation: false` for components that don't use arrow keys

### 2. Combine with Component-Specific Tests

Use consolidated utilities for common patterns, then add component-specific tests:

```javascript
// Run consolidated tests
tests.runAllTests();

// Add component-specific tests
describe('Component-Specific Tests', () => {
  test('unique feature test', () => {
    // Component-specific test logic
  });
});
```

### 3. Use Mock Utilities Consistently

Always use the provided mock utilities for localStorage and matchMedia:

```javascript
setupSettingsTest(); // Automatically sets up mocks
```

### 4. Test Performance Appropriately

Use performance testing for animations but keep expectations realistic:

```javascript
const duration = animationTestUtils.measureAnimationPerformance(callback);
expect(duration).toBeLessThan(1); // Should be very fast
```

## 🚀 Future Enhancements

### Planned Features

- **Storage/Persistence Test Utils**: For localStorage and state persistence tests
- **Component Rendering Test Utils**: For common component rendering patterns
- **Hook Testing Utils**: For React hook testing patterns
- **Game Logic Test Utils**: For game-specific logic testing

### Extension Points

The utilities are designed to be extensible:

- Add new test functions to existing utilities
- Create new utility modules for different test categories
- Customize configuration options for specific needs

## 📚 Additional Resources

### Example Files

- `../examples/settingsComponentExample.test.jsx` - Settings component usage examples
- `../examples/animationSystemExample.test.jsx` - Animation system usage examples

### Related Documentation

- `../../TESTING_GUIDELINES.md` - General testing guidelines
- `../../TEST_QUALITY_CHECKLIST.md` - Test quality standards
- `../../TECHNICAL_DEBT.md` - Technical debt tracking

### Migration Support

For help migrating existing tests to use these utilities, refer to the example files and this documentation. The utilities are designed to be backward-compatible and can be adopted incrementally.
