#!/usr/bin/env bats
# Tests for git/tag.sh - Git Tag Creation

setup() {
  load test_helper/common
  disable_skill_logging
  setup_test_dir

  export SCRIPT_DIR=$(cd "$(dirname "$BATS_TEST_FILENAME")/.." && pwd)
  export TAG_SKILL="$SCRIPT_DIR/git/tag.sh"

  # Ensure we're on main for tagging
  git switch main 2>/dev/null || git checkout main
}

teardown() {
  teardown_test_dir
}

@test "git/tag.sh: requires version argument and shows usage" {
  run bash "$TAG_SKILL"

  assert_failure
  assert_output --partial 'error'
  assert_output --partial 'Version required'
  assert_output --partial 'usage'
  assert_output --partial '/git tag'
}

@test "git/tag.sh: rejects invalid semver format" {
  run bash "$TAG_SKILL" "invalid"

  assert_failure
  assert_output --partial 'error'
  assert_output --partial 'Invalid semver'
}

@test "git/tag.sh: rejects non-numeric version" {
  run bash "$TAG_SKILL" "v1.2.x"

  assert_failure
  assert_output --partial 'error'
  assert_output --partial 'Invalid semver'
}

@test "git/tag.sh: returns valid JSON for errors" {
  run bash "$TAG_SKILL"

  assert_failure
  json_output=$(extract_json_output "$output")
  # Validate Skill contract: must have error field
  echo "$json_output" | jq -e '.error' > /dev/null
  # Verify it's a valid string
  echo "$json_output" | jq -e '.error | type == "string"' > /dev/null
  # Verify error message is non-empty
  echo "$json_output" | jq -e '.error | length > 0' > /dev/null
}

@test "git/tag.sh: accepts version with v prefix" {
  run bash "$TAG_SKILL" "v1.0.0"

  # Format validation should pass (if it fails, must be for other reasons)
  # The skill will proceed to status=needs_changelog (success) or other validation errors
  refute_output --partial 'Invalid semver'
}

@test "git/tag.sh: accepts version without v prefix and normalizes it" {
  run bash "$TAG_SKILL" "1.0.0"

  # Format validation should pass and normalize to v1.0.0
  refute_output --partial 'Invalid semver'
  # Should have normalized version to include v in any output
  assert_output --partial 'v1.0.0'
}

@test "git/tag.sh: has correct permissions" {
  [ -x "$TAG_SKILL" ]
}

@test "git/tag.sh: uses strict error handling" {
  head -5 "$TAG_SKILL" | grep -q "set -euo pipefail"
}

@test "git/tag.sh: has proper shebang" {
  head -1 "$TAG_SKILL" | grep -q "#!/bin/bash"
}
