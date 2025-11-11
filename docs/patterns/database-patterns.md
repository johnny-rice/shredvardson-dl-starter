# Database & Supabase Patterns

**Category:** Database Security & Operations
**Impact:** Critical - Prevents security vulnerabilities, ensures data integrity
**Lessons Synthesized:** 6 micro-lessons

## Overview

This guide consolidates battle-tested patterns for Supabase and PostgreSQL development, with a strong emphasis on Row Level Security (RLS), secure functions, and proper testing. These patterns prevent critical security vulnerabilities, ensure correct policy implementation, and establish reliable database operations.

## Core Principles

1. **Security First:** RLS policies are not optional
2. **Test with Real Sessions:** Custom headers don't work with RLS
3. **Explicit Role Specifications:** Never rely on implicit permissions
4. **Proper SQL Syntax:** Operation-specific clauses for policies
5. **Defense in Depth:** Multiple layers of security checks
6. **Principle of Least Privilege:** Minimal necessary permissions

---

## Pattern 1: RLS Testing with Real JWT Sessions

**Problem:** Custom headers for testing RLS are ignored by Supabase, causing tests to pass when they should fail.

**Impact:** Critical (10/10) - Silent security failures

**Source Lessons:**
- `supabase-rls-testing-jwt-sessions.md`

### ✅ Correct Pattern

```typescript
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Admin client for generating test sessions
function createAdminClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

// Create test user client with real JWT
export async function createTestUserClient(
  userId: string,
  email: string
): Promise<SupabaseClient> {
  const adminClient = createAdminClient();

  // Generate real JWT for test user
  const { data, error } = await adminClient.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: {
      data: { user_id: userId },
    },
  });

  if (error) throw error;

  // Create client and set session
  const testClient = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,  // Don't leak sessions between tests
      },
    }
  );

  // Set the JWT session
  if (data.properties?.access_token) {
    const { error: sessionError } = await testClient.auth.setSession({
      access_token: data.properties.access_token,
      refresh_token: data.properties.refresh_token || '',
    });

    if (sessionError) throw sessionError;
  }

  return testClient;
}

// Test RLS policies
describe('RLS Policies', () => {
  let userClient: SupabaseClient;
  const userId = 'test-user-123';

  beforeEach(async () => {
    userClient = await createTestUserClient(userId, 'test@example.com');
  });

  it('allows users to read their own data', async () => {
    const { data, error } = await userClient
      .from('users')
      .select('*')
      .eq('id', userId);

    expect(error).toBeNull();
    expect(data).toHaveLength(1);
  });

  it('prevents users from reading other users data', async () => {
    const { data, error } = await userClient
      .from('users')
      .select('*')
      .eq('id', 'other-user-456');

    expect(error).toBeNull();
    expect(data).toHaveLength(0);  // RLS filters it out
  });

  it('prevents users from updating other users data', async () => {
    const { error } = await userClient
      .from('users')
      .update({ name: 'Hacked' })
      .eq('id', 'other-user-456');

    expect(error).not.toBeNull();
    expect(error?.code).toBe('PGRST116');  // Policy violation
  });
});
```

### ❌ Anti-Pattern

```typescript
// ❌ WRONG: Custom headers don't work with RLS
export function createTestUser(userId: string) {
  return createClient(url, anonKey, {
    global: {
      headers: { 'X-Test-User-Id': userId },  // Ignored by RLS!
    },
  });
}

// Tests will pass even if RLS is broken
const client = createTestUser('user-123');
const { data } = await client.from('users').select('*');
// Returns ALL users, not just user-123's data!
```

### Key Points

- **Use `auth.admin.generateLink()`** to create real JWT tokens
- **Call `setSession()`** with the generated access token
- **Set `persistSession: false`** to avoid session leakage between tests
- **Verify RLS by checking results,** not just request success
- **Test both positive and negative cases:** allowed and denied access
- **Custom headers are ignored** by `auth.uid()` in RLS policies

