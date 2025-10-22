#!/bin/bash
set -euo pipefail

# Git PR Fix Sub-Skill
# Fixes issues in existing PR

PR_NUMBER="${1:-}"

if [[ -z "$PR_NUMBER" ]]; then
  jq -n '{
    error: "PR number required",
    usage: "/git pr fix <number>",
    example: "/git pr fix 141"
  }'
  exit 1
fi

# Validate PR exists
if ! gh pr view "$PR_NUMBER" >/dev/null 2>&1; then
  jq -n --arg pr "$PR_NUMBER" '{
    error: "PR not found",
    pr_number: $pr,
    suggestion: "Check PR number with: gh pr list"
  }'
  exit 1
fi

# Get PR details
PR_BRANCH=$(gh pr view "$PR_NUMBER" --json headRefName -q .headRefName)
PR_CHECKS=$(gh pr view "$PR_NUMBER" --json statusCheckRollup -q .statusCheckRollup)

# Check if on correct branch
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$CURRENT_BRANCH" != "$PR_BRANCH" ]]; then
  jq -n --arg current "$CURRENT_BRANCH" --arg expected "$PR_BRANCH" '{
    error: "Wrong branch",
    current_branch: $current,
    expected_branch: $expected,
    suggestion: "Switch to PR branch with: git switch " + $expected
  }'
  exit 1
fi

# Signal LLM to analyze and fix PR
jq -n \
  --arg pr "$PR_NUMBER" \
  --arg branch "$PR_BRANCH" \
  --argjson checks "$PR_CHECKS" \
  '{
    status: "needs_fix",
    message: "Please analyze PR and fix issues",
    pr_number: $pr,
    branch: $branch,
    checks_status: $checks,
    instructions: "Analyze PR checks and fix issues",
    child_skills: [
      {
        name: "analyze-pr-failures",
        description: "Analyze PR check failures and fix",
        requires_llm: true,
        steps: [
          "Get PR checks: gh pr checks " + $pr,
          "Identify failing checks",
          "Fix issues (typecheck, lint, tests)",
          "Commit fixes",
          "Push updates"
        ]
      }
    ]
  }'
