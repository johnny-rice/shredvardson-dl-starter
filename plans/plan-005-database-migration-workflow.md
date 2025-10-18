---
id: PLAN-20251004-database-migration-workflow
type: plan
parentId: SPEC-20251004-database-migration-workflow
issue: 124
spec: SPEC-20251004-database-migration-workflow
source: https://github.com/Shredvardson/dl-starter/issues/124
---

# Implementation Plan: Database Migration Workflow

**Parent Spec**: [SPEC-20251004-database-migration-workflow](../specs/feature-005-database-migration-workflow.md)

**Research**: [migration-workflow-research-20251004.md](../docs/research/migration-workflow-research-20251004.md)

## Executive Summary

Implement a safe, documented database migration workflow for Supabase that prevents production incidents through validation, testing, and approval gates. Based on 2024 industry best practices: fix-forward pattern, synthetic seed data, and human-in-the-loop for production deployments.

**Complexity**: Medium (2-3 days)

**Risk Level**: Medium (modifies CI/CD and database workflows, but uses existing Supabase infrastructure)

## Architecture Decisions

### 1. Migration Validation Strategy

**Decision**: Pre-commit validation script + CI validation + optional approval gate

**Rationale**:

- Catches issues early (shift-left)
- Multiple layers of safety (defense in depth)
- Doesn't block local development velocity

**Stack**:

- TypeScript validation script (Node.js)
- SQL parsing via regex (simple, no external dependencies)
- GitHub Actions for CI integration

### 2. Seed Data Approach

**Decision**: Synthetic data via @faker-js/faker + optional Neosync integration

**Rationale**:

- Privacy-safe (GDPR compliant)
- No production data exposure risk
- Unlimited generation for testing
- 99% statistical similarity (research-backed)

**Stack**:

- `@faker-js/faker` for synthetic data generation
- TypeScript seed scripts
- Supabase CLI for seed application

### 3. CI/CD Pipeline Design

**Decision**: GitHub Actions with environment-based deployment + manual approval for production

**Rationale**:

- Follows Supabase 2024 best practices
- Native GitHub integration
- No additional infrastructure
- Clear approval trail

**Workflow**:

```
develop branch → auto-deploy to staging
main branch → manual approval → deploy to production
```

### 4. Documentation Strategy

**Decision**: Wiki-based with executable examples

**Rationale**:

- Easy to maintain alongside code
- Searchable and linkable
- Examples can be copy-pasted

**Structure**:

- Migration workflow guide (step-by-step)
- RLS patterns library (copy-paste templates)
- Common schema patterns (with examples)
- Troubleshooting guide

## File Changes Required

### Files to Create

#### 1. Validation Scripts

```
scripts/
├── validate-migration.ts          # Main validation script
├── seed-dev.ts                    # Development seed data
└── seed-test.ts                   # Test seed data
```

#### 2. Supabase Seeds

```
supabase/
├── seed.sql                       # Base seed (auth setup, etc)
└── seeds/
    ├── dev/                       # Development seeds
    │   └── 001_sample_data.sql
    └── test/                      # Test seeds
        └── 001_test_data.sql
```

#### 3. GitHub Actions Workflows

```
.github/workflows/
├── deploy-staging.yml             # Auto-deploy to staging
└── deploy-production.yml          # Manual approval for production
```

#### 4. Documentation

```
docs/wiki/
├── database-migrations.md         # Migration workflow guide
├── rls-patterns.md                # RLS policy templates
├── schema-patterns.md             # Common schema patterns
└── migration-troubleshooting.md   # Debug guide
```

#### 5. AI Command Updates

```
.claude/commands/
├── db-create-migration.md         # New: Create migration with safety checks
├── db-validate-migration.md       # New: Validate existing migration
└── db-seed-dev.md                 # New: Seed development data
```

### Files to Modify

#### 1. Package Configuration

```typescript
// package.json - Add scripts and dependencies
{
  "scripts": {
    "db:validate": "tsx scripts/validate-migration.ts",
    "db:seed:dev": "tsx scripts/seed-dev.ts",
    "db:seed:test": "tsx scripts/seed-test.ts",
    "db:reset": "supabase db reset && pnpm db:seed:dev"
  },
  "devDependencies": {
    "@faker-js/faker": "^8.4.1"
  }
}
```

