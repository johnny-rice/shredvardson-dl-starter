# ADR-005: Database Migration Workflow

**Status:** Accepted
**Date:** 2025-10-09

## Context

The project lacked a systematic approach to database migrations, leading to:

1. **No validation of migration safety** - Destructive operations (DROP TABLE, DROP COLUMN) could slip into production undetected
2. **Missing RLS policies** - Tables could be created without Row Level Security, exposing security vulnerabilities
3. **Performance issues** - Foreign keys without indexes, type changes without proper migration paths
4. **Inconsistent test data** - No deterministic seeding for tests, making debugging difficult
5. **Manual review burden** - Reviewers had to manually inspect SQL for common issues

This was identified as a P0 (BLOCKER) gap in the project roadmap (Issue #124).

## Decision

Implement a comprehensive database migration validation and seeding workflow consisting of:

### 1. Migration Validators (`scripts/validators/`)

Four core validators to detect common migration issues:

- **Destructive Operations** - Detects `DROP TABLE`, `DROP COLUMN`, `TRUNCATE`, etc.
- **Missing RLS Policies** - Ensures all new tables have `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
- **Missing FK Indexes** - Detects foreign key constraints without supporting indexes
- **Type Changes** - Flags column type alterations that may cause data loss

### 2. Validation CLI (`scripts/validate-migration.ts`)

- Scans `supabase/migrations/*.sql` files
- Reports errors (blocking) and warnings (non-blocking)
- Provides both human-readable terminal output and CI-friendly exit codes
- Integrated into CI pipeline via `pnpm db:validate:ci`

### 3. Seed Data Scripts

Two seeding modes for different environments:

- **Development seeds** (`scripts/seed-dev.ts`) - Uses `@faker-js/faker` for realistic randomized data
- **Test seeds** (`scripts/seed-test.ts`) - Deterministic test users with fixed IDs for reliable E2E tests

### 4. TypeScript Type Safety

Shared types for validation results and seed configurations:

```typescript
interface ValidationResult {
  filePath: string;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

interface SeedConfig {
  userCount?: number;
  locale?: string;
  deterministic?: boolean;
}
```

### 5. Documentation

- Recipe document (`docs/recipes/db.md`) with workflow guidance
- Research findings (`docs/research/migration-workflow-research-20251004.md`)
- Spec, plan, and task breakdown for future reference

## Implementation Details

**Package Dependencies:**
- `@faker-js/faker` (devDependency) for realistic test data generation

**NPM Scripts:**
```json
{
  "db:validate": "tsx scripts/validate-migration.ts",
  "db:validate:ci": "tsx scripts/validate-migration.ts --strict",
  "db:seed:dev": "tsx scripts/seed-dev.ts",
  "db:seed:test": "tsx scripts/seed-test.ts"
}
```

**CI Integration:**
- Added to CI pipeline as a required check
- Blocks merges if blocking errors are detected
- Warnings are reported but don't fail the build

## Consequences

### Benefits

1. **Improved Safety**
   - Catches destructive operations before they reach production
   - Ensures RLS policies are applied to all tables
   - Detects performance issues (missing FK indexes) early

2. **Better Developer Experience**
   - Automated validation reduces manual review burden
   - Clear error messages guide developers to fix issues
   - Deterministic test data makes debugging easier

3. **Compliance & Auditability**
   - Migration validation reports provide audit trail
   - Security policies (RLS) are enforced programmatically
   - Type-safe contracts prevent runtime errors

4. **Faster Feedback Loop**
   - CI validation catches issues before code review
   - Developers can run `pnpm db:validate` locally
   - Seed scripts accelerate local development

### Tradeoffs

1. **Added Complexity**
   - Developers must learn new validation patterns
   - Additional scripts to maintain (validators, seeds)
   - CI runs take slightly longer (~5-10s for validation)

2. **False Positives**
   - Some legitimate destructive operations may trigger errors
   - Requires escape hatches (e.g., explicit comments to bypass checks)

3. **Maintenance Burden**
   - Validators must be updated as Supabase/PostgreSQL evolves
   - Faker.js locale support may need expansion
   - Seed scripts must be kept in sync with schema changes

### Monitoring

- Track validation failures in CI to identify common migration issues
- Monitor false positive rate to tune validator sensitivity
- Watch for seed script failures indicating schema drift

## Alternatives Considered

1. **Supabase CLI built-in validation** - Limited to syntax checking, doesn't cover RLS or performance
2. **Liquibase/Flyway migration tools** - Heavyweight, require migration away from Supabase native migrations
3. **Manual code review only** - Error-prone, doesn't scale, lacks automation

## References

- Issue: #124 (Add Database Migration Workflow)
- PR: #129
- Spec: `specs/feature-005-database-migration-workflow.md`
- Plan: `plans/plan-005-database-migration-workflow.md`
- Tasks: `tasks/task-005-database-migration-workflow.md`
- Related: [Supabase RLS Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
