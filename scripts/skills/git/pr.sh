#!/bin/bash
set -euo pipefail

# Git PR Sub-Skill
# Routes PR operations: prepare, fix

SUBACTION="${1:-}"
shift || true

case "$SUBACTION" in
prepare)
  # Delegate to prepare script
  exec "$(dirname "$0")/pr-prepare.sh" "$@"
  ;;
fix)
  # Delegate to fix script
  exec "$(dirname "$0")/pr-fix.sh" "$@"
  ;;
"")
  jq -n '{
      error: "PR action required",
      available_actions: ["prepare", "fix"],
      usage: "/git pr <prepare|fix> [args]",
      examples: [
        "/git pr prepare",
        "/git pr fix 141"
      ]
    }'
  exit 1
  ;;
*)
  jq -n --arg action "$SUBACTION" '{
      error: "Unknown PR action",
      action: $action,
      available_actions: ["prepare", "fix"]
    }'
  exit 1
  ;;
esac
