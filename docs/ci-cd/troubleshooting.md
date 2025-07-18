# PR Status Troubleshooting Guide

## 🚨 Issue: "Test SuiteExpected — Waiting for status to be reported"

This guide helps resolve the common issue where PRs get stuck on "waiting for status to be reported" in GitHub.

## 🔍 Root Causes

### 1. Multiple Conflicting Workflows
The most common cause is having multiple CI/CD workflows running simultaneously:
- `test.yml` (Test Suite)
- `ci.yml` (CI/CD Pipeline)
- `test-status.yml` (Test Suite Status)

When multiple workflows run, GitHub can get confused about which status to report.

### 2. Workflow Configuration Issues
- Missing or incorrect status reporting
- Workflow dependencies not properly configured
- Branch protection rules expecting specific status checks

### 3. GitHub Actions Limitations
- Workflow timeouts
- Resource constraints
- Network issues

## 🛠️ Solutions

### Immediate Fixes

#### 1. Disable Conflicting Workflows
I've already disabled the `ci.yml` workflow to prevent conflicts. The `test.yml` workflow is now the primary CI workflow.

#### 2. Check Current Status
Run the diagnostic script:
```bash
./scripts/check-pr-status.sh
```

#### 3. Cancel Stuck Workflows
1. Go to GitHub Actions tab
2. Find any stuck or running workflows
3. Click "Cancel workflow" for stuck runs

#### 4. Re-trigger Workflows
Push a small change to trigger fresh workflow runs:
```bash
git commit --allow-empty -m "🔄 Re-trigger CI workflows"
git push
```

### Long-term Solutions

#### 1. Consolidate Workflows
- Use only one primary CI workflow (`test.yml`)
- Disable or remove conflicting workflows
- Ensure proper job dependencies

#### 2. Improve Status Reporting
The updated `test.yml` workflow now includes:
- Explicit status reporting job
- Better error handling
- Clear success/failure indicators

#### 3. Branch Protection Rules
If you have branch protection rules, ensure they expect the correct status checks:
- `test` (matrix job for frontend/backend tests)
- `lint` (linting and formatting)
- `build` (build verification)
- `status-report` (overall status)

## 📋 Workflow Status Reference

### Current Workflow Structure

#### test.yml (Primary CI Workflow)
```yaml
Jobs:
- test (matrix: frontend, backend)
- lint (ESLint + Prettier)
- build (Frontend build)
- status-report (Status reporting)
```

#### Disabled Workflows
- `ci.yml` - Disabled to prevent conflicts
- `test-status.yml` - Only runs on workflow completion

### Status Check Names
When configuring branch protection rules, use these exact names:
- `test` - Test matrix job
- `lint` - Linting job
- `build` - Build job
- `status-report` - Status reporting job

## 🔧 Diagnostic Commands

### Check PR Status
```bash
# Check current PR
./scripts/check-pr-status.sh

# Check specific PR
./scripts/check-pr-status.sh <PR_NUMBER>
```

### Check Workflow Runs
```bash
# List recent workflow runs
gh run list --limit 10

# View specific workflow run
gh run view <RUN_ID>
```

### Check Branch Protection
```bash
# View branch protection rules
gh api repos/:owner/:repo/branches/main/protection
```

## 🚨 Emergency Procedures

### If PRs are Completely Stuck

1. **Temporarily Disable Branch Protection**
   - Go to repository settings
   - Disable branch protection rules temporarily
   - Merge the PR manually
   - Re-enable protection rules

2. **Force Push to Re-trigger**
   ```bash
   git commit --allow-empty -m "🔄 Force re-trigger CI"
   git push --force-with-lease
   ```

3. **Create New PR**
   - Create a new branch from the problematic branch
   - Create a new PR
   - This often resolves workflow conflicts

### If Workflows Keep Failing

1. **Check for Dependency Issues**
   ```bash
   yarn install --frozen-lockfile
   yarn test:frontend
   yarn test:backend
   ```

2. **Update Dependencies**
   ```bash
   yarn upgrade
   yarn install
   ```

3. **Clear GitHub Actions Cache**
   - Go to Actions tab
   - Click "Clear cache" if available
   - Or manually delete cache in workflow

## 📊 Monitoring

### Key Metrics to Watch
- Workflow run times
- Failure rates
- Status check completion rates
- PR merge times

### Alerts to Set Up
- Workflow failure notifications
- PR status check timeouts
- Build failures

## 🔄 Prevention

### Best Practices
1. **Single Source of Truth**: Use only one primary CI workflow
2. **Clear Dependencies**: Ensure jobs have proper dependencies
3. **Status Reporting**: Always include explicit status reporting
4. **Error Handling**: Handle failures gracefully
5. **Monitoring**: Set up alerts for workflow issues

### Regular Maintenance
1. **Review Workflow Performance**: Monthly review of CI metrics
2. **Update Dependencies**: Keep GitHub Actions updated
3. **Clean Up**: Remove unused workflows and configurations
4. **Documentation**: Keep troubleshooting guides updated

## 📞 Support

If issues persist after trying these solutions:

1. Check GitHub Actions documentation
2. Review workflow logs for specific errors
3. Consider GitHub support for persistent issues
4. Update this guide with new solutions found

## 📝 Changelog

### 2024-01-XX
- Disabled conflicting `ci.yml` workflow
- Added status reporting job to `test.yml`
- Created diagnostic script
- Updated troubleshooting guide 