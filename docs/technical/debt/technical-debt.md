# Technical Debt Tracker

> *"Technical debt is like financial debt - you borrow time now by taking shortcuts, but you'll have to pay it back later with interest."*

## 📊 Overview

This document tracks technical debt in the Timeline Game project, helping us prioritize refactoring efforts and maintain code quality. Technical debt is categorized by impact, effort, and urgency to guide development decisions.

## 🎯 Current Status

**Last Updated**: $(date)
**Total Debt Items**: 59
**High Priority Items**: 17
**Estimated Refactoring Time**: 154 days

## 📋 Debt Categories

### 🔴 High Priority (Critical)
- **Impact**: Blocks new features, causes bugs, security issues
- **Effort**: High (2+ days)
- **Urgency**: Immediate attention required

### 🟡 Medium Priority (Important)
- **Impact**: Slows development, poor user experience
- **Effort**: Medium (1-2 days)
- **Urgency**: Address within 2-4 weeks

### 🟢 Low Priority (Nice to Have)
- **Impact**: Code quality, maintainability
- **Effort**: Low (<1 day)
- **Urgency**: Address when convenient

## 🔍 Debt Discovery Methods

### Automated Detection
- [ ] ESLint rules for code smells
- [ ] SonarQube integration
- [ ] Bundle size monitoring
- [ ] Performance regression tests
- [ ] Test coverage analysis

### Manual Review
- [ ] Code review checklists
- [ ] Architecture review sessions
- [ ] Performance audits
- [ ] Security assessments
- [ ] User experience reviews

## 📝 Debt Items

### Frontend Technical Debt

#### 🔴 High Priority

| ID | Title | Description | Impact | Effort | Created | Status |
|----|-------|-------------|---------|---------|---------|---------|
| FE-001 | Animation Performance | ✅ **RESOLVED** - Implemented unified animation system with 30-40% performance improvement, device optimization, and accessibility support | High | 3 days | $(date) | **Resolved** |
| FE-002 | Component Organization | ✅ **RESOLVED** - Complete reorganization with consistent naming, logical grouping, and standardized import patterns | Medium | 2 days | $(date) | **Resolved** |
| FE-028 | Keyboard Accessibility for Drag & Drop | Timeline drag-and-drop functionality lacks keyboard controls and proper ARIA attributes, making the game inaccessible for users relying on keyboards or assistive technologies. Implement full keyboard interaction and update accessibility guidelines. | High | 2 days | $(date) | Open |

#### 🟡 Medium Priority

| ID | Title | Description | Impact | Effort | Created | Status |
|----|-------|-------------|---------|---------|---------|---------|
| FE-003 | Test File Consistency | ✅ **RESOLVED** - Standardized all test files to .test.jsx extension, eliminated duplicates, and improved test organization with comprehensive documentation | Low | 1 day | $(date) | **Resolved** |
| FE-004 | State Management | ✅ **RESOLVED** - Consolidated duplicate state management between Game.jsx and useGameState hook to create a single source of truth. Enhanced useGameState with missing properties (cardPool, aiOpponent), consolidated initialization logic, and maintained backward compatibility. Reduced complexity and improved maintainability. | Medium | 2 days | $(date) | **Resolved** |
| FE-005 | API Error Handling | Inconsistent error handling across API calls | Medium | 1 day | $(date) | Open |
| FE-006 | Mobile Optimization | Mobile-specific optimizations could be improved | Medium | 1 day | $(date) | Open |
| FE-025 | Internationalization Framework | Hard-coded English text across components prevents localization and restricts user base. Integrate an internationalization (i18n) solution with translation management. | Medium | 2 days | $(date) | Open |

#### 🟢 Low Priority

