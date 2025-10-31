---
id: SPEC-add-pgtap-rls-testing
title: Add pgTAP database-level RLS testing
type: spec
priority: p2
status: ready
lane: spec-driven
issue: 236
plan: plans/add-pgtap-rls-testing.md
tasks: tasks/add-pgtap-rls-testing.md
created: 2025-10-31
---

# Add pgTAP database-level RLS testing

## Summary

Implement comprehensive database-level RLS testing using pgTAP and community test helpers to enhance test coverage beyond application-level testing. This provides transaction-isolated testing, schema-wide validation, and database-level accuracy for RLS policies.

## Problem Statement

Currently, RLS testing is done at the application level using Vitest and JavaScript test helpers. While this validates RLS from the application's perspective, it lacks the comprehensive coverage and isolation benefits of database-level testing with pgTAP. Application-level tests cannot use transactions for isolation, and we're missing database-level validation of complex RLS scenarios and automated schema-wide RLS validation.

## Proposed Solution

Install pgTAP infrastructure and create database-level test files that leverage community test helpers (basejump-supabase_test_helpers) for simplified user management and authentication. Implement schema-wide RLS validation and user isolation tests that run directly in Postgres with transaction-based cleanup.

### Implementation Phases

1. **Install pgTAP Infrastructure** - Create setup file with pgTAP, dbdev, and test helpers
2. **Add Schema-Wide RLS Validation** - Verify RLS is enabled on all tables in public schema
3. **Add User Isolation Tests** - Test that users can only access their own data
4. **Integrate with Test Commands** - Add `test:rls` commands to package.json

## Acceptance Criteria

- [ ] pgTAP and basejump-supabase_test_helpers installed via setup hook (`supabase/tests/000-setup-tests-hooks.sql`)
- [ ] Schema-wide RLS validation test created (`supabase/tests/001-rls-enabled.sql`)
- [ ] User isolation tests created for existing tables with RLS policies (`supabase/tests/002-user-isolation.sql`)
- [ ] `pnpm test:rls` command works locally
- [ ] Tests run in CI/CD pipeline
- [ ] Documentation updated in `docs/testing/TESTING_GUIDE.md` with pgTAP usage guide
- [ ] All pgTAP tests pass in rollback transactions (no side effects)

## Technical Constraints

- Requires Supabase CLI for running `supabase test db`
- Tests must run in rollback transactions for isolation
- Depends on existing tables with RLS policies (Issue #227, #226)
- Test helpers require specific Postgres extensions (pgtap, http, pg_tle)
- Must maintain compatibility with existing application-level RLS tests

## Success Metrics

- Schema-wide RLS validation test passes
- User isolation tests pass for all tables with RLS policies
- Tests run successfully in CI/CD without failures
- Documentation includes clear examples of writing pgTAP RLS tests
- Test execution time < 10 seconds for all pgTAP tests

## Out of Scope

- Migration of existing application-level RLS tests to pgTAP (these complement, not replace)
- Performance testing of RLS policies
- Automated RLS policy generation
- Testing of auth policies (separate from RLS)

## References

- [Issue #236](https://github.com/dissonancelabs/dl-starter/issues/236)
- [Issue #228: Implement missing RLS test helpers](https://github.com/dissonancelabs/dl-starter/issues/228) - Application-level helpers
- [Supabase pgTAP Testing Guide](https://supabase.com/docs/guides/local-development/testing/pgtap-extended)
- [basejump-supabase_test_helpers](https://github.com/usebasejump/supabase-test-helpers)
- [Database.dev Package Registry](https://database.dev)
- [Testing RLS with pgTAP (Basejump Guide)](https://usebasejump.com/blog/testing-on-supabase-with-pgtap)
- [docs/testing/TESTING_GUIDE.md](../docs/testing/TESTING_GUIDE.md)
