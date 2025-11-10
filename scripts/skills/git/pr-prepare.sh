#!/bin/bash
set -euo pipefail

# Git PR Prepare Sub-Skill
# Prepares and creates pull request
# Delegates to LLM for PR body generation

# Setup logging
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../../utils/skill-logger.sh"
setup_skill_logging "git" "pr-prepare"

# Check if on feature branch
CURRENT_BRANCH=$(git branch --show-current)

# Handle detached HEAD
if [[ -z "$CURRENT_BRANCH" ]]; then
  jq -n '{
    status: "error",
    error: "Not on a branch (detached HEAD)",
    suggestion: "Create/switch to a feature branch: git switch -c feature/<number>-<slug>"
  }'
  exit 1
fi

# Check if on main/master
if [[ "$CURRENT_BRANCH" == "main" ]] || [[ "$CURRENT_BRANCH" == "master" ]]; then
  jq -n --arg branch "$CURRENT_BRANCH" '{
    status: "error",
    error: "Cannot create PR from main branch",
    current_branch: $branch,
    suggestion: "Create a feature branch first with /git branch"
  }'
  exit 1
fi

# Check if changes are committed (handle repos without initial commit)
if ! git rev-parse --verify HEAD >/dev/null 2>&1; then
  # No commits yet in repo
  if ! git diff --quiet 2>/dev/null; then
    jq -n '{
      status: "error",
      error: "Uncommitted changes in repository with no commits",
      suggestion: "Create initial commit first with /git commit"
    }'
    exit 1
  fi
elif ! git diff-index --quiet HEAD -- 2>/dev/null; then
  # Normal case: repo has commits, check for uncommitted changes
  jq -n '{
    status: "error",
    error: "Uncommitted changes",
    suggestion: "Commit changes first with /git commit"
  }'
  exit 1
fi

# Check if branch is pushed
if ! git ls-remote --exit-code --heads origin "$CURRENT_BRANCH" >/dev/null 2>&1; then
  # Push branch
  if ! git push -u origin "$CURRENT_BRANCH" >/dev/null 2>&1; then
    jq -n --arg branch "$CURRENT_BRANCH" '{
      status: "error",
      error: "Failed to push branch to origin",
      current_branch: $branch,
      suggestion: "Check git remote and auth: git remote -v; gh auth status"
    }'
    exit 1
  fi
fi

# Extract issue number from branch
ISSUE_NUM=""
if [[ "$CURRENT_BRANCH" =~ ^[^/]+/([0-9]+)- ]]; then
  ISSUE_NUM="${BASH_REMATCH[1]}"
fi

# Detect default remote branch (supports main, master, etc.)
# Use || true to prevent pipefail from exiting when symbolic-ref fails (common in bare repos)
DEFAULT_BRANCH=$(git symbolic-ref -q --short refs/remotes/origin/HEAD 2>/dev/null | sed 's#^origin/##' || true)
DEFAULT_BRANCH=${DEFAULT_BRANCH:-main}

# Get commit history for PR body context
COMMITS=$(git log --oneline "origin/${DEFAULT_BRANCH}..HEAD" 2>/dev/null | jq -R . | jq -s . || echo "[]")
FILES_CHANGED=$(git diff --name-only "origin/${DEFAULT_BRANCH}..HEAD" 2>/dev/null | jq -R . | jq -s . || echo "[]")

# Signal LLM to generate PR
jq -n \
  --arg branch "$CURRENT_BRANCH" \
  --arg issue "$ISSUE_NUM" \
  --argjson commits "$COMMITS" \
  --argjson files "$FILES_CHANGED" \
  '{
    status: "needs_pr_body",
    message: "Please generate PR title and body",
    branch: $branch,
    issue: (if ($issue | length) > 0 then $issue else null end),
    commits: $commits,
    files_changed: $files,
    instructions: "Create PR with gh pr create",
    template: ".github/pull_request_template.md",
    child_skills: [
      {
        name: "generate-pr-body",
        description: "Generate PR title and body following template",
        requires_llm: true,
        steps: [
          "Read .github/pull_request_template.md",
          "Analyze commits and changes",
          "Generate PR title: type: description (Issue #X)",
          "Generate PR body with all sections. IMPORTANT: If issue number exists, add \"Closes #X\" at the end of the Summary section to auto-close the issue when merged",
          "Create PR: gh pr create --title ... --body ..."
        ]
      }
    ]
  }'
