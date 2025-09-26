# Safe File Writing Patterns

**Problem**: Generated files (migrations, configs) can accidentally overwrite existing files, leading to data loss or conflicts.

**Solution**: Use the `{ flag: 'wx' }` option with `writeFileSync` to fail if file already exists, combined with directory creation safety.

## Pattern

```typescript
function writeGeneratedFile(dir: string, filename: string, content: string): void {
  // Ensure directory exists
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  
  // Write file with exclusive creation flag
  const filepath = join(dir, filename);
  writeFileSync(filepath, content, { flag: 'wx' });
}

// Usage
try {
  writeGeneratedFile('supabase/migrations', 'migration.sql', sqlContent);
  console.log('✅ Migration file created');
} catch (error) {
  if (error.code === 'EEXIST') {
    console.error('❌ Migration file already exists');
  } else {
    throw error;
  }
}
```

## File Flag Options

- **`'w'`** (default): Overwrite existing files (dangerous)
- **`'wx'`**: Create new file, fail if exists (safe)
- **`'a'`**: Append to existing file
- **`'ax'`**: Create and append, fail if exists

## Why This Works

- **Prevents overwrites**: `'wx'` flag throws `EEXIST` error if file exists
- **Directory safety**: `recursive: true` creates parent directories as needed
- **Explicit errors**: Clear distinction between "file exists" vs other failures
- **Atomic operation**: File creation is all-or-nothing

## Context

Found in `scripts/db/plan.ts:67` and `scripts/db/rls-scaffold.ts:265` when implementing migration file generation. Critical for preventing accidental overwrites of existing migrations.

## Related Patterns

- Use timestamp-based filenames to reduce collision likelihood
- Consider file locking for concurrent access scenarios
- Implement backup/versioning for critical generated files
- Use dry-run modes to preview operations before file writes