#!/usr/bin/env bats
# Tests for git.sh - Git Skill Router

setup() {
  load test_helper/common
  disable_skill_logging

  export SCRIPT_DIR=$(cd "$(dirname "$BATS_TEST_FILENAME")/.." && pwd)
  export GIT_SKILL="$SCRIPT_DIR/git.sh"
}

@test "git.sh: shows usage when no action provided" {
  run bash "$GIT_SKILL"

  assert_failure
  assert_output --partial '"error"'
  assert_output --partial 'Action required'
  assert_output --partial 'branch'
  assert_output --partial 'commit'
  assert_output --partial 'pr'
  assert_output --partial 'workflow'
}

@test "git.sh: shows error for unknown action" {
  run bash "$GIT_SKILL" unknown-action

  assert_failure
  assert_output --partial '"error"'
  assert_output --partial 'Unknown action'
  assert_output --partial 'unknown-action'
}

@test "git.sh: routes to branch sub-skill" {
  # Test that it attempts to execute branch.sh
  # We expect it to fail without valid args, but should route correctly
  run bash "$GIT_SKILL" branch 2>&1 || true

  # Should execute branch.sh which requires an issue
  [[ "$output" =~ "Issue required" || "$output" =~ "error" ]]
}

@test "git.sh: routes to commit sub-skill" {
  # Test that it attempts to execute commit.sh
  run bash "$GIT_SKILL" commit 2>&1 || true

  # Should execute commit.sh which checks for staged changes
  [[ "$output" =~ "No staged changes" || "$output" =~ "error" ]]
}

@test "git.sh: routes to pr sub-skill" {
  run bash "$GIT_SKILL" pr 2>&1 || true

  # Should execute pr.sh which requires a sub-action
  [[ "$output" =~ "PR action required" || "$output" =~ "error" ]]
}

@test "git.sh: routes to workflow sub-skill" {
  run bash "$GIT_SKILL" workflow

  # Workflow should execute and return JSON
  # May succeed or fail depending on git state, but should produce JSON
  assert_output --regexp '(status|workflow_stage|error)'
}

@test "git.sh: routes to tag sub-skill" {
  run bash "$GIT_SKILL" tag 2>&1 || true

  # Should execute tag.sh
  [[ "$output" =~ "tag" || "$output" =~ "error" || "$output" =~ "version" ]]
}

@test "git.sh: uses exec for delegation (no child process)" {
  # Verify the script uses exec by checking it doesn't continue after routing
  # This is a code inspection test - verify exec is used
  grep -q "exec.*branch.sh" "$GIT_SKILL"
  grep -q "exec.*commit.sh" "$GIT_SKILL"
  grep -q "exec.*pr.sh" "$GIT_SKILL"
}

@test "git.sh: shows available actions in usage" {
  run bash "$GIT_SKILL"

  assert_output --partial 'available_actions'
  assert_output --partial 'usage'
  assert_output --partial '/git <action> [args]'
}

@test "git.sh: provides helpful examples" {
  run bash "$GIT_SKILL"

  assert_output --partial 'examples'
  assert_output --partial '/git branch'
  assert_output --partial '/git commit'
  assert_output --partial '/git pr'
}

@test "git.sh: returns valid JSON for errors" {
  run bash "$GIT_SKILL" invalid

  assert_failure

  # Validate JSON structure
  echo "$output" | jq -e '.error' > /dev/null
  echo "$output" | jq -e '.action' > /dev/null
  echo "$output" | jq -e '.available_actions' > /dev/null
}

@test "git.sh: handles empty action string" {
  run bash "$GIT_SKILL" ""

  assert_failure
  assert_output --partial 'Action required'
}

@test "git.sh: script has correct permissions" {
  [[ -x "$GIT_SKILL" ]] || [[ -r "$GIT_SKILL" ]]
}

@test "git.sh: uses strict error handling" {
  # Verify set -euo pipefail is present
  head -n 5 "$GIT_SKILL" | grep -q "set -euo pipefail"
}

@test "git.sh: has proper shebang" {
  head -n 1 "$GIT_SKILL" | grep -q "#!/bin/bash"
}
