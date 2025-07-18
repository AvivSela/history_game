# Remote Agent Guide - Timeline Game Project

## 🎯 Quick Start for Remote Agents

This project uses **Yarn** as the package manager and has strict formatting requirements. Follow these steps to avoid CI failures:

### Before Every Commit

1. **Run formatting commands:**
   ```bash
   yarn format:all
   ```

2. **Verify everything is clean:**
   ```bash
   yarn lint
   yarn format:check
   yarn test
   ```

3. **Only then commit:**
   ```bash
   git add .
   git commit -m "your commit message"
   ```

## 🔧 Available Commands

### Root Level (Recommended)
- `yarn format:all` - Run both linting fixes and formatting
- `yarn lint:fix` - Fix ESLint issues
- `yarn format` - Run Prettier formatting
- `yarn lint` - Check for linting issues
- `yarn format:check` - Check formatting without fixing

### Frontend Only
- `yarn workspace timeline-frontend lint:fix`
- `yarn workspace timeline-frontend format`

## 🚨 Common Issues & Solutions

### Formatting Issues in CI
If you see formatting failures in CI:

1. **Run the formatting script:**
   ```bash
   ./scripts/format-and-commit.sh
   ```

2. **Or manually fix:**
   ```bash
   yarn format:all
   git add .
   git commit -m "🔧 Fix formatting issues"
   git push
   ```

### Pre-commit Hook Failures
If pre-commit hooks fail:

1. **Run formatting manually:**
   ```bash
   yarn format:all
   ```

2. **Re-run the commit:**
   ```bash
   git add .
   git commit -m "your message"
   ```

## 📋 Project Structure

```
timeline-game-project/
├── timeline-frontend/     # React frontend
├── timeline-backend/      # Node.js backend
├── scripts/              # Utility scripts
└── .github/workflows/    # CI/CD pipelines
```

## 🎨 Formatting Tools

- **ESLint**: Code linting and style enforcement
- **Prettier**: Code formatting
- **Husky**: Git hooks for pre-commit formatting
- **lint-staged**: Run formatters only on staged files

## ⚡ Quick Fix Script

Use the provided script for automatic formatting:

```bash
./scripts/format-and-commit.sh
```

This script will:
1. Run ESLint fixes
2. Run Prettier formatting
3. Check for remaining issues
4. Exit with error if issues remain

## 🔍 CI Pipeline

The project has multiple CI checks:
- **Linting**: ESLint rules compliance
- **Formatting**: Prettier formatting check
- **Testing**: Unit and integration tests
- **Build**: Production build verification

All checks must pass before merging.

## 📝 Best Practices

1. **Always run formatting before committing**
2. **Use the root-level commands** (`yarn format:all`)
3. **Test your changes** (`yarn test`)
4. **Check for linting issues** (`yarn lint`)
5. **Use descriptive commit messages**

## 🆘 Troubleshooting

### "Permission denied" on scripts
```bash
chmod +x scripts/format-and-commit.sh
```

### Yarn workspace issues
```bash
yarn install
```

### Pre-commit hook not working
```bash
cd timeline-frontend
yarn prepare
```

## 📞 Need Help?

- Check the `.cursor-agent-config.json` file for configuration
- Review the CI logs for specific error messages
- Use the provided scripts for automatic formatting 