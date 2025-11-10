#!/usr/bin/env bats
# Tests for git/pr-prepare.sh - PR Preparation and Creation

setup() {
  load test_helper/common
  disable_skill_logging
  setup_test_dir

  export SCRIPT_DIR=$(cd "$(dirname "$BATS_TEST_FILENAME")/.." && pwd)
  export PR_PREPARE_SKILL="$SCRIPT_DIR/git/pr-prepare.sh"

  # Mock gh command
  gh() {
    return 1  # Default: no PR exists
  }
  export -f gh
}

teardown() {
  teardown_test_dir
}

@test "git/pr-prepare.sh: rejects when on main branch" {
  git switch main 2>/dev/null || git checkout main

  run bash "$PR_PREPARE_SKILL"

  assert_failure
  assert_output --partial 'error'
  assert_output --partial 'main'
}

@test "git/pr-prepare.sh: rejects detached HEAD" {
  # Create detached HEAD state
  git checkout --detach HEAD 2>/dev/null

  run bash "$PR_PREPARE_SKILL"

  assert_failure
  assert_output --partial 'error'
  assert_output --partial 'detached'
}

@test "git/pr-prepare.sh: returns valid JSON on error" {
  git switch main 2>/dev/null || git checkout main

  run bash "$PR_PREPARE_SKILL"

  assert_failure
  json_output=$(extract_json_output "$output")
  # Validate Skill contract: must have status and error fields
  echo "$json_output" | jq -e '.status == "error"' > /dev/null
  echo "$json_output" | jq -e '.error | type == "string"' > /dev/null
  echo "$json_output" | jq -e '.error | length > 0' > /dev/null
  # Should have suggestion field for actionable errors
  echo "$json_output" | jq -e '.suggestion | type == "string"' > /dev/null
  echo "$json_output" | jq -e '.suggestion | length > 0' > /dev/null
}

@test "git/pr-prepare.sh: succeeds on feature branch with commits" {
  # Set up a fake remote origin and push main
  REMOTE_DIR=$(mktemp -d)
  trap "rm -rf '$REMOTE_DIR'" RETURN
  git init --bare "$REMOTE_DIR" --quiet
  git remote add origin "$REMOTE_DIR"
  git push origin main --quiet

  # Create and switch to feature branch
  git switch -c feature/123-test-pr 2>/dev/null || git checkout -b feature/123-test-pr

  # Make a commit
  echo "test" > test-file.txt
  git add test-file.txt
  git commit -m "feat: test commit" --quiet

  run bash "$PR_PREPARE_SKILL"

  # Should succeed and request PR body generation
  assert_success
  json_output=$(extract_json_output "$output")
  echo "$json_output" | jq -e '.status == "needs_pr_body"' > /dev/null
  echo "$json_output" | jq -e '.branch == "feature/123-test-pr"' > /dev/null
  echo "$json_output" | jq -e '.issue == "123"' > /dev/null
}

@test "git/pr-prepare.sh: extracts issue number from branch name" {
  # Set up a fake remote origin and push main
  REMOTE_DIR=$(mktemp -d)
  trap "rm -rf '$REMOTE_DIR'" RETURN
  git init --bare "$REMOTE_DIR" --quiet
  git remote add origin "$REMOTE_DIR"
  git push origin main --quiet

  # Create feature branch with issue number
  git switch -c feature/456-add-feature 2>/dev/null || git checkout -b feature/456-add-feature

  # Make a commit
  echo "test" > test-file.txt
  git add test-file.txt
  git commit -m "feat: add feature" --quiet

  run bash "$PR_PREPARE_SKILL"

  assert_success
  json_output=$(extract_json_output "$output")
  # Should extract issue number 456
  echo "$json_output" | jq -e '.issue == "456"' > /dev/null
}

@test "git/pr-prepare.sh: handles branch without issue number" {
  # Set up a fake remote origin and push main
  REMOTE_DIR=$(mktemp -d)
  trap "rm -rf '$REMOTE_DIR'" RETURN
  git init --bare "$REMOTE_DIR" --quiet
  git remote add origin "$REMOTE_DIR"
  git push origin main --quiet

  # Create feature branch without issue number
  git switch -c feature-branch 2>/dev/null || git checkout -b feature-branch

  # Make a commit
  echo "test" > test-file.txt
  git add test-file.txt
  git commit -m "feat: test commit" --quiet

  run bash "$PR_PREPARE_SKILL"

  assert_success
  json_output=$(extract_json_output "$output")
  # Issue should be null when no number in branch name
  echo "$json_output" | jq -e '.issue == null' > /dev/null
}

