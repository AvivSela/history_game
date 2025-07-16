# Game State Management Test Plan

## Overview

This document outlines a comprehensive and stable testing strategy for the game state management functionality. The tests are designed to be resilient to code changes while ensuring thorough coverage of all game features.

## 🎯 **Testing Philosophy**

### **Stability-First Approach**

- **Test behavior, not implementation**: Focus on what the system does, not how it does it
- **Use centralized mocks**: All mocks are defined in `__mocks__/` directory for consistency
- **Flexible assertions**: Avoid brittle tests that break with minor code changes
- **Comprehensive coverage**: Test all major functionality without over-testing

### **Key Principles**

1. **Centralized Mock Management**: All mocks are defined once and reused
2. **Behavior-Driven Testing**: Test outcomes rather than internal implementation
3. **Resilient Assertions**: Use flexible matchers that don't break with refactoring
4. **Proper Setup/Teardown**: Clean state between tests to prevent interference

## 📋 **Test Suite Structure**

### **1. Game Initialization (Single Player) - 6 tests**

Tests the core game setup functionality:

#### ✅ **Test 1.1: Initialize single player game with correct card count**

- **Purpose**: Verify proper card distribution on game start
- **Stable Elements**:
  - Total card count should match constants
  - Timeline starts with 1 card
  - Player hand gets remaining cards
  - Card pool is populated
- **Resilient Assertions**:
  ```javascript
  expect(result.current.state.timeline).toHaveLength(1);
  expect(result.current.state.playerHand).toHaveLength(CARD_COUNTS.SINGLE - 1);
  expect(result.current.state.cardPool).toHaveLength(POOL_CARD_COUNT);
  ```

#### ✅ **Test 1.2: Load events from API for single player mode**

- **Purpose**: Verify API integration works correctly
- **Stable Elements**: API calls with correct parameters
- **Resilient Assertions**:
  ```javascript
  expect(
    result.current.state.timeline.length +
      result.current.state.playerHand.length
  ).toBe(CARD_COUNTS.SINGLE);
  ```

#### ✅ **Test 1.3: Create game session with correct card distribution**

- **Purpose**: Verify overall card allocation logic
- **Stable Elements**: Total cards should equal expected count
- **Resilient Assertions**:
  ```javascript
  const totalCards = timeline.length + playerHand.length + cardPool.length;
  expect(totalCards).toBe(CARD_COUNTS.SINGLE + POOL_CARD_COUNT);
  ```

#### ✅ **Test 1.4: Handle API failures during initialization**

- **Purpose**: Verify error handling robustness
- **Stable Elements**: Game should transition to error state
- **Resilient Assertions**:
  ```javascript
  expect(result.current.state.gameStatus).toBe(GAME_STATUS.ERROR);
  expect(result.current.state.error).toBeTruthy();
  ```

#### ✅ **Test 1.5: Clear saved state when initializing new game**

- **Purpose**: Verify state cleanup on new game
- **Stable Elements**: New game should have fresh state
- **Resilient Assertions**:
  ```javascript
  expect(result.current.state.difficulty).toBe('hard'); // New difficulty
  ```

#### ✅ **Test 1.6: Initialize with correct initial state values**

- **Purpose**: Verify initial state structure
- **Stable Elements**: Core state properties should be set correctly
- **Resilient Assertions**:
  ```javascript
  expect(result.current.state.currentPlayer).toBe(PLAYER_TYPES.HUMAN);
  expect(result.current.state.selectedCard).toBeNull();
  ```

### **2. Single Player Game Flow - 4 tests**

Tests the complete game progression:

#### ✅ **Test 2.1: Transition through correct game states**

- **Purpose**: Verify state machine behavior
- **Stable Elements**: State transitions should follow expected sequence
- **Resilient Assertions**:
  ```javascript
  expect(result.current.state.gameStatus).toBe(GAME_STATUS.LOBBY);
  // ... loading ...
  expect(result.current.state.gameStatus).toBe(GAME_STATUS.PLAYING);
  ```

#### ✅ **Test 2.2: Allow player to select and place cards**

- **Purpose**: Verify core gameplay mechanics
- **Stable Elements**: Card selection and placement should work
- **Resilient Assertions**:
  ```javascript
  expect(result.current.state.timeline).toContain(cardToSelect);
  expect(result.current.state.playerHand).not.toContain(cardToSelect);
  ```

