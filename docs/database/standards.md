# Database Standards

**Version**: 1.0
**Last Updated**: 2025-10-28
**Status**: Active

## Overview

This document defines the standards and best practices for database schema design, migrations, and security in the DL Starter project.

## Table of Contents

- [Row-Level Security (RLS)](#row-level-security-rls)
- [Schema Design](#schema-design)
- [Migrations](#migrations)
- [Naming Conventions](#naming-conventions)
- [Performance](#performance)
- [Testing](#testing)

## Row-Level Security (RLS)

### Mandatory RLS Policy

**RULE**: All tables containing user data MUST have Row-Level Security (RLS) enabled.

###

✅ Tables Requiring RLS

All tables with any of the following characteristics MUST have RLS:

- Contains a `user_id`, `owner_id`, or `author_id` column
- Stores user-specific data (profiles, settings, preferences)
- Contains multi-tenant data (organization, workspace, team data)
- Stores private user content (posts, comments, messages, documents)
- Contains sensitive information (financial, health, personal data)
- Has foreign keys to user-owned tables

### 🔒 RLS Implementation Requirements

When implementing RLS on a table:

1. **Enable RLS** in the same migration that creates the table:

   ```sql
   CREATE TABLE user_profiles (...);
   ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE user_profiles FORCE ROW LEVEL SECURITY;
   ```

2. **Create policies** for all operations (SELECT, INSERT, UPDATE, DELETE)

3. **Write tests** to validate policies (see `apps/web/tests/rls/`)

4. **Document exceptions** (if RLS is not needed, justify in this file)

### ⚠️ RLS Exceptions

Tables that are explicitly exempt from RLS requirements:

| Table           | Reason                 | Security Measures                        |
| --------------- | ---------------------- | ---------------------------------------- |
| `_health_check` | Public health endpoint | Has policies for anonymous read only     |
| `_migrations`   | Supabase internal      | Managed by Supabase, not user-accessible |

**Adding Exceptions**: To add a table to this list:

1. Document the table name and reason
2. Specify alternative security measures
3. Get approval from team lead or security reviewer
4. Add to `RLS_EXCEPTIONS` array in `scripts/db/validate-rls.ts`

### 🛠️ RLS Tools

Use these tools to implement and validate RLS:

```bash
# Generate RLS policies for a table
pnpm tsx scripts/db/rls-scaffold.ts <table_name> [options]

# Validate all tables have RLS
pnpm db:validate:rls

# Run RLS tests
pnpm test:rls
```

### ⚡ RLS Performance Optimization (CRITICAL)

**ALWAYS use optimized templates when creating new tables with RLS.** Unoptimized RLS can cause 100x+ slower queries.

**Templates available:**

- `supabase/templates/table-with-user-rls.sql` - User-scoped tables (profiles, settings)
- `supabase/templates/table-with-team-rls.sql` - Team-scoped tables (projects, documents)

**Quick start:**

```bash
# Copy template
cp supabase/templates/table-with-user-rls.sql \
   supabase/migrations/$(date +%Y%m%d%H%M%S)_create_my_table.sql

# Replace TABLENAME with your table name
sed -i '' 's/TABLENAME/my_table/g' supabase/migrations/*_create_my_table.sql

# Apply migration
pnpm db:reset
```

**Performance impact:**

- ✅ Indexes on filter columns: 99.94% faster (171ms → <0.1ms)
- ✅ Function caching: 94.97% faster (179ms → 9ms)
- ✅ Security definer helpers: 99.993% faster (178,000ms → 12ms)
- ✅ Role specification: 99.78% faster (skips unnecessary evaluation)

**See:** [RLS Performance Optimization Guide](./RLS_OPTIMIZATION.md) for complete details.

**References:**

- [RLS Implementation Guide](./rls-implementation.md) - Basic RLS setup
- [RLS Optimization Guide](./RLS_OPTIMIZATION.md) - Performance best practices
- [Templates](../../supabase/templates/) - Production-ready SQL templates

## Schema Design

### Table Design Principles

1. **Normalization**: Normalize to 3NF unless performance requires denormalization
2. **Primary Keys**: Always use UUID for primary keys (never auto-increment integers)
3. **Foreign Keys**: Always define foreign key constraints
4. **NOT NULL**: Be explicit about nullable columns
5. **Defaults**: Provide sensible defaults where applicable

### Standard Columns

All tables SHOULD include these standard columns:

```sql
CREATE TABLE example_table (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Ownership (if user-owned data)
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Soft deletes (optional, if needed)
  deleted_at TIMESTAMPTZ,

  -- Your domain columns
  ...
);
```

### Timestamps

Use `created_at` and `updated_at` for all tables:

```sql
-- Add timestamps to table
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()

-- Create trigger to auto-update updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON example_table
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
```

### Soft Deletes

For tables requiring soft deletes:

```sql
-- Add deleted_at column
deleted_at TIMESTAMPTZ

-- Queries should filter out soft-deleted records
SELECT * FROM table WHERE deleted_at IS NULL;

-- RLS policies should exclude soft-deleted records
USING (auth.uid() = user_id AND deleted_at IS NULL)
```

## Migrations

### Migration File Naming

Migrations must follow this format:

```text
YYYYMMDDHHMMSS_description.sql
```

Example:

```text
20250926120000_add_user_profiles_table.sql
20250927140000_add_rls_to_posts.sql
```

### Migration Structure

Every migration should:

1. **Start with a transaction** (if supported):

   ```sql
   BEGIN;
   ```

2. **Include comments** explaining the change:

   ```sql
   -- Migration: Add user profiles table
   -- Generated: 2025-09-26T12:00:00.000Z
   -- Purpose: Store user profile information
   ```

3. **Be idempotent** where possible:

   ```sql
   CREATE TABLE IF NOT EXISTS user_profiles (...);
   DROP POLICY IF EXISTS "users_select_own" ON users;
   CREATE POLICY "users_select_own" ON users ...;
   ```

4. **Enable RLS** for new tables:

   ```sql
   CREATE TABLE new_table (...);
   ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;
   ```

5. **End with a commit**:

   ```sql
   COMMIT;
   ```

### Migration Checklist

Before applying a migration:

- [ ] Migration file name follows format
- [ ] Includes descriptive comments
- [ ] Uses IF NOT EXISTS / IF EXISTS for idempotency
- [ ] Enables RLS on new tables (if required)
- [ ] Creates RLS policies for new tables
- [ ] Includes appropriate indexes
- [ ] Has been validated with `pnpm db:validate`
- [ ] Has been tested locally
- [ ] Includes rollback notes (if complex)

### Rollback Strategy

Always document how to rollback complex migrations:

```sql
-- Migration: Add complex feature
-- Rollback: DROP TABLE feature_table; DROP FUNCTION feature_fn;

CREATE TABLE feature_table (...);
CREATE FUNCTION feature_fn() ...;
```

## Naming Conventions

### Tables

- Use **plural nouns**: `users`, `posts`, `comments`
- Use **snake_case**: `user_profiles`, `blog_posts`
- Avoid prefixes: `users` not `tbl_users`

### Columns

- Use **snake_case**: `user_id`, `created_at`, `is_active`
- Use descriptive names: `author_id` not `author`
- Boolean columns: prefix with `is_`, `has_`, `can_`
  - `is_active`, `has_permission`, `can_edit`

### Constraints

```sql
-- Primary keys
{table}_pkey

-- Foreign keys
{table}_{column}_fkey

-- Unique constraints
{table}_{column}_key

-- Check constraints
{table}_{column}_check
```

### Indexes

```sql
-- Single column index
idx_{table}_{column}

-- Multi-column index
idx_{table}_{column1}_{column2}

-- Unique index
uniq_{table}_{column}

-- Partial index
idx_{table}_{column}_where_{condition}
```

### Policies (RLS)

```sql
-- Format: {table}_{operation}_{description}
"users_select_own"           -- Users can select their own rows
"posts_insert_authenticated" -- Authenticated users can insert
"comments_update_author"     -- Authors can update their comments
"org_data_select_members"    -- Org members can select org data
```

## Performance

### Indexes

Create indexes for:

1. **Foreign keys**: Always index foreign key columns

   ```sql
   CREATE INDEX idx_posts_user_id ON posts(user_id);
   ```

2. **Frequently queried columns**:

   ```sql
   CREATE INDEX idx_posts_status ON posts(status);
   ```

3. **Sort/filter columns**:

   ```sql
   CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
   ```

4. **Composite indexes** for multi-column queries:

   ```sql
   CREATE INDEX idx_posts_user_status ON posts(user_id, status);
   ```

### Query Optimization

1. **Use EXPLAIN ANALYZE** to understand query performance
2. **Avoid SELECT \***: Select only needed columns
3. **Use pagination**: Implement cursor-based pagination for large result sets
4. **Batch operations**: Use batch inserts/updates when possible

## Testing

### Database Testing Requirements

1. **RLS Tests**: All RLS policies must have corresponding tests
   - Location: `apps/web/tests/rls/`
   - See: [RLS Contracts](../../apps/web/tests/rls/contracts.md)

2. **Migration Tests**: Validate migrations before applying

   ```bash
   pnpm db:validate
   ```

3. **Integration Tests**: Test database operations in application context

   ```bash
   pnpm test:integration
   ```

### Test Data

Use `supabase/seed.sql` for test data:

```sql
-- Seed file should be idempotent
DO $$
BEGIN
    -- Insert test data only if it doesn't exist
    INSERT INTO users (id, email)
    SELECT 'test-user-id', 'test@example.com'
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 'test-user-id');
END $$;
```

## CI/CD Integration

### Pre-Deploy Checks

These checks run automatically in CI/CD:

1. **Migration Validation**: `pnpm db:validate`
2. **RLS Validation**: `pnpm db:validate:rls`
3. **Type Generation**: `pnpm db:types`
4. **Database Tests**: `pnpm test:rls`

### Deployment Process

1. Migrations are applied automatically via GitHub Actions
2. RLS validation blocks deployment if gaps found
3. Failed migrations trigger rollback

## Security Best Practices

### 1. Never Trust User Input

```sql
-- ❌ WRONG: Vulnerable to SQL injection
CREATE FUNCTION search(query TEXT) ...
  EXECUTE 'SELECT * FROM users WHERE name = ' || query;

-- ✅ CORRECT: Use parameterized queries
CREATE FUNCTION search(query TEXT) ...
  EXECUTE 'SELECT * FROM users WHERE name = $1' USING query;
```

### 2. Use Least Privilege

```sql
-- Grant minimum necessary permissions
GRANT SELECT ON users TO authenticated;
GRANT SELECT, INSERT, UPDATE ON posts TO authenticated;
-- Don't grant DELETE unless necessary
```

### 3. Protect Sensitive Data

```sql
-- Use RLS to protect sensitive columns
CREATE POLICY "users_read_public_only" ON users
  FOR SELECT
  USING (
    CASE
      WHEN auth.uid() = id THEN true  -- User can see own data
      ELSE email IS NULL               -- Others see limited data
    END
  );
```

### 4. Audit Critical Operations

```sql
-- Create audit log for sensitive operations
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to log deletions
CREATE TRIGGER audit_user_deletes
  AFTER DELETE ON users
  FOR EACH ROW
  EXECUTE FUNCTION log_deletion();
```

## References

- [RLS Implementation Guide](./rls-implementation.md)
- [RLS Contracts](../../apps/web/tests/rls/contracts.md)
- [Supabase Schema Design](https://supabase.com/docs/guides/database/tables)
- [PostgreSQL Best Practices](https://www.postgresql.org/docs/current/sql.html)

## Version History

- **1.0** (2025-10-28): Initial standards document with RLS requirements
