#!/usr/bin/env bats
# Tests for git/commit.sh - Git Commit Creation

setup() {
  load test_helper/common
  disable_skill_logging
  setup_test_dir

  export SCRIPT_DIR=$(cd "$(dirname "$BATS_TEST_FILENAME")/.." && pwd)
  export COMMIT_SKILL="$SCRIPT_DIR/git/commit.sh"

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

@test "git/commit.sh: fails when no staged changes" {
  run bash "$COMMIT_SKILL"

  assert_failure
  assert_output --partial '"error"'
  assert_output --partial 'No staged changes'
  assert_output --partial 'git add'
}

@test "git/commit.sh: shows unstaged files when present" {
  echo "new content" > test.txt

  run bash "$COMMIT_SKILL"

  assert_failure
  assert_output --partial 'No staged changes'
  assert_output --partial 'unstaged_files'
}

@test "git/commit.sh: creates commit with valid conventional format" {
  echo "feature" > feature.txt
  git add feature.txt

  run bash "$COMMIT_SKILL" "feat: add new feature"

  assert_success
  assert_output --partial '"status": "success"'
  assert_output --partial 'Commit created'
  assert_output --partial 'feat: add new feature'

  # Verify commit was created
  git log -1 --pretty=%s | grep -q "feat: add new feature"
}

@test "git/commit.sh: accepts feat type" {
  echo "test" > test.txt
  git add test.txt

  run bash "$COMMIT_SKILL" "feat: add feature"

  assert_success
  assert_output --partial 'feat: add feature'
}

@test "git/commit.sh: accepts fix type" {
  echo "test" > test.txt
  git add test.txt

  run bash "$COMMIT_SKILL" "fix: resolve bug"

  assert_success
  assert_output --partial 'fix: resolve bug'
}

@test "git/commit.sh: accepts chore type" {
  echo "test" > test.txt
  git add test.txt

  run bash "$COMMIT_SKILL" "chore: update dependencies"

  assert_success
  assert_output --partial 'chore: update dependencies'
}

@test "git/commit.sh: accepts docs type" {
  echo "test" > test.txt
  git add test.txt

  run bash "$COMMIT_SKILL" "docs: update README"

  assert_success
  assert_output --partial 'docs: update README'
}

@test "git/commit.sh: accepts other conventional types" {
  local types=("refactor" "test" "ci" "build" "perf" "style")

  for type in "${types[@]}"; do
    echo "test-$type" > "test-$type.txt"
    git add "test-$type.txt"

    run bash "$COMMIT_SKILL" "$type: test message"
    assert_success
  done
}

@test "git/commit.sh: accepts scope in conventional format" {
  echo "test" > test.txt
  git add test.txt

  run bash "$COMMIT_SKILL" "feat(auth): add login"

  assert_success
  assert_output --partial 'feat(auth): add login'
}

@test "git/commit.sh: rejects invalid conventional format" {
  echo "test" > test.txt
  git add test.txt

  run bash "$COMMIT_SKILL" "invalid format without colon"

  assert_failure
  assert_output --partial '"error"'
  assert_output --partial 'Invalid conventional commit format'
}

@test "git/commit.sh: rejects unknown type" {
  echo "test" > test.txt
  git add test.txt

  run bash "$COMMIT_SKILL" "unknown: this is wrong"

  assert_failure
  assert_output --partial 'Invalid conventional commit format'
}

@test "git/commit.sh: requires description after colon" {
  echo "test" > test.txt
  git add test.txt

  run bash "$COMMIT_SKILL" "feat:"

  assert_failure
  assert_output --partial 'Invalid conventional commit format'
}

@test "git/commit.sh: requires space after colon" {
  echo "test" > test.txt
  git add test.txt

  run bash "$COMMIT_SKILL" "feat:missing space"

  assert_failure
  assert_output --partial 'Invalid conventional commit format'
}

@test "git/commit.sh: signals LLM when no message provided" {
  echo "test" > test.txt
  git add test.txt

  run bash "$COMMIT_SKILL"

  # Without message, should return needs_message status
  assert_output --partial 'needs_message'
  assert_output --partial 'staged_files'
  assert_output --partial 'child_skills'
}

@test "git/commit.sh: includes diff stats when no message" {
  echo "test content" > test.txt
  git add test.txt

  run bash "$COMMIT_SKILL"

  assert_output --partial 'diff_stat'
  assert_output --partial 'staged_files'
}

@test "git/commit.sh: shows conventional format in error" {
  echo "test" > test.txt
  git add test.txt

  run bash "$COMMIT_SKILL" "bad message"

  assert_failure
  assert_output --partial 'expected'
  assert_output --partial 'type(scope): description'
}

@test "git/commit.sh: provides next steps after successful commit" {
  echo "test" > test.txt
  git add test.txt

  run bash "$COMMIT_SKILL" "feat: test commit"

  assert_success
  assert_output --partial 'next_steps'
  assert_output --partial '/git pr prepare'
  assert_output --partial '/git workflow'
}

@test "git/commit.sh: returns valid JSON on success" {
  echo "test" > test.txt
  git add test.txt

  run bash "$COMMIT_SKILL" "feat: json test"

  assert_success
  # Extract JSON once
  json_output=$(extract_json_output "$output")
  echo "$json_output" | jq -e '.status' > /dev/null
  echo "$json_output" | jq -e '.commit_message' > /dev/null
  echo "$json_output" | jq -e '.next_steps' > /dev/null
}

@test "git/commit.sh: returns valid JSON on error" {
  run bash "$COMMIT_SKILL"

  assert_failure
  json_output=$(extract_json_output "$output")
  echo "$json_output" | jq -e '.error' > /dev/null
}

@test "git/commit.sh: handles multi-file commits" {
  echo "file1" > file1.txt
  echo "file2" > file2.txt
  git add file1.txt file2.txt

  run bash "$COMMIT_SKILL" "feat: add multiple files"

  assert_success
  git log -1 --name-only | grep -q "file1.txt"
  git log -1 --name-only | grep -q "file2.txt"
}

@test "git/commit.sh: preserves git commit output on success" {
  echo "test" > test.txt
  git add test.txt

  run bash "$COMMIT_SKILL" "feat: test"
  assert_success

  # Verify the commit exists in history
  git log --oneline | grep -q "feat: test"
}

@test "git/commit.sh: uses strict error handling" {
  head -n 5 "$COMMIT_SKILL" | grep -q "set -euo pipefail"
}
