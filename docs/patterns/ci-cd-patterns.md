# CI/CD Patterns

**Category:** Infrastructure & DevOps
**Impact:** High - Prevents CI failures, improves developer experience, faster feedback loops
**Lessons Synthesized:** 9 micro-lessons

## Overview

This guide consolidates battle-tested patterns for reliable CI/CD pipelines, quality gates, and automated validation. These patterns prevent common CI failures, improve developer experience through fast feedback loops, and ensure consistent quality across all contributors.

## Core Principles

1. **Shift Left:** Catch issues locally before pushing to CI
2. **Fast Feedback:** Optimize for speed without sacrificing correctness
3. **Zero Friction:** Automate setup and configuration
4. **Resilient:** Handle variable environments and timeouts gracefully
5. **Parallel Execution:** Leverage parallelization for faster validation

---

## Pattern 1: Lefthook + Biome Quality Gates

**Problem:** Manual git hook setup, slow sequential validation, no pre-commit feedback.

**Impact:** High (8/10) - 2x faster validation, zero setup friction

**Source Lessons:**
- `196-lefthook-biome-quality-gates.md`
- `20251109-134641-pre-push-hook-timeout-optimization.md`

### ✅ Correct Pattern

```yaml
# lefthook.yml - Auto-installing, parallel hooks

# Pre-commit: Fast checks (<3s target)
pre-commit:
  parallel: true
  commands:
    biome-check:
      glob: '*.{js,ts,jsx,tsx,json}'
      run: |
        echo "⚡ Running Biome checks..."
        pnpm biome check --write --no-errors-on-unmatched {staged_files}
        git add {staged_files}

# Pre-push: Comprehensive validation
pre-push:
  commands:
    # Block main branch pushes
    protect-main:
      run: |
        branch=$(git rev-parse --abbrev-ref HEAD)
        if [ "$branch" = "main" ] || [ "$branch" = "master" ]; then
          echo "❌ Direct push to main branch blocked"
          exit 1
        fi

    # Check lockfile sync
    lockfile-sync:
      run: |
        if git diff --name-only HEAD @{u} 2>/dev/null | grep -q "package.json"; then
          echo "📦 Checking lockfile sync..."
          if ! pnpm install --frozen-lockfile 2>/dev/null; then
            echo "❌ pnpm-lock.yaml is out of sync"
            echo "💡 Fix: Run 'pnpm install'"
            exit 1
          fi
        fi

    # Parallel typecheck + lint
    parallel-checks:
      run: |
        # Create pipes for parallel execution
        TYPECHECK_PIPE=$(mktemp -u)
        LINT_PIPE=$(mktemp -u)
        mkfifo "$TYPECHECK_PIPE" "$LINT_PIPE"

        # Run in background
        (pnpm typecheck && echo "0" > "$TYPECHECK_PIPE" || echo "1" > "$TYPECHECK_PIPE") &
        (pnpm lint && echo "0" > "$LINT_PIPE" || echo "1" > "$LINT_PIPE") &

        # Wait and collect results
        TYPECHECK_RESULT=$(cat "$TYPECHECK_PIPE")
        LINT_RESULT=$(cat "$LINT_PIPE")

        # Cleanup
        rm -f "$TYPECHECK_PIPE" "$LINT_PIPE"

        # Exit if either failed
        if [ "$TYPECHECK_RESULT" -ne 0 ] || [ "$LINT_RESULT" -ne 0 ]; then
          echo "❌ Validation failed"
          exit 1
        fi

    # Unit tests
    unit-tests:
      run: pnpm test:unit
```

### Auto-install Configuration

```json
// package.json
{
  "scripts": {
    "prepare": "lefthook install"
  },
  "devDependencies": {
    "lefthook": "^1.5.0",
    "@biomejs/biome": "^1.4.0"
  }
}
```

### Biome Configuration

```json
// biome.json
{
  "formatter": {
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "trailingCommas": "es5",
      "semicolons": "always"
    }
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  }
}
```

### ❌ Anti-Pattern

```bash
# WRONG: Manual hook installation
cp .githooks/pre-push .git/hooks/pre-push

# WRONG: Sequential execution
pnpm typecheck  # 8s
pnpm lint       # 5s
# Total: 13s instead of 8s with parallelization

# WRONG: No pre-commit checks
# Developer discovers formatting issues at push time
```

### Key Points

