---
title: "🔒 CRITICAL: Implement Row-Level Security (RLS) policies for all tables"
type: feature
priority: p0
status: ready
issue: 226
lane: spec
estimation: 3-5 hours
tags: [security, database, rls, blocker]
---

# 🔒 CRITICAL: Implement Row-Level Security (RLS) policies for all tables

**Issue**: #226
**Priority**: P0 (BLOCKER) - Security vulnerability
**Type**: Security Implementation
**Lane**: Spec-driven (requires security testing)

## Problem Statement

**Security Scan Finding:** The database currently lacks comprehensive Row-Level Security (RLS) policies. While the `_health_check` table has RLS enabled with appropriate anonymous read policies, there is no systematic RLS policy framework for future tables.

**Discovered by:** `/security:scan rls high` command (PR #225)

### Impact

- ⚠️ **CRITICAL Severity**: Potential data isolation failure for future tables
- Risk: New tables added without RLS would allow any authenticated user to read/write data belonging to other users
- Multi-tenant security could be completely bypassed
- Privilege escalation and data breach risk for future implementations

## Current State

### ✅ Existing Infrastructure

- Migration files exist (`supabase/migrations/`)
- RLS scaffold tool available: `scripts/db/rls-scaffold.ts`
- RLS test templates ready: `apps/web/tests/rls/`
- RLS contracts defined: `apps/web/tests/rls/contracts.md`
- `_health_check` table has RLS enabled with anonymous read policies

### ❌ Gaps Identified

- No systematic RLS policy framework documentation
- No validation that new tables have RLS enabled by default
- No CI/CD checks to prevent RLS-less tables from being deployed
- No developer guidelines for implementing RLS on new tables

## Solution

Implement a comprehensive RLS policy framework with documentation, automation, and CI/CD validation to ensure all current and future tables have proper RLS policies.

### Phase 1: Documentation & Standards (1 hour)

Create comprehensive RLS implementation guidelines:

1. **Create RLS Implementation Guide** (`docs/database/rls-implementation.md`)
   - When to use which RLS patterns
   - Step-by-step guide for adding RLS to new tables
   - Common patterns and examples
   - Testing requirements

2. **Update Database Standards** (`docs/database/standards.md`)
   - Mandate RLS for all user data tables
   - Define exceptions (public data, health checks, etc.)
   - Review process for RLS policy changes

### Phase 2: Validation & Automation (1-2 hours)

Build automated checks to prevent RLS gaps:

1. **Create RLS Validation Script** (`scripts/db/validate-rls.ts`)
   - Check all tables have RLS enabled (except approved exceptions)
   - Validate policy patterns match contracts
   - Generate report of RLS coverage
   - Exit with error if gaps found

2. **Add Pre-Migration Hook**
   - Validate new migrations include RLS statements for new tables
   - Use AST parsing or regex to detect `CREATE TABLE` without `ENABLE ROW LEVEL SECURITY`
   - Block migrations that create tables without RLS

3. **Update Package.json Scripts**

   ```json
   {
     "db:validate:rls": "tsx scripts/db/validate-rls.ts",
     "db:migrate": "npm run db:validate:rls && supabase db push"
   }
   ```

### Phase 3: CI/CD Integration (30 minutes)

Add RLS validation to CI/CD pipeline:

1. **Update GitHub Actions** (`.github/workflows/ci.yml`)
   - Add RLS validation step before deployment
   - Run `pnpm db:validate:rls` on every PR
   - Block merges if RLS gaps detected

2. **Add Status Check**
   - Make RLS validation a required status check
   - Prevent direct pushes to main without passing RLS validation

### Phase 4: Developer Experience (1 hour)

Improve DX for RLS implementation:

1. **Enhance RLS Scaffold Tool**
   - Add interactive mode with prompts
   - Generate test templates alongside policies
   - Create migration file with timestamp automatically

2. **Create RLS Templates**
   - Common patterns (user_id ownership, multi-tenant, public data)
   - Copy-paste ready SQL snippets
   - Test file templates

3. **Add VS Code Snippets** (optional)
   - Trigger snippets for common RLS patterns
   - Auto-complete for policy names

## Technical Approach

### RLS Validation Logic

```typescript
// scripts/db/validate-rls.ts

interface RLSStatus {
  tableName: string;
  hasRLS: boolean;
  policies: string[];
  isException: boolean;
}

async function validateRLS(): Promise<RLSStatus[]> {
  // 1. Query database for all tables
  const tables = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public');

  // 2. Check RLS status for each table
  const status = await Promise.all(
    tables.map(async (table) => {
      const rlsEnabled = await checkRLSEnabled(table.name);
      const policies = await getPolicies(table.name);
      const isException = RLS_EXCEPTIONS.includes(table.name);

      return {
        tableName: table.name,
        hasRLS: rlsEnabled,
        policies,
        isException
      };
    })
  );

  // 3. Identify gaps
  const gaps = status.filter(t => !t.hasRLS && !t.isException);

  if (gaps.length > 0) {
    console.error('❌ RLS gaps found:', gaps);
    process.exit(1);
  }

  return status;
}
```

### RLS Exceptions

Tables that legitimately don't need RLS:

- `_health_check` - Public health check endpoint (already has policies for anonymous read)
- `_migrations` - Migration tracking (Supabase internal)
- Any future tables explicitly marked as public data

### Policy Patterns

**Pattern 1: User Ownership** (most common)

```sql
-- User can only access their own data
USING (auth.uid() = user_id)
```

**Pattern 2: Multi-Tenant Ownership**

```sql
-- User can access data in their organization
USING (
  auth.uid() IN (
    SELECT user_id FROM org_members
    WHERE org_id = table_name.org_id
  )
)
```

**Pattern 3: Public Read, Private Write**

```sql
-- Anyone can read, only owner can write
FOR SELECT USING (true)
FOR INSERT WITH CHECK (auth.uid() = user_id)
FOR UPDATE USING (auth.uid() = user_id)
FOR DELETE USING (auth.uid() = user_id)
```

## Acceptance Criteria

### Phase 1: Documentation

- [ ] RLS implementation guide created with examples
- [ ] Database standards document updated with RLS requirements
- [ ] RLS exception list documented

### Phase 2: Automation

- [ ] RLS validation script created and tested
- [ ] Script correctly identifies tables without RLS
- [ ] Script respects exception list
- [ ] Pre-migration validation hook implemented
- [ ] Package.json scripts updated

### Phase 3: CI/CD

- [ ] RLS validation added to CI workflow
- [ ] RLS validation runs on every PR
- [ ] Failed RLS validation blocks merge
- [ ] Status check marked as required

### Phase 4: Testing

- [ ] Validation script tested with various scenarios:
  - [ ] All tables have RLS (should pass)
  - [ ] One table missing RLS (should fail)
  - [ ] Exception table without RLS (should pass)
- [ ] Pre-migration hook tested with:
  - [ ] Migration creating table with RLS (should pass)
  - [ ] Migration creating table without RLS (should warn/fail)
- [ ] CI workflow tested on PR

### Phase 5: Documentation & Communication

- [ ] README.md updated with RLS validation information
- [ ] TESTING_GUIDE.md includes RLS testing section
- [ ] Migration guide includes RLS checklist

## Testing Strategy

### Unit Tests

- [ ] RLS validation script logic
- [ ] Policy pattern detection
- [ ] Exception list handling

### Integration Tests

- [ ] Full validation on real database
- [ ] Pre-migration hook with sample migrations
- [ ] CI workflow end-to-end

### Manual Testing

- [ ] Run validation on current database
- [ ] Create test migration without RLS (should block)
- [ ] Create test migration with RLS (should pass)
- [ ] Verify CI workflow prevents merge

## Security Considerations

1. **Default Secure**: All new tables must have RLS enabled by default
2. **Explicit Exceptions**: Any table without RLS must be explicitly added to exception list with justification
3. **Policy Review**: All RLS policies should be reviewed by security-aware developer
4. **Test Coverage**: Every RLS policy must have corresponding test in `apps/web/tests/rls/`

## Implementation Order

1. ✅ **Create spec document** (this file)
2. 🔄 **Phase 1: Documentation** - Create RLS guides and standards
3. 🔄 **Phase 2: Automation** - Build validation script
4. 🔄 **Phase 3: CI/CD** - Integrate into workflows
5. 🔄 **Phase 4: Testing** - Validate all scenarios
6. 🔄 **Phase 5: Documentation** - Update project docs

## Success Metrics

- ✅ Zero tables without RLS (except approved exceptions)
- ✅ 100% of new tables include RLS policies
- ✅ CI/CD blocks deployments with RLS gaps
- ✅ Developer docs include clear RLS guidelines
- ✅ Validation runs on every PR and deployment

## References

- Security scan report: PR #225
- RLS scaffold tool: [scripts/db/rls-scaffold.ts](../../scripts/db/rls-scaffold.ts)
- RLS test contracts: [apps/web/tests/rls/contracts.md](../../apps/web/tests/rls/contracts.md)
- Supabase RLS docs: <https://supabase.com/docs/guides/auth/row-level-security>
- PostgreSQL RLS docs: <https://www.postgresql.org/docs/current/ddl-rowsecurity.html>

## Related Issues

- Issue #108: Add Testing Infrastructure (provides RLS test templates)
- Issue #2: Add Testing Infrastructure (original testing infrastructure issue)
- PR #225: Sub-agent delegation (discovered this RLS gap)

## Notes

- Current state: Only `_health_check` table exists, which already has RLS enabled with appropriate policies
- This is primarily a **preventive measure** to ensure future tables don't get deployed without RLS
- Focus is on **automation and CI/CD** rather than fixing existing tables (which are already secure)
- The RLS scaffold tool is well-implemented and just needs integration into workflow
