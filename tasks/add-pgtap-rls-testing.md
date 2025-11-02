---
id: TASK-add-pgtap-rls-testing
parentId: PLAN-add-pgtap-rls-testing
title: Add pgTAP database-level RLS testing - Task Breakdown
type: task
spec: specs/add-pgtap-rls-testing.md
plan: plans/add-pgtap-rls-testing.md
issue: 236
created: 2025-10-31
status: ready
total_estimate: 4h
---

# Add pgTAP database-level RLS testing - Task Breakdown

## Summary

**Total Estimated Effort:** 4 hours
**Number of Tasks:** 6
**High-Risk Tasks:** 1

## T1 Troubleshooting Checklist

If T1 (pgTAP infrastructure) fails, use this checklist to diagnose:

1. **Verify Supabase CLI version**: `supabase --version` (requires v1.50.0+)
2. **Check Docker is running**: `docker ps` (Supabase requires Docker)
3. **Verify extensions install**: `SELECT * FROM pg_extension WHERE extname IN ('pgtap', 'http', 'pg_tle', 'supabase-dbdev');`
4. **Test helper availability**: `SELECT tests.create_supabase_user('test@example.com');`
5. **Common error messages**:
   - "extension 'pgtap' not found" → Setup hook didn't run, check `supabase/tests/000-setup-tests-hooks.sql`
   - "function tests.create_supabase_user does not exist" → basejump helpers failed to install, check dbdev installation
   - "dial tcp 127.0.0.1:54322: connection refused" → Supabase not started, run `pnpm db:start`