- **Auto-install hooks** via `prepare` script (runs on `pnpm install`)
- **Parallel execution** saves 30-50% validation time
- **Two-layer strategy:** Biome (fast, pre-commit) + ESLint (deep, pre-push)
- **Named pipes** for collecting parallel execution results
- **Clear error messages** with fix instructions
- **Escape hatch:** `git push --no-verify` or `LEFTHOOK=0`

### Performance Comparison

| Stage | Before (Manual) | After (Lefthook + Biome) | Improvement |
|-------|----------------|-------------------------|-------------|
| Setup | Manual copy | Auto on `pnpm install` | Zero friction |
| Pre-commit | None | <1s (Biome) | Instant feedback |
| Pre-push | 15-30s sequential | 8-15s parallel | 2x faster |

---

## Pattern 2: GitHub Actions Reliability

**Problem:** CI failures from race conditions, missing dependencies, incorrect setup order.

**Impact:** High (8/10) - Deterministic builds, faster execution

**Source Lessons:**
- `github-actions-pnpm-setup-reliability.md`
- `github-actions-pr-body-escaping.md`
- `ci-dependency-availability.md`

### ✅ Correct Pattern

```yaml
# .github/workflows/ci.yml

name: CI

on:
  push:
    branches: [main]
  pull_request:

env:
  NODE_OPTIONS: "--no-deprecation"
  SKILL_EXEC_TIMEOUT_MS: 180000  # 3min for slower runners

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      # 1. Install pnpm FIRST (before Node.js)
      - name: Install pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9.12.0
          run_install: false  # Prevent automatic installation

      # 2. Setup Node.js with cache
      - name: Setup Node.js
        uses: actions/setup-node@v5
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Checkout code
        uses: actions/checkout@v4

      # 3. Install dependencies
      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      # 4. Run validation
      - name: Type check
        run: pnpm typecheck

      - name: Lint
        run: pnpm lint

      - name: Test
        run: pnpm test

  # Dependency availability guard
  validate-scripts:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Validate script dependencies
        run: |
          # Check for required tools
          if ! command -v pnpm >/dev/null 2>&1; then
            echo "⚠️ pnpm not available, using npx fallback"
            npx -y tsx scripts/validate.ts
          else
            pnpm tsx scripts/validate.ts
          fi
```

### Environment Variable Escaping

```yaml
# Escape multi-line variables properly
- name: Create PR
  env:
    PR_BODY: ${{ steps.generate.outputs.body }}
  run: |
    # Store in env var before using in bash
    gh pr create --body "$PR_BODY"

# ❌ WRONG: Direct interpolation breaks with newlines
- name: Create PR (WRONG)
  run: |
    gh pr create --body "${{ steps.generate.outputs.body }}"
```

### ❌ Anti-Pattern

```yaml
# WRONG: Node.js before pnpm (race condition)
- uses: actions/setup-node@v5
- uses: pnpm/action-setup@v4  # May not be available

# WRONG: Hardcoded version doesn't match package.json
- uses: pnpm/action-setup@v4
  with:
    version: 8.0.0  # packageManager field says 9.12.0!

# WRONG: No cache configured (slow installs)
- uses: actions/setup-node@v5
  with:
    node-version: '20'
    # Missing: cache: 'pnpm'
```

### Key Points

- **Setup order matters:** pnpm → Node.js → checkout → install
- **Use `run_install: false`** to prevent installation conflicts
- **Match pnpm version** to `packageManager` field in package.json
- **Enable caching** with `cache: 'pnpm'` for faster installs
- **Escape environment variables** when using in bash scripts
- **Check dependency availability** with fallbacks

---

## Pattern 3: Configurable Timeouts

**Problem:** Hardcoded timeouts cause flaky failures on slower CI runners.

**Impact:** High (7/10) - Prevents CI flakes, environment flexibility

**Source Lessons:**
- `20251027-083728-configurable-execsync-timeouts-for-ci.md`
- `configurable-scripts.md`

### ✅ Correct Pattern

```typescript
// utils/exec-with-error-handling.ts
import { execFileSync, type ExecSyncOptions } from 'child_process';

export function getDefaultExecOptions(): ExecSyncOptions {
  const TIMEOUT_MS = Number(process.env.SKILL_EXEC_TIMEOUT_MS ?? 120_000);
  const MAX_BUFFER = Number(process.env.SKILL_EXEC_MAX_BUFFER ?? 10 * 1024 * 1024);

  return {
    encoding: 'utf-8',
    cwd: process.cwd(),
    timeout: TIMEOUT_MS,      // 2min default, CI can override
    maxBuffer: MAX_BUFFER,    // 10MB default
  };
}

// Use in scripts
import { getDefaultExecOptions } from './utils/exec-with-error-handling.js';

const output = execFileSync('pnpm', ['db:types'], getDefaultExecOptions());
```

