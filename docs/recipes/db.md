# Database Recipe

**Goal**: Safe, validated database migrations with Supabase and comprehensive seeding.

## Architecture

- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Migrations**: SQL files in `supabase/migrations/`
- **Validation**: Automated safety checks for destructive operations
- **Seeding**: Development and test data generation

## Migration Workflow

### Creating Migrations

```bash
# Create a new migration file
supabase migration new <description>

# Edit the generated file in supabase/migrations/
# Example: supabase/migrations/20251004120000_add_posts_table.sql
```

**Best Practices**:

- Always enable RLS on new tables: `ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;`
- Add indexes for foreign keys: `CREATE INDEX idx_<table>_<column> ON <table>(<column>);`
- Include type conversion clauses: `ALTER COLUMN <col> TYPE <type> USING <col>::<type>`
- Document migration intent in SQL comments

### Validating Migrations

Before committing migrations, validate them for safety:

```bash
pnpm db:validate
```

**Validation Checks**:

- ❌ **Errors (blocking)**:
  - `DROP TABLE` - Permanently deletes data
  - `DROP COLUMN` - Permanently deletes column data
  - `TRUNCATE` - Deletes all rows

- ⚠️ **Warnings (non-blocking)**:
  - `MISSING_RLS` - Table created without Row Level Security
  - `MISSING_INDEX_FK` - Foreign key without index (performance issue)
  - `TYPE_CHANGE` - Column type change without USING clause

**Example Output**:

```text
Validating 3 migration files...

✓ 20251004120000_add_posts_table.sql
⚠️  20251004130000_add_comments_table.sql
   WARN [MISSING_INDEX_FK]: Foreign key column 'post_id' does not have an index
   → Add: CREATE INDEX idx_comments_post_id ON comments(post_id);
✓ 20251004140000_add_rls_policies.sql

✅ All migrations passed validation
```

### Applying Migrations

**Local Development**:

```bash
# Reset database and apply all migrations
pnpm db:reset

# Or use Supabase CLI directly
supabase db reset
```

**Production/Staging**:

```bash
# Link to remote project
supabase link --project-ref <project-id>

# Push migrations
supabase db push
```

## Seeding Data

### Development Seeds

Generate realistic test data for local development:

```bash
# Seed 50 users (default)
pnpm db:seed:dev

# Seed custom number of users
USER_COUNT=100 pnpm db:seed:dev
```

**Features**:

