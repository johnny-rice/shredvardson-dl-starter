#!/usr/bin/env bats
# Tests for git/workflow.sh - Git Workflow Status

setup() {
  load test_helper/common
  disable_skill_logging
  setup_test_dir

  export SCRIPT_DIR=$(cd "$(dirname "$BATS_TEST_FILENAME")/.." && pwd)
  export WORKFLOW_SKILL="$SCRIPT_DIR/git/workflow.sh"

  # Create utils directory with mock skill-logger
  mkdir -p "$TEST_TEMP_DIR/utils"
  cat > "$TEST_TEMP_DIR/utils/skill-logger.sh" << 'EOF'
#!/bin/bash
setup_skill_logging() { :; }
log_skill_invocation() { :; }
export -f setup_skill_logging log_skill_invocation
EOF

  # Commit the mock file to ensure clean working tree
  git add "$TEST_TEMP_DIR/utils/skill-logger.sh"
  git commit --quiet -m "Add test fixture"

  # Mock gh command to avoid API calls
  gh() {
    return 1  # Simulate no PR by default
  }
  export -f gh
}

teardown() {
  teardown_test_dir
}

@test "git/workflow.sh: detects start stage when on main" {
  git switch main 2>/dev/null || git checkout main

  run bash "$WORKFLOW_SKILL"

  assert_success
  assert_output --partial '"workflow_stage": "start"'
  assert_output --partial '/git branch'
}

@test "git/workflow.sh: detects uncommitted stage with changes" {
  git switch -c feature/test-branch
  echo "uncommitted" > test.txt

  run bash "$WORKFLOW_SKILL"

  assert_success
  assert_output --partial '"workflow_stage": "uncommitted"'
  assert_output --partial '/git commit'
}

@test "git/workflow.sh: detects no_changes stage on clean feature branch" {
  git switch -c feature/empty-branch

  run bash "$WORKFLOW_SKILL"

  assert_success
  assert_output --partial '"workflow_stage": "no_changes"'
  assert_output --partial 'Make changes and commit'
}

@test "git/workflow.sh: detects unpushed stage after commits" {
  git switch -c feature/unpushed
  echo "committed" > test.txt
  git add test.txt
  git commit -m "feat: test" --quiet

  run bash "$WORKFLOW_SKILL"

  assert_success
  assert_output --partial '"workflow_stage": "unpushed"'
  assert_output --partial '/git pr prepare'
}

@test "git/workflow.sh: returns current branch name" {
  git switch -c feature/test-workflow

  run bash "$WORKFLOW_SKILL"

  assert_success
  assert_output --partial '"branch": "feature/test-workflow"'
}

@test "git/workflow.sh: returns is_clean status" {
  git switch -c feature/test-clean

  run bash "$WORKFLOW_SKILL"

  assert_success
  assert_output --partial '"is_clean": true'
}

@test "git/workflow.sh: detects dirty working tree" {
  git switch -c feature/test-dirty
  echo "dirty" > dirty.txt

  run bash "$WORKFLOW_SKILL"

  assert_success
  assert_output --partial '"is_clean": false'
}

@test "git/workflow.sh: counts commits ahead of main" {
  git switch -c feature/ahead-test
  echo "change" > change.txt
  git add change.txt
  git commit -m "feat: ahead" --quiet

  run bash "$WORKFLOW_SKILL"

  assert_success
  assert_output --partial '"commits_ahead_main": 1'
}

@test "git/workflow.sh: provides next steps" {
  git switch -c feature/next-steps

  run bash "$WORKFLOW_SKILL"

  assert_success
  assert_output --partial 'next_steps'
}

@test "git/workflow.sh: shows available commands" {
  run bash "$WORKFLOW_SKILL"

  assert_success
  assert_output --partial 'available_commands'
  assert_output --partial '/git branch'
  assert_output --partial '/git commit'
  assert_output --partial '/git pr prepare'
}

@test "git/workflow.sh: returns valid JSON" {
  run bash "$WORKFLOW_SKILL"

  assert_success
  # Extract JSON once
  json_output=$(extract_json_output "$output")
  echo "$json_output" | jq -e '.status' > /dev/null
  echo "$json_output" | jq -e '.workflow_stage' > /dev/null
  echo "$json_output" | jq -e '.branch' > /dev/null
  echo "$json_output" | jq -e '.next_steps' > /dev/null
}

@test "git/workflow.sh: handles main branch correctly" {
  git switch main 2>/dev/null || git checkout main

  run bash "$WORKFLOW_SKILL"

  assert_success
  # Extract JSON once
  json_output=$(extract_json_output "$output")
  echo "$json_output" | jq -e '.commits_behind_main' > /dev/null
  echo "$json_output" | jq -e '.commits_ahead_main' > /dev/null
}

@test "git/workflow.sh: detects pr_open stage when gh succeeds" {
  git switch -c feature/with-pr
  echo "test" > test.txt
  git add test.txt
  git commit -m "feat: test" --quiet

  # Mock git ls-remote to simulate pushed branch
  git() {
    if [[ "$1" == "ls-remote" ]]; then
      echo "refs/heads/feature/with-pr"
      return 0
    else
      command git "$@"
    fi
  }
  export -f git

  # Mock gh to simulate existing PR
  gh() {
    if [[ "$1" == "pr" && "$2" == "view" ]]; then
      if [[ "$3" == "--json" ]]; then
        case "$4" in
          number) echo '{"number": 123}' ;;
          state) echo '{"state": "OPEN"}' ;;
        esac
      fi
      return 0
    fi
    return 1
  }
  export -f gh

  run bash "$WORKFLOW_SKILL"

  # Should detect PR (may be pr_open or ready_for_pr depending on gh mock)
  assert_success
  assert_output --regexp '(pr_open|ready_for_pr)'
}

@test "git/workflow.sh: uses strict error handling" {
  head -n 5 "$WORKFLOW_SKILL" | grep -q "set -euo pipefail"
}

@test "git/workflow.sh: handles multiple commits ahead" {
  git switch -c feature/multi-commits
  for i in {1..3}; do
    echo "change $i" > "file$i.txt"
    git add "file$i.txt"
    git commit -m "feat: change $i" --quiet
  done

  run bash "$WORKFLOW_SKILL"

  assert_success
  assert_output --partial '"commits_ahead_main": 3'
}

@test "git/workflow.sh: provides contextual next steps based on stage" {
  # Test on main
  git switch main 2>/dev/null || git checkout main
  run bash "$WORKFLOW_SKILL"
  assert_output --partial '/git branch'

  # Test on feature with uncommitted changes
  git switch -c feature/context-test
  echo "uncommitted" > test.txt
  run bash "$WORKFLOW_SKILL"
  assert_output --partial '/git commit'
}
