# PostgREST Health Check Syntax

**Problem**: Using PostgreSQL `SELECT 1` syntax in PostgREST health checks fails because PostgREST requires valid table references and doesn't support arbitrary expressions.

**Solution**: Use PostgREST-compatible syntax with actual table operations, preferably with `head: true` for minimal data transfer.

## Wrong Pattern

```typescript
// This fails in PostgREST
const { error } = await client.from('users').select('1').limit(1);
```

## Correct Pattern

```typescript
// PostgREST-compatible health check
async healthCheck(): Promise<{ healthy: boolean; error?: string }> {
  try {
    const { error } = await this.client
      .from('_health_check')
      .select('id', { head: true, count: 'exact' })
      .limit(1);
    return { healthy: !error };
  } catch (err) {
    return {
      healthy: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    };
  }
}
```

## Why This Works

- **Valid table reference**: PostgREST requires actual table names, not arbitrary SQL
- **head: true**: Returns only headers (no body), minimal network overhead
- **count: 'exact'**: Enables the query without requiring actual data
- **Proper error handling**: Distinguishes between connection errors and table access errors

## Alternative Approaches

```typescript
// Option 1: Check a known system table (if accessible)
const { error } = await client.from('some_table').select('*', { head: true }).limit(1);

// Option 2: Use a dedicated health check table
const { error } = await client.from('health_check').select('status').limit(1);

// Option 3: Check table existence (if permissions allow)
const { error } = await client.from('users').select('id', { head: true }).limit(0);
```

## Context

Found in `packages/db/src/client.ts:83` when implementing Supabase health checks. PostgREST has different SQL capabilities than direct PostgreSQL connections.

## Related Patterns

- Always test health checks against actual PostgREST endpoints
- Consider using dedicated health check tables for monitoring
- Use `head: true` for minimal overhead health checks
