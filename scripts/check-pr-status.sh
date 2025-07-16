#!/bin/bash

# Script to check PR status and diagnose workflow issues
# Usage: ./scripts/check-pr-status.sh [PR_NUMBER]

set -e

echo "🔍 PR Status Checker"
echo "==================="

# Check if PR number is provided
if [ -n "$1" ]; then
    PR_NUMBER=$1
    echo "Checking PR #$PR_NUMBER"
else
    # Get current branch and find associated PR
    CURRENT_BRANCH=$(git branch --show-current)
    echo "Current branch: $CURRENT_BRANCH"
    
    # Try to find PR for current branch
    PR_INFO=$(gh pr list --head "$CURRENT_BRANCH" --json number,title,state,url)
    if [ -n "$PR_INFO" ]; then
        PR_NUMBER=$(echo "$PR_INFO" | jq -r '.[0].number')
        echo "Found PR #$PR_NUMBER"
    else
        echo "❌ No PR found for current branch"
        echo "Please provide PR number as argument: ./scripts/check-pr-status.sh <PR_NUMBER>"
        exit 1
    fi
fi

echo ""
echo "📋 PR Information:"
echo "=================="

# Get PR details
PR_DETAILS=$(gh pr view "$PR_NUMBER" --json title,state,url,mergeable,reviewDecision,statusCheckRollup)
echo "$PR_DETAILS" | jq '.'

echo ""
echo "🔄 Workflow Status:"
echo "=================="

# Get workflow runs for this PR
WORKFLOW_RUNS=$(gh run list --limit 10 --json status,conclusion,workflowName,url,createdAt)
echo "$WORKFLOW_RUNS" | jq '.'

echo ""
echo "📊 Status Checks:"
echo "================"

# Get status checks
STATUS_CHECKS=$(gh pr checks "$PR_NUMBER")
echo "$STATUS_CHECKS"

echo ""
echo "🔧 Troubleshooting Tips:"
echo "======================="

# Check for common issues
echo "1. If you see 'waiting for status to be reported':"
echo "   - This usually means multiple workflows are running"
echo "   - Check if both 'Test Suite' and 'CI/CD Pipeline' are running"
echo "   - The workflows might be conflicting with each other"
echo ""

echo "2. If workflows are stuck:"
echo "   - Check the Actions tab in GitHub"
echo "   - Look for any failed steps or timeouts"
echo "   - Ensure all required dependencies are available"
echo ""

echo "3. If status checks are missing:"
echo "   - Check branch protection rules"
echo "   - Ensure workflows are properly configured"
echo "   - Verify that status checks are being reported"
echo ""

echo "4. Quick fixes to try:"
echo "   - Push a small change to trigger new workflow runs"
echo "   - Cancel any stuck workflow runs"
echo "   - Check if there are any dependency issues"
echo ""

echo "📝 Next Steps:"
echo "=============="
echo "1. Check the Actions tab: https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/actions"
echo "2. Review workflow logs for any errors"
echo "3. If issues persist, try pushing a small commit to re-trigger workflows"
echo "4. Consider temporarily disabling conflicting workflows" 