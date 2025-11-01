---
id: PLAN-optimize-rls-policy-performance
title: Optimize RLS Policy Performance - Implementation Plan
type: plan
parentId: SPEC-optimize-rls-policy-performance
spec: specs/optimize-rls-policy-performance.md
issue: 237
lane: spec-driven
created: 2025-10-31
status: ready
---

# Optimize RLS Policy Performance - Implementation Plan

## Overview

Implement migration-first RLS optimization system that provides immediate value for the existing `_health_check` table and establishes reusable patterns for future tables. Focuses on the 6-phase optimization strategy validated against 2025 best practices.

**Current State:** Option A schema (minimal, 1 table, simple RLS)
**Future State:** Forward-compatible patterns that scale to Option B/C (complex multi-tenant schemas)

## Design Decisions

### 1. Migration-First Architecture (vs Schema-Change-First)

- **Rationale:** Version-controlled, atomic, reviewable, professional workflow
- **Benefit:** Clear audit trail, team-friendly, reusable across projects
- **Trade-off:** Requires discipline to use templates (mitigated by documentation)

### 2. Template Files (vs Code Generation)

- **Rationale:** Low maintenance, always visible, self-documenting
- **Benefit:** Copy-paste friendly, no scripts to maintain, easy to customize
- **Trade-off:** Manual process (acceptable for developer-facing tool)

### 3. Validation Testing Only (vs Full Benchmarking)

- **Rationale:** Only one simple table exists currently
- **Benefit:** Fast implementation (2-3 hours vs 6-8 hours)
- **Trade-off:** No performance metrics yet (acceptable, will benchmark with real data)

### 4. Private Schema for Security Definer Functions

- **Rationale:** Industry standard, not exposed via PostgREST API
- **Benefit:** Secure by default, clear separation of concerns
- **Trade-off:** None (pure upside)

## Architecture

### System Components

```text
┌─────────────────────────────────────────────────────┐
│  Migration-First RLS Optimization System            │
├─────────────────────────────────────────────────────┤
│                                                      │
│  1. One-Time Migration                              │
│     ├─ Optimize _health_check table                │
│     ├─ Create private schema                       │
│     └─ Add security definer helper function        │
│                                                      │
│  2. Reusable Templates                              │
│     ├─ table-with-user-rls.sql                     │
│     └─ table-with-team-rls.sql (future use)        │
│                                                      │
│  3. Documentation                                   │
│     ├─ RLS_OPTIMIZATION.md (guide)                 │
│     └─ Inline comments (templates)                 │
│                                                      │
│  4. Validation Tests                                │
│     └─ 003-rls-optimization.sql (pgTAP)            │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Data Flow

```text
Developer creates new table
    ↓
Copies template from supabase/templates/
    ↓
Customizes table name & columns
    ↓
Runs migration
    ↓
All 6 optimizations applied automatically:
  1. Index on filter column ✓
  2. auth.uid() wrapped in SELECT ✓
  3. Security definer functions available ✓
  4. Client-side filter documented ✓
  5. No policy joins (template design) ✓
  6. TO authenticated clause ✓
