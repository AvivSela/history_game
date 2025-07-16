#!/bin/bash

# PR Status Diagnostic Script
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

# Function to check if gh CLI is installed
check_gh_cli() {
    if ! command -v gh &> /dev/null; then
        print_status $RED "❌ GitHub CLI (gh) is not installed."
        print_status $YELLOW "Please install it first: https://cli.github.com/"
        exit 1
    fi
}

# Function to check authentication
check_auth() {
    if ! gh auth status &> /dev/null; then
        print_status $RED "❌ Not authenticated with GitHub CLI."
        print_status $YELLOW "Please run: gh auth login"
        exit 1
    fi
}

# Function to get current branch
get_current_branch() {
    git branch --show-current
}

# Function to get current PR number
get_pr_number() {
    local current_branch=$(get_current_branch)
    gh pr list --head "$current_branch" --json number --jq '.[0].number' 2>/dev/null || echo "No PR found"
}

# Function to check workflow runs
check_workflow_runs() {
    local pr_number=$1
    print_status $BLUE "🔍 Checking workflow runs for PR #$pr_number..."
    
    echo ""
    print_status $YELLOW "Recent workflow runs:"
    gh run list --limit 5 --json status,conclusion,workflowName,createdAt,url
    
    echo ""
    print_status $YELLOW "Active workflow runs:"
    gh run list --status in_progress --limit 3 --json status,conclusion,workflowName,createdAt,url || echo "No active runs found"
}

# Function to check branch protection rules
check_branch_protection() {
    print_status $BLUE "🔍 Checking branch protection rules..."
    
    # Get default branch
    local default_branch=$(gh repo view --json defaultBranchRef --jq '.defaultBranchRef.name')
    
    echo ""
    print_status $YELLOW "Branch protection for $default_branch:"
    gh api repos/:owner/:repo/branches/$default_branch/protection --jq '{
        required_status_checks: .required_status_checks?.contexts?,
        enforce_admins: .enforce_admins?.enabled?,
        required_pull_request_reviews: .required_pull_request_reviews?.required_approving_review_count?,
        restrictions: .restrictions?.users? | length
    }' 2>/dev/null || print_status $RED "❌ Could not fetch branch protection rules"
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
                local enabled=$(grep -q "workflow_dispatch:" "$file" && echo "Manual" || echo "Auto")
                print_status $GREEN "  ✅ $name ($enabled)"
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
    
    # Check if ci.yml is enabled
    if grep -q "workflow_dispatch:" .github/workflows/ci.yml; then
        print_status $GREEN "  ✅ ci.yml is disabled (manual trigger only)"
    else
        print_status $RED "  ❌ ci.yml is enabled and may conflict with test.yml"
        conflicts=$((conflicts + 1))
    fi
    
    # Check if test-status.yml is properly configured
    if grep -q "workflow_run:" .github/workflows/test-status.yml; then
        print_status $GREEN "  ✅ test-status.yml is properly configured"
    else
        print_status $RED "  ❌ test-status.yml may have direct PR triggers"
        conflicts=$((conflicts + 1))
    fi
    
    if [ $conflicts -eq 0 ]; then
        print_status $GREEN "✅ No conflicting workflows detected"
    else
        print_status $RED "❌ $conflicts potential workflow conflicts found"
    fi
}

# Function to provide solutions
provide_solutions() {
    local pr_number=$1
    
    echo ""
    print_status $BLUE "🛠️  Solutions to try:"
    echo ""
    
    print_status $YELLOW "1. Cancel stuck workflows:"
    echo "   - Go to GitHub Actions tab"
    echo "   - Find any stuck or running workflows"
    echo "   - Click 'Cancel workflow' for stuck runs"
    echo ""
    
    print_status $YELLOW "2. Re-trigger workflows:"
    echo "   git commit --allow-empty -m '🔄 Re-trigger CI workflows'"
    echo "   git push"
    echo ""
    
    print_status $YELLOW "3. Check specific workflow run:"
    echo "   gh run list --limit 1"
    echo "   gh run view <RUN_ID>"
    echo ""
    
    print_status $YELLOW "4. If completely stuck, try:"
    echo "   - Temporarily disable branch protection rules"
    echo "   - Merge PR manually"
    echo "   - Re-enable protection rules"
    echo ""
    
    print_status $YELLOW "5. Create new PR:"
    echo "   git checkout -b fix/pr-status-$(date +%s)"
    echo "   git push origin HEAD"
    echo "   Create new PR from this branch"
    echo ""
}

# Function to check local test status
check_local_tests() {
    print_status $BLUE "🔍 Running local tests to verify they pass..."
    
    echo ""
    print_status $YELLOW "Running frontend tests..."
    if yarn test:frontend > /dev/null 2>&1; then
        print_status $GREEN "  ✅ Frontend tests pass locally"
    else
        print_status $RED "  ❌ Frontend tests fail locally"
    fi
    
    print_status $YELLOW "Running backend tests..."
    if yarn test:backend > /dev/null 2>&1; then
        print_status $GREEN "  ✅ Backend tests pass locally"
    else
        print_status $RED "  ❌ Backend tests fail locally"
    fi
    
    print_status $YELLOW "Running linting..."
    if yarn lint > /dev/null 2>&1; then
        print_status $GREEN "  ✅ Linting passes locally"
    else
        print_status $RED "  ❌ Linting fails locally"
    fi
}

# Main function
main() {
    print_status $BLUE "🚀 PR Status Diagnostic Tool"
    print_status $BLUE "=========================="
    echo ""
    
    # Check prerequisites
    check_gh_cli
    check_auth
    
    # Get current branch and PR
    local current_branch=$(get_current_branch)
    local pr_number=$(get_pr_number)
    
    print_status $GREEN "📍 Current branch: $current_branch"
    if [ "$pr_number" != "No PR found" ]; then
        print_status $GREEN "📍 PR number: #$pr_number"
    else
        print_status $YELLOW "⚠️  No PR found for current branch"
    fi
    echo ""
    
    # Run diagnostics
    check_workflow_files
    check_conflicting_workflows
    check_branch_protection
    
    if [ "$pr_number" != "No PR found" ]; then
        check_workflow_runs "$pr_number"
    fi
    
    check_local_tests
    
    # Provide solutions
    provide_solutions "$pr_number"
    
    echo ""
    print_status $GREEN "✅ Diagnostic complete!"
    print_status $YELLOW "💡 Check the output above for issues and try the suggested solutions."
}

# Run main function
main "$@" 