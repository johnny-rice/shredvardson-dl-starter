#!/bin/bash
# Release Helper - Manual approach respecting Red Zone rules
# Usage: ./scripts/release-helper.sh

set -euo pipefail

echo "🚀 Release Helper - Learning Loop v1.0 Setup Complete"
echo ""

# Preflight dependency checks
echo "🔍 Checking dependencies..."
for cmd in pnpm git; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "⚠️  $cmd not found; install before releasing."
  fi
done

# Check changeset via pnpm
if command -v pnpm >/dev/null 2>&1 && pnpm changeset --version >/dev/null 2>&1; then
  echo "✅ All dependencies found"
else
  echo "⚠️  changesets not found; run: pnpm install"
fi
echo ""

echo "📋 Changesets Release Workflow:"
echo "   1. pnpm changeset              # Create new changeset (describe changes)"
echo "   2. pnpm changeset:version      # Update versions & generate CHANGELOG"
echo "   3. git add -A && git commit    # Commit version bumps"
echo "   4. pnpm changeset:tag          # Create git tags"
echo "   5. git push --follow-tags      # Push with tags"
echo ""

echo "🔗 Quick commands:"
echo "   pnpm release                   # Run steps 2-5 combined (includes commit)"
echo "   gh release create TAG_NAME     # Optional: Create GitHub release"
echo ""

echo "📦 Current package versions:"
if [ -f "apps/web/package.json" ]; then
  if command -v jq >/dev/null 2>&1; then
    WEB_VERSION=$(jq -r '.version' apps/web/package.json)
  else
    WEB_VERSION=$(grep -m1 -oE '"version"\s*:\s*"[^"]+"' apps/web/package.json | cut -d'"' -f4)
  fi
  echo "   web@$WEB_VERSION"
fi

echo ""
echo "🏷️  Recent tags:"
git tag --sort=-creatordate --list | head -5 | sed 's/^/   /'

echo ""
echo "✅ Ready for manual releases using Changesets!"
echo "📖 See https://github.com/changesets/changesets for detailed usage"