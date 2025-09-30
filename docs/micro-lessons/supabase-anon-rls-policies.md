# Supabase Anonymous RLS Policies

**Problem**: Copying authenticated RLS policies for anonymous users by reusing `auth.uid()` conditions always fails because `auth.uid()` returns `NULL` for anonymous requests.

**Solution**: Use `auth.role() = 'anon'` for anonymous policies instead of copying `auth.uid()` conditions.

## Wrong Pattern

```typescript
// This NEVER works for anonymous users
policies.push(
  ...authenticatedPolicies.map((p) => ({
    ...p,
    role: 'anon',
    condition: p.condition, // Still contains auth.uid() = user_id
  }))
);

// Generated SQL (BROKEN):
// CREATE POLICY "users_select_own_anon" ON public.users
//   FOR SELECT TO anon
//   USING (auth.uid() = user_id); -- auth.uid() is NULL for anon!
```

## Correct Pattern

```typescript
// Use role-based conditions for anonymous access
if (allowAnon) {
  policies.push(
    ...authenticatedPolicies.map((p) => ({
      ...p,
      role: 'anon' as const,
      name: `${p.name}_anon`,
      condition: `auth.role() = 'anon'`, // Works for anonymous users
      description: `${p.description} (anonymous users - role-based access)`,
    }))
  );
}

// Generated SQL (WORKS):
// CREATE POLICY "users_select_own_anon" ON public.users
//   FOR SELECT TO anon
//   USING (auth.role() = 'anon'); -- Always true for anon requests
```

## Supabase Auth Functions

- **`auth.uid()`**: Returns user UUID for authenticated users, `NULL` for anonymous
- **`auth.role()`**: Returns `'authenticated'`, `'anon'`, or `'service_role'`
- **`auth.email()`**: Returns email for authenticated users, `NULL` for anonymous

## Alternative Patterns

```sql
-- Option 1: Pure role-based access
USING (auth.role() = 'anon')

-- Option 2: Combine with data conditions
USING (auth.role() = 'anon' AND published = true)

-- Option 3: Allow both authenticated and anon
USING (auth.role() IN ('authenticated', 'anon'))

-- Option 4: Time-based anonymous access
USING (auth.role() = 'anon' AND created_at > NOW() - INTERVAL '24 hours')
```

## Context

Found in `scripts/db/rls-scaffold.ts:112-127` when fixing CodeRabbit feedback about broken anonymous policies. Critical for any application supporting anonymous access.

## Testing Anonymous Policies

```javascript
// Test anonymous access works
const anonClient = createClient(url, anonKey); // No auth
const { data, error } = await anonClient.from('table').select('*');

// Should succeed if auth.role() = 'anon' policy exists
```
