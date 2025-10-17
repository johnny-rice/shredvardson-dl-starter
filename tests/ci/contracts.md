# CI Workflow Testing Contracts

This document defines the expected behavior for all CI scripts, establishing contracts that implementations must satisfy.

---

## Spec Validation Contract

**Script:** `scripts/ci/validate-specs.sh`
**Command:** `pnpm run specs:validate`

### Input
- **Spec directory path** (default: `specs/`)
- **Optional:** `--help` flag

### Output
- **Exit code 0:** All specs valid
- **Exit code 1:** Validation failed
- **STDOUT:** Validation messages with ✅/❌ prefixes
- **STDERR:** Error details referencing debugging guide

### Behavior
- Checks spec directory naming (###-name format)
- Validates required files (README.md, DESIGN.md)
- Validates README structure (header, status field)
- Identical behavior in CI and local environments
- Skips validation if specs directory doesn't exist (exit 0)

### Error Messages
All errors must reference `.github/DEBUGGING.md#spec-validation`

---

## Spec Lane Check Contract

**Script:** `scripts/ci/check-spec-lane.sh`
**Command:** `pnpm run specs:check-lane`

### Input
- **Spec file path** (optional, auto-detects from git changes)
- **Optional:** `--help` flag

### Output
- **Exit code 0:** Always (informational only)
- **STDOUT:** Lane recommendation with reasoning
- **Format:** "Recommended lane: [spec|dev] - Reason: [explanation]"

### Behavior
- Analyzes spec content for lane indicators
- Outputs clear lane choice explanation
- Identical behavior in CI and local environments
- Handles missing spec file gracefully

### Lane Indicators
**Spec Lane:**
- "Functional Requirements"
- "User Experience"
- "Success Criteria"
- "type: spec"
- YAML frontmatter with `type: spec`

**Dev Lane:**
- "Quick fix"
- "Simple change"
- "type: dev"

---

## AI Review Scraper Contract

**Script:** `scripts/ci/scrape-ai-reviews.sh`
**Command:** `pnpm run ai:scrape-reviews`

### Input
- **PR number** (from environment or argument)
- **GitHub token** (from environment)

### Output
- **Exit code 0:** Scrape successful
- **Exit code 1:** Scrape failed (missing auth, PR not found)
- **STDOUT:** JSON array of review comments
- **STDERR:** Error details with debugging guidance

### Behavior
- Uses GH CLI to fetch PR comments
- Filters for AI-generated reviews (coderabbitai, github-actions[bot])
- Structured JSON output for parsing
- Clear error messages for auth/permission issues

### JSON Output Format
```json
[
  {
    "author": "coderabbitai",
    "body": "Review comment text",
    "createdAt": "2025-10-15T12:00:00Z"
  }
]
```

### Error Messages
All errors must reference `.github/DEBUGGING.md#ai-review-scraping`

---

## Shared Library Contracts

### common.sh

**Functions:**
- `log_info(message)` - Success messages with ✅ prefix
- `log_error(message)` - Error messages with ❌ prefix (to STDERR)
- `log_warning(message)` - Warning messages with ⚠️  prefix
- `require_command(cmd, install_url)` - Check for required tools, exit 1 if missing
- `require_directory(dir)` - Validate directory exists, exit 1 if missing

**Behavior:**
- Colored output in terminal
- Exit codes: 0 = success, 1 = error
- All output uses consistent formatting

### error-reporter.sh

**Functions:**
- `report_ci_error(message, guide_section)` - Report error with debugging guide reference
- `report_ci_success(message)` - Report success

**Behavior:**
- Detects CI environment (`$GITHUB_ACTIONS`)
- Uses GitHub Actions annotations in CI (`::error::`, `::notice::`)
- Uses colored output in local environment
- Always references debugging guide sections

---

## Contract Validation

All implementations must:
1. ✅ Match input/output specifications exactly
2. ✅ Use defined exit codes consistently
3. ✅ Reference debugging guide in all errors
4. ✅ Work identically in CI and local environments
5. ✅ Include `--help` flag with usage information
6. ✅ Use shared library functions (no ad-hoc logging)

---

## Testing Requirements

Each script must have:
1. Integration tests covering valid and invalid cases
2. Fixtures for test data
3. Cleanup after test execution
4. Tests that fail when script doesn't exist (TDD)

---

**Version:** 1.0.0
**Last Updated:** 2025-10-15
**Related:** [TASK-20251015-llm-context-optimization.md](../../tasks/TASK-20251015-llm-context-optimization.md)