```

## Implementation Phases

### Phase 1: Create One-Time Optimization Migration

**Goal:** Apply all 6 optimizations to existing `_health_check` table and establish infrastructure.

**Tasks:**

- Create migration file `20251031_optimize_rls_performance.sql`
- Add index on relevant columns
- Recreate policies with `(SELECT auth.uid())` wrapper
- Add `TO authenticated` role specification
- Create `private` schema
- Create `private.current_user_id()` security definer function
- Add inline comments explaining each optimization

**Deliverables:**

- `supabase/migrations/20251031_optimize_rls_performance.sql`
- Idempotent migration (uses IF EXISTS/IF NOT EXISTS)
- Atomic transaction (BEGIN/COMMIT)

**Validation:**

- Migration runs successfully
- Existing tests still pass
- RLS still enforces security correctly

---

### Phase 2: Create Reusable Templates

**Goal:** Provide copy-paste templates for future tables with optimizations baked in.

**Tasks:**

- Create template directory `supabase/templates/`
- Write `table-with-user-rls.sql` template
  - Include all 6 optimizations
  - Add detailed inline comments
  - Include client-side optimization examples
- Write `table-with-team-rls.sql` template
  - Include security definer function pattern
  - Document complex join optimization
  - Add usage instructions

**Deliverables:**

- `supabase/templates/table-with-user-rls.sql`
- `supabase/templates/table-with-team-rls.sql`
- Templates include TABLENAME placeholder for easy search/replace

**Validation:**

- Templates are syntactically valid SQL
- Comments explain WHY for each optimization
- Performance impact documented inline

---

### Phase 3: Write Comprehensive Documentation

**Goal:** Guide developers to apply patterns correctly and understand trade-offs.

**Tasks:**

- Create `docs/database/RLS_OPTIMIZATION.md`
  - Quick reference table (optimization → impact)
  - Checklist for new tables
  - Pattern examples (✅ optimized, ❌ anti-patterns)
  - Client-side optimization guide
  - Troubleshooting section
- Update `docs/testing/TESTING_GUIDE.md`
  - Add RLS optimization validation tests section
- Add templates README
  - Explain purpose of templates directory
  - Link to main documentation

**Deliverables:**

- `docs/database/RLS_OPTIMIZATION.md` (comprehensive guide)
- `supabase/templates/README.md` (quick start)
- Updated `docs/testing/TESTING_GUIDE.md`

**Validation:**

- Documentation is complete and accurate
- Code examples compile/run
- Links between docs work correctly

---

### Phase 4: Add Validation Tests

**Goal:** Ensure optimizations work correctly and don't break security.

**Tasks:**

- Create pgTAP test file `supabase/tests/003-rls-optimization.sql`
  - Test private schema exists
  - Test helper function configured correctly (SECURITY DEFINER, STABLE)
  - Test indexes exist on policy filter columns
  - Test policies specify roles correctly
  - Test RLS still enforces security
- Add test documentation to TESTING_GUIDE.md

**Deliverables:**

- `supabase/tests/003-rls-optimization.sql`
- 8+ test cases covering infrastructure and behavior
- Tests use existing pgTAP infrastructure from Issue #236

**Validation:**

- `pnpm test:rls` passes
- Tests run in CI/CD pipeline
- Tests catch regressions

---

### Phase 5: Update Project Documentation

**Goal:** Make optimization patterns discoverable and easy to adopt.

**Tasks:**

- Update main `README.md`
  - Add link to RLS optimization guide
  - Mention template files in database section
- Update database migration workflow docs
  - Reference templates when creating tables
- Add performance optimization to best practices

**Deliverables:**

- Updated `README.md`
- Links to templates and documentation
- Clear guidance on when/how to use

**Validation:**

- New developers can find and use templates
- Documentation is discoverable

## Technical Specifications

### Migration File Structure

```sql
-- 20251031_optimize_rls_performance.sql
BEGIN;

-- Phase 1: Indexes
CREATE INDEX IF NOT EXISTS idx_health_check_id
  ON public._health_check(id);

-- Phase 2 & 6: Recreate policies with optimizations
DROP POLICY IF EXISTS "..." ON public._health_check;
CREATE POLICY "..." ON public._health_check
  FOR SELECT
  TO authenticated  -- Phase 6
  USING (true);

-- Phase 3: Infrastructure
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE OR REPLACE FUNCTION private.current_user_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$ SELECT auth.uid(); $$;

COMMIT;
```

### User-Scoped Template Pattern

```sql
-- Key optimizations:
-- 1. Index on user_id (99.94% improvement)
CREATE INDEX idx_TABLENAME_user_id ON public.TABLENAME(user_id);

-- 2. Wrap auth.uid() in SELECT (94.97% improvement)
-- 6. Specify TO authenticated (99.78% improvement for anon)
CREATE POLICY "..." ON public.TABLENAME
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));
```

### Team-Scoped Template Pattern

```sql
-- 3. Security definer function (99.993% improvement)
CREATE FUNCTION private.user_teams()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$ SELECT team_id FROM team_members WHERE user_id = auth.uid(); $$;

-- 5. Minimize joins (99.78% improvement)
CREATE POLICY "..." ON public.TABLENAME
  FOR SELECT
  TO authenticated
  USING (team_id IN (SELECT private.user_teams()));
```

### Client-Side Optimization Pattern

```typescript
// Phase 4: Always add explicit filters (94.74% improvement)
// ✅ Good
const { data } = await supabase.from('profiles').select().eq('user_id', userId);

