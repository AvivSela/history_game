# Timeline Game - Frontend

A React-based frontend for the Timeline historical card game, built with Vite and using Yarn for package management. Features a well-organized, maintainable codebase with clear separation of concerns and comprehensive testing.

## Features

- Interactive timeline placement game
- Historical event cards with categories
- Responsive design with modern UI components
- Real-time game state management
- AI opponent support with difficulty levels
- Comprehensive error handling and loading states
- Modular component architecture
- Extensive test coverage (172 tests)

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

## Project Structure

```
src/
├── components/           # Organized UI components
│   ├── game/            # Game-specific components
│   │   ├── GameBoard.jsx       # Main game layout coordinator
│   │   ├── GameHeader.jsx      # Game title, controls, and score display
│   │   ├── GameStatus.jsx      # Game status overlay and feedback toast
│   │   ├── TurnIndicator.jsx   # Turn indicator for AI mode
│   │   ├── GameControls.jsx    # Game initialization and control logic
│   │   └── index.js           # Clean exports
│   ├── player/          # Player-related components
│   │   ├── AIHand.jsx         # AI hand display
│   │   └── index.js           # Clean exports
│   ├── ui/              # Reusable UI components
│   │   ├── LoadingScreen.jsx   # Loading state display
│   │   ├── ErrorScreen.jsx     # Error state display
│   │   └── index.js           # Clean exports
│   ├── Timeline/        # Timeline components
│   ├── PlayerHand/      # Player hand components
│   ├── Card/            # Card components
│   └── Feedback/        # Feedback components
├── pages/               # Page components
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
├── constants/           # Game constants and configuration
├── types/               # Type definitions and documentation
└── assets/              # Static assets
```

## Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn preview` - Preview production build
- `yarn test` - Run comprehensive test suite (172 tests)
- `yarn lint` - Run ESLint for code quality
- `yarn test:coverage` - Run tests with coverage report

## Code Quality & Architecture

### Component Organization
The codebase follows a well-organized component structure with clear separation of concerns:

- **Game Components** (`src/components/game/`): Core game logic and UI coordination
- **Player Components** (`src/components/player/`): Player-specific UI elements
- **UI Components** (`src/components/ui/`): Reusable UI components for loading, errors, etc.
- **Constants** (`src/constants/`): Centralized game configuration and constants
- **Types** (`src/types/`): Type definitions and documentation for future TypeScript migration

### Key Improvements
- **Modular Architecture**: Components are focused and single-purpose
- **Separation of Concerns**: UI logic separated from business logic
- **Maintainability**: Clear component boundaries and consistent naming
- **Testability**: All components can be tested in isolation
- **Reusability**: UI components designed for reuse across the application

### Testing
- **172 comprehensive tests** covering all major functionality
- **Component isolation**: Each component can be tested independently
- **User interaction testing**: Full user flow testing with realistic scenarios
- **Animation testing**: Comprehensive animation and visual feedback testing

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
await animations.wrongPlacement(cardElement, timelineElement, insertionPointElement);

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

**For more details, see the [FE-001 Animation Performance Optimization Plan](../docs/FE-001-Animation-Performance-Plan.md) and code comments in `AnimationSystem.js`.**

## Contributing

1. Install dependencies with `yarn install`
2. Start development server with `yarn dev`
3. Make your changes following the established component structure
4. Run tests with `yarn test` (ensure all 172 tests pass)
5. Ensure linting passes with `yarn lint`
6. Follow the existing code organization patterns

## Recent Improvements (Phase 2 Refactoring)

### Major Refactoring Achievements
- **Game.jsx Size Reduction**: Reduced from 629 to ~200 lines (68% reduction)
- **Component Count**: Increased from 4 to 8 organized components
- **Test Coverage**: Maintained 100% with 172 passing tests
- **Code Organization**: Transformed from mixed concerns to clear separation

### Component Breakdown
| Component | Lines | Responsibility |
|-----------|-------|----------------|
| Game.jsx | ~200 | Game state management |
| GameBoard.jsx | ~80 | Layout coordination |
| GameHeader.jsx | ~60 | Header UI |
| GameStatus.jsx | ~70 | Status display |
| GameControls.jsx | ~120 | Business logic |
| LoadingScreen.jsx | ~20 | Loading UI |
| ErrorScreen.jsx | ~25 | Error UI |
| AIHand.jsx | ~30 | AI display |

### Benefits Achieved
- **Maintainability**: Components are now focused and single-purpose
- **Reusability**: UI components can be reused across the application
- **Testability**: Components can be tested in isolation with clear interfaces
- **Developer Experience**: Better IDE support and clearer code organization
- **Future-Proofing**: Ready for TypeScript migration and new features
