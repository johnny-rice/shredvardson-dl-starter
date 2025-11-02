# Security Scan Report

**Date:** 2025-11-02
**Scope:** RLS (Row-Level Security)
**Severity Threshold:** High (Critical + High)
**Overall Confidence:** Medium

## Summary

Filtered by severity threshold (High+):

- **Total:** 3 vulnerabilities
- **Critical:** 0
- **High:** 3
- **Medium:** 0 (filtered out)
- **Low:** 0

## High Issues

### 1. Limited migration files suggest incomplete RLS implementation

**Location:** [supabase/migrations/](supabase/migrations/)
**Confidence:** Medium

**Impact:** If tables exist without proper migrations tracking them, RLS policies may not be consistently applied. This creates a risk of data exposure where some tables lack proper row-level security controls. Untracked schema changes can lead to policy drift between environments.

**Evidence:**

```
supabase/migrations/20250926120000_add_query_rpc_function.sql
supabase/migrations/20251031000000_optimize_rls_performance.sql
```

Only 2 migration files found in migrations directory

**Remediation:**

Ensure all database schema changes (table creations, alterations, RLS enablement, and policy definitions) are tracked through migration files. Each table should have: (1) A migration creating the table, (2) A migration enabling RLS on the table, (3) Migrations defining all necessary policies (SELECT, INSERT, UPDATE, DELETE). Review existing tables in the database and create migrations for any that aren't tracked.

```sql
-- Example: Create a baseline migration for existing tables
-- supabase/migrations/20250101000000_baseline_schema.sql

-- For each table, ensure RLS is enabled and policies exist:
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_select ON users FOR SELECT
  USING (auth.uid() = id OR is_public = true);

CREATE POLICY users_insert ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY users_update ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY users_delete ON users FOR DELETE
  USING (auth.uid() = id);
```

**References:**

- <https://supabase.com/docs/guides/database/postgres/row-level-security>
- <https://supabase.com/docs/guides/cli/managing-environments>
- <https://www.postgresql.org/docs/current/ddl-rowsecurity.html>

### 2. No database schema type generation detected

**Location:** [/](/)
**Confidence:** High

**Impact:** Without type-safe database access, developers may construct queries that inadvertently bypass RLS policies or access unauthorized data. Runtime type mismatches can lead to SQL injection vectors or broken policy logic. Lack of compile-time type checking increases the risk of security vulnerabilities in database access code.

**Evidence:**

```
Searched for: **/database.types.ts, **/supabase.types.ts - No files found
```

Type generation from Supabase schema is not configured or types are not being generated.

**Remediation:**

Configure Supabase CLI to generate TypeScript types from your database schema. Add type generation to your development workflow and CI/CD pipeline. Use the generated types in all database queries to ensure type safety and catch security issues at compile time.

```bash
# Generate types from Supabase schema
supabase gen types typescript --local > packages/db/src/database.types.ts

# Or for remote project:
supabase gen types typescript --project-id <your-project-id> > packages/db/src/database.types.ts

# Add to package.json scripts:
"scripts": {
  "db:types": "supabase gen types typescript --local > packages/db/src/database.types.ts",
  "db:migrate": "supabase db push && npm run db:types"
}

# Use generated types in code:
import type { Database } from '@/db/database.types';
type User = Database['public']['Tables']['users']['Row'];
```

**References:**

- <https://supabase.com/docs/guides/api/rest/generating-types>
- <https://supabase.com/docs/reference/cli/supabase-gen-types-typescript>
- <https://supabase.com/docs/guides/database/typescript-support>

### 3. RLS optimization migration without baseline RLS implementation

**Location:** [supabase/migrations/20251031000000_optimize_rls_performance.sql](supabase/migrations/20251031000000_optimize_rls_performance.sql)
**Confidence:** High

**Impact:** Performance optimization without proper security implementation is a critical red flag. This suggests that either: (1) RLS policies were created outside of migrations (configuration drift risk), (2) RLS is being optimized before being properly implemented (premature optimization over security), or (3) Tables exist without proper RLS coverage. Any of these scenarios creates significant data exposure risk.

**Evidence:**

```
Migration timeline:
1. 20250926120000_add_query_rpc_function.sql
2. 20251031000000_optimize_rls_performance.sql

No intermediate migrations creating tables or RLS policies detected.
```

The second migration optimizes RLS performance, but there's no migration between it and the first that creates tables or establishes RLS policies.

**Remediation:**

Review the database to identify all tables and their RLS configuration. Create migrations that properly document: (1) All table creations, (2) RLS enablement for each table, (3) Complete policy sets for each table, (4) Then and only then, performance optimizations. Ensure security is established before optimization is applied. Use `supabase db diff` to capture any existing schema that isn't tracked in migrations.

```bash
# Capture existing schema changes that aren't in migrations:
supabase db diff --schema public > supabase/migrations/20250101000000_baseline_schema.sql

# Review the generated migration to ensure:
# 1. All tables have RLS enabled
# 2. All tables have comprehensive policies
# 3. Policies follow principle of least privilege

# Example comprehensive RLS setup:
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Read: Users can see their own profile and public profiles
CREATE POLICY profiles_select ON profiles FOR SELECT
  USING (
    auth.uid() = user_id
    OR is_public = true
  );

-- Create: Users can only create their own profile
CREATE POLICY profiles_insert ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Update: Users can only update their own profile
CREATE POLICY profiles_update ON profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Delete: Users can only delete their own profile
CREATE POLICY profiles_delete ON profiles FOR DELETE
  USING (auth.uid() = user_id);
```

**References:**

- <https://supabase.com/docs/guides/cli/local-development#database-migrations>
- <https://supabase.com/docs/reference/cli/supabase-db-diff>
- <https://supabase.com/docs/guides/platform/going-into-prod#row-level-security>

## Recommendations

- Conduct a comprehensive audit of all database tables to verify RLS is enabled and policies are complete
- Establish a migration-first workflow where all schema changes, including RLS policies, are tracked through version-controlled migrations
- Generate and maintain TypeScript types from your database schema to ensure type-safe database access
- Create automated tests (building on existing 001-rls-enabled.sql) to verify RLS coverage across all tables
- Document the expected RLS pattern for each type of table (user-scoped, team-scoped, public) and ensure consistency
- Before optimizing RLS performance, ensure comprehensive security coverage exists - security first, optimization second
- Use `supabase db diff` to capture any schema drift and ensure all tables are properly tracked in migrations

---

**Note:** 1 MEDIUM severity finding was filtered out based on the "high" threshold. Run `/security:scan rls medium` to see all findings.
