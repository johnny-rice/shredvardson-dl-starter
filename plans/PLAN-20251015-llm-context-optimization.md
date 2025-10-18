---
id: PLAN-20251015-llm-context-optimization
type: plan
parentId: SPEC-20251015-llm-context-optimization
issue: 142
spec: SPEC-20251015-llm-context-optimization
source: https://github.com/Shredvardson/dl-starter/issues/142
---

# Implementation Plan: LLM Context Optimization

**Specification:** [SPEC-20251015-llm-context-optimization.md](../specs/SPEC-20251015-llm-context-optimization.md)
**Parent Issue:** [#142](https://github.com/Shredvardson/dl-starter/issues/142)
**Spec Issue:** [#143](https://github.com/Shredvardson/dl-starter/issues/143)

---

## Architecture Decision

This implementation aligns with the project's existing infrastructure:

**Technology Alignment:**

- ✅ **Build System:** Turbo monorepo (unchanged)
- ✅ **Package Manager:** pnpm 9.12.0 (unchanged)
- ✅ **CI/CD:** GitHub Actions (enhanced, not replaced)
- ✅ **Scripting:** Bash + TypeScript via tsx (existing pattern)
- ✅ **Documentation:** Markdown (existing pattern)

**Key Design Decisions:**

1. **Script Extraction Pattern:**
   - Extract inline bash from workflows → `scripts/ci/` directory
   - Make scripts executable and documented
   - Keep workflows as thin orchestration layers
   - Rationale: Enables local debugging, reduces token consumption, improves maintainability

2. **Composite Action Pattern:**
   - Create reusable GitHub Actions in `.github/actions/`
   - Consolidate repeated setup logic
   - Single source of truth for common operations
   - Rationale: DRY principle, clearer failure context, easier updates

3. **Error Message Enhancement:**
   - Add debugging guide at `.github/DEBUGGING.md`
   - Use GitHub Actions `::error::` annotations
   - Reference guide sections in error messages
   - Rationale: Self-service debugging, reduced context reading, faster resolution

4. **Context Exclusion Strategy:**
   - Use `.claudeignore` for AI assistant context filtering
   - Preserve all files for external documentation consumers
   - Balance between token savings and information availability
   - Rationale: Non-breaking change, immediate savings, easy to adjust

---

## File Changes Required

### Phase 1: Workflow Simplification

#### New Files (Scripts)

```
scripts/ci/
├── validate-specs.sh          # Extract from spec-guard.yml lines 52-214
├── check-spec-lane.sh          # Extract from spec-guard.yml lines 326-368
├── scrape-ai-reviews.sh        # Extract from ci.yml lines 88-147
├── validate-telemetry.sh       # Extract telemetry validation logic
├── README.md                   # Scripts documentation
└── lib/
    ├── common.sh               # Shared helper functions
    └── error-reporter.sh       # Standardized error formatting
```

#### Modified Files (Workflows)

```
.github/workflows/
├── spec-guard.yml              # 369 lines → ~80 lines (77% reduction)
├── ci.yml                      # Simplify inline bash
├── telemetry-weekly.yml        # Change to workflow_dispatch
└── wiki-publish.yml            # Change to workflow_dispatch
```

#### New Files (Documentation)

```
.github/
└── DEBUGGING.md                # CI debugging guide with common patterns
```

#### Modified Files (Package Scripts)

```
package.json                    # Add specs:validate, ci:validate commands
```

### Phase 2: CI Job Consolidation

#### New Files (Composite Actions)

```
.github/actions/
└── setup/
    ├── action.yml              # Composite setup action
    └── README.md               # Action documentation
```

#### Modified Files (Workflows)

```
.github/workflows/
├── ci.yml                      # Consolidate jobs: 6 → 3
├── spec-guard.yml              # Use composite setup action
├── promote-gate.yml            # Use composite setup action
└── doctor-recheck.yml          # Use composite setup action
```

### Phase 3: Command Optimization

#### Modified Files (Commands)

```
.claude/commands/
├── git/
│   ├── branch.md               # Extract shared patterns
│   ├── fix-pr.md               # Extract shared patterns
│   └── shared/
│       ├── common-workflow.md  # Shared git workflow patterns
│       └── error-handling.md   # Shared error handling
└── QUICK_REFERENCE.md          # New command quick reference
```

### Phase 4: Documentation Cleanup

#### Modified Files

```
docs/
├── llm/                        # Audit and archive stale content
├── recipes/                    # Consolidate duplicates
└── decisions/                  # Archive implemented ADRs

docs/archive/                   # New archive directory for historical docs
```

#### Updated Files

```
.claudeignore                   # Update exclusion patterns based on audit
README.md                       # Update Wiki links for external docs
```

### Phase 5: Structural Improvements

#### Analysis Artifacts (Temporary)

```
scratch/
├── pr-analysis.md              # PR coupling analysis results
├── generated-files.md          # Generated file inventory
└── modularity-recommendations.md  # Module boundary suggestions
```

---

## Implementation Strategy

### Phase 1: Workflow Simplification (Weeks 1-2)

**Objective:** Reduce workflow YAML by 50% and enable local CI validation

#### Step 1.1: Extract Spec Validation Script

**Files:** `scripts/ci/validate-specs.sh`, `spec-guard.yml`

**Implementation:**

1. Create `scripts/ci/validate-specs.sh` with:
   - All validation logic from `spec-guard.yml` lines 52-214
   - Executable permissions (`chmod +x`)
   - Proper error handling and exit codes
   - Colored output for readability
   - Help text (`--help` flag)

2. Update `spec-guard.yml` to:

   ```yaml
   - name: Validate Spec Directory Structure
     run: ./scripts/ci/validate-specs.sh

   - name: Surface Spec Validation Failure
     if: failure()
     run: |
       echo "::error::Spec validation failed. See .github/DEBUGGING.md#spec-validation"
       exit 1
   ```

3. Add `package.json` script:

   ```json
   "specs:validate": "bash scripts/ci/validate-specs.sh"
   ```

4. Test locally: `pnpm run specs:validate`

**Acceptance Criteria:**

- ✅ Script runs identically in CI and locally
- ✅ Error messages reference debugging guide
- ✅ Workflow YAML reduced from 369 lines → ~200 lines

#### Step 1.2: Extract Spec Lane Check Script

**Files:** `scripts/ci/check-spec-lane.sh`, `spec-guard.yml`

**Implementation:**

1. Create `scripts/ci/check-spec-lane.sh` with:
   - Logic from `spec-guard.yml` lines 326-368
   - Lane detection algorithm
   - Clear output explaining lane choice

2. Update `spec-guard.yml` to call script

3. Add `package.json` script:
   ```json
   "specs:check-lane": "bash scripts/ci/check-spec-lane.sh"
   ```

**Acceptance Criteria:**

- ✅ Lane detection works locally and in CI
- ✅ Workflow YAML reduced to ~80 lines (from 369)
- ✅ Developers can verify lane before pushing

#### Step 1.3: Extract AI Review Scraper Script

**Files:** `scripts/ci/scrape-ai-reviews.sh`, `ci.yml`

**Implementation:**

1. Create `scripts/ci/scrape-ai-reviews.sh` with:
   - Logic from `ci.yml` lines 88-147
   - GH CLI integration for PR comments
   - Structured output format

2. Update `ci.yml` to call script

3. Add `package.json` script:
   ```json
   "ai:scrape-reviews": "bash scripts/ci/scrape-ai-reviews.sh"
   ```

**Acceptance Criteria:**

- ✅ Script can run locally with GH CLI auth
- ✅ Workflow YAML simplified
- ✅ Local testing of review scraping enabled

#### Step 1.4: Create Debugging Guide

**Files:** `.github/DEBUGGING.md`

**Implementation:**

1. Create debugging guide with sections:

   ```markdown
   # CI Debugging Guide

   ## Spec Validation Failures

   **Error:** "Spec directory X does not follow naming convention"
   **Local test:** `pnpm run specs:validate`
   **Fix:** Rename spec directory to format `###-name`

   ## TypeScript Errors

   **Error:** "Type check failed"
   **Local test:** `pnpm run typecheck`
   **Fix:** Run `pnpm run typecheck` and fix reported errors

   ## Test Failures

   **Error:** "Test suite failed"
   **Local test:** `pnpm run test`
   **Fix:** Run `pnpm run test` locally to see full output

   [... more sections for each CI check ...]
   ```

2. Update all workflow error messages to reference guide:
   ```yaml
   echo "::error::Check failed. See .github/DEBUGGING.md#section-name"
   ```

**Acceptance Criteria:**

- ✅ Every CI check has debugging guide section
- ✅ All workflow errors reference guide
- ✅ Local test commands documented
- ✅ Common fixes documented

#### Step 1.5: Make Heavy Workflows Optional

**Files:** `telemetry-weekly.yml`, `wiki-publish.yml`, `README.md`

**Implementation:**

1. Update `telemetry-weekly.yml`:

   ```yaml
   on:
     workflow_dispatch: # Manual trigger only
     schedule:
       - cron: '0 0 * * 1' # Keep weekly schedule but optional
   ```

2. Update `wiki-publish.yml`:

   ```yaml
   on:
     workflow_dispatch:
     push:
       branches: [main]
       paths:
         - 'docs/wiki/**' # Only trigger on wiki changes
   ```

3. Update README with manual trigger instructions:

   ```markdown
   ### Manual Workflows

   **Telemetry Report:**
   ```

   gh workflow run telemetry-weekly.yml

   ```

   **Wiki Publishing:**
   ```

   gh workflow run wiki-publish.yml

   ```

   ```

**Acceptance Criteria:**

- ✅ Workflows only run when triggered manually or by relevant changes
- ✅ Documentation explains how to trigger
- ✅ Regular CI runs are unaffected

### Phase 2: CI Job Consolidation (Week 3)

**Objective:** Reduce setup overhead and improve job organization

#### Step 2.1: Create Composite Setup Action

**Files:** `.github/actions/setup/action.yml`

**Implementation:**

1. Create composite action:

   ```yaml
   name: 'Setup Repository'
   description: 'Common setup steps for CI jobs'

   runs:
     using: 'composite'
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

2. Create documentation:

   ````markdown
   # Setup Action

   Composite action for common repository setup steps.

   ## Usage

   ```yaml
   - uses: ./.github/actions/setup
   ```
   ````

   ## What it does
   - Checks out repository with full history
   - Installs pnpm 9.12.0
   - Sets up Node.js 20 with pnpm cache
   - Installs dependencies with frozen lockfile

   ```

   ```

**Acceptance Criteria:**

- ✅ Action works across all workflows
- ✅ Single source of truth for setup logic
- ✅ Documented usage

#### Step 2.2: Consolidate CI Jobs

**Files:** `ci.yml`

**Implementation:**

1. **Before:** 6 jobs
   - `doctor` (health checks)
   - `docs-link-check` (documentation validation)
   - `spec-gate` (spec validation)
   - `ci` (build + test)
   - `e2e` (end-to-end tests)
   - `promote-gate` (promotion checks)

2. **After:** 3 jobs
   - `preflight` (doctor + docs + spec-gate combined)
   - `build-test` (current ci job, renamed)
   - `e2e` (unchanged, for caching benefits)

3. Update job dependencies:

   ```yaml
   build-test:
     needs: preflight

   e2e:
     needs: build-test
   ```

4. Update all jobs to use composite action:
   ```yaml
   - uses: ./.github/actions/setup
   ```

**Acceptance Criteria:**

- ✅ Fewer job boundaries
- ✅ Clear dependency chain
- ✅ Faster CI runs (less setup/teardown)
- ✅ All workflows use composite action

### Phase 3: Command Optimization (Week 4)

**Objective:** Reduce command file size and improve discoverability

#### Step 3.1: Extract Shared Git Patterns

**Files:** `.claude/commands/git/shared/common-workflow.md`, `git/branch.md`, `git/fix-pr.md`

**Implementation:**

1. Analyze overlap between `git/branch.md` and `git/fix-pr.md`
2. Extract common patterns to `git/shared/common-workflow.md`:
   - Branch naming conventions
   - Commit message format
   - PR description template
   - Git safety checks

3. Update `git/branch.md` and `git/fix-pr.md` to reference shared patterns:

   ```markdown
   ## Git Workflow

   See [common-workflow.md](shared/common-workflow.md) for:

   - Branch naming: `{lane}/{issue-number}-{kebab-case-description}`
   - Commit format: `{type}({scope}): {description}`
   - PR templates
   ```

**Acceptance Criteria:**

- ✅ Combined size: 475 lines → ~300 lines (37% reduction)
- ✅ No duplicated content
- ✅ Commands still fully functional
- ✅ Shared patterns documented once

#### Step 3.2: Create Command Quick Reference

**Files:** `.claude/commands/QUICK_REFERENCE.md`

**Implementation:**

1. Create quick reference with table format:

   ```markdown
   # Command Quick Reference

   ## Spec Lane Commands

   | Command         | Purpose                      | When to Use                  |
   | --------------- | ---------------------------- | ---------------------------- |
   | `/spec:specify` | Create feature specification | Starting new feature work    |
   | `/spec:plan`    | Create implementation plan   | After specification approved |
   | `/spec:tasks`   | Generate task breakdown      | Ready to implement           |

   ## Git Commands

   | Command           | Purpose                 | When to Use            |
   | ----------------- | ----------------------- | ---------------------- |
   | `/git:branch`     | Create feature branch   | Starting work on issue |
   | `/git:fix-pr`     | Apply PR feedback fixes | After PR review        |
   | `/git:prepare-pr` | Prepare PR for review   | Before creating PR     |

   [... continue for all commands ...]
   ```

2. Add links to full command files for details

**Acceptance Criteria:**

- ✅ All commands documented with 1-line summary
- ✅ Use cases clearly explained
- ✅ Links to full documentation
- ✅ Easy to scan and find right command

### Phase 4: Documentation Cleanup (Week 5)

**Objective:** Reduce documentation size by archiving stale content

#### Step 4.1: Audit and Archive LLM Docs

**Files:** `docs/llm/*`, `docs/archive/llm/*`

**Implementation:**

1. Review each file in `docs/llm/` for:
   - Last update date
   - Current relevance
   - Duplication with other docs

2. Move stale content to `docs/archive/llm/`:

   ```bash
   mkdir -p docs/archive/llm
   mv docs/llm/outdated-guide.md docs/archive/llm/
   ```

3. Update `.claudeignore` to exclude archive:

   ```
   # Archived documentation (not relevant for current development)
   docs/archive/
   ```

4. Update README with archive policy:

   ```markdown
   ## Documentation Structure

   - `docs/` - Active documentation for current development
   - `docs/archive/` - Historical documentation preserved for reference
   - `docs/wiki/` - Public documentation for external LLMs (excluded from AI context)
   ```

**Acceptance Criteria:**

- ✅ `docs/llm/` size reduced by ~30%
- ✅ Archive directory created and documented
- ✅ `.claudeignore` updated
- ✅ No loss of historical information

#### Step 4.2: Consolidate Recipes

**Files:** `docs/recipes/*`

**Implementation:**

1. Review recipes for duplicates:
   - Similar patterns documented multiple times
   - Overlapping content between files

2. Consolidate related recipes:

   ```bash
   # Example: Merge similar testing recipes
   cat docs/recipes/testing-pattern-1.md docs/recipes/testing-pattern-2.md > docs/recipes/testing-patterns.md
   rm docs/recipes/testing-pattern-{1,2}.md
   ```

3. Update cross-references in other docs

**Acceptance Criteria:**

- ✅ `docs/recipes/` size reduced by ~20%
- ✅ No duplicated content
- ✅ All recipes still accessible
- ✅ Cross-references updated

#### Step 4.3: Archive Implemented ADRs

**Files:** `docs/decisions/*`, `docs/archive/decisions/*`

**Implementation:**

1. Review ADRs for implementation status
2. Move fully implemented ADRs to archive:
   - Keep recent ADRs (last 6 months)
   - Keep ADRs with ongoing implications
   - Archive older, fully implemented ADRs

3. Add status field to remaining ADRs:

   ```markdown
   # ADR-001: Example Decision

   **Status:** Implemented (2024-06-15)
   **Archive Date:** 2025-01-15 (if applicable)
   ```

**Acceptance Criteria:**

- ✅ Only active/recent ADRs in `docs/decisions/`
- ✅ Historical ADRs preserved in archive
- ✅ Status tracking added

### Phase 5: Structural Improvements (Week 6)

**Objective:** Analyze and address structural coupling issues

#### Step 5.1: PR Coupling Analysis

**Files:** `scratch/pr-analysis.md`

**Implementation:**

1. Analyze recent PRs (last 20) for file change patterns:

   ```bash
   gh pr list --limit 20 --state merged --json number,files \
     --jq '.[] | {pr: .number, files: [.files[].path]}' > scratch/pr-raw-data.json
   ```

2. Identify frequently co-changing files:

   ```bash
   # Script to analyze coupling
   tsx scripts/analyze-pr-coupling.ts
   ```

3. Document findings in `scratch/pr-analysis.md`:

   ```markdown
   # PR Coupling Analysis

   ## Files That Always Change Together

   - `package.json` + `pnpm-lock.yaml` (expected)
   - `apps/web/app/layout.tsx` + `packages/ui/src/theme.tsx` (coupling?)

   ## Recommendations

   1. Consider extracting shared theme logic
   2. Review component boundaries
   3. Potential for better modularity
   ```

**Acceptance Criteria:**

- ✅ Analysis of 20+ recent PRs
- ✅ Coupling patterns identified
- ✅ Recommendations documented
- ✅ No immediate code changes (analysis only)

#### Step 5.2: Generated File Inventory

**Files:** `scratch/generated-files.md`, `.gitignore`

**Implementation:**

1. Identify all generated files in repository:

   ```bash
   # Common patterns
   find . -name "*.generated.*" -type f
   find . -name "*-generated.*" -type f
   ```

2. Document which files should be generated vs. committed:

   ```markdown
   # Generated File Inventory

   ## Currently Generated and Committed

   - `apps/web/types/database.types.ts` (Supabase types)
   - `docs/commands/index.json` (Command inventory)

   ## Should These Be Generated?

   - Evaluate if types should be generated in CI
   - Consider `.gitignore` patterns
   ```

3. Update `.gitignore` if appropriate:
   ```gitignore
   # Generated files (rebuild with npm scripts)
   *.generated.ts
   *-generated.ts
   ```

**Acceptance Criteria:**

- ✅ Complete inventory of generated files
- ✅ Recommendations for `.gitignore` updates
- ✅ Documentation of generation process
- ✅ No breaking changes to existing workflows

---

## Testing Strategy

This work follows the project's TDD order: Contracts → RLS → E2E → Unit

### Testing Priority

**1. Contracts First (Week 1)**

Create testing contracts for each phase:

**File:** `tests/ci/contracts.md`

```markdown
# CI Workflow Testing Contracts

## Spec Validation Contract

**Local Command:** `pnpm run specs:validate`
**Expected Behavior:**

- ✅ Validates spec directory structure
- ✅ Returns exit code 0 on success
- ✅ Returns exit code 1 on failure
- ✅ Outputs error messages referencing debugging guide

## Spec Lane Check Contract

**Local Command:** `pnpm run specs:check-lane`
**Expected Behavior:**

- ✅ Detects correct lane based on spec content
- ✅ Outputs lane choice explanation
- ✅ Returns exit code 0 always (informational)

[... contracts for each script ...]
```

**2. Integration Tests (Week 2-3)**

Test script execution in isolation:

**File:** `tests/ci/validate-specs.test.sh`

```bash
#!/bin/bash
# Test spec validation script

# Setup test fixtures
mkdir -p test-specs/001-valid-spec
echo "# Spec" > test-specs/001-valid-spec/README.md
echo "Status: Draft" >> test-specs/001-valid-spec/README.md

# Test valid spec
./scripts/ci/validate-specs.sh test-specs
if [ $? -ne 0 ]; then
  echo "❌ Valid spec should pass"
  exit 1
fi

# Test invalid spec (no status)
mkdir -p test-specs/002-invalid-spec
echo "# Spec" > test-specs/002-invalid-spec/README.md

./scripts/ci/validate-specs.sh test-specs
if [ $? -eq 0 ]; then
  echo "❌ Invalid spec should fail"
  exit 1
fi

echo "✅ Spec validation tests passed"
```

**3. E2E Tests (Week 4)**

Test full CI workflow execution:

**File:** `tests/ci/e2e-workflow.test.yml`

```yaml
# Test workflow that exercises all scripts
name: E2E CI Test

on:
  push:
    branches: [test/**]

jobs:
  test-ci-scripts:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: ./.github/actions/setup

      - name: Test spec validation
        run: pnpm run specs:validate

      - name: Test spec lane check
        run: pnpm run specs:check-lane

      - name: Verify error messages reference debugging guide
        run: |
          # Trigger intentional failure and check error format
          # [... test implementation ...]
```

**4. Unit Tests (Week 5-6)**

Test individual helper functions:

**File:** `tests/ci/helpers.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { parseSpecMetadata } from '../scripts/ci/lib/parser';

describe('Spec metadata parser', () => {
  it('should extract YAML frontmatter', () => {
    const content = `---
id: SPEC-20251015-test
type: spec
---
# Spec content`;

    const metadata = parseSpecMetadata(content);
    expect(metadata.id).toBe('SPEC-20251015-test');
    expect(metadata.type).toBe('spec');
  });
});
```

### Testing Coverage Targets

Following constitution Article I, Section 1.2:

- ✅ **Script logic:** 80% code coverage
- ✅ **Workflow orchestration:** E2E coverage of critical paths
- ✅ **Error handling:** All error paths tested
- ✅ **Local/CI parity:** Same behavior in both environments

---

## Security Considerations

Following constitution Article I, Section 1.1 (Security First):

### 1. Script Execution Security

**Risk:** Bash scripts running in CI could execute malicious code

**Mitigation:**

- ✅ All scripts under version control (`.github/` and `scripts/`)
- ✅ Scripts reviewed in PR process (require human approval)
- ✅ No dynamic script generation or downloading
- ✅ Input validation in all scripts
- ✅ Use of `set -euo pipefail` for safe bash execution

**Implementation:**

```bash
#!/bin/bash
set -euo pipefail  # Exit on error, undefined variables, pipe failures

