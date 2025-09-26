# RLS Policy SQL Syntax

**Problem**: PostgreSQL Row Level Security policies require different SQL clauses depending on the operation type, and incorrect syntax leads to policy creation failures.

**Solution**: Use conditional clause generation based on operation type for USING vs WITH CHECK clauses.

## Pattern

```typescript
function generatePolicySQL(policy: RLSPolicy): string {
  const usingClause = 
    policy.operation === 'INSERT' ? '' : `\n  USING (${policy.condition})`;
  const withCheckClause = 
    policy.operation === 'INSERT' || policy.operation === 'UPDATE'
      ? `\n  WITH CHECK (${policy.condition})`
      : '';
      
  return `CREATE POLICY "${policy.name}" ON public.${policy.table}
    FOR ${policy.operation}
    TO ${policy.role}${usingClause}${withCheckClause};`;
}
```

## Operation-Specific Rules

- **SELECT/DELETE**: Use `USING` clause only
- **INSERT**: Use `WITH CHECK` clause only  
- **UPDATE**: Use both `USING` and `WITH CHECK` clauses

## Why This Matters

- **INSERT policies**: `USING` clause is not applicable (no existing row to check)
- **UPDATE policies**: Need `USING` to determine which rows can be updated, `WITH CHECK` to validate new values
- **PostgreSQL requirement**: Incorrect clause usage causes policy creation to fail

## Context

Found in `scripts/db/rls-scaffold.ts:139` when fixing CodeRabbit feedback about RLS policy generation. Critical for generating valid PostgreSQL RLS policies.

## Example Generated SQL

```sql
-- SELECT policy
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- INSERT policy  
CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE policy
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```