# ADR-004: Fix pnpm setup in routing-contract workflow

**Status:** Accepted
**Date:** 2025-10-02

## Context

The `routing-contract.yml` workflow was failing in CI with "pnpm: command not found" errors. Investigation revealed that while the workflow called `pnpm/action-setup@v4`, it did not specify the `version` and `run_install` parameters, unlike all other workflows in the repository.

The workflow uses `pnpm` commands for:
- Generating command index (`node scripts/generate-command-index.js`)
- Checking documentation structure (`pnpm tsx scripts/docs-check.ts`)
- Running wiki generation (`node scripts/generate-wiki.js`)

Without a specified version, pnpm setup was inconsistent across CI runs and failed to install properly.

## Decision

1. Add explicit `version: 9.12.0` and `run_install: false` parameters to the `pnpm/action-setup@v4` action in the `routing-contract.yml` workflow
2. Reorder steps to run `pnpm/action-setup@v4` **before** `actions/setup-node@v5`
3. Add `cache: 'pnpm'` to the Node.js setup step

This matches the configuration used in all other workflows (ci.yml, doctor-recheck.yml, etc.) and ensures:
1. Consistent pnpm version across all workflows (9.12.0)
2. Explicit control over when dependencies are installed
3. Proper step ordering (pnpm must exist before Node tries to cache it)
4. Alignment with established workflow patterns in the repository

## Consequences

- **Benefits:**
  - Routing contract checks now run reliably in CI
  - Consistent pnpm version (9.12.0) across all workflows
  - Follows DRY principle by matching existing workflow patterns
  - Prevents "command not found" failures

- **Tradeoffs:**
  - Must manually update version number if pnpm is upgraded (same as other workflows)
  - Adds 3 lines to workflow YAML (version, run_install, cache)

- **Monitoring:**
  - Watch CI logs for routing-contract workflow success
  - Ensure no "pnpm: command not found" errors in future PR runs

## References

- [pnpm action-setup documentation](https://github.com/pnpm/action-setup)
- Issue: #103
- PR: #104
