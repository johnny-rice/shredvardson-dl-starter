#!/bin/bash
set -euo pipefail

# Git Commit Sub-Skill
# Smart commit with conventional format
# Delegates to LLM for message generation

MESSAGE="${*:-}"

# Check for staged changes
if git diff --cached --quiet; then
  # List unstaged changes if any
  if ! git diff --quiet; then
    UNSTAGED=$(git diff --name-only | jq -R . | jq -s .)
    jq -n --argjson files "$UNSTAGED" '{
      status: "error",
      error: "No staged changes",
      suggestion: "Stage files with: git add <files>",
      unstaged_files: $files
    }'
  else
    jq -n '{
      status: "error",
      error: "No staged changes",
      suggestion: "Stage files with: git add <files>",
      unstaged_files: []
    }'
  fi
  exit 1
fi

# If message provided, use it directly
if [[ -n "$MESSAGE" ]]; then
  # Validate conventional commit format
  if [[ ! "$MESSAGE" =~ ^(feat|fix|chore|docs|refactor|test|ci|build|perf|style)(\(.*\))?:\ .+ ]]; then
    jq -n --arg msg "$MESSAGE" '{
      error: "Invalid conventional commit format",
      message: $msg,
      expected: "type(scope): description",
      types: ["feat", "fix", "chore", "docs", "refactor", "test", "ci", "build", "perf", "style"]
    }'
    exit 1
  fi

  # Create commit
  git commit -m "$MESSAGE" >/dev/null 2>&1

  jq -n --arg msg "$MESSAGE" '{
    status: "success",
    message: "Commit created",
    commit_message: $msg,
    next_steps: [
      "/git pr prepare to create PR",
      "/git workflow to continue"
    ]
  }'
else
  # Signal LLM to generate message
  # Get staged files and diff for context
  STAGED_FILES=$(git diff --cached --name-only | jq -R . | jq -s .)
  DIFF_STAT=$(git diff --cached --stat | tail -1)

  jq -n --argjson files "$STAGED_FILES" --arg stat "$DIFF_STAT" '{
    status: "needs_message",
    message: "Please analyze changes and provide commit message",
    staged_files: $files,
    diff_stat: $stat,
    instructions: "Analyze git diff --cached and create conventional commit message",
    format: "type(scope): description",
    child_skills: [
      {
        name: "generate-commit-message",
        description: "Analyze staged changes and generate conventional commit message",
        requires_llm: true
      }
    ]
  }'
fi
