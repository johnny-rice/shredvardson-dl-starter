---
id: SPEC-optimize-rls-policy-performance
title: Optimize RLS Policy Performance
type: spec
priority: p2
status: ready
lane: spec-driven
issue: 237
created: 2025-10-31
plan: plans/optimize-rls-policy-performance.md
tasks: tasks/optimize-rls-policy-performance.md
---

# Optimize RLS Policy Performance

## Summary

Implement RLS performance optimization best practices to prevent slow queries and poor user experience. Focuses on adding indexes, caching function results, using security definer helpers, and minimizing joins in RLS policies.

## Problem Statement

Row Level Security (RLS) policies can cause 100x+ slower queries without proper optimization, especially for tables with high row counts (>10k rows). Currently, RLS policies are implemented without performance optimizations, which will cause significant performance degradation in production.

**Current State:**

- ✅ RLS policies implemented on tables
- ✅ RLS validation in CI/CD pipeline
- ❌ No performance optimizations applied
- ❌ No indexes on RLS policy filter columns
- ❌ No security definer helper functions

## Proposed Solution

Implement 6-phase optimization strategy based on Supabase's RLS Performance Guide:

### Phase 1: Index Optimization

Add indexes on all RLS policy filter columns (user_id, team_id, etc.)

**Impact:** 99.94% improvement (171ms → <0.1ms)

### Phase 2: Function Result Caching

Wrap `auth.uid()` and `auth.jwt()` calls with `SELECT` to cache per-statement instead of per-row.

**Impact:** 94.97% improvement (179ms → 9ms)

### Phase 3: Security Definer Functions

Create helper functions in `private` schema for complex policies with joins.

**Impact:** 99.993% improvement (178,000ms → 12ms)

### Phase 4: Client-Side Filters

Add explicit filters to all Supabase queries, even if RLS duplicates them.

**Impact:** 94.74% improvement (171ms → 9ms)

### Phase 5: Minimize Policy Joins

Refactor policies to avoid joining back to source table.

**Impact:** 99.78% improvement (9,000ms → 20ms)

### Phase 6: Role Specification

Add `TO authenticated` clause to all user-scoped policies.

**Impact:** 99.78% improvement when accessed by anon users

## Acceptance Criteria

### Phase 1: Index Optimization

- [ ] All tables with RLS policies audited for filter columns
- [ ] Indexes added on `user_id` columns
- [ ] Indexes added on `team_id` or similar join columns
- [ ] Indexes added on any custom filter columns
- [ ] Migration file created for all indexes

### Phase 2: Query Optimization

- [ ] All `auth.uid()` calls wrapped with `(select auth.uid())`
- [ ] All `auth.jwt()` calls wrapped with `(select auth.jwt())`
- [ ] `TO authenticated` clause added to all user-scoped policies
- [ ] Policies refactored to minimize joins

### Phase 3: Security Definer Functions

- [ ] `private` schema created for helper functions
- [ ] Complex policies identified that would benefit from helpers
- [ ] Security definer functions created for team/role checks
- [ ] Policies updated to use helper functions

### Phase 4: Client-Side Optimization

- [ ] All Supabase queries in codebase audited
- [ ] Explicit filters added to all queries
- [ ] Developer documentation updated with filter requirements

### Phase 5: Validation

- [ ] Performance benchmarks run before/after optimizations
- [ ] Tests pass with realistic data volumes (>10k rows)
- [ ] RLS security still enforced correctly (existing tests pass)
- [ ] Documentation updated with optimization patterns

## Technical Constraints

- Must maintain existing RLS security guarantees
- Cannot break existing application functionality
- Must work with current Supabase version
- Optimizations must be backward compatible
- Security definer functions must not expose private data

## Success Metrics

| Scenario              | Before    | Target | Improvement |
| --------------------- | --------- | ------ | ----------- |
| Simple user_id filter | 171ms     | <1ms   | 99%+        |
| With indexes          | N/A       | <0.1ms | Baseline    |
| Function caching      | 179ms     | <10ms  | 95%+        |
| Team membership check | 11,000ms  | <10ms  | 99.9%+      |
| Security definer      | 178,000ms | <20ms  | 99.99%+     |

**Overall Goal:** All RLS-protected queries should complete in <10ms under normal load.

## Out of Scope

- Query optimization beyond RLS (handled separately)
- Database hardware scaling
- Application-level caching strategies
- Migration to different auth system
- Rewriting policies to use different authorization model

## References

- [RLS Performance Best Practices](https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices)
- [RLS Performance Tests (GitHub)](https://github.com/GaryAustin1/RLS-Performance)
- [Row Level Security Guide](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Security Definer Functions](https://www.postgresql.org/docs/current/sql-createfunction.html)
- Issue #226 (Implement RLS policies)
- Issue #228 (Implement missing RLS test helpers)
- Issue #236 (Add pgTAP database-level RLS testing)