#### 2. README

```markdown
// README.md - Add migration workflow section

## Database Migrations

See [docs/wiki/database-migrations.md](docs/wiki/database-migrations.md) for complete guide.

**Quick commands**:

- `pnpm db:validate` - Validate migration files
- `pnpm db:seed:dev` - Seed development data
- `pnpm db:reset` - Reset local database
```

#### 3. Git Hooks (Optional)

```
.husky/
└── pre-commit                     # Add migration validation
```

## Implementation Strategy

### Phase 1: Validation Infrastructure (Day 1, Morning)

**Objective**: Create migration validation script

**Tasks**:

1. Create `scripts/validate-migration.ts`
   - Parse migration files in `supabase/migrations/`
   - Check for destructive operations (DROP, TRUNCATE)
   - Check for type-changing ALTERs without conversion
   - Check for missing RLS policies on new tables
   - Check for foreign keys without indexes
   - Output formatted warnings/errors

2. Add validation to package.json scripts

3. Test validation with sample migrations (good and bad)

**Acceptance Criteria**:

- Validation script detects all specified dangerous patterns
- Script outputs clear, actionable error messages
- Script exits with non-zero code on errors
- Can run locally: `pnpm db:validate`

### Phase 2: Seed Data System (Day 1, Afternoon)

**Objective**: Create synthetic seed data generators

**Tasks**:

1. Create `scripts/seed-dev.ts`
   - Use @faker-js/faker for realistic data
   - Generate users, organizations (if exists), sample entities
   - Insert via Supabase client
   - Configurable count (default: 50 users, 10 orgs)

2. Create `scripts/seed-test.ts`
   - Minimal, deterministic test data
   - Known IDs for testing
   - Covers edge cases (empty strings, nulls, etc.)

3. Create `supabase/seed.sql`
   - Base auth schema setup
   - System configuration
   - Run before synthetic seeds

4. Add seed scripts to package.json

**Acceptance Criteria**:

- Dev seed generates realistic, varied data
- Test seed generates consistent, testable data
- Seeds respect RLS policies (use service role key)
- Can reset and seed: `pnpm db:reset`

### Phase 3: Documentation (Day 1, Evening)

**Objective**: Comprehensive migration guides

**Tasks**:

1. Create `docs/wiki/database-migrations.md`
   - Step-by-step workflow (local → staging → prod)
   - How to create migration (Studio vs manual)
   - How to test migration locally
   - How to handle failures (fix-forward pattern)
   - Point-in-time recovery (emergency only)
   - Migration file naming conventions

2. Create `docs/wiki/rls-patterns.md`
   - User isolation pattern (user_id = auth.uid())
   - Organization multi-tenancy pattern
   - Admin override pattern
   - Public read, authenticated write pattern
   - Complete, copy-pasteable examples

3. Create `docs/wiki/schema-patterns.md`
   - Timestamps (created_at, updated_at triggers)
   - Soft deletes (archived_at pattern)
   - Foreign keys with indexes
   - JSONB columns (when to use)
   - Enums vs lookup tables

4. Create `docs/wiki/migration-troubleshooting.md`
   - Common errors and solutions
   - How to read Supabase logs
   - How to inspect RLS policies
   - How to test RLS locally
   - Emergency rollback procedure

**Acceptance Criteria**:

- All docs have executable examples
- Templates are copy-pasteable
- Common scenarios covered
- Troubleshooting guide has solutions for 5+ common errors

### Phase 4: CI/CD Integration (Day 2, Morning)

**Objective**: Automated deployment pipeline

**Tasks**:

1. Create `.github/workflows/deploy-staging.yml`

   ```yaml
   name: Deploy to Staging
   on:
     push:
       branches: [develop]
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - Checkout code
         - Setup Supabase CLI
         - Validate migrations
         - Link to staging project (${{ secrets.SUPABASE_STAGING_PROJECT_ID }})
         - Run migrations (supabase db push)
         - Comment on PR with deployment URL
   ```

