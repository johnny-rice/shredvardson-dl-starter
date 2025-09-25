#!/bin/bash

# Git Hooks Installation Script
# Installs pre-push hook to prevent direct pushes to main branch

set -e

REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
HOOKS_DIR="$REPO_ROOT/.git/hooks"
SOURCE_HOOK="$REPO_ROOT/scripts/git-hooks/pre-push"
TARGET_HOOK="$HOOKS_DIR/pre-push"

echo "🔧 Installing git hooks for branch protection..."

# Check if we're in a git repository
if [ ! -d "$REPO_ROOT/.git" ]; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Check if source hook exists
if [ ! -f "$SOURCE_HOOK" ]; then
    echo "❌ Error: Source hook not found at $SOURCE_HOOK"
    exit 1
fi

# Create hooks directory if it doesn't exist
mkdir -p "$HOOKS_DIR"

# Copy the pre-push hook
if [ -f "$TARGET_HOOK" ] && ! cmp -s "$SOURCE_HOOK" "$TARGET_HOOK"; then
    echo "⚠️  Existing pre-push hook found at $TARGET_HOOK. Remove or back it up before reinstalling."
    exit 1
fi

cp "$SOURCE_HOOK" "$TARGET_HOOK"

# Make the hook executable
chmod +x "$TARGET_HOOK"

echo "✅ Pre-push hook installed successfully!"
echo ""
echo "🛡️  Direct pushes to 'main' branch are now blocked locally."
echo "   Use feature branches and Pull Requests for all changes."
echo ""
echo "💡 To test the hook, try: git push origin main"
echo "   (This should be blocked with a helpful message)"