**Fallback Option**: If basejump helpers fail to install, use raw pgTAP without helpers (more boilerplate required). See [pgTAP documentation](https://pgtap.org/documentation.html) for manual test user creation patterns.

## Task List

### Task 1: Create pgTAP Test Infrastructure

**ID:** T1
**Priority:** p0
**Estimate:** 1h
**Dependencies:** None
**Risk:** medium

**Description:**
Set up the `supabase/tests/` directory and create the setup hook file that installs pgTAP, dbdev, and basejump-supabase_test_helpers. This establishes the foundation for all database-level RLS testing.

**Acceptance Criteria:**

- [ ] `supabase/tests/` directory created
- [ ] `000-setup-tests-hooks.sql` file created with extension installation
- [ ] File installs `pgtap` extension (CRITICAL: required for all tests)
- [ ] File installs `http` extension (prerequisite for test helpers)
- [ ] File installs `pg_tle` extension (prerequisite for dbdev)
- [ ] File installs `supabase-dbdev` extension (package manager)
- [ ] File installs `basejump-supabase_test_helpers` version 0.0.6 via dbdev
- [ ] Setup verification test passes (plan(1) with success message)
- [ ] `supabase test db` command runs without errors
- [ ] All extensions load successfully

**Notes:**

- **CRITICAL**: Must install `pgtap` extension first - it's required for all test functions
- **CRITICAL**: Must install `supabase-dbdev` before using `dbdev.install()`
- Correct installation order: pgtap → http → pg_tle → supabase-dbdev → basejump helpers
- Run `supabase test db` locally to verify installation works
- If extensions fail to load, check Supabase CLI version (must support test hooks)
- Reference: https://supabase.com/docs/guides/local-development/testing/pgtap-extended

---

### Task 2: Add Schema-Wide RLS Validation Test

**ID:** T2
**Priority:** p0
**Estimate:** 30m
**Dependencies:** T1
**Risk:** low

**Description:**
Create a test that validates RLS is enabled on all tables in the public schema using the `tests.rls_enabled()` helper. This catches any tables that accidentally lack RLS policies.

**Acceptance Criteria:**

- [ ] `001-rls-enabled.sql` file created
- [ ] Test uses `tests.rls_enabled('public')` helper
- [ ] Test wrapped in BEGIN/ROLLBACK transaction
- [ ] Test includes proper plan(1) and finish() calls
- [ ] Test passes locally with `supabase test db`
- [ ] Documentation includes list of intentional RLS exceptions (if any)

**Notes:**

- This test may initially fail if any tables lack RLS - that's expected
- Document any tables that intentionally don't have RLS (e.g., audit logs, health checks)
- Use the exact test code from the plan's technical specifications

---

### Task 3: Add User Isolation Tests

**ID:** T3
**Priority:** p0
**Estimate:** 1.5h
**Dependencies:** T2
**Risk:** high

**Description:**
Create comprehensive user isolation tests that validate users can only access their own data. Test SELECT, INSERT, UPDATE, and DELETE operations for each table with RLS policies. Verify anonymous users are properly restricted.

**Acceptance Criteria:**

- [ ] `002-user-isolation.sql` file created
- [ ] Tests create multiple test users using `tests.create_supabase_user()`
- [ ] Tests switch authentication context using `tests.authenticate_as()`
- [ ] Tests validate user can see own data (SELECT)
- [ ] Tests validate user cannot see other users' data (SELECT)
- [ ] Tests validate user can create own data (INSERT)
- [ ] Tests validate user cannot modify others' data (UPDATE)
- [ ] Tests validate user cannot delete others' data (DELETE)
- [ ] Tests validate anonymous users have no access
- [ ] All tests wrapped in BEGIN/ROLLBACK transaction
- [ ] Tests pass locally without side effects

**Notes:**

- **CURRENT STATE**: Only `_health_check` table exists with RLS (see supabase/seed.sql)
- High risk due to dependency on existing RLS policies (Issues #226, #227)
- Initial implementation will test only `_health_check` table
- As more tables with RLS are added (via Issues #226, #227), expand tests to cover them
- `_health_check` has open read policies (anon + authenticated) - focus on write operations for isolation testing
- May need to create test data for tables that don't have any yet
- Use `results_eq()` for assertions or `is_empty()` for blocked operations
- Reference the template in the plan's technical specifications
- Consider using `throws_ok()` to verify INSERT/UPDATE/DELETE violations raise errors

---

### Task 4: Integrate with Package Scripts

**ID:** T4
**Priority:** p1
**Estimate:** 15m
**Dependencies:** T3
**Risk:** low

**Description:**
Add pgTAP test commands to the root `package.json` to enable easy local testing. Create both regular and watch mode commands.

**Acceptance Criteria:**

- [ ] `test:rls` script added to root package.json
- [ ] `test:rls:watch` script added to root package.json
- [ ] `pnpm test:rls` command works locally
- [ ] `pnpm test:rls:watch` command works locally
- [ ] Commands return proper exit codes (0 for pass, 1 for fail)

**Notes:**

- Commands should use `supabase test db` (and `--watch` flag for watch mode)
- Test both commands locally before marking complete
- Ensure commands work from any subdirectory in the monorepo

---

### Task 5: Add CI/CD Integration

**ID:** T5
**Priority:** p1
**Estimate:** 30m
**Dependencies:** T4
**Risk:** medium

**Description:**
Integrate pgTAP tests into the GitHub Actions CI/CD workflow. Position the step after the existing RLS validation step and configure proper failure handling.

**Acceptance Criteria:**

- [ ] New CI step added to `.github/workflows/ci.yml`
- [ ] Step positioned after `db:validate:rls` step
- [ ] Step runs `pnpm test:rls`
- [ ] Tests pass in CI environment
- [ ] Failures block the pipeline (no `continue-on-error: true`)
- [ ] CI logs clearly show test results
- [ ] Test execution time < 10 seconds in CI

**Notes:**

- May need to ensure Supabase is properly started in CI before running tests
- Check existing CI workflow for Supabase setup steps
- Monitor first CI run closely for environment-specific issues

---

### Task 6: Update Documentation

**ID:** T6
**Priority:** p2
**Estimate:** 45m
**Dependencies:** T5
**Risk:** low

**Description:**
Add comprehensive pgTAP documentation to the testing guide. Include setup instructions, usage examples, test patterns, and troubleshooting guidance.

**Acceptance Criteria:**

- [ ] New pgTAP section added to `docs/testing/TESTING_GUIDE.md`
- [ ] Section includes overview of pgTAP vs. application-level RLS testing
- [ ] Section includes setup instructions (already done via T1, but explain)
- [ ] Section includes command usage (`pnpm test:rls`, watch mode)
- [ ] Section includes example test patterns for common scenarios
- [ ] Section includes how to add new RLS tests
- [ ] Section includes troubleshooting guide for common issues
- [ ] Section includes performance considerations
- [ ] Updated spec file frontmatter with `tasks: tasks/add-pgtap-rls-testing.md`

**Notes:**

- Use the existing TESTING_GUIDE.md structure as reference
- Include code examples from the implemented test files
- Document the complementary relationship with application-level tests
- Add troubleshooting for common errors (extension loading, test failures, etc.)

---

## Implementation Order

**Phase 1: Foundation** (depends on: none)

- T1: Create pgTAP Test Infrastructure (1h)

**Phase 2: Core Tests** (depends on: Phase 1)

- T2: Add Schema-Wide RLS Validation Test (30m)
- T3: Add User Isolation Tests (1.5h)

**Phase 3: Integration** (depends on: Phase 2)

- T4: Integrate with Package Scripts (15m)
- T5: Add CI/CD Integration (30m)

**Phase 4: Documentation** (depends on: Phase 3)

- T6: Update Documentation (45m)

## Risk Mitigation

### High-Risk Tasks

**T3: Add User Isolation Tests**

- **Risk:** Dependency on existing RLS policies (Issues #226, #227) - if policies are incomplete, tests will fail
- **Mitigation:**
  - Review existing RLS policies before writing tests
  - Start with simple SELECT tests before complex UPDATE/DELETE tests
  - Create test data if needed for empty tables
  - Work incrementally - add tests for one table at a time

### Medium-Risk Tasks

**T1: Create pgTAP Test Infrastructure**

- **Risk:** Extension installation may fail if Supabase version incompatible
- **Mitigation:**
  - Test locally first before CI integration
  - Have fallback plan to use raw pgTAP without helpers (more boilerplate)
  - Check Supabase CLI version compatibility

**T5: Add CI/CD Integration**

- **Risk:** Tests may behave differently in CI environment
- **Mitigation:**
  - Monitor first CI run closely
  - Add verbose logging to CI step
  - Have rollback plan to disable temporarily if blocking deployments

### Dependencies

**Critical Path:**
T1 → T2 → T3 → T4 → T5 → T6

**Potential Bottlenecks:**

- T3 (User Isolation Tests) is the most complex and time-consuming task
- T3 depends on existing RLS policies being complete and correct
- If RLS policies are incomplete, may need to pause and implement policies first

**Parallelization Opportunities:**

- None - all tasks are sequential due to dependencies
- T6 (Documentation) could potentially start earlier once T4 is complete

## Testing Strategy

**Per-Task Testing:**

**T1:**

- Run `supabase test db` to verify setup hook executes
- Check extensions are installed: `SELECT * FROM pg_extension`
- Verify test helper functions available: `SELECT tests.create_supabase_user('test')`

**T2:**

- Run `supabase test db` to verify schema validation
- Intentionally remove RLS from a test table to verify test catches it
- Re-enable RLS and verify test passes

**T3:**

- Run individual isolation tests for each table
- Manually verify transaction rollback (check no test data persists)
- Test edge cases: anonymous users, invalid user IDs

**T4:**

- Run `pnpm test:rls` from root directory
- Run `pnpm test:rls` from subdirectory
- Test watch mode with file changes

**T5:**

- Push branch and monitor CI run
- Verify test results appear in CI logs
- Test that failures properly block pipeline

**T6:**

- Have another developer review documentation for clarity
- Verify all commands work as documented
- Test troubleshooting steps

**Coverage Targets:**

- **Schema coverage:** 100% of tables in public schema validated for RLS
- **Policy coverage:** SELECT, INSERT, UPDATE, DELETE policies tested per table
- **User scenarios:** Own data, other users' data, anonymous access

## Success Metrics

**Completion Criteria:**

- All 6 tasks completed with acceptance criteria met
- All pgTAP tests passing locally
- All pgTAP tests passing in CI/CD
- Test execution time < 10 seconds
- Documentation complete and reviewed

**Quality Indicators:**

- No test data persists after test runs (transaction isolation working)
- Tests catch RLS violations when policies are removed
- Clear error messages guide developers to fix issues
- Other developers can add new RLS tests using documentation

**Operational Readiness:**

- CI/CD pipeline includes pgTAP tests
- Pipeline blocks on RLS test failures
- Developers can run tests locally without manual setup
- Troubleshooting guide resolves common issues

## References

- **Spec:** [specs/add-pgtap-rls-testing.md](../specs/add-pgtap-rls-testing.md)
- **Plan:** [plans/add-pgtap-rls-testing.md](../plans/add-pgtap-rls-testing.md)
- **Issue:** [#236: Add pgTAP database-level RLS testing](https://github.com/dissonancelabs/dl-starter/issues/236)
- **Related Issues:**
  - [#226: Implement RLS policies](https://github.com/dissonancelabs/dl-starter/issues/226)
  - [#227: Add RLS validation to CI/CD](https://github.com/dissonancelabs/dl-starter/issues/227)
  - [#228: Implement RLS test helpers](https://github.com/dissonancelabs/dl-starter/issues/228)
- **External Documentation:**
  - [Supabase pgTAP Testing Guide](https://supabase.com/docs/guides/local-development/testing/pgtap-extended)
  - [basejump-supabase_test_helpers](https://github.com/usebasejump/supabase-test-helpers)
  - [Testing RLS with pgTAP (Basejump Guide)](https://usebasejump.com/blog/testing-on-supabase-with-pgtap)
  - [Database.dev Package Registry](https://database.dev)
