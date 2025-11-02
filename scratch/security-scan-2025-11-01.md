# Security Scan Report

**Date:** 2025-11-01
**Scope:** RLS (Row Level Security)
**Severity Threshold:** High+

## Summary

- **Total:** 4 vulnerabilities
- **Critical:** 1
- **High:** 3
- **Medium:** 0
- **Low:** 0

---

## Critical Issues

### 1. Test vulnerability migration file present in production migrations

**Location:** `supabase/migrations/20251101000000_test_vulnerability.sql:1`

**Confidence:** High

**Impact:** If this migration contains intentional vulnerabilities for testing purposes, it could create security holes in production. Test vulnerabilities should never be in production migration paths. This could lead to data breaches, unauthorized access, or RLS policy bypasses depending on the file contents.

**Evidence:**
```
File: 20251101000000_test_vulnerability.sql
A migration file explicitly named 'test_vulnerability' exists in the production migrations directory.
```

**Remediation:**

1. Immediately review the contents of the test_vulnerability.sql file to understand what it does.
2. If it contains test code, remove it from the migrations directory.
3. Move test-specific migrations to a separate test migrations directory that is never run against production.
4. Add a CI/CD check to prevent files with 'test' or 'vulnerability' in their names from being merged into production migrations.
5. If this is a legitimate migration, rename it to describe its actual purpose.

```bash
# Move to test-only location
mv supabase/migrations/20251101000000_test_vulnerability.sql supabase/tests/fixtures/

# Or delete if it's not needed
rm supabase/migrations/20251101000000_test_vulnerability.sql

# Add to .github/workflows/security-check.yml:
- name: Check for test files in migrations
  run: |
    if ls supabase/migrations/*test*.sql 2>/dev/null; then
      echo "Test files found in production migrations!"
      exit 1
    fi
```

**References:**
- https://supabase.com/docs/guides/platform/going-into-prod
- https://owasp.org/www-project-top-ten/2017/A6_2017-Security_Misconfiguration
- https://cheatsheetseries.owasp.org/cheatsheets/Database_Security_Cheat_Sheet.html

---

## High Issues

### 2. No database schema file found for RLS policy verification

**Location:** `packages/db/:0`

**Confidence:** High

**Impact:** Without a centralized schema, developers may create tables without proper RLS policies. There's no automated way to ensure every table has RLS enabled and appropriate policies. This increases the risk of data exposure through missing or incomplete RLS policies.

**Evidence:**
```
Missing: packages/db/schema.ts or similar schema definition file
No central schema definition file was found in the database package.
```

**Remediation:**

1. Create a central schema file (e.g., packages/db/src/schema.ts) that defines all database tables.
2. Use Drizzle ORM or similar to define tables with TypeScript.
3. Add automated tests that verify RLS is enabled on all tables defined in the schema.
4. Integrate schema validation into CI/CD to prevent deployments without proper RLS coverage.

```typescript
// packages/db/src/schema.ts
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  userId: uuid('user_id').notNull(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Add RLS validation test
import { sql } from 'drizzle-orm';

const tables = [profiles, /* other tables */];
for (const table of tables) {
  const hasRLS = await db.execute(sql`
    SELECT relrowsecurity FROM pg_class
    WHERE relname = ${table.name}
  `);
  if (!hasRLS.rows[0]?.relrowsecurity) {
    throw new Error(`Table ${table.name} missing RLS!`);
  }
}
```

**References:**
- https://orm.drizzle.team/docs/sql-schema-declaration
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://www.postgresql.org/docs/current/ddl-rowsecurity.html

---

### 3. RLS templates lack DELETE policy guidance

**Location:** `supabase/templates/table-with-user-rls.sql:0`

**Confidence:** Medium

**Impact:** If templates are missing DELETE policies, developers copying these templates will create tables where users might be able to delete records they shouldn't have access to, or conversely, be unable to delete their own data. This breaks either security or functionality.

**Evidence:**
```
Template files exist (table-with-user-rls.sql, table-with-team-rls.sql) but may not include comprehensive DELETE policies
```

**Remediation:**

1. Review all template files to ensure they include SELECT, INSERT, UPDATE, and DELETE policies.
2. Add comments explaining when each policy type is needed.
3. Include examples for common patterns (user-owned data, team-shared data, public read-only).
4. Add validation tests that check template completeness.

```sql
-- template-with-user-rls.sql should include all four policies:

-- SELECT: Users can only see their own records
CREATE POLICY "users_select_own" ON your_table
  FOR SELECT USING (auth.uid() = user_id);

-- INSERT: Users can only create records for themselves
CREATE POLICY "users_insert_own" ON your_table
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can only update their own records
CREATE POLICY "users_update_own" ON your_table
  FOR UPDATE USING (auth.uid() = user_id);

-- DELETE: Users can only delete their own records
CREATE POLICY "users_delete_own" ON your_table
  FOR DELETE USING (auth.uid() = user_id);
```

**References:**
- https://supabase.com/docs/guides/database/postgres/row-level-security#policy-command
- https://www.postgresql.org/docs/current/sql-createpolicy.html
- https://owasp.org/www-project-top-ten/2017/A5_2017-Broken_Access_Control

---

### 4. No automated RLS policy completeness validation

**Location:** `supabase/tests/:0`

**Confidence:** High

**Impact:** Tables may have RLS enabled but missing critical policies (commonly DELETE or UPDATE), allowing unauthorized data modification or deletion. This creates a false sense of security where developers believe data is protected but gaps exist.

**Evidence:**
```
Test files exist (001-rls-enabled.sql, 002-user-isolation.sql, 003-rls-optimization.sql) but may not comprehensively check for missing policies
```

**Remediation:**

1. Create a comprehensive RLS validation test that queries pg_policies to ensure every table with RLS has all necessary policies.
2. Define which tables need which policy types in a configuration file.
3. Run this test in CI/CD to prevent merging incomplete RLS implementations.
4. Add to the pgTAP test suite for database-level validation.

```sql
-- supabase/tests/004-rls-completeness.sql
BEGIN;
SELECT plan(1);

-- Check that all tables with RLS have complete policy coverage
SELECT is_empty(
  $$
    SELECT t.tablename
    FROM pg_tables t
    JOIN pg_class c ON c.relname = t.tablename
    WHERE t.schemaname = 'public'
      AND c.relrowsecurity = true  -- RLS is enabled
      AND NOT EXISTS (
        -- Check for all 4 policy types
        SELECT 1 FROM pg_policies p
        WHERE p.tablename = t.tablename
        GROUP BY p.tablename
        HAVING array_agg(DISTINCT p.cmd) @> ARRAY['SELECT', 'INSERT', 'UPDATE', 'DELETE']::text[]
      )
  $$,
  'All tables with RLS should have SELECT, INSERT, UPDATE, and DELETE policies'
);

SELECT * FROM finish();
ROLLBACK;
```

**References:**
- https://pgtap.org/documentation.html
- https://www.postgresql.org/docs/current/catalog-pg-policies.html
- https://supabase.com/docs/guides/database/testing

---

## Recommendations

1. Immediately investigate and remove the test_vulnerability.sql migration file from production migrations directory
2. Implement centralized schema management with TypeScript/Drizzle ORM to enable automated RLS validation
3. Create comprehensive RLS policy templates that include all CRUD operations with clear documentation
4. Add automated CI/CD checks to validate RLS completeness on all tables before deployment
5. Establish a policy that all new tables must use approved RLS templates and pass automated validation
6. Consider implementing a pre-commit hook that scans for missing RLS policies in migration files
7. Document RLS patterns and requirements in a security guideline document for all developers

**Confidence:** High