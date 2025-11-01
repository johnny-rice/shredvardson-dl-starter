# RLS Performance Optimization Guide

**Last Updated:** 2025-10-31
**Related:** Issue #237, [Supabase RLS Performance Guide](https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices)

## Table of Contents

- [Quick Reference](#quick-reference)
- [The Problem](#the-problem)
- [The 6 Optimizations](#the-6-optimizations)
- [Patterns & Anti-Patterns](#patterns--anti-patterns)
- [Client-Side Optimization](#client-side-optimization)
- [Troubleshooting](#troubleshooting)
- [Templates & Examples](#templates--examples)

---

## Quick Reference

| Optimization                  | Impact      | Query Time         | Difficulty    |
| ----------------------------- | ----------- | ------------------ | ------------- |
| 1. Index on filter columns    | **99.94%**  | 171ms → <0.1ms     | ⭐ Easy       |
| 2. Function result caching    | **94.97%**  | 179ms → 9ms        | ⭐ Easy       |
| 3. Security definer functions | **99.993%** | 178,000ms → 12ms   | ⭐⭐ Moderate |
| 4. Client-side filters        | **94.74%**  | 171ms → 9ms        | ⭐ Easy       |
| 5. Minimize policy joins      | **99.78%**  | 9,000ms → 20ms     | ⭐⭐ Moderate |
| 6. Role specification         | **99.78%**  | (skips evaluation) | ⭐ Easy       |

**TL;DR:** Use the [templates](../../supabase/templates/) and you get all optimizations automatically.

---

## The Problem

Row Level Security (RLS) policies are evaluated **on every row** that matches your query. Without optimization, this can cause:

- **Sequential scans** instead of index lookups (171ms vs <0.1ms)
- **Per-row function calls** instead of per-statement caching (179ms vs 9ms)
- **Expensive joins** in policy evaluation (178 seconds vs 12ms!)
- **Unnecessary policy checks** for irrelevant roles (wasted cycles)

**Real-world impact:**

```sql
-- Without optimizations:
SELECT * FROM profiles WHERE user_id = 'abc123';
-- Query time: 171ms (10k rows)

-- With all optimizations:
SELECT * FROM profiles WHERE user_id = 'abc123';
-- Query time: <1ms (10k rows)
```

---

## The 6 Optimizations

### 1. Index Optimization 🚀

**Impact:** 99.94% improvement (171ms → <0.1ms)

**Problem:** RLS policies filter on columns like `user_id` or `team_id`. Without indexes, PostgreSQL performs sequential scans on every query.

**Solution:** Add indexes on all RLS policy filter columns.

```sql
-- ❌ BAD: No index
CREATE TABLE profiles (
    id uuid PRIMARY KEY,
    user_id uuid NOT NULL,
    name text
);

-- ✅ GOOD: Index on RLS filter column
CREATE TABLE profiles (
    id uuid PRIMARY KEY,
    user_id uuid NOT NULL,
    name text
);

CREATE INDEX idx_profiles_user_id ON profiles(user_id);
```

**Rule:** Every column used in a policy's `USING` or `WITH CHECK` clause needs an index.

---

### 2. Function Result Caching 📦

**Impact:** 94.97% improvement (179ms → 9ms)

**Problem:** Functions like `auth.uid()` are marked as `VOLATILE` by default, so PostgreSQL calls them on **every row** instead of caching the result.

**Solution:** Wrap auth functions in a `SELECT` subquery to cache per-statement.

```sql
-- ❌ BAD: Function called per-row
CREATE POLICY "Users see own data" ON profiles
    FOR SELECT
    USING (user_id = auth.uid());  -- Called on EVERY row

-- ✅ GOOD: Function cached per-statement
CREATE POLICY "Users see own data" ON profiles
    FOR SELECT
    USING (user_id = (SELECT auth.uid()));  -- Called ONCE per query
```

**Also applies to:**

- `auth.jwt()` → `(SELECT auth.jwt())`
- `auth.role()` → `(SELECT auth.role())`
- Custom functions marked as `STABLE` or `IMMUTABLE`

---

### 3. Security Definer Functions 🔒

**Impact:** 99.993% improvement (178,000ms → 12ms)

**Problem:** Policies that join to membership tables evaluate the join **on every row**, and RLS applies to both tables in the join.

**Solution:** Create `SECURITY DEFINER` functions in a private schema that bypass RLS for lookups.

```sql
-- ❌ BAD: Join in policy (extremely slow!)
CREATE POLICY "Team members see data" ON documents
    FOR SELECT
    USING (
        team_id IN (
            SELECT team_id
            FROM team_members
            WHERE user_id = auth.uid()  -- Join evaluated per-row, RLS on both tables!
        )
    );
-- Query time: 178,000ms (178 seconds!)

-- ✅ GOOD: Security definer function
CREATE FUNCTION private.user_teams()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER  -- Bypasses RLS on team_members
STABLE           -- Enables caching
AS $$
    SELECT team_id
    FROM team_members
    WHERE user_id = auth.uid();
$$;

CREATE POLICY "Team members see data" ON documents
    FOR SELECT
    USING (team_id IN (SELECT private.user_teams()));
-- Query time: 12ms
```

**Why it's safe:**

- Function only returns IDs, not sensitive data
- Still uses `auth.uid()` to filter to current user
- `private` schema not exposed via PostgREST API
- Only bypasses RLS on the **lookup table**, not the target table

---

### 4. Client-Side Filters 🎯

**Impact:** 94.74% improvement (171ms → 9ms)

**Problem:** When you rely only on RLS for filtering, the query planner can't optimize the execution plan.

**Solution:** **Always add explicit filters** in your app queries, even if RLS would enforce them anyway.

```typescript
// ❌ BAD: Relies only on RLS
const { data } = await supabase.from('profiles').select();
// Query planner can't optimize, scans all rows then filters

// ✅ GOOD: Explicit filter helps query planner
const userId = (await supabase.auth.getUser()).data.user?.id;
const { data } = await supabase.from('profiles').select().eq('user_id', userId);
// Query planner uses index, much faster
```

**Python example:**

```python
# ❌ BAD
response = supabase.table('profiles').select('*').execute()

# ✅ GOOD
user_id = supabase.auth.get_user().user.id
response = supabase.table('profiles').select('*').eq('user_id', user_id).execute()
```

---

### 5. Minimize Policy Joins ⚡

**Impact:** 99.78% improvement (9,000ms → 20ms)

**Problem:** Joining back to the source table or other large tables in policies causes massive overhead.

**Solution:** Use security definer functions (see #3) or restructure to avoid joins.

```sql
-- ❌ BAD: Join to another table in policy
CREATE POLICY "Shared access" ON documents
    FOR SELECT
    USING (
        user_id = auth.uid()
        OR id IN (
            SELECT document_id
            FROM document_shares
            WHERE shared_with = auth.uid()  -- Join evaluated per-row!
        )
    );

-- ✅ GOOD: Security definer function
CREATE FUNCTION private.user_shared_documents()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT document_id
    FROM document_shares
    WHERE shared_with = auth.uid();
$$;

CREATE POLICY "Shared access" ON documents
    FOR SELECT
    USING (
        user_id = (SELECT auth.uid())
        OR id IN (SELECT private.user_shared_documents())
    );
```

---

### 6. Role Specification 🎭

**Impact:** 99.78% improvement (when accessed by excluded roles)

**Problem:** Policies without role specification are evaluated for all roles, even when they don't apply.

**Solution:** Add `TO <role>` clause to all policies.

```sql
-- ❌ BAD: Policy evaluated for all roles
CREATE POLICY "Users see own data" ON profiles
    FOR SELECT
    USING (user_id = (SELECT auth.uid()));
-- Evaluated even for anon users (who have no auth.uid())!

-- ✅ GOOD: Only evaluated for authenticated users
CREATE POLICY "Users see own data" ON profiles
    FOR SELECT
    TO authenticated  -- Skip anon users entirely
    USING (user_id = (SELECT auth.uid()));
```

**Common roles:**

- `authenticated` - Logged-in users
- `anon` - Anonymous/public access
- `service_role` - Backend/admin access (bypasses RLS)

---

## Patterns & Anti-Patterns

### ✅ User-Scoped Tables

```sql
-- Good example: User-owned profiles
CREATE TABLE profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id),
    name text NOT NULL
);

-- Index on filter column
CREATE INDEX idx_profiles_user_id ON profiles(user_id);

-- Optimized policy
CREATE POLICY "Users see own profile" ON profiles
    FOR SELECT
    TO authenticated                      -- Optimization 6
    USING (user_id = (SELECT auth.uid()));  -- Optimization 2
```

**Client code:**

```typescript
// Optimization 4: Explicit filter
const userId = (await supabase.auth.getUser()).data.user?.id;
const { data } = await supabase.from('profiles').select().eq('user_id', userId);
```

---

### ✅ Team-Scoped Tables

```sql
-- Good example: Team documents with membership check
CREATE TABLE documents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id uuid NOT NULL REFERENCES teams(id),
    title text NOT NULL
);

-- Index on filter column
CREATE INDEX idx_documents_team_id ON documents(team_id);

-- Security definer function (optimization 3)
CREATE FUNCTION private.user_teams()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT team_id FROM team_members WHERE user_id = auth.uid();
$$;

-- Optimized policy (optimizations 2, 5, 6)
CREATE POLICY "Team members see documents" ON documents
    FOR SELECT
    TO authenticated
    USING (team_id IN (SELECT private.user_teams()));
```

**Client code:**

```typescript
// Optimization 4: Explicit filter
const { data } = await supabase.from('documents').select().eq('team_id', currentTeamId); // Pre-fetched from user_teams
```

---

### ❌ Common Mistakes

**Don't do this:**

```sql
-- ❌ No index on user_id
CREATE TABLE bad_table (
    id uuid PRIMARY KEY,
    user_id uuid NOT NULL,
    data text
);
-- Missing: CREATE INDEX idx_bad_table_user_id ON bad_table(user_id);

-- ❌ auth.uid() not wrapped in SELECT
CREATE POLICY "bad" ON bad_table
    USING (user_id = auth.uid());  -- Evaluated per-row!

-- ❌ Join in policy instead of security definer function
CREATE POLICY "very bad" ON documents
    USING (
        team_id IN (
            SELECT team_id FROM team_members WHERE user_id = auth.uid()
        )  -- Massive performance hit!
    );

-- ❌ No role specification
CREATE POLICY "wasteful" ON profiles
    FOR SELECT
    USING (user_id = (SELECT auth.uid()));
-- Add: TO authenticated

-- ❌ No client-side filter
const { data } = await supabase.from('profiles').select();
-- Add: .eq('user_id', userId)
```

---

## Client-Side Optimization

### TypeScript / JavaScript (Supabase JS)

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, anonKey);

// ✅ GOOD: Always add explicit filters
async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId) // Explicit filter (optimization 4)
    .single();

  return data;
}

// ✅ GOOD: Team-scoped with explicit filter
async function getTeamDocuments(teamId: string) {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('team_id', teamId) // Explicit filter
    .order('created_at', { ascending: false });

  return data;
}

// ❌ BAD: No explicit filter, relies only on RLS
async function getAllUserData() {
  const { data, error } = await supabase.from('profiles').select('*'); // Query planner can't optimize!

  return data;
}
```

---

### Python (Supabase Python SDK)

```python
from supabase import create_client, Client

supabase: Client = create_client(url, anon_key)

# ✅ GOOD: Explicit filter
def get_user_profile(user_id: str):
    response = (
        supabase
        .table('profiles')
        .select('*')
        .eq('user_id', user_id)  # Explicit filter
        .single()
        .execute()
    )
    return response.data

# ❌ BAD: No explicit filter
def get_all_profiles():
    response = (
        supabase
        .table('profiles')
        .select('*')
        .execute()
    )
    return response.data
```

---

## Troubleshooting

### Slow Queries Checklist

If your RLS-protected queries are slow, check:

1. **[ ] Indexes exist on filter columns**

   ```sql
   SELECT indexname FROM pg_indexes WHERE tablename = 'your_table';
   ```

2. **[ ] Auth functions wrapped in SELECT**

   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'your_table';
   -- Look for: (SELECT auth.uid()) not auth.uid()
   ```

3. **[ ] Policies specify roles**

   ```sql
   SELECT polname, polroles FROM pg_policies WHERE tablename = 'your_table';
   -- Should see: {authenticated} or {anon}, not {}
   ```

4. **[ ] No joins in policies**

   ```sql
   SELECT polqual FROM pg_policies WHERE tablename = 'your_table';
   -- Look for IN (SELECT private.func()) instead of IN (SELECT FROM other_table)
   ```

5. **[ ] Client code adds explicit filters**

   ```typescript
   // Check your queries - should have .eq() or .in() filters
   ```

---

### Performance Testing

```sql
-- Enable timing
\timing on

-- Test as authenticated user
SET LOCAL role = authenticated;
SET LOCAL request.jwt.claims.sub = 'test-user-id';

-- Run your query
EXPLAIN ANALYZE SELECT * FROM profiles WHERE user_id = 'test-user-id';

-- Look for:
-- ✅ Index Scan (good)
-- ❌ Seq Scan (bad - need index)

-- Check execution time
-- ✅ < 10ms (good)
-- ⚠️ 10-100ms (okay for complex queries)
-- ❌ > 100ms (needs optimization)
```

---

### Common Issues

#### Query still slow despite indexes

- Check if auth functions are wrapped: `(SELECT auth.uid())`
- Verify indexes exist: `\d+ table_name`
- Check for joins in policies (use security definer instead)
- Add client-side filters to queries

#### Policy not being applied

- Check role specification matches user's role
- Verify RLS is enabled: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
- Check for conflicting policies

#### Security definer function not working

- Verify function is in `private` schema
- Check `SECURITY DEFINER` and `STABLE` flags
- Grant execute permission: `GRANT EXECUTE ON FUNCTION private.func() TO authenticated;`
- Verify private schema has usage grant

---

## Templates & Examples

### Quick Start

Use the templates in [`supabase/templates/`](../../supabase/templates/) for new tables:

1. **User-scoped tables:** [`table-with-user-rls.sql`](../../supabase/templates/table-with-user-rls.sql)
2. **Team-scoped tables:** [`table-with-team-rls.sql`](../../supabase/templates/table-with-team-rls.sql)

Both templates include **all 6 optimizations** automatically.

### Example: Optimized User Profiles

```sql
-- Full example with all optimizations
BEGIN;

CREATE TABLE profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name text NOT NULL,
    avatar_url text,
    bio text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Optimization 1: Index
CREATE INDEX idx_profiles_user_id ON profiles(user_id);

-- Optimizations 2, 6: Cached function + role specification
CREATE POLICY "Users manage own profile" ON profiles
    FOR ALL
    TO authenticated
    USING (user_id = (SELECT auth.uid()))
    WITH CHECK (user_id = (SELECT auth.uid()));

COMMIT;
```

**Client code:**

```typescript
// Optimization 4: Explicit filter
const userId = (await supabase.auth.getUser()).data.user?.id;
const { data } = await supabase.from('profiles').select().eq('user_id', userId).single();
```

---

### Example: Optimized Team Documents

```sql
-- Full example with security definer function
BEGIN;

-- Infrastructure (run once)
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated;

-- Security definer function (optimization 3)
CREATE FUNCTION private.user_teams()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT team_id FROM team_members WHERE user_id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION private.user_teams() TO authenticated;

-- Documents table
CREATE TABLE documents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    title text NOT NULL,
    content text,
    created_by uuid REFERENCES auth.users(id),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Optimization 1: Index
CREATE INDEX idx_documents_team_id ON documents(team_id);

-- Optimizations 2, 3, 5, 6: All combined
CREATE POLICY "Team members manage documents" ON documents
    FOR ALL
    TO authenticated
    USING (team_id IN (SELECT private.user_teams()))  -- Security definer, no join
    WITH CHECK (team_id IN (SELECT private.user_teams()));

COMMIT;
```

**Client code:**

```typescript
// Optimization 4: Explicit filter
const userTeams = await supabase.rpc('user_teams');
const { data } = await supabase.from('documents').select().in('team_id', userTeams.data); // Explicit filter
```

---

## Summary

**To optimize RLS performance:**

1. ✅ Use [templates](../../supabase/templates/) for new tables
2. ✅ Add indexes on all RLS filter columns
3. ✅ Wrap `auth.uid()` in `(SELECT auth.uid())`
4. ✅ Use security definer functions for membership checks
5. ✅ Add `TO authenticated` or `TO anon` to policies
6. ✅ Add explicit filters in client queries

**Expected results:**

- Simple queries: **<1ms**
- Complex queries with joins: **<20ms**
- Overall improvement: **>99%** compared to unoptimized

**Resources:**

- Templates: [`supabase/templates/`](../../supabase/templates/)
- Official guide: [Supabase RLS Performance](https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices)
- Research: [RLS Performance Tests](https://github.com/GaryAustin1/RLS-Performance)
- Issue: [#237](https://github.com/your-org/your-repo/issues/237)
