#!/bin/bash
set -euo pipefail

# Git Skill Router
# Routes /git commands to appropriate sub-skills

ACTION=${1:-""}
shift || true

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GIT_SKILLS_DIR="$SCRIPT_DIR/git"

case "$ACTION" in
branch)
  exec "$GIT_SKILLS_DIR/branch.sh" "$@"
  ;;
commit)
  exec "$GIT_SKILLS_DIR/commit.sh" "$@"
  ;;
pr)
  exec "$GIT_SKILLS_DIR/pr.sh" "$@"
  ;;
workflow)
  exec "$GIT_SKILLS_DIR/workflow.sh" "$@"
  ;;
tag)
  exec "$GIT_SKILLS_DIR/tag.sh" "$@"
  ;;
"")
  jq -n '{
      error: "Action required",
      available_actions: ["branch", "commit", "pr", "workflow", "tag"],
      usage: "/git <action> [args]",
      examples: [
        "/git branch Issue #123: Add feature",
        "/git commit \"feat: add component\"",
        "/git pr prepare",
        "/git pr fix 141",
        "/git workflow",
        "/git tag v1.2.0"
      ]
    }'
  exit 1
  ;;
*)
  jq -n --arg action "$ACTION" '{
      error: "Unknown action",
      action: $action,
      available_actions: ["branch", "commit", "pr", "workflow", "tag"],
      suggestion: "Run /git without arguments to see usage"
    }'
  exit 1
  ;;
esac