@test "git/pr-prepare.sh: includes commit history in response" {
  # Set up a fake remote origin
  REMOTE_DIR=$(mktemp -d)
  trap "rm -rf '$REMOTE_DIR'" RETURN
  git init --bare "$REMOTE_DIR" --quiet
  git remote add origin "$REMOTE_DIR"
  git push origin main --quiet

  # Create feature branch
  git switch -c feature/789-commits 2>/dev/null || git checkout -b feature/789-commits

  # Make multiple commits
  echo "test1" > file1.txt
  git add file1.txt
  git commit -m "feat: first change" --quiet

  echo "test2" > file2.txt
  git add file2.txt
  git commit -m "fix: second change" --quiet

  run bash "$PR_PREPARE_SKILL"

  assert_success
  json_output=$(extract_json_output "$output")
  # Should have commits array with entries
  echo "$json_output" | jq -e '.commits | type == "array"' > /dev/null
  echo "$json_output" | jq -e '.commits | length > 0' > /dev/null
}

@test "git/pr-prepare.sh: includes files changed in response" {
  # Set up a fake remote origin
  REMOTE_DIR=$(mktemp -d)
  trap "rm -rf '$REMOTE_DIR'" RETURN
  git init --bare "$REMOTE_DIR" --quiet
  git remote add origin "$REMOTE_DIR"
  git push origin main --quiet

  # Create feature branch
  git switch -c feature/999-files 2>/dev/null || git checkout -b feature/999-files

  # Make a commit with files
  echo "test" > changed-file.txt
  git add changed-file.txt
  git commit -m "feat: change files" --quiet

  run bash "$PR_PREPARE_SKILL"

  assert_success
  json_output=$(extract_json_output "$output")
  # Should have files_changed array
  echo "$json_output" | jq -e '.files_changed | type == "array"' > /dev/null
  echo "$json_output" | jq -e '.files_changed | length > 0' > /dev/null
}

@test "git/pr-prepare.sh: provides child skills for LLM" {
  # Set up a fake remote origin and push main
  REMOTE_DIR=$(mktemp -d)
  trap "rm -rf '$REMOTE_DIR'" RETURN
  git init --bare "$REMOTE_DIR" --quiet
  git remote add origin "$REMOTE_DIR"
  git push origin main --quiet

  # Create feature branch
  git switch -c feature/111-llm 2>/dev/null || git checkout -b feature/111-llm

  # Make a commit
  echo "test" > test-file.txt
  git add test-file.txt
  git commit -m "feat: test" --quiet

  run bash "$PR_PREPARE_SKILL"

  assert_success
  json_output=$(extract_json_output "$output")
  # Should have child_skills array with generate-pr-body
  echo "$json_output" | jq -e '.child_skills | type == "array"' > /dev/null
  echo "$json_output" | jq -e '.child_skills | length > 0' > /dev/null
  echo "$json_output" | jq -e '.child_skills[0].name == "generate-pr-body"' > /dev/null
  echo "$json_output" | jq -e '.child_skills[0].requires_llm == true' > /dev/null
}

@test "git/pr-prepare.sh: rejects staged uncommitted changes" {
  # Create feature branch
  git switch -c feature/222-dirty 2>/dev/null || git checkout -b feature/222-dirty

  # Make a commit first
  echo "committed" > committed.txt
  git add committed.txt
  git commit -m "feat: initial commit" --quiet

  # Create staged but uncommitted changes
  echo "uncommitted" > uncommitted.txt
  git add uncommitted.txt

  run bash "$PR_PREPARE_SKILL"

  assert_failure
  assert_output --partial 'error'
  assert_output --partial 'Uncommitted changes'
}

@test "git/pr-prepare.sh: rejects unstaged changes" {
  # Create feature branch
  git switch -c feature/333-unstaged 2>/dev/null || git checkout -b feature/333-unstaged

  # Make a commit first
  echo "committed" > committed.txt
  git add committed.txt
  git commit -m "feat: initial commit" --quiet

  # Create unstaged changes (modify without git add)
  echo "modified" > committed.txt

  run bash "$PR_PREPARE_SKILL"

  assert_failure
  assert_output --partial 'error'
  assert_output --partial 'Uncommitted changes'
}

@test "git/pr-prepare.sh: handles already pushed branch" {
  # Set up a fake remote origin and push main
  REMOTE_DIR=$(mktemp -d)
  trap "rm -rf '$REMOTE_DIR'" RETURN
  git init --bare "$REMOTE_DIR" --quiet
  git remote add origin "$REMOTE_DIR"
  git push origin main --quiet

  # Create feature branch
  git switch -c feature/333-pushed 2>/dev/null || git checkout -b feature/333-pushed

  # Make a commit
  echo "test" > test-file.txt
  git add test-file.txt
  git commit -m "feat: test" --quiet

  # Push the branch first
  git push -u origin feature/333-pushed --quiet

  run bash "$PR_PREPARE_SKILL"

  # Should succeed without trying to push again
  assert_success
  json_output=$(extract_json_output "$output")
  echo "$json_output" | jq -e '.status == "needs_pr_body"' > /dev/null
}

@test "git/pr-prepare.sh: has correct permissions" {
  [ -x "$PR_PREPARE_SKILL" ]
}

@test "git/pr-prepare.sh: uses strict error handling" {
  head -5 "$PR_PREPARE_SKILL" | grep -q "set -euo pipefail"
}

@test "git/pr-prepare.sh: has proper shebang" {
  head -1 "$PR_PREPARE_SKILL" | grep -q "#!/bin/bash"
}
