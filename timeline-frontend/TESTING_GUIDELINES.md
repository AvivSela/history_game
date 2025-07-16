# Testing Guidelines

This document outlines the testing standards and best practices for the Timeline Game frontend project.

## File Naming Conventions

### Test File Extensions

- **All test files must use `.test.jsx` extension**
- This ensures consistency and proper JSX support for React components

### Test File Naming

- **Component Tests**: `ComponentName.test.jsx` (e.g., `Timeline.test.jsx`)
- **Feature Tests**: `featureName.test.jsx` (e.g., `userInteractions.test.jsx`)
- **Utility Tests**: `utilityName.test.jsx` (e.g., `gameLogic.test.jsx`)

### Test File Location

- **Component Tests**: Co-located with components in their respective directories
- **Integration Tests**: Located in `src/tests/` directory
- **Utility Tests**: Co-located with utility functions

## Test File Structure

```
src/
├── tests/                           # Integration and feature tests
│   ├── animation.test.jsx          # Animation system tests
│   ├── clickToPlaceFlow.test.jsx   # User interaction flow tests
│   ├── userInteractions.test.jsx   # User interaction tests
│   ├── wrongPlacementAnimation.test.jsx # Wrong placement tests
│   ├── cssAnimations.test.jsx      # CSS animation tests
│   ├── animationQueue.test.jsx     # Animation queue tests
│   ├── setup.js                    # Test setup file
│   └── index.js                    # Test exports
├── utils/                          # Utility functions
│   ├── gameLogic.test.jsx          # Game logic tests
│   └── timelineLogic.test.jsx      # Timeline logic tests
└── components/
    └── game/Timeline/
        └── Timeline.test.jsx       # Component tests
```

## Test Categories

### Component Tests

- Test React components in isolation
- Use React Testing Library for component testing
- Test component rendering, user interactions, and state changes
- Example: `Timeline.test.jsx`

### Integration Tests

- Test user flows and component interactions
- Test complete feature workflows
- Focus on end-to-end user scenarios
- Examples: `clickToPlaceFlow.test.jsx`, `userInteractions.test.jsx`

### Utility Tests

- Test pure functions and business logic
- Focus on function inputs, outputs, and edge cases
- No React dependencies required
- Examples: `gameLogic.test.jsx`, `timelineLogic.test.jsx`

### Animation Tests

- Test animation sequences and visual feedback
- Test animation timing and user experience
- Include accessibility considerations
- Examples: `animation.test.jsx`, `cssAnimations.test.jsx`

## Best Practices

### Test Organization

- Use descriptive test names that explain expected behavior
- Group related tests using `describe` blocks
- Organize tests from general to specific scenarios
- Use consistent test structure across all files

### Test Content

- Test both success and error scenarios
- Include edge cases and boundary conditions
- Test user interactions and state changes
- Ensure test isolation with proper setup and teardown

### Code Quality

- Use React Testing Library for component testing
- Avoid testing implementation details
- Focus on user behavior and outcomes
- Keep tests readable and maintainable

### Performance

- Avoid duplicate test files
- Use efficient test patterns
- Minimize test execution time
- Group related tests for better performance

## Running Tests

### Basic Commands

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test --watch

# Run tests with coverage
yarn test --coverage

# Run specific test file
yarn test src/components/game/Timeline/Timeline.test.jsx

# Run tests matching pattern
yarn test --run animation
```

### Test Configuration

- Tests use Vitest as the test runner
- React Testing Library for component testing
- JSDOM environment for DOM testing
- Setup file: `src/tests/setup.js`

## Common Patterns

### Component Testing

```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ComponentName from './ComponentName';

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interactions', () => {
    render(<ComponentName />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Updated Text')).toBeInTheDocument();
  });
});
```

### Utility Testing

```jsx
import { describe, it, expect } from 'vitest';
import { utilityFunction } from './utility';

describe('utilityFunction', () => {
  it('should return expected result for valid input', () => {
    const result = utilityFunction('valid input');
    expect(result).toBe('expected output');
  });

  it('should handle edge cases', () => {
    const result = utilityFunction('');
    expect(result).toBe('default output');
  });
});
```

## Maintenance

### Adding New Tests

1. Follow the naming conventions above
2. Place tests in the appropriate directory
3. Use consistent test structure
4. Ensure all tests pass before committing

### Updating Existing Tests

1. Maintain test isolation
2. Update test names if functionality changes
3. Ensure tests remain focused and readable
4. Update documentation if needed

### Test Discovery

- Use the test index file (`src/tests/index.js`) for better organization
- Keep test files co-located with source files when possible
- Use clear, descriptive file names

## Resources

- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [FE-003 Test File Consistency Plan](../docs/FE-003-Test-File-Consistency-Plan.md)
