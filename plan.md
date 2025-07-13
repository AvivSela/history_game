# Migration Plan: npm to yarn

## Overview
This document outlines the step-by-step process for migrating the timeline game project from npm to yarn package manager.

## Current State Analysis
- **Frontend**: Uses npm (package-lock.json present)
- **Backend**: Uses npm (package-lock.json present)
- **Project Structure**: Monorepo with separate frontend/backend directories

## Migration Steps

### Phase 1: Preparation & Backup

#### 1.1 Create Backup
```bash
# Create backup of current state
git add .
git commit -m "Backup before npm to yarn migration"
git tag npm-backup-v1.0
```

#### 1.2 Document Current Dependencies
```bash
# Frontend dependencies
cd timeline-frontend
npm list --depth=0 > npm-dependencies-frontend.txt

# Backend dependencies  
cd ../timeline-backend
npm list --depth=0 > npm-dependencies-backend.txt
```

### Phase 2: Install Yarn

#### 2.1 Install Yarn Globally
```bash
# Install yarn globally
npm install -g yarn

# Verify installation
yarn --version
```

#### 2.2 Verify Yarn Installation
```bash
# Check yarn is working
yarn --version
yarn config list
```

### Phase 3: Frontend Migration

#### 3.1 Clean Frontend Directory
```bash
cd timeline-frontend

# Remove npm files
rm package-lock.json
rm -rf node_modules
```

#### 3.2 Install Dependencies with Yarn
```bash
# Install dependencies using yarn
yarn install

# Verify installation
yarn list --depth=0
```

#### 3.3 Update Scripts (if needed)
```bash
# Check if any scripts need updating
cat package.json | grep -A 10 '"scripts"'
```

#### 3.4 Test Frontend Build
```bash
# Test development server
yarn dev

# Test build process
yarn build

# Test linting
yarn lint
```

### Phase 4: Backend Migration

#### 4.1 Clean Backend Directory
```bash
cd ../timeline-backend

# Remove npm files
rm package-lock.json
rm -rf node_modules
```

#### 4.2 Install Dependencies with Yarn
```bash
# Install dependencies using yarn
yarn install

# Verify installation
yarn list --depth=0
```

#### 4.3 Test Backend
```bash
# Test server startup
yarn start

# Test any other scripts
yarn test  # if available
```

### Phase 5: Root Level Configuration

#### 5.1 Create Root package.json (Optional)
```bash
# Create root package.json for workspace management
cd ..
cat > package.json << EOF
{
  "name": "timeline-game-project",
  "private": true,
  "workspaces": [
    "timeline-frontend",
    "timeline-backend"
  ],
  "scripts": {
    "dev": "concurrently \"yarn workspace timeline-backend start\" \"yarn workspace timeline-frontend dev\"",
    "build": "yarn workspace timeline-frontend build",
    "start": "yarn workspace timeline-backend start"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
EOF
```

#### 5.2 Install Root Dependencies
```bash
yarn install
```

### Phase 6: Update Documentation

#### 6.1 Update README Files
- Update installation instructions
- Replace npm commands with yarn commands
- Update development workflow documentation

#### 6.2 Update CI/CD (if applicable)
- Update GitHub Actions or other CI/CD configurations
- Replace npm commands with yarn commands

### Phase 7: Team Communication

#### 7.1 Update Development Guidelines
- Document yarn usage for team members
- Create yarn cheat sheet
- Update onboarding documentation

#### 7.2 Team Training
- Brief team on yarn commands
- Share yarn vs npm command mapping

## Yarn vs npm Command Mapping

| npm Command | Yarn Command | Description |
|-------------|--------------|-------------|
| `npm install` | `yarn install` | Install dependencies |
| `npm install <package>` | `yarn add <package>` | Add dependency |
| `npm install -D <package>` | `yarn add -D <package>` | Add dev dependency |
| `npm uninstall <package>` | `yarn remove <package>` | Remove dependency |
| `npm run <script>` | `yarn <script>` | Run script |
| `npm run dev` | `yarn dev` | Start development server |
| `npm run build` | `yarn build` | Build project |
| `npm run test` | `yarn test` | Run tests |
| `npm run lint` | `yarn lint` | Run linter |

## Benefits of Migration

### Performance
- **Faster Installation**: Yarn uses parallel downloads
- **Better Caching**: More efficient dependency caching
- **Deterministic Installs**: Consistent node_modules across environments

### Features
- **Workspaces**: Better monorepo support
- **Plug'n'Play**: Optional zero-installs
- **Better Security**: Enhanced security features

### Developer Experience
- **Cleaner Output**: Less verbose installation logs
- **Better Error Messages**: More helpful error reporting
- **Modern Tooling**: Better integration with modern build tools

## Rollback Plan

### If Issues Arise
```bash
# Restore from backup
git checkout npm-backup-v1.0

# Or manually restore
cd timeline-frontend
rm yarn.lock
rm -rf node_modules
npm install

cd ../timeline-backend
rm yarn.lock
rm -rf node_modules
npm install
```

## Post-Migration Checklist

- [ ] All dependencies installed correctly
- [ ] Development server starts without errors
- [ ] Build process works
- [ ] Tests pass
- [ ] Linting works
- [ ] Documentation updated
- [ ] Team notified of changes
- [ ] CI/CD updated (if applicable)

## Timeline Estimate

- **Phase 1-2**: 30 minutes (Preparation & Yarn installation)
- **Phase 3**: 45 minutes (Frontend migration)
- **Phase 4**: 30 minutes (Backend migration)
- **Phase 5**: 30 minutes (Root configuration)
- **Phase 6**: 60 minutes (Documentation updates)
- **Phase 7**: 30 minutes (Team communication)

**Total Estimated Time**: ~3.5 hours

## Risk Assessment

### Low Risk
- Dependency installation
- Basic functionality

### Medium Risk
- Build process compatibility
- CI/CD integration

### Mitigation Strategies
- Create backup before migration
- Test thoroughly in development environment
- Have rollback plan ready
- Migrate during low-traffic period

## Success Criteria

- [ ] All existing functionality works with yarn
- [ ] Build times are improved or maintained
- [ ] Team can successfully use yarn commands
- [ ] No breaking changes introduced
- [ ] Documentation is up-to-date

---

**Note**: This migration should be performed during a development window with minimal impact on ongoing work. Consider coordinating with team members to ensure smooth transition. 