### CI Configuration

```yaml
# .github/workflows/ci.yml
env:
  SKILL_EXEC_TIMEOUT_MS: 180000   # 3min for slower runners
  SKILL_EXEC_MAX_BUFFER: 20971520 # 20MB for verbose output

jobs:
  test:
    steps:
      - name: Generate types
        run: tsx generate-types.ts
        # Uses environment variables automatically
```

### Error Handling

```typescript
try {
  const output = execFileSync('command', getDefaultExecOptions());
} catch (error) {
  const execError = error as NodeJS.ErrnoException;

  if (execError.code === 'ETIMEDOUT') {
    const timeout = process.env.SKILL_EXEC_TIMEOUT_MS ?? 120_000;
    console.error(`Command timed out after ${timeout}ms`);
    console.error(`Increase timeout with SKILL_EXEC_TIMEOUT_MS env var`);
  }

  throw error;
}
```

### ❌ Anti-Pattern

```typescript
// WRONG: Hardcoded timeout (brittle)
execSync('pnpm db:types', {
  timeout: 60_000,  // Might be too short for CI
});

// WRONG: No buffer size (may overflow)
execSync('pnpm db:types', {
  timeout: 60_000,
  // Missing maxBuffer - defaults to 1MB
});

// WRONG: No configurability
const TIMEOUT = 120_000;  // Can't be changed without code edit
```

### Key Points

- **Make timeouts configurable** via environment variables
- **Sensible defaults:** 120s timeout, 10MB buffer
- **Document overrides** in CI config and README
- **Clear error messages** on timeout with instructions
- **Buffer size matters:** Type generation can exceed 1MB default

### Default Values Rationale

| Setting | Default | Rationale |
|---------|---------|-----------|
| Timeout | 120s (2min) | Long enough for complex ops, short enough to catch hangs |
| Buffer | 10MB | 10× Node default, handles realistic large outputs |

---

## Pattern 4: Comprehensive Pre-Push Validation

**Problem:** Type errors, lint issues, test failures discovered after push in CI.

**Impact:** High (8/10) - 20-30min saved per PR, fewer fix commits

**Source Lessons:**
- `20251025-082837-comprehensive-pre-push-validation.md`

### ✅ Correct Pattern

```bash
#!/bin/bash
# .githooks/pre-push (or use Lefthook config)
set -euo pipefail

# 1. Lockfile sync (only if package.json changed)
if git diff --name-only HEAD @{u} 2>/dev/null | grep -q "package.json"; then
  echo "📦 Checking lockfile sync..."
  if ! pnpm install --frozen-lockfile 2>/dev/null; then
    echo "❌ pnpm-lock.yaml is out of sync with package.json"
    echo "💡 Fix: Run 'pnpm install' to update the lockfile"
    exit 1
  fi
  echo "✅ Lockfile is in sync"
fi

# 2. TypeScript type checking (with timing)
echo "🔎 Type checking..."
START_TIME=$(date +%s)
TYPECHECK_OUTPUT=$(pnpm typecheck 2>&1)
TYPECHECK_EXIT=$?
echo "$TYPECHECK_OUTPUT" | grep -v "Tasks:"  # Filter Turbo noise

if [ $TYPECHECK_EXIT -ne 0 ]; then
  echo "❌ TypeScript errors found!"
  echo "💡 Fix: Run 'pnpm typecheck' to see errors"
  echo "💡 To bypass: git push --no-verify (not recommended)"
  exit 1
fi

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
if [ $DURATION -lt 3 ]; then
  echo "✅ Type check passed (${DURATION}s - cached)"
else
  echo "✅ Type check passed (${DURATION}s)"
fi

# 3. Linting
echo "✨ Linting..."
if ! pnpm lint; then
  echo "❌ Lint errors found!"
  echo "💡 Fix: Run 'pnpm lint' or 'pnpm format' to auto-fix"
  exit 1
fi

# 4. Unit tests
echo "🧪 Running unit tests..."
if ! pnpm test:unit; then
  echo "❌ Unit tests failed!"
  exit 1
fi

echo "🎉 All quality checks passed!"
```