| ID | Title | Description | Impact | Effort | Created | Status |
|----|-------|-------------|---------|---------|---------|---------|
| FE-007 | Documentation | ✅ **RESOLVED** - Added comprehensive JSDoc documentation to all major components including GameBoard, Card, Timeline, PlayerHand, GameHeader, GameStatus, TurnIndicator, AIHand, LoadingScreen, ErrorScreen, AnimationControls, Game page, Home page, useGameState hook, and gameLogic utilities | Low | 0.5 days | $(date) | **Resolved** |
| FE-008 | CSS Organization | ✅ **RESOLVED** - Reorganized CSS structure with component-specific styles colocated with their components. Moved card, timeline, button, navigation, loading, and feedback styles to dedicated component CSS files. Added comprehensive documentation and maintained global styles in index.css | Low | 0.5 days | $(date) | **Resolved** |
| FE-009 | Constants Management | ✅ **RESOLVED** - Consolidated all scattered constants into centralized gameConstants.js with comprehensive organization by category (UI dimensions, timing, AI config, game logic, performance, API, accessibility, styling, development). Added detailed documentation and migration guide. Eliminated magic numbers across 15+ files. | Low | 0.5 days | $(date) | **Resolved** |
| FE-010 | PlayerHand New Card Animation Test | The test for 'should NOT auto-select the new card after addition animation' was removed due to persistent mocking issues with performance.now in the test environment. A robust test should be re-implemented to ensure this behavior is covered. | Low | 0.5 days | $(date) | Open |
| FE-011 | Failing Test Implementation | Two tests are currently failing: 1) 'New Card Animation' test suite is empty and needs proper implementation, 2) Test looking for '[data-testid="player-card-wrapper"]' element cannot find it. These tests need to be properly implemented or removed to maintain test suite integrity. | Medium | 1 day | $(date) | Open |
| FE-020 | Feedback Timeout Tests | Need to create robust tests for feedback timeout functionality in useGameState hook. Previous tests were removed due to flakiness with mock data and timer handling. Should implement tests that properly verify both success and error feedback messages disappear after 3 seconds using reliable mock data and proper timer management. | Low | 0.5 days | $(date) | Open |
| FE-012 | Console Logging in Production | Multiple console.log, console.error, and console.warn statements found throughout the codebase (15+ files). These should be replaced with proper logging system or removed for production builds. | Low | 1 day | $(date) | Open |
| FE-013 | Duplicate Component Files | ✅ **RESOLVED** - Duplicate PlayerHand components already resolved (only one exists in `src/components/game/PlayerHand/`). No duplicates found during implementation. | Medium | 0.5 days | $(date) | **Resolved** |
| FE-014 | Backup Directory Cleanup | ✅ **RESOLVED** - Removed entire `backup/` directory, eliminating 31KB of unnecessary backup files and reducing repository size. | Low | 0.5 days | $(date) | **Resolved** |
| FE-015 | Deep Import Paths | ✅ **RESOLVED** - Implemented comprehensive path aliases (@components, @utils, @constants, @pages, @hooks, @tests) in vite.config.js and jsconfig.json. Replaced all deep import paths (../../../) with clean aliases across 8+ component files. | Medium | 1 day | $(date) | **Resolved** |
| FE-016 | Inconsistent Error Handling | Error handling patterns vary across components - some use try-catch, others use .catch(), and some have no error handling at all. Should standardize error handling approach. | Medium | 1.5 days | $(date) | Open |
| FE-017 | Memory Leaks in Timers | ✅ **RESOLVED** - Fixed setTimeout cleanup in Feedback component. Verified AnimationControls already had proper setInterval cleanup. Documented timer usage patterns for future maintenance. | Medium | 1 day | $(date) | **Resolved** |
| FE-018 | Settings Page Test Coverage | Several modal/ARIA/keyboard tests were removed due to persistent test environment issues and need to be re-implemented for full coverage. | Low | 0.5 days | $(date) | In Progress |
| FE-019 | React Router Import Issue | ✅ **RESOLVED** - Fixed white screen issue by removing unsupported UNSAFE_future import from react-router-dom. Simplified Router configuration and resolved build error that was preventing application from loading. | High | 0.5 days | $(date) | **Resolved** |
| FE-021 | Congratulations Modal Auto-Close | ✅ **RESOLVED** - Removed automatic restart timeout that was closing the congratulations modal after 3 seconds. Now the modal stays open until the user manually chooses to restart or go home, providing better user experience and control. | Medium | 0.5 days | $(date) | **Resolved** |
| FE-022 | Layout Fix Implementation | ✅ **RESOLVED** - Successfully implemented vertical layout fix for Timeline and PlayerHand components. Removed horizontal layout on large screens, optimized component spacing and positioning for vertical flow, improved responsive behavior, and maintained all functionality. All 462 tests pass. | Medium | 3 hours | $(date) | **Resolved** |
| FE-023 | useGameState SettingsManager Testing Issues | Two critical testing bugs in useGameState.test.js: 1) Test incorrectly expects console.warn when SettingsManager constructor fails (warning never occurs in actual code flow), 2) Mock instance mismatch where tests create different mock instances than what the hook uses, causing assertions to fail. Comprehensive fix plan created (USEgamestate_SETTINGS_TESTING_FIX_PLAN.md) with solutions for both immediate fixes and improved testing infrastructure. | High | 1 day | $(date) | Identified |
| FE-024 | useGameState Unit Tests to Behavioral Tests Conversion | ✅ **RESOLVED** - Successfully converted all useGameState tests to behavioral tests. Created useGameStateBehavior.test.jsx with comprehensive user story coverage, improved test maintainability, and better documentation of user flows. Added new test utilities and custom matchers. Removed deprecated unit tests after verifying complete coverage. | Medium | 2 days | $(date) | **Resolved** |
| FE-026 | PropTypes / Type Checking | React components do not enforce PropTypes or use TypeScript, leading to potential runtime errors and harder maintenance. Introduce PropTypes or migrate to TypeScript for strong typing. | Low | 1 day | $(date) | Open |
| FE-027 | CSS Class Naming Consistency | CSS classes use inconsistent naming conventions causing style collisions and reduced maintainability. Adopt BEM or CSS Modules and refactor existing styles. | Low | 1 day | $(date) | Open |
| FE-029 | ErrorScreen Callback Error Handling | ✅ **RESOLVED** - Added comprehensive error handling to ErrorScreen component callbacks with try-catch blocks, preventing callback errors from bubbling up and causing test failures. Implemented proper JSDoc documentation and maintained component functionality while improving robustness. | Medium | 0.5 days | $(date) | **Resolved** |
| FE-030 | Statistics Routes Code Duplication | The statistics.js routes file contains 660+ lines with repetitive validation and error handling patterns. Extract common middleware for input validation, error handling, and response formatting to reduce code duplication and improve maintainability. | Medium | 2 days | $(date) | Open |
| FE-031 | Large Function Complexity in Statistics | Functions in statistics.js utilities are doing too much (database queries, data transformation, business logic, error handling). Apply Single Responsibility Principle by splitting into focused functions for data fetching, calculations, and formatting. | Medium | 1.5 days | $(date) | Open |
| FE-032 | Magic Numbers in API Limits | Hard-coded values scattered throughout statistics routes (max 10 players, max 1000 leaderboard limit, etc.). Extract to constants file with proper documentation and validation. | Low | 0.5 days | $(date) | Open |
| FE-033 | Inconsistent Error Response Format | Error messages and response structures vary across statistics API endpoints. Standardize error response format with consistent structure, error codes, and user-friendly messages. | Medium | 1 day | $(date) | Open |
| FE-034 | Dead Code in gameTypes.js | The gameTypes.js file contains JSDoc type definitions that are not imported or used anywhere in the codebase. While prepared for future TypeScript migration, it currently represents dead code that should be excluded from coverage reports and documented for future use. | Low | 0.5 days | $(date) | Open |
| FE-035 | Settings Card Count Display Issue | The settings page displays the total number of cards (user hand + timeline cards) instead of just the initial cards in the user's hand at the beginning of the game. This is confusing for users who expect the setting to represent their starting hand size, not the combined total. | Medium | 1 day | $(date) | Open |
| FE-036 | Skipped Test Cases in useSettings | Eight test cases in useSettings.test.js are currently skipped (lines 340-572) including critical functionality like error handling, validation errors, and callback testing. These tests need to be re-implemented or removed. | Medium | 1.5 days | $(date) | Open |
| FE-037 | Skipped Cache Tests | Two cache tests in cache.test.js are skipped (lines 124, 138) for cache eviction and access time functionality. These core caching features lack test coverage. | Medium | 1 day | $(date) | Open |
| FE-038 | Timer Memory Leaks in Components | Components with setTimeout/setInterval usage may have memory leaks if cleanup is not properly handled. Audit PlayerHand.jsx, Timeline.jsx, SettingsContext.jsx, and CardCountSlider.jsx for proper timer cleanup. | High | 2 days | $(date) | Open |
| FE-039 | Large Console Logging in Production | Found 421 console.* statements across 35 files in the codebase. Production builds should remove or replace these with proper logging system to reduce bundle size and improve performance. | Medium | 2 days | $(date) | Open |
| FE-040 | TODO Comments in Production Code | Found TODO comment in gameTypes.js (line 12) indicating incomplete integration. Review all TODO comments and either implement the functionality or remove the comments. | Low | 0.5 days | $(date) | Open |
| FE-041 | Unused Frontend Dependencies | Found 4 unused devDependencies (@commitlint/config-conventional, @testing-library/user-event, @vitest/coverage-v8, eslint-config-prettier, tailwindcss) that increase node_modules size (19MB). Clean up unused packages to reduce install time and bundle size. | Medium | 0.5 days | $(date) | Open |
| FE-042 | Missing React PropTypes Validation | Missing prop-types dependency for React component validation. Components like InsertionPoint.jsx lack proper prop validation, reducing type safety and development experience. Add prop-types and implement validation across components. | Medium | 1 day | $(date) | Open |
| FE-043 | Path Alias Resolution Issues | Found 7 missing dependency warnings due to path alias imports not properly resolved in build tools. This can cause bundling issues and import errors. Fix jsconfig.json and build configuration to properly resolve @constants, @utils, @hooks aliases. | Medium | 1 day | $(date) | Open |
| FE-044 | Large CSS Bundle Optimization | CSS bundles are large (Game.css 60KB, index.css 95KB) and could benefit from optimization. Implement CSS minification, unused CSS removal, and potential CSS-in-JS migration for better performance. | Low | 2 days | $(date) | Open |
| FE-045 | God Hook Anti-Pattern in useGameState | useGameState.js is 1,018 lines handling 15+ responsibilities (game state, API calls, persistence, validation). Violates Single Responsibility Principle and is difficult to maintain and test. Extract into focused hooks: useGameSession, useCardOperations, useGamePersistence, useGameAPI. | High | 15 days | $(date) | Open |
| FE-046 | Complex CardManager Component | CardManager.jsx (465 lines) violates Single Responsibility with 9 state variables, mixed data fetching, CRUD operations, and rendering logic. Extract custom hooks (useCardCRUD, useCardFiltering, useCardValidation) and split into presentational components. | High | 10 days | $(date) | Open |
| FE-047 | Tight Component Coupling | Components like Game.jsx pass entire gameState objects instead of specific props, creating tight coupling and making components difficult to test in isolation. Implement facade pattern and proper prop interfaces. | High | 10 days | $(date) | Open |
| FE-048 | Over-complex Test Architecture | Test files like SettingsContext.test.jsx (606 lines) and useSettings.test.js (602 lines) have excessive mocking and test implementation details vs. behavior. Brittle tests don't catch real issues. Refactor to behavior-driven testing. | Medium | 5 days | $(date) | Open |
| FE-049 | Missing Service Layer Architecture | Business logic is scattered throughout hooks and components with direct localStorage usage, API calls mixed with UI logic, and no domain models. Create service layers and domain objects for better separation of concerns. | High | 10 days | $(date) | Open |
| FE-050 | Context Over-engineering | SettingsContext.jsx has complex reducer patterns for simple state and mixes context state with business logic. Simplify context usage and separate business logic from state management. | Medium | 3 days | $(date) | Open |
| FE-051 | Component Responsibility Violations | Multiple components violate Single Responsibility Principle by handling data fetching, state management, and rendering. Components should focus on single concerns with proper separation. | Medium | 8 days | $(date) | Open |

