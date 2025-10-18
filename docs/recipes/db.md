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

## CI/CD Integration

Migrations are validated in CI:

- ✅ Pre-commit hook runs validation
- ✅ CI workflow blocks on validation errors
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
