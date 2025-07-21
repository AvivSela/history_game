# Development Workflow Guide

## 🚨 Important: Never Push Directly to Master

**Direct pushes to master are forbidden!** Always use feature branches and pull requests.

## 🔄 Proper Development Workflow

### 1. Create a Feature Branch
```bash
# Always start from master
git checkout master
git pull origin master

# Create a new feature branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
# or  
git checkout -b docs/your-documentation-update
```

### 2. Make Your Changes
```bash
# Make your changes
# Edit files...

# Stage and commit
git add .
git commit -m "feat: add new feature description"
```

### 3. Push to Feature Branch
```bash
# Push to your feature branch (NOT master!)
git push origin feature/your-feature-name
```

### 4. Create Pull Request
1. Go to GitHub: `https://github.com/AvivSela/history_game`
2. Click "Compare & pull request" for your branch
3. Fill in the PR description
4. Request review if needed
5. Wait for CI/CD checks to pass

### 5. Merge Through GitHub
- Only merge after approval
- Use "Squash and merge" for clean history
- Delete the feature branch after merge

## 🛡️ Protection Rules

### Branch Protection (GitHub Settings)
- ✅ Require pull request before merging
- ✅ Require 1+ approvals
- ✅ Require status checks to pass
- ✅ Require conversation resolution
- ✅ Restrict direct pushes to master

### Local Protection
- ✅ Pre-push hook prevents master pushes
- ✅ Git config prevents accidental pushes
- ✅ CODEOWNERS file defines reviewers

## 📋 Branch Naming Conventions

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test improvements
- `ci/` - CI/CD changes

## 🚨 What NOT to Do

❌ **Never do this:**
```bash
git checkout master
git add .
git commit -m "quick fix"
git push origin master  # ❌ FORBIDDEN!
```

✅ **Always do this:**
```bash
git checkout -b fix/quick-fix
git add .
git commit -m "fix: quick fix description"
git push origin fix/quick-fix  # ✅ CORRECT!
# Then create PR on GitHub
```

## 🔧 Emergency Fixes

If you absolutely need to fix something on master immediately:

1. **Create a hotfix branch:**
   ```bash
   git checkout -b hotfix/critical-fix
   ```

2. **Make the minimal fix:**
   ```bash
   # Only fix the critical issue
   git commit -m "hotfix: critical security fix"
   ```

3. **Create urgent PR:**
   - Mark as urgent in PR description
   - Request immediate review
   - Explain why it couldn't wait

## 📞 Getting Help

If you're unsure about the workflow:
1. Check this guide first
2. Ask in GitHub issues
3. Review existing PRs for examples
4. Check the [Contributing Guide](../README.md#🤝-contributing) 