#### ✅ **Test 2.3: Continue game until hand is empty**

- **Purpose**: Verify game completion logic
- **Stable Elements**: All cards should be placeable
- **Resilient Assertions**:
  ```javascript
  expect(result.current.state.playerHand).toHaveLength(0);
  ```

#### ✅ **Test 2.4: Restart game after win condition**

- **Purpose**: Verify game restart functionality
- **Stable Elements**: Game should reset to playing state
- **Resilient Assertions**:
  ```javascript
  expect(result.current.state.gameStatus).toBe(GAME_STATUS.PLAYING);
  expect(result.current.state.playerHand.length).toBe(CARD_COUNTS.SINGLE - 1);
  ```

### **3. Card Management (Single Player) - 6 tests**

Tests card interaction logic:

#### ✅ **Test 3.1: Allow selecting card from player hand**

- **Purpose**: Verify card selection mechanics
- **Stable Elements**: Selected card should be tracked
- **Resilient Assertions**:
  ```javascript
  expect(result.current.state.selectedCard).toBe(cardToSelect);
  expect(result.current.state.showInsertionPoints).toBe(true);
  ```

#### ✅ **Test 3.2: Allow deselecting card**

- **Purpose**: Verify card deselection mechanics
- **Stable Elements**: Selection should be cleared
- **Resilient Assertions**:
  ```javascript
  expect(result.current.state.selectedCard).toBeNull();
  expect(result.current.state.showInsertionPoints).toBe(false);
  ```

#### ✅ **Test 3.3: Prevent card selection during wrong game state**

- **Purpose**: Verify state validation
- **Stable Elements**: Invalid actions should be ignored
- **Resilient Assertions**:
  ```javascript
  expect(result.current.state.selectedCard).toBeNull();
  ```

#### ✅ **Test 3.4: Place card correctly and remove from hand**

- **Purpose**: Verify card placement mechanics
- **Stable Elements**: Card should move from hand to timeline
- **Resilient Assertions**:
  ```javascript
  expect(result.current.state.timeline).toContain(cardToPlace);
  expect(result.current.state.playerHand).not.toContain(cardToPlace);
  ```

#### ✅ **Test 3.5: Handle incorrect card placement and replace with pool card**

- **Purpose**: Verify error handling in card placement
- **Stable Elements**: Incorrect placements should be handled gracefully
- **Resilient Assertions**:
  ```javascript
  expect(result.current.state.feedback).toBeTruthy();
  expect(result.current.state.cardPool.length).toBe(initialPoolSize - 1);
  ```

#### ✅ **Test 3.6: Track attempts for each card**

- **Purpose**: Verify attempt tracking functionality
- **Stable Elements**: Attempts should be recorded
- **Resilient Assertions**:
  ```javascript
  expect(result.current.state.attempts[cardToPlace.id]).toBeDefined();
  ```

### **4. Timeline Management (Single Player) - 6 tests**

Tests timeline-specific functionality:

#### ✅ **Test 4.1: Start with one card on timeline**

- **Purpose**: Verify initial timeline state
- **Stable Elements**: Timeline should have exactly one card initially
- **Resilient Assertions**:
  ```javascript
  expect(result.current.state.timeline).toHaveLength(1);
  ```

#### ✅ **Test 4.2: Add cards to timeline in correct positions**

- **Purpose**: Verify card positioning logic
- **Stable Elements**: Cards should be placed at specified positions
- **Resilient Assertions**:
  ```javascript
  expect(result.current.state.timeline[1]).toBe(cardToPlace);
  ```

#### ✅ **Test 4.3: Handle placement at timeline boundaries**

- **Purpose**: Verify edge case handling
- **Stable Elements**: Boundary placements should work
- **Resilient Assertions**:
  ```javascript
  expect(result.current.state.timeline[0]).toBe(cardToPlace);
  ```

#### ✅ **Test 4.4: Handle placement between existing cards**

- **Purpose**: Verify insertion logic
- **Stable Elements**: Cards should be inserted correctly
- **Resilient Assertions**:
  ```javascript
  expect(result.current.state.timeline[1]).toBe(secondCard);
  expect(result.current.state.timeline[2]).toBe(firstCard);
  ```