2. Create `.github/workflows/deploy-production.yml`

   ```yaml
   name: Deploy to Production
   on:
     push:
       branches: [main]
   jobs:
     deploy:
       runs-on: ubuntu-latest
       environment:
         name: production
         url: https://your-production-url.com
       steps:
         - Checkout code
         - Wait for approval (GitHub environment protection)
         - Setup Supabase CLI
         - Validate migrations
         - Link to production project (${{ secrets.SUPABASE_PRODUCTION_PROJECT_ID }})
         - Run migrations (supabase db push)
         - Notify on Slack/Discord (optional)
   ```

3. Configure GitHub environment secrets
   - `SUPABASE_ACCESS_TOKEN`
   - `SUPABASE_STAGING_PROJECT_ID`
   - `SUPABASE_PRODUCTION_PROJECT_ID`

4. Enable GitHub environment protection for production
   - Required reviewers: 1 (you)
   - Deployment branches: main only

**Acceptance Criteria**:

- Staging deploys automatically on develop merge
- Production requires manual approval
- Failed migrations don't deploy
- Deployment status visible in GitHub

### Phase 5: AI Command Guardrails (Day 2, Afternoon)

**Objective**: Safe AI-assisted migration creation

**Tasks**:

1. Create `.claude/commands/db-create-migration.md`

   ```markdown
   # Create Database Migration

   **IMPORTANT SAFETY RULES**:

   - NEVER apply migrations directly to any environment
   - ALWAYS create migration file for human review
   - ALWAYS run validation after creation
   - ALWAYS document intent in migration header

   Process:

   1. Ask user to describe schema change needed
   2. Generate SQL migration file
   3. Add header comments (purpose, dependencies, risks)
   4. Save to supabase/migrations/ with timestamp
   5. Run validation script
   6. Show validation results to user
   7. If warnings, explain risks and alternatives
   8. Ask user to review before proceeding
   ```

2. Create `.claude/commands/db-validate-migration.md`

   ```markdown
   # Validate Migration

   Run migration validation on specified file or all migrations.

   Process:

   1. Run pnpm db:validate
   2. Parse output
   3. Explain any warnings/errors in plain language
   4. Suggest fixes for common issues
   5. Provide examples from docs/wiki/
   ```

3. Create `.claude/commands/db-seed-dev.md`

   ```markdown
   # Seed Development Database

   Generate and load synthetic development data.

   Process:

   1. Ask user which entities to seed
   2. Ask for quantity (default: 50)
   3. Run pnpm db:reset (warns user data will be lost)
   4. Run pnpm db:seed:dev with parameters
   5. Report summary of created records
   ```

4. Update existing `/db:*` commands if any exist
   - Add human approval checkpoints
   - Add validation steps
   - Reference new documentation

**Acceptance Criteria**:

- AI commands never auto-apply migrations
- Validation runs before any migration suggestion
- Clear warnings for dangerous operations
- Links to relevant documentation
- Dry-run option available

### Phase 6: Testing & Validation (Day 3)

**Objective**: Comprehensive testing of all components

**Tasks**:

1. Create test migrations (good and bad)
   - Migration that passes validation
   - Migration with DROP TABLE (should warn)
   - Migration with missing RLS (should warn)
   - Migration with missing index on FK (should warn)
   - Migration with ALTER column type (should warn)

2. Test validation script
   - Run against all test migrations
   - Verify warnings are accurate
   - Verify suggested fixes are helpful

3. Test seed data
   - Reset local database
   - Run dev seed
   - Verify data is realistic and varied
   - Verify RLS policies work with seeded data

4. Test CI/CD pipeline
   - Create test PR to develop
   - Verify staging deployment
   - Create test PR to main
   - Verify approval gate
   - Verify production deployment

5. Test AI commands
   - Use /db-create-migration to create sample migration
   - Verify it creates file, runs validation, asks for approval
   - Use /db-validate-migration on existing migration
   - Verify output is helpful

6. Documentation review
   - Read through all docs as new user
   - Verify examples work
   - Verify troubleshooting guide is accurate

**Acceptance Criteria**:

- All validation tests pass
- Seeds create realistic data
- CI/CD pipeline works end-to-end
- AI commands are safe and helpful
- Documentation is complete and accurate

