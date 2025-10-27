---
title: Destructive Operation Confirmation Guards
tags: [safety, database, rollback, shell-scripts, skills]
context: PR #213 - CodeRabbit recommended rollback guard to prevent data loss
date: 2025-10-27
---

# Destructive Operation Confirmation Guards

## Problem

Database rollback operations destroy data. Without explicit confirmation, accidental invocations can cause catastrophic data loss.

**Risk Scenario:**
```bash
# Developer accidentally runs rollback instead of validate
/db rollback  # 💥 All local data gone, no confirmation
```

## Solution

Require explicit environment variable opt-in before executing destructive operations:

```typescript
// ✅ SAFE: Requires explicit confirmation
if (process.env.ALLOW_DB_ROLLBACK !== '1') {
  console.error(
    JSON.stringify({
      success: false,
      error: 'Rollback blocked. Set ALLOW_DB_ROLLBACK=1 to proceed.',
      hint: 'Prevents accidental data loss. Ensure you are targeting a local/dev database.',
    })
  );
  process.exit(2); // Exit code 2 = safety guard blocked
}

// Only execute if guard passed
const output = execSync('tsx scripts/db/migrate.ts rollback', options);
```

## Pattern

**1. Identify destructive operations:**
- Database rollbacks/resets
- Data deletion (bulk or cascade)
- Schema drops
- File system cleanup (`rm -rf`)

**2. Add confirmation guard at entry point:**
```typescript
if (process.env.ALLOW_<OPERATION> !== '1') {
  console.error(JSON.stringify({
    success: false,
    error: '<Operation> blocked. Set ALLOW_<OPERATION>=1 to proceed.',
    hint: 'Safety measure to prevent accidental data loss.',
  }));
  process.exit(2);
}
```

**3. Use distinct exit codes:**
- `0` = Success
- `1` = Error during execution
- `2` = Blocked by safety guard

## Usage

```bash
# ❌ Blocked by safety guard
tsx rollback-migration.ts
# Output: {"success":false,"error":"Rollback blocked. Set ALLOW_DB_ROLLBACK=1 to proceed."}
# Exit code: 2

# ✅ Explicit confirmation
ALLOW_DB_ROLLBACK=1 tsx rollback-migration.ts
# Rollback proceeds
```

## Why This Matters

- **Fail-Safe Design:** Destructive operations opt-in, not opt-out
- **Human Error Prevention:** Guards against typos, wrong directories, muscle memory
- **Production Protection:** Additional layer before catastrophic mistakes
- **Audit Trail:** Explicit environment variable documents intent

## Exit Code Semantics

Using exit code `2` (not `1`) distinguishes safety blocks from execution errors:

```bash
# Exit code 1: Something went wrong during execution
tsx rollback-migration.ts
# → Migration file not found (code 1)

# Exit code 2: Prevented by safety guard
tsx rollback-migration.ts
# → ALLOW_DB_ROLLBACK not set (code 2)
```

This allows scripts to detect and handle differently:
```bash
tsx rollback.ts
EXIT_CODE=$?
if [ $EXIT_CODE -eq 2 ]; then
  echo "⚠️  Rollback requires confirmation. Rerun with ALLOW_DB_ROLLBACK=1"
elif [ $EXIT_CODE -eq 1 ]; then
  echo "❌ Rollback failed during execution"
fi
```

## Alternative Patterns

**Interactive Confirmation (less suitable for Skills):**
```typescript
// ⚠️ Not recommended for automated workflows
const readline = require('readline');
const answer = await prompt('Type CONFIRM to proceed: ');
if (answer !== 'CONFIRM') process.exit(2);
```

**Why environment variables are better for Skills:**
- Works in CI/CD and automated contexts
- Explicit in command history: `ALLOW_DB_ROLLBACK=1 tsx rollback.ts`
- Can be scripted and tested
- No blocking on stdin (Skills can't handle interactive prompts)

## Applied In

- `.claude/skills/supabase-integration/scripts/rollback-migration.ts`

## Related Patterns

- Two-phase confirmation for critical operations
- Environment-driven safety gates
- Explicit over implicit execution
