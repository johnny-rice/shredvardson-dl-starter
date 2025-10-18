# Workflow Simplification Plan

## Problem

Current workflows are too complex, causing:

- High token cost when debugging failures (~50KB YAML per failure)
- 20% failure rate requiring multi-file fixes
- Repeated context loading for fixes

## Target State

- **Fail fast**: Detect issues early with simple checks
- **Extract bash to scripts**: Workflows should be thin wrappers
- **Reduce jobs**: Consolidate similar validation jobs
- **Optional workflows**: Make heavy workflows opt-in

## Specific Changes

### 1. spec-guard.yml (369 lines → ~80 lines)

**Before:** 6 bash steps with 250+ lines of inline script
**After:**

```yaml
jobs:
  validate:
    steps:
      - run: pnpm run specs:validate # Move all logic to script
```

**Benefits:**

- Failures show clear error from script, not YAML parsing
- Script is debuggable locally
- Token cost: ~3KB instead of 13KB

### 2. Make telemetry-weekly.yml and wiki-publish.yml **opt-in**

**Current:** Run on every push/PR
**Proposed:** Manual workflow_dispatch or scheduled only

**Rationale:**

- These are maintenance tasks, not blocking CI
- 34KB of workflow YAML rarely needs debugging
- Can be triggered when actually needed

### 3. Consolidate CI jobs

**Before:** `doctor`, `docs-link-check`, `spec-gate`, `ci`, `e2e`, `promote-gate` (6 jobs)
**After:** Combine into 3 jobs:

- `preflight` (doctor + docs + spec-gate)
- `build-test` (ci + coverage)
- `e2e` (keep separate for caching)

**Benefits:**

- Fewer job boundaries = less setup/teardown
- Easier to understand failure context
- Reduced YAML complexity

### 4. Extract bash scripts

Move inline bash from workflows to `scripts/ci/`:

- `scripts/ci/validate-specs.sh`
- `scripts/ci/check-spec-lane.sh`
- `scripts/ci/scrape-ai-reviews.sh`

**Benefits:**

- Scripts can be tested locally
- Less workflow YAML to read
- Clear separation of concern

## Implementation Order

1. **Week 1:** Extract spec-guard bash to scripts
2. **Week 2:** Make telemetry/wiki workflows optional
3. **Week 3:** Consolidate CI jobs
4. **Week 4:** Extract remaining inline bash

## Success Metrics

- Workflow file sizes: **50% reduction** (106KB → ~50KB)
- Token cost per failure: **70% reduction** (~50KB → ~15KB)
- Failure rate: **<10%** (from current 20%)
- Local debugging: All validations runnable via `pnpm run` commands
