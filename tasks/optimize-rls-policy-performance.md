---
id: TASK-optimize-rls-policy-performance
title: Optimize RLS Policy Performance - Task Breakdown
type: task
parentId: PLAN-optimize-rls-policy-performance
spec: specs/optimize-rls-policy-performance.md
plan: plans/optimize-rls-policy-performance.md
issue: 237
created: 2025-10-31
status: ready
total_estimate: 14h
---

# Optimize RLS Policy Performance - Task Breakdown

## Summary

**Total Estimated Effort:** 14 hours
**Number of Tasks:** 9 tasks
**High-Risk Tasks:** 0 (T1 and T7 are medium-risk)

## Task List

### Task 1: Create One-Time Optimization Migration

**ID:** T1
**Priority:** p0
**Estimate:** 3h
**Dependencies:** None
**Risk:** medium

**Description:**
Create the main migration file that optimizes the existing `_health_check` table and establishes infrastructure (private schema, security definer functions). This applies all 6 optimization strategies to the current schema.

**Acceptance Criteria:**

- [ ] Migration file created: `supabase/migrations/20251031_optimize_rls_performance.sql`
- [ ] Index added on `_health_check` filter columns
- [ ] Existing policies recreated with `(SELECT auth.uid())` wrapper
- [ ] `TO authenticated` clause added to user-scoped policies
- [ ] `private` schema created with proper grants
- [ ] `private.current_user_id()` security definer function created
- [ ] Migration is idempotent (uses IF EXISTS/IF NOT EXISTS)
- [ ] Migration is atomic (wrapped in BEGIN/COMMIT)
- [ ] Inline comments explain each optimization

**Notes:**

- Reference plan section "Phase 1: Create One-Time Optimization Migration"
- Use DROP POLICY IF EXISTS / CREATE POLICY pattern for idempotence
- Mark functions as STABLE, not VOLATILE, for caching
- Grant USAGE on private schema to authenticated role only

---

### Task 2: Create User-Scoped RLS Template

**ID:** T2
**Priority:** p0
**Estimate:** 2h
**Dependencies:** T1
**Risk:** low

**Description:**
Create a reusable template for tables with simple user-scoped RLS (user_id column). Template should include all 6 optimizations baked in with detailed inline comments.

**Acceptance Criteria:**

- [ ] Template file created: `supabase/templates/table-with-user-rls.sql`
- [ ] Template uses TABLENAME placeholder for search/replace
- [ ] Includes index on user_id column
- [ ] Includes policy with `(SELECT auth.uid())` wrapper
- [ ] Includes `TO authenticated` clause
- [ ] Includes client-side optimization example in comment
- [ ] Includes inline comments explaining each optimization
- [ ] Includes performance impact percentages in comments
- [ ] Template is syntactically valid SQL

**Notes:**

- Reference plan section "Phase 2: Create Reusable Templates"
- Include usage instructions in file header comment
- Show both SELECT and INSERT/UPDATE/DELETE policy patterns
- Add comment about client-side filters (Phase 4)

---

### Task 3: Create Team-Scoped RLS Template

**ID:** T3
**Priority:** p1
**Estimate:** 2h
**Dependencies:** T1
**Risk:** low

**Description:**
Create a reusable template for tables with team/organization-scoped RLS (team_id column with join to membership table). Template should demonstrate security definer function pattern.

**Acceptance Criteria:**

- [ ] Template file created: `supabase/templates/table-with-team-rls.sql`
- [ ] Template uses TABLENAME placeholder for search/replace
- [ ] Includes security definer function for team membership lookup
- [ ] Includes index on team_id column
- [ ] Includes policy using security definer function (avoids joins)
- [ ] Includes `TO authenticated` clause
- [ ] Includes inline comments explaining complex join optimization
- [ ] Includes performance impact comparison (with vs without security definer)
- [ ] Template is syntactically valid SQL

**Notes:**

- Reference plan section "Phase 2: Create Reusable Templates"
- Show pattern: `team_id IN (SELECT private.user_teams())`
- Explain why this avoids join overhead in policy evaluation
- Include warning about security definer best practices

---

### Task 4: Create Templates README

**ID:** T4
**Priority:** p1
**Estimate:** 1h
**Dependencies:** T2, T3
**Risk:** low

**Description:**
Create a README in the templates directory explaining purpose, usage, and linking to comprehensive documentation.

**Acceptance Criteria:**

- [ ] File created: `supabase/templates/README.md`
- [ ] Explains purpose of template directory
- [ ] Lists available templates with descriptions
- [ ] Shows basic usage example (copy, customize, apply)
- [ ] Links to main RLS_OPTIMIZATION.md documentation
- [ ] Includes quickstart checklist for new tables