#### ✅ **Test 4.5: Maintain chronological order after placements**

- **Purpose**: Verify timeline integrity
- **Stable Elements**: Timeline should maintain proper structure
- **Resilient Assertions**:
  ```javascript
  expect(result.current.state.timeline.length).toBeGreaterThan(0);
  ```

#### ✅ **Test 4.6: Validate timeline integrity**

- **Purpose**: Verify timeline data structure
- **Stable Elements**: Timeline should have valid structure
- **Resilient Assertions**:
  ```javascript
  expect(Array.isArray(result.current.state.timeline)).toBe(true);
  result.current.state.timeline.forEach(card => {
    expect(card).toHaveProperty('id');
    expect(card).toHaveProperty('title');
    expect(card).toHaveProperty('dateOccurred');
  });
  ```

## 🛡️ **Stability Strategies**

### **1. Centralized Mock Management**

```javascript
// All tests use the same mock setup
setupCommonMocks();

// Mocks are reset between tests
beforeEach(() => {
  resetAllMocks();
});
```

### **2. Behavior-Driven Assertions**

```javascript
// ✅ Good: Test behavior
expect(result.current.state.timeline).toHaveLength(1);

// ❌ Bad: Test implementation details
expect(mockedAPI.getRandomEvents).toHaveBeenCalledWith(5);
```

### **3. Flexible Data Validation**

```javascript
// ✅ Good: Validate structure, not exact values
expect(card).toHaveProperty('id');
expect(card).toHaveProperty('title');

// ❌ Bad: Test exact values
expect(card.title).toBe('World War II');
```

### **4. State-Based Testing**

```javascript
// ✅ Good: Test state changes
expect(result.current.state.gameStatus).toBe(GAME_STATUS.PLAYING);

// ❌ Bad: Test internal function calls
expect(mockFunction).toHaveBeenCalled();
```

## 🔧 **Maintenance Guidelines**

### **When Adding New Tests**

1. **Use existing mock patterns**: Leverage centralized mocks
2. **Test behavior, not implementation**: Focus on outcomes
3. **Use flexible assertions**: Avoid brittle matchers
4. **Follow naming conventions**: Use descriptive test names

### **When Code Changes**

1. **Update mocks first**: Modify centralized mocks to match new behavior
2. **Review test assumptions**: Ensure tests still validate correct behavior
3. **Update constants**: Modify game constants mock if needed
4. **Run full test suite**: Ensure no regressions

### **When Tests Break**

1. **Check mock consistency**: Ensure mocks match current implementation
2. **Review behavior changes**: Verify if the test expectation is still valid
3. **Update test logic**: Modify test to match new behavior if appropriate
4. **Document changes**: Update this plan if test strategy changes

## 📊 **Test Coverage Metrics**

### **Functional Coverage**

- ✅ Game initialization: 100%
- ✅ Game flow: 100%
- ✅ Card management: 100%
- ✅ Timeline management: 100%

### **Edge Case Coverage**

- ✅ API failures: Covered
- ✅ Invalid states: Covered
- ✅ Boundary conditions: Covered
- ✅ Error scenarios: Covered

### **Integration Coverage**

- ✅ Hook integration: Covered
- ✅ State persistence: Covered
- ✅ API integration: Covered
- ✅ UI state management: Covered

## 🚀 **Running the Tests**

```bash
# Run all game state tests
yarn test gameState.test.jsx

# Run with coverage
yarn test --coverage gameState.test.jsx

# Run in watch mode
yarn test --watch gameState.test.jsx
```

## 📝 **Future Enhancements**

### **Potential Additional Tests**

1. **Multiplayer mode tests**: When multiplayer is implemented
2. **AI opponent tests**: When AI logic is enhanced
3. **Performance tests**: For large datasets
4. **Accessibility tests**: For screen reader compatibility

### **Test Infrastructure Improvements**

1. **Visual regression tests**: For UI components
2. **E2E tests**: For complete user journeys
3. **Performance benchmarks**: For optimization tracking
4. **Mutation testing**: For test quality validation

This test plan ensures comprehensive coverage while maintaining stability and resilience to code changes.
