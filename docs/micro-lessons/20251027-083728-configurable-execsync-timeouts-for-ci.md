---
title: Configurable execSync Timeouts for CI Reliability
tags: [ci, shell-scripts, reliability, environment-variables, skills]
context: PR #213 - CodeRabbit identified hardcoded 60s timeout insufficient for CI
date: 2025-10-27
---

# Configurable execSync Timeouts for CI Reliability

## Problem

Hardcoded timeouts in `execSync` calls cause flaky CI failures when operations take longer than expected on slower hardware or under high load.

**Example Flake:**

```typescript
// ❌ BRITTLE: Hardcoded 60s timeout
const output = execSync('pnpm db:types', {
  encoding: 'utf-8',
  timeout: 60_000, // Works locally, times out in CI
});
// CI: "Command timed out after 60000ms" (exit SIGTERM)
```

## Solution

Make timeouts and buffer sizes configurable via environment variables with safe defaults:

```typescript
// ✅ RESILIENT: Configurable with CI-friendly defaults
export function getDefaultExecOptions(): ExecSyncOptions {
  const TIMEOUT_MS = Number(process.env.SKILL_EXEC_TIMEOUT_MS ?? 120_000);
  const MAX_BUFFER = Number(process.env.SKILL_EXEC_MAX_BUFFER ?? 10 * 1024 * 1024);

  return {
    encoding: 'utf-8',
    cwd: process.cwd(),
    timeout: TIMEOUT_MS, // 120s default, CI can override
    maxBuffer: MAX_BUFFER, // 10MB default, handles large outputs
  };
}

const output = execSync('pnpm db:types', getDefaultExecOptions());
```

## Pattern

**1. Centralize exec options:**

```typescript
// utils/exec-with-error-handling.ts
export function getDefaultExecOptions(): ExecSyncOptions {
  const TIMEOUT_MS = Number(process.env.SKILL_EXEC_TIMEOUT_MS ?? 120_000);
  const MAX_BUFFER = Number(process.env.SKILL_EXEC_MAX_BUFFER ?? 10 * 1024 * 1024);

  return {
    encoding: 'utf-8',
    cwd: process.cwd(),
    timeout: TIMEOUT_MS,
    maxBuffer: MAX_BUFFER,
  };
}
```

**2. Use in all scripts:**

```typescript
import { getDefaultExecOptions } from './utils/exec-with-error-handling.js';

const output = execSync('command', getDefaultExecOptions());
```

**3. Document in CI config:**

```yaml
# .github/workflows/ci.yml
env:
  SKILL_EXEC_TIMEOUT_MS: 180000 # 3min for slower CI runners
  SKILL_EXEC_MAX_BUFFER: 20971520 # 20MB for verbose output
```

## Environment Variables

| Variable                | Default           | Purpose                         |
| ----------------------- | ----------------- | ------------------------------- |
| `SKILL_EXEC_TIMEOUT_MS` | `120000` (2min)   | Command timeout in milliseconds |
| `SKILL_EXEC_MAX_BUFFER` | `10485760` (10MB) | Max stdout/stderr buffer size   |

## Usage Examples

**Local development (use defaults):**

```bash
tsx generate-types.ts
# Timeout: 120s, Buffer: 10MB
```

**CI with slower runners:**

```bash
SKILL_EXEC_TIMEOUT_MS=300000 tsx generate-types.ts
# Timeout: 5min
```

**Debug with large output:**

```bash
SKILL_EXEC_MAX_BUFFER=52428800 tsx generate-types.ts
# Buffer: 50MB
```

## Why This Matters

- **CI Reliability:** Prevents flaky timeouts on slower/loaded runners
- **Flexibility:** Different environments have different performance profiles
- **Buffer Overflow Prevention:** Large outputs (type generation, logs) won't crash
- **Zero Code Changes:** Adjust behavior via environment variables

## Buffer Size Considerations

**Default maxBuffer (1MB) is too small for:**

- Type generation from large schemas
- Verbose migration logs
- Full test suite output
- Detailed error diagnostics

**Symptoms of buffer overflow:**

```text
Error: stdout maxBuffer length exceeded
Error: stderr maxBuffer length exceeded
```

**Our default (10MB) handles:**

- ~2000 TypeScript interfaces
- ~5000 lines of migration SQL
- Full stack traces with context

## Default Values Rationale

**120s timeout (vs Node's 0/infinity):**

- Long enough for complex operations
- Short enough to catch hung processes
- CI-friendly (most operations < 2min)

**10MB buffer (vs Node's 1MB):**

- 10× Node default
- Handles realistic large outputs
- Prevents silent truncation
- Still memory-safe (< 1% of typical RAM)

## Applied In

- `.claude/skills/supabase-integration/scripts/utils/exec-with-error-handling.ts`
- `.claude/skills/supabase-integration/scripts/generate-types.ts`
- `.claude/skills/supabase-integration/scripts/validate-migration.ts`
- `.claude/skills/supabase-integration/scripts/rollback-migration.ts`

## Related Patterns

- Environment-driven configuration
- CI/CD hardening
- Graceful degradation
