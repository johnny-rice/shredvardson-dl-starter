# Row-Level Security (RLS) Implementation Guide

**Version**: 1.0
**Last Updated**: 2025-10-28
**Status**: Active

## Overview

This guide provides comprehensive instructions for implementing Row-Level Security (RLS) policies in the DL Starter database. RLS is a critical security feature that ensures data isolation between users and enforces access control at the database level.

## Table of Contents

- [What is RLS?](#what-is-rls)
- [When to Use RLS](#when-to-use-rls)
- [RLS Patterns](#rls-patterns)
- [Implementation Steps](#implementation-steps)
- [Testing RLS Policies](#testing-rls-policies)
- [Common Pitfalls](#common-pitfalls)
- [Tools and Automation](#tools-and-automation)

## What is RLS?

Row-Level Security (RLS) is a PostgreSQL feature that allows you to control which rows users can access in a table. Instead of relying solely on application-level access control, RLS enforces security at the database level, providing defense-in-depth.

### Benefits

- **Defense in Depth**: Security enforced at database layer, not just application
- **Prevents Data Leaks**: Compromised application code cannot bypass RLS
- **Multi-Tenancy**: Easily isolate data between users/organizations
- **Audit Trail**: Policies are visible and version-controlled in migrations

### How It Works

```sql
-- 1. Enable RLS on a table
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 2. Create policies that define access rules
CREATE POLICY "Users can read own posts" ON posts
  FOR SELECT
  USING (auth.uid() = user_id);
```

When a user queries the table, PostgreSQL automatically applies the policy, filtering rows based on the `USING` clause.

## When to Use RLS

### ✅ Always Use RLS For

- **User data**: Tables containing user-specific information (profiles, settings, etc.)
- **Multi-tenant data**: Data belonging to organizations, workspaces, teams
- **Private content**: Posts, comments, messages, documents owned by users
- **Sensitive data**: Financial records, health data, personal information

### ⚠️ Consider Exceptions For

- **Public data**: Content explicitly intended for public consumption
- **Reference data**: Lookup tables, categories, tags (read-only for all)
- **System tables**: Health checks, migrations, internal tracking
- **Anonymous access**: Tables that need anonymous read access (must still have policies!)

### ❌ Never Skip RLS For

- Any table containing a `user_id` or `owner_id` column
- Tables with foreign keys to user-owned data
- Any table in a multi-tenant schema

## RLS Patterns

### Pattern 1: User Ownership (Most Common)

**Use Case**: Each row belongs to a single user

```sql
-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles FORCE ROW LEVEL SECURITY;

-- SELECT: Users can read their own data
-- Note: Wrap auth.uid() in SELECT for performance (100x+ faster on large tables)
CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- INSERT: Users can create their own data
CREATE POLICY "Users can create own profile" ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- UPDATE: Users can update their own data
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- DELETE: Users can delete their own data
CREATE POLICY "Users can delete own profile" ON user_profiles
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- CRITICAL: Index the user_id column for optimal performance
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
```

### Pattern 2: Multi-Tenant Organization Access

**Use Case**: Users access data within their organization

```sql
-- Enable RLS
ALTER TABLE org_documents ENABLE ROW LEVEL SECURITY;

-- Users can access documents in their organization
CREATE POLICY "Org members can read org documents" ON org_documents
  FOR SELECT
  TO authenticated
  USING (
    org_id IN (
      SELECT org_id FROM org_members
      WHERE user_id = auth.uid()
    )
  );

-- Only authors can update their documents
CREATE POLICY "Authors can update own documents" ON org_documents
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id);
```

### Pattern 3: Role-Based Access

**Use Case**: Different permissions based on user role

```sql
-- Enable RLS
ALTER TABLE team_settings ENABLE ROW LEVEL SECURITY;

-- Admins can read all settings
CREATE POLICY "Admins can read all settings" ON team_settings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_id = team_settings.team_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

-- Members can only read, not modify
CREATE POLICY "Members can read settings" ON team_settings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_id = team_settings.team_id
        AND user_id = auth.uid()
    )
  );
```

### Pattern 4: Public Read, Private Write

**Use Case**: Content that is public but can only be modified by owner

```sql
-- Enable RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous) can read published posts
CREATE POLICY "Anyone can read published posts" ON blog_posts
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

-- Authors can read their own drafts
CREATE POLICY "Authors can read own drafts" ON blog_posts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = author_id);

-- Only authors can update their posts
CREATE POLICY "Authors can update own posts" ON blog_posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id);
```

### Pattern 5: Service Role Override

**Use Case**: Admin operations that bypass RLS

```sql
-- Service role can do anything (for migrations, admin tools)
CREATE POLICY "Service role has full access" ON sensitive_table
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
```

## Implementation Steps

### Step 1: Plan Your RLS Strategy

Before writing code, answer these questions:

1. **Who owns this data?** (user, organization, public)
2. **What access patterns are needed?** (read, write, delete)
3. **Are there different roles?** (owner, admin, member, anonymous)
4. **Should anonymous users have access?** (read-only, none)

### Step 2: Use the RLS Scaffold Tool

We provide a tool to generate RLS policies automatically:

```bash
# Basic usage (user_id ownership)
pnpm tsx scripts/db/rls-scaffold.ts user_profiles

# Custom owner column
pnpm tsx scripts/db/rls-scaffold.ts posts --owner-column=author_id

# Public read access
pnpm tsx scripts/db/rls-scaffold.ts articles --public-read

# Allow anonymous users (role-based)
pnpm tsx scripts/db/rls-scaffold.ts comments --allow-anon

# Soft deletes support
pnpm tsx scripts/db/rls-scaffold.ts tasks --soft-deletes

# Dry run (preview without creating file)
pnpm tsx scripts/db/rls-scaffold.ts users --dry-run
```

This creates a migration file in `supabase/migrations/` with:

- `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
- Policies for SELECT, INSERT, UPDATE, DELETE
- Comments explaining each policy

### Step 3: Review and Customize the Generated Migration

The scaffold tool creates a starting point. Always review and customize:

```sql
-- Example generated file: supabase/migrations/rls_users_1234567890.sql

-- Enable RLS on the table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users FORCE ROW LEVEL SECURITY;

-- Users can read their own records
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ⚠️ REVIEW: Customize this! Maybe users should see other profiles?
-- Consider changing to: USING (true) for public profiles
```

### Step 4: Apply the Migration

```bash
# Validate migration syntax
pnpm db:validate

# Apply migration to local database
pnpm db:migrate

# Or if using Supabase CLI directly
supabase db push
```

### Step 5: Write RLS Tests

Every RLS policy must have corresponding tests. See [Testing RLS Policies](#testing-rls-policies) below.

### Step 6: Document Exceptions

If a table legitimately doesn't need RLS, document it in `docs/database/standards.md`:

```markdown
## RLS Exceptions

- `_health_check`: Public health check endpoint (has policies for anon read)
- `lookup_countries`: Static reference data (read-only for all users)
```

## Testing RLS Policies

### Manual Testing with SQL

Test RLS policies by impersonating different users:

```sql
-- Impersonate a user
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "user-id-123"}';

-- Try to read data (should only see user-id-123's data)
SELECT * FROM user_profiles;

-- Try to read another user's data (should return nothing)
SELECT * FROM user_profiles WHERE user_id = 'other-user-id';

-- Reset
RESET role;
RESET request.jwt.claims;
```

### Automated RLS Tests

Use the RLS test helpers in `apps/web/tests/rls/helpers.ts`:

```typescript
import { createTestUsers, impersonateUser, createAdminClient } from './helpers';

describe('user_profiles RLS', () => {
  let user1: User;
  let user2: User;

  beforeEach(async () => {
    [user1, user2] = await createTestUsers(2);
  });

  it('should only allow users to read their own profile', async () => {
    const client = await impersonateUser(user1.id);

    const { data, error } = await client.from('user_profiles').select('*');

    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data[0].user_id).toBe(user1.id);
  });

  it('should not allow users to read other profiles', async () => {
    const client = await impersonateUser(user1.id);

    const { data } = await client.from('user_profiles').select('*').eq('user_id', user2.id);

    expect(data).toHaveLength(0); // RLS blocks access
  });
});
```

### RLS Testing Checklist

For each table with RLS:

- [ ] User can read own data
- [ ] User cannot read other user's data
- [ ] User can insert own data
- [ ] User cannot insert data for other users
- [ ] User can update own data
- [ ] User cannot update other user's data
- [ ] User can delete own data
- [ ] User cannot delete other user's data
- [ ] Anonymous access behaves correctly
- [ ] Service role can bypass RLS (if needed)

## Performance Optimization

RLS policies can significantly impact query performance if not optimized correctly. Follow these best practices for optimal performance.

### 1. Always Index Columns Used in RLS Policies

**Critical**: Index any columns referenced in your RLS policies. This can provide **100x+ performance improvements** on large tables.

```sql
-- ❌ WRONG: No index on user_id
CREATE TABLE posts (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_select_own" ON posts
  FOR SELECT USING (auth.uid() = user_id);

-- ✅ CORRECT: Index the column used in RLS policy
CREATE INDEX idx_posts_user_id ON posts(user_id);
```

**Rule**: If your RLS policy references a column, that column MUST have an index.

### 2. Wrap auth.uid() in SELECT for Caching

Wrapping `auth.uid()` in a `SELECT` statement causes PostgreSQL to cache the result instead of calling the function for every row.

```sql
-- ❌ WRONG: Function called for every row (very slow on large tables)
CREATE POLICY "users_select_own" ON posts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ✅ CORRECT: Function result cached (100x+ faster)
CREATE POLICY "users_select_own" ON posts
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);
```

**Impact**: On a table with 100,000 rows, this optimization can reduce query time from 30s to 0.3s.

### 3. Use STABLE Functions Without Row Parameters

Functions in RLS policies must be `STABLE` (not `VOLATILE`) and should not receive row data as parameters. This allows PostgreSQL to cache the result.

```sql
-- ✅ GOOD: STABLE function without row parameters
CREATE FUNCTION is_admin() RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  )
$$ LANGUAGE SQL STABLE;

CREATE POLICY "admins_read_all" ON sensitive_data
  FOR SELECT
  USING ((SELECT is_admin()));

-- ❌ BAD: Function receives row data (no caching possible)
CREATE FUNCTION can_access_row(row_user_id UUID) RETURNS BOOLEAN AS $$
  SELECT auth.uid() = row_user_id
$$ LANGUAGE SQL STABLE;
```

### 4. Avoid Subqueries - Use SECURITY DEFINER Instead

RLS policies respect other RLS policies, so subqueries can trigger chained RLS evaluations. Use `SECURITY DEFINER` functions to bypass this.

```sql
-- ❌ SLOW: Subquery invokes RLS on org_members table
CREATE POLICY "org_data_access" ON org_documents
  FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM org_members
      WHERE user_id = auth.uid()
    )
  );

-- ✅ FAST: SECURITY DEFINER function bypasses RLS on org_members
CREATE FUNCTION user_org_ids() RETURNS SETOF UUID AS $$
  SELECT org_id FROM org_members
  WHERE user_id = auth.uid()
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

CREATE POLICY "org_data_access" ON org_documents
  FOR SELECT
  USING (org_id IN (SELECT user_org_ids()));
```

### 5. Add Explicit WHERE Clauses in Application Queries

Even though RLS policies act as implicit WHERE clauses, **always add explicit filters** in your application queries. This helps PostgreSQL build better query plans.

```typescript
// ❌ SLOW: Relies only on RLS (implicit filter)
const { data } = await supabase.from('posts').select('*');

// ✅ FAST: Explicit filter helps query planner
const { data } = await supabase.from('posts').select('*').eq('user_id', userId); // Duplicate the RLS condition
```

**Why**: PostgreSQL can use the explicit filter to construct a more efficient query plan, even though the RLS policy already enforces this constraint.

### 6. Consider Denormalization for Complex Policies

For very complex multi-table RLS policies, consider denormalizing data to avoid expensive joins.

```sql
-- ❌ SLOW: Requires join through multiple tables
CREATE POLICY "team_member_access" ON documents
  FOR SELECT
  USING (
    team_id IN (
      SELECT t.id FROM teams t
      JOIN team_members tm ON t.id = tm.team_id
      WHERE tm.user_id = auth.uid()
    )
  );

-- ✅ FASTER: Denormalize by adding user_ids to documents
ALTER TABLE documents ADD COLUMN authorized_user_ids UUID[];

CREATE POLICY "team_member_access" ON documents
  FOR SELECT
  USING ((SELECT auth.uid()) = ANY(authorized_user_ids));

CREATE INDEX idx_documents_authorized_users ON documents
  USING GIN (authorized_user_ids);
```

### Performance Checklist

For every RLS policy you create:

- [ ] Index all columns referenced in the policy
- [ ] Wrap `auth.uid()` and similar functions in `SELECT`
- [ ] Use `STABLE` functions without row parameters
- [ ] Replace subqueries with `SECURITY DEFINER` functions where possible
- [ ] Add explicit WHERE clauses in application code
- [ ] Test performance with realistic data volumes (10K+ rows)
- [ ] Use `EXPLAIN ANALYZE` to verify query plans

### Measuring Performance

```sql
-- Test query performance with RLS enabled
EXPLAIN ANALYZE
SELECT * FROM posts WHERE user_id = 'some-user-id';

-- Look for:
-- - Index scans (good) vs Sequential scans (bad)
-- - Execution time < 100ms for simple queries
-- - No nested loops on large tables
```

## Common Pitfalls

### 1. Forgetting to Enable RLS

```sql
-- ❌ WRONG: Creating table without enabling RLS
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL
);

-- ✅ CORRECT: Enable RLS immediately
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL
);
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

### 2. Using USING Instead of WITH CHECK

```sql
-- ❌ WRONG: USING alone doesn't prevent invalid inserts
CREATE POLICY "users_insert" ON users
  FOR INSERT
  USING (auth.uid() = user_id);

-- ✅ CORRECT: Use WITH CHECK for INSERT
CREATE POLICY "users_insert" ON users
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### 3. Overly Permissive Policies

```sql
-- ❌ WRONG: Allows any authenticated user to read all data
CREATE POLICY "authenticated_read" ON sensitive_data
  FOR SELECT
  TO authenticated
  USING (true);

-- ✅ CORRECT: Restrict to owner
CREATE POLICY "owner_read" ON sensitive_data
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
```

### 4. Not Handling NULL auth.uid()

```sql
-- ❌ WRONG: Crashes if auth.uid() is NULL
CREATE POLICY "select_own" ON data
  FOR SELECT
  USING (auth.uid() = user_id);

-- ✅ CORRECT: Handle NULL explicitly
CREATE POLICY "select_own" ON data
  FOR SELECT
  TO authenticated  -- Restricts to authenticated users only
  USING (auth.uid() = user_id);
```

### 5. Complex Policies Without Comments

```sql
-- ❌ WRONG: No one knows what this does
CREATE POLICY "complex" ON data
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM t1 JOIN t2 ON ...));

