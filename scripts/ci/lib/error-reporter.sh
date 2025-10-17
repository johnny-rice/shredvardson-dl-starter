#!/bin/bash
# Standardized error reporting for CI
#
# Provides functions for reporting errors and successes with debugging guide references.
# Automatically detects CI vs local environment and uses appropriate formatting.

# Source common functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# Report error with debugging guide reference
report_ci_error() {
  local error_message="$1"
  local guide_section="$2"

  # In CI environment, use GitHub Actions annotations
  if is_ci; then
    echo "::error::$error_message. See .github/DEBUGGING.md#$guide_section"
  else
    # In local environment, use colored output
    log_error "$error_message"
    echo -e "   ${YELLOW}See .github/DEBUGGING.md#$guide_section for debugging help${NC}" >&2
  fi
}

# Report success
report_ci_success() {
  local success_message="$1"

  if is_ci; then
    echo "::notice::$success_message"
  else
    log_info "$success_message"
  fi
}

# Report warning
report_ci_warning() {
  local warning_message="$1"

  if is_ci; then
    echo "::warning::$warning_message"
  else
    log_warning "$warning_message"
  fi
}