### Backend Technical Debt

#### 🔴 High Priority

| ID | Title | Description | Impact | Effort | Created | Status |
|----|-------|-------------|---------|---------|---------|---------|
| BE-001 | Database Integration | Hardcoded data in server.js needs proper database. **Production migration plan created** - comprehensive roadmap for converting stub service to production-ready backend with database integration, security, monitoring, and deployment infrastructure. | High | 5 days | $(date) | **Planned** |
| BE-002 | Error Handling | Basic error handling needs improvement | Medium | 2 days | $(date) | Open |
| BE-010 | Authentication & Authorization | API endpoints are publicly accessible without authentication or authorization, posing security risks. Implement JWT-based auth and role-based access control. | High | 3 days | $(date) | Open |

#### 🟡 Medium Priority

| ID | Title | Description | Impact | Effort | Created | Status |
|----|-------|-------------|---------|---------|---------|---------|
| BE-003 | API Documentation | Missing OpenAPI/Swagger documentation | Medium | 1 day | $(date) | Open |
| BE-004 | Logging Strategy | Logger implementation could be enhanced | Low | 1 day | $(date) | Open |
| BE-011 | Rate Limiting | No rate limiting middleware is in place, leaving the API vulnerable to abuse and denial-of-service attacks. Add rate limiting via middleware like express-rate-limit. | Medium | 1 day | $(date) | Open |

