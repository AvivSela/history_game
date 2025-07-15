#!/bin/bash

# CI/CD Setup Script for Timeline Game Project
# This script helps set up and verify the CI/CD pipeline

set -e

echo "🚀 Setting up CI/CD pipeline for Timeline Game Project"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "timeline-frontend" ] || [ ! -d "timeline-backend" ]; then
    print_error "This script must be run from the project root directory"
    exit 1
fi

print_status "Checking project structure..."

# Verify required files exist
required_files=(
    ".github/workflows/test.yml"
    ".github/workflows/security.yml"
    "timeline-frontend/package.json"
    "timeline-backend/package.json"
    "package.json"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        print_success "✓ $file exists"
    else
        print_error "✗ $file missing"
        exit 1
    fi
done

print_status "Checking Node.js and Yarn versions..."

# Check Node.js version
NODE_VERSION=$(node --version)
if [[ $NODE_VERSION == v18* ]]; then
    print_success "✓ Node.js version: $NODE_VERSION (compatible)"
else
    print_warning "⚠ Node.js version: $NODE_VERSION (recommend v18.x)"
fi

# Check Yarn version
YARN_VERSION=$(yarn --version)
if [[ $YARN_VERSION == 1.22* ]]; then
    print_success "✓ Yarn version: $YARN_VERSION (compatible)"
else
    print_warning "⚠ Yarn version: $YARN_VERSION (recommend 1.22.x)"
fi

print_status "Checking dependencies..."

# Check if dependencies are installed
if [ -d "node_modules" ] && [ -d "timeline-frontend/node_modules" ] && [ -d "timeline-backend/node_modules" ]; then
    print_success "✓ Dependencies installed"
else
    print_warning "⚠ Dependencies not installed. Run 'yarn install' first"
fi

print_status "Testing CI scripts locally..."

# Test frontend scripts
cd timeline-frontend
if yarn test --run > /dev/null 2>&1; then
    print_success "✓ Frontend tests pass"
else
    print_warning "⚠ Frontend tests failed (this is expected if no tests exist yet)"
fi

if yarn lint > /dev/null 2>&1; then
    print_success "✓ Frontend linting passes"
else
    print_warning "⚠ Frontend linting failed (check for linting issues)"
fi

cd ../timeline-backend
if yarn test > /dev/null 2>&1; then
    print_success "✓ Backend tests pass"
else
    print_warning "⚠ Backend tests failed (this is expected if no tests exist yet)"
fi

cd ..

print_status "Checking GitHub Actions configuration..."

# Check if .github directory exists
if [ -d ".github" ]; then
    print_success "✓ .github directory exists"
else
    print_error "✗ .github directory missing"
    exit 1
fi

# Check if workflows directory exists
if [ -d ".github/workflows" ]; then
    print_success "✓ Workflows directory exists"
else
    print_error "✗ Workflows directory missing"
    exit 1
fi

print_status "Setting up Git hooks..."

# Check if Husky is configured
if [ -f ".husky/pre-commit" ]; then
    print_success "✓ Husky pre-commit hook configured"
else
    print_warning "⚠ Husky pre-commit hook not configured"
    echo "   Run: yarn prepare"
fi

print_status "Checking for potential issues..."

# Check for common issues
if [ -f "yarn.lock" ]; then
    print_success "✓ yarn.lock exists"
else
    print_error "✗ yarn.lock missing - run 'yarn install'"
fi

# Check for environment files
if [ -f ".env" ] || [ -f ".env.example" ]; then
    print_success "✓ Environment files exist"
else
    print_warning "⚠ No .env files found - consider adding .env.example"
fi

print_status "CI/CD Setup Summary"
echo "======================"
echo ""
echo "✅ Workflow files created:"
echo "   - .github/workflows/test.yml"
echo "   - .github/workflows/security.yml"
echo ""
echo "📋 Next steps:"
echo "1. Push your code to GitHub"
echo "2. Go to Settings > Actions > General"
echo "3. Enable 'Allow all actions and reusable workflows'"
echo "4. Set up branch protection rules (recommended)"
echo "5. Configure environments for deployment (optional)"
echo ""
echo "🔧 Optional configurations:"
echo "- Set up Codecov for coverage reporting"
echo "- Add Slack/Discord notifications"
echo "- Set up branch protection rules"
echo ""
echo "📚 Documentation:"
echo "- See docs/CI-CD-SETUP.md for detailed information"
echo "- GitHub Actions tab will show workflow runs"
echo ""
print_success "CI/CD pipeline setup complete! 🎉" 