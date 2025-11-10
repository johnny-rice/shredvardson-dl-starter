#!/bin/bash
# Skill Logging Utility
# Provides lightweight CSV-based usage tracking for Skills
# ADR: docs/adr/003-phase-4a-skills-observability.md

set -euo pipefail

# Configuration
LOG_FILE="${LOG_FILE:-.logs/skill-usage.csv}"
# Use Python for millisecond precision (cross-platform compatible)
START_TIME=$(python3 -c 'import time; print(int(time.time() * 1000))' 2>/dev/null || echo $(($(date +%s) * 1000)))

# Initialize logging infrastructure
init_skill_logging() {
  # Skip if logging is disabled (tests set LOG_FILE=/dev/null)
  [[ "${LOG_FILE:-}" == "/dev/null" ]] && return 0

  # Create logs directory if it doesn't exist
  mkdir -p .logs

  # Create CSV header if file doesn't exist
  if [ ! -f "$LOG_FILE" ]; then
    echo "timestamp,skill,action,exit_code,duration_ms" > "$LOG_FILE"
  fi
}

# Log a skill invocation
# Args: $1=skill_name, $2=action, $3=exit_code (optional, defaults to $?)
log_skill_invocation() {
  # Skip if logging is disabled
  [[ "${LOG_FILE:-}" == "/dev/null" ]] && return 0

  local skill=$1
  local action=$2
  local exit_code=${3:-$?}

  # Calculate duration (declare and assign separately to catch failures)
  local end_time
  end_time=$(python3 -c 'import time; print(int(time.time() * 1000))' 2>/dev/null || echo $(($(date +%s) * 1000)))
  local duration=$((end_time - START_TIME))

  # Get current timestamp (declare and assign separately)
  local timestamp
  timestamp=$(date -u +%s)

  # Append to log file
  echo "$timestamp,$skill,$action,$exit_code,$duration" >> "$LOG_FILE"
}

# Setup automatic logging on script exit
# Args: $1=skill_name, $2=action
setup_skill_logging() {
  # Export as global variables so trap can access them
  export SKILL_NAME=$1
  export SKILL_ACTION=$2

  # Initialize logging
  init_skill_logging

  # Setup trap to log on exit (use single quotes to delay expansion)
  trap 'log_skill_invocation "$SKILL_NAME" "$SKILL_ACTION"' EXIT
}

# Export functions for use in other scripts
export -f init_skill_logging
export -f log_skill_invocation
export -f setup_skill_logging