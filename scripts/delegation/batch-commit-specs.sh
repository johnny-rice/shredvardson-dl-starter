#!/bin/bash
# Batch commit multiple spec files to a timestamped branch
# Usage: ./scripts/delegation/batch-commit-specs.sh "123,124,125"

set -euo pipefail

ISSUES_INPUT="${1:-}"

if [ -z "$ISSUES_INPUT" ]; then
  echo "❌ Usage: $0 <comma-separated-issue-numbers>"
  echo "Example: $0 \"123,124,125\""
  exit 1
fi

# Parse issue numbers (handle various formats)
ISSUES=$(echo "$ISSUES_INPUT" | tr ',' '\n' | sed 's/[^0-9]//g' | grep -v '^$' | sort -u)

if [ -z "$ISSUES" ]; then
  echo "❌ No valid issue numbers found in: $ISSUES_INPUT"
  exit 1
fi

# Use mapfile for robust array assignment (shellcheck SC2206)
mapfile -t ISSUE_ARRAY < <(echo "$ISSUES")
ISSUE_COUNT=${#ISSUE_ARRAY[@]}

echo "📦 Batch committing $ISSUE_COUNT spec(s)..."
echo ""

# Validate all specs exist
MISSING_SPECS=()
SPEC_FILES=()

for ISSUE in "${ISSUE_ARRAY[@]}"; do
  SPEC_FILE=$(find specs -name "${ISSUE}-*.md" -type f 2>/dev/null | head -1)
  
  if [ -z "$SPEC_FILE" ]; then
    MISSING_SPECS+=("$ISSUE")
  else
    SPEC_FILES+=("$SPEC_FILE")
  fi
done

if [ ${#MISSING_SPECS[@]} -gt 0 ]; then
  echo "❌ Missing spec files for issues: ${MISSING_SPECS[*]}"
  echo ""
  echo "Run /specify for each missing issue:"
  for MISSING in "${MISSING_SPECS[@]}"; do
    echo "  /specify Issue #$MISSING"
  done
  exit 1
fi

# Check for uncommitted non-spec changes
if ! git diff --quiet --exit-code -- . ':!specs/*.md'; then
  echo "⚠️  You have uncommitted changes outside of specs/"
  echo "Please commit or stash them before creating batch branch."
  echo ""
  echo "Uncommitted files:"
  git diff --name-only -- . ':!specs/*.md'
  exit 1
fi

# Generate timestamp and branch name
TIMESTAMP=$(date +%Y-%m-%d-%H%M)
BRANCH_NAME="specs/batch-${TIMESTAMP}"

echo "📝 Specs to commit:"
for SPEC in "${SPEC_FILES[@]}"; do
  ISSUE_NUM=$(basename "$SPEC" | sed 's/-.*//')
  echo "   - $SPEC (Issue #$ISSUE_NUM)"
done
echo ""

# Create batch branch
echo "🔀 Creating branch: $BRANCH_NAME"
if ! git switch -c "$BRANCH_NAME"; then
  echo "❌ Failed to create branch: $BRANCH_NAME"
  exit 1
fi

# Stage spec files
echo "➕ Staging spec files..."
for SPEC in "${SPEC_FILES[@]}"; do
  git add "$SPEC"
done

# Create commit message
ISSUE_LIST=$(echo "${ISSUE_ARRAY[@]}" | sed 's/ /, #/g' | sed 's/^/#/')
COMMIT_MSG="spec: batch of $ISSUE_COUNT specs for web delegation

Specs for issues: $ISSUE_LIST

These specs are ready for parallel delegation to Claude Code Web.
Each spec can be retrieved via git checkout from this branch."

# Commit
echo "💾 Creating commit..."
if ! git commit -m "$COMMIT_MSG"; then
  echo "❌ Failed to commit specs"
  exit 1
fi

# Push
echo "🚀 Pushing to remote..."
if ! git push -u origin "$BRANCH_NAME"; then
  echo "❌ Failed to push branch: $BRANCH_NAME"
  echo "You can manually push with: git push -u origin $BRANCH_NAME"
  exit 1
fi

# Success output
echo ""
echo "✅ Batch specs committed successfully!"
echo ""
echo "📦 Branch: $BRANCH_NAME"
echo "📝 Specs committed:"
for SPEC in "${SPEC_FILES[@]}"; do
  ISSUE_NUM=$(basename "$SPEC" | sed 's/-.*//')
  echo "   - $SPEC (Issue #$ISSUE_NUM)"
done
echo ""
echo "🔗 Pushed to: origin/$BRANCH_NAME"
echo ""
echo "🌐 Next steps:"
echo "   1. Run /delegate Issue #<NUM> for each issue"
echo "   2. Each delegation package will reference this branch"
echo "   3. Claude Web will fetch specs from: $BRANCH_NAME"
echo ""
echo "💡 Or use the convenience command:"
echo "   /batch-delegate $ISSUES_INPUT"
