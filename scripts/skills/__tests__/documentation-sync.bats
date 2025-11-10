#!/usr/bin/env bats
# Tests for documentation-sync.sh - Documentation Synchronization

setup() {
  load test_helper/common
  disable_skill_logging
  setup_test_dir

  export SCRIPT_DIR=$(cd "$(dirname "$BATS_TEST_FILENAME")/.." && pwd)
  export DOCS_SKILL="$SCRIPT_DIR/documentation-sync.sh"

  # Create utils directory with mock skill-logger
  mkdir -p "$TEST_TEMP_DIR/utils"
  cat > "$TEST_TEMP_DIR/utils/skill-logger.sh" << 'EOF'
#!/bin/bash
setup_skill_logging() { :; }
log_skill_invocation() { :; }
export -f setup_skill_logging log_skill_invocation
EOF

  # Mock gh command by default
  gh() {
    if [[ "$1" == "repo" && "$2" == "view" ]]; then
      echo "true"
      return 0
    fi
    return 0
  }
  export -f gh
}

teardown() {
  teardown_test_dir
}

@test "documentation-sync.sh: defaults to sync action" {
  run bash "$DOCS_SKILL"

  # Default is sync, which should check for changed docs
  assert_success
  assert_output --partial 'No documentation changes detected'
}

@test "documentation-sync.sh: detects no changes when clean" {
  run bash "$DOCS_SKILL" sync

  assert_success
  assert_output --partial '"status": "success"'
  assert_output --partial 'No documentation changes detected'
  assert_output --partial '"files_checked": 0'
}

@test "documentation-sync.sh: detects changed markdown files" {
  echo "# New Doc" > new.md
  git add new.md

  run bash "$DOCS_SKILL" sync

  assert_success
  assert_output --partial 'files_checked'
  assert_output --partial 'new.md'
}

@test "documentation-sync.sh: detects changed mdx files" {
  echo "# MDX Doc" > page.mdx
  git add page.mdx

  run bash "$DOCS_SKILL" sync

  assert_success
  assert_output --partial 'page.mdx'
}

@test "documentation-sync.sh: handles dry-run flag" {
  echo "# Test" > test.md
  git add test.md

  run bash "$DOCS_SKILL" sync --dry-run

  assert_success
  assert_output --partial 'Dry run'
  assert_output --partial 'would sync'
  assert_output --partial 'files_to_sync'
}

@test "documentation-sync.sh: validates documentation" {
  # Create some markdown files
  mkdir -p docs
  echo "# Valid" > docs/valid.md
  echo "[link](./valid.md)" > docs/linked.md

  run bash "$DOCS_SKILL" validate

  assert_success
  assert_output --partial 'files_checked'
}

@test "documentation-sync.sh: detects broken links" {
  mkdir -p docs
  echo "[broken link](./nonexistent.md)" > docs/broken.md

  run bash "$DOCS_SKILL" validate

  # Should warn about broken link
  assert_output --regexp '(warning|broken)'
}

@test "documentation-sync.sh: checks wiki enabled status" {
  gh() {
    if [[ "$1" == "repo" && "$2" == "view" ]]; then
      echo "true"
      return 0
    fi
    return 0
  }
  export -f gh

  echo "# Doc" > doc.md
  git add doc.md

  run bash "$DOCS_SKILL" sync

  # Should check wiki status
  assert_success
}

@test "documentation-sync.sh: handles wiki not enabled" {
  gh() {
    if [[ "$1" == "repo" && "$2" == "view" ]]; then
      echo "false"
      return 0
    fi
    return 1
  }
  export -f gh

  echo "# Doc" > doc.md
  git add doc.md

  run bash "$DOCS_SKILL" sync

  # Should warn about wiki not enabled
  assert_output --regexp '(warning|not enabled)'
}

@test "documentation-sync.sh: returns valid JSON for sync" {
  run bash "$DOCS_SKILL" sync

  assert_success
  # Extract JSON from output (skills may print progress messages)
  json_output=$(extract_json_output "$output")
  echo "$json_output" | jq -e '.status' > /dev/null
  echo "$json_output" | jq -e '.files_checked' > /dev/null
}

@test "documentation-sync.sh: returns valid JSON for validate" {
  run bash "$DOCS_SKILL" validate

  assert_success
  # Extract JSON from output
  json_output=$(extract_json_output "$output")
  echo "$json_output" | jq -e '.status' > /dev/null
  echo "$json_output" | jq -e '.files_checked' > /dev/null
}

@test "documentation-sync.sh: rejects unknown action" {
  run bash "$DOCS_SKILL" unknown-action

  assert_failure
  assert_output --partial '"error"'
  assert_output --partial 'Unknown action'
  assert_output --partial 'unknown-action'
}

@test "documentation-sync.sh: shows available actions on error" {
  run bash "$DOCS_SKILL" bad-action

  assert_failure
  assert_output --partial 'available_actions'
  assert_output --partial 'sync'
  assert_output --partial 'validate'
}

@test "documentation-sync.sh: provides usage information" {
  run bash "$DOCS_SKILL" invalid

  assert_failure
  assert_output --partial 'usage'
  assert_output --partial '/docs <sync|validate>'
}

@test "documentation-sync.sh: counts changed files" {
  echo "# Doc 1" > doc1.md
  echo "# Doc 2" > doc2.md
  echo "# Doc 3" > doc3.mdx
  git add doc1.md doc2.md doc3.mdx

  run bash "$DOCS_SKILL" sync

  assert_success
  assert_output --partial '"files_checked": 3'
}

@test "documentation-sync.sh: handles multiple validation issues" {
  mkdir -p docs
  echo "[broken1](./missing1.md)" > docs/broken1.md
  echo "[broken2](./missing2.md)" > docs/broken2.md

  run bash "$DOCS_SKILL" validate

  # Should detect multiple broken links
  assert_output --partial 'broken_links'
}

@test "documentation-sync.sh: suggests next steps in dry-run" {
  echo "# Test" > test.md
  git add test.md

  run bash "$DOCS_SKILL" sync --dry-run

  assert_success
  assert_output --partial 'next_steps'
  assert_output --partial 'Remove --dry-run'
}

@test "documentation-sync.sh: uses strict error handling" {
  head -n 5 "$DOCS_SKILL" | grep -q "set -euo pipefail"
}

@test "documentation-sync.sh: excludes node_modules from validation" {
  mkdir -p node_modules
  echo "# Should ignore" > node_modules/ignored.md

  run bash "$DOCS_SKILL" validate

  # Should not count files in node_modules
  ! [[ "$output" =~ "node_modules" ]]
}

@test "documentation-sync.sh: excludes .next from validation" {
  mkdir -p .next
  echo "# Should ignore" > .next/ignored.md

  run bash "$DOCS_SKILL" validate

  # Should not count files in .next
  ! [[ "$output" =~ ".next" ]]
}

@test "documentation-sync.sh: provides child skills info" {
  echo "# Doc" > doc.md
  git add doc.md

  gh() {
    if [[ "$1" == "repo" ]]; then
      echo "true"
      return 0
    fi
    return 0
  }
  export -f gh

  run bash "$DOCS_SKILL" sync

  # Should mention child skills for wiki operations
  assert_output --regexp '(child_skills|wiki-push|pending)'
}
