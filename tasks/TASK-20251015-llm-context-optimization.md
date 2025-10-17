---
id: TASK-20251015-llm-context-optimization
type: task
parentId: PLAN-20251015-llm-context-optimization
issue: 142
plan: PLAN-20251015-llm-context-optimization
spec: SPEC-20251015-llm-context-optimization
branch: feature/142-llm-context-optimization
source: https://github.com/Shredvardson/dl-starter/issues/142
---

# Task Breakdown: LLM Context Optimization

**Plan:** [PLAN-20251015-llm-context-optimization.md](../plans/PLAN-20251015-llm-context-optimization.md)
**Spec:** [SPEC-20251015-llm-context-optimization.md](../specs/SPEC-20251015-llm-context-optimization.md)
**Parent Issue:** [#142](https://github.com/Shredvardson/dl-starter/issues/142)
**Spec Issue:** [#143](https://github.com/Shredvardson/dl-starter/issues/143)
**Branch:** `feature/142-llm-context-optimization`

---

## Constitutional Implementation Order

Following Article I, Section 1.2 (Test-Driven Development):

1. **Phase 1:** Contracts & Interfaces
2. **Phase 2:** Test Foundation (Integration → E2E → Unit)
3. **Phase 3:** Implementation
4. **Phase 4:** Integration & Polish
5. **Phase 5:** Documentation & Release

---

## Phase 1: Contracts & Interfaces (Week 1, Days 1-2)

Define expected behavior and contracts before writing any implementation.

### Task 1.1: Create CI Testing Contract

**Objective:** Define contracts for all CI scripts

**Commands:**
```bash
mkdir -p tests/ci
touch tests/ci/contracts.md
```

**Implementation:**
```markdown
# CI Workflow Testing Contracts

## Spec Validation Contract
**Script:** `scripts/ci/validate-specs.sh`
**Command:** `pnpm run specs:validate`

**Input:**
- Spec directory path (default: `specs/`)
- Optional: `--help` flag

**Output:**
- Exit code 0: All specs valid
- Exit code 1: Validation failed
- STDOUT: Validation messages with ✅/❌ prefixes
- STDERR: Error details referencing debugging guide

**Behavior:**
- Checks spec directory naming (###-name format)
- Validates required files (README.md, DESIGN.md)
- Validates README structure (header, status field)
- Identical behavior in CI and local environments

## Spec Lane Check Contract
**Script:** `scripts/ci/check-spec-lane.sh`
**Command:** `pnpm run specs:check-lane`

**Input:**
- Spec file path (optional, auto-detects from git changes)
- Optional: `--help` flag

**Output:**
- Exit code 0: Always (informational only)
- STDOUT: Lane recommendation with reasoning
- Format: "Recommended lane: [spec|dev] - Reason: [explanation]"

**Behavior:**
- Analyzes spec content for lane indicators
- Outputs clear lane choice explanation
- Identical behavior in CI and local environments

## AI Review Scraper Contract
**Script:** `scripts/ci/scrape-ai-reviews.sh`
**Command:** `pnpm run ai:scrape-reviews`

**Input:**
- PR number (from environment or argument)
- GitHub token (from environment)

**Output:**
- Exit code 0: Scrape successful
- Exit code 1: Scrape failed (missing auth, PR not found)
- STDOUT: JSON array of review comments
- STDERR: Error details with debugging guidance

**Behavior:**
- Uses GH CLI to fetch PR comments
- Filters for AI-generated reviews
- Structured JSON output for parsing
- Clear error messages for auth/permission issues
```

**Files Created:**
- `tests/ci/contracts.md`

**Acceptance Criteria:**
- ✅ Every script has defined contract
- ✅ Input/output/behavior documented
- ✅ Exit codes specified
- ✅ Error handling defined

**Time Estimate:** 2 hours

---

### Task 1.2: Create Script Interface Definitions

**Objective:** Define script signatures and shared libraries

**Commands:**
```bash
mkdir -p scripts/ci/lib
touch scripts/ci/lib/common.sh
touch scripts/ci/lib/error-reporter.sh
```

**Implementation:**

**File:** `scripts/ci/lib/common.sh`
```bash
#!/bin/bash
# Common functions for CI scripts

# Color codes for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m' # No Color

# Log functions
log_info() {
  echo -e "${GREEN}✅${NC} $1"
}

log_error() {
  echo -e "${RED}❌${NC} $1" >&2
}

log_warning() {
  echo -e "${YELLOW}⚠️${NC} $1"
}

# Check if command exists
require_command() {
  local cmd="$1"
  local install_url="$2"

  if ! command -v "$cmd" >/dev/null 2>&1; then
    log_error "$cmd is required but not installed"
    if [ -n "$install_url" ]; then
      log_error "Install: $install_url"
    fi
    exit 1
  fi
}

# Validate directory exists
require_directory() {
  local dir="$1"

  if [ ! -d "$dir" ]; then
    log_error "Directory not found: $dir"
    exit 1
  fi
}
```

**File:** `scripts/ci/lib/error-reporter.sh`
```bash
#!/bin/bash
# Standardized error reporting for CI

# Report error with debugging guide reference
report_ci_error() {
  local error_message="$1"
  local guide_section="$2"

  # In CI environment, use GitHub Actions annotations
  if [ -n "$GITHUB_ACTIONS" ]; then
    echo "::error::$error_message. See .github/DEBUGGING.md#$guide_section"
  else
    # In local environment, use colored output
    echo -e "${RED}❌ Error:${NC} $error_message" >&2
    echo -e "   See .github/DEBUGGING.md#$guide_section for debugging help" >&2
  fi
}

# Report success
report_ci_success() {
  local success_message="$1"

  if [ -n "$GITHUB_ACTIONS" ]; then
    echo "::notice::$success_message"
  else
    echo -e "${GREEN}✅${NC} $success_message"
  fi
}
```

**Files Created:**
- `scripts/ci/lib/common.sh`
- `scripts/ci/lib/error-reporter.sh`

**Acceptance Criteria:**
- ✅ Shared functions defined
- ✅ Error reporting standardized
- ✅ CI/local environment detection
- ✅ Reusable across all scripts

**Time Estimate:** 2 hours

---

### Task 1.3: Create Debugging Guide Structure

**Objective:** Define debugging guide sections before implementation

**Commands:**
```bash
touch .github/DEBUGGING.md
```

**Implementation:**
```markdown
# CI Debugging Guide

Quick reference for debugging CI failures locally.

## Table of Contents
- [Spec Validation](#spec-validation)
- [Spec Lane Check](#spec-lane-check)
- [TypeScript Errors](#typescript-errors)
- [Linting Errors](#linting-errors)
- [Test Failures](#test-failures)
- [Build Failures](#build-failures)
- [AI Review Scraping](#ai-review-scraping)

---

## Spec Validation

### Error: "Spec directory does not follow naming convention"

**Local Test:**
```bash
pnpm run specs:validate
```

**Common Causes:**
- Spec directory not named with `###-name` format
- Missing leading zeros (e.g., `1-test` instead of `001-test`)

**Fix:**
```bash
# Rename spec directory to follow convention
mv specs/bad-name specs/001-good-name
```

---

## Spec Lane Check

### Error: "Unable to detect spec lane"

**Local Test:**
```bash
pnpm run specs:check-lane
```

**Common Causes:**
- Spec file doesn't exist
- No spec content changes in current PR

**Fix:**
- Ensure spec file exists in `specs/` directory
- Review spec content for lane indicators

---

## TypeScript Errors

### Error: "Type check failed"

**Local Test:**
```bash
pnpm run typecheck
```

**Common Causes:**
- Type mismatches
- Missing type imports
- Incorrect generic types

**Fix:**
```bash
# Run typecheck and review errors
pnpm run typecheck

# Fix reported errors
# Re-run to verify
pnpm run typecheck
```

---

## Linting Errors

### Error: "Lint check failed"

**Local Test:**
```bash
pnpm run lint
```

**Common Causes:**
- Code style violations
- Unused imports
- Console.log statements

**Fix:**
```bash
# Auto-fix most issues
pnpm run format

# Check remaining issues
pnpm run lint
```

---

## Test Failures

### Error: "Test suite failed"

**Local Test:**
```bash
pnpm run test
```

**Common Causes:**
- Broken test assertions
- Missing test fixtures
- Environment variable issues

**Fix:**
```bash
# Run tests with verbose output
pnpm run test -- --reporter=verbose

# Run specific test file
pnpm run test -- path/to/test.test.ts
```

---

## Build Failures

### Error: "Build failed"

**Local Test:**
```bash
pnpm run build
```

**Common Causes:**
- Missing dependencies
- Import path errors
- Configuration issues

**Fix:**
```bash
# Clean and rebuild
pnpm run clean
pnpm install
pnpm run build
```

---

## AI Review Scraping

### Error: "Failed to scrape AI reviews"

**Local Test:**
```bash
# Requires GitHub CLI authentication
gh auth status

# Run scraper
pnpm run ai:scrape-reviews
```

**Common Causes:**
- Not authenticated with GitHub CLI
- Missing PR context
- Insufficient permissions

**Fix:**
```bash
# Authenticate with GitHub CLI
gh auth login

# Try again
pnpm run ai:scrape-reviews
```

---

## General Debugging Tips

1. **Always test locally first** - All CI checks can be run locally
2. **Check environment** - Ensure all required tools are installed
3. **Review recent changes** - Did your changes affect related files?
4. **Check dependencies** - Run `pnpm install` if package.json changed
5. **Clear caches** - Run `pnpm run clean:cache` if seeing weird issues

## Getting Help

If the above doesn't help:
1. Check recent CI runs for similar failures
2. Review PR comments for automated feedback
3. Ask in team chat with CI failure details
```

**Files Created:**
- `.github/DEBUGGING.md`

**Acceptance Criteria:**
- ✅ All CI checks documented
- ✅ Local test commands provided
- ✅ Common causes listed
- ✅ Fix instructions clear

**Time Estimate:** 2 hours

---

## Phase 2: Test Foundation (Week 1, Days 3-5)

Build test infrastructure before implementation.

### Task 2.1: Create Integration Tests for Spec Validation

**Objective:** Test spec validation script logic

**Commands:**
```bash
mkdir -p tests/ci/fixtures
touch tests/ci/validate-specs.test.sh
chmod +x tests/ci/validate-specs.test.sh
```

**Implementation:**
```bash
#!/bin/bash
# Integration tests for spec validation script

set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly FIXTURES_DIR="$SCRIPT_DIR/fixtures"
readonly TEST_SPECS_DIR="$FIXTURES_DIR/test-specs"

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
  cat > "$TEST_SPECS_DIR/001-valid-spec/README.md" <<EOF
---
id: SPEC-20251015-valid-spec
type: spec
---

# Spec: Valid Spec

Status: Draft
EOF

  cat > "$TEST_SPECS_DIR/001-valid-spec/DESIGN.md" <<EOF
# Design: Valid Spec

Implementation details here.
EOF

  # Run validation (will be created in Phase 3)
  if ./scripts/ci/validate-specs.sh "$TEST_SPECS_DIR"; then
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
  cat > "$TEST_SPECS_DIR/invalid-name/README.md" <<EOF
# Spec: Invalid Name

Status: Draft
EOF

  if ./scripts/ci/validate-specs.sh "$TEST_SPECS_DIR" 2>/dev/null; then
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
  cat > "$TEST_SPECS_DIR/002-no-status/README.md" <<EOF
# Spec: No Status

No status field here.
EOF

  cat > "$TEST_SPECS_DIR/002-no-status/DESIGN.md" <<EOF
# Design
EOF

  if ./scripts/ci/validate-specs.sh "$TEST_SPECS_DIR" 2>/dev/null; then
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
  cat > "$TEST_SPECS_DIR/003-missing-files/README.md" <<EOF
# Spec: Missing Files

Status: Draft
EOF

  # No DESIGN.md file

  if ./scripts/ci/validate-specs.sh "$TEST_SPECS_DIR" 2>/dev/null; then
    echo "❌ Test failed: Missing files accepted"
    return 1
  else
    echo "✅ Test passed: Missing files rejected"
    return 0
  fi
}

# Run all tests
main() {
  setup

  local failed=0

  test_valid_spec || ((failed++))
  test_invalid_naming || ((failed++))
  test_missing_status || ((failed++))
  test_missing_files || ((failed++))

  teardown

  if [ $failed -eq 0 ]; then
    echo ""
    echo "✅ All tests passed!"
    exit 0
  else
    echo ""
    echo "❌ $failed test(s) failed"
    exit 1
  fi
}

main
```

**Files Created:**
- `tests/ci/validate-specs.test.sh`
- `tests/ci/fixtures/` (directory)

**Acceptance Criteria:**
- ✅ Tests cover valid and invalid cases
- ✅ Tests are executable and self-contained
- ✅ Tests clean up after themselves
- ✅ Tests fail when script doesn't exist (TDD)

**Time Estimate:** 3 hours

---

### Task 2.2: Create Integration Tests for Lane Detection

**Objective:** Test spec lane detection logic

**Commands:**
```bash
touch tests/ci/check-spec-lane.test.sh
chmod +x tests/ci/check-spec-lane.test.sh
```

**Implementation:**
```bash
#!/bin/bash
# Integration tests for spec lane detection

set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly FIXTURES_DIR="$SCRIPT_DIR/fixtures"
readonly TEST_SPECS_DIR="$FIXTURES_DIR/test-specs"

# Setup
setup() {
  rm -rf "$TEST_SPECS_DIR"
  mkdir -p "$TEST_SPECS_DIR"
}

# Teardown
teardown() {
  rm -rf "$TEST_SPECS_DIR"
}

# Test: Spec lane content triggers spec lane
test_spec_lane_detection() {
  echo "Testing: Spec lane content should recommend spec lane"

  cat > "$TEST_SPECS_DIR/test-spec.md" <<EOF
---
id: SPEC-20251015-test
type: spec
---

# Feature Specification

## Functional Requirements
FR1: The system MUST...

## User Experience
The user should be able to...
EOF

  output=$(./scripts/ci/check-spec-lane.sh "$TEST_SPECS_DIR/test-spec.md")

  if echo "$output" | grep -q "spec"; then
    echo "✅ Test passed: Spec lane detected"
    return 0
  else
    echo "❌ Test failed: Spec lane not detected"
    echo "Output: $output"
    return 1
  fi
}

# Test: Dev lane content triggers dev lane
test_dev_lane_detection() {
  echo "Testing: Dev lane content should recommend dev lane"

  cat > "$TEST_SPECS_DIR/test-dev.md" <<EOF
# Quick Fix

Just need to update the button color and fix a typo.
EOF

  output=$(./scripts/ci/check-spec-lane.sh "$TEST_SPECS_DIR/test-dev.md")

  if echo "$output" | grep -q "dev"; then
    echo "✅ Test passed: Dev lane detected"
    return 0
  else
    echo "❌ Test failed: Dev lane not detected"
    echo "Output: $output"
    return 1
  fi
}

# Run all tests
main() {
  setup

  local failed=0

  test_spec_lane_detection || ((failed++))
  test_dev_lane_detection || ((failed++))

  teardown

  if [ $failed -eq 0 ]; then
    echo ""
    echo "✅ All tests passed!"
    exit 0
  else
    echo ""
    echo "❌ $failed test(s) failed"
    exit 1
  fi
}

main
```

**Files Created:**
- `tests/ci/check-spec-lane.test.sh`

**Acceptance Criteria:**
- ✅ Tests detect spec vs dev lane
- ✅ Tests verify output format
- ✅ Tests fail when script doesn't exist (TDD)

**Time Estimate:** 2 hours

---

### Task 2.3: Add Test Commands to package.json

**Objective:** Make tests runnable via pnpm

**Status:** ✅ **COMPLETED**

**Commands:**
```bash
# Edit package.json
```

**Implementation:**
Add to `package.json` scripts:
```json
{
  "scripts": {
    "test:ci-scripts": "bash tests/ci/validate-specs.test.sh && bash tests/ci/check-spec-lane.test.sh"
  }
}
```

**Files Modified:**
- `package.json`

**Acceptance Criteria:**
- ✅ Tests runnable via `pnpm run test:ci-scripts`
- ✅ Tests integrated with existing test suite

**Time Estimate:** 30 minutes

**Actual Time:** 30 minutes

---

### Task 2.4: Integrate Tests into Git Workflows

**Objective:** Ensure CI script tests run automatically in development workflows

**Status:** ✅ **COMPLETED**

**Implementation:**

**Pre-Push Hook Integration:**
- Added CI script tests before unit tests
- Fast validation (~2s) catches broken scripts early
- Blocks pushes if governance scripts fail
- Can bypass with `--no-verify` flag

**Slash Command Integration:**
- Updated `/git:prepare-pr` to include `pnpm test:ci-scripts`
- LLM automatically validates scripts before creating PRs
- Runs as first verification step

**Documentation Updated:**
- `README.md` - Added test:ci-scripts to testing section
- `TESTING_GUIDE.md` - Added workflow integration details
- Pre-push hook behavior documented

**Files Modified:**
- `scripts/git-hooks/pre-push`
- `.claude/commands/git/prepare-pr.md`
- `.git/hooks/pre-push` (reinstalled)
- `README.md`
- `docs/testing/TESTING_GUIDE.md`

**Acceptance Criteria:**
- ✅ Tests run in pre-push hook
- ✅ Tests included in `/git:prepare-pr` verification
- ✅ Documentation updated
- ✅ Both human and LLM workflows validate scripts

**Time Estimate:** 1 hour

**Actual Time:** 1.5 hours

---

## Phase 3: Implementation (Week 1-2, Days 6-10)

Implement scripts to satisfy tests.

### Task 3.1: Implement Spec Validation Script

**Objective:** Create working spec validation script

**Commands:**
```bash
mkdir -p scripts/ci
touch scripts/ci/validate-specs.sh
chmod +x scripts/ci/validate-specs.sh
```

**Implementation:**
```bash
#!/bin/bash
set -euo pipefail

# Source shared libraries
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/common.sh"
source "$SCRIPT_DIR/lib/error-reporter.sh"

# Help text
show_help() {
  cat <<EOF
Usage: validate-specs.sh [DIRECTORY]

Validate spec directory structure and content.

Arguments:
  DIRECTORY    Path to specs directory (default: specs/)

Options:
  -h, --help   Show this help message

Exit codes:
  0  All specs valid
  1  Validation failed

Examples:
  ./validate-specs.sh
  ./validate-specs.sh specs/
EOF
}

# Parse arguments
SPECS_DIR="${1:-specs}"

if [ "$SPECS_DIR" = "-h" ] || [ "$SPECS_DIR" = "--help" ]; then
  show_help
  exit 0
fi

# Check if specs directory exists
if [ ! -d "$SPECS_DIR" ]; then
  log_info "No specs directory found at: $SPECS_DIR"
  log_info "Skipping spec validation"
  exit 0
fi

# Validate each spec directory
validation_failed=0

for spec_dir in "$SPECS_DIR"/*/; do
  if [ -d "$spec_dir" ]; then
    spec_name=$(basename "$spec_dir")
    echo "Validating spec: $spec_name"

    # Check naming convention (should start with three digits)
    if ! echo "$spec_name" | grep -q "^[0-9]\{3\}-"; then
      report_ci_error "Spec directory $spec_name does not follow naming convention (###-name)" "spec-validation"
      validation_failed=1
      continue
    fi

    # Check for required files
    required_files=("README.md" "DESIGN.md")
    for file in "${required_files[@]}"; do
      if [ ! -f "$spec_dir$file" ]; then
        report_ci_error "Missing required file: $spec_dir$file" "spec-validation"
        validation_failed=1
        continue 2
      fi
    done

    # Validate README.md structure
    if ! grep -q "^# Spec" "$spec_dir/README.md"; then
      report_ci_error "Spec README.md missing proper header: $spec_dir/README.md" "spec-validation"
      validation_failed=1
      continue
    fi

    # Check for status metadata
    if ! grep -q "Status:" "$spec_dir/README.md"; then
      report_ci_error "Spec README.md missing status field: $spec_dir/README.md" "spec-validation"
      validation_failed=1
      continue
    fi

    log_info "Spec $spec_name structure validated"
  fi
done

if [ $validation_failed -eq 0 ]; then
  report_ci_success "All specs validated successfully"
  exit 0
else
  exit 1
fi
```

**Files Created:**
- `scripts/ci/validate-specs.sh`

**Acceptance Criteria:**
- ✅ All integration tests pass
- ✅ Script matches contract specification
- ✅ Error messages reference debugging guide
- ✅ Help text available

**Time Estimate:** 3 hours

---

### Task 3.2: Implement Spec Lane Check Script

**Objective:** Create working lane detection script

**Commands:**
```bash
touch scripts/ci/check-spec-lane.sh
chmod +x scripts/ci/check-spec-lane.sh
```

**Implementation:**
```bash
#!/bin/bash
set -euo pipefail

# Source shared libraries
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/common.sh"

# Help text
show_help() {
  cat <<EOF
Usage: check-spec-lane.sh [FILE]

Detect appropriate development lane based on spec content.

Arguments:
  FILE    Path to spec file (optional, auto-detects from git)

Options:
  -h, --help   Show this help message

Output:
  Recommended lane with reasoning

Examples:
  ./check-spec-lane.sh
  ./check-spec-lane.sh specs/SPEC-20251015-test.md
EOF
}

# Parse arguments
SPEC_FILE="${1:-}"

if [ "$SPEC_FILE" = "-h" ] || [ "$SPEC_FILE" = "--help" ]; then
  show_help
  exit 0
fi

# Auto-detect spec file from git changes if not provided
if [ -z "$SPEC_FILE" ]; then
  SPEC_FILE=$(git diff --name-only HEAD | grep "^specs/" | head -n 1)

  if [ -z "$SPEC_FILE" ]; then
    log_warning "No spec file changes detected"
    echo "Unable to detect lane - no spec changes found"
    exit 0
  fi
fi

# Check if file exists
if [ ! -f "$SPEC_FILE" ]; then
  log_error "Spec file not found: $SPEC_FILE"
  exit 1
fi

# Analyze spec content for lane indicators
spec_content=$(cat "$SPEC_FILE")

# Spec lane indicators
spec_indicators=(
  "Functional Requirements"
  "User Experience"
  "Success Criteria"
  "type: spec"
  "SPEC-[0-9]"
)

# Dev lane indicators
dev_indicators=(
  "Quick fix"
  "Simple change"
  "type: dev"
)

# Count indicators
spec_score=0
dev_score=0

for indicator in "${spec_indicators[@]}"; do
  if echo "$spec_content" | grep -qi "$indicator"; then
    ((spec_score++))
  fi
done

for indicator in "${dev_indicators[@]}"; do
  if echo "$spec_content" | grep -qi "$indicator"; then
    ((dev_score++))
  fi
done

# Determine lane
if [ $spec_score -gt $dev_score ]; then
  echo "Recommended lane: spec"
  echo "Reason: Content contains formal specification elements (FR, UX, success criteria)"
elif [ $dev_score -gt $spec_score ]; then
  echo "Recommended lane: dev"
  echo "Reason: Content indicates simple/quick development work"
else
  echo "Recommended lane: spec (default)"
  echo "Reason: Unable to determine from content, defaulting to spec lane for safety"
fi

exit 0
```

**Files Created:**
- `scripts/ci/check-spec-lane.sh`

**Acceptance Criteria:**
- ✅ All integration tests pass
- ✅ Script matches contract specification
- ✅ Clear lane recommendation with reasoning
- ✅ Help text available

**Time Estimate:** 2 hours

---

### Task 3.3: Implement AI Review Scraper Script

**Objective:** Create working review scraper script

**Commands:**
```bash
touch scripts/ci/scrape-ai-reviews.sh
chmod +x scripts/ci/scrape-ai-reviews.sh
```

**Implementation:**
```bash
#!/bin/bash
set -euo pipefail

# Source shared libraries
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/common.sh"
source "$SCRIPT_DIR/lib/error-reporter.sh"

# Help text
show_help() {
  cat <<EOF
Usage: scrape-ai-reviews.sh [PR_NUMBER]

Scrape AI-generated review comments from a PR.

Arguments:
  PR_NUMBER    Pull request number (optional, auto-detects from CI)

Options:
  -h, --help   Show this help message

Requirements:
  - GitHub CLI (gh) installed and authenticated

Output:
  JSON array of review comments

Examples:
  ./scrape-ai-reviews.sh
  ./scrape-ai-reviews.sh 123
EOF
}

# Parse arguments
PR_NUMBER="${1:-}"

if [ "$PR_NUMBER" = "-h" ] || [ "$PR_NUMBER" = "--help" ]; then
  show_help
  exit 0
fi

# Check for required tools
require_command "gh" "https://cli.github.com/"
require_command "jq" "https://jqlang.github.io/jq/"

# Auto-detect PR number from CI environment
if [ -z "$PR_NUMBER" ]; then
  if [ -n "${GITHUB_REF:-}" ]; then
    PR_NUMBER=$(echo "$GITHUB_REF" | grep -o "pull/[0-9]*" | grep -o "[0-9]*" || true)
  fi

  if [ -z "$PR_NUMBER" ]; then
    report_ci_error "Unable to detect PR number" "ai-review-scraping"
    exit 1
  fi
fi

# Fetch PR comments
log_info "Fetching comments for PR #$PR_NUMBER"

comments=$(gh pr view "$PR_NUMBER" --json comments --jq '.comments[] | select(.author.login == "coderabbitai" or .author.login == "github-actions[bot]") | {author: .author.login, body: .body, createdAt: .createdAt}')

if [ -z "$comments" ]; then
  log_warning "No AI review comments found for PR #$PR_NUMBER"
  echo "[]"
  exit 0
fi

# Output as JSON array
echo "$comments" | jq -s '.'

report_ci_success "Scraped AI reviews for PR #$PR_NUMBER"
exit 0
```

**Files Created:**
- `scripts/ci/scrape-ai-reviews.sh`

**Acceptance Criteria:**
- ✅ Script uses GitHub CLI
- ✅ JSON output format
- ✅ Error handling for auth issues
- ✅ Help text available

**Time Estimate:** 2 hours

---

### Task 3.4: Add Package Scripts

**Objective:** Make scripts runnable via pnpm

**Commands:**
```bash
# Edit package.json
```

**Implementation:**
Add to `package.json` scripts:
```json
{
  "scripts": {
    "specs:validate": "bash scripts/ci/validate-specs.sh",
    "specs:check-lane": "bash scripts/ci/check-spec-lane.sh",
    "ai:scrape-reviews": "bash scripts/ci/scrape-ai-reviews.sh",
    "ci:validate": "pnpm run specs:validate && pnpm run specs:check-lane"
  }
}
```

**Files Modified:**
- `package.json`

**Acceptance Criteria:**
- ✅ All scripts runnable via pnpm
- ✅ Scripts work locally and in CI
- ✅ CI validation combines multiple checks

**Time Estimate:** 30 minutes

---

### Task 3.5: Update spec-guard.yml Workflow

**Objective:** Replace inline bash with script calls

**Commands:**
```bash
# Edit .github/workflows/spec-guard.yml
```

**Implementation:**

Replace spec validation steps (lines 52-214) with:
```yaml
- name: Validate Spec Directory Structure
  run: pnpm run specs:validate

- name: Check Spec Lane
  if: github.event_name == 'pull_request'
  run: pnpm run specs:check-lane
```

**Files Modified:**
- `.github/workflows/spec-guard.yml`

**Before:** 369 lines
**After:** ~80 lines (77% reduction)

**Acceptance Criteria:**
- ✅ Workflow calls scripts instead of inline bash
- ✅ Error messages reference debugging guide
- ✅ CI passes with new approach
- ✅ Old implementation kept as comments for rollback

**Time Estimate:** 2 hours

---

### Task 3.6: Update ci.yml Workflow

**Objective:** Replace AI review scraper with script call

**Commands:**
```bash
# Edit .github/workflows/ci.yml
```

**Implementation:**

Replace AI review scraping steps (lines 88-147) with:
```yaml
- name: Scrape AI Reviews
  if: github.event_name == 'pull_request'
  run: pnpm run ai:scrape-reviews
  continue-on-error: true
```

**Files Modified:**
- `.github/workflows/ci.yml`

**Acceptance Criteria:**
- ✅ Workflow calls script instead of inline bash
- ✅ Graceful failure handling
- ✅ CI passes with new approach

**Time Estimate:** 1 hour

---

## Phase 4: Integration & Polish (Week 2, Days 11-14)

Complete Phase 1 features and begin Phase 2.

### Task 4.1: Make Heavy Workflows Optional

**Objective:** Convert telemetry and wiki workflows to manual trigger

**Commands:**
```bash
# Edit workflow files
```

**Implementation:**

**File:** `.github/workflows/telemetry-weekly.yml`
```yaml
on:
  workflow_dispatch:  # Manual trigger
  schedule:
    - cron: '0 0 * * 1'  # Weekly backup (optional)
```

**File:** `.github/workflows/wiki-publish.yml`
```yaml
on:
  workflow_dispatch:  # Manual trigger
  push:
    branches: [main]
    paths:
      - 'docs/wiki/**'  # Only on wiki changes
```

**Files Modified:**
- `.github/workflows/telemetry-weekly.yml`
- `.github/workflows/wiki-publish.yml`

**Acceptance Criteria:**
- ✅ Workflows only run when triggered manually
- ✅ Schedule remains as backup option
- ✅ Documentation explains manual triggering

**Time Estimate:** 1 hour

---

### Task 4.2: Create Composite Setup Action

**Objective:** Consolidate common CI setup steps

**Commands:**
```bash
mkdir -p .github/actions/setup
touch .github/actions/setup/action.yml
touch .github/actions/setup/README.md
```

**Implementation:**

**File:** `.github/actions/setup/action.yml`
```yaml
name: 'Setup Repository'
description: 'Common setup steps for CI jobs'

runs:
  using: "composite"
  steps:
    - name: Checkout repository
      uses: actions/checkout@v5
      with:
        fetch-depth: 0

    - name: Install pnpm
      uses: pnpm/action-setup@v4
      with:
        version: 9.12.0
        run_install: false

    - name: Setup Node.js
      uses: actions/setup-node@v5
      with:
        node-version: '20'
        cache: 'pnpm'

    - name: Install dependencies
      shell: bash
      run: pnpm install --frozen-lockfile
```

**File:** `.github/actions/setup/README.md`
```markdown
# Setup Action

Composite action for common repository setup steps.

## Usage

\`\`\`yaml
- uses: ./.github/actions/setup
\`\`\`

## What it does

1. Checks out repository with full history
2. Installs pnpm 9.12.0
3. Sets up Node.js 20 with pnpm cache
4. Installs dependencies with frozen lockfile

## Benefits

- Single source of truth for setup logic
- Consistent setup across all workflows
- Easier to update setup process
- Clearer failure context
```

**Files Created:**
- `.github/actions/setup/action.yml`
- `.github/actions/setup/README.md`

**Acceptance Criteria:**
- ✅ Composite action works across workflows
- ✅ Documentation complete
- ✅ Single source of truth established

**Time Estimate:** 2 hours

---

### Task 4.3: Consolidate CI Jobs

**Objective:** Reduce CI jobs from 6 to 3

**Commands:**
```bash
# Edit .github/workflows/ci.yml
```

**Implementation:**

**Before:** 6 jobs
- `doctor` (health checks)
- `docs-link-check` (documentation validation)
- `spec-gate` (spec validation)
- `ci` (build + test)
- `e2e` (end-to-end tests)
- `promote-gate` (promotion checks)

**After:** 3 jobs
```yaml
jobs:
  preflight:
    name: Preflight Checks
    runs-on: ubuntu-latest
    steps:
      - uses: ./.github/actions/setup

      - name: Run doctor checks
        run: pnpm run doctor

      - name: Check documentation links
        run: pnpm run docs:check

      - name: Validate specs
        run: pnpm run specs:validate

  build-test:
    name: Build and Test
    needs: preflight
    runs-on: ubuntu-latest
    steps:
      - uses: ./.github/actions/setup

      - name: Type check
        run: pnpm run typecheck

      - name: Lint
        run: pnpm run lint

      - name: Build
        run: pnpm run build

      - name: Unit tests
        run: pnpm run test:unit

  e2e:
    name: End-to-End Tests
    needs: build-test
    runs-on: ubuntu-latest
    steps:
      - uses: ./.github/actions/setup

      - name: E2E tests
        run: pnpm run test:e2e:ci
```

**Files Modified:**
- `.github/workflows/ci.yml`

**Acceptance Criteria:**
- ✅ Jobs consolidated from 6 to 3
- ✅ Clear dependency chain
- ✅ All workflows use composite action
- ✅ CI passes with new structure

**Time Estimate:** 3 hours

---

### Task 4.4: Update All Workflows to Use Composite Action

**Objective:** Replace setup steps across all workflows

**Commands:**
```bash
# Edit multiple workflow files
```

**Implementation:**

Replace setup steps in:
- `.github/workflows/spec-guard.yml`
- `.github/workflows/promote-gate.yml`
- `.github/workflows/doctor-recheck.yml`
- `.github/workflows/routing-contract.yml`

Replace:
```yaml
- name: Checkout repository
  uses: actions/checkout@v5
  # ... more setup steps
```

With:
```yaml
- uses: ./.github/actions/setup
```

**Files Modified:**
- Multiple workflow files

**Acceptance Criteria:**
- ✅ All workflows use composite action
- ✅ No duplicated setup code
- ✅ All workflows pass

**Time Estimate:** 2 hours

---

## Phase 5: Documentation & Release (Week 2-3, Days 15-16)

Complete documentation and prepare for release.

### Task 5.1: Update README with Workflow Instructions

**Objective:** Document manual workflow triggers

**Commands:**
```bash
# Edit README.md
```

**Implementation:**

Add section to README.md:
```markdown
## Manual Workflows

Some workflows are configured to run manually rather than automatically.

### Telemetry Report

Generate weekly telemetry report:
\`\`\`bash
gh workflow run telemetry-weekly.yml
\`\`\`

### Wiki Publishing

Publish documentation to Wiki:
\`\`\`bash
gh workflow run wiki-publish.yml
\`\`\`

### Local CI Validation

Run all CI checks locally before pushing:
\`\`\`bash
pnpm run ci:validate  # Specs validation
pnpm run typecheck    # TypeScript check
pnpm run lint         # Linting
pnpm run test         # All tests
pnpm run build        # Build check
\`\`\`

See [.github/DEBUGGING.md](.github/DEBUGGING.md) for debugging CI failures.
```

**Files Modified:**
- `README.md`

**Acceptance Criteria:**
- ✅ Manual workflows documented
- ✅ Local validation commands listed
- ✅ Debugging guide referenced

**Time Estimate:** 1 hour

---

### Task 5.2: Create Scripts Documentation

**Objective:** Document CI scripts for maintainers

**Commands:**
```bash
touch scripts/ci/README.md
```

**Implementation:**

**File:** `scripts/ci/README.md`
```markdown
# CI Scripts

Standalone scripts for CI validation that can be run locally.

## Scripts

### validate-specs.sh

Validates spec directory structure and content.

**Usage:**
\`\`\`bash
./scripts/ci/validate-specs.sh [directory]
pnpm run specs:validate
\`\`\`

**What it checks:**
- Spec naming convention (###-name)
- Required files (README.md, DESIGN.md)
- README structure (header, status)

**Exit codes:**
- 0: All specs valid
- 1: Validation failed

---

### check-spec-lane.sh

Detects appropriate development lane based on spec content.

**Usage:**
\`\`\`bash
./scripts/ci/check-spec-lane.sh [file]
pnpm run specs:check-lane
\`\`\`

**Output:**
- Recommended lane (spec or dev)
- Reasoning for recommendation

**Exit codes:**
- 0: Always (informational)

---

### scrape-ai-reviews.sh

Scrapes AI-generated review comments from PRs.

**Usage:**
\`\`\`bash
./scripts/ci/scrape-ai-reviews.sh [pr_number]
pnpm run ai:scrape-reviews
\`\`\`

**Requirements:**
- GitHub CLI installed and authenticated

**Output:**
- JSON array of review comments

**Exit codes:**
- 0: Scrape successful
- 1: Scrape failed

---

## Shared Libraries

### lib/common.sh

Common utility functions:
- \`log_info()\` - Success messages
- \`log_error()\` - Error messages
- \`log_warning()\` - Warning messages
- \`require_command()\` - Check for required tools
- \`require_directory()\` - Validate directories

### lib/error-reporter.sh

Standardized error reporting:
- \`report_ci_error()\` - Report error with debugging guide reference
- \`report_ci_success()\` - Report success

Automatically detects CI vs local environment.

---

## Testing

Run integration tests:
\`\`\`bash
pnpm run test:ci-scripts
\`\`\`

Individual test files:
- \`tests/ci/validate-specs.test.sh\`
- \`tests/ci/check-spec-lane.test.sh\`

---

## Development

### Adding New Scripts

1. Create script in \`scripts/ci/\`
2. Add execute permissions: \`chmod +x script.sh\`
3. Use shared libraries from \`lib/\`
4. Add package.json script entry
5. Create integration tests in \`tests/ci/\`
6. Document in this README

### Script Template

\`\`\`bash
#!/bin/bash
set -euo pipefail

# Source shared libraries
SCRIPT_DIR="\$(cd "\$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
source "\$SCRIPT_DIR/lib/common.sh"
source "\$SCRIPT_DIR/lib/error-reporter.sh"

# Help text
show_help() {
  cat <<EOF
Usage: script.sh [OPTIONS]

Description of what script does.

Options:
  -h, --help   Show this help message

Examples:
  ./script.sh
EOF
}

# Script logic here
```

---

## Troubleshooting

See [.github/DEBUGGING.md](../../.github/DEBUGGING.md) for CI debugging help.
```

**Files Created:**
- `scripts/ci/README.md`

**Acceptance Criteria:**
- ✅ All scripts documented
- ✅ Usage examples provided
- ✅ Testing instructions included
- ✅ Development guidelines provided

**Time Estimate:** 2 hours

---

### Task 5.3: Measure and Document Token Savings

**Objective:** Establish baseline and measure Phase 1 savings

**Commands:**
```bash
touch scratch/token-baseline.md
```

**Implementation:**

**File:** `scratch/token-baseline.md`
```markdown
# Token Consumption Measurement

## Baseline (Before Implementation)

**Measurement Date:** 2025-10-15

### Context Size
- Workflow YAML: 106KB
- Documentation (Wiki + micro-lessons): 324KB
- AI sessions per month: ~48
- Average tokens per session: ~50K

### Monthly Consumption
- Total: ~2.4M tokens/month
- CI debugging (8 failures): ~400K tokens
- Development sessions (40): ~2M tokens

---

## Phase 1 Results (Workflow Simplification)

**Implementation Date:** [TBD]

### Context Reduction
- ✅ .claudeignore created (excludes 324KB docs)
- ✅ Workflow YAML: 106KB → [Measure after implementation]
- ✅ Debugging guide created (reduces context reading)

### Expected Savings
- Context exclusion: 15K tokens/session × 48 = 720K/month
- Workflow simplification: ~10K tokens/failure × 8 = 80K/month
- **Total Expected:** ~800K tokens/month (33% reduction)

### Actual Savings
- [Measure after 1 month of usage]
- [Compare against baseline]
- [Adjust Phase 2 estimates]

---

## Next Measurements

- **Phase 2:** After CI job consolidation
- **Phase 3:** After command optimization
- **Phase 4:** After documentation cleanup
- **Phase 5:** Final measurement and annual projection
```

**Files Created:**
- `scratch/token-baseline.md`

**Acceptance Criteria:**
- ✅ Baseline documented
- ✅ Expected savings calculated
- ✅ Measurement plan established

**Time Estimate:** 1 hour

---

### Task 5.4: Create Pull Request

**Objective:** Submit Phase 1 implementation for review

**Commands:**
```bash
git add .
git commit -m "feat(ci): Phase 1 - Workflow simplification and local validation

- Extract inline bash to standalone scripts
- Create debugging guide for CI failures
- Make heavy workflows optional (manual trigger)
- Enable 100% local CI validation
- Add integration tests for all scripts

Reduces workflow YAML by 77% (369 → 80 lines)
Enables local debugging without CI
Establishes foundation for Phase 2-5

Refs #142, #143"

gh pr create --title "feat(ci): Phase 1 - Workflow Simplification (Issue #142)" \
  --body "See commit message for details" \
  --base main
```

**Files Changed:**
- `scripts/ci/` (new scripts)
- `.github/DEBUGGING.md` (new)
- `.github/workflows/spec-guard.yml` (simplified)
- `.github/workflows/ci.yml` (simplified)
- `.github/workflows/telemetry-weekly.yml` (manual trigger)
- `.github/workflows/wiki-publish.yml` (manual trigger)
- `.github/actions/setup/` (composite action)
- `tests/ci/` (integration tests)
- `package.json` (new scripts)
- `README.md` (documentation)

**Acceptance Criteria:**
- ✅ All tests pass locally
- ✅ All tests pass in CI
- ✅ PR description complete
- ✅ References parent issues

**Time Estimate:** 1 hour

---

## Summary

### Total Time Estimate: 40-45 hours (2-3 weeks)

**Phase 1: Contracts & Interfaces** - 6 hours
**Phase 2: Test Foundation** - 6 hours
**Phase 3: Implementation** - 13 hours
**Phase 4: Integration & Polish** - 9 hours
**Phase 5: Documentation & Release** - 5 hours

### Key Deliverables

- ✅ 3 standalone CI scripts with tests
- ✅ Debugging guide for CI failures
- ✅ Composite setup action
- ✅ Consolidated CI jobs (6 → 3)
- ✅ 77% workflow YAML reduction
- ✅ 100% local CI validation
- ✅ Documentation and measurement

### Success Metrics (Phase 1 Only)

| Metric | Baseline | Target | Achieved |
|--------|----------|--------|----------|
| Workflow YAML | 106KB | 50KB | [TBD] |
| Local validation | 0% | 100% | [TBD] |
| CI jobs | 6 | 3 | [TBD] |
| Token savings | 0 | 800K/month | [TBD] |

### Branch Strategy

**Feature Branch:** `feature/142-llm-context-optimization`
**Base Branch:** `main`
**PR Strategy:** Single PR for Phase 1, separate PRs for Phases 2-5

### Next Steps After Phase 1

1. **Measure Results:** Track token savings for 1 month
2. **Gather Feedback:** Survey team on debugging experience
3. **Adjust Estimates:** Update Phase 2-5 estimates based on actual results
4. **Plan Phase 2:** Begin command optimization work

---

## Implementation Commands

### Create Feature Branch
```bash
git checkout main
git pull origin main
git checkout -b feature/142-llm-context-optimization
```

### Run Tests Locally
```bash
# Run all tests
pnpm run test
pnpm run test:ci-scripts

# Run specific tests
bash tests/ci/validate-specs.test.sh
bash tests/ci/check-spec-lane.test.sh

# Run CI validation
pnpm run ci:validate
pnpm run typecheck
pnpm run lint
pnpm run build
```

### Commit Changes
```bash
git add .
git commit -m "feat(ci): Phase 1 - Workflow simplification

- Extract inline bash to standalone scripts
- Create debugging guide
- Make heavy workflows optional
- Enable local CI validation

Refs #142, #143"
```

### Create Pull Request
```bash
gh pr create --title "feat(ci): Phase 1 - Workflow Simplification (Issue #142)" \
  --body "$(cat <<'EOF'
## Summary

Implements Phase 1 of LLM context optimization:
- Extract inline bash to standalone scripts
- Create debugging guide for CI failures
- Make heavy workflows optional (manual trigger)
- Enable 100% local CI validation

## Changes

### New Scripts
- `scripts/ci/validate-specs.sh` - Spec validation
- `scripts/ci/check-spec-lane.sh` - Lane detection
- `scripts/ci/scrape-ai-reviews.sh` - Review scraping
- `scripts/ci/lib/common.sh` - Shared utilities
- `scripts/ci/lib/error-reporter.sh` - Error reporting

### New Documentation
- `.github/DEBUGGING.md` - CI debugging guide
- `.github/actions/setup/` - Composite setup action
- `scripts/ci/README.md` - Scripts documentation

### Modified Workflows
- `spec-guard.yml` - 369 lines → 80 lines (77% reduction)
- `ci.yml` - Consolidated jobs (6 → 3)
- `telemetry-weekly.yml` - Manual trigger only
- `wiki-publish.yml` - Manual trigger only

### Tests
- `tests/ci/validate-specs.test.sh` - Spec validation tests
- `tests/ci/check-spec-lane.test.sh` - Lane detection tests

## Testing

✅ All integration tests pass
✅ Local validation commands work
✅ CI workflows pass with new structure

## Metrics

- **Workflow YAML reduction:** 77% (369 → 80 lines)
- **Local validation:** 100% of CI checks runnable locally
- **CI jobs:** Reduced from 6 to 3
- **Expected token savings:** ~800K/month

## Related

- Parent Issue: #142
- Spec Issue: #143
- Spec: SPEC-20251015-llm-context-optimization
- Plan: PLAN-20251015-llm-context-optimization

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)" \
  --base main \
  --label "ci,enhancement"
```

---

## Rollback Plan

If Phase 1 implementation causes issues:

### Quick Rollback (Workflow Files)

Workflow files have old implementation commented out:
```yaml
# Old implementation (commented, ready to restore)
# - name: Validate specs (OLD)
#   run: |
#     [... old inline bash ...]

# New implementation
- name: Validate specs
  run: ./scripts/ci/validate-specs.sh
```

To rollback:
1. Uncomment old implementation
2. Comment out new implementation
3. Push changes
4. CI uses old approach immediately

### Full Rollback (Branch Revert)

```bash
git checkout main
git revert HEAD  # Revert merge commit
git push origin main
```

---

## Questions for Human Review

Before beginning implementation, please clarify:

1. **Scope Confirmation:** Is Phase 1 (workflow simplification) the right starting point, or should we begin with a different phase?

2. **Testing Depth:** Are bash integration tests sufficient, or should we also add TypeScript-based tests?

3. **Rollout Strategy:** Should we implement in one PR or break into smaller PRs (scripts → workflows → docs)?

4. **Measurement:** Do we have access to Claude usage logs to measure token consumption, or should we use proxy metrics?

5. **Command Consolidation:** Should Phase 3 (command optimization) be prioritized higher given the 600K token/year savings?

---

**Ready to begin implementation once human review is complete.**