## Testing Strategy

Following TDD order: Contracts → RLS → E2E → Unit

### 1. Contracts (Migration Safety)

**Purpose**: Define what makes a migration safe

```typescript
// scripts/validate-migration.test.ts
describe('Migration Validation', () => {
  it('should reject DROP TABLE', () => {
    const sql = 'DROP TABLE users;';
    const result = validateMigration(sql);
    expect(result.errors).toContain('Destructive operation: DROP TABLE');
  });

  it('should reject ALTER COLUMN type change without conversion', () => {
    const sql = 'ALTER TABLE users ALTER COLUMN age TYPE text;';
    const result = validateMigration(sql);
    expect(result.warnings).toContain('Type change may cause data loss');
  });

  it('should warn on missing RLS for new table', () => {
    const sql = 'CREATE TABLE posts (id uuid);';
    const result = validateMigration(sql);
    expect(result.warnings).toContain('No RLS policies defined');
  });
});
```

### 2. RLS Tests (Seed Data Respects Policies)

**Purpose**: Ensure seed data works with security policies

```typescript
// scripts/seed-dev.test.ts
describe('Development Seed Data', () => {
  it('should create users that can access their own data', async () => {
    await seedDev();
    const { data, error } = await supabase.from('users').select('*').eq('id', testUserId);
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
  });

  it('should respect organization isolation', async () => {
    await seedDev();
    const { data } = await supabase.from('organizations').select('*');
    // User can only see their own orgs
    expect(data.length).toBeLessThan(totalOrgCount);
  });
});
```

### 3. E2E Tests (Migration Workflow)

**Purpose**: Validate full migration lifecycle

```typescript
// e2e/migration-workflow.spec.ts
test('developer can create and apply migration locally', async ({ page }) => {
  // Use AI command to create migration
  await page.goto('/');
  await runAICommand('/db-create-migration');
  await page.fill('textarea', 'Add posts table');

  // Verify migration file created
  await expect(page.getByText(/Migration created:/)).toBeVisible();

  // Verify validation ran
  await expect(page.getByText(/✓ Validation passed/)).toBeVisible();

  // Apply migration locally
  await runCommand('supabase db reset');

  // Verify table exists
  const { data, error } = await supabase.from('posts').select('*').limit(0);
  expect(error).toBeNull();
});

test('CI blocks invalid migration', async () => {
  // Create PR with bad migration (DROP TABLE)
  // Verify CI fails
  // Verify deployment blocked
});

test('production deployment requires approval', async () => {
  // Create PR to main
  // Verify deployment waits
  // Approve deployment
  // Verify migration applied
});
```

### 4. Unit Tests (Individual Components)

**Purpose**: Test individual functions

```typescript
// scripts/validators.test.ts
describe('SQL Validators', () => {
  describe('detectDestructiveOperations', () => {
    it('should detect DROP TABLE', () => {
      expect(detectDestructiveOperations('DROP TABLE users;')).toBe(true);
    });

    it('should detect TRUNCATE', () => {
      expect(detectDestructiveOperations('TRUNCATE posts;')).toBe(true);
    });
  });

  describe('detectMissingRLS', () => {
    it('should detect CREATE TABLE without RLS', () => {
      const sql = 'CREATE TABLE posts (id uuid);';
      expect(detectMissingRLS(sql)).toBe(true);
    });
  });
});
```

## Security Considerations

### 1. Migration Validation

**Risk**: AI-generated migrations could contain destructive operations

**Mitigation**:

- Validation script runs on every migration
- Human review required before production
- Clear warnings for all dangerous patterns
- No auto-application to any environment

### 2. Seed Data

**Risk**: Seed data might expose production patterns

**Mitigation**:

- Use synthetic data only (no production data)
- Separate seeds for dev vs test
- Seeds use service role key (secured via env vars)
- Document that seed.sql should never contain real data

### 3. CI/CD Secrets

**Risk**: Leaked secrets could allow unauthorized deployments

**Mitigation**:

- Use GitHub environment secrets
- Limit secret access to production environment
- Enable GitHub environment protection
- Require approval for production deployments
- Audit log of all deployments

### 4. RLS Policy Testing