-- ✅ CORRECT: Document complex logic
-- Users can read data if they are in the same org AND have reader role or higher
CREATE POLICY "org_reader_access" ON data
  FOR SELECT
  TO authenticated
  USING (
    org_id IN (
      SELECT om.org_id
      FROM org_members om
      WHERE om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin', 'reader')
    )
  );
```

## Tools and Automation

### RLS Scaffold Tool

Located at `scripts/db/rls-scaffold.ts`, this tool generates RLS policies based on common patterns.

```bash
# See all options
pnpm tsx scripts/db/rls-scaffold.ts --help

# See examples
pnpm tsx scripts/db/rls-scaffold.ts examples
```

### RLS Validation Script

The validation script checks that all tables have RLS enabled:

```bash
# Validate RLS on all tables
pnpm db:validate:rls
```

This runs automatically in CI/CD and will block deployments if tables are missing RLS.

### VS Code Snippets (Optional)

Add to `.vscode/postgresql.code-snippets`:

```json
{
  "RLS Enable": {
    "prefix": "rls-enable",
    "body": [
      "ALTER TABLE ${1:table_name} ENABLE ROW LEVEL SECURITY;",
      "ALTER TABLE $1 FORCE ROW LEVEL SECURITY;"
    ]
  },
  "RLS Policy Owner": {
    "prefix": "rls-owner",
    "body": [
      "CREATE POLICY \"${1:table}_${2:select}_own\" ON ${1:table}",
      "  FOR ${2|SELECT,INSERT,UPDATE,DELETE|}",
      "  TO authenticated",
      "  USING (auth.uid() = ${3:user_id});"
    ]
  }
}
```

## References

- [RLS Contracts](../../apps/web/tests/rls/contracts.md) - Security boundaries that RLS must enforce
- [RLS Scaffold Tool](../../scripts/db/rls-scaffold.ts) - Automated policy generation
- [Database Standards](./standards.md) - RLS requirements and exceptions
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

## Getting Help

If you're unsure about RLS implementation:

1. Check the [RLS patterns](#rls-patterns) above
2. Look at existing RLS policies in `supabase/migrations/`
3. Review [RLS contracts](../../apps/web/tests/rls/contracts.md)
4. Ask in #engineering channel
5. Run `/security:scan rls` to check for gaps

## Version History

- **1.0** (2025-10-28): Initial guide with patterns and examples