- Uses [@faker-js/faker](https://fakerjs.dev/) for realistic data
- Generates unique emails, names, bios, avatars
- Configurable entity counts
- Fast generation (typically <5s for 50 users)

### Test Seeds

Generate deterministic data for E2E tests:

```bash
pnpm db:seed:test
```

**Features**:

- Fixed user IDs: `test-user-1`, `test-user-2`, `test-user-admin`
- Known emails: `test1@example.com`, `admin@example.com`
- Deterministic - same data every run
- Perfect for E2E test assertions

## Common Workflows

### Full Local Reset

```bash
# Stop Supabase
pnpm db:stop

# Start fresh
pnpm db:start

# Reset database with migrations + base seed
pnpm db:reset

# Add development data
pnpm db:seed:dev
```

### Pre-commit Checks

```bash
# Validate migrations before committing
pnpm db:validate

# Check migration status
pnpm db:status
```

### Troubleshooting

#### "Validation failed with errors"

- Review the error messages and suggestions
- Never commit migrations with destructive operations
- Consider two-step migrations for breaking changes

#### "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"

- Ensure `.env.local` has required variables
- Copy from `.env.example` if needed
- Check Supabase project settings for keys

#### Seed fails with RLS errors

- Seeds use service role key (bypasses RLS)
- Check environment variables are loaded
- Verify table structure matches seed data

## Migration Safety Rules

1. **Never commit destructive migrations** without team review
2. **Always enable RLS** on new tables
3. **Add indexes** for all foreign key columns
4. **Document** the purpose of each migration
5. **Test locally** before pushing to staging/production
6. **Use validation** before committing (`pnpm db:validate`)

## RLS Validation

Row-Level Security (RLS) is critical for data security. We automatically validate that all tables have proper RLS policies.

### Running RLS Validation Locally

```bash
# Validate all tables have RLS enabled
pnpm db:validate:rls

# Verbose output with policy details
pnpm db:validate:rls -- --verbose

# JSON output for CI integration
pnpm db:validate:rls -- --json
```

### What Gets Validated

**✅ RLS Enabled Check**:

- All tables must have `ENABLE ROW LEVEL SECURITY`
- Exception tables are documented in `scripts/db/validate-rls.ts`

**✅ Policy Completeness**:

- Tables should have policies for SELECT, INSERT, UPDATE, DELETE
- Or use an ALL policy if appropriate
- Missing operations are flagged as warnings

**✅ Policy Quality**:

- RLS enabled but not forced (consider `FORCE ROW LEVEL SECURITY`)
- RLS enabled but no policies (table is inaccessible)
- Tables without RLS (security gap)

### Understanding the Output

#### Example: No Issues

```text
🔍 Validating Row-Level Security policies...

📊 Total tables: 5
✅ Tables with RLS: 5
⚠️  Tables without RLS: 0
🔓 Approved exceptions: 1
```

#### Example: RLS Gap Found

```text
🔍 Validating Row-Level Security policies...

❌ Tables WITHOUT RLS:

   • dangerous_table

📊 Total tables: 5
✅ Tables with RLS: 4
⚠️  Tables without RLS: 1
🔓 Approved exceptions: 0

❌ RLS GAPS FOUND: 1 table(s) missing RLS

💡 To fix RLS gaps:
   1. Review docs/database/rls-implementation.md
   2. Generate policies: pnpm tsx scripts/db/rls-scaffold.ts <table_name>
   3. Or add to exceptions in docs/database/standards.md (with justification)

📖 Documentation: docs/recipes/db.md#rls-validation
```

### Fixing RLS Issues

**1. Enable RLS on a table:**

```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

**2. Add basic CRUD policies:**

```sql
-- Allow users to read their own data
CREATE POLICY "Users can read own data" ON table_name
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own data
CREATE POLICY "Users can insert own data" ON table_name
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own data
CREATE POLICY "Users can update own data" ON table_name
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own data
CREATE POLICY "Users can delete own data" ON table_name
  FOR DELETE USING (auth.uid() = user_id);
```

**3. Or use the scaffolding script:**

```bash
pnpm tsx scripts/db/rls-scaffold.ts table_name
```

### CI/CD Integration

RLS validation runs automatically in CI for all pull requests:

```yaml
# .github/workflows/ci.yml
- name: Validate RLS Policies
  env:
    SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
    SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
  run: pnpm db:validate:rls
```

**Requirements**:

- Supabase project must be set up
- GitHub secrets must include `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Validation runs on all PRs
- CI fails if RLS gaps are found

**Skipping RLS Validation**:

If you don't have Supabase configured yet, CI will skip RLS validation with a warning:

```text
⚠️  Supabase credentials not configured in CI
📝 Skipping RLS validation (requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY)
ℹ️  To enable: Add secrets in GitHub repository settings
```

## CI/CD Integration

Migrations are validated in CI:

- ✅ Pre-commit hook runs migration validation
- ✅ CI workflow validates migrations and RLS policies
- ✅ CI blocks on validation errors or RLS gaps
- ✅ Staging deploys after validation passes
- ✅ Production requires manual approval + validation

## File Structure

```text
supabase/
├── config.toml           # Supabase configuration
├── seed.sql              # Base seed (health check, system user)
└── migrations/           # Timestamped migration files
    └── 20251004120000_add_posts_table.sql

scripts/
├── types/
│   ├── migration-validation.ts  # Validation types
│   └── seed-data.ts             # Seed types
├── validators/
│   └── index.ts                 # Validation logic
├── validate-migration.ts        # Main validation script
├── seed-dev.ts                  # Development seed generator
└── seed-test.ts                 # Test seed generator
```

## References

- [Supabase Migrations](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [@faker-js/faker](https://fakerjs.dev/)
- [Database Migration Workflow Spec](../specs/spec-005-database-migration-workflow.md)
