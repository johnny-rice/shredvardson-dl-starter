#!/bin/bash
set -euo pipefail

# Git Branch Sub-Skill
# Creates feature branch following naming conventions

# Setup logging
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../../utils/skill-logger.sh"
setup_skill_logging "git" "branch"

ISSUE_INPUT="${1:-}"

if [[ -z "$ISSUE_INPUT" ]]; then
  jq -n '{
    error: "Issue required",
    usage: "/git branch <issue>",
    examples: [
      "/git branch Issue #123: Add feature",
      "/git branch #123",
      "/git branch 123"
    ]
  }'
  exit 1
fi

# Extract issue number and title
if [[ "$ISSUE_INPUT" =~ ^[Ii]ssue[[:space:]]*#?([0-9]+):?[[:space:]]*(.*) ]]; then
  ISSUE_NUM="${BASH_REMATCH[1]}"
  TITLE="${BASH_REMATCH[2]}"
elif [[ "$ISSUE_INPUT" =~ ^#?([0-9]+):?[[:space:]]*(.*) ]]; then
  ISSUE_NUM="${BASH_REMATCH[1]}"
  TITLE="${BASH_REMATCH[2]}"
else
  jq -n --arg input "$ISSUE_INPUT" '{
    error: "Invalid issue format",
    input: $input,
    expected: "Issue #123: Title or #123 Title"
  }'
  exit 1
fi

# Validate title is not empty
TITLE=$(echo "$TITLE" | xargs) # Trim whitespace
if [[ -z "$TITLE" ]]; then
  jq -n --arg input "$ISSUE_INPUT" '{
    status: "error",
    error: "Issue title required",
    input: $input,
    expected: "Issue #123: Descriptive title (e.g., Issue #123: Add login feature)"
  }'
  exit 1
fi

# Generate slug from title
SLUG=$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9 -]//g' | tr ' ' '-' | sed 's/--*/-/g' | sed 's/^-//;s/-$//')

# Default to feature branch
BRANCH_NAME="feature/${ISSUE_NUM}-${SLUG}"

# Check if branch already exists
if git show-ref --quiet "refs/heads/$BRANCH_NAME"; then
  jq -n --arg branch "$BRANCH_NAME" '{
    error: "Branch already exists",
    branch: $branch,
    suggestion: "Switch to it with: git switch \($branch)"
  }'
  exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD 2>/dev/null; then
  jq -n '{
    error: "Uncommitted changes",
    suggestion: "Commit or stash changes before creating new branch"
  }'
  exit 1
fi

# Create and switch to branch
if ! git switch -c "$BRANCH_NAME" 2>&1; then
  jq -n --arg branch "$BRANCH_NAME" '{
    status: "error",
    error: "Failed to create branch",
    branch: $branch,
    suggestion: "Check git configuration and branch name validity. Branch may already exist."
  }'
  exit 1
fi

# Success output
jq -n --arg branch "$BRANCH_NAME" --arg issue "$ISSUE_NUM" '{
  status: "success",
  message: "Branch created and checked out",
  branch: $branch,
  issue: $issue,
  next_steps: [
    "Make your changes",
    "/git commit \"feat: your changes\"",
    "/git pr prepare"
  ]
}'
