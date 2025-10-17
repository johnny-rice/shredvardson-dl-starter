#!/bin/bash
# Integration tests for spec validation script

set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly FIXTURES_DIR="$SCRIPT_DIR/fixtures"
readonly TEST_SPECS_DIR="$FIXTURES_DIR/test-specs"
readonly SCRIPT_PATH="$SCRIPT_DIR/../../scripts/ci/validate-specs.sh"

# Setup
setup() {
  rm -rf "$TEST_SPECS_DIR"
  mkdir -p "$TEST_SPECS_DIR"
}

# Teardown
teardown() {
  rm -rf "$TEST_SPECS_DIR"
}

# Test: Valid spec passes validation
test_valid_spec() {
  echo "Testing: Valid spec should pass validation"

  mkdir -p "$TEST_SPECS_DIR/001-valid-spec"
  cat > "$TEST_SPECS_DIR/001-valid-spec/README.md" <<'EOF'
---
id: SPEC-20251015-valid-spec
type: spec
---

# Spec: Valid Spec

Status: Draft

## Overview
This is a valid specification.
EOF

  cat > "$TEST_SPECS_DIR/001-valid-spec/DESIGN.md" <<'EOF'
# Design: Valid Spec

Implementation details here.
EOF

  # Run validation
  if "$SCRIPT_PATH" "$TEST_SPECS_DIR"; then
    echo "✅ Test passed: Valid spec accepted"
    return 0
  else
    echo "❌ Test failed: Valid spec rejected"
    return 1
  fi
}

# Test: Invalid naming fails validation
test_invalid_naming() {
  echo "Testing: Invalid spec naming should fail validation"

  mkdir -p "$TEST_SPECS_DIR/invalid-name"
  cat > "$TEST_SPECS_DIR/invalid-name/README.md" <<'EOF'
# Spec: Invalid Name

Status: Draft
EOF

  cat > "$TEST_SPECS_DIR/invalid-name/DESIGN.md" <<'EOF'
# Design
EOF

  if "$SCRIPT_PATH" "$TEST_SPECS_DIR" 2>/dev/null; then
    echo "❌ Test failed: Invalid naming accepted"
    return 1
  else
    echo "✅ Test passed: Invalid naming rejected"
    return 0
  fi
}

# Test: Missing status fails validation
test_missing_status() {
  echo "Testing: Missing status should fail validation"

  mkdir -p "$TEST_SPECS_DIR/002-no-status"
  cat > "$TEST_SPECS_DIR/002-no-status/README.md" <<'EOF'
---
id: SPEC-20251015-no-status
type: spec
---

# Spec: No Status

No status field here.
EOF

  cat > "$TEST_SPECS_DIR/002-no-status/DESIGN.md" <<'EOF'
# Design
EOF

  if "$SCRIPT_PATH" "$TEST_SPECS_DIR" 2>/dev/null; then
    echo "❌ Test failed: Missing status accepted"
    return 1
  else
    echo "✅ Test passed: Missing status rejected"
    return 0
  fi
}

# Test: Missing files fail validation
test_missing_files() {
  echo "Testing: Missing required files should fail validation"

  mkdir -p "$TEST_SPECS_DIR/003-missing-files"
  cat > "$TEST_SPECS_DIR/003-missing-files/README.md" <<'EOF'
---
id: SPEC-20251015-missing-files
type: spec
---

# Spec: Missing Files

Status: Draft
EOF

  # No DESIGN.md file

  if "$SCRIPT_PATH" "$TEST_SPECS_DIR" 2>/dev/null; then
    echo "❌ Test failed: Missing files accepted"
    return 1
  else
    echo "✅ Test passed: Missing files rejected"
    return 0
  fi
}

# Test: Missing header fails validation
test_missing_header() {
  echo "Testing: Missing proper header should fail validation"

  mkdir -p "$TEST_SPECS_DIR/004-no-header"
  cat > "$TEST_SPECS_DIR/004-no-header/README.md" <<'EOF'
This is not a proper spec header.

Status: Draft
EOF

  cat > "$TEST_SPECS_DIR/004-no-header/DESIGN.md" <<'EOF'
# Design
EOF

  if "$SCRIPT_PATH" "$TEST_SPECS_DIR" 2>/dev/null; then
    echo "❌ Test failed: Missing header accepted"
    return 1
  else
    echo "✅ Test passed: Missing header rejected"
    return 0
  fi
}

# Test: No specs directory is OK (skip validation)
test_no_specs_directory() {
  echo "Testing: No specs directory should skip validation gracefully"

  # Create empty directory
  local empty_dir="$FIXTURES_DIR/empty-dir"
  mkdir -p "$empty_dir"

  if "$SCRIPT_PATH" "$empty_dir/specs"; then
    echo "✅ Test passed: No specs directory handled gracefully"
    rm -rf "$empty_dir"
    return 0
  else
    echo "❌ Test failed: No specs directory caused error"
    rm -rf "$empty_dir"
    return 1
  fi
}

# Run all tests
main() {
  # Check if script exists
  if [ ! -f "$SCRIPT_PATH" ]; then
    echo "❌ Script not found: $SCRIPT_PATH"
    echo "   This is expected for TDD - implement the script to make tests pass"
    exit 1
  fi

  setup

  local failed=0
  local total=0

  echo "================================"
  echo "Spec Validation Integration Tests"
  echo "================================"
  echo ""

  ((total++))
  test_valid_spec || ((failed++))
  echo ""

  ((total++))
  test_invalid_naming || ((failed++))
  echo ""

  ((total++))
  test_missing_status || ((failed++))
  echo ""

  ((total++))
  test_missing_files || ((failed++))
  echo ""

  ((total++))
  test_missing_header || ((failed++))
  echo ""

  ((total++))
  test_no_specs_directory || ((failed++))
  echo ""

  teardown

  echo "================================"
  echo "Results: $((total - failed))/$total tests passed"
  echo "================================"

  if [ $failed -eq 0 ]; then
    echo "✅ All tests passed!"
    exit 0
  else
    echo "❌ $failed test(s) failed"
    exit 1
  fi
}

main