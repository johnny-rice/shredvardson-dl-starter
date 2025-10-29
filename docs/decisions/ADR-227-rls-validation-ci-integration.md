# ADR-227: RLS Validation in CI/CD Pipeline

**Status:** Accepted
**Date:** 2025-10-29

## Context

Without automated validation, tables can reach production without Row-Level Security (RLS) policies, creating critical security vulnerabilities. The security gap was identified by `/security:scan rls high` in PR #225.

### Problems with Manual RLS Review

1. **No Automated Safeguards**: Developers can accidentally deploy tables without RLS policies
2. **Manual Review Doesn't Scale**: Every migration requires manual security review
3. **Regression Risk**: Tables modified later might have RLS disabled without detection
4. **Production Security Gaps**: Broken security policies can reach production

### Requirements

- Validate all tables have RLS enabled
- Check policy completeness (SELECT/INSERT/UPDATE/DELETE operations)
- Provide clear error messages with fix guidance
- Gracefully handle missing Supabase credentials
- Add minimal overhead to CI pipeline (<10 seconds)

## Decision

Integrate RLS policy validation as a **required CI check** that runs on all pull requests, implemented through:

1. **Enhanced Validation Script** (`scripts/db/validate-rls.ts`):
   - Query Postgres system tables to detect RLS status
   - Validate policy completeness for all CRUD operations
   - Generate actionable error messages with documentation links

2. **CI Integration** (`.github/workflows/ci.yml`):
   - Add "Validate RLS Policies" step to doctor job
   - Run on all pull requests after database setup
   - Fail CI when RLS gaps detected
   - Skip gracefully when credentials unavailable (with warning)

3. **Developer Experience**:
   - Local validation: `pnpm db:validate:rls`
   - Comprehensive documentation in `docs/recipes/db.md`
   - Clear fix instructions for common issues

## Alternatives Considered

### 1. Post-Merge Audit (Rejected)

**Approach**: Weekly scheduled job to scan production database for RLS gaps

**Rejected because**:

- Security gaps already in production by the time detected
- Requires rollback/hotfix process (expensive)
- Doesn't prevent the problem, only detects it late

### 2. Pre-Commit Hook Only (Rejected)

**Approach**: Validate RLS in git pre-commit hook

**Rejected because**:

- Easily bypassed with `--no-verify`
- Not enforced in CI (single point of failure)
- Can't validate against actual database state

### 3. Warning-Only Mode (Rejected)

**Approach**: Report RLS issues as warnings, don't fail CI

**Rejected because**:

- No enforcement mechanism
- Warnings get ignored over time (alert fatigue)
- Doesn't prevent security gaps from reaching production

## Consequences

### Benefits

✅ **Prevents Security Gaps**: Tables without RLS policies cannot reach production
✅ **Shifts Security Left**: Catch issues during development, not in production
✅ **Graceful Degradation**: Works without Supabase credentials (CI-only enforcement)
✅ **Fast Feedback**: Developers know immediately when RLS is missing
✅ **Comprehensive Coverage**: Validates both RLS enablement and policy completeness

### Tradeoffs

⚠️ **CI Runtime**: Adds ~5-10 seconds to pipeline (acceptable for security gain)
⚠️ **Credential Management**: Requires `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in GitHub secrets
⚠️ **Exception Handling**: Tables legitimately without RLS need explicit exceptions

### Monitoring

- Track false positive rate (should be near zero)
- Monitor CI pipeline impact (target: <10s overhead)
- Review exception table list quarterly

## Implementation

**Test Coverage**: 11 unit tests covering validation logic ([apps/web/tests/unit/db/validate-rls.test.ts](../../apps/web/tests/unit/db/validate-rls.test.ts))

**Acceptance Criteria**: 8 of 9 completed (integration tests deferred pending live database)

**Rollout Plan**:

1. ✅ Phase 1: Script enhancement and testing
2. ✅ Phase 2: CI integration with graceful degradation
3. ⏭️ Phase 3: Configure GitHub secrets for full enforcement

## References

- **Issue**: #227 (Add RLS validation to CI/CD pipeline)
- **Related Issue**: #226 (Implement RLS policies for all tables)
- **Security Scan**: PR #225 (identified the gap)
- **Spec Document**: [docs/specs/227-rls-ci-validation.md](../specs/227-rls-ci-validation.md)
- **PR**: #235
- **Documentation**: [docs/recipes/db.md#rls-validation](../recipes/db.md#rls-validation)
