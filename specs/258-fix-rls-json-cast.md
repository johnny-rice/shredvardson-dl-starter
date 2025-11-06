---
id: SPEC-258
title: Fix invalid JSON cast in RLS validation script
type: spec
priority: p1
status: completed
lane: simple
issue: 258
created: 2025-11-05
completed: 2025-11-06
labels: [bug, ci-cd, database]
---

# Fix invalid JSON cast in RLS validation script

## Summary

The RLS validation script in the CI/CD pipeline is failing due to a PostgreSQL type casting error at line 160 in `scripts/db/validate-rls.ts`. The cast `polroles::regrole[]` cannot be serialized to JSON format, causing CI validation failures.

## Problem Statement

The `fetchPolicies()` function in the RLS validation script uses `polroles::regrole[]` which produces an OID array that cannot be directly cast to JSON. This causes the query() RPC function to fail with "invalid input syntax for type json", blocking all PRs with database schema changes from merging.

**Impact:**

- Blocks all pull requests with database schema changes
- CI validation step (`Validate Database Migrations`) fails completely
- Affects all repository branches since the bug exists in main
- Currently blocking PR #256 (RLS optimization infrastructure)

## Proposed Solution

Replace the problematic line in `scripts/db/validate-rls.ts:164`:

```sql
polroles::regrole[] AS roles
```

With:

```sql
ARRAY(SELECT rolname FROM pg_roles WHERE oid = ANY(polroles)) AS roles
```

This converts OID arrays to text arrays before JSON serialization, which PostgreSQL handles without errors.

## Acceptance Criteria

- [x] Replace the problematic cast in `scripts/db/validate-rls.ts:164`
- [x] RLS validation script runs without JSON casting errors
- [x] CI validation step passes successfully
- [x] No regression in RLS policy reporting (all policy details still captured)
- [x] Blocked PRs (e.g., #256) can proceed

## Verification Results

All acceptance criteria verified on 2025-11-06:

1. **Query Fix**: Replaced `polroles::regrole[]` with `ARRAY(SELECT rolname FROM pg_roles WHERE oid = ANY(polroles))`
2. **Script Execution**: Tested locally against Supabase - no JSON casting errors
3. **CI Validation**: All checks passing (doctor, ci, CodeQL, CodeRabbit)
4. **Policy Capture**: Verified `_health_check` table policies captured correctly with role names, operations, and policy names
5. **Performance**: Query execution < 50ms per table (tested with local database)

## Technical Constraints

- Must maintain compatibility with existing PostgreSQL RLS policy structure
- Should not affect performance of the validation query (< 100ms per table, leveraging pg_roles indexed on oid)
- Must preserve all policy information currently being captured (policy names, operations, role lists)

## Success Metrics

- CI validation step passes consistently
- No JSON casting errors in CI logs
- All blocked PRs can merge successfully

## Out of Scope

- Refactoring of the entire RLS validation script
- Changes to other parts of the CI/CD pipeline
- Performance optimization beyond the immediate fix

## References

- Issue: #258
- Blocking: PR #256 (RLS optimization infrastructure)
- Introduced in: PR #235 (RLS validation CI/CD integration)
- File: `scripts/db/validate-rls.ts:160`