**Notes:**

- Keep brief (1-2 paragraphs + example)
- Focus on "how to use" rather than "why"
- Link to comprehensive docs for theory

---

### Task 5: Write RLS Optimization Guide

**ID:** T5
**Priority:** p0
**Estimate:** 3h
**Dependencies:** T1, T2, T3
**Risk:** low

**Description:**
Create comprehensive documentation explaining all 6 optimization strategies, when to use them, performance impacts, and patterns/anti-patterns. This is the authoritative reference for RLS optimization.

**Acceptance Criteria:**

- [ ] File created: `docs/database/RLS_OPTIMIZATION.md`
- [ ] Quick reference table: optimization → impact
- [ ] Checklist for new tables with RLS
- [ ] Pattern examples: ✅ optimized vs ❌ anti-patterns
- [ ] All 6 optimization phases documented with code examples
- [ ] Client-side optimization guide (TypeScript/Supabase client)
- [ ] Troubleshooting section (common issues)
- [ ] Links to templates and migrations
- [ ] References to Supabase official docs
- [ ] Performance metrics table (before/after)

**Notes:**

- Reference plan section "Phase 3: Write Comprehensive Documentation"
- Include "Why" for each optimization
- Show realistic code examples from \_health_check table
- Explain trade-offs (e.g., security definer risks)

---

### Task 6: Update Testing Guide

**ID:** T6
**Priority:** p2
**Estimate:** 1h
**Dependencies:** T5
**Risk:** low

**Description:**
Add section to TESTING_GUIDE.md explaining how to validate RLS optimizations and what tests to write when using the templates.

**Acceptance Criteria:**

- [ ] New section added to `docs/testing/TESTING_GUIDE.md`
- [ ] Explains RLS optimization validation tests
- [ ] Shows pgTAP examples for checking indexes
- [ ] Shows pgTAP examples for checking function configuration
- [ ] Links to 003-rls-optimization.sql test file
- [ ] Explains when to add new validation tests

**Notes:**

- Keep brief (leverage existing pgTAP knowledge)
- Focus on "what to test" not "how pgTAP works"
- Link back to RLS_OPTIMIZATION.md for patterns

---

### Task 7: Create Validation Tests

**ID:** T7
**Priority:** p0
**Estimate:** 2h
**Dependencies:** T1
**Risk:** medium

**Description:**
Create pgTAP tests that validate the optimization infrastructure is correctly configured and RLS security is maintained. Tests should catch regressions if someone removes optimizations.

**Acceptance Criteria:**

- [ ] Test file created: `supabase/tests/003-rls-optimization.sql`
- [ ] Test: private schema exists
- [ ] Test: private.current_user_id() function exists
- [ ] Test: function is SECURITY DEFINER
- [ ] Test: function is STABLE (not VOLATILE)
- [ ] Test: indexes exist on \_health_check policy filter columns
- [ ] Test: policies specify TO authenticated correctly
- [ ] Test: RLS still enforces security (unauthorized access blocked)
- [ ] Tests use existing pgTAP infrastructure from Issue #236
- [ ] Tests pass with `pnpm test:rls`

**Notes:**

- Reference plan section "Phase 4: Add Validation Tests"
- Use pgTAP functions: has_schema, has_function, function_returns
- Reuse security validation patterns from 002-rls-policies.sql
- Tests should be fast (<1 second total)

---

### Task 8: Update Project Documentation

**ID:** T8
**Priority:** p1
**Estimate:** 1h
**Dependencies:** T4, T5, T6
**Risk:** low

**Description:**
Update main README.md and related documentation to make RLS optimization discoverable and link to the new resources.

**Acceptance Criteria:**

- [ ] README.md updated with link to RLS optimization guide
- [ ] Database section mentions template files
- [ ] Link added to templates directory
- [ ] Clear guidance on when to use templates
- [ ] Migration workflow documentation references templates

**Notes:**

- Reference plan section "Phase 5: Update Project Documentation"
- Keep README changes minimal (1-2 sentences + link)
- Ensure documentation is discoverable for new developers

---

### Task 9: Manual Testing & Validation

**ID:** T9
**Priority:** p0
**Estimate:** 1h
**Dependencies:** T1, T7
**Risk:** low

**Description:**
Perform end-to-end manual testing to ensure migration works, application functionality is unchanged, and templates can be successfully used.

**Acceptance Criteria:**