### Test Structure

```typescript
// Good test structure
describe('RLS Tests', () => {
  // Positive tests - should succeed
  it('allows authorized operations', async () => {
    const { data, error } = await authorizedClient.from('table').select();
    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  // Negative tests - should fail
  it('denies unauthorized operations', async () => {
    const { data, error } = await unauthorizedClient.from('table').select();
    expect(error).not.toBeNull();  // Or data.length === 0 for SELECT
  });
});
```

---

## Pattern 2: RLS Policy SQL Syntax

**Problem:** Incorrect SQL clauses for different operations cause policy creation failures.

**Impact:** High (9/10) - Broken policies, no database access

**Source Lessons:**
- `rls-policy-sql-syntax.md`

### ✅ Correct Pattern

```typescript
type Operation = 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL';

interface RLSPolicy {
  name: string;
  table: string;
  operation: Operation;
  role: 'authenticated' | 'anon' | 'service_role';
  condition: string;
  description?: string;
}

function generatePolicySQL(policy: RLSPolicy): string {
  // Operation-specific clause logic
  const usingClause = policy.operation === 'INSERT'
    ? ''  // INSERT doesn't use USING
    : `\n  USING (${policy.condition})`;

  const withCheckClause = policy.operation === 'INSERT' || policy.operation === 'UPDATE'
    ? `\n  WITH CHECK (${policy.condition})`  // INSERT and UPDATE need WITH CHECK
    : '';  // SELECT and DELETE don't use WITH CHECK

  return `CREATE POLICY "${policy.name}" ON public.${policy.table}
  FOR ${policy.operation}
  TO ${policy.role}${usingClause}${withCheckClause};`;
}

// Example policies
const policies: RLSPolicy[] = [
  {
    name: 'users_select_own',
    table: 'users',
    operation: 'SELECT',
    role: 'authenticated',
    condition: 'auth.uid() = user_id',
  },
  {
    name: 'users_insert_own',
    table: 'users',
    operation: 'INSERT',
    role: 'authenticated',
    condition: 'auth.uid() = user_id',
  },
  {
    name: 'users_update_own',
    table: 'users',
    operation: 'UPDATE',
    role: 'authenticated',
    condition: 'auth.uid() = user_id',
  },
  {
    name: 'users_delete_own',
    table: 'users',
    operation: 'DELETE',
    role: 'authenticated',
    condition: 'auth.uid() = user_id',
  },
];
```

### Generated SQL

```sql
-- SELECT policy (USING only)
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- INSERT policy (WITH CHECK only)
CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE policy (USING + WITH CHECK)
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE policy (USING only)
CREATE POLICY "users_delete_own" ON public.users
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
```

### ❌ Anti-Pattern

```sql
-- ❌ WRONG: INSERT with USING clause
CREATE POLICY "users_insert" ON public.users
  FOR INSERT
  TO authenticated
  USING (auth.uid() = user_id);  -- Not applicable for INSERT!

-- ❌ WRONG: SELECT with WITH CHECK
CREATE POLICY "users_select" ON public.users
  FOR SELECT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);  -- Not applicable for SELECT!
```

### Key Points

- **SELECT/DELETE:** Use `USING` clause only
- **INSERT:** Use `WITH CHECK` clause only
- **UPDATE:** Use both `USING` and `WITH CHECK` clauses
- **USING determines which rows can be selected/updated/deleted**
- **WITH CHECK validates new values being inserted/updated**
- **Wrong clauses cause PostgreSQL errors**

### Operation-Specific Rules Table

| Operation | USING Clause | WITH CHECK Clause | Purpose |
|-----------|-------------|-------------------|---------|
| SELECT | ✅ Required | ❌ Not used | Filter visible rows |
| INSERT | ❌ Not used | ✅ Required | Validate new rows |
| UPDATE | ✅ Required | ✅ Required | Filter + validate |
| DELETE | ✅ Required | ❌ Not used | Filter deletable rows |
| ALL | ✅ Required | ✅ Optional | Applies to all ops |

