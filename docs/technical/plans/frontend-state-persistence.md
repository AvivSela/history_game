# FE-018: Frontend State Persistence Plan

**[Status: ✅ COMPLETED]**

*Implement persistent game state in the Timeline Game frontend using localStorage, so users can resume their game after a refresh or browser restart.*

## 📋 Overview

**Technical Debt/Feature ID**: FE-018  
**Title**: Frontend State Persistence  
**Priority**: 🟡 Medium Priority  
**Estimated Effort**: 1 day  
**Status**: Completed  
**Depends on**: FE-004 (State Management Consolidation)

## 🎯 Problem Statement

Currently, all game state is stored in memory (React state). If the user refreshes the page or closes/reopens the browser, all progress is lost and the game resets. This leads to a poor user experience, especially for longer games or accidental refreshes.

## 🏆 Goals
- [x] Persist all relevant game state in localStorage
- [x] Restore game state on page load if available
- [x] Ensure no sensitive or unnecessary data is persisted
- [x] Provide a way to reset/clear saved state
- [x] Maintain compatibility with FE-004 single-source-of-truth state management

## 📊 What State Should Be Persisted?
Persist the following keys from the game state:
- `timeline`
- `playerHand`
- `aiHand`
- `cardPool`
- `gameStatus`
- `currentPlayer`
- `gameMode`
- `difficulty`
- `score`
- `attempts`
- `startTime`
- `turnStartTime`
- `gameStats`
- `turnHistory`
- `achievements`
- `aiOpponent`
- `timelineAnalysis`
- `selectedCard`

**Do NOT persist:**
- `isLoading`, `error`, or other UI-only/transient state

## 🗄️ Where/How to Persist?
- Use `localStorage` (browser built-in) with fallback to `sessionStorage`
- Store as a single JSON string under a versioned key, e.g. `timelineGameState-v1.0.0`
- Include version in storage key to handle schema changes gracefully
- On state change, save relevant state to localStorage
- On app load, check for saved state and initialize from it if present
- Handle storage events for cross-tab synchronization
- Respect localStorage size limits (5MB per domain)

## 🛠️ Implementation Steps

### 1. Utility Functions
- [x] `saveGameStateToStorage(state)`
- [x] `loadGameStateFromStorage()`
- [x] `clearGameStateFromStorage()` (for manual reset)

### 2. Integrate with useGameState
- [x] On mount: check localStorage and initialize state if found
- [x] On state change: save relevant state to localStorage
- [x] Add a function to clear/reset saved state (for new game, etc.)

### 3. Error Handling & Fallbacks
- [x] Handle corrupted/invalid JSON gracefully
- [x] Fallback to default state if loading fails
- [x] Fallback to sessionStorage if localStorage is unavailable (incognito mode)
- [x] Handle storage quota exceeded errors
- [x] Implement storage event handling for cross-tab sync

### 4. Versioning (Required)
- [x] Use versioned storage keys (e.g., `timelineGameState-v1.0.0`)
- [x] Add a `version` field to persisted state for schema validation
- [x] On load, check version and migrate/ignore if incompatible
- [x] Handle migration between different versions gracefully

### 5. UI/UX
- [x] Optionally, add a "Reset Game" or "Clear Saved Game" button
- [x] Notify user if a saved game is restored

### 6. Testing
- [x] Test persistence across refreshes and browser restarts
- [x] Test reset/clear functionality
- [x] Test edge cases (corrupted data, version mismatch)
- [x] Test localStorage quota exceeded scenarios
- [x] Test fallback to sessionStorage
- [x] Test cross-tab synchronization
- [x] Test incognito/private browsing mode

## 🔄 Rollback Plan
- Feature is isolated; can be disabled by removing localStorage integration
- Keep backup of previous useGameState implementation
- Add feature flag if needed

## ✅ Acceptance Criteria
- [x] Game state is restored after refresh/browser restart
- [x] Only relevant state is persisted (no UI-only or sensitive data)
- [x] User can reset/clear saved state
- [x] No errors on corrupted or missing data
- [x] Graceful fallback to sessionStorage if localStorage unavailable
- [x] Versioned storage keys handle schema changes
- [x] Cross-tab synchronization works correctly
- [x] All tests pass
- [x] No regression in game functionality

## 📋 Checklist
- [x] Implement utility functions for save/load/clear
- [x] Integrate with useGameState (mount/load, state change/save)
- [x] Add error handling for corrupted data
- [x] Add versioning support
- [x] Add UI for reset/clear (optional)
- [x] Test persistence and reset
- [x] Code review and merge

## ⏳ Estimated Effort
- Implementation: 0.5 day
- Testing: 0.25 day
- Review & polish: 0.25 day
- **Total: 1 day**

## 📅 Status
- **Planned**: —
- **In Progress**: —
- **Completed**: ✅

---

**Reference:**
- [FE-004: State Management Consolidation Plan](./FE-004-State-Management-Plan.md) 