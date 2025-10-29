---
title: SKILL_VERBOSE Environment Pattern for Credential Protection
tags: [security, skills, environment-variables, shell-scripts]
context: PR #213 - CodeRabbit identified stdout/stderr leakage risk in Supabase scripts
date: 2025-10-27
---

# SKILL_VERBOSE Environment Pattern for Credential Protection

## Problem

Shell scripts that capture `stdout`/`stderr` from `execSync` may accidentally leak credentials, database URLs, or API tokens in logs when commands fail.

**Example Risk:**

```typescript
// ❌ DANGEROUS: May leak credentials
const output = execSync('pnpm db:types', { encoding: 'utf-8' });
console.log(JSON.stringify({ success: true, output }));
// If output contains: "Connecting to postgresql://user:password@..."
```

## Solution

Gate verbose output behind an explicit environment variable:

```typescript
// ✅ SAFE: Only show output when explicitly enabled
const VERBOSE = /^(1|true)$/i.test(process.env.SKILL_VERBOSE ?? '');

const output = execSync('pnpm db:types', options);

console.log(
  JSON.stringify({
    success: true,
    output: VERBOSE ? output : undefined, // Only include if enabled
  })
);
```

## Pattern

**1. Check environment variable:**

```typescript
export function isVerboseEnabled(): boolean {
  return /^(1|true)$/i.test(process.env.SKILL_VERBOSE ?? '');
}
```

**2. Apply to success output:**

```typescript
const VERBOSE = isVerboseEnabled();
console.log(
  JSON.stringify({
    success: true,
    output: VERBOSE ? output : undefined,
  })
);
```

**3. Apply to error output:**

```typescript
console.error(
  JSON.stringify({
    success: false,
    error: error.message,
    stdout: VERBOSE && execError.stdout ? String(execError.stdout) : undefined,
    stderr: VERBOSE && execError.stderr ? String(execError.stderr) : undefined,
  })
);
```

## Usage

```bash
# Normal execution (safe, no output)
tsx script.ts

# Debug execution (shows full output)
SKILL_VERBOSE=1 tsx script.ts
```

## Why This Matters

- **Production Safety:** Prevents accidental credential exposure in logs
- **Development UX:** Developers can enable verbose when debugging
- **Audit Compliance:** Reduces PII/credential leakage attack surface
- **Zero-Trust:** Output is sensitive by default

## Applied In

- `.claude/skills/supabase-integration/scripts/utils/exec-with-error-handling.ts`
- `.claude/skills/supabase-integration/scripts/generate-types.ts`
- `.claude/skills/supabase-integration/scripts/validate-migration.ts`
- `.claude/skills/supabase-integration/scripts/rollback-migration.ts`

## Related Patterns

- Environment-driven configuration
- Secure logging practices
- Fail-safe defaults (secure by default)