- [ ] Migration runs without errors (`supabase db reset`)
- [ ] Existing application functionality unchanged
- [ ] Anonymous users can access health check endpoint
- [ ] Authenticated users can access health check endpoint
- [ ] Private schema not exposed via PostgREST API
- [ ] User-scoped template can be copied and applied
- [ ] Team-scoped template can be copied and applied
- [ ] Documentation code examples compile correctly
- [ ] All existing tests still pass

**Notes:**

- Reference plan section "Manual Testing Checklist"
- Test with actual Supabase client queries
- Verify no breaking changes to application
- Document any issues found during testing

---

## Implementation Order

**Phase 1: Foundation** (depends on: none)

- T1: Create One-Time Optimization Migration (3h)

**Phase 2: Templates** (depends on: Phase 1)

- T2: Create User-Scoped RLS Template (2h)
- T3: Create Team-Scoped RLS Template (2h)
- T4: Create Templates README (1h)

**Phase 3: Documentation** (depends on: Phase 1, Phase 2)

- T5: Write RLS Optimization Guide (3h)
- T6: Update Testing Guide (1h)

**Phase 4: Validation** (depends on: Phase 1)

- T7: Create Validation Tests (2h)

**Phase 5: Integration** (depends on: Phase 3)

- T8: Update Project Documentation (1h)

**Phase 6: Verification** (depends on: Phase 1, Phase 4)

- T9: Manual Testing & Validation (1h)

## Risk Mitigation

### High-Risk Tasks

None identified. T1 and T7 are marked as medium risk:

**T1 (Create One-Time Optimization Migration):**

- **Risk:** Could break existing RLS security or application functionality
- **Mitigation:**
  - Use idempotent patterns (IF EXISTS checks)
  - Wrap in atomic transaction
  - Comprehensive validation tests (T7)
  - Manual testing before merge (T9)
  - Can rollback by re-running original migration

**T7 (Create Validation Tests):**

- **Risk:** Tests might not catch all security regressions
- **Mitigation:**
  - Leverage existing RLS test patterns from Issue #236
  - Test both infrastructure (indexes, functions) and behavior (security)
  - Run existing pgTAP tests to ensure no regressions
  - Manual testing as backup (T9)

### Dependencies

**Critical Path:** T1 → T7 → T9 (6h)
This is the minimum viable implementation that optimizes the existing table and validates correctness.

**Parallel Work:**

- T2 and T3 can be done in parallel (both depend only on T1)
- T5 and T7 can be done in parallel (both depend only on T1)
- T6 depends on T5 but can overlap with T8

**Potential Bottlenecks:**

- T1 is required for most other tasks (but only 3h)
- T5 (documentation) is 3h and blocks T6 and T8
- Mitigation: Start T5 early, can draft in parallel with T2/T3

## Testing Strategy

**Per-Task Testing:**

- T1: Migration runs cleanly, existing tests pass
- T2/T3: Templates are syntactically valid SQL
- T5/T6: Documentation examples compile/run
- T7: pgTAP tests pass, catch expected failures
- T9: Full integration testing

**Integration Testing:**

After Phase 1 complete:

- Verify migration applied successfully
- Run all existing tests
- Test health check endpoint manually

After Phase 4 complete:

- Run all pgTAP tests including new validation tests
- Verify no security regressions

After Phase 6 complete:

- Full application regression testing
- Verify templates work end-to-end
- Validate documentation accuracy

**Coverage Targets:**

- Infrastructure tests: 100% (private schema, functions, indexes)
- Security tests: Maintain existing RLS test coverage
- Template validation: Manual (syntactic validity)

## Success Metrics

### Immediate Success Criteria

- [ ] All 9 tasks completed
- [ ] Migration applied to `_health_check` table
- [ ] 2 reusable templates created
- [ ] Comprehensive documentation written
- [ ] 8+ validation tests passing
- [ ] Zero regressions in existing functionality
- [ ] Zero security vulnerabilities introduced

### Quality Metrics

- [ ] Documentation is complete and accurate
- [ ] Templates are self-documenting with inline comments
- [ ] Tests catch regressions if optimizations removed
- [ ] New developers can use templates without guidance

### Future Success (Post-Implementation)

- [ ] Developers successfully use templates for new tables
- [ ] No RLS-related performance issues reported
- [ ] Query times meet <10ms target when benchmarked
- [ ] Security boundaries maintained in production

## References

- Spec: [specs/optimize-rls-policy-performance.md](../specs/optimize-rls-policy-performance.md)
- Plan: [plans/optimize-rls-policy-performance.md](../plans/optimize-rls-policy-performance.md)
- Issue: #237
- Related: #226 (Implement RLS policies), #228 (RLS test helpers), #236 (pgTAP testing)
- External: [Supabase RLS Performance Guide](https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices)
