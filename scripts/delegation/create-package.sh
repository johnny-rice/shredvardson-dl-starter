#!/bin/bash
# Create Claude Code Web delegation package
# Usage: ./scripts/delegation/create-package.sh 258

set -euo pipefail

ISSUE_NUM="${1:-}"

if [ -z "$ISSUE_NUM" ]; then
  echo "❌ Usage: $0 <issue-number>"
  echo "Example: $0 258"
  exit 1
fi

echo "📦 Creating delegation package for Issue #${ISSUE_NUM}..."
echo ""

# Get current branch for spec retrieval
CURRENT_BRANCH=$(git branch --show-current)

# Check if issue exists
if ! gh issue view "$ISSUE_NUM" &>/dev/null; then
  echo "❌ Issue #${ISSUE_NUM} not found"
  exit 1
fi

# Find spec file
if [ ! -d "specs" ]; then
  echo "❌ specs/ directory not found"
  exit 1
fi

SPEC_FILE=$(find specs -name "${ISSUE_NUM}-*.md" -type f | head -1)

if [ -z "$SPEC_FILE" ]; then
  echo "⚠️  No spec found. Create one first with: /specify Issue #${ISSUE_NUM}"
  echo ""
  # Only prompt if running interactively
  if [ -t 0 ]; then
    echo "Or proceed without spec (not recommended)?"
    read -p "Continue without spec? (y/N): " -n 1 -r -t 10 || REPLY=""
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      exit 1
    fi
  else
    # Non-interactive: fail safely
    exit 1
  fi
fi

# Create temp file
OUTPUT="/tmp/delegation-${ISSUE_NUM}.txt"

# Build the package
{
  echo "=== DELEGATION PACKAGE FOR ISSUE #${ISSUE_NUM} ==="
  echo ""
  echo "Please implement this following our project standards."
  echo ""
  echo "## Issue Details"
  echo ""
  if ! gh issue view "$ISSUE_NUM" --json number,title,body | \
      jq -r '"**#\(.number)**: \(.title)\n\n\(.body)"'; then
    echo "❌ Failed to fetch or parse issue #${ISSUE_NUM}"
    exit 1
  fi
  echo ""

  if [ -n "$SPEC_FILE" ]; then
    echo "---"
    echo ""
    echo "## Spec"
    echo ""
    cat "$SPEC_FILE"
    echo ""
  fi

  echo "---"
  echo ""
  echo "## Implementation Requirements"
  echo ""
  echo "### Git Setup"
  echo ""
  echo "The spec file is located on branch: \`${CURRENT_BRANCH}\`"
  echo ""
  echo "To retrieve the spec before starting work:"
  echo ""
  echo "\`\`\`bash"
  echo "# Fetch the latest changes"
  echo "git fetch origin ${CURRENT_BRANCH}"
  echo ""
  echo "# Create your feature branch from main/master"
  echo "git switch -c feature/${ISSUE_NUM}-brief-description"
  echo ""
  echo "# Copy the spec file from the spec branch"
  echo "git checkout origin/${CURRENT_BRANCH} -- ${SPEC_FILE}"
  echo ""
  echo "# Commit the spec to your feature branch"
  echo "git commit -m \"docs: add spec for issue #${ISSUE_NUM}\""
  echo "\`\`\`"
  echo ""
  echo "### Implementation Steps"
  echo ""
  echo "1. Follow acceptance criteria from spec above"
  echo "2. Use conventional commit format: \`fix:\` or \`feat:\`"
  echo "3. Run these before pushing:"
  echo "   - \`pnpm typecheck\`"
  echo "   - \`pnpm lint\`"
  echo "   - \`pnpm test\`"
  if [ -n "$SPEC_FILE" ]; then
    echo "4. Reference Spec ID: SPEC-${ISSUE_NUM}"
  fi
  echo ""
  echo "---"
  echo ""
  echo "## PR Template"
  echo ""
  if [ -f ".github/pull_request_template.md" ]; then
    cat .github/pull_request_template.md
  else
    echo "⚠️  PR template not found at .github/pull_request_template.md"
    echo "   Continuing without template reference."
  fi

} > "$OUTPUT"

# Verify output was created
if [ ! -s "$OUTPUT" ]; then
  echo "❌ Failed to create delegation package"
  exit 1
fi

# Copy to clipboard if possible
if command -v pbcopy &> /dev/null; then
  cat "$OUTPUT" | pbcopy
  echo "✅ Delegation package created and copied to clipboard!"
elif command -v xclip &> /dev/null; then
  cat "$OUTPUT" | xclip -selection clipboard
  echo "✅ Delegation package created and copied to clipboard!"
else
  echo "✅ Delegation package created at: $OUTPUT"
  echo ""
  echo "📋 Copy the contents and paste into Claude Code web:"
  echo "   cat $OUTPUT"
fi

echo ""
echo "📝 Package includes:"
echo "   - Issue #${ISSUE_NUM} details"
if [ -n "$SPEC_FILE" ]; then
  echo "   - Spec from: $SPEC_FILE"
fi
echo "   - Implementation requirements"
echo "   - PR template"
echo ""
echo "🌐 Next: Paste into Claude Code web at https://claude.ai/code"
echo ""
echo "🔧 After PR is created, review and fix metadata:"
echo "   gh pr checkout <PR-NUMBER>"
echo "   # Fix any formatting issues"
echo "   git push"