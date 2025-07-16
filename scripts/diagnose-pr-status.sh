#!/bin/bash

# Simple PR Status Diagnostic Script
# This script helps troubleshoot "Test SuiteExpected — Waiting for status to be reported" issues

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to get current branch
get_current_branch() {
    git branch --show-current
}

# Function to check workflow files
check_workflow_files() {
    print_status $BLUE "🔍 Checking workflow files..."
    
    echo ""
    print_status $YELLOW "Active workflow files:"
    if [ -d ".github/workflows" ]; then
        for file in .github/workflows/*.yml; do
            if [ -f "$file" ]; then
                local name=$(basename "$file")
                local triggers=""
                
                # Check what triggers the workflow
                if grep -q "workflow_dispatch:" "$file"; then
                    triggers="Manual"
                elif grep -q "pull_request:" "$file"; then
                    triggers="PR"
                elif grep -q "push:" "$file"; then
                    triggers="Push"
                elif grep -q "workflow_run:" "$file"; then
                    triggers="Workflow"
                else
                    triggers="Unknown"
                fi
                
                print_status $GREEN "  ✅ $name ($triggers)"
            fi
        done
    else
        print_status $RED "❌ No .github/workflows directory found"
    fi
}

# Function to check for conflicting workflows
check_conflicting_workflows() {
    print_status $BLUE "🔍 Checking for conflicting workflows..."
    
    local conflicts=0
    
    # Check if ci.yml is enabled for PRs
    if grep -A 5 "pull_request:" .github/workflows/ci.yml 2>/dev/null | grep -q "branches:"; then
        print_status $RED "  ❌ ci.yml is enabled for PRs and may conflict with test.yml"
        conflicts=$((conflicts + 1))
    else
        print_status $GREEN "  ✅ ci.yml is properly disabled for PRs"
    fi
    
    # Check if test-status.yml has direct PR triggers
    if grep -A 5 "pull_request:" .github/workflows/test-status.yml 2>/dev/null | grep -q "branches:"; then
        print_status $RED "  ❌ test-status.yml has direct PR triggers"
        conflicts=$((conflicts + 1))
    else
        print_status $GREEN "  ✅ test-status.yml is properly configured"
    fi
    
    # Check if auto-format.yml is running on PRs
    if grep -A 5 "pull_request:" .github/workflows/auto-format.yml 2>/dev/null | grep -q "branches:"; then
        print_status $YELLOW "  ⚠️  auto-format.yml runs on PRs (this is intentional for auto-formatting)"
    else
        print_status $GREEN "  ✅ auto-format.yml is properly configured"
    fi
    
    if [ $conflicts -eq 0 ]; then
        print_status $GREEN "✅ No conflicting workflows detected"
    else
        print_status $RED "❌ $conflicts potential workflow conflicts found"
    fi
}

# Function to check local test status
check_local_tests() {
    print_status $BLUE "🔍 Running local tests to verify they pass..."
    
    echo ""
    print_status $YELLOW "Running frontend tests..."
    if timeout 60 yarn test:frontend > /dev/null 2>&1; then
        print_status $GREEN "  ✅ Frontend tests pass locally"
    else
        print_status $RED "  ❌ Frontend tests fail locally"
    fi
    
    print_status $YELLOW "Running backend tests..."
    if timeout 60 yarn test:backend > /dev/null 2>&1; then
        print_status $GREEN "  ✅ Backend tests pass locally"
    else
        print_status $RED "  ❌ Backend tests fail locally"
    fi
    
    print_status $YELLOW "Running linting..."
    if timeout 30 yarn lint > /dev/null 2>&1; then
        print_status $GREEN "  ✅ Linting passes locally"
    else
        print_status $RED "  ❌ Linting fails locally"
    fi
}

# Function to check git status
check_git_status() {
    print_status $BLUE "🔍 Checking git status..."
    
    echo ""
    local current_branch=$(get_current_branch)
    print_status $GREEN "📍 Current branch: $current_branch"
    
    # Check if we're on a feature branch
    if [ "$current_branch" = "main" ] || [ "$current_branch" = "master" ] || [ "$current_branch" = "develop" ]; then
        print_status $YELLOW "⚠️  You're on a main branch. Create a feature branch for PRs."
    else
        print_status $GREEN "✅ You're on a feature branch"
    fi
    
    # Check for uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
        print_status $YELLOW "⚠️  You have uncommitted changes"
        git status --short
    else
        print_status $GREEN "✅ No uncommitted changes"
    fi
    
    # Check if branch is up to date
    git fetch origin > /dev/null 2>&1
    local behind=$(git rev-list HEAD..origin/$current_branch --count 2>/dev/null || echo "0")
    if [ "$behind" != "0" ]; then
        print_status $YELLOW "⚠️  Branch is $behind commits behind origin"
    else
        print_status $GREEN "✅ Branch is up to date"
    fi
}

# Function to provide solutions
provide_solutions() {
    echo ""
    print_status $BLUE "🛠️  Solutions to try:"
    echo ""
    
    print_status $YELLOW "1. Cancel stuck workflows:"
    echo "   - Go to GitHub Actions tab in your repository"
    echo "   - Find any stuck or running workflows"
    echo "   - Click 'Cancel workflow' for stuck runs"
    echo ""
    
    print_status $YELLOW "2. Re-trigger workflows:"
    echo "   git commit --allow-empty -m '🔄 Re-trigger CI workflows'"
    echo "   git push"
    echo ""
    
    print_status $YELLOW "3. Check workflow configuration:"
    echo "   - Ensure only test.yml runs on PRs"
    echo "   - Disable ci.yml for PRs (already done)"
    echo "   - Ensure test-status.yml only runs on workflow completion"
    echo ""
    
    print_status $YELLOW "4. If completely stuck, try:"
    echo "   - Temporarily disable branch protection rules in GitHub"
    echo "   - Merge PR manually"
    echo "   - Re-enable protection rules"
    echo ""
    
    print_status $YELLOW "5. Create new PR:"
    echo "   git checkout -b fix/pr-status-$(date +%s)"
    echo "   git push origin HEAD"
    echo "   Create new PR from this branch"
    echo ""
    
    print_status $YELLOW "6. Check branch protection rules:"
    echo "   - Go to repository Settings > Branches"
    echo "   - Check what status checks are required"
    echo "   - Ensure they match your workflow job names"
    echo ""
}

# Function to analyze workflow configuration
analyze_workflow_config() {
    print_status $BLUE "🔍 Analyzing workflow configuration..."
    
    echo ""
    print_status $YELLOW "test.yml triggers:"
    if grep -A 10 "on:" .github/workflows/test.yml | grep -E "(push|pull_request|workflow_dispatch)" > /dev/null; then
        grep -A 10 "on:" .github/workflows/test.yml | grep -E "(push|pull_request|workflow_dispatch)" | sed 's/^/  /'
    else
        print_status $RED "  ❌ No triggers found in test.yml"
    fi
    
    echo ""
    print_status $YELLOW "test.yml jobs:"
    grep -E "^  [a-zA-Z-]+:" .github/workflows/test.yml | sed 's/^/  /'
    
    echo ""
    print_status $YELLOW "Status check names (for branch protection):"
    echo "  - test (matrix job for frontend/backend tests)"
    echo "  - lint (linting and formatting)"
    echo "  - build (build verification)"
    echo "  - status-report (overall status)"
}

# Main function
main() {
    print_status $BLUE "🚀 PR Status Diagnostic Tool"
    print_status $BLUE "=========================="
    echo ""
    
    # Run diagnostics
    check_git_status
    check_workflow_files
    check_conflicting_workflows
    analyze_workflow_config
    check_local_tests
    
    # Provide solutions
    provide_solutions
    
    echo ""
    print_status $GREEN "✅ Diagnostic complete!"
    print_status $YELLOW "💡 Check the output above for issues and try the suggested solutions."
    echo ""
    print_status $BLUE "📋 Next steps:"
    echo "1. Check GitHub Actions tab for stuck workflows"
    echo "2. Verify branch protection rules match workflow job names"
    echo "3. Try re-triggering workflows with an empty commit"
    echo "4. If issues persist, consider creating a new PR"
}

# Run main function
main "$@" 