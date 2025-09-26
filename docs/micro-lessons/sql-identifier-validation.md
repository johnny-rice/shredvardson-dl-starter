# SQL Identifier Validation

**Problem**: Dynamically constructed SQL queries are vulnerable to injection attacks when user input is used in table names, column names, or other identifiers.

**Solution**: Always validate identifiers with a strict regex pattern before using them in SQL construction.

## Pattern

```typescript
function assertIdent(id: string, label: string): void {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(id)) {
    throw new Error(`Invalid ${label}: ${id}`);
  }
}

// Usage
function generatePolicySQL(tableName: string, columnName: string): string {
  assertIdent(tableName, 'table name');
  assertIdent(columnName, 'column name');
  
  return `CREATE POLICY "policy_name" ON public.${tableName}
    FOR SELECT USING (auth.uid() = ${columnName});`;
}
```

## Why This Works

- **Strict validation**: Only allows valid SQL identifiers (alphanumeric + underscore, starting with letter/underscore)
- **Early failure**: Throws immediately on invalid input rather than passing malicious data to SQL
- **Clear error messages**: Labels help identify which parameter failed validation

## Context

Found in `scripts/db/rls-scaffold.ts:13` when implementing RLS policy generation. Critical for preventing SQL injection in dynamically generated database policies.

## Related Patterns

- Use parameterized queries for values (not applicable to identifiers)
- Whitelist known table/column names when possible
- Consider using schema introspection to validate identifiers exist