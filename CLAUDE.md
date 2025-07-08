# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack Timeline educational card game where players place historical events in chronological order. The game features drag-and-drop mechanics, real-time feedback, and both single-player and AI modes.

## Architecture

### Frontend (React + Vite)
- **Location**: `timeline-frontend/`
- **Tech Stack**: React 18, Vite, React Router, Axios
- **Key Components**:
  - `Game.jsx` - Main game page with timeline and player hand (contains primary game logic)
  - `Timeline.jsx` - Interactive timeline with drag-and-drop zones
  - `PlayerHand.jsx` - Player's cards with drag functionality
  - `Card.jsx` - Individual card component with flip animations

### Backend (Node.js + Express)
- **Location**: `timeline-backend/`
- **Tech Stack**: Node.js, Express, CORS
- **Main File**: `server.js` - API endpoints for events and categories
- **Data**: Sample events hardcoded in server.js (12 historical events)

### Game Logic Architecture
- **State Management**: `useGameState.js` - Comprehensive game state hook
- **Game Logic**: `gameLogic.js` - Core game mechanics (validation, scoring, win conditions)
- **Timeline Logic**: `timelineLogic.js` - Card placement validation and smart insertion points
- **Drag & Drop**: `useDragAndDrop.js` - Drag and drop functionality
- **AI Logic**: `aiLogic.js` - AI opponent behavior

## Common Development Commands

### Frontend Development
```bash
cd timeline-frontend
npm install              # Install dependencies
npm run dev             # Start development server (port 5173)
npm run build           # Build for production
npm run preview         # Preview production build
npm run lint            # Run ESLint
```

### Backend Development
```bash
cd timeline-backend
npm install              # Install dependencies
npm run dev             # Start with nodemon (port 5000)
npm start               # Start production server
```

### Full Stack Development
```bash
cd timeline-frontend
npm run dev:full        # Start both frontend and backend concurrently
```

## Key Game Mechanics

### Game Flow
1. **Initialization**: Game session created via `createGameSession()` from gameLogic.js
2. **Card Selection**: Players select cards from their hand
3. **Timeline Placement**: Cards are placed using drag-and-drop
4. **Validation**: `validatePlacementWithTolerance()` checks correctness
5. **Feedback**: Visual feedback shows success/failure with hints
6. **Turn Management**: AI takes turns in AI mode

### Scoring System
- Base score: 100 points × card difficulty
- Time bonus: Up to 50 points for quick placement
- Attempt penalty: -25 points per retry
- Minimum score: 10 points

### Game Modes
- **Single Player**: Play against yourself
- **AI Mode**: Play against computer opponent
- **Difficulty Levels**: Easy, Medium, Hard (affects AI behavior and scoring)

## API Endpoints

### Health Check
- `GET /api/health` - Server status

### Events
- `GET /api/events` - Get all events
- `GET /api/events/random/:count` - Get random events for game
- `GET /api/events/random?count=5` - Alternative random events endpoint

### Categories
- `GET /api/categories` - Get available categories
- `GET /api/events/category?name=History` - Get events by category

## Code Style and Patterns

### React Patterns
- Functional components with hooks
- Custom hooks for complex logic (`useGameState`, `useDragAndDrop`)
- Component composition with separate concerns
- Regular CSS files for styling (not CSS modules)

### State Management
- Primary game state managed directly in `Game.jsx` component
- `useGameState` hook provides comprehensive game state management (alternative implementation)
- Immutable state updates
- Clear separation of UI state and game logic

### Error Handling
- Try-catch blocks in async operations
- User-friendly error messages
- Graceful degradation for API failures

## Testing
- No test framework currently configured
- To add tests, consider Jest + React Testing Library
- Test game logic utilities first (gameLogic.js, timelineLogic.js)

## Development Notes

### Card Data Structure
```javascript
{
  id: number,
  title: string,
  dateOccurred: string, // ISO date format
  category: string,
  difficulty: number, // 1-3
  description: string
}
```

### Game State Structure
- `timeline`: Array of placed cards
- `playerHand`/`aiHand`: Cards in player hands
- `gameStatus`: 'lobby', 'playing', 'paused', 'won', 'lost'
- `currentPlayer`: 'human' or 'ai'
- `score`: Object with human/ai scores
- `gameStats`: Move tracking and performance metrics

### Drag and Drop Implementation
- Uses HTML5 drag and drop API
- Custom insertion points for precise placement
- Visual feedback during drag operations
- Touch device support for mobile

## Future Enhancements (from REQUIREMENTS.md)
- Multiplayer mode with Socket.io
- User accounts and progress tracking
- PostgreSQL database integration
- Docker deployment
- Custom event sets
- Social sharing features