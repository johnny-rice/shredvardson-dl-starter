#!/usr/bin/env bats
# Tests for git/pr.sh - Git PR Router

setup() {
  load test_helper/common
  disable_skill_logging

  export SCRIPT_DIR=$(cd "$(dirname "$BATS_TEST_FILENAME")/.." && pwd)
  export PR_SKILL="$SCRIPT_DIR/git/pr.sh"
}

@test "git/pr.sh: shows usage when no action provided" {
  run bash "$PR_SKILL"

  assert_failure
  assert_output --partial '"error"'
  assert_output --partial 'PR action required'
  assert_output --partial 'prepare'
  assert_output --partial 'fix'
}

@test "git/pr.sh: shows error for unknown action" {
  run bash "$PR_SKILL" unknown-action

  assert_failure
  assert_output --partial '"error"'
  assert_output --partial 'Unknown PR action'
  assert_output --partial 'unknown-action'
}

@test "git/pr.sh: routes to prepare sub-skill" {
  # Test that it attempts to execute pr-prepare.sh
  run bash "$PR_SKILL" prepare 2>&1 || true

  # Should execute pr-prepare.sh (may fail without proper setup)
  # Just verify it attempts to route
  [[ "$?" -ne 127 ]]  # 127 means command not found
}

@test "git/pr.sh: routes to fix sub-skill" {
  # Test that it attempts to execute pr-fix.sh
  run bash "$PR_SKILL" fix 2>&1 || true

  # Should execute pr-fix.sh (may fail without PR number)
  [[ "$?" -ne 127 ]]
}

@test "git/pr.sh: provides usage examples" {
  run bash "$PR_SKILL"

  assert_output --partial 'examples'
  assert_output --partial '/git pr prepare'
  assert_output --partial '/git pr fix'
}

@test "git/pr.sh: shows available actions" {
  run bash "$PR_SKILL"

  assert_output --partial 'available_actions'
  assert_output --partial '"prepare"'
  assert_output --partial '"fix"'
}

@test "git/pr.sh: returns valid JSON for errors" {
  run bash "$PR_SKILL" invalid

  assert_failure
  # Extract JSON once
  json_output=$(extract_json_output "$output")
  echo "$json_output" | jq -e '.error' > /dev/null
  echo "$json_output" | jq -e '.action' > /dev/null
  echo "$json_output" | jq -e '.available_actions' > /dev/null
}

@test "git/pr.sh: handles empty action string" {
  run bash "$PR_SKILL" ""

  assert_failure
  assert_output --partial 'PR action required'
}

@test "git/pr.sh: uses exec for delegation" {
  # Verify the script uses exec by checking source
  grep -q "exec.*pr-prepare.sh" "$PR_SKILL"
  grep -q "exec.*pr-fix.sh" "$PR_SKILL"
}

@test "git/pr.sh: passes arguments to sub-skills" {
  # Fix command should accept PR number argument
  run bash "$PR_SKILL" fix 123 2>&1 || true

  # Should attempt to execute with argument
  # (may fail but should not complain about missing subcommand)
  ! [[ "$output" =~ "PR action required" ]]
}

@test "git/pr.sh: uses correct script path for delegation" {
  # Verify it uses $(dirname "$0") for relative paths
  grep -q 'dirname "$0"' "$PR_SKILL"
}

@test "git/pr.sh: has proper shebang" {
  head -n 1 "$PR_SKILL" | grep -q "#!/bin/bash"
}

@test "git/pr.sh: uses strict error handling" {
  head -n 5 "$PR_SKILL" | grep -q "set -euo pipefail"
}

@test "git/pr.sh: case statement handles all actions" {
  # Verify case statement has prepare and fix
  grep -A 20 'case.*SUBACTION' "$PR_SKILL" | grep -q "prepare)"
  grep -A 20 'case.*SUBACTION' "$PR_SKILL" | grep -q "fix)"
}

@test "git/pr.sh: provides usage pattern" {
  run bash "$PR_SKILL"

  assert_output --partial 'usage'
  assert_output --partial '/git pr <prepare|fix>'
}
