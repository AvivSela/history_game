# Timeline Game - Frontend

A React-based frontend for the Timeline historical card game, built with Vite and using Yarn for package management. Features a well-organized, maintainable codebase with clear separation of concerns and comprehensive testing.

## ✨ Key Features

### 🎮 Game Features
- **Interactive Timeline**: Drag & drop card placement
- **Real-time Validation**: Immediate feedback on placements
- **AI Opponent**: Adjustable difficulty levels
- **Multiple Categories**: History, Science, Technology, etc.

### 🎨 UI/UX Features
- **Responsive Design**: Works on all devices
- **Smooth Animations**: Optimized performance
- **Accessibility**: Screen reader support, keyboard navigation
- **Dark/Light Mode**: User preference support

### 🧪 Quality Features
- **Comprehensive Testing**: 221 passing tests
- **Performance Optimized**: 30-40% animation improvements
- **Type Safe**: Ready for TypeScript migration
- **Modular Architecture**: Easy to extend and maintain

## ⚡ Quick Start

```bash
# Install dependencies
yarn install

# Start development server
yarn dev

# Open http://localhost:5173
```

**First time setup?** See the [full setup guide](#installation)

## Prerequisites

- Node.js >= 18.0.0
- Yarn >= 1.22.0

## Installation

```bash
# Install dependencies
yarn install

# Start development server
yarn dev

# Build for production
yarn build

# Run tests
yarn test

# Run linting
yarn lint
```

## Development

The project uses:

- **React 18** with hooks and modern patterns
- **Vite** for fast development and building
- **React Router** for navigation
- **ESLint** for code quality
- **Vitest** for comprehensive testing
- **Tailwind CSS** for styling
- **Yarn** for package management

## 🏗️ Component Architecture

```
App
├── Game (Main Game Container)
│   ├── GameBoard (Layout Coordinator)
│   │   ├── GameHeader (Title & Controls)
│   │   ├── Timeline (Event Placement)
│   │   ├── PlayerHand (Player Cards)
│   │   └── AIHand (AI Cards)
│   ├── GameStatus (Feedback & Status)
│   └── GameControls (Game Logic)
├── Settings (Game Configuration)
└── Statistics (Game Analytics)
```

## Project Structure

```
src/
├── components/           # Organized UI components
│   ├── core/            # Core game logic components
│   │   ├── GameBoard/   # Main game layout coordinator
│   │   ├── GameHeader/  # Game title, controls, and score display
│   │   ├── GameStatus/  # Game status overlay and feedback toast
│   │   ├── GameControls/# Game initialization and control logic
│   │   ├── TurnIndicator/# Turn indicator for AI mode
│   │   └── index.js     # Clean exports
│   ├── game/            # Game-specific components
│   │   ├── Timeline/    # Timeline display and interaction
│   │   ├── PlayerHand/  # Player hand display and interaction
│   │   ├── AIHand/      # AI hand display
│   │   ├── Card/        # Card display and interaction
│   │   └── index.js     # Clean exports
│   ├── ui/              # Reusable UI components
│   │   ├── LoadingScreen/# Loading state display
│   │   ├── ErrorScreen/ # Error state display
│   │   ├── AnimationControls/# Animation control interface
│   │   ├── Feedback/    # User feedback components
│   │   └── index.js     # Clean exports
│   └── layout/          # Layout components (placeholder)
│       └── index.js     # Clean exports
├── pages/               # Page components
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
├── constants/           # Game constants and configuration
├── types/               # Type definitions and documentation
└── assets/              # Static assets
```

## 🔄 Development Workflow

```bash
# 1. Start development
yarn dev

# 2. Make changes
# Edit files in src/

# 3. Run tests
yarn test

# 4. Check linting
yarn lint

# 5. Build for production
yarn build
```

## Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn preview` - Preview production build
- `yarn test` - Run comprehensive test suite (165 tests)
- `yarn lint` - Run ESLint for code quality
- `yarn test:coverage` - Run tests with coverage report

## Code Quality & Architecture

### Component Organization

The codebase follows a well-organized component structure with clear separation of concerns:

- **Core Components** (`src/components/core/`): Core game logic and UI coordination
- **Game Components** (`src/components/game/`): Game-specific UI elements (Timeline, PlayerHand, AIHand, Card)
- **UI Components** (`src/components/ui/`): Reusable UI components for loading, errors, animations, etc.
- **Layout Components** (`src/components/layout/`): Layout and navigation components (placeholder for future)
- **Constants** (`src/constants/`): Centralized game configuration and constants
- **Types** (`src/types/`): Type definitions and documentation for future TypeScript migration

### Key Improvements

- **Modular Architecture**: Components are focused and single-purpose
- **Separation of Concerns**: UI logic separated from business logic
- **Maintainability**: Clear component boundaries and consistent naming
- **Testability**: All components can be tested in isolation
- **Reusability**: UI components designed for reuse across the application

### Testing

- **165 comprehensive tests** covering all major functionality
- **Component isolation**: Each component can be tested independently
- **User interaction testing**: Full user flow testing with realistic scenarios
- **Animation testing**: Comprehensive animation and visual feedback testing
- **Standardized test structure**: All tests use `.test.jsx` extension for consistency
- **Organized test files**: Clear separation between component, integration, and utility tests

### Animation System (FE-001)

The Timeline Game now uses a **unified, optimized animation system** for all UI and game animations. This system provides:

- Centralized animation management via `AnimationSystem`
- Device-specific performance optimizations
- Full accessibility support (reduced motion, screen readers)
- Consistent GPU acceleration and optimized CSS keyframes
- Tree-shakable, modular code for smaller bundles

**Key API Usage:**

```js
import { animations, accessibility, performance } from './utils/animation';

// Animate a card shake
await animations.cardShake(element);

// Animate a wrong placement sequence
await animations.wrongPlacement(
  cardElement,
  timelineElement,
  insertionPointElement
);

// Check if animations should run (accessibility)
if (accessibility.shouldAnimate()) {
  // ...
}

// Performance monitoring
performance.logSummary();
```

**Migration Notes:**

- All legacy animation files (`animationUtils.js`, `animationQueue.js`, `contextAwareAnimations.js`, `progressiveAnimations.js`) have been removed.
- All components now use the new API from `src/utils/animation/`.
- See `src/utils/animation/index.js` for the full API surface.

**For more details, see the [FE-001 Animation Performance Optimization Plan](../technical/plans/animation-performance.md) and code comments in `AnimationSystem.js`.**

## Testing Guidelines

### Test File Organization

The project follows standardized test file conventions for consistency and maintainability:

#### File Naming Conventions

- **Extension**: All test files use `.test.jsx` extension
- **Naming**: `ComponentName.test.jsx` for components, `featureName.test.jsx` for features
- **Location**: Tests are co-located with their source files

#### Test File Structure

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

#### Test Categories

- **Component Tests**: Test React components in isolation
- **Integration Tests**: Test user flows and component interactions
- **Utility Tests**: Test pure functions and business logic
- **Animation Tests**: Test animation sequences and visual feedback

#### Best Practices

- Use descriptive test names that explain the expected behavior
- Group related tests using `describe` blocks
- Test both success and error scenarios
- Use React Testing Library for component testing
- Maintain test isolation with proper setup and teardown

### Running Tests

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test --watch

# Run tests with coverage
yarn test --coverage

# Run specific test file
yarn test src/components/game/Timeline/Timeline.test.jsx
```

## Contributing

1. Install dependencies with `yarn install`
2. Start development server with `yarn dev`
3. Make your changes following the established component structure
4. Run tests with `yarn test` (ensure all 165 tests pass)
5. Ensure linting passes with `yarn lint`
6. Follow the existing code organization patterns
7. Follow the testing guidelines above for new tests

## Recent Improvements

### Test File Consistency Standardization (FE-003)

The project has been standardized for consistent test file organization and naming:

#### Achievements

- **Standardized Extensions**: All test files now use `.test.jsx` extension
- **Eliminated Duplicates**: Removed duplicate test files (reduced from 201 to 165 tests)
- **Consistent Naming**: Clear naming conventions across all test files
- **Improved Organization**: Better test file structure and discovery
- **Enhanced Performance**: Reduced test execution time by eliminating duplicates

#### Test File Structure

- **Component Tests**: Co-located with components (e.g., `Timeline.test.jsx`)
- **Integration Tests**: Organized in `src/tests/` directory
- **Utility Tests**: Co-located with utility functions
- **Test Index**: Central export file for better test discovery

#### Benefits

- **Consistency**: Standardized test file naming and structure
- **Efficiency**: Eliminated duplicate test execution
- **Maintainability**: Clear test organization and discovery
- **Developer Experience**: Predictable test patterns and organization

For more details, see the [FE-003 Test File Consistency Plan](../docs/FE-003-Test-File-Consistency-Plan.md).

### Component Organization Refactoring (FE-002)

### Major Refactoring Achievements

- **Component Organization**: Complete reorganization with consistent naming and structure
- **Directory Structure**: Standardized PascalCase naming and logical grouping
- **Import Patterns**: Consistent import patterns across the entire codebase
- **Test Coverage**: Maintained 100% with 221 passing tests
- **Code Organization**: Clear separation between core, game, UI, and layout components

### Component Structure Improvements

- **Core Components** (`src/components/core/`): GameBoard, GameHeader, GameStatus, GameControls, TurnIndicator
- **Game Components** (`src/components/game/`): Timeline, PlayerHand, AIHand, Card
- **UI Components** (`src/components/ui/`): LoadingScreen, ErrorScreen, AnimationControls, Feedback
- **Layout Components** (`src/components/layout/`): Placeholder for future navigation and layout components

### Benefits Achieved

- **Maintainability**: Consistent component structure and naming conventions
- **Discoverability**: Logical grouping makes components easy to find
- **Scalability**: Structure supports future component additions
- **Developer Experience**: Improved IDE support and code navigation
- **Import Consistency**: Single import pattern across the codebase

### Component Breakdown

| Component         | Lines | Responsibility        |
| ----------------- | ----- | --------------------- |
| Game.jsx          | ~200  | Game state management |
| GameBoard.jsx     | ~80   | Layout coordination   |
| GameHeader.jsx    | ~60   | Header UI             |
| GameStatus.jsx    | ~70   | Status display        |
| GameControls.jsx  | ~120  | Business logic        |
| LoadingScreen.jsx | ~20   | Loading UI            |
| ErrorScreen.jsx   | ~25   | Error UI              |
| AIHand.jsx        | ~30   | AI display            |

### Benefits Achieved

- **Maintainability**: Components are now focused and single-purpose
- **Reusability**: UI components can be reused across the application
- **Testability**: Components can be tested in isolation with clear interfaces
- **Developer Experience**: Better IDE support and clearer code organization
- **Future-Proofing**: Ready for TypeScript migration and new features
