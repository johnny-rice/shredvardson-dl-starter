#!/usr/bin/env bats
# Tests for design-system.sh - Design System Operations

setup() {
  load test_helper/common
  disable_skill_logging
  setup_test_dir

  export SCRIPT_DIR=$(cd "$(dirname "$BATS_TEST_FILENAME")/.." && pwd)
  export DESIGN_SKILL="$SCRIPT_DIR/design-system.sh"

  # Mock pnpm tsx command
  pnpm() {
    if [[ "$1" == "tsx" ]]; then
      echo "Mock design system script: $2"
      return 0
    fi
    return 0
  }
  export -f pnpm
}

teardown() {
  teardown_test_dir
}

@test "design-system.sh: shows help by default" {
  run bash "$DESIGN_SKILL"

  assert_success
  assert_output --partial 'Design System Skill'
  assert_output --partial 'Usage'
}

@test "design-system.sh: shows help with help action" {
  run bash "$DESIGN_SKILL" help

  assert_success
  assert_output --partial 'Design System Skill'
  assert_output --partial 'viewer'
  assert_output --partial 'validate'
}

@test "design-system.sh: routes to viewer" {
  run bash "$DESIGN_SKILL" viewer

  assert_success
  assert_output --partial 'viewer.ts'
}

@test "design-system.sh: runs all validations" {
  run bash "$DESIGN_SKILL" validate

  assert_success
  # Should run multiple validation scripts
  assert_output --partial 'Running all design system validations'
}

@test "design-system.sh: routes to validate-tokens" {
  run bash "$DESIGN_SKILL" validate-tokens

  assert_success
  assert_output --partial 'validate-tokens.ts'
}

@test "design-system.sh: routes to validate-spacing" {
  run bash "$DESIGN_SKILL" validate-spacing

  assert_success
  assert_output --partial 'validate-spacing.ts'
}

@test "design-system.sh: routes to contrast-check" {
  run bash "$DESIGN_SKILL" contrast-check

  assert_success
  assert_output --partial 'contrast-check.ts'
}

@test "design-system.sh: routes to visual-diff" {
  run bash "$DESIGN_SKILL" visual-diff

  assert_success
  assert_output --partial 'visual-diff.ts'
}

@test "design-system.sh: routes to copy-review" {
  run bash "$DESIGN_SKILL" copy-review

  assert_success
  assert_output --partial 'copy-review.ts'
}

@test "design-system.sh: routes to generate" {
  run bash "$DESIGN_SKILL" generate TestComponent

  assert_success
  assert_output --partial 'generate-component.ts'
}

@test "design-system.sh: routes to import" {
  run bash "$DESIGN_SKILL" import tremor Card

  assert_success
  assert_output --partial 'import-external.ts'
}

@test "design-system.sh: routes to scaffold" {
  run bash "$DESIGN_SKILL" scaffold dashboard

  assert_success
  assert_output --partial 'scaffold-layout.ts'
}

@test "design-system.sh: handles implement action" {
  run bash "$DESIGN_SKILL" implement

  # Should fail without spec file
  assert_failure
  assert_output --partial 'Spec file required'
}

@test "design-system.sh: implements from spec file" {
  echo "# Spec" > spec.md

  run bash "$DESIGN_SKILL" implement spec.md

  assert_success
  assert_output --partial 'implement-from-spec.ts'
}

@test "design-system.sh: routes to performance-check" {
  run bash "$DESIGN_SKILL" performance-check

  assert_success
  assert_output --partial 'performance-check.ts'
}

@test "design-system.sh: routes to performance (alias)" {
  run bash "$DESIGN_SKILL" performance

  assert_success
  assert_output --partial 'performance-check.ts'
}

@test "design-system.sh: routes to figma-import" {
  run bash "$DESIGN_SKILL" figma-import

  assert_success
  assert_output --partial 'figma-import.ts'
}

@test "design-system.sh: routes to figma (alias)" {
  run bash "$DESIGN_SKILL" figma

  assert_success
  assert_output --partial 'figma-import.ts'
}

@test "design-system.sh: shows available commands in help" {
  run bash "$DESIGN_SKILL" help

  assert_success
  assert_output --partial '/design viewer'
  assert_output --partial '/design validate'
  assert_output --partial '/design generate'
  assert_output --partial '/design import'
  assert_output --partial '/design scaffold'
}

@test "design-system.sh: shows Phase 4 features" {
  run bash "$DESIGN_SKILL" help

  assert_success
  assert_output --partial 'Phase 4'
  assert_output --partial 'Proactive Generation'
}

@test "design-system.sh: passes arguments to TypeScript scripts" {
  run bash "$DESIGN_SKILL" generate Button variant

  assert_success
  # Should pass both arguments
  [[ "$output" =~ "generate-component.ts" ]]
}

@test "design-system.sh: uses correct skill directory path" {
  # Verify it references the correct skill directory
  grep -q '.claude/skills/design-system' "$DESIGN_SKILL"
}

@test "design-system.sh: handles unknown action with help" {
  run bash "$DESIGN_SKILL" unknown-action

  assert_success
  assert_output --partial 'Design System Skill'
  assert_output --partial 'Usage'
}

@test "design-system.sh: uses set -e for error handling" {
  head -n 5 "$DESIGN_SKILL" | grep -q "set -e"
}

@test "design-system.sh: has proper shebang" {
  head -n 1 "$DESIGN_SKILL" | grep -q "#!/bin/bash"
}

@test "design-system.sh: validate runs multiple scripts" {
  run bash "$DESIGN_SKILL" validate

  assert_success
  # Should execute validate-tokens, validate-spacing, and contrast-check
  assert_output --partial 'validate-tokens.ts'
  assert_output --partial 'validate-spacing.ts'
  assert_output --partial 'contrast-check.ts'
}

@test "design-system.sh: shows scaffold options" {
  run bash "$DESIGN_SKILL" help

  assert_success
  assert_output --partial 'dashboard'
  assert_output --partial 'landing'
  assert_output --partial 'form'
  assert_output --partial 'settings'
}

@test "design-system.sh: shows import sources" {
  run bash "$DESIGN_SKILL" help

  assert_success
  assert_output --partial 'tremor'
  assert_output --partial 'tanstack'
  assert_output --partial 'dnd-kit'
}

@test "design-system.sh: mentions prd-analyzer integration" {
  run bash "$DESIGN_SKILL" help

  assert_success
  assert_output --partial 'prd-analyzer integration'
}

@test "design-system.sh: shows Figma as Phase 5" {
  run bash "$DESIGN_SKILL" help

  assert_success
  assert_output --partial 'Phase 5'
  assert_output --partial 'figma-import'
}