# Validate inputs
if [ -z "${1:-}" ]; then
  echo "Error: Missing required argument"
  exit 1
fi

# ... script logic ...
```

### 2. Secrets Management

**Risk:** Scripts could expose secrets in logs or error messages

**Mitigation:**

- ✅ No secrets in script code
- ✅ Use GitHub Actions secrets for sensitive data
- ✅ Mask sensitive values in logs
- ✅ No printing of environment variables

**Implementation:**

```yaml
- name: Run script with secrets
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  run: ./scripts/ci/example.sh
  # Script uses GITHUB_TOKEN from env, never prints it
```

### 3. Workflow Trigger Security

**Risk:** Making workflows `workflow_dispatch` could allow unauthorized triggers

**Mitigation:**

- ✅ Maintain GitHub branch protection rules
- ✅ Workflows still require repository permissions
- ✅ Schedule triggers remain for automatic execution
- ✅ Manual triggers require write access

**Implementation:**

```yaml
on:
  workflow_dispatch: # Requires write access to repository
  schedule: # Runs automatically as backup
    - cron: '0 0 * * 1'
```

### 4. Context Exclusion Security

**Risk:** `.claudeignore` could hide security vulnerabilities from AI review

**Mitigation:**

- ✅ Never exclude security-sensitive files (e.g., `.env.example`, security workflows)
- ✅ Only exclude documentation and non-code files
- ✅ Regular audits of exclusion patterns
- ✅ Security workflows remain in context

**Implementation:**

```
# .claudeignore
docs/wiki/          # Documentation only
docs/micro-lessons/ # Documentation only

