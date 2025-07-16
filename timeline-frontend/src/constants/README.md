# Constants Management System

This directory contains all centralized constants for the Timeline Game project. The constants are organized into logical categories to improve maintainability and reduce code duplication.

## Overview

The constants management system consolidates all magic numbers, configuration values, and game settings into a single, well-organized location. This eliminates scattered constants across the codebase and provides a single source of truth for all configuration values.

## File Structure

```
src/constants/
├── gameConstants.js    # Main constants file with all game configuration
└── README.md          # This documentation file
```

## Constants Categories

### Game Status Constants (`GAME_STATUS`)

- `LOBBY`, `LOADING`, `PLAYING`, `PAUSED`, `WON`, `LOST`, `ERROR`
- Used for tracking the current state of the game

### Player Types (`PLAYER_TYPES`)

- `HUMAN`, `AI`
- Used for identifying player types in the game

### Game Modes (`GAME_MODES`)

- `SINGLE`, `AI`, `MULTIPLAYER`
- Defines different game modes available

### Difficulty Levels (`DIFFICULTY_LEVELS`)

- `EASY`, `MEDIUM`, `HARD`, `EXPERT`
- Game difficulty settings

### Card Counts (`CARD_COUNTS`)

- `SINGLE: 5`, `AI: 8`
- Number of cards per game mode

### UI Dimensions (`UI_DIMENSIONS`)

- Card dimensions, spacing, and layout constants
- Z-index layers for proper stacking
- Timeline and player hand dimensions

### Timing Constants (`TIMING`)

- Animation durations and delays
- Game timing values
- Performance thresholds
- API timeouts

### AI Configuration (`AI_CONFIG`)

- AI difficulty settings with accuracy, thinking time, and mistake chances
- Decision weights for AI card selection
- Memory and learning parameters

### Game Logic Constants (`GAME_LOGIC`)

- Scoring system values
- Time calculation constants
- Validation thresholds
- Strategic value parameters

### Performance Constants (`PERFORMANCE`)

- Device timing multipliers
- Animation priority levels
- Memory thresholds

### API Constants (`API`)

- Base URL and timeout settings
- HTTP status codes
- Retry configuration

### Accessibility Constants (`ACCESSIBILITY`)

- Reduced motion preferences
- Screen reader delays
- Focus indicator durations

### Styling Constants (`STYLING`)

- CSS transition durations and easing
- Border radius values
- Shadow levels

### Development Constants (`DEVELOPMENT`)

- Test timeouts and thresholds
- Mock data values
- Performance testing parameters

## Usage Examples

### Importing Constants

```javascript
import {
  GAME_STATUS,
  UI_DIMENSIONS,
  TIMING,
  GAME_LOGIC,
} from '../constants/gameConstants';
```

### Using Game Status

```javascript
const [gameState, setGameState] = useState({
  status: GAME_STATUS.LOBBY,
  currentPlayer: PLAYER_TYPES.HUMAN,
});
```

### Using UI Dimensions

```javascript
const cardWidth = UI_DIMENSIONS.CARD_WIDTH;
const spacing = cardWidth + UI_DIMENSIONS.CARD_SPACING;
```

### Using Timing Constants

```javascript
setTimeout(() => {
  setFeedback(null);
}, TIMING.FEEDBACK_DISPLAY);
```

### Using AI Configuration

```javascript
const aiDifficulty = AI_CONFIG.DIFFICULTIES.medium;
const thinkingTime = aiDifficulty.thinkingTime.min;
```

## Benefits

### 1. Centralized Configuration

- All constants are defined in one place
- Easy to find and modify values
- Consistent naming conventions

### 2. Reduced Code Duplication

- Eliminates magic numbers scattered throughout the codebase
- Single source of truth for all configuration values
- Easier to maintain and update

### 3. Improved Maintainability

- Clear organization by category
- Comprehensive documentation
- Easy to understand and modify

### 4. Better Type Safety

- Constants are properly typed and documented
- Reduces errors from typos in magic numbers
- Better IDE support and autocomplete

### 5. Enhanced Performance

- Constants are imported once and reused
- No repeated string literals
- Optimized for tree-shaking

## Migration Guide

### Before (Scattered Constants)

```javascript
// In PlayerHand.jsx
const cardWidth = 160;
const spacing = cardWidth + 20;
const maxAngle = Math.min(totalCards * 3, 25);

// In Timeline.jsx
const scrollAmount = 300;
const insertionPointWidth = 80;

// In gameLogic.js
const baseScore = 100;
const timeBonus = Math.max(0, 50 - timeToPlace * 10);
```

### After (Centralized Constants)

```javascript
// In PlayerHand.jsx
import { UI_DIMENSIONS } from '../constants/gameConstants';
const cardWidth = UI_DIMENSIONS.CARD_WIDTH;
const spacing = cardWidth + UI_DIMENSIONS.CARD_SPACING;
const maxAngle = Math.min(
  totalCards * UI_DIMENSIONS.HAND_ANGLE_MULTIPLIER,
  UI_DIMENSIONS.HAND_MAX_ANGLE
);

// In Timeline.jsx
import { UI_DIMENSIONS } from '../constants/gameConstants';
const scrollAmount = UI_DIMENSIONS.TIMELINE_SCROLL_AMOUNT;
const insertionPointWidth = UI_DIMENSIONS.TIMELINE_INSERTION_POINT_WIDTH;

// In gameLogic.js
import { GAME_LOGIC } from '../constants/gameConstants';
const baseScore = GAME_LOGIC.BASE_SCORE;
const timeBonus = Math.max(
  0,
  GAME_LOGIC.TIME_BONUS_MAX - timeToPlace * GAME_LOGIC.TIME_BONUS_RATE
);
```

## Best Practices

### 1. Always Import from Constants

- Never use magic numbers in components
- Always import constants from the centralized location
- Use descriptive constant names

### 2. Group Related Constants

- Keep related constants together in the same category
- Use clear, descriptive category names
- Maintain logical organization

### 3. Document Complex Constants

- Add comments for complex calculations
- Explain the purpose of each constant
- Include units where applicable

### 4. Use Consistent Naming

- Use UPPER_SNAKE_CASE for constant names
- Use descriptive names that explain the purpose
- Group related constants with prefixes

### 5. Version Control

- Track changes to constants in version control
- Document breaking changes
- Consider impact on existing functionality

## Future Enhancements

### 1. Environment-Specific Constants

- Support for different environments (dev, staging, prod)
- Environment-specific API endpoints
- Feature flags and configuration

### 2. Dynamic Constants

- Runtime configuration loading
- User preference overrides
- A/B testing support

### 3. Validation

- Runtime validation of constant values
- Type checking for constant usage
- Constraint validation

### 4. Performance Monitoring

- Track constant usage patterns
- Identify unused constants
- Optimize constant access

## Contributing

When adding new constants:

1. **Choose the appropriate category** - Add constants to the most logical category
2. **Use descriptive names** - Make constant names self-documenting
3. **Add documentation** - Include comments explaining the purpose
4. **Update this README** - Document new constants and categories
5. **Test thoroughly** - Ensure constants work correctly across the application

## Related Files

- `src/constants/gameConstants.js` - Main constants file
- `src/utils/animation/constants.js` - Animation-specific constants (now imports from main constants)
- `src/components/**/*.jsx` - Components using centralized constants
- `src/utils/**/*.js` - Utility functions using centralized constants
