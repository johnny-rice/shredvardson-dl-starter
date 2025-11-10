#!/usr/bin/env bats
# Tests for git/pr-fix.sh - PR Issue Fixing

setup() {
  load test_helper/common
  disable_skill_logging
  setup_test_dir

  export SCRIPT_DIR=$(cd "$(dirname "$BATS_TEST_FILENAME")/.." && pwd)
  export PR_FIX_SKILL="$SCRIPT_DIR/git/pr-fix.sh"

  # Create utils directory with mock skill-logger
  mkdir -p "$TEST_TEMP_DIR/utils"
  cat > "$TEST_TEMP_DIR/utils/skill-logger.sh" << 'EOF'
#!/bin/bash
setup_skill_logging() { :; }
log_skill_invocation() { :; }
export -f setup_skill_logging log_skill_invocation
EOF

  # Mock gh command by default to fail (no PR)
  gh() {
    return 1
  }
  export -f gh

  # Helper to set up success mock
  mock_gh_for_success() {
    MOCK_PR_NUM="$1"
    MOCK_BRANCH="$2"
    MOCK_CHECKS="${3:-[]}"
    export MOCK_PR_NUM MOCK_BRANCH MOCK_CHECKS

    gh() {
      if [[ "$1" == "pr" && "$2" == "view" && "$3" == "$MOCK_PR_NUM" ]]; then
        if [[ "$#" == "3" ]]; then
          return 0
        fi
        if [[ "$4" == "--json" && "$5" == "headRefName" && "$6" == "-q" ]]; then
          echo "$MOCK_BRANCH"
          return 0
        elif [[ "$4" == "--json" && "$5" == "statusCheckRollup" && "$6" == "-q" ]]; then
          echo "$MOCK_CHECKS"
          return 0
        fi
        return 0
      fi
      return 1
    }
    export -f gh
  }
}

teardown() {
  teardown_test_dir
}

@test "git/pr-fix.sh: fails when no PR number provided" {
  run bash "$PR_FIX_SKILL"

  assert_failure
  assert_output --partial '"error"'
  assert_output --partial 'PR number required'
  assert_output --partial '/git pr fix <number>'
}

@test "git/pr-fix.sh: shows usage pattern in error" {
  run bash "$PR_FIX_SKILL"

  assert_failure
  assert_output --partial 'usage'
  assert_output --partial '/git pr fix'
}

@test "git/pr-fix.sh: provides usage example" {
  run bash "$PR_FIX_SKILL"

  assert_failure
  assert_output --partial 'example'
  assert_output --partial '/git pr fix 141'
}

@test "git/pr-fix.sh: fails when PR doesn't exist" {
  gh() {
    if [[ "$1" == "pr" && "$2" == "view" ]]; then
      return 1
    fi
    return 0
  }
  export -f gh

  run bash "$PR_FIX_SKILL" 999

  assert_failure
  assert_output --partial '"error"'
  assert_output --partial 'PR not found'
  assert_output --partial '999'
}

@test "git/pr-fix.sh: suggests checking PR list when not found" {
  gh() {
    return 1
  }
  export -f gh

  run bash "$PR_FIX_SKILL" 123

  assert_failure
  assert_output --partial 'suggestion'
  assert_output --partial 'gh pr list'
}

@test "git/pr-fix.sh: fails when on wrong branch" {
  # Mock gh to return a different branch
  gh() {
    if [[ "$1" == "pr" && "$2" == "view" ]]; then
      if [[ "$3" == "123" ]]; then
        # First call without args - validation
        if [[ "$#" == "3" ]]; then
          return 0
        fi
        # Calls with --json and -q
        if [[ "$4" == "--json" && "$5" == "headRefName" && "$6" == "-q" ]]; then
          echo "feature/other-branch"
          return 0
        elif [[ "$4" == "--json" && "$5" == "statusCheckRollup" && "$6" == "-q" ]]; then
          echo "[]"
          return 0
        fi
      fi
      return 0
    fi
    return 1
  }
  export -f gh

  # Create a feature branch
  git switch -c feature/test-branch

  run bash "$PR_FIX_SKILL" 123

  assert_failure
  assert_output --partial '"error"'
  assert_output --partial 'Wrong branch'
}

@test "git/pr-fix.sh: shows current and expected branch in error" {
  gh() {
    if [[ "$1" == "pr" && "$2" == "view" && "$3" == "456" ]]; then
      if [[ "$#" == "3" ]]; then
        return 0
      fi
      if [[ "$4" == "--json" && "$5" == "headRefName" && "$6" == "-q" ]]; then
        echo "feature/expected"
        return 0
      elif [[ "$4" == "--json" && "$5" == "statusCheckRollup" && "$6" == "-q" ]]; then
        echo "[]"
        return 0
      fi
      return 0
    fi
    return 1
  }
  export -f gh

  git switch -c feature/current

  run bash "$PR_FIX_SKILL" 456

  assert_failure
  assert_output --partial 'current_branch'
  assert_output --partial 'expected_branch'
  assert_output --partial 'feature/current'
  assert_output --partial 'feature/expected'
}