# DO NOT exclude:
# - Security workflows
# - Environment templates
# - Authentication code
```

### 5. Composite Action Security

**Risk:** Centralized setup action could become single point of failure

**Mitigation:**

- ✅ Pin all action versions (no `@main` or `@latest`)
- ✅ Regular updates of action dependencies
- ✅ Renovate bot for automated security updates
- ✅ Dependabot alerts enabled

**Implementation:**

```yaml
- name: Checkout repository
  uses: actions/checkout@v5 # Pinned version, not @main
```

---

## Dependencies

### Required Dependencies (Already Available)

All required tools are already in the project:

- ✅ **pnpm 9.12.0** - Package manager
- ✅ **Node.js 20** - Runtime
- ✅ **tsx** - TypeScript execution (for analysis scripts)
- ✅ **GitHub CLI** - For workflow triggers and PR operations
- ✅ **Bash** - Script execution
- ✅ **GitHub Actions** - CI/CD platform

### New Package Scripts (Zero Dependencies)

Adding to `package.json`:

```json
{
  "scripts": {
    "specs:validate": "bash scripts/ci/validate-specs.sh",
    "specs:check-lane": "bash scripts/ci/check-spec-lane.sh",
    "ci:validate": "bash scripts/ci/validate-specs.sh && bash scripts/ci/check-spec-lane.sh"
  }
}
```

### Justification

**No new dependencies required because:**

1. Script extraction uses existing bash/tsx ecosystem
2. Composite actions use existing GitHub Actions
3. Documentation is markdown (no build step)
4. Testing uses existing test infrastructure
5. All operations use existing tooling

**Constitutional Compliance:**

- ✅ Article I, Section 1.3: Least Dependencies principle
- ✅ No new packages to audit or version pin
- ✅ No bundle size impact (CI-only changes)

---

## Risks & Mitigation

### Risk 1: Breaking Existing CI Workflows

**Severity:** High
**Probability:** Medium

**Description:** Extracting inline bash to scripts could introduce regressions in CI behavior.

**Mitigation:**

1. **Phased rollout:** One workflow at a time, starting with least critical
2. **Parallel testing:** Run old and new approaches side-by-side initially
3. **Easy rollback:** Keep old YAML commented out for quick revert
4. **Comprehensive testing:** Test scripts locally and in CI before replacing
5. **Monitoring:** Watch CI failure rates closely during rollout

**Rollback Plan:**

```yaml
# Old implementation (commented, ready to restore)
# - name: Validate specs (OLD)
#   run: |
#     [... old inline bash ...]

