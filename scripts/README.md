# Scripts Directory

This directory contains automation scripts for database management, CI/CD, code quality, and developer workflows.

## Directory Structure

```
scripts/
├── db/                    # Database migration and validation
│   ├── migrate.ts        # Migration workflow (create, validate, apply, rollback)
│   ├── plan.ts           # Migration planning
│   └── validate-rls.ts   # RLS policy validation
├── utils/                # Shared utilities
│   ├── confirm.sh        # Bash confirmation helper
│   └── confirm.ts        # TypeScript confirmation helper
├── delegation/           # Claude Code web delegation
├── skills/               # Skill-based automation
├── ci/                   # CI/CD workflow scripts
├── accessibility/        # Accessibility testing
└── seed-dev.ts          # Development data seeding
└── seed-test.ts         # Test data seeding
```

## Safety Guidelines

**IMPORTANT:** All destructive operations require explicit user confirmation. See [docs/scripts/SAFETY.md](../docs/scripts/SAFETY.md) for comprehensive safety guidelines.

### What are destructive operations?

Operations that can cause data loss or irreversible changes:

- Database resets (`supabase db reset`)
- Database migrations that drop tables or columns
- File deletion (`rm -rf`)
- Git force operations (`git push --force`, `git reset --hard`)
- Data deletion (SQL `DELETE`, `TRUNCATE`, `DROP`)

### Quick Reference

**For Bash scripts:**
```bash
#!/bin/bash
set -euo pipefail

source "$(dirname "$0")/utils/confirm.sh"

confirm "This will reset your local database and delete all data."

# Proceed with destructive operation
supabase db reset
```

**For TypeScript scripts:**
```typescript
#!/usr/bin/env tsx
import { confirm } from './utils/confirm';

async function main() {
  await confirm('This will delete existing data.');

  // Proceed with destructive operation
  await deleteData();
}

main().catch(console.error);
```

**Force mode (CI/CD):**
```bash
# Skip confirmation prompts
./script.sh --force
FORCE=true ./script.ts
```

## Database Scripts

### Migration Workflow

**Create migration:**
```bash
pnpm db:migrate:create "add_user_preferences"
```

**Validate migrations:**
```bash
pnpm db:migrate:validate
```

**Apply migrations:**
```bash
pnpm db:migrate:apply
# or force mode (CI/CD):
pnpm db:migrate:apply --force
```

**Rollback migrations:**
```bash
pnpm db:migrate:rollback
# or force mode (CI/CD):
pnpm db:migrate:rollback --force
```

### Data Seeding

**Development data:**
```bash
pnpm db:seed:dev
# or with custom count:
USER_COUNT=100 pnpm db:seed:dev
```

**Test data:**
```bash
pnpm db:seed:test
# or force mode (CI/CD):
pnpm db:seed:test --force
```

## Utility Scripts

### Confirmation Helpers

**scripts/utils/confirm.sh** - Bash confirmation helper
- Interactive confirmation before destructive operations
- Force mode support (`--force` flag or `FORCE=true` env var)
- Non-interactive detection (CI/CD safety)
- Exit code 2 for safety blocks

**scripts/utils/confirm.ts** - TypeScript confirmation helper
- Same features as bash helper
- Async/await pattern
- Type-safe confirmation API

See [docs/scripts/SAFETY.md](../docs/scripts/SAFETY.md) for usage examples.

## CI/CD Scripts

Scripts in `scripts/ci/` are designed for automated workflows:

- `spec_gate.sh` - Validates spec files
- `validate-specs.sh` - Comprehensive spec validation
- `scrape-ai-reviews.sh` - Collects AI review feedback

**Note:** CI scripts automatically detect non-interactive environments and use appropriate flags.

## Code Quality Scripts

- `validate-prompts.ts` - Validates prompt file structure
- `docs-check.ts` - Validates documentation links
- `starter-doctor.ts` - Project health checks
- `accessibility/run-axe.ts` - Accessibility audits

## Best Practices

### 1. Script Headers

Always include a header with usage information:

```bash
#!/bin/bash
# Script description
# Usage: ./script.sh [options] <args>
#   --dry-run: Preview changes without executing
#   --force:   Skip confirmations (use in CI/CD)
```

### 2. Strict Mode

Use strict mode for bash scripts:

```bash
set -euo pipefail
# -e: exit on error
# -u: exit on undefined variable
# -o pipefail: exit on pipe failure
```

### 3. Error Handling

Provide clear error messages:

```bash
if ! command -v gh >/dev/null 2>&1; then
  echo "❌ GitHub CLI (gh) is required but not installed"
  echo "📦 Install: https://cli.github.com/"
  exit 1
fi
```

### 4. Exit Codes

Use consistent exit codes:

- **0**: Success
- **1**: Error (validation failure, operation failed)
- **2**: Safety block (non-interactive without force mode)

### 5. Confirmation Before Destruction

Always confirm before destructive operations:

```bash
source "$(dirname "$0")/utils/confirm.sh"
confirm "This will delete all data in the users table."
```

### 6. Dry-Run Mode

Support dry-run mode for preview:

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

### 7. Protected Resources

Protect critical resources:

```bash
PROTECTED_BRANCHES=("main" "master" "develop" "release")

if [[ " ${PROTECTED_BRANCHES[@]} " =~ " ${BRANCH_NAME} " ]]; then
  echo "❌ Cannot delete protected branch: $BRANCH_NAME"
  exit 1
fi
```

### 8. Input Validation

Validate user input before using it:

```bash
if [[ ! "$INPUT" =~ ^[a-zA-Z0-9_-]+$ ]]; then
  echo "❌ Invalid input: $INPUT"
  echo "   Only alphanumeric, underscore, and hyphen allowed"
  exit 1
fi
```

## Testing Scripts

When writing new scripts:

1. **Test interactive mode:** Verify confirmation prompts appear
2. **Test force mode:** Verify `--force` bypasses confirmations
3. **Test non-interactive:** Verify script fails safely without TTY
4. **Test error cases:** Verify proper error handling and messages
5. **Test edge cases:** Empty input, missing files, network failures

## Related Documentation

- [Script Safety Guidelines](../docs/scripts/SAFETY.md)
- [Destructive Operation Confirmation Guards](../docs/micro-lessons/20251027-083654-destructive-operation-confirmation-guards.md)
- [CLI Input Validation](../docs/micro-lessons/20251022-093043-input-validation-cli-scripts.md)
- [Shell Injection Prevention](../docs/micro-lessons/shell-injection-prevention-execfilesync.md)

## Contributing

When adding new scripts:

1. Follow the patterns in existing scripts
2. Add proper documentation and usage examples
3. Use confirmation helpers for destructive operations
4. Test interactive, force, and non-interactive modes
5. Update this README with the new script
6. Add entry to package.json if it's a common operation

## Support

For questions or issues:

- Check [docs/scripts/SAFETY.md](../docs/scripts/SAFETY.md) for safety patterns
- Review existing scripts for examples
- See [docs/micro-lessons/](../docs/micro-lessons/) for common patterns
- Create an issue if you find bugs or need clarification