#### 🟢 Low Priority

| ID | Title | Description | Impact | Effort | Created | Status |
|----|-------|-------------|---------|---------|---------|---------|
| BE-005 | Test Coverage | Limited test coverage for backend | Low | 2 days | $(date) | Open |
| BE-006 | Configuration Management | Environment variables could be better organized | Low | 0.5 days | $(date) | Open |
| BE-007 | Hardcoded Sample Data | Server.js contains 12 hardcoded sample events that should be moved to a separate data file or database. This makes the server file large and hard to maintain. | Medium | 1 day | $(date) | Open |
| BE-008 | Missing Input Validation | API endpoints lack proper input validation for parameters like count, category names, and request bodies. Should implement validation middleware. | Medium | 1.5 days | $(date) | Open |
| BE-009 | Inconsistent API Response Format | Some endpoints return different response structures. Should standardize API response format across all endpoints. | Low | 1 day | $(date) | Open |
| BE-012 | Error Handling Tests | Unit tests do not cover errorHandler middleware, reducing confidence in error responses. Add comprehensive tests for error handling and edge cases. | Low | 1 day | $(date) | Open |
| BE-013 | Statistics API Service Layer | Statistics routes directly contain business logic, making them hard to test and maintain. Implement service layer pattern to separate business logic from route handlers, improving testability and code organization. | Medium | 2 days | $(date) | Open |
| BE-014 | Database Query Organization | ✅ **RESOLVED** - Implemented comprehensive query builder pattern with QueryBuilder, CardQueryBuilder, and StatisticsQueryBuilder classes. Separated query construction from business logic, eliminated code duplication, and achieved 100% test coverage. Created refactored database functions and comprehensive test suite. | Low | 1 day | $(date) | **Resolved** |
| BE-015 | API Response Performance | Large response objects in statistics endpoints could benefit from pagination, compression, and caching. Implement response optimization for better performance and user experience. | Medium | 1.5 days | $(date) | Open |
| BE-016 | Database Functions Integration | ✅ **RESOLVED** - Successfully integrated query builders into the main codebase. Replaced original database.js with refactored version, verified all 310 tests pass, and ensured backward compatibility. All database functions now use the new query builder pattern. | Medium | 1 day | $(date) | **Resolved** |
| BE-017 | CardService JSDoc Documentation | CardService methods lack comprehensive JSDoc comments making the API harder to understand and maintain. Add detailed JSDoc documentation for all public methods with parameter descriptions, return types, and example usage. | Low | 0.5 days | $(date) | Open |
| BE-018 | Test File Naming Consistency | Test file `admin-routes-prisma.test.js` doesn't follow consistent naming pattern with other test files. Standardize naming conventions across all test files for better organization. | Low | 0.25 days | $(date) | Open |
| BE-019 | Test Utilities Extraction | Complex mock setups in test files (especially CardService and admin routes tests) contain repetitive code. Extract common test utilities and factories to reduce duplication and improve maintainability. | Medium | 1 day | $(date) | Open |
| BE-020 | Date Handling Consistency | Mix of string and Date object handling in CardService could be more robust. Implement consistent date validation and conversion utilities to handle edge cases like invalid date strings. | Low | 0.5 days | $(date) | Open |
| BE-021 | SQL Injection Vulnerabilities in Leaderboards | Dynamic SQL construction in leaderboards.js with string interpolation for ORDER BY clauses (`ORDER BY ps.${sortBy} ${order.toUpperCase()}`) is vulnerable to SQL injection attacks. Use parameter validation with allowlist for sort columns. | High | 2 days | $(date) | Open |
| BE-022 | Query Builder God Methods | The `select()` method in queryBuilders.js is 130+ lines with excessive branching and complex parameter validation. Split into smaller focused methods like `validateOptions()`, `buildFilters()`, `applyOrderAndPagination()`. | High | 4 days | $(date) | Open |
| BE-023 | Statistics Code Duplication | Statistical calculation patterns in statistics.js are repeated 4+ times with identical accuracy and win rate calculations. Extract common `calculateMetrics(row)` utility function to eliminate duplication. | High | 3 days | $(date) | Open |
| BE-024 | Parameter Validation Duplication | Similar validation patterns repeated across multiple methods in queryBuilders.js for categories, difficulties, limits, offsets. Extract common validation functions. | High | 2 days | $(date) | Open |
| BE-025 | Complex Route Handlers | Random events handler in server.js is 85 lines with complex parameter parsing and validation. Extract to service layer following separation of concerns. | Medium | 3 days | $(date) | Open |
| BE-026 | Cache Error Recovery Missing | Cache failures in cache.js are logged but lack fallback strategies, potentially impacting performance. Implement circuit breaker pattern for graceful degradation. | Medium | 2 days | $(date) | Open |
| BE-027 | Leaderboard Code Duplication | Four leaderboard methods in leaderboards.js share nearly identical structure with same validation, caching, and SQL execution patterns. Extract template method pattern. | High | 4 days | $(date) | Open |
| BE-028 | Magic Numbers in Backend | Hard-coded values scattered throughout backend files (query limits of 1000, cache TTLs, default time periods of 30 days/12 weeks). Extract to configuration constants. | Medium | 1 day | $(date) | Open |
| BE-029 | Complex SQL in JavaScript | Large embedded SQL strings in statistics.js make testing and maintenance difficult. Move to separate SQL files or improve query builder pattern. | High | 4 days | $(date) | Open |
| BE-030 | Inconsistent Error Handling in Routes | Mixed error handling patterns across server.js endpoints with different error response formats. Standardize error handling middleware and response structure. | Medium | 1.5 days | $(date) | Open |
| BE-031 | Unused Backend Dependencies | Found unused dependencies: socket.io (main dependency not being used), @types/jest, concurrently (devDependencies). Clean up to reduce security surface and installation overhead. | Low | 0.25 days | $(date) | Open |
| BE-032 | Missing Backend Dependencies | Script files require axios but it's not in package.json dependencies, causing potential runtime errors. Add missing dependencies or remove unused scripts. | Low | 0.25 days | $(date) | Open |
| BE-033 | Large Admin Routes File | admin.js routes file is 1,351 lines with mixed concerns handling CRUD operations, validation, and response formatting. Violates Single Responsibility Principle. Extract service layer and split into focused route handlers. | High | 8 days | $(date) | Open |
| BE-034 | Backend Service Layer Inconsistency | Backend has some services (CardService, GameMoveService) but admin routes bypass service layer and handle business logic directly. Create consistent service layer architecture across all routes. | Medium | 5 days | $(date) | Open |
| BE-035 | Route Handler Complexity | Multiple route files (admin.js, statistics.js, gameSessions.js) contain complex business logic mixed with HTTP handling. Extract business logic into service layer for better testability and maintainability. | Medium | 6 days | $(date) | Open |

