#!/bin/bash

# Simple Workflow Status Check Script
# Helps troubleshoot PR status issues

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

echo "🔍 Workflow Status Check"
echo "======================="
echo ""

# Check current branch
current_branch=$(git branch --show-current)
print_status $GREEN "📍 Current branch: $current_branch"

# Check if we have uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    print_status $YELLOW "⚠️  You have uncommitted changes"
    git status --short
else
    print_status $GREEN "✅ No uncommitted changes"
fi

echo ""
print_status $BLUE "📋 Current Workflow Configuration:"
echo ""

# Check workflow files
if [ -d ".github/workflows" ]; then
    for file in .github/workflows/*.yml; do
        if [ -f "$file" ]; then
            name=$(basename "$file")
            print_status $GREEN "  ✅ $name"
            
            # Show triggers
            if grep -q "pull_request:" "$file"; then
                print_status $YELLOW "     └─ Triggers on PRs"
            fi
            if grep -q "push:" "$file"; then
                print_status $YELLOW "     └─ Triggers on push"
            fi
        fi
    done
else
    print_status $RED "❌ No .github/workflows directory found"
fi

echo ""
print_status $BLUE "🧪 Local Test Status:"
echo ""

# Test frontend
print_status $YELLOW "Running frontend tests..."
if timeout 60 yarn test:frontend > /dev/null 2>&1; then
    print_status $GREEN "  ✅ Frontend tests pass"
else
    print_status $RED "  ❌ Frontend tests fail"
fi

# Test backend
print_status $YELLOW "Running backend tests..."
if timeout 60 yarn test:backend > /dev/null 2>&1; then
    print_status $GREEN "  ✅ Backend tests pass"
else
    print_status $RED "  ❌ Backend tests fail"
fi

echo ""
print_status $BLUE "🛠️  Troubleshooting Steps:"
echo ""
print_status $YELLOW "1. Check GitHub Actions tab:"
echo "   - Go to your repository on GitHub"
echo "   - Click 'Actions' tab"
echo "   - Look for any running or failed workflows"
echo ""

print_status $YELLOW "2. If workflows are stuck:"
echo "   - Cancel any running workflows"
echo "   - Push an empty commit to re-trigger:"
echo "     git commit --allow-empty -m '🔄 Re-trigger workflows'"
echo "     git push"
echo ""

print_status $YELLOW "3. Check branch protection rules:"
echo "   - Go to Settings → Branches"
echo "   - Ensure required checks match:"
echo "     - Frontend Tests"
echo "     - Backend Tests"
echo ""

print_status $YELLOW "4. If still stuck:"
echo "   - Temporarily disable branch protection"
echo "   - Merge PR manually"
echo "   - Re-enable protection rules"
echo ""

print_status $GREEN "✅ Status check complete!" 