# New implementation
- name: Validate specs
  run: ./scripts/ci/validate-specs.sh
```

### Risk 2: Local/CI Environment Differences

**Severity:** Medium
**Probability:** Medium

**Description:** Scripts might behave differently locally vs. CI due to environment differences.

**Mitigation:**

1. **Environment documentation:** Document required local tools
2. **Environment checks:** Scripts check for required tools and exit gracefully
3. **Container option:** Consider local testing in Docker (future enhancement)
4. **Clear error messages:** Scripts explain missing dependencies

**Implementation:**

```bash
#!/bin/bash
# Check required tools
command -v gh >/dev/null 2>&1 || {
  echo "Error: GitHub CLI (gh) is required but not installed"
  echo "Install: https://cli.github.com/"
  exit 1
}
```

### Risk 3: Increased Script Maintenance Burden

**Severity:** Low
**Probability:** Medium

**Description:** More standalone scripts means more files to maintain.

**Mitigation:**

1. **Comprehensive documentation:** Each script has clear purpose and usage
2. **Shared libraries:** Common logic in `scripts/ci/lib/` reduces duplication
3. **Testing:** Scripts have test coverage to catch regressions
4. **Consistent patterns:** All scripts follow same structure and style

**Documentation Template:**

```bash
#!/bin/bash
# Script: validate-specs.sh
# Purpose: Validate spec directory structure and content
# Usage: ./validate-specs.sh [directory]
# Exit codes: 0 = success, 1 = validation failed
# Author: [Team]
# Last updated: [Date]
```

### Risk 4: Debugging Guide Becomes Stale

**Severity:** Low
**Probability:** High

**Description:** As workflows change, debugging guide could become outdated.

**Mitigation:**

1. **Automated checks:** Script to validate guide references in workflows
2. **PR template:** Remind reviewers to update guide when changing workflows
3. **Regular audits:** Quarterly review of debugging guide accuracy
4. **Ownership:** Assign debugging guide to specific maintainer

**Validation Script:**

```bash
#!/bin/bash
# Check that all error messages reference debugging guide
grep -r "::error::" .github/workflows/ | while read line; do
  if ! echo "$line" | grep -q "DEBUGGING.md"; then
    echo "Warning: Error message without debugging guide reference: $line"
  fi
