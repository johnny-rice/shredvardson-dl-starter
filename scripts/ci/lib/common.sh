#!/bin/bash
# Common functions for CI scripts
#
# Provides shared utilities for logging, validation, and error handling.
# Used by all CI scripts to ensure consistent behavior.

# Color codes for output (only set if not already defined)
if [ -z "${RED:-}" ]; then
  readonly RED='\033[0;31m'
  readonly GREEN='\033[0;32m'
  readonly YELLOW='\033[1;33m'
  readonly BLUE='\033[0;34m'
  readonly NC='\033[0m' # No Color
fi

# Log functions
log_info() {
  echo -e "${GREEN}✅${NC} $1"
}

log_error() {
  echo -e "${RED}❌${NC} $1" >&2
}

log_warning() {
  echo -e "${YELLOW}⚠️${NC} $1"
}

log_debug() {
  if [ "${DEBUG:-}" = "true" ]; then
    echo -e "${BLUE}🔍${NC} $1" >&2
  fi
}

# Check if command exists
require_command() {
  local cmd="$1"
  local install_url="${2:-}"

  if ! command -v "$cmd" >/dev/null 2>&1; then
    log_error "$cmd is required but not installed"
    if [ -n "$install_url" ]; then
      log_error "Install: $install_url"
    fi
    exit 1
  fi
}

# Validate directory exists
require_directory() {
  local dir="$1"

  if [ ! -d "$dir" ]; then
    log_error "Directory not found: $dir"
    exit 1
  fi
}

# Validate file exists
require_file() {
  local file="$1"

  if [ ! -f "$file" ]; then
    log_error "File not found: $file"
    exit 1
  fi
}

# Get script directory (for sourcing other files)
get_script_dir() {
  cd "$(dirname "${BASH_SOURCE[0]}")" && pwd
}

# Check if running in CI environment
is_ci() {
  [ -n "${CI:-}" ] || [ -n "${GITHUB_ACTIONS:-}" ]
}