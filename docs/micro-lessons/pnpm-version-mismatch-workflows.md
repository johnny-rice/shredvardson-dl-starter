# Micro Lesson: pnpm Version Mismatch in GitHub Workflows

## Problem
GitHub Actions workflows failed with `ERR_PNPM_BAD_PM_VERSION` error when using `pnpm/action-setup@v4` with mismatched versions.

## Root Cause
- Workflows specified `version: 8` in `pnpm/action-setup@v4`
- `package.json` specified `"packageManager": "pnpm@9.12.0"`
- The action detected both versions and rejected the mismatch

## Error Message
```
Error: Multiple versions of pnpm specified:
  - version 8 in the GitHub Action config with the key "version"  
  - version pnpm@9.12.0 in the package.json with the key "packageManager"
Remove one of these versions to avoid version mismatch errors
```

## Solution
Update workflow pnpm versions to match `package.json` `packageManager` field:

```yaml
# Before
- name: Install pnpm
  uses: pnpm/action-setup@v4
  with:
    version: 8

# After  
- name: Install pnpm
  uses: pnpm/action-setup@v4
  with:
    version: 9.12.0
```

## Prevention
1. **Single source of truth**: Use `packageManager` field in `package.json` as authoritative version
2. **Workflow consistency**: Keep all workflows synchronized with this version
3. **Version updates**: Update both `package.json` and all workflows when bumping pnpm

## Affected Files
- `.github/workflows/telemetry-weekly.yml`
- `.github/workflows/wiki-publish.yml`
- Any other workflows using `pnpm/action-setup`

## Key Insight
`pnpm/action-setup@v4` automatically detects and validates version consistency between action config and `packageManager` field, preventing version drift but requiring explicit coordination.

**Tags:** pnpm, github-actions, version-mismatch, packageManager
**Date:** 2025-01-27
**Severity:** Medium (breaks CI)