# Screenshot Guidelines

This guide outlines the standards and best practices for managing screenshots in the Timeline Game project documentation.

## 📁 Directory Structure

### Main Project Screenshots
```
docs/assets/
├── screenshots/     # Game screenshots, UI demonstrations
├── diagrams/        # Architecture diagrams, flowcharts
└── logos/          # Project logos, icons
```

### Frontend Screenshots
```
timeline-frontend/docs/screenshots/
```

### Backend Screenshots
```
timeline-backend/docs/screenshots/
```

## 🎯 Screenshot Categories

### 1. Game Screenshots (docs/assets/screenshots/)
- **game-board.png** - Main game interface
- **player-hand.png** - Player's card hand
- **timeline-view.png** - Timeline with placed cards
- **settings-panel.png** - Game settings interface
- **statistics-dashboard.png** - Player statistics
- **admin-interface.png** - Admin panel (if applicable)

### 2. Technical Diagrams (docs/assets/diagrams/)
- **architecture-diagram.png** - System architecture
- **database-schema.png** - Database structure
- **component-hierarchy.png** - React component tree
- **api-flow.png** - API request/response flow

### 3. UI/UX Screenshots (timeline-frontend/docs/screenshots/)
- **responsive-design.png** - Mobile/desktop comparison
- **accessibility-features.png** - Accessibility demonstrations
- **animation-examples.png** - Animation showcases
- **error-states.png** - Error handling UI

## 📸 Screenshot Standards

### Image Format
- **Format**: PNG for screenshots, SVG for diagrams when possible
- **Resolution**: Minimum 1200px width for main screenshots
- **Quality**: High quality, clear and readable text
- **File Size**: Optimize for web (max 500KB per image)

### Naming Convention
- Use kebab-case: `game-board-screenshot.png`
- Be descriptive: `player-hand-with-cards.png`
- Include context: `timeline-scroll-controls.png`

### Content Guidelines
- **Clean State**: Take screenshots with clean, minimal data
- **Consistent Theme**: Use consistent color scheme/theme
- **Highlight Features**: Focus on the feature being documented
- **Multiple Views**: Include different states (empty, populated, error)

## 🔗 README Integration

### Markdown Syntax
```markdown
![Game Board Interface](docs/assets/screenshots/game-board.png)

![Database Schema](docs/assets/diagrams/database-schema.png)
```

### Responsive Images
```markdown
<picture>
  <source media="(min-width: 800px)" srcset="docs/assets/screenshots/game-board-large.png">
  <source media="(min-width: 400px)" srcset="docs/assets/screenshots/game-board-medium.png">
  <img src="docs/assets/screenshots/game-board-small.png" alt="Game Board Interface">
</picture>
```

## 🛠️ Tools & Workflow

### Recommended Tools
- **Screenshot Tool**: Flameshot, Greenshot, or browser dev tools
- **Image Editor**: GIMP, Photoshop, or online tools like Canva
- **Optimization**: ImageOptim, TinyPNG, or Squoosh

### Workflow
1. **Capture**: Take screenshot at appropriate resolution
2. **Edit**: Crop, annotate, or highlight important areas
3. **Optimize**: Compress for web while maintaining quality
4. **Name**: Use consistent naming convention
5. **Place**: Store in appropriate directory
6. **Link**: Update README with proper markdown syntax

## 📱 Responsive Screenshots

### Device Considerations
- **Desktop**: 1920x1080 or 1440x900
- **Tablet**: 1024x768 or 768x1024
- **Mobile**: 375x667 or 414x896

### Responsive Testing
- Test screenshots on different screen sizes
- Ensure text remains readable
- Verify UI elements are properly visible

## 🔍 Accessibility

### Alt Text Guidelines
- **Descriptive**: "Game board showing timeline with 5 historical events placed"
- **Contextual**: Include what the user should notice
- **Action-oriented**: "Settings panel with difficulty selector highlighted"

### Color Considerations
- Ensure sufficient contrast in screenshots
- Consider colorblind users when highlighting elements
- Use patterns or borders in addition to color

## 📋 Checklist

Before adding a screenshot:

- [ ] Image is high quality and clear
- [ ] File size is optimized (< 500KB)
- [ ] Naming follows convention
- [ ] Stored in correct directory
- [ ] Alt text is descriptive
- [ ] README link is working
- [ ] Responsive versions created (if needed)
- [ ] Accessibility considerations addressed

## 🚀 Quick Start

1. Create the directory structure:
   ```bash
   mkdir -p docs/assets/{screenshots,diagrams,logos}
   mkdir -p timeline-frontend/docs/screenshots
   mkdir -p timeline-backend/docs/screenshots
   ```

2. Take your first screenshot and save it with proper naming

3. Update the relevant README with markdown syntax

4. Commit and push your changes

## 📚 Examples

See the main README.md for examples of how screenshots are integrated into the documentation. 