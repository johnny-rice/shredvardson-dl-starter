# Ensure tsx Binary Availability in CI Workflows

## Problem
CI jobs may fail with "tsx: not found" even after installing dependencies, especially when node_modules/.bin might not be in PATH or installation timing issues occur.

## Solution
Use a fallback pattern with `pnpm dlx tsx` when the regular script fails:

```yaml
- name: Audit traceability (if traceability dirs exist)
  run: |
    set -euo pipefail
    if [ -d "specs" ] || [ -d "plans" ] || [ -d "tasks" ]; then
      echo "📋 Traceability artifacts detected, running validation..."
      # Ensure tsx is available after dependency installation
      pnpm audit:traceability || pnpm dlx tsx scripts/validate-traceability.ts
    else
      echo "📋 No traceability artifacts found, skipping validation"
    fi
```

## Why This Works
- `pnpm audit:traceability` runs the script normally using installed tsx
- `pnpm dlx tsx` downloads and runs tsx if the installed version fails
- The `||` operator provides automatic fallback on failure

## Context
- Common in CI environments where PATH or timing can vary
- Particularly important for TypeScript execution binaries
- Ensures reliability without blocking CI pipelines

**Tags:** `ci,tsx,typescript,binary-availability,github-actions,fallback,coderabbit`