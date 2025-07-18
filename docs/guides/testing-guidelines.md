# Timeline Game Testing Guidelines

## 🎯 Testing Philosophy

We follow a behavior-driven testing approach that focuses on user experience and business logic rather than implementation details. Our tests serve as living documentation of how the game should behave from a player's perspective.

## 📋 Test Structure

### Behavioral Tests

All new tests should follow the behavioral testing pattern:

1. **User Story Format**
   ```javascript
   describe('As a player who wants to start a new game', () => {
     it('I can start a new single-player game and begin playing immediately', async () => {
       // Test code
     });
   });
   ```

2. **Given-When-Then Structure**
   ```javascript
   // Given: Setup the initial state
   const { result } = renderHook(() => useGameState());
   
   // When: Perform an action
   await act(async () => {
     await result.current.initializeGame('single', 'medium');
   });
   
   // Then: Verify the outcome
   expect(result.current.state).toBePlayable();
   ```

3. **Focus on User Experience**
   - Test what users see and do
   - Use descriptive test names
   - Avoid implementation details

### Helper Functions

Use the provided test utilities to keep tests clean and maintainable:

```javascript
// Initialize game and verify it's ready
await startNewGameSuccessfully(result);

// Verify game state
expectCleanInitialState(result);
expectPlayableGameState(result);

// Simulate user actions
await simulateCardExamination(result);
```

### Custom Matchers

Use custom matchers for better readability:

```javascript
expect(result.current.state).toBePlayable();
expect(result.current).toHaveValidGameFunctions();
```

## 🔍 Test Categories

1. **Initial Experience Tests**
   - First-time user experience
   - Default settings and state
   - Available functions

2. **Game Flow Tests**
   - Starting new games
   - Card selection and placement
   - Game restart

3. **Error Handling Tests**
   - Network issues
   - Invalid actions
   - Fallback behaviors

4. **Settings Tests**
   - Custom settings
   - Settings persistence
   - Default fallbacks

## ⚠️ Common Pitfalls to Avoid

1. **❌ Don't Test Implementation Details**
   ```javascript
   // Bad: Tests internal state
   expect(settingsManagerRef.current).toBeDefined();
   
   // Good: Tests user-visible outcome
   expect(result.current.getGameSettings()).toBeDefined();
   ```

2. **❌ Don't Use Magic Values**
   ```javascript
   // Bad: Magic numbers
   expect(playerHand.length).toBe(5);
   
   // Good: Use constants or explain values
   expect(playerHand.length).toBe(CARD_COUNTS.SINGLE);
   ```

3. **❌ Don't Test Multiple Things**
   ```javascript
   // Bad: Multiple behaviors in one test
   it('initializes game and handles card selection', async () => {});
   
   // Good: Separate concerns
   it('I can start a new game', async () => {});
   it('I can select cards from my hand', async () => {});
   ```

## 🚀 Writing New Tests

1. **Start with User Story**
   - Who is the user?
   - What do they want to do?
   - What should happen?

2. **Use Helper Functions**
   - Check existing utilities first
   - Create new helpers for common patterns
   - Keep tests DRY

3. **Follow the Pattern**
   - User story format
   - Given-When-Then structure
   - Clear expectations

## 📚 Example Test

```javascript
describe('As a player who wants to place cards strategically', () => {
  it('I can take my time to examine cards before deciding where to place them', async () => {
    // Given: I have started a game and have cards to play
    const { result } = renderHook(() => useGameState());
    await startNewGameSuccessfully(result);
    
    // When: I examine different cards in my hand
    const { firstCard, secondCard } = await simulateCardExamination(result);
    
    // Then: I can switch between cards freely
    expect(result.current.state.selectedCard).toBe(secondCard);
    expect(result.current.state.selectedCard).not.toBe(firstCard);
    
    // And: The game remains in a playable state
    expect(result.current.state).toBePlayable();
  });
});
```

## 🔄 Migration Strategy

When converting existing tests to behavioral tests:

1. Create new behavioral test file alongside existing tests
2. Convert tests one category at a time
3. Maintain coverage during transition
4. Remove old tests once behavioral tests are complete

## ✅ Test Review Checklist

- [ ] Follows user story format
- [ ] Uses Given-When-Then structure
- [ ] Tests behavior, not implementation
- [ ] Uses helper functions appropriately
- [ ] Has clear, descriptive names
- [ ] Includes error cases
- [ ] Maintains test isolation
- [ ] Runs in reasonable time

## 🛠️ Tools and Utilities

- `gameStateTestUtils.js` - Common test helpers
- `testSetup.js` - Test environment setup
- Custom matchers for readable assertions
- Mock utilities for external dependencies

Remember: Tests should tell a story about how users interact with our game. They serve as both verification and documentation.