---

## Pattern 3: Anonymous User RLS Policies

**Problem:** Copying authenticated policies for anonymous users fails because `auth.uid()` is NULL for anonymous requests.

**Impact:** High (8/10) - Broken anonymous access

**Source Lessons:**
- `supabase-anon-rls-policies.md`

### ✅ Correct Pattern

```typescript
// Correct: Role-based conditions for anonymous access
function generateAnonymousPolicies(
  authenticatedPolicies: RLSPolicy[]
): RLSPolicy[] {
  return authenticatedPolicies.map((policy) => ({
    ...policy,
    name: `${policy.name}_anon`,
    role: 'anon' as const,
    // Use role check instead of auth.uid()
    condition: `auth.role() = 'anon'`,
    description: `${policy.description || ''} (anonymous users - role-based access)`,
  }));
}

// Generated SQL (WORKS)
// CREATE POLICY "posts_select_public_anon" ON public.posts
//   FOR SELECT TO anon
//   USING (auth.role() = 'anon' AND published = true);
```

### Alternative Patterns

```sql
-- Option 1: Pure role-based access
CREATE POLICY "anon_read_public" ON public.posts
  FOR SELECT TO anon
  USING (auth.role() = 'anon');

-- Option 2: Combine with data conditions
CREATE POLICY "anon_read_published" ON public.posts
  FOR SELECT TO anon
  USING (auth.role() = 'anon' AND published = true);

-- Option 3: Allow both authenticated and anonymous
CREATE POLICY "public_read_all" ON public.posts
  FOR SELECT TO authenticated, anon
  USING (auth.role() IN ('authenticated', 'anon') AND published = true);

-- Option 4: Time-based anonymous access
CREATE POLICY "anon_read_recent" ON public.posts
  FOR SELECT TO anon
  USING (
    auth.role() = 'anon'
    AND created_at > NOW() - INTERVAL '24 hours'
  );
```

### ❌ Anti-Pattern

```typescript
// ❌ WRONG: Copying auth.uid() conditions for anonymous users
policies.push(
  ...authenticatedPolicies.map((p) => ({
    ...p,
    role: 'anon',
    condition: p.condition,  // Still contains auth.uid() = user_id
  }))
);

// Generated SQL (BROKEN):
// CREATE POLICY "users_select_own_anon" ON public.users
//   FOR SELECT TO anon
//   USING (auth.uid() = user_id);  -- auth.uid() is NULL for anon!
```

### Key Points

- **`auth.uid()` returns NULL for anonymous users**
- **Use `auth.role() = 'anon'`** for anonymous policies
- **Combine with data conditions** (published, public, etc.)
- **Test with anonymous client** (no auth token)
- **Don't just copy authenticated policies** - they use different logic

### Supabase Auth Functions

| Function | Authenticated | Anonymous | Service Role |
|----------|--------------|-----------|--------------|
| `auth.uid()` | User UUID | NULL | NULL |
| `auth.role()` | 'authenticated' | 'anon' | 'service_role' |
| `auth.email()` | User email | NULL | NULL |

---

## Pattern 4: Postgres Function Security

**Problem:** `SECURITY DEFINER` functions with broad grants allow privilege escalation.

**Impact:** Critical (10/10) - Security vulnerability

**Source Lessons:**
- `postgres-function-security-patterns.md`

### ✅ Correct Pattern