### Infrastructure Technical Debt

#### 🟡 Medium Priority

| ID | Title | Description | Impact | Effort | Created | Status |
|----|-------|-------------|---------|---------|---------|---------|
| INF-001 | Docker Setup | Missing containerization for deployment | Medium | 2 days | $(date) | Open |
| INF-002 | CI/CD Pipeline | No automated testing and deployment | Medium | 3 days | $(date) | Open |
| INF-007 | Production Build Scripts | Missing dedicated scripts and configurations for building and serving optimized production bundles for both frontend and backend. Create unified build scripts and documentation. | Medium | 1 day | $(date) | Open |

#### 🟢 Low Priority

| ID | Title | Description | Impact | Effort | Created | Status |
|----|-------|-------------|---------|---------|---------|---------|
| INF-003 | Monitoring | No application monitoring or logging | Low | 2 days | $(date) | Open |
| INF-004 | Backup Strategy | No data backup or recovery plan | Low | 1 day | $(date) | Open |
| INF-005 | Missing Environment Files | No .env.example files for either frontend or backend to guide developers on required environment variables. **Quick start guide created** with environment configuration templates and setup instructions. | Low | 0.5 days | $(date) | **Planned** |
| INF-006 | No Health Check Monitoring | Backend has a health check endpoint but no monitoring or alerting system to track server status. | Medium | 1 day | $(date) | Open |
| INF-008 | Load Testing | No load or stress testing in place, risking undiscovered performance bottlenecks under high traffic. Integrate load testing tools and CI automation. | Low | 1 day | $(date) | Open |
| INF-009 | Dependency Update Automation | Automated dependency update tools (Dependabot/Renovate) are not configured, increasing the risk of outdated or vulnerable packages. Enable automatic update workflows. | Low | 0.5 days | $(date) | Open |
| INF-010 | Statistics API Documentation | Missing OpenAPI/Swagger documentation for the new statistics endpoints. Generate comprehensive API documentation with examples, response schemas, and error codes for better developer experience. | Medium | 1 day | $(date) | Open |
| INF-011 | Statistics Database Indexing | While basic indexes exist, the statistics tables could benefit from additional composite indexes for complex queries. Analyze query patterns and add appropriate indexes for better performance. | Low | 1 day | $(date) | Open |
| INF-012 | Security Vulnerabilities in Dependencies | Found 4 security vulnerabilities across frontend and backend: 1 critical form-data boundary vulnerability (both), 1 moderate esbuild dev server vulnerability (frontend), 1 moderate vite dependency vulnerability (frontend). Requires immediate `npm audit fix` and automated dependency scanning setup. | High | 1 day | $(date) | Open |

## 🎯 Refactoring Priorities

### Sprint 1 (High Impact, Low Effort)
1. **FE-007**: Documentation ✅
2. **FE-008**: CSS Organization ✅
3. **FE-009**: Constants Management ✅

### Sprint 2 (Critical Security & Performance)
1. **INF-012**: Security Vulnerabilities in Dependencies 🚨 URGENT
2. **BE-021**: SQL Injection Vulnerabilities in Leaderboards 🚨 URGENT
3. **FE-038**: Timer Memory Leaks in Components
4. **FE-045**: God Hook Anti-Pattern in useGameState 🚨 ARCHITECTURAL
5. **BE-022**: Query Builder God Methods
6. **BE-023**: Statistics Code Duplication
7. **BE-027**: Leaderboard Code Duplication
8. **BE-029**: Complex SQL in JavaScript
9. **BE-033**: Large Admin Routes File

### Sprint 3 (Architectural Refactoring)
1. **FE-046**: Complex CardManager Component
2. **FE-047**: Tight Component Coupling
3. **FE-049**: Missing Service Layer Architecture
4. **BE-034**: Backend Service Layer Inconsistency
5. **BE-035**: Route Handler Complexity

### Sprint 4 (Code Quality & Testing)
1. **FE-039**: Large Console Logging in Production
2. **FE-048**: Over-complex Test Architecture
3. **FE-050**: Context Over-engineering
4. **FE-051**: Component Responsibility Violations
5. **BE-024**: Parameter Validation Duplication
6. **BE-025**: Complex Route Handlers
7. **BE-030**: Inconsistent Error Handling in Routes

### Sprint 5 (Legacy High Impact Items)
1. **FE-036**: Skipped Test Cases in useSettings
2. **FE-037**: Skipped Cache Tests
3. **BE-001**: Database Integration
4. **BE-002**: Error Handling
5. **FE-011**: Failing Test Implementation

### Sprint 6 (Dependency & Bundle Optimization)
1. **FE-041**: Unused Frontend Dependencies
2. **BE-031**: Unused Backend Dependencies  
3. **BE-032**: Missing Backend Dependencies
4. **FE-042**: Missing React PropTypes Validation
5. **FE-043**: Path Alias Resolution Issues

### Sprint 7 (Low Impact, Low Effort)
1. **BE-028**: Magic Numbers in Backend
2. **FE-040**: TODO Comments in Production Code
3. **FE-044**: Large CSS Bundle Optimization
4. **FE-032**: Magic Numbers in API Limits
5. **FE-033**: Inconsistent Error Response Format
6. **BE-009**: Inconsistent API Response Format
7. **INF-005**: Missing Environment Files

### Sprint 8 (Infrastructure)
1. **INF-001**: Docker Setup
2. **INF-002**: CI/CD Pipeline
3. **INF-003**: Monitoring
4. **INF-004**: Backup Strategy
5. **INF-006**: No Health Check Monitoring
6. **INF-010**: Statistics API Documentation
7. **INF-011**: Statistics Database Indexing
8. **BE-026**: Cache Error Recovery Missing

## 📈 Debt Metrics

### Monthly Tracking

| Month | New Debt | Resolved Debt | Net Change | Total Debt |
|-------|----------|---------------|------------|------------|
| $(date +%B %Y) | 51 | 9 | +42 | 59 |

### Debt by Category

| Category | Count | Total Effort | Priority Distribution |
|----------|-------|--------------|----------------------|
| Frontend | 31 | 78.5 days | 🔴7 🟡14 🟢10 |
| Backend | 26 | 60.25 days | 🔴9 🟡9 🟢8 |
| Infrastructure | 9 | 15.5 days | 🔴1 🟡4 🟢4 |

### Recent Achievements
- ✅ **FE-001 Animation Performance**: Completed with 30-40% performance improvement
- ✅ **FE-002 Component Organization**: Complete reorganization with consistent structure and imports
- ✅ **FE-003 Test File Consistency**: Standardized all test files to .test.jsx extension, eliminated duplicates
- ✅ **FE-007 Documentation**: Added comprehensive JSDoc documentation to all major components and utilities
- ✅ **FE-008 CSS Organization**: Reorganized CSS structure with component-specific styles colocated with their components
- ✅ **FE-009 Constants Management**: Consolidated all scattered constants into centralized gameConstants.js with comprehensive organization by category
- ✅ **FE-013 Duplicate Component Files**: Resolved - verified only one PlayerHand component exists
- ✅ **FE-014 Backup Directory Cleanup**: Removed entire backup directory, eliminating 31KB of unnecessary files
- ✅ **FE-015 Deep Import Paths**: Implemented comprehensive path aliases (@components, @utils, @constants, @pages, @hooks, @tests) across 8+ files
- ✅ **FE-017 Memory Leaks in Timers**: Fixed setTimeout cleanup in Feedback component, verified existing cleanup patterns
- ✅ **FE-004 State Management**: Consolidated duplicate state management between Game.jsx and useGameState hook to create a single source of truth. Enhanced useGameState with missing properties (cardPool, aiOpponent), consolidated initialization logic, and maintained backward compatibility
- ✅ **FE-022 Layout Fix Implementation**: Successfully implemented vertical layout fix for Timeline and PlayerHand components. Removed horizontal layout on large screens, optimized component spacing and positioning for vertical flow, improved responsive behavior, and maintained all functionality. All 462 tests pass.
- ✅ **FE-029 ErrorScreen Callback Error Handling**: Added comprehensive error handling to ErrorScreen component callbacks with try-catch blocks, preventing callback errors from bubbling up and causing test failures. Implemented proper JSDoc documentation and maintained component functionality while improving robustness.
- ✅ **Unified Animation System**: Replaced 4 legacy files with 8 optimized modules
- ✅ **Accessibility Support**: Full reduced motion and screen reader support
- ✅ **Device Optimization**: Mobile-specific performance enhancements
- ✅ **Component Structure**: Standardized naming, logical grouping, and import patterns
- ✅ **Test Organization**: Clear test structure with comprehensive documentation
- ✅ **CSS Colocation**: Moved card, timeline, button, navigation, loading, and feedback styles to dedicated component files
- ✅ **Constants Centralization**: Eliminated magic numbers across 15+ files with organized constant categories
- ✅ **Path Alias Implementation**: Clean import structure with comprehensive IDE support
- ✅ **Database Query Organization**: Implemented comprehensive query builder pattern with QueryBuilder, CardQueryBuilder, and StatisticsQueryBuilder classes. Separated query construction from business logic, eliminated code duplication, and achieved 100% test coverage. Created refactored database functions and comprehensive test suite.
- ✅ **Database Functions Integration**: Successfully integrated query builders into the main codebase. Replaced original database.js with refactored version, verified all 310 tests pass, and ensured backward compatibility. All database functions now use the new query builder pattern.

## 🆕 Recent Technical Debt Analysis (July 2025)

### Analysis Summary
A comprehensive technical debt analysis was conducted across the entire codebase, focusing on:
- Large file complexity analysis
- Code duplication patterns  
- Security vulnerabilities
- Test coverage gaps
- Console logging issues
- Performance concerns

### Critical Security Issues Found 🚨
- **INF-012**: 4 security vulnerabilities in dependencies (1 critical form-data, 2 moderate esbuild/vite) - **IMMEDIATE ACTION REQUIRED**
- **BE-021**: SQL injection vulnerabilities in leaderboard queries - **IMMEDIATE ACTION REQUIRED**
- **FE-038**: Memory leaks from improper timer cleanup in React components

### Major Code Quality Issues
- **BE-022, BE-023, BE-027**: Massive code duplication in backend utilities (990-line files)
- **FE-039**: 421 console.* statements across 35 files impacting production performance
- **BE-029**: Complex SQL embedded in JavaScript reducing maintainability

### Critical Architectural Issues
- **FE-045**: God Hook Anti-Pattern - useGameState.js (1,018 lines) violates Single Responsibility Principle
- **FE-046**: Complex CardManager Component (465 lines) with mixed concerns
- **FE-047**: Tight Component Coupling throughout frontend architecture
- **BE-033**: Large Admin Routes File (1,351 lines) bypassing service layer
- **FE-049**: Missing Service Layer Architecture with business logic scattered throughout components

### Key Findings by Numbers
- **33 new debt items** identified across frontend, backend, and infrastructure
- **17 high-priority items** requiring immediate attention (including architectural issues)
- **115-125 days** estimated total effort for complete resolution
- **Critical architectural debt** discovered with 1,018-line God Hook and tight coupling
- **Dependency vulnerabilities and SQL injection** represent highest security priorities
- **Bundle optimization opportunities** identified with 19MB node_modules and unused dependencies

### Recommended Action Plan
1. **Week 1**: Fix dependency vulnerabilities (`npm audit fix`) and SQL injection vulnerabilities
2. **Week 2-3**: Address memory leaks and code duplication in backend utilities  
3. **Week 4-5**: Clean up console logging and implement proper logging system
4. **Ongoing**: Implement automated dependency scanning (Dependabot/Renovate) and debt detection tools

## 🎯 Phase 3 Statistics & Analytics Debt Items

The following technical debt items were identified during the Phase 3 Statistics & Analytics feature implementation review:

### High Priority Items
- **FE-030**: Statistics Routes Code Duplication (Medium impact, 2 days effort)
- **FE-031**: Large Function Complexity in Statistics (Medium impact, 1.5 days effort)
- **BE-013**: Statistics API Service Layer (Medium impact, 2 days effort)
- **BE-015**: API Response Performance (Medium impact, 1.5 days effort)

### Medium Priority Items
- **FE-032**: Magic Numbers in API Limits (Low impact, 0.5 days effort)
- **FE-033**: Inconsistent Error Response Format (Medium impact, 1 day effort)
- **BE-014**: Database Query Organization (Low impact, 1 day effort)
- **INF-010**: Statistics API Documentation (Medium impact, 1 day effort)
- **INF-011**: Statistics Database Indexing (Low impact, 1 day effort)

### Resolved Items
- ✅ **FE-029**: ErrorScreen Callback Error Handling - Successfully implemented comprehensive error handling with try-catch blocks and proper JSDoc documentation.

## 🧹 Top 20 High-Benefit Cleanup Opportunities ($(date))

Below is a curated list of the twenty cleanup/refactor tasks that are expected to deliver the greatest impact for the least effort. Most map to existing technical-debt IDs; a few are new suggestions and can be added to the tracker during the next update cycle.

