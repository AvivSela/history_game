# Timeline Component Improvement Plan (v2)

This document outlines a concrete, **action-oriented** roadmap for refactoring the `Timeline` component family so that it is more maintainable, testable, accessible, and performant while fitting perfectly into the project’s architecture & conventions.

---

## 🎯 Goals
1. **Single-Responsibility Components** – break up monolith into focused children.
2. **First-Class Accessibility & Keyboard Support** – comply with WCAG + project a11y rules.
3. **Predictable Performance** – minimal re-renders, virtualisation ready, smooth animations.
4. **Robust Test Coverage** – unit, integration & a11y tests via existing utilities.
5. **Strict Project Conventions** – file naming, import structure, JSDoc & Tailwind usage.
6. **Future-Friendly** – prepared for drag-and-drop, multi-row & vertical timelines.

---

## 🔍 Current Pain Points (from code audit)
- **Monolithic logic**: rendering, scrolling, animations, and insertion-point state live in `Timeline.jsx` (≈300 LOC).
- **Direct DOM queries**: `querySelector` limits testability & SSR scenarios.
- **Magic numbers**: e.g. `scrollAmount = 300` instead of `UI_DIMENSIONS.TIMELINE_SCROLL_AMOUNT`.
- **Animation coupling**: business logic knows too much about `@utils/animation` implementation.
- **Accessibility gaps**: insertion points lack role/label; no keyboard navigation loop.
- **Untyped props**: no PropTypes or TS types for `Timeline` or children.
- **Sparse test cases**: only high-level render & animation tests, no unit tests for edge cases.

---

## 🛠️ Refactor Roadmap

### 1. Component Extraction (**High Priority**)
| New File | Responsibility |
|----------|----------------|
| `InsertionPoint.jsx` | Visual + interactive drop zone (focusable, keyboard navigable) |
| `TimelineCardWrapper.jsx` | Date label + `<Card />` + wrong-placement indicator |
| `ScrollControls.jsx` | Previous/Next buttons (optional render based on overflow) |

> Place these in `timeline-frontend/src/components/game/Timeline/` and export via `index.js` to honour **Component Structure** rules.

### 2. Custom Hooks (**High Priority**)
1. `useTimelineScroll({ ref })` – handles scroll-to-end, smooth scroll & arrow-button logic.
2. `useWrongPlacementAnimation({ timelineRef, insertionRefs })` – wraps `animations.wrongPlacement` and cleanup.
3. `useKeyboardNavigation({ insertionRefs, onSelect })` – arrow-key navigation & focus management.

> Ensure each hook lives in `timeline-frontend/src/hooks/` and is **unit-tested**.

### 3. Constants & Styling (**High Priority**)
- Move every hard-coded dimension into `src/constants/gameConstants.js` (`UI_DIMENSIONS` section).
- Replace inline style objects with Tailwind utilities or CSS modules; keep dynamic sizing via `style={{ width: … }}` only when unavoidable.

### 4. Typing & Documentation (**High Priority**)
- Add **PropTypes** for all new & existing components.
- Augment every public function/component with **JSDoc** (`@param`, `@returns`, `@description`).
- Update `README.md` and component-level docs (`index.js`) explaining new API surface.

### 5. Accessibility Enhancements (**High Priority**)
- Insertion points: `role="button"`, `aria-label`, `tabIndex={0}`.
- Provide visible focus ring & ARIA live region for wrong placement feedback.
- Implement full keyboard flow:
  - `Tab` cycles over insertion points & scroll buttons.
  - `ArrowLeft/Right` moves focus across insertion points.
  - `Enter/Space` selects insertion point.
- Add axe-core tests in `TimelineAccessibility.test.jsx`.

### 6. Performance Optimisation (**Medium Priority**)
- Memoise `sortedEvents` with `useMemo`.
- Memoise handlers with `useCallback` & deps arrays.
- Evaluate **virtualisation** (`react-window`) for >100 events; feature-flag via `settingsManager`.
- Debounce rapid scroll commands inside `useTimelineScroll`.