// ❌ Bad
const { data } = await supabase.from('profiles').select();
```

## Testing Strategy

### Validation Tests (pgTAP)

```sql
-- supabase/tests/003-rls-optimization.sql
begin;
select plan(8);

-- Infrastructure tests
select has_schema('private');
select has_function('private', 'current_user_id');
select function_returns('private', 'current_user_id', 'uuid');

-- Index tests
select col_is_indexed('public', '_health_check', 'id');

-- Policy tests
select policies_are('public', '_health_check',
  ARRAY['Allow anonymous health check reads',
        'Allow authenticated health check reads']);

-- Security tests (from existing RLS tests)
-- Verify RLS still blocks unauthorized access

select * from finish();
rollback;
```

### Manual Testing Checklist

- [ ] Migration runs without errors
- [ ] Existing application functionality unchanged
- [ ] Anonymous users can access health check
- [ ] Authenticated users can access health check
- [ ] Private schema not exposed via API
- [ ] Templates can be copied and used successfully
- [ ] Documentation examples compile correctly

### Performance Testing (Future)

Deferred until production schema with realistic data volumes exists:

- Create benchmark script with pgbench
- Generate 10k+ rows of test data
- Measure query times before/after optimizations
- Document performance improvements in ADR

## Deployment

### Migration Application

```bash
# Local development
supabase db reset  # Applies all migrations including optimization

# Production (when ready)
supabase db push   # Applies pending migrations
```

### Rollback Plan

Migration is idempotent and uses `IF EXISTS` checks:

- Safe to re-run if issues occur
- Policies use DROP/CREATE pattern
- Can manually revert by dropping policies and recreating originals
- Private schema can be dropped if needed

### Zero-Downtime Considerations

- Adding indexes is non-blocking on small tables
- Policy changes are atomic (DROP then CREATE in transaction)
- No data migration required
- No application code changes required

## Risk Mitigation

### Risk: Breaking existing RLS security

**Mitigation:**

- Comprehensive validation tests
- Existing pgTAP RLS tests still pass
- Manual testing with different user roles

### Risk: Templates not followed by developers

**Mitigation:**

- Clear documentation with examples
- Inline comments explain WHY
- Checklist in docs
- Template files in obvious location

### Risk: Performance claims not validated

**Mitigation:**

- Reference official Supabase benchmarks
- Defer custom benchmarks until real data exists
- Document that improvements come from Supabase research

### Risk: Security definer functions expose data

**Mitigation:**

- Private schema not exposed via PostgREST
- Functions only return IDs, not sensitive data
- SECURITY DEFINER pattern is industry standard
- Documentation includes security warnings

## Success Criteria

### Immediate (Phase 1-4 Complete)

- [ ] One-time migration applied successfully
- [ ] Private schema and helper function created
- [ ] Templates created and validated
- [ ] Documentation complete and accurate
- [ ] Validation tests pass
- [ ] Existing application functionality unchanged

### Future (When Used on Real Projects)

- [ ] Developers successfully use templates for new tables
- [ ] No RLS-related performance issues in production
- [ ] Query times meet <10ms target
- [ ] Security boundaries maintained correctly

## Out of Scope

- Performance benchmarking with synthetic data
- Application code changes
- Migration of non-existent tables
- Query optimization beyond RLS
- Database hardware scaling
- Automated enforcement of template usage

## References

### Documentation

- Spec: [specs/optimize-rls-policy-performance.md](../specs/optimize-rls-policy-performance.md)
- Issue: #237

### Research & Best Practices

- [Supabase RLS Performance Guide](https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices)
- [PostgreSQL Row Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Security Definer Functions](https://www.postgresql.org/docs/current/sql-createfunction.html)

### Related Issues

- Issue #226 (Implement RLS policies)
- Issue #228 (Implement missing RLS test helpers)
- Issue #236 (Add pgTAP database-level RLS testing)

### Web Research (2025 Best Practices)

- Confirmed: Index optimization (99.94% improvement)
- Confirmed: SELECT wrapper for function caching (94.97% improvement)
- Confirmed: Security definer bypasses RLS on join tables (99.993% improvement)
- Confirmed: Role specification reduces overhead (99.78% improvement)
- Confirmed: Minimize joins in policies (99.78% improvement)
- Confirmed: Client-side filters help query planner (94.74% improvement)

All optimizations validated against current Supabase/PostgreSQL documentation.