**Risk**: Missing or incorrect RLS policies could expose data

**Mitigation**:

- Validation warns on missing RLS
- RLS pattern documentation with tested examples
- Seed data tests verify RLS works
- Test suite includes RLS policy tests

## Dependencies

### New Dependencies

1. **@faker-js/faker** (^8.4.1)
   - **Purpose**: Generate realistic synthetic seed data
   - **Justification**: Industry standard, 15M weekly downloads, MIT license
   - **Alternatives**: Chance.js (less active), custom generators (too much work)

### Optional Future Dependencies

1. **Neosync** (Future consideration)
   - **Purpose**: Advanced synthetic data generation for Supabase
   - **Justification**: Purpose-built for Supabase, maintains referential integrity
   - **Decision**: Start with Faker, add Neosync if needed

2. **SQL Parser** (Future consideration)
   - **Purpose**: More robust SQL parsing than regex
   - **Justification**: Better accuracy for complex migrations
   - **Decision**: Regex sufficient for MVP, add parser if needed

## Risks & Mitigation

### Risk 1: Validation False Positives

**Risk**: Validation script incorrectly flags safe migrations

**Impact**: Developer friction, bypassing validation

**Probability**: Medium

**Mitigation**:

- Thorough testing with real-world migrations
- Clear documentation on override process
- Feedback loop to improve validation rules
- Warnings vs errors (warnings don't block)

### Risk 2: GitHub Actions Configuration

**Risk**: Incorrect CI/CD setup could auto-deploy bad migrations

**Impact**: Production incidents

**Probability**: Low

**Mitigation**:

- Test on staging first
- Require manual approval for production
- Comprehensive CI testing before production use
- Deployment checklist in documentation

### Risk 3: Seed Data Drift

**Risk**: Seed data doesn't match production schema evolution

**Impact**: Local dev environment breaks

**Probability**: Medium

**Mitigation**:

- Seed scripts run after migrations
- Test seeds in CI
- Documentation on updating seeds
- Fail-fast on seed errors

### Risk 4: Documentation Staleness

**Risk**: Documentation becomes outdated as workflow evolves

**Impact**: Confusion, incorrect usage

**Probability**: Medium

**Mitigation**:

- Documentation is executable (copy-paste examples)
- Version docs alongside code
- Regular documentation review
- Add docs update to PR checklist

## Success Metrics

### Developer Experience

- **Migration Confidence**: Developer can create migrations without anxiety
- **Validation Accuracy**: <5% false positive rate
- **Seed Speed**: Full reset + seed <30 seconds locally
- **Documentation Usefulness**: 80%+ of migrations use pattern templates

### Safety

- **Zero Production Incidents**: No data loss from migrations
- **Validation Coverage**: 100% of dangerous patterns detected
- **CI Reliability**: >99% uptime for CI/CD pipeline

### Velocity

- **Migration Time**: Create → test → deploy <15 minutes
- **Approval Time**: Production approval <1 hour (during work hours)

## Rollout Plan

### Phase 1: Local Development (Day 1-2)

- Validation script
- Seed data
- Documentation
- Test on existing migrations

### Phase 2: CI/CD (Day 2-3)

- Staging pipeline
- Production pipeline (manual only)
- Test with sample migrations

### Phase 3: AI Integration (Day 3)

- AI command updates
- Test AI-assisted workflow
- Refine based on usage

### Phase 4: Team Rollout (Future)

- Train on workflow
- Review documentation
- Gather feedback
- Iterate on tooling

## Next Steps

After plan approval:

1. Create tasks breakdown (`/spec:tasks`)
2. Set up development branch
3. Begin Phase 1 implementation
4. Regular checkpoints after each phase

## References

- **Research**: [migration-workflow-research-20251004.md](../docs/research/migration-workflow-research-20251004.md)
- **Specification**: [SPEC-20251004-database-migration-workflow](../specs/feature-005-database-migration-workflow.md)
- **Supabase Migrations**: https://supabase.com/docs/guides/cli/local-development#database-migrations
- **Supabase CI/CD**: https://supabase.com/docs/guides/deployment/managing-environments
- **Faker.js**: https://fakerjs.dev/
- **GitHub Actions**: https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment
