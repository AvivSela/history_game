# CI/CD Setup Guide

This document explains the GitHub Actions CI/CD pipeline setup for the Timeline Game project.

## 🚀 Overview

The CI/CD pipeline consists of two main workflows:

1. **Test Suite** (`.github/workflows/test.yml`) - Runs tests and linting
2. **Security Audit** (`.github/workflows/security.yml`) - Security checks and dependency reviews

## 📋 Workflow Details

### Test Suite Workflow

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs:**
1. **Test** - Runs frontend and backend tests in parallel using matrix strategy
2. **Lint** - Runs ESLint and Prettier checks
3. **Build** - Builds the frontend application (runs after tests and lint pass)

**Features:**
- Parallel test execution for faster feedback
- Coverage reporting to Codecov
- Build artifact upload for later use
- Yarn caching for faster installations

### Security Audit Workflow

**Triggers:**
- Weekly scheduled runs (Sundays at 2 AM UTC)
- Pull requests to `main` or `develop` branches
- Manual trigger (`workflow_dispatch`)

**Jobs:**
1. **Security Audit** - Runs `yarn audit` and checks for outdated dependencies
2. **Dependency Review** - GitHub's dependency review for PRs

**Features:**
- Automated security vulnerability detection
- Dependency update recommendations
- PR blocking on moderate+ severity issues



## 🛠️ Configuration

### Environment Variables

The workflows use these environment variables:
- `NODE_VERSION: '18'` - Node.js version for all jobs
- `YARN_VERSION: '1.22.0'` - Yarn version (handled by setup-node action)

### Caching Strategy

- **Yarn cache**: Cached across workflow runs for faster installations
- **Build artifacts**: Stored for 7 days for potential reuse

### Matrix Strategy

The test workflow uses a matrix strategy to run frontend and backend tests in parallel:

```yaml
strategy:
  matrix:
    workspace: [frontend, backend]
```

This reduces total CI time by running tests concurrently.

## 📊 Coverage Reporting

### Codecov Integration

Both frontend and backend tests upload coverage reports to Codecov:

- **Frontend**: `./timeline-frontend/coverage/lcov.info`
- **Backend**: `./timeline-backend/coverage/lcov.info`

### Coverage Flags

- `frontend` - Frontend coverage reports
- `backend` - Backend coverage reports

## 🔒 Security Features

### Vulnerability Scanning

- **Yarn Audit**: Scans for known vulnerabilities in dependencies
- **Dependency Review**: GitHub's built-in dependency analysis
- **Outdated Check**: Identifies packages that need updates

### Security Levels

- **Moderate+**: Fails CI pipeline
- **Low**: Warnings only
- **Info**: Informational only



## 📈 Best Practices Implemented

### 1. Parallel Execution
- Tests run in parallel using matrix strategy
- Independent jobs for different concerns (test, lint, build)

### 2. Caching
- Yarn cache for faster dependency installation
- Build artifacts for potential reuse

### 3. Security
- Regular security audits
- Dependency vulnerability scanning
- PR dependency reviews

### 4. Quality Gates
- Tests must pass before build
- Lint must pass before deployment
- Security audit must pass before deployment

### 5. Quality Gates
- Tests must pass before build
- Lint must pass before merge
- Security audit must pass before merge

### 6. Artifact Management
- Build artifacts stored for 7 days
- Coverage reports uploaded to external service
- Proper cleanup to save storage

## 🔧 Customization

### Adding New Test Types

To add new test types (e.g., E2E tests):

1. Add test script to `package.json`
2. Add new job to test workflow
3. Configure appropriate triggers and dependencies



### Performance Optimization

To optimize CI performance:

1. **Parallel jobs**: Use matrix strategy for independent tasks
2. **Caching**: Cache dependencies and build artifacts
3. **Selective runs**: Use `paths` filters to run only relevant workflows
4. **Job dependencies**: Use `needs` to ensure proper order

## 🚨 Troubleshooting

### Common Issues

**Tests failing in CI but passing locally:**
- Check Node.js version compatibility
- Verify environment variables
- Check for platform-specific code

**Slow CI runs:**
- Review caching configuration
- Optimize test execution
- Consider parallel job strategies

**Security audit failures:**
- Update vulnerable dependencies
- Review false positives
- Consider security policy exceptions

### Debugging

**Enable debug logging:**
```bash
# Add to workflow
env:
  ACTIONS_STEP_DEBUG: true
  ACTIONS_RUNNER_DEBUG: true
```

**Check workflow logs:**
- GitHub Actions tab in repository
- Download logs for detailed analysis
- Use `actions/upload-artifact` for debugging files

## 📚 Resources

### GitHub Actions Documentation
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Environment Variables](https://docs.github.com/en/actions/using-workflows/environment-variables)
- [Caching Dependencies](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows)

### Security Resources
- [GitHub Security](https://docs.github.com/en/code-security)
- [Dependency Review](https://docs.github.com/en/code-security/supply-chain-security/understanding-your-software-supply-chain/about-dependency-review)

### Best Practices
- [GitHub Actions Best Practices](https://docs.github.com/en/actions/learn-github-actions/security-hardening-for-github-actions)
- [CI/CD Best Practices](https://docs.github.com/en/actions/learn-github-actions/security-hardening-for-github-actions)

## 🔄 Maintenance

### Regular Tasks

1. **Update Node.js version** - Keep up with LTS releases
2. **Review security alerts** - Address vulnerability reports
3. **Optimize performance** - Monitor CI run times
4. **Update dependencies** - Keep packages current
5. **Review coverage** - Maintain test coverage standards

### Monitoring

- **CI run times** - Track performance trends
- **Failure rates** - Identify problematic patterns
- **Security alerts** - Monitor vulnerability reports
- **Coverage trends** - Ensure test quality

## 📝 Next Steps

1. **Set up Codecov** for coverage reporting
2. **Add notifications** (Slack, Discord, email)
3. **Set up branch protection** rules
4. **Configure required status checks** for PRs 