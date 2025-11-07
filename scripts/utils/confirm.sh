#!/bin/bash
# Reusable confirmation helper for destructive operations
#
# Usage:
#   source "$(dirname "$0")/utils/confirm.sh"
#   confirm "This will delete all data"
#
# Features:
#   - Interactive confirmation (user must type "yes")
#   - Force mode via FORCE=true env var
#   - Non-interactive detection (CI/CD safety)
#   - Exit code 2 for safety blocks (vs 1 for errors)
#
# Examples:
#   ./script.sh              # Prompts for confirmation
#   FORCE=true ./script.sh   # Bypasses confirmation

confirm() {
  local message="$1"

  # Skip in force mode (FORCE env var)
  if [[ "${FORCE:-}" == "true" ]]; then
    echo "⚡ Force mode enabled, skipping confirmation" >&2
    return 0
  fi

  # Detect non-interactive mode (CI/CD)
  if [ ! -t 0 ]; then
    echo "❌ ERROR: Running in non-interactive mode without FORCE=true" >&2
    echo "   Use FORCE=true environment variable to bypass confirmation" >&2
    exit 2
  fi

  # Show warning and prompt
  echo "" >&2
  echo "⚠️  WARNING: $message" >&2
  echo "" >&2
  read -p "Type 'yes' to continue: " -r response >&2
  echo "" >&2

  # Validate response
  if [[ "$response" != "yes" ]]; then
    echo "❌ Aborted." >&2
    exit 1
  fi

  return 0
}

# Export function for use in sourced scripts
export -f confirm
