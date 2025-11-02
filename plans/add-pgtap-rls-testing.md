---
id: PLAN-add-pgtap-rls-testing
parentId: SPEC-add-pgtap-rls-testing
title: Add pgTAP database-level RLS testing - Implementation Plan
type: plan
spec: specs/add-pgtap-rls-testing.md
issue: 236
lane: spec-driven
created: 2025-10-31
status: draft
---

# Add pgTAP database-level RLS testing - Implementation Plan

## Overview

Implement comprehensive database-level RLS testing using pgTAP and basejump-supabase_test_helpers. This provides transaction-isolated testing, schema-wide validation, and database-level accuracy that complements existing application-level RLS tests.

## Design Decisions

### 1. Allowlist Approach for Table Validation

- Use `tests.rls_enabled('public')` to validate RLS on all tables in public schema
- Maintain explicit allowlist for intentional exceptions (audit logs, health checks, service tables)
- Fail CI/CD if non-excepted tables lack RLS policies
- **Rationale**: Explicit security boundaries are critical; allowlist prevents accidental RLS gaps

### 2. Unified Test Helper Installation (Option A)

- Single setup file (`000-setup-tests-hooks.sql`) installs all dependencies
- Includes pgTAP, dbdev integration, and basejump-supabase_test_helpers
- **Rationale**: Matches Supabase best practices, simpler maintenance, stable dependencies

### 3. Transaction-Based Test Isolation

- All tests wrapped in `BEGIN/ROLLBACK` transactions
- No test data persists after test runs
- **Rationale**: Cleaner than application-level tests that require manual cleanup
- **Note**: Transaction rollback means tests cannot verify persistent state changes. This is intentional—use application-level tests (Vitest) to validate data persistence across requests

### 4. Complementary to Application Tests

- pgTAP tests validate database-level RLS enforcement
- Existing Vitest tests validate application-level RLS behavior
- Both test suites run independently in CI/CD
- **Rationale**: Defense in depth - test RLS at multiple layers

## Architecture

### File Structure

```text
supabase/
├── tests/                          # New directory for pgTAP tests
│   ├── 000-setup-tests-hooks.sql  # Extension & helper installation
│   ├── 001-rls-enabled.sql        # Schema-wide RLS validation
│   └── 002-user-isolation.sql     # User isolation testing
├── migrations/
│   └── 20250926120000_add_query_rpc_function.sql
├── config.toml
└── seed.sql
```

### Component Breakdown

**1. Setup Hook (000-setup-tests-hooks.sql)**

- Installs `http` and `pg_tle` extensions (prerequisites)
- Installs basejump-supabase_test_helpers via dbdev
- Runs verification test to confirm setup succeeded

**2. Schema-Wide RLS Validation (001-rls-enabled.sql)**

- Uses `tests.rls_enabled('public')` helper
- Validates all tables in public schema have RLS enabled
- Fails if any non-excepted table lacks RLS

**3. User Isolation Tests (002-user-isolation.sql)**

- Creates test users with `tests.create_supabase_user()`
- Switches authentication context with `tests.authenticate_as()`
- Validates users can only access their own data
- Tests SELECT, INSERT, UPDATE, DELETE policy enforcement

### Data Flow

```text
supabase test db
    ↓
Files run alphabetically (000 → 001 → 002)
    ↓
Each test: BEGIN → plan(N) → tests → finish() → ROLLBACK
    ↓
No side effects (transaction rollback)
```

## Implementation Phases

### Phase 1: Create Test Infrastructure

**Goal:** Set up pgTAP test directory and installation script

**Tasks:**

- Create `supabase/tests/` directory
- Create `000-setup-tests-hooks.sql` with extension installation
- Verify setup by running `supabase test db`

**Deliverables:**

- `supabase/tests/` directory exists
- Setup hook successfully installs pgTAP and test helpers
- Verification test passes

**Estimated time:** 30 minutes

---

### Phase 2: Add Schema-Wide RLS Validation

**Goal:** Validate RLS is enabled on all tables

**Tasks:**

- Create `001-rls-enabled.sql` test file
- Use `tests.rls_enabled('public')` helper
- Run test locally to verify it passes
- Document any intentional RLS exceptions

**Deliverables:**

- Schema-wide RLS validation test passes
- Documentation of RLS exceptions (if any)

**Estimated time:** 30 minutes

---

### Phase 3: Add User Isolation Tests

**Goal:** Validate users can only access their own data

**Tasks:**

- Create `002-user-isolation.sql` test file
- Implement user creation and authentication switching
- Add tests for existing tables with RLS policies
- Verify tests pass with transaction rollback

**Deliverables:**