```sql
-- Option 1: SECURITY INVOKER with explicit role check
CREATE FUNCTION secure_query(sql text) RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER  -- Runs with caller's privileges
AS $$
BEGIN
  -- Explicit role check - reliable
  IF auth.role() != 'service_role' THEN
    RAISE EXCEPTION 'Restricted to service role only. Current: %', auth.role();
  END IF;

  EXECUTE sql;
  RETURN jsonb_build_object('success', true);
END;
$$;

-- Safe: Only service role can execute
GRANT EXECUTE ON FUNCTION secure_query(text) TO service_role;

-- Option 2: SECURITY DEFINER with role guard
CREATE FUNCTION admin_operation() RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER  -- Elevated privileges, but guarded
AS $$
BEGIN
  -- Must check role first!
  IF auth.role() != 'service_role' THEN
    RAISE EXCEPTION 'Service role required';
  END IF;

  -- Now safe to use elevated privileges
  -- ... privileged operations ...
END;
$$;

GRANT EXECUTE ON FUNCTION admin_operation() TO service_role;

-- Option 3: STABLE function for query planner optimization
CREATE FUNCTION get_user_posts(user_id uuid) RETURNS SETOF posts
LANGUAGE sql
STABLE  -- Doesn't modify database, can be optimized
SECURITY INVOKER
AS $$
  SELECT * FROM posts WHERE author_id = user_id;
$$;
```

### ❌ Anti-Pattern (DANGEROUS)

```sql
-- ❌ NEVER DO THIS: Any authenticated user gets elevated privileges
CREATE FUNCTION dangerous_query(sql text) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER  -- Runs with owner privileges!
AS $$
BEGIN
  -- Weak environment check - unreliable
  IF current_setting('app.environment', true) = 'production' THEN
    RAISE EXCEPTION 'Disabled in production';
  END IF;

  EXECUTE sql;  -- Any authenticated user can execute arbitrary SQL!
END;
$$;

-- DANGEROUS: Any authenticated user gets elevated privileges
GRANT EXECUTE ON FUNCTION dangerous_query(text) TO authenticated;
```

### Key Points

- **Prefer `SECURITY INVOKER`** unless elevation is required
- **Always check role explicitly** with `auth.role()`
- **Never trust environment variables** for security decisions
- **Grant execute permissions narrowly** (service_role only)
- **Use `STABLE` for read-only functions** (query planner optimization)
- **Test with different roles** to verify restrictions

### Function Volatility Categories

| Category | Purpose | When to Use |
|----------|---------|-------------|
| `VOLATILE` | Can modify database | INSERT, UPDATE, DELETE operations |
| `STABLE` | Reads database, no modifications | SELECT queries, calculations |
| `IMMUTABLE` | Pure function, no database access | Math operations, string manipulation |

---

## Pattern 5: PostgREST Health Checks

**Problem:** Using PostgreSQL `SELECT 1` syntax fails in PostgREST.

**Impact:** Medium (6/10) - Monitoring failures

**Source Lessons:**
- `postgrest-health-check-syntax.md`

### ✅ Correct Pattern

```typescript
// PostgREST-compatible health check
async function healthCheck(): Promise<{ healthy: boolean; error?: string }> {
  try {
    const { error } = await client
      .from('_health_check')
      .select('id', { head: true, count: 'exact' })
      .limit(1);

    return { healthy: !error };
  } catch (err) {
    return {
      healthy: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

// Alternative: Check existing table
async function quickHealthCheck(): Promise<boolean> {
  try {
    const { error } = await client
      .from('users')
      .select('id', { head: true })
      .limit(1);

    return !error;
  } catch {
    return false;
  }
}
```

### ❌ Anti-Pattern

```typescript
// ❌ WRONG: PostgreSQL syntax doesn't work in PostgREST
const { error } = await client
  .from('users')
  .select('1')  // PostgREST doesn't support arbitrary expressions
  .limit(1);
```

### Key Points

- **Valid table reference required** - PostgREST needs actual tables
- **Use `head: true`** for minimal network overhead
- **`count: 'exact'`** enables query without requiring data
- **Create dedicated health check table** for monitoring
- **Test against actual PostgREST endpoints**

---

## Pattern 6: Extension Installation & Schema Management

**Problem:** Inconsistent schema directives, unclear why some extensions can't be relocated.

**Impact:** Low (4/10) - Organizational clarity