@test "git/pr-fix.sh: suggests switching to correct branch" {
  gh() {
    if [[ "$1" == "pr" && "$2" == "view" && "$3" == "789" ]]; then
      if [[ "$#" == "3" ]]; then
        return 0
      fi
      if [[ "$4" == "--json" && "$5" == "headRefName" && "$6" == "-q" ]]; then
        echo "feature/target"
        return 0
      elif [[ "$4" == "--json" && "$5" == "statusCheckRollup" && "$6" == "-q" ]]; then
        echo "[]"
        return 0
      fi
      return 0
    fi
    return 1
  }
  export -f gh

  git switch -c feature/wrong

  run bash "$PR_FIX_SKILL" 789

  assert_failure
  assert_output --partial 'suggestion'
  assert_output --partial 'git switch'
  assert_output --partial 'feature/target'
}

@test "git/pr-fix.sh: returns needs_fix status on correct branch" {
  # Mock gh to succeed and return same branch
  CURRENT=$(git branch --show-current)
  export CURRENT

  gh() {
    if [[ "$1" == "pr" && "$2" == "view" && "$3" == "100" ]]; then
      if [[ "$#" == "3" ]]; then
        return 0
      fi
      if [[ "$4" == "--json" && "$5" == "headRefName" && "$6" == "-q" ]]; then
        echo "$CURRENT"
        return 0
      elif [[ "$4" == "--json" && "$5" == "statusCheckRollup" && "$6" == "-q" ]]; then
        echo '[{"state": "FAILURE"}]'
        return 0
      fi
      return 0
    fi
    return 1
  }
  export -f gh

  run bash "$PR_FIX_SKILL" 100

  assert_success
  assert_output --partial '"status": "needs_fix"'
}

@test "git/pr-fix.sh: provides analysis instructions" {
  CURRENT=$(git branch --show-current)
  mock_gh_for_success "200" "$CURRENT"

  run bash "$PR_FIX_SKILL" 200

  assert_success
  assert_output --partial 'instructions'
  assert_output --partial 'Analyze PR checks'
}

@test "git/pr-fix.sh: includes PR number in response" {
  CURRENT=$(git branch --show-current)
  mock_gh_for_success "42" "$CURRENT"

  run bash "$PR_FIX_SKILL" 42

  assert_success
  assert_output --partial '"pr_number": "42"'
}

@test "git/pr-fix.sh: includes branch name in response" {
  git switch -c feature/my-feature
  mock_gh_for_success "55" "feature/my-feature"

  run bash "$PR_FIX_SKILL" 55

  assert_success
  assert_output --partial '"branch"'
  assert_output --partial 'feature/my-feature'
}

@test "git/pr-fix.sh: includes checks status" {
  CURRENT=$(git branch --show-current)
  mock_gh_for_success "77" "$CURRENT" '[{"name": "test", "state": "SUCCESS"}]'

  run bash "$PR_FIX_SKILL" 77

  assert_success
  assert_output --partial 'checks_status'
  assert_output --partial '"name": "test"'
}

@test "git/pr-fix.sh: provides child skills for LLM" {
  CURRENT=$(git branch --show-current)
  mock_gh_for_success "88" "$CURRENT"

  run bash "$PR_FIX_SKILL" 88

  assert_success
  assert_output --partial 'child_skills'
  assert_output --partial 'analyze-pr-failures'
}

@test "git/pr-fix.sh: child skill includes required steps" {
  CURRENT=$(git branch --show-current)
  mock_gh_for_success "99" "$CURRENT"

  run bash "$PR_FIX_SKILL" 99

  assert_success
  assert_output --partial 'steps'
  assert_output --partial 'gh pr checks'
  assert_output --partial 'Identify failing checks'
}

@test "git/pr-fix.sh: marks child skill as requiring LLM" {
  CURRENT=$(git branch --show-current)
  mock_gh_for_success "111" "$CURRENT"

  run bash "$PR_FIX_SKILL" 111

  assert_success
  assert_output --partial 'requires_llm'
  assert_output --partial 'true'
}

@test "git/pr-fix.sh: returns valid JSON on success" {
  CURRENT=$(git branch --show-current)
  mock_gh_for_success "222" "$CURRENT"

  run bash "$PR_FIX_SKILL" 222

  assert_success
  # Extract JSON once
  json_output=$(extract_json_output "$output")
  echo "$json_output" | jq -e '.status' > /dev/null
  echo "$json_output" | jq -e '.pr_number' > /dev/null
  echo "$json_output" | jq -e '.branch' > /dev/null
  echo "$json_output" | jq -e '.child_skills' > /dev/null
}

@test "git/pr-fix.sh: returns valid JSON on error" {
  run bash "$PR_FIX_SKILL" 333

  assert_failure
  json_output=$(extract_json_output "$output")
  echo "$json_output" | jq -e '.error' > /dev/null
}

@test "git/pr-fix.sh: uses strict error handling" {
  head -n 5 "$PR_FIX_SKILL" | grep -q "set -euo pipefail"
}

@test "git/pr-fix.sh: has proper shebang" {
  head -n 1 "$PR_FIX_SKILL" | grep -q "#!/bin/bash"
}

@test "git/pr-fix.sh: handles empty PR number" {
  run bash "$PR_FIX_SKILL" ""

  assert_failure
  assert_output --partial 'PR number required'
}

@test "git/pr-fix.sh: validates PR with gh pr view" {
  # Verify the script uses gh pr view for validation
  grep -q "gh pr view.*PR_NUMBER" "$PR_FIX_SKILL"
}

@test "git/pr-fix.sh: gets PR branch with gh" {
  # Verify it retrieves headRefName
  grep -q "headRefName" "$PR_FIX_SKILL"
}

@test "git/pr-fix.sh: gets PR checks with gh" {
  # Verify it retrieves statusCheckRollup
  grep -q "statusCheckRollup" "$PR_FIX_SKILL"
}