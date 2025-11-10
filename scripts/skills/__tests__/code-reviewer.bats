#!/usr/bin/env bats
# Tests for code-reviewer.sh - Code Quality Checks

setup() {
  load test_helper/common
  disable_skill_logging
  setup_test_dir

  export SCRIPT_DIR=$(cd "$(dirname "$BATS_TEST_FILENAME")/.." && pwd)
  export REVIEWER_SKILL="$SCRIPT_DIR/code-reviewer.sh"

  # Create utils directory with mock skill-logger
  mkdir -p "$TEST_TEMP_DIR/utils"
  cat > "$TEST_TEMP_DIR/utils/skill-logger.sh" << 'EOF'
#!/bin/bash
setup_skill_logging() { :; }
log_skill_invocation() { :; }
export -f setup_skill_logging log_skill_invocation
EOF

  # Mock pnpm by default to succeed
  pnpm() {
    case "$1" in
      typecheck|lint|test:ci-scripts|build)
        return 0
        ;;
      test:coverage)
        echo "Coverage: 75.5%"
        return 0
        ;;
      *)
        return 0
        ;;
    esac
  }
  export -f pnpm
}

teardown() {
  teardown_test_dir
}

@test "code-reviewer.sh: runs all quality checks" {
  run bash "$REVIEWER_SKILL"

  assert_success
  assert_output --partial '"status": "success"'
  assert_output --partial 'checks'
}

@test "code-reviewer.sh: checks TypeScript" {
  run bash "$REVIEWER_SKILL"

  assert_success
  assert_output --partial 'TypeScript'
}

@test "code-reviewer.sh: checks ESLint" {
  run bash "$REVIEWER_SKILL"

  assert_success
  assert_output --partial 'ESLint'
}

@test "code-reviewer.sh: checks tests" {
  run bash "$REVIEWER_SKILL"

  assert_success
  assert_output --partial 'Tests'
}

@test "code-reviewer.sh: checks build" {
  run bash "$REVIEWER_SKILL"

  assert_success
  assert_output --partial 'Build'
}

@test "code-reviewer.sh: checks coverage when tests pass" {
  run bash "$REVIEWER_SKILL"

  assert_success
  assert_output --partial 'Coverage'
}

@test "code-reviewer.sh: fails on TypeScript errors" {
  pnpm() {
    if [[ "$1" == "typecheck" ]]; then
      echo "error TS2304: Cannot find name 'foo'" >&2
      echo "error TS2345: Type error" >&2
      return 1
    fi
    return 0
  }
  export -f pnpm

  run bash "$REVIEWER_SKILL"

  assert_failure
  assert_output --partial '"status": "error"'
  assert_output --partial 'TypeScript'
  assert_output --partial 'blocking_issues'
}

@test "code-reviewer.sh: counts TypeScript errors" {
  pnpm() {
    if [[ "$1" == "typecheck" ]]; then
      echo "error TS2304: Error 1" >&2
      echo "error TS2345: Error 2" >&2
      echo "error TS9999: Error 3" >&2
      return 1
    fi
    return 0
  }
  export -f pnpm

  run bash "$REVIEWER_SKILL"

  assert_failure
  assert_output --partial '3'
}

@test "code-reviewer.sh: handles lint failures" {
  pnpm() {
    if [[ "$1" == "lint" ]]; then
      return 1
    fi
    return 0
  }
  export -f pnpm

  run bash "$REVIEWER_SKILL"

  # Lint failures are warnings, not blocking
  assert_output --partial 'ESLint'
  assert_output --partial 'warnings'
}

@test "code-reviewer.sh: auto-fixes lint with --fix flag" {
  pnpm() {
    if [[ "$1" == "lint" ]]; then
      return 1
    elif [[ "$1" == "lint:fix" ]]; then
      return 0
    fi
    return 0
  }
  export -f pnpm

  run bash "$REVIEWER_SKILL" --fix

  assert_success
  assert_output --partial 'Auto-fixed'
}

@test "code-reviewer.sh: handles failing tests" {
  pnpm() {
    if [[ "$1" == "test:ci-scripts" ]]; then
      return 1
    fi
    return 0
  }
  export -f pnpm

  run bash "$REVIEWER_SKILL"

  assert_failure
  assert_output --partial 'Tests'
  assert_output --partial 'fail'
  assert_output --partial 'blocking_issues'
}