**Source Lessons:**
- `20251031-144200-pgtap-pg-tle-schema-clarification.md`

### ✅ Correct Pattern

```sql
-- Create extensions schema for organization
CREATE SCHEMA IF NOT EXISTS extensions;

-- Standard relocatable extensions
CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- System extensions that must live in pg_catalog
-- Note: pg_tle is installed in pg_catalog schema by default and cannot be relocated
CREATE EXTENSION IF NOT EXISTS pg_tle;

-- Note: plpgsql is typically pre-installed in pg_catalog
CREATE EXTENSION IF NOT EXISTS plpgsql;
```

### Key Points

- **Relocatable extensions** can use custom schemas
- **System extensions** (pg_tle, plpgsql) must stay in pg_catalog
- **Group custom extensions** in dedicated schema for organization
- **Document why** when not specifying schema
- **Separation of concerns:** Test utilities in extensions schema

### Common Extension Patterns

| Extension | Schema | Relocatable | Purpose |
|-----------|--------|-------------|---------|
| `pgtap` | `extensions` | ✅ Yes | Testing framework |
| `http` | `extensions` | ✅ Yes | HTTP client |
| `pg_cron` | `extensions` | ✅ Yes | Job scheduler |
| `pg_tle` | `pg_catalog` | ❌ No | Trusted language extensions |
| `plpgsql` | `pg_catalog` | ❌ No | PL/pgSQL language |
| `pg_stat_statements` | `pg_catalog` | ❌ No | Query statistics |

---

## Checklist for Database Security

Before deploying database changes, verify:

- [ ] All tables have RLS enabled (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`)
- [ ] Policies use operation-specific clauses (USING vs WITH CHECK)
- [ ] Anonymous policies use `auth.role()` not `auth.uid()`
- [ ] Functions with `SECURITY DEFINER` have explicit role checks
- [ ] Tests use real JWT sessions via `generateLink()` + `setSession()`
- [ ] Both positive and negative test cases exist
- [ ] Service role functions are not granted to authenticated/anon
- [ ] Health checks use PostgREST-compatible syntax
- [ ] Extensions organized in appropriate schemas
- [ ] Migrations are idempotent (use `IF NOT EXISTS`)
- [ ] Type generation works after schema changes

---

## Quick Reference

### RLS Policy Template

```sql
-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Authenticated user policies
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Anonymous user policies
CREATE POLICY "users_select_public_anon" ON public.users
  FOR SELECT TO anon
  USING (auth.role() = 'anon' AND is_public = true);
```

### Test Client Setup

```typescript
// Create test user with real JWT
const testClient = await createTestUserClient('user-id', 'test@example.com');

// Test authorized access
const { data } = await testClient.from('table').select();
expect(data).toBeDefined();

// Test unauthorized access
const { data: denied } = await testClient
  .from('table')
  .select()
  .eq('user_id', 'other-user');
expect(denied).toHaveLength(0);
```

### Secure Function Template

```sql
CREATE FUNCTION secure_operation() RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  IF auth.role() != 'service_role' THEN
    RAISE EXCEPTION 'Service role required';
  END IF;

  -- Privileged operation
END;
$$;

GRANT EXECUTE ON FUNCTION secure_operation() TO service_role;
```

---

## References

- **Supabase RLS:** https://supabase.com/docs/guides/auth/row-level-security
- **PostgreSQL Policies:** https://www.postgresql.org/docs/current/sql-createpolicy.html
- **PostgreSQL Functions:** https://www.postgresql.org/docs/current/sql-createfunction.html
- **PostgREST API:** https://postgrest.org/

---

## Related Patterns

- [Security Patterns](./security-patterns.md) - Input validation and sanitization
- [Testing Patterns](./testing-patterns.md) - Test isolation and CI integration
- [TypeScript Patterns](./typescript-patterns.md) - Type safety at boundaries

---

**Last Updated:** 2025-11-11
**Lessons Referenced:** 6 micro-lessons from Database/Supabase category
