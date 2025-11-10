#!/bin/bash
# Common test helpers for Skills tests

# Load bats libraries
load "$(dirname "$BATS_TEST_FILENAME")/../../../node_modules/bats-support/load.bash"
load "$(dirname "$BATS_TEST_FILENAME")/../../../node_modules/bats-assert/load.bash"

# Test directory setup
setup_test_dir() {
  export TEST_TEMP_DIR=$(mktemp -d)
  export ORIGINAL_PWD=$(pwd)
  cd "$TEST_TEMP_DIR"

  # Initialize a fake git repo
  git init --quiet
  git config user.email "test@example.com"
  git config user.name "Test User"

  # Disable commit signing for tests
  git config commit.gpgsign false
  git config tag.gpgsign false

  # Create initial commit
  echo "test" > README.md
  git add README.md
  git commit --quiet -m "Initial commit"
  git branch -M main
}

# Cleanup test directory
teardown_test_dir() {
  cd "$ORIGINAL_PWD"
  rm -rf "$TEST_TEMP_DIR"
}

# Mock git command
mock_git() {
  local action=$1
  shift

  case "$action" in
    branch)
      git() {
        if [[ "$1" == "--show-current" ]]; then
          echo "main"
        elif [[ "$1" == "branch" ]]; then
          echo "main"
        else
          command git "$@"
        fi
      }
      ;;
    clean)
      git() {
        if [[ "$1" == "diff-index" ]]; then
          return 0
        elif [[ "$1" == "diff" ]]; then
          return 0
        else
          command git "$@"
        fi
      }
      ;;
    dirty)
      git() {
        if [[ "$1" == "diff-index" ]] || [[ "$1" == "diff" ]]; then
          return 1
        else
          command git "$@"
        fi
      }
      ;;
    *)
      echo "Unknown git mock: $action" >&2
      return 1
      ;;
  esac
  export -f git
}

# Mock gh (GitHub CLI) command
mock_gh() {
  local behavior=$1

  case "$behavior" in
    success)
      gh() {
        if [[ "$1" == "pr" && "$2" == "view" ]]; then
          echo '{"number": 123, "state": "OPEN"}'
        elif [[ "$1" == "pr" && "$2" == "create" ]]; then
          echo "https://github.com/test/repo/pull/123"
        elif [[ "$1" == "repo" && "$2" == "view" ]]; then
          echo "true"
        else
          echo "Mock gh command"
        fi
        return 0
      }
      ;;
    no_pr)
      gh() {
        return 1
      }
      ;;
    *)
      gh() {
        echo "Mock gh: $*"
        return 0
      }
      ;;
  esac
  export -f gh
}

# Mock pnpm command
mock_pnpm() {
  local behavior=$1

  case "$behavior" in
    success)
      pnpm() {
        echo "Mock pnpm success"
        return 0
      }
      ;;
    failure)
      pnpm() {
        echo "Mock pnpm error" >&2
        return 1
      }
      ;;
    typecheck_fail)
      pnpm() {
        if [[ "$1" == "typecheck" ]]; then
          echo "error TS2304: Cannot find name 'foo'" >&2
          return 1
        else
          return 0
        fi
      }
      ;;
    *)
      pnpm() {
        return 0
      }
      ;;
  esac
  export -f pnpm
}

# Mock jq to prevent actual execution
ensure_jq() {
  if ! command -v jq &> /dev/null; then
    echo "jq is required but not installed" >&2
    return 1
  fi
}

# Disable skill logging for tests
disable_skill_logging() {
  export LOG_FILE=/dev/null

  # Override logging functions to no-op
  setup_skill_logging() {
    :
  }
  log_skill_invocation() {
    :
  }
  export -f setup_skill_logging
  export -f log_skill_invocation
}

# Extract JSON from output (handles multiline JSON)
extract_json_output() {
  # Extract from first line starting with { to last line starting with }
  echo "$1" | awk '/^{/,/^}/'
}

# Parse JSON output
parse_json_field() {
  local json=$1
  local field=$2
  echo "$json" | jq -r ".$field"
}

# Assert JSON output contains field
assert_json_has_field() {
  local json=$1
  local field=$2

  if ! echo "$json" | jq -e ".$field" > /dev/null 2>&1; then
    echo "Expected JSON to have field: $field" >&2
    echo "Actual JSON: $json" >&2
    return 1
  fi
}

# Assert exit code
assert_exit_code() {
  local expected=$1
  local actual=$2

  if [[ "$expected" -ne "$actual" ]]; then
    echo "Expected exit code $expected, got $actual" >&2
    return 1
  fi
}