@test "code-reviewer.sh: handles build failures" {
  pnpm() {
    if [[ "$1" == "build" ]]; then
      return 1
    fi
    return 0
  }
  export -f pnpm

  run bash "$REVIEWER_SKILL"

  assert_failure
  assert_output --partial 'Build'
  assert_output --partial 'fail'
}

@test "code-reviewer.sh: warns on low coverage" {
  pnpm() {
    if [[ "$1" == "test:coverage" ]]; then
      echo "Coverage: 55.5%"
      return 0
    fi
    return 0
  }
  export -f pnpm

  run bash "$REVIEWER_SKILL"

  # Low coverage is a warning, not an error
  assert_success
  assert_output --partial 'Coverage'
  assert_output --partial '55.5%'
  assert_output --partial 'warnings'
}

@test "code-reviewer.sh: passes on sufficient coverage" {
  pnpm() {
    if [[ "$1" == "test:coverage" ]]; then
      echo "Coverage: 85.0%"
      return 0
    fi
    return 0
  }
  export -f pnpm

  run bash "$REVIEWER_SKILL"

  assert_success
  assert_output --partial 'Coverage'
  assert_output --partial '85'
  assert_output --partial 'pass'
}

@test "code-reviewer.sh: skips coverage if tests fail" {
  pnpm() {
    if [[ "$1" == "test:ci-scripts" ]]; then
      return 1
    fi
    return 0
  }
  export -f pnpm

  run bash "$REVIEWER_SKILL"

  assert_failure
  # Should not run coverage check when tests fail
  ! [[ "$output" =~ "Coverage:" ]] || [[ "$output" =~ "running coverage" ]]
}

@test "code-reviewer.sh: provides next steps on success" {
  run bash "$REVIEWER_SKILL"

  assert_success
  assert_output --partial 'next_steps'
  assert_output --partial '/git pr prepare'
}

@test "code-reviewer.sh: provides next steps on error" {
  pnpm() {
    if [[ "$1" == "typecheck" ]]; then
      return 1
    fi
    return 0
  }
  export -f pnpm

  run bash "$REVIEWER_SKILL"

  assert_failure
  assert_output --partial 'next_steps'
  assert_output --partial 'Fix blocking issues'
}

@test "code-reviewer.sh: returns valid JSON on success" {
  run bash "$REVIEWER_SKILL"

  assert_success
  # Extract JSON from output (skills may print progress messages)
  json_output=$(extract_json_output "$output")
  echo "$json_output" | jq -e '.status' > /dev/null
  echo "$json_output" | jq -e '.checks' > /dev/null
  echo "$json_output" | jq -e '.next_steps' > /dev/null
}

@test "code-reviewer.sh: returns valid JSON on failure" {
  pnpm() {
    if [[ "$1" == "typecheck" ]]; then
      return 1
    fi
    return 0
  }
  export -f pnpm

  run bash "$REVIEWER_SKILL"

  assert_failure
  # Extract JSON from output
  json_output=$(extract_json_output "$output")
  echo "$json_output" | jq -e '.status' > /dev/null
  echo "$json_output" | jq -e '.checks' > /dev/null
  echo "$json_output" | jq -e '.blocking_issues' > /dev/null
}

@test "code-reviewer.sh: includes recommendations" {
  run bash "$REVIEWER_SKILL"

  # Should include recommendations array
  json_output=$(extract_json_output "$output")
  echo "$json_output" | jq -e '.recommendations | type == "array"' > /dev/null
}

@test "code-reviewer.sh: handles multiple failures" {
  pnpm() {
    case "$1" in
      typecheck|test:ci-scripts|build)
        return 1
        ;;
      *)
        return 0
        ;;
    esac
  }
  export -f pnpm

  run bash "$REVIEWER_SKILL"

  assert_failure
  assert_output --partial 'TypeScript'
  assert_output --partial 'Tests'
  assert_output --partial 'Build'
}

@test "code-reviewer.sh: uses strict error handling" {
  head -n 5 "$REVIEWER_SKILL" | grep -q "set -euo pipefail"
}