### 7. Test Strategy (**Medium Priority**)
| Layer | File(s) | Focus |
|-------|---------|-------|
| Unit | `InsertionPoint.test.jsx`, `useTimelineScroll.test.js`, … | edge cases, a11y attrs |
| Integration | `timelineFlow.test.jsx` | place card → timeline updates correctly |
| A11y | `TimelineAccessibility.test.jsx` | axe violations < 0 |
| Performance | extend `animation.test.jsx` | 60fps on scroll & animation |

> Re-use mocks from `src/tests/__mocks__/` & utilities from `gameStateTestUtils.js`.

### 8. Settings Integration (**Medium Priority**)
- Add `settings.timeline.autoScroll` (boolean, default **true**).
- Respect `settings.accessibility.reducedMotion` to disable animations.

### 9. Nice-to-Have Features (**Low Priority**)
- Drag-and-drop with `@dnd-kit/core`.
- Multi-row layout (grid) behind feature flag.
- Custom card renderer via render-prop (`renderCard(event): JSX`).

---

## ✅ Task Checklist

### Must Do (complete before merging)
- [x] Extract `InsertionPoint` component  
  _Done: Extracted as a standalone, accessible, and tested component._
- [x] Extract `TimelineCardWrapper` component  
  _Done: Extracted and tested, handles card display and date label._
- [x] Create `useTimelineScroll`, `useWrongPlacementAnimation`, `useKeyboardNavigation`  
  _Done: All hooks implemented, tested, and integrated._
- [x] Remove magic numbers ➜ move to `gameConstants.js`  
  _Done: All Timeline-related magic numbers moved to `UI_DIMENSIONS`._
- [x] PropTypes & JSDoc for all components/hooks  
  _Done: All Timeline-related components and hooks fully documented._
- [x] Keyboard navigation & ARIA roles  
  _Done: Full keyboard navigation and ARIA roles for insertion points and scroll controls._
- [x] Unit tests for extracted components & hooks  
  _Done: All new components and hooks have comprehensive unit tests._

### Should Do
- [x] Replace inline styles with Tailwind utilities  
  _Done: All inline styles replaced with Tailwind except for dynamic values._
- [x] Memoise calculations & handlers  
  _Done: All relevant calculations and handlers are memoized with useMemo/useCallback._
- [x] Debounce scroll actions  
  _Done: Scroll actions in Timeline are debounced for performance._
- [x] Add axe-core accessibility tests  
  _Done: Accessibility tests added and passing._
- [x] Add timeline settings & integrate with `settingsManager`  
  _Done: Timeline settings integrated and validated._
- [x] Document new APIs in README/component docs  
  _Done: Documentation updated for all new APIs and components._

### Nice to Have
- [ ] Storybook stories for Timeline & subcomponents
- [ ] Performance monitoring hook for large timelines

---

**All "Must Do" and "Should Do" tasks are now complete and tested. Timeline refactor is stable, accessible, and fully documented.**

## 📂 File Structure After Refactor (illustrative)
```text
Timeline/
├── index.js                    # Re-exports
├── Timeline.jsx                # Orchestrator – composition only
├── InsertionPoint.jsx          # ➜ ui/insertion-point logic
├── TimelineCardWrapper.jsx     # ➜ combines date label + <Card />
├── ScrollControls.jsx          # ➜ left/right buttons
└── Timeline.css                # Component-specific styles
hooks/
├── useTimelineScroll.js
├── useWrongPlacementAnimation.js
└── useKeyboardNavigation.js
```

---

## 📄 Technical Debt Tracking
Remember to **add an entry** to `TECHNICAL_DEBT.md` if any compromises are made (e.g., temporary virtualisation cap set to 300 cards).

---

## 🏁 Definition of Done
1. All **Must Do** tasks are complete.
2. `yarn test && yarn lint && yarn build` pass.
3. Lighthouse & performance tests show no regression.
4. No new high/medium a11y issues.
5. Documentation & Storybook (if added) updated. 