done
```

### Risk 5: Token Savings Less Than Expected

**Severity:** Low
**Probability:** Low

**Description:** Actual token savings might not match estimates (12.4M tokens/year).

**Mitigation:**

1. **Baseline measurement:** Measure current token consumption before changes
2. **Incremental tracking:** Measure savings after each phase
3. **Adjust expectations:** Update estimates based on actual data
4. **Multiple benefits:** Even if token savings are lower, developer experience improvements are valuable

**Measurement Plan:**

```markdown
## Token Consumption Tracking

### Baseline (Before Implementation)

- AI sessions per month: 48
- Average tokens per session: ~50K
- Total monthly: ~2.4M tokens

### Phase 1 Target

- Context exclusion: -15K tokens/session
- Expected monthly: ~1.68M tokens (30% reduction)

### Actual Results (After Phase 1)

- [Measure and document actual savings]
- [Adjust Phase 2+ estimates based on data]
```

---

## Success Metrics

Aligned with specification success criteria:

### Quantitative Metrics

| Metric             | Baseline    | Target      | Measurement Method              |
| ------------------ | ----------- | ----------- | ------------------------------- |
| Token consumption  | ~2.4M/month | ~1.6M/month | Claude usage logs               |
| CI failure rate    | 20%         | <10%        | GitHub Actions analytics        |
| Debug time (avg)   | 15 minutes  | 5 minutes   | Developer surveys               |
| Workflow YAML size | 106KB       | 50KB        | `wc -c .github/workflows/*.yml` |
| Local validation   | 0%          | 100%        | Package script availability     |

### Qualitative Metrics

| Metric               | Measurement Method         | Target                              |
| -------------------- | -------------------------- | ----------------------------------- |
| Developer confidence | Post-implementation survey | >80% positive                       |
| AI effectiveness     | Developer feedback         | >80% report improved responses      |
| Onboarding time      | New developer feedback     | >50% faster CI understanding        |
| Maintenance ease     | Maintainer feedback        | >70% report easier workflow updates |

### Success Indicators

Track these signals during implementation:

1. **CI Questions:** Count of "what does this CI error mean?" in PRs
   - Baseline: ~5/month
   - Target: 0/month

2. **Local Validation Usage:** Git hook execution logs
   - Target: >90% of pushes run local validation

3. **First-Time Fix Rate:** PRs that pass CI on first retry after failure
   - Baseline: ~40%
   - Target: >80%

4. **Debugging Guide Views:** Analytics on `.github/DEBUGGING.md`
   - Target: >50% of developers view after CI failure

---

## Implementation Schedule

### Week 1-2: Phase 1 - Workflow Simplification

- **Day 1-2:** Extract spec validation script + local testing
- **Day 3-4:** Extract spec lane check script + debugging guide
- **Day 5-6:** Extract AI review scraper + comprehensive testing
- **Day 7-8:** Make heavy workflows optional + documentation
- **Day 9-10:** Integration testing + rollout

### Week 3: Phase 2 - CI Job Consolidation

- **Day 1-2:** Create composite setup action
- **Day 3-4:** Consolidate CI jobs
- **Day 5:** Update all workflows to use composite action
- **Day 6-7:** Testing and validation

### Week 4: Phase 3 - Command Optimization

- **Day 1-2:** Analyze command overlap
- **Day 3-4:** Extract shared git patterns
- **Day 5:** Create command quick reference
- **Day 6-7:** Testing and documentation

### Week 5: Phase 4 - Documentation Cleanup

- **Day 1-2:** Audit LLM docs and recipes
- **Day 3-4:** Archive stale content
- **Day 5:** Consolidate recipes
- **Day 6-7:** Update cross-references

### Week 6: Phase 5 - Structural Analysis

- **Day 1-3:** PR coupling analysis
- **Day 4-5:** Generated file inventory
- **Day 6-7:** Recommendations and documentation

---

## Rollout Strategy

### Phase 1: Controlled Rollout

1. **Feature Branch:** Implement in `feat/142-llm-context-optimization`
2. **Internal Testing:** Test all scripts locally before PR
3. **PR Review:** Human review of all changes
4. **Staging:** Merge to staging branch first
5. **Monitor:** Watch CI for 1 week before promoting to main
6. **Rollback Ready:** Keep old implementation available

### Phase 2-5: Incremental Rollout

1. **One Phase Per PR:** Each phase is separate PR for easier review
2. **Independent Testing:** Each phase tested independently
3. **Backward Compatible:** No breaking changes to existing workflows
4. **Documentation First:** Update docs before code changes
5. **Feedback Loop:** Gather team feedback after each phase

---

## Validation Checklist

Before marking this plan complete, verify:

- [ ] All file paths are absolute and correct
- [ ] All dependencies are documented and available
- [ ] All security considerations addressed
- [ ] All constitutional constraints satisfied
- [ ] All testing strategies defined
- [ ] All risks identified with mitigations
- [ ] All success metrics measurable
- [ ] All phases have clear acceptance criteria
- [ ] Rollout strategy is incremental and safe
- [ ] Rollback plan exists for each phase

---

## Next Steps

1. **Human Review:** Review this plan and resolve [NEEDS_CLARIFICATION] items from specification
2. **Approval:** Get maintainer approval for approach
3. **Task Breakdown:** Run `/spec:tasks` to generate detailed task list
4. **Implementation:** Begin Phase 1 implementation
5. **Measurement:** Establish baseline metrics before changes

---

## Related Documents

- **Specification:** [SPEC-20251015-llm-context-optimization.md](../specs/SPEC-20251015-llm-context-optimization.md)
- **Constitution:** [docs/constitution.md](../docs/constitution.md)
- **Parent Issue:** [Issue #142](https://github.com/Shredvardson/dl-starter/issues/142)
- **Spec Issue:** [Issue #143](https://github.com/Shredvardson/dl-starter/issues/143)
- **CLAUDE.md:** [CLAUDE.md](../CLAUDE.md)
