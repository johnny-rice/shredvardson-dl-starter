#!/bin/bash
# Batch delegate: commit specs + generate all delegation packages
# Usage: ./scripts/delegation/batch-delegate.sh "123,124,125"

set -euo pipefail

ISSUES_INPUT="${1:-}"

if [ -z "$ISSUES_INPUT" ]; then
  echo "❌ Usage: $0 <comma-separated-issue-numbers>"
  echo "Example: $0 \"123,124,125\""
  exit 1
fi

# Parse issue numbers
ISSUES=$(echo "$ISSUES_INPUT" | tr ',' '\n' | sed 's/[^0-9]//g' | grep -v '^$' | sort -u)
# Use mapfile for robust array assignment (shellcheck SC2206)
mapfile -t ISSUE_ARRAY < <(echo "$ISSUES")
ISSUE_COUNT=${#ISSUE_ARRAY[@]}

echo "🚀 Batch delegation for $ISSUE_COUNT issue(s)..."
echo ""

# Step 1: Batch commit specs
echo "📦 Step 1: Committing specs to batch branch..."
echo ""

BATCH_OUTPUT=$(./scripts/delegation/batch-commit-specs.sh "$ISSUES_INPUT" 2>&1)
BATCH_RESULT=$?

if [ $BATCH_RESULT -ne 0 ]; then
  echo "❌ Failed to commit specs:"
  echo "$BATCH_OUTPUT"
  exit 1
fi

# Extract batch branch name from output
BATCH_BRANCH=$(echo "$BATCH_OUTPUT" | grep "📦 Branch:" | sed 's/.*Branch: //' | tr -d ' ')

if [ -z "$BATCH_BRANCH" ]; then
  echo "⚠️  Could not determine batch branch name, using timestamp"
  BATCH_BRANCH="specs/batch-$(date +%Y-%m-%d-%H%M)"
  echo "   Using fallback batch branch: $BATCH_BRANCH"
fi

echo "$BATCH_OUTPUT"
echo ""
echo "─────────────────────────────────────────────────────────"
echo ""

# Step 2: Generate delegation packages
echo "📝 Step 2: Generating delegation packages..."
echo ""

SUCCESSFUL_PACKAGES=()
FAILED_PACKAGES=()

for ISSUE in "${ISSUE_ARRAY[@]}"; do
  echo "   Creating package for Issue #$ISSUE..."
  
  if ./scripts/delegation/create-package.sh "$ISSUE" &>/dev/null; then
    SUCCESSFUL_PACKAGES+=("$ISSUE")
    echo "   ✅ /tmp/delegation-${ISSUE}.txt"
  else
    FAILED_PACKAGES+=("$ISSUE")
    echo "   ❌ Failed to create package for Issue #$ISSUE"
  fi
done

echo ""

# Check if any packages were created
if [ ${#SUCCESSFUL_PACKAGES[@]} -eq 0 ]; then
  echo "❌ No delegation packages were created successfully"
  exit 1
fi

# Display summary
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "✅ Batch delegation ready!"
echo ""
echo "📦 Specs committed to: $BATCH_BRANCH"
echo ""
echo "📝 Delegation packages created:"

for ISSUE in "${SUCCESSFUL_PACKAGES[@]}"; do
  echo "   - /tmp/delegation-${ISSUE}.txt (Issue #${ISSUE})"
done

if [ ${#FAILED_PACKAGES[@]} -gt 0 ]; then
  echo ""
  echo "⚠️  Failed packages:"
  for ISSUE in "${FAILED_PACKAGES[@]}"; do
    echo "   - Issue #${ISSUE}"
  done
fi

echo ""
echo "🌐 Next steps (do in parallel):"
echo ""
echo "1. Open ${#SUCCESSFUL_PACKAGES[@]} Claude Code web sessions at https://claude.ai/code"
echo ""
echo "2. In each session, paste one delegation package:"

SESSION=1
for ISSUE in "${SUCCESSFUL_PACKAGES[@]}"; do
  echo "   - Session $SESSION: cat /tmp/delegation-${ISSUE}.txt | pbcopy && paste"
  ((SESSION++))
done

echo ""
echo "3. Each Claude Web will:"
echo "   - Fetch spec from $BATCH_BRANCH"
echo "   - Create feature branch"
echo "   - Implement following spec"
echo "   - Create PR"
echo ""
echo "4. After all PRs created, review on desktop:"
echo "   gh pr list --author @me"
echo "   gh pr checkout <NUMBER>"
echo "   # Fix any metadata issues"
echo "   git push"
echo ""

# Calculate time savings
IMPLEMENTATION_TIME=$((ISSUE_COUNT * 30))
USER_TIME=$((5 + ISSUE_COUNT * 3))

echo "💡 Time estimate:"
echo "   - Total implementation: ~${IMPLEMENTATION_TIME} min (${ISSUE_COUNT} issues × 30 min)"
echo "   - Your active time: ~${USER_TIME} min (5 min setup + ${ISSUE_COUNT} × 3 min review)"
echo "   - Time saved: ~$((IMPLEMENTATION_TIME - USER_TIME)) min"
echo ""

# Show preview of first package
if [ ${#SUCCESSFUL_PACKAGES[@]} -gt 0 ]; then
  FIRST_ISSUE="${SUCCESSFUL_PACKAGES[0]}"
  echo "─────────────────────────────────────────────────────────"
  echo ""
  echo "📋 Preview of delegation package for Issue #${FIRST_ISSUE}:"
  echo ""
  head -30 "/tmp/delegation-${FIRST_ISSUE}.txt"
  echo ""
  echo "   ... (see full package in /tmp/delegation-${FIRST_ISSUE}.txt)"
  echo ""
fi

echo "═══════════════════════════════════════════════════════════"