| # | Related ID | Area / File(s) | What to Clean Up | Expected Benefit |
|---|------------|---------------|-----------------|-----------------|
| 1 | FE-005 | `timeline-frontend/src/utils/api.js` + call-sites | Standardize API error handling and propagate user-friendly messages | Fewer silent failures, better UX |
| 2 | FE-006 | Frontend layout, CSS & media queries | Complete mobile-first pass to optimise touch targets, spacing & font sizes | Higher mobile engagement |
| 3 | FE-010 | `PlayerHand` tests | Re-implement "new card animation" test removed during previous cleanup | Protects critical animation behaviour |
| 4 | FE-011 | Various tests | Fix empty "New Card Animation" suite & missing `[data-testId]` selectors | Restores full test coverage |
| 5 | FE-012 | Multiple frontend files | Replace `console.*` with logger or remove in production builds | Cleaner console, smaller bundles |
| 6 | FE-016 | Components & hooks | Adopt unified try/catch or error-boundary pattern across UI | Consistent error UX, easier maintenance |
| 7 | FE-018 | `Settings` page tests | Re-implement removed accessibility & keyboard-nav tests | Guarantees a11y compliance |
| 8 | FE-020 | `useGameState` tests | Add robust timeout tests for feedback messages | Prevents regressions in feedback UX |
| 9 | BE-002 | `timeline-backend/middleware/errorHandler.js` | Create central Express error middleware; align HTTP status codes | Predictable API behaviour |
|10 | BE-003 | Entire backend | Generate OpenAPI spec & host Swagger UI route | Faster onboarding, client-side codegen |
|11 | BE-004 | `timeline-backend/utils/logger.js` | Upgrade logger to support log levels & transports (file/stdout) | Better observability |
|12 | BE-005 | Backend routes & models | Increase unit/integration test coverage to >80% | Reduced production bugs |
|13 | BE-007 | `timeline-backend/server.js` | Extract hard-coded sample data to SQL seeds or fixtures | Smaller server file, realistic prod parity |
|14 | BE-008 | Routes (`count`, `category`, body params) | Add validation middleware (e.g. `Joi`, `express-validator`) | Blocks invalid requests early |
|15 | BE-009 | All backend responses | Adopt single response envelope `{ success, data, error }` | Consistency across clients |
|16 | INF-001 | Root + docker-compose | Containerise frontend & backend; include Postgres service | "Works on my machine" parity |
|17 | INF-002 | `.github/workflows/` | Add CI pipeline for linting, tests & build; CD to staging | Faster feedback, safer releases |
|18 | INF-003 & INF-006 | Backend & ops | Wire health-check endpoint to uptime/monitoring service | Early outage detection |
|19 | INF-005 | Repo root | Provide `.env.example` with required vars and docs | Easier setup for new devs |
|20 | NEW (INF-007) | Entire repo | Run `yarn audit`, upgrade vulnerable/outdated deps; enable Dependabot | Improved security & stability |

> **Next steps**: Triage these items into upcoming sprints, create corresponding debt IDs where missing, and update metrics once added.

## 🛠️ Refactoring Guidelines

### Before Starting Refactoring
1. **Create a branch**: `git checkout -b refactor/TECHNICAL_DEBT_ID`
2. **Write tests**: Ensure existing functionality is covered
3. **Document changes**: Update this file and relevant documentation
4. **Get review**: Have changes reviewed by team members

### During Refactoring
1. **Small increments**: Make small, focused changes
2. **Test frequently**: Run tests after each change
3. **Commit often**: Use descriptive commit messages
4. **Monitor performance**: Ensure refactoring doesn't degrade performance

### After Refactoring
1. **Update status**: Mark debt item as resolved
2. **Update metrics**: Record effort and impact
3. **Document lessons**: Share learnings with team
4. **Celebrate**: Acknowledge the improvement

## 🔄 Debt Prevention

### Code Review Checklist
- [ ] No code smells or anti-patterns
- [ ] Proper error handling
- [ ] Adequate test coverage
- [ ] Performance considerations
- [ ] Security best practices
- [ ] Documentation updated

### Development Standards
- [ ] Follow established patterns
- [ ] Write self-documenting code
- [ ] Keep functions small and focused
- [ ] Use meaningful variable names
- [ ] Avoid premature optimization
- [ ] Consider future maintainability

### Regular Maintenance
- [ ] Weekly code quality reviews
- [ ] Monthly architecture assessments
- [ ] Quarterly performance audits
- [ ] Annual security reviews

## 📚 Resources

### Tools
- **ESLint**: Code quality and style enforcement
- **Prettier**: Code formatting
- **Husky**: Git hooks for quality gates
- **Vitest**: Testing framework
- **Vite**: Build tool with performance insights

### Documentation
- [React Best Practices](https://react.dev/learn)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [JavaScript Clean Code](https://github.com/ryanmcdermott/clean-code-javascript)

### Team Guidelines
- [Code Review Guidelines](./docs/code-review.md)
- [Testing Standards](./docs/testing.md)
- [Performance Guidelines](./docs/performance.md)

## 🤝 Contributing

### Adding New Debt Items
1. Use the template below
2. Assign appropriate priority and effort estimates
3. Add to the relevant section
4. Update metrics

### Debt Item Template
```markdown
| ID | Title | Description | Impact | Effort | Created | Status |
|----|-------|-------------|---------|---------|---------|---------|
| XX-XXX | Brief Title | Detailed description of the issue, why it's debt, and what needs to be done | High/Medium/Low | X days | YYYY-MM-DD | Open |
```

### Updating Status
- **Open**: Not yet started
- **In Progress**: Currently being worked on
- **Review**: Ready for code review
- **Resolved**: Completed and merged
- **Deferred**: Postponed to future sprint

## 📞 Support

For questions about technical debt or this tracking system:
- Create an issue with the `technical-debt` label
- Discuss in team meetings
- Review during sprint planning sessions

---

*This document is a living document. Update it regularly as new debt is discovered and existing debt is resolved.* 