- User isolation tests for all RLS-protected tables
- Tests pass locally without side effects

**Estimated time:** 1 hour

---

### Phase 4: Integrate with Package Scripts

**Goal:** Add pgTAP test commands to package.json

**Tasks:**

- Add `test:rls` command to root package.json
- Add `test:rls:watch` command for development
- Test commands work locally

**Deliverables:**

- `pnpm test:rls` command works
- `pnpm test:rls:watch` command works
- Commands documented in TESTING_GUIDE.md

**Estimated time:** 15 minutes

---

### Phase 5: Add CI/CD Integration

**Goal:** Run pgTAP tests in CI/CD pipeline

**Tasks:**

- Add pgTAP test step to GitHub Actions workflow
- Position after `db:validate:rls` step
- Verify tests pass in CI environment
- Configure failure handling (block vs. warn)

**Deliverables:**

- pgTAP tests run in CI/CD
- Tests block deployment on failure
- CI logs show test results

**Estimated time:** 30 minutes

---

### Phase 6: Update Documentation

**Goal:** Document pgTAP RLS testing for developers

**Tasks:**

- Add pgTAP section to `docs/testing/TESTING_GUIDE.md`
- Include setup instructions
- Add example test patterns
- Document troubleshooting steps

**Deliverables:**

- TESTING_GUIDE.md includes pgTAP section
- Examples show how to write new RLS tests
- Troubleshooting guide for common issues

**Estimated time:** 45 minutes

## Technical Specifications

### Setup Hook File

**File:** `supabase/tests/000-setup-tests-hooks.sql`

```sql
-- Install pgTAP (required for all test functions)
create extension if not exists pgtap with schema extensions;

-- Install required extensions for test helpers
create extension if not exists http with schema extensions;
create extension if not exists pg_tle;

-- Install dbdev (Supabase's package manager for Postgres extensions)
create extension if not exists "supabase-dbdev";

-- Install basejump test helpers from database.dev
-- This provides simplified RLS testing utilities
select dbdev.install('basejump-supabase_test_helpers');
create extension if not exists "basejump-supabase_test_helpers" version '0.0.6';

-- Verify setup completed successfully
begin;
select plan(1);
select ok(true, 'Pre-test hook completed successfully');
select * from finish();
rollback;
```

### Schema-Wide RLS Validation

**File:** `supabase/tests/001-rls-enabled.sql`

```sql
begin;
select plan(1);

-- Verify RLS is enabled on all tables in public schema
-- This will fail if any table lacks RLS (unless explicitly excepted)
select tests.rls_enabled('public');

select * from finish();
rollback;
```

### User Isolation Tests Template

**File:** `supabase/tests/002-user-isolation.sql`

```sql
begin;
select plan(4);

-- Create test users
select tests.create_supabase_user('user1');
select tests.create_supabase_user('user2');

-- Get user IDs for reference
\set user1_id (select tests.get_supabase_uid('user1'))
\set user2_id (select tests.get_supabase_uid('user2'))

-- Test as User 1: Create data
select tests.authenticate_as('user1');

-- Example: Insert profile data for user1
-- INSERT INTO public.profiles (id, user_id, name)
-- VALUES (gen_random_uuid(), tests.get_supabase_uid('user1'), 'User 1');

-- Verify User 1 can see their own data
select results_eq(
  'SELECT COUNT(*)::int FROM public.profiles WHERE user_id = tests.get_supabase_uid(''user1'')',
  ARRAY[1],
  'User 1 can see their own profile'
);

-- Test as User 2: Verify isolation
select tests.authenticate_as('user2');

-- Verify User 2 cannot see User 1's data
select results_eq(
  'SELECT COUNT(*)::int FROM public.profiles WHERE user_id = tests.get_supabase_uid(''user1'')',
  ARRAY[0],
  'User 2 cannot see User 1''s profile'
);

-- Verify User 2 can create their own data
-- INSERT INTO public.profiles (id, user_id, name)
-- VALUES (gen_random_uuid(), tests.get_supabase_uid('user2'), 'User 2');

select results_eq(
  'SELECT COUNT(*)::int FROM public.profiles WHERE user_id = tests.get_supabase_uid(''user2'')',
  ARRAY[1],
  'User 2 can see their own profile'
);

-- Test anonymous user: Verify no access
select tests.clear_authentication();

select results_eq(
  'SELECT COUNT(*)::int FROM public.profiles',
  ARRAY[0],
  'Anonymous users cannot see any profiles'
);

select * from finish();
rollback;
```

### Package.json Integration

**File:** `package.json` (root)

```json
{
  "scripts": {
    "test:rls": "supabase test db",
    "test:rls:watch": "supabase test db --watch"
  }
}
```