### Exit Code Handling Pattern

```bash
# ✅ CORRECT: Capture exit code BEFORE piping
TYPECHECK_OUTPUT=$(pnpm typecheck 2>&1)
TYPECHECK_EXIT=$?
echo "$TYPECHECK_OUTPUT" | grep -v "Tasks:"

if [ $TYPECHECK_EXIT -ne 0 ]; then
  # Handle error
fi

# ❌ WRONG: Piping directly loses exit code
if ! pnpm typecheck 2>&1 | grep -v "Tasks:"; then
  # This checks grep's exit code, not typecheck!
fi
```

### ❌ Anti-Pattern

```bash
# WRONG: No fix instructions
if ! pnpm typecheck; then
  echo "Type check failed"  # How do I fix it?
  exit 1
fi

# WRONG: Always check lockfile (unnecessary)
pnpm install --frozen-lockfile  # Runs even if package.json unchanged

# WRONG: Silent about timing
pnpm typecheck  # Is Turbo cache working?

# WRONG: No escape hatch
# Developer can't bypass in emergencies
```

### Key Points

- **5-stage validation:** Lockfile → Types → Lint → CI scripts → Tests
- **Conditional checks:** Only validate lockfile if package.json changed
- **Clear error messages** with fix commands and escape hatch
- **Performance feedback:** Show timing and cache status
- **Exit code handling:** Capture BEFORE piping to preserve status
- **Filter noise:** Remove Turbo task summaries from output

### Timing Expectations

| Scenario | Duration | Details |
|----------|----------|---------|
| Best case (cached) | 7s | All Turbo cache hits |
| Typical | 15-20s | Some cache hits |
| Worst case (cold) | 25-30s | No cache |
| CI feedback loop | 2-5min | Push → CI fail → fix |

**Net savings:** 20-30 minutes per PR by catching issues locally

---

## Pattern 5: Dependency Availability Guards

**Problem:** Scripts fail in CI due to missing tools (pnpm, tsx, npx).

**Impact:** Medium (6/10) - Graceful degradation across environments

**Source Lessons:**
- `ci-dependency-availability.md`
- `ci-tsx-availability.md`

### ✅ Correct Pattern

```bash
#!/bin/bash
# scripts/validate-traceability.sh

# Check for pnpm (preferred)
if command -v pnpm >/dev/null 2>&1; then
  pnpm tsx scripts/validate-traceability.ts

# Fallback to npx
elif command -v npx >/dev/null 2>&1; then
  echo "ℹ️ pnpm not found, using npx tsx fallback"
  npx -y tsx scripts/validate-traceability.ts

# Graceful skip
else
  echo "⚠️ WARNING: Neither pnpm nor npx available"
  echo "Skipping traceability validation"
  exit 0  # Don't fail the build
fi
```

### GitHub Actions Pattern

```yaml
- name: Run validation script
  run: |
    if command -v pnpm >/dev/null 2>&1; then
      pnpm tsx scripts/validate.ts
    else
      echo "Using npx fallback"
      npx -y tsx scripts/validate.ts
    fi
```

### ❌ Anti-Pattern

```bash
# WRONG: Assumes tool is available
pnpm tsx scripts/validate.ts  # Fails in minimal CI

# WRONG: Hard failure on missing tool
if ! command -v pnpm; then
  echo "pnpm required"
  exit 1  # Breaks build unnecessarily
fi
```

### Key Points

- **Check availability** with `command -v tool >/dev/null 2>&1`
- **Provide fallbacks:** pnpm → npx → skip with warning
- **Clear messaging:** Explain which tool is being used
- **Graceful degradation:** Don't fail build on missing optional tools
- **Use `-y` flag** with npx to auto-install packages

---

## Pattern 6: pnpm Lockfile Management

**Problem:** Merge conflicts in pnpm-lock.yaml, out-of-sync lockfiles block CI.

**Impact:** High (8/10) - Prevents blocked PRs, deterministic installs

**Source Lessons:**
- `20250124-192500-pnpm-lockfile-sync-after-package-json-edit.md`
- `pnpm-lock-merge-conflicts.md`

### ✅ Correct Pattern

