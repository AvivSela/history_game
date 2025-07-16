#!/bin/bash

# Format and commit script for remote agents
# This script ensures code is properly formatted before committing

set -e

echo "🔧 Running pre-commit formatting..."

# Change to the frontend directory
cd timeline-frontend

# Run linting and formatting
echo "📝 Running ESLint fixes..."
yarn lint:fix

echo "🎨 Running Prettier formatting..."
yarn format

# Check if there are any remaining linting issues
echo "🔍 Checking for remaining linting issues..."
if ! yarn lint; then
    echo "❌ Linting issues found after formatting. Please fix manually."
    exit 1
fi

echo "✅ Formatting completed successfully!"

# Go back to root
cd ..

echo "🚀 Ready to commit!" 