## Testing Strategy

### Test Execution Order

1. **Setup** (`000-setup-tests-hooks.sql`) - Runs first, installs dependencies
2. **Schema validation** (`001-rls-enabled.sql`) - Validates RLS enabled on all tables
3. **User isolation** (`002-user-isolation.sql`) - Tests policy enforcement

### Test Isolation

- All tests use `BEGIN/ROLLBACK` for transaction isolation
- Test users created via `tests.create_supabase_user()` auto-cleanup
- No manual cleanup required (unlike application-level tests)

### Test Coverage

**Database-level tests (pgTAP):**

- RLS enabled on all tables
- Policy completeness (SELECT, INSERT, UPDATE, DELETE)
- User isolation enforcement
- Anonymous user access restrictions

**Application-level tests (Vitest):**

- RLS helper functions work correctly
- API endpoints respect RLS
- Client-side auth context handling

### Performance Targets

- All pgTAP tests complete in < 10 seconds
- Individual tests complete in < 2 seconds
- No test data persists after runs

## Deployment

### Local Development

```bash
# Start Supabase local instance
pnpm db:start

# Run pgTAP tests
pnpm test:rls

# Watch mode for development
pnpm test:rls:watch
```

### CI/CD Integration

```yaml
# .github/workflows/ci.yml (excerpt)
- name: Run RLS validation (application-level)
  run: pnpm db:validate:rls

- name: Run RLS tests (database-level)
  run: pnpm test:rls
```

### Rollback Plan

If pgTAP tests cause issues:

1. **Disable in CI**: Comment out `test:rls` step temporarily
2. **Investigate locally**: Run `pnpm test:rls` to debug
3. **Remove test files**: Delete `supabase/tests/*.sql` if needed
4. **Cleanup extensions**: Remove test helpers if blocking migrations

## Risk Mitigation

### Risk 1: Test helpers not compatible with current Supabase version

**Mitigation:**

- Verified basejump-supabase_test_helpers v0.0.6 compatibility
- Test locally before CI/CD integration
- Fallback: Use raw pgTAP without helpers (more boilerplate)

### Risk 2: Tests fail due to intentional RLS exceptions

**Mitigation:**

- Document all RLS exceptions upfront
- Use allowlist approach in validation tests
- Provide clear error messages for developers

### Risk 3: Performance impact from test execution

**Mitigation:**

- All tests use transactions (fast rollback)
- Target < 10 seconds total execution time
- Run tests in parallel with other CI steps

### Risk 4: Migration conflicts with test extensions

**Mitigation:**

- Test helpers installed in `extensions` schema (isolated)
- Use `IF NOT EXISTS` for all extension creation
- Test locally before deploying migrations

## Success Criteria

### Functional Requirements

- [ ] pgTAP and basejump-supabase_test_helpers installed
- [ ] Schema-wide RLS validation test passes
- [ ] User isolation tests pass for all RLS-protected tables
- [ ] `pnpm test:rls` command works locally
- [ ] Tests run in CI/CD pipeline
- [ ] All tests complete in < 10 seconds

### Quality Requirements

- [ ] Tests run in rollback transactions (no side effects)
- [ ] Documentation updated in TESTING_GUIDE.md
- [ ] Clear error messages for RLS violations
- [ ] Examples show how to add new RLS tests

### Operational Requirements

- [ ] Tests pass consistently in CI/CD
- [ ] No false positives (tests fail only for real issues)
- [ ] Developers can run tests locally without setup

## References

- **Spec:** [specs/add-pgtap-rls-testing.md](../specs/add-pgtap-rls-testing.md)
- **Issue:** [#236: Add pgTAP database-level RLS testing](https://github.com/dissonancelabs/dl-starter/issues/236)
- **Related PRs:**
  - [#232: Implement RLS policies](https://github.com/dissonancelabs/dl-starter/pull/232)
  - [#235: Add RLS validation to CI/CD](https://github.com/dissonancelabs/dl-starter/pull/235)
  - [#238: Implement RLS test helpers](https://github.com/dissonancelabs/dl-starter/pull/238)
- **Documentation:**
  - [Supabase pgTAP Testing Guide](https://supabase.com/docs/guides/local-development/testing/pgtap-extended)
  - [basejump-supabase_test_helpers](https://github.com/usebasejump/supabase-test-helpers)
  - [Testing RLS with pgTAP (Basejump Guide)](https://usebasejump.com/blog/testing-on-supabase-with-pgtap)
  - [Database.dev Package Registry](https://database.dev)
  - [docs/testing/TESTING_GUIDE.md](../docs/testing/TESTING_GUIDE.md)
