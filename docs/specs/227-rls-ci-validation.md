---
title: Add RLS validation to CI/CD pipeline
type: feature
priority: p1
status: implemented
issue: 227
related_issues: [226]
security_level: high
---

# Add RLS validation to CI/CD pipeline

## Problem Statement

**Security Gap:** No automated RLS policy validation in CI/CD pipeline. Developers can accidentally deploy tables without RLS policies, creating production security vulnerabilities.

**Discovered by:** `/security:scan rls high` command (PR #225)

## Impact

- **HIGH Severity**: No automated safeguards against missing RLS policies
- Broken security policies can reach production
- Manual review required for every migration
- Regression risk when tables are modified

## Current State

- ✅ CI validation script exists: `scripts/db/validate-rls.ts`
- ❌ No RLS-specific checks enforced
- ❌ No policy completeness validation
- ❌ Not integrated into GitHub Actions workflow

## Solution Design

### 1. Enhance CI Validation Script

Extend `scripts/db/validate-rls.ts` with RLS-specific checks:

#### Check 1: All Tables Have RLS Enabled

```typescript
// Check all tables have RLS enabled
const tablesWithoutRLS = await db.execute(sql`
  SELECT tablename
  FROM pg_tables
  WHERE schemaname = 'public'
  AND tablename NOT IN (
    SELECT tablename
    FROM pg_tables t
    JOIN pg_class c ON c.relname = t.tablename
    WHERE c.relrowsecurity = true
  )
`);

if (tablesWithoutRLS.length > 0) {
  throw new Error(`Tables without RLS: ${tablesWithoutRLS.join(', ')}`);
}
```

#### Check 2: Policy Completeness

```typescript
// Ensure all tables have SELECT, INSERT, UPDATE, DELETE policies
const incompletePolicies = await checkPolicyCompleteness();
if (incompletePolicies.length > 0) {
  throw new Error(`Incomplete policies: ${incompletePolicies.join(', ')}`);
}
```

#### Check 3: Policy Quality

- Verify policies reference valid roles
- Check for overly permissive policies
- Validate auth.uid() usage patterns

### 2. Add GitHub Actions Integration

Update `.github/workflows/*.yml` to include RLS validation step:

```yaml
- name: Validate RLS Policies
  env:
    SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
    SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```

### 3. Add Package Scripts

Update `package.json`:

```json
{
  "scripts": {
    "db:validate-rls": "tsx scripts/db/validate-rls.ts"
  }
}
```

## Technical Implementation

### Files to Modify

1. **scripts/db/validate-rls.ts** (already exists - enhance)
   - Add RLS-enabled check
   - Add policy completeness check
   - Add policy quality checks
   - Improve error reporting

2. **.github/workflows/ci.yml**
   - Add RLS validation step after database migrations
   - Configure failure behavior

3. **package.json**
   - Ensure `db:validate-rls` script exists

4. **docs/recipes/db.md**
   - Document RLS validation process
   - Add troubleshooting guide

### Testing Strategy

1. **Unit Tests** (`apps/web/tests/unit/db/validate-rls.test.ts`)
   - Test detection of tables without RLS
   - Test policy completeness validation
   - Test error messaging

2. **Integration Tests**
   - Create test database with missing RLS
   - Verify validation fails correctly
   - Test with complete RLS setup

3. **CI/CD Tests**
   - Verify workflow fails on RLS violations
   - Verify workflow passes with proper RLS

## Acceptance Criteria

- [x] `validate-rls.ts` checks all tables have RLS-enabled
- [x] Policy completeness validation (SELECT/INSERT/UPDATE/DELETE)
- [x] Policy quality checks (no overly permissive policies)
- [x] GitHub Actions workflow includes RLS validation step
- [x] CI fails gracefully with clear error messages
- [x] Package script `db:validate-rls` works locally
- [x] Documentation updated in `docs/recipes/db.md`
- [x] Unit tests cover all validation scenarios
- [ ] Integration tests verify CI behavior

## Success Metrics

- ✅ Zero tables without RLS reach production
- ✅ Clear error messages guide developers to fix issues
- ✅ <5 minutes added to CI pipeline runtime
- ✅ 100% test coverage for validation logic

## Dependencies

- Issue #226: RLS policies must be implemented first
- `scripts/db/validate-rls.ts`: Script already exists
- Supabase secrets in GitHub Actions

## Rollout Plan

### Phase 1: Script Enhancement

1. Enhance `validate-rls.ts` with checks
2. Add unit tests
3. Test locally

### Phase 2: CI Integration

1. Add to GitHub Actions workflow
2. Run in warning-only mode initially
3. Monitor for false positives

### Phase 3: Enforcement

1. Switch to fail-on-error mode
2. Update documentation
3. Announce to team

## Documentation Updates

### docs/recipes/db.md

Add section:

````markdown
## RLS Validation

### Running Locally

```bash
pnpm db:validate-rls
```
````

### CI/CD Integration

RLS validation runs automatically in CI. If it fails:

1. Check which tables are missing RLS
2. Add RLS policies to migrations
3. Test locally with `pnpm db:validate-rls`
4. Push updated migration

### Common Issues

#### Table without RLS enabled

```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

#### Missing policy

```sql
CREATE POLICY "policy_name" ON table_name
  FOR SELECT USING (auth.uid() = user_id);
```

## Risk Assessment

| Risk                 | Likelihood | Impact | Mitigation              |
| -------------------- | ---------- | ------ | ----------------------- |
| False positives      | Medium     | Medium | Warning-only mode first |
| Increased CI time    | Low        | Low    | Optimize queries        |
| Breaking existing CI | Low        | High   | Thorough testing        |
| Developer friction   | Medium     | Low    | Clear documentation     |

## References

- Security scan: PR #225
- Existing script: `scripts/db/validate-rls.ts`
- Related issue: #226 (RLS implementation)
- Database recipe: `docs/recipes/db.md`

## Open Questions

1. Should validation block merges or just warn?
   - **Decision**: Block merges (fail CI)
2. Which workflows need validation?
   - **Decision**: All workflows that run migrations
3. Should we validate test databases?
   - **Decision**: Yes, same standards apply
