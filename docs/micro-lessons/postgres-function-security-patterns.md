# PostgreSQL Function Security Patterns

**Problem**: `SECURITY DEFINER` functions with broad grants can allow privilege escalation, letting any authenticated user execute code with elevated privileges.

**Solution**: Use `SECURITY INVOKER` with explicit role checks, or restrict grants to service roles only.

## Vulnerable Pattern (NEVER DO THIS)

```sql
CREATE FUNCTION dangerous_query(sql text) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER  -- Runs with owner privileges!
AS $$
BEGIN
  -- Weak environment check - unreliable
  IF current_setting('app.environment', true) = 'production' THEN
    RAISE EXCEPTION 'Disabled in production';
  END IF;
  
  EXECUTE sql; -- Any authenticated user can execute arbitrary SQL!
END;
$$;

-- DANGEROUS: Any authenticated user gets elevated privileges
GRANT EXECUTE ON FUNCTION dangerous_query(text) TO authenticated;
```

## Secure Patterns

### Option 1: Service Role Only + SECURITY INVOKER

```sql
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
END;
$$;

-- Safe: Only service role can execute
GRANT EXECUTE ON FUNCTION secure_query(text) TO service_role;
```

### Option 2: SECURITY DEFINER with Role Guard

```sql
CREATE FUNCTION admin_query(sql text) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER  -- Elevated privileges, but guarded
AS $$
BEGIN
  -- Must check role first!
  IF auth.role() != 'service_role' THEN
    RAISE EXCEPTION 'Service role required';
  END IF;
  
  -- Now safe to use elevated privileges
  EXECUTE sql;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_query(text) TO service_role;
```

## Supabase Auth Roles

- **`anon`**: Anonymous users (no authentication)
- **`authenticated`**: Logged-in users 
- **`service_role`**: Backend/admin operations (bypasses RLS)

## Why SECURITY DEFINER is Dangerous

```sql
-- Function runs as OWNER, not caller
SECURITY DEFINER 

-- If owner is superuser/admin:
-- - Bypasses all RLS policies
-- - Can access any table
-- - Can modify system settings
-- - Full database privileges
```

## Context

Found in `supabase/migrations/20250926T120000_add_query_rpc_function.sql` when fixing critical security vulnerability. Any function that executes arbitrary SQL must be heavily restricted.

## Testing Role Restrictions

```javascript
// This should fail with anon/authenticated keys
const { data, error } = await client.rpc('secure_query', { sql: 'SELECT 1' });
// error: "Restricted to service role only"

// Only works with service role key
const serviceClient = createClient(url, serviceKey);
const { data } = await serviceClient.rpc('secure_query', { sql: 'SELECT 1' });
```

## Related Security Patterns

- Never trust environment variables for security decisions
- Always use explicit role checks with `auth.role()`
- Prefer `SECURITY INVOKER` unless elevation is required
- Grant execute permissions as narrowly as possible