```bash
# After editing package.json
pnpm install  # Updates lockfile

# Git workflow
git add package.json pnpm-lock.yaml
git commit -m "feat: add new dependency"

# Merge conflict resolution
git checkout main -- pnpm-lock.yaml  # Accept main's version
pnpm install --no-frozen-lockfile    # Regenerate with your changes
git add pnpm-lock.yaml
git commit
```

### Pre-push Hook Integration

```bash
# Detect package.json changes
if git diff --name-only HEAD @{u} 2>/dev/null | grep -q "package.json"; then
  # Validate lockfile sync
  if ! pnpm install --frozen-lockfile 2>/dev/null; then
    echo "❌ Lockfile out of sync"
    echo "💡 Fix: Run 'pnpm install'"
    exit 1
  fi
fi
```

### CI Validation

```yaml
- name: Install dependencies
  run: pnpm install --frozen-lockfile
  # Fails if lockfile doesn't match package.json
```

### ❌ Anti-Pattern

```bash
# WRONG: Forgot to run pnpm install
npm install some-package  # Bypasses pnpm!
git add package.json      # Missing pnpm-lock.yaml!
git commit

# WRONG: Manual lockfile merge
# Trying to merge pnpm-lock.yaml by hand
# (It's generated, should be regenerated)

# WRONG: Commit without testing
pnpm install
git add package.json pnpm-lock.yaml
git commit
# Didn't run tests to verify new dependency works!
```

### Key Points

- **Always run `pnpm install`** after editing package.json
- **Commit both files together:** package.json + pnpm-lock.yaml
- **Merge conflicts:** Accept main's lockfile, regenerate with `pnpm install`
- **Use `--frozen-lockfile`** in CI to catch sync issues
- **Never edit lockfile manually** - it's generated

### Merge Conflict Resolution Strategy

```bash
# 1. Accept main's lockfile
git checkout main -- pnpm-lock.yaml

# 2. Regenerate with your package.json
pnpm install --no-frozen-lockfile

# 3. Verify it works
pnpm typecheck
pnpm test

# 4. Commit
git add pnpm-lock.yaml
git commit -m "chore: resolve lockfile conflict"
```

---

## Checklist for CI/CD

Before committing CI changes, verify:

- [ ] Lefthook configured with auto-install (`prepare` script)
- [ ] Biome configured for pre-commit checks (<3s)
- [ ] Pre-push validation runs: lockfile → types → lint → tests
- [ ] GitHub Actions setup order: pnpm → Node.js → checkout → install
- [ ] pnpm version matches `packageManager` in package.json
- [ ] Timeouts configurable via environment variables
- [ ] Error messages include fix instructions
- [ ] Parallel execution where possible (typecheck + lint)
- [ ] Dependency availability checks with fallbacks
- [ ] Lockfile validation on package.json changes
- [ ] Clear performance feedback (timing, cache status)

---

## Quick Reference

### Common Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `SKILL_EXEC_TIMEOUT_MS` | `120000` (2min) | Command timeout |
| `SKILL_EXEC_MAX_BUFFER` | `10485760` (10MB) | Max output buffer |
| `NODE_OPTIONS` | - | Node.js runtime options |
| `LEFTHOOK` | `1` | Enable/disable Lefthook |
| `LEFTHOOK_VERBOSE` | `0` | Verbose logging |

### Timing Targets

| Check | Target | Typical | Notes |
|-------|--------|---------|-------|
| Pre-commit (Biome) | <3s | <1s | Instant feedback |
| Pre-push (parallel) | <20s | 15s | Acceptable wait |
| CI validation | <5min | 3min | Fast feedback |

### Bypass Commands

```bash
# Bypass pre-commit
git commit --no-verify

# Bypass pre-push
git push --no-verify

# Disable Lefthook entirely
LEFTHOOK=0 git push

# Skip specific Lefthook command
LEFTHOOK_EXCLUDE=biome-check git commit
```

---

## References

- **Lefthook:** https://lefthook.dev/
- **Biome:** https://biomejs.dev/
- **pnpm Action Setup:** https://github.com/pnpm/action-setup
- **GitHub Actions:** https://docs.github.com/en/actions

---

## Related Patterns

- [Bash Safety Patterns](./bash-safety-patterns.md) - Script reliability and security
- [Testing Patterns](./testing-patterns.md) - Test isolation and CI integration
- [Security Patterns](./security-patterns.md) - Input validation and sanitization

---

**Last Updated:** 2025-11-11
**Lessons Referenced:** 9 micro-lessons from CI/CD category
