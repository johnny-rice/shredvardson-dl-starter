#!/bin/bash
set -euo pipefail

# Git Workflow Sub-Skill
# Full git workflow automation

# Get current branch and status
CURRENT_BRANCH=$(git branch --show-current)
IS_CLEAN=$(git diff-index --quiet HEAD 2>/dev/null && echo "true" || echo "false")

# Get branch status
BEHIND_MAIN=""
AHEAD_MAIN=""
if [[ "$CURRENT_BRANCH" != "main" ]]; then
  git fetch origin main >/dev/null 2>&1 || true
  BEHIND_MAIN=$(git rev-list --count HEAD..origin/main 2>/dev/null || echo "0")
  AHEAD_MAIN=$(git rev-list --count origin/main..HEAD 2>/dev/null || echo "0")
fi

# Determine workflow stage
STAGE="unknown"
NEXT_STEPS=[]

if [[ "$CURRENT_BRANCH" == "main" ]]; then
  STAGE="start"
  NEXT_STEPS='["Create feature branch with /git branch"]'
elif [[ "$IS_CLEAN" == "false" ]]; then
  STAGE="uncommitted"
  NEXT_STEPS='["Commit changes with /git commit"]'
elif [[ "$AHEAD_MAIN" == "0" ]]; then
  STAGE="no_changes"
  NEXT_STEPS='["Make changes and commit"]'
elif ! git ls-remote --exit-code --heads origin "$CURRENT_BRANCH" >/dev/null 2>&1; then
  STAGE="unpushed"
  NEXT_STEPS='["Create PR with /git pr prepare"]'
else
  # Check if PR exists
  if gh pr view "$CURRENT_BRANCH" >/dev/null 2>&1; then
    PR_NUMBER=$(gh pr view "$CURRENT_BRANCH" --json number -q .number)
    PR_STATE=$(gh pr view "$CURRENT_BRANCH" --json state -q .state)

    if [[ "$PR_STATE" == "MERGED" ]]; then
      STAGE="merged"
      NEXT_STEPS='["Switch to main and start new feature"]'
    else
      STAGE="pr_open"
      NEXT_STEPS=$(jq -n --arg pr "$PR_NUMBER" '["Wait for PR #" + $pr + " to be reviewed"]')
    fi
  else
    STAGE="ready_for_pr"
    NEXT_STEPS='["Create PR with /git pr prepare"]'
  fi
fi

# Output workflow status
jq -n \
  --arg branch "$CURRENT_BRANCH" \
  --arg stage "$STAGE" \
  --arg clean "$IS_CLEAN" \
  --arg behind "$BEHIND_MAIN" \
  --arg ahead "$AHEAD_MAIN" \
  --argjson steps "$NEXT_STEPS" \
  '{
    status: "success",
    workflow_stage: $stage,
    branch: $branch,
    is_clean: ($clean == "true"),
    commits_behind_main: ($behind | tonumber),
    commits_ahead_main: ($ahead | tonumber),
    next_steps: $steps,
    available_commands: [
      "/git branch - Create new branch",
      "/git commit - Commit changes",
      "/git pr prepare - Create PR",
      "/git pr fix - Fix PR issues"
    ]
  }'
