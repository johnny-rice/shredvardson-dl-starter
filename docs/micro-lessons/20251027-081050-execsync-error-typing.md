---
UsedBy: 0
Severity: normal
---

# Proper TypeScript Error Typing for execSync

**Context.** Used `(error as any)?.code` in 4 Supabase wrapper scripts, causing Biome `noExplicitAny` warnings. CodeRabbit flagged this as bypassing TypeScript's type safety. Node.js provides `ExecException` type for execSync errors.

**Rule.** **Import `ExecException` from `node:child_process` and create a typed interface for execSync errors instead of using `any` type assertions.**

**Example.**

```typescript
// ❌ BAD: Using any bypasses type safety
import { execSync } from 'node:child_process';

try {
  execSync('command');
} catch (error) {
  const code = (error as any)?.code; // Biome warning!
  const stderr = (error as any)?.stderr; // No autocomplete
}

// ✅ GOOD: Proper typing with ExecException
import { execSync, type ExecException } from 'node:child_process';

interface ExecError extends ExecException {
  stdout?: Buffer | string;
  stderr?: Buffer | string;
  status?: number;
}

try {
  execSync('command', { encoding: 'utf-8', timeout: 60_000 });
} catch (error) {
  const execError = error as ExecError;
  console.error({
    message: error instanceof Error ? error.message : 'Unknown error',
    status: execError.status, // Type-safe access
    code: execError.code, // Autocomplete works
    stderr: execError.stderr ? String(execError.stderr) : undefined,
  });
}
```

**Benefits:**

- Type-safe property access (no typos)
- IDE autocomplete for error properties
- Passes linter rules (no `any` warnings)
- Documents expected error structure

**Guardrails:**

- Always import `ExecException` when using execSync/exec/spawn
- Define interface extending ExecException for additional fields
- Use `error as ExecError` instead of `error as any`
- Include `stdout`, `stderr`, `status`, `code` in error logging

**Tags.** typescript,error-handling,child-process,type-safety,biome,linting,node-js,execsync
