#!/usr/bin/env bats
# Tests for git/branch.sh - Git Branch Creation

setup() {
  load test_helper/common
  disable_skill_logging
  setup_test_dir

  export SCRIPT_DIR=$(cd "$(dirname "$BATS_TEST_FILENAME")/.." && pwd)
  export BRANCH_SKILL="$SCRIPT_DIR/git/branch.sh"

  # Create utils directory with mock skill-logger
  mkdir -p "$TEST_TEMP_DIR/utils"
  cat > "$TEST_TEMP_DIR/utils/skill-logger.sh" << 'EOF'
#!/bin/bash
setup_skill_logging() { :; }
log_skill_invocation() { :; }
export -f setup_skill_logging log_skill_invocation
EOF
}

teardown() {
  teardown_test_dir
}

@test "git/branch.sh: fails without issue argument" {
  run bash "$BRANCH_SKILL"

  assert_failure
  assert_output --partial '"error"'
  assert_output --partial 'Issue required'
  assert_output --partial 'usage'
}

@test "git/branch.sh: creates branch from Issue #123 format" {
  run bash "$BRANCH_SKILL" "Issue #123: Add login feature"

  assert_success
  assert_output --partial '"status": "success"'
  assert_output --partial 'feature/123-add-login-feature'
  assert_output --partial '"issue": "123"'

  # Verify branch was created
  git branch | grep -q "feature/123-add-login-feature"
}

@test "git/branch.sh: creates branch from #123 format" {
  run bash "$BRANCH_SKILL" "#456: Update homepage"

  assert_success
  assert_output --partial 'feature/456-update-homepage'
  git branch | grep -q "feature/456-update-homepage"
}

@test "git/branch.sh: creates branch from number and title" {
  run bash "$BRANCH_SKILL" "789 Fix broken link"

  assert_success
  assert_output --partial 'feature/789-fix-broken-link'
}

@test "git/branch.sh: handles case-insensitive 'Issue' keyword" {
  run bash "$BRANCH_SKILL" "issue #111: Test Feature"

  assert_success
  assert_output --partial 'feature/111-test-feature'
}

@test "git/branch.sh: sanitizes branch name (removes special chars)" {
  run bash "$BRANCH_SKILL" "Issue #222: Add [special] characters! & symbols?"

  assert_success
  # Should remove special characters
  assert_output --partial 'feature/222-add-special-characters-symbols'
}

@test "git/branch.sh: converts title to lowercase slug" {
  run bash "$BRANCH_SKILL" "#333: UPPERCASE TITLE"

  assert_success
  assert_output --partial 'feature/333-uppercase-title'
}

@test "git/branch.sh: fails with invalid format" {
  run bash "$BRANCH_SKILL" "invalid-format"

  assert_failure
  assert_output --partial '"error"'
  assert_output --partial 'Invalid issue format'
}

@test "git/branch.sh: fails when title is empty" {
  run bash "$BRANCH_SKILL" "Issue #444:"

  assert_failure
  assert_output --partial '"error"'
  assert_output --partial 'Issue title required'
}

@test "git/branch.sh: fails when title is only whitespace" {
  run bash "$BRANCH_SKILL" "Issue #555:    "

  assert_failure
  assert_output --partial 'Issue title required'
}

@test "git/branch.sh: fails if branch already exists" {
  # Create branch first
  git switch -c "feature/999-existing-branch"
  git switch main

  run bash "$BRANCH_SKILL" "Issue #999: Existing Branch"

  assert_failure
  assert_output --partial '"error"'
  assert_output --partial 'Branch already exists'
  assert_output --partial 'feature/999-existing-branch'
}

@test "git/branch.sh: fails with uncommitted changes" {
  # Create uncommitted changes
  echo "modified" >> README.md

  run bash "$BRANCH_SKILL" "Issue #777: New Feature"

  assert_failure
  assert_output --partial '"error"'
  assert_output --partial 'Uncommitted changes'
  assert_output --partial 'Commit or stash'
}

@test "git/branch.sh: provides next steps after success" {
  run bash "$BRANCH_SKILL" "Issue #888: Another Feature"

  assert_success
  assert_output --partial 'next_steps'
  assert_output --partial '/git commit'
  assert_output --partial '/git pr prepare'
}

@test "git/branch.sh: returns valid JSON on success" {
  run bash "$BRANCH_SKILL" "Issue #100: Valid Feature"

  assert_success

  # Validate JSON structure (extract once)
  json_output=$(extract_json_output "$output")
  echo "$json_output" | jq -e '.status' > /dev/null
  echo "$json_output" | jq -e '.branch' > /dev/null
  echo "$json_output" | jq -e '.issue' > /dev/null
  echo "$json_output" | jq -e '.next_steps' > /dev/null
}

@test "git/branch.sh: returns valid JSON on error" {
  run bash "$BRANCH_SKILL" "invalid"

  assert_failure
  json_output=$(extract_json_output "$output")
  echo "$json_output" | jq -e '.error' > /dev/null
}

@test "git/branch.sh: handles multiple spaces in title" {
  run bash "$BRANCH_SKILL" "Issue #200:  Multiple    Spaces   Here"

  assert_success
  # Should collapse multiple spaces
  assert_output --partial 'feature/200-multiple-spaces-here'
}

@test "git/branch.sh: handles hyphens in title" {
  run bash "$BRANCH_SKILL" "Issue #300: Add auto-complete feature"

  assert_success
  assert_output --partial 'feature/300-add-auto-complete-feature'
}

@test "git/branch.sh: provides helpful examples" {
  run bash "$BRANCH_SKILL"

  assert_output --partial 'examples'
  assert_output --partial 'Issue #123: Add feature'
}

@test "git/branch.sh: switches to newly created branch" {
  bash "$BRANCH_SKILL" "Issue #500: Switch Test" > /dev/null

  # Verify we're on the new branch
  current_branch=$(git branch --show-current)
  [[ "$current_branch" == "feature/500-switch-test" ]]
}

@test "git/branch.sh: uses strict error handling" {
  head -n 5 "$BRANCH_SKILL" | grep -q "set -euo pipefail"
}
