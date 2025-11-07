# Script Safety Guidelines

This document outlines the safety patterns and best practices for writing scripts that perform destructive operations.

## Overview

Destructive operations (database resets, file deletions, SQL DROP/TRUNCATE) can cause irreversible data loss. To prevent accidental execution, we use interactive confirmation prompts with force mode bypass for CI/CD automation.

## Safety Principles

### 1. Explicit Confirmation Before Destruction

All destructive operations must prompt for explicit user confirmation by requiring the user to type "yes" (not "y" or other shortcuts).

### 2. Force Mode for Automation

Scripts must support force mode to bypass confirmations in non-interactive environments (CI/CD pipelines).

### 3. Non-Interactive Detection

Scripts must detect non-interactive mode (no TTY) and fail safely if force mode is not enabled.

### 4. Clear Warning Messages

Confirmation prompts must clearly describe what will be affected and the consequences of the action.

## Reusable Confirmation Helpers

### Bash Helper

Use `scripts/utils/confirm.sh` for bash scripts:

```bash
#!/bin/bash
set -euo pipefail

source "$(dirname "$0")/utils/confirm.sh"

confirm "This will reset your local database and delete all data."

# Proceed with destructive operation
echo "Resetting database..."
supabase db reset
```

**Features:**

- Requires typing "yes" to continue
- Supports `FORCE=true` env var
- Detects non-interactive mode (CI/CD)
- Exit code 2 for safety blocks (vs 1 for errors)

**Usage:**

```bash
# Interactive mode - prompts for confirmation
./scripts/my-script.sh

# Force mode - bypasses confirmation
FORCE=true ./scripts/my-script.sh
```

### TypeScript Helper

Use `scripts/utils/confirm.ts` for TypeScript scripts:

```typescript
#!/usr/bin/env tsx
import { confirm } from './utils/confirm';

async function main() {
  await confirm('This will delete existing test data and recreate it.');

  // Proceed with destructive operation
  console.log('Deleting data...');
  await db.delete().from('users');
}

main().catch(console.error);
```

**Features:**

- Async/await pattern
- Same force mode support as bash helper
- Same non-interactive detection
- Same exit code semantics

**Usage:**

```bash
# Interactive mode - prompts for confirmation
tsx scripts/my-script.ts

# Force mode - bypasses confirmation
FORCE=true tsx scripts/my-script.ts
```

## Exit Code Semantics

Scripts must use consistent exit codes:

- **0**: Success
- **1**: Error (validation failure, operation failed)
- **2**: Safety block (non-interactive without force mode)

This allows CI/CD systems to distinguish between failures and safety blocks.

## Examples

### Database Reset Script

```bash
#!/bin/bash
set -euo pipefail

source "$(dirname "$0")/utils/confirm.sh"

confirm "This will reset your local database and delete all data."

echo "Resetting database..."
supabase db reset
echo "✅ Database reset complete"
```

### Migration Rollback

```typescript
#!/usr/bin/env tsx
import { execSync } from 'node:child_process';
import { confirm } from './utils/confirm';

async function rollback() {
  await confirm('Rollback will reset your database and DELETE all data.');

  console.log('Resetting database...');
  execSync('supabase db reset', { stdio: 'inherit' });
  console.log('✅ Rollback complete');
}

rollback().catch(console.error);
```

### File Deletion Script

```bash
#!/bin/bash
set -euo pipefail

source "$(dirname "$0")/utils/confirm.sh"

FILES_TO_DELETE="node_modules .next dist"

echo "Files to be deleted:"
for file in $FILES_TO_DELETE; do
  if [ -e "$file" ]; then
    echo "  - $file"
  fi
done
echo ""

confirm "This will permanently delete the files listed above."

for file in $FILES_TO_DELETE; do
  if [ -e "$file" ]; then
    echo "Deleting $file..."
    rm -rf "$file"
  fi
done

echo "✅ Cleanup complete"
```

## CI/CD Integration

When using destructive scripts in CI/CD workflows, always use force mode:

```yaml
# .github/workflows/ci.yml
- name: Reset test database
  run: pnpm db:migrate:rollback --force
  # or
  env:
    FORCE: true
```

```yaml
# .github/workflows/test.yml
- name: Seed test data
  run: tsx scripts/seed-test.ts --force
```

## Common Destructive Operations

### Database Operations

- `supabase db reset` - Resets database to last migration (deletes all data)
- `supabase db push` - Applies migrations (may alter schema)
- SQL `DROP TABLE` - Permanently deletes table and all data
- SQL `TRUNCATE` - Deletes all rows from table
- SQL `DELETE FROM` - Deletes rows from table

**Pattern:** Always confirm before executing these operations.

### File Operations

- `rm -rf` - Recursively deletes files/directories
- `git clean -fd` - Deletes untracked files
- `git reset --hard` - Discards all uncommitted changes

**Pattern:** List files to be deleted, then confirm.

### Git Operations

- `git push --force` - Overwrites remote history
- `git branch -D` - Force deletes local branch

**Pattern:** Verify branch is merged or protected, then confirm.

## Testing Safety Features

When writing new destructive scripts:

1. **Test interactive mode:** Run normally and verify confirmation prompt appears
2. **Test force mode:** Run with `--force` and verify no prompt appears
3. **Test non-interactive:** Run with `echo "no" | ./script.sh` and verify it fails with exit code 2
4. **Test CI mode:** Run in CI with force mode and verify it succeeds

## Related Documentation

- [Destructive Operation Confirmation Guards](../micro-lessons/20251027-083654-destructive-operation-confirmation-guards.md)
- [CLI Input Validation](../micro-lessons/20251022-093043-input-validation-cli-scripts.md)
- [Shell Injection Prevention](../micro-lessons/shell-injection-prevention-execfilesync.md)
- [Git Error Handling](.claude/commands/git/shared/error-handling.md)

## Security Considerations

### Shell Injection

When using user input in destructive operations, always validate and sanitize:

```bash
# BAD - vulnerable to injection
eval "rm -rf $USER_INPUT"

# GOOD - validate first
if [[ "$USER_INPUT" =~ ^[a-zA-Z0-9_-]+$ ]]; then
  rm -rf "$USER_INPUT"
else
  echo "Invalid input"
  exit 1
fi
```

### Protected Resources

Always maintain lists of protected resources that should never be deleted:

```bash
PROTECTED_BRANCHES=("main" "master" "develop" "release")

if [[ " ${PROTECTED_BRANCHES[@]} " =~ " ${BRANCH_NAME} " ]]; then
  echo "❌ Cannot delete protected branch: $BRANCH_NAME"
  exit 1
fi
```

### Dry-Run Mode

Consider adding dry-run mode for preview:

```bash
DRY_RUN=false
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
fi

if [[ "$DRY_RUN" == "true" ]]; then
  echo "[DRY RUN] Would delete: $file"
else
  rm -rf "$file"
fi
```

## Summary

**Key Takeaways:**

1. ✅ Use `scripts/utils/confirm.sh` or `scripts/utils/confirm.ts` for all destructive operations
2. ✅ Support force mode with `--force` flag or `FORCE=true` env var
3. ✅ Detect non-interactive mode and fail safely
4. ✅ Use clear, specific warning messages
5. ✅ Require typing "yes" (not shortcuts)
6. ✅ Use exit code 2 for safety blocks
7. ✅ List affected resources before confirming
8. ✅ Protect critical resources (main branch, production data)
9. ✅ Test interactive, force, and non-interactive modes
10. ✅ Document force mode usage in CI/CD workflows
