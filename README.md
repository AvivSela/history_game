# Timeline Game Project

A historical card game where players place events in chronological order on a timeline. Built with React frontend and Node.js backend, using Yarn for package management.

## 🎮 Game Overview

Timeline is an educational card game that tests your knowledge of historical events. 
Players receive cards with historical events and must place them in the correct chronological order on a timeline.

### Features
- **Interactive Timeline**: Drag and drop cards to place events
- **Multiple Categories**: Military, Political, Cultural, Scientific, and more
- **AI Opponent**: Play against computer with adjustable difficulty
- **Real-time Feedback**: Immediate validation of placements
- **Responsive Design**: Works on desktop and mobile devices

## 🏗️ Project Structure

```
timeline-game-project/
├── timeline-frontend/     # React frontend application
├── timeline-backend/      # Node.js backend server
├── package.json          # Root workspace configuration
└── README.md            # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 24.0.0
- Yarn >= 1.22.0

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd timeline-game-project
   ```

2. **Install all dependencies**
   ```bash
   yarn install
   ```

3. **Start both frontend and backend**
   ```bash
   yarn dev
   ```

4. **Open your browser**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3000

## 📦 Available Scripts

### Root Level (Workspace)
- `yarn dev` - Start both frontend and backend in development mode
- `yarn build` - Build frontend for production
- `yarn start` - Start backend server only
- `yarn frontend:dev` - Start frontend development server only
- `yarn backend:start` - Start backend server only


### Frontend Only
```bash
cd timeline-frontend
yarn dev      # Start development server
yarn build    # Build for production
yarn preview  # Preview production build
yarn test     # Run tests
yarn lint     # Run ESLint
```

### Backend Only
```bash
cd timeline-backend
yarn start    # Start server
yarn dev      # Start with nodemon (if available)
```

## 🛠️ Development

### Frontend (React + Vite)
- **Framework**: React 18 with hooks
- **Build Tool**: Vite for fast development
- **Routing**: React Router
- **Testing**: Vitest
- **Linting**: ESLint

### Backend (Node.js + Express)
- **Framework**: Express.js
- **Database**: PostgreSQL (if configured)
- **Real-time**: Socket.io for game updates
- **Development**: Nodemon for auto-restart

## 🎯 Game Modes

1. **Single Player**: Practice mode with AI hints
2. **AI Opponent**: Play against computer with adjustable difficulty
3. **Multiplayer**: Real-time multiplayer (planned feature)

## 📱 Mobile Support

The game is fully responsive and works on:
- Desktop browsers
- Tablets
- Mobile phones

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Install dependencies: `yarn install`
4. Make your changes
5. Run tests: `yarn test`
6. Ensure linting passes: `yarn lint`
7. Review technical debt: Check [Technical Debt](./docs/technical/debt/technical-debt.md)
8. Commit your changes: `git commit -m 'Add amazing feature'`
9. Push to the branch: `git push origin feature/amazing-feature`
10. Open a Pull Request

### Code Quality
- Review [Technical Debt Guide](./docs/technical/debt/technical-debt-guide.md) for best practices
- Review [Technical Debt](./docs/technical/debt/technical-debt.md) to track and manage technical debt
- Follow established patterns and conventions
- Write tests for new functionality

## 🚀 CI/CD Pipeline

This project uses GitHub Actions for continuous integration and deployment. The CI/CD pipeline automatically runs on every pull request and push to main branches.

### Automated Checks
- **Tests**: Frontend and backend tests run in parallel
- **Linting**: ESLint and Prettier formatting checks
- **Security**: Dependency vulnerability scanning
- **Build**: Production build verification
- **Coverage**: Test coverage reporting

### Setup
1. **Quick Setup**: Run `./scripts/setup-ci.sh` to verify your setup
2. **Documentation**: See [CI/CD Setup Guide](./docs/ci-cd/setup.md) for detailed information
3. **Workflows**: Check `.github/workflows/` for workflow configurations

### Workflows
- **Test Suite** (`test.yml`): Runs tests, linting, and build checks
- **Security Audit** (`security.yml`): Security vulnerability scanning

### Local Testing
```bash
# Run all tests locally
yarn test

# Run frontend tests only
yarn test:frontend

# Run backend tests only
yarn test:backend

# Run linting
yarn lint

# Check formatting
yarn workspace timeline-frontend format:check
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

**Port already in use**
```bash
# Kill processes on ports 3000 and 5173
lsof -ti:3000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

**Yarn install fails**
```bash
# Clear yarn cache
yarn cache clean
# Reinstall
yarn install
```

**Node modules issues**
```bash
# Remove all node_modules and reinstall
rm -rf node_modules timeline-frontend/node_modules timeline-backend/node_modules
yarn install
```

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the troubleshooting section above
- Review the individual README files in frontend/ and backend/ directories 
