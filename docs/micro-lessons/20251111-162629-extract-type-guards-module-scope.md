# Extract Type Guards to Module Scope for Reusability

**Context:** During PR review (#367), a type guard function was defined inline within a catch block to handle execSync errors. The reviewer suggested extracting it to module scope for better reusability.

**Rule:** Extract type guard functions to module scope when they can be reused across multiple locations in the file, rather than defining them inline within catch blocks or other local scopes.

**Example:**

Before (inline type guard):

```typescript
try {
  execSync('bash scripts/check-restricted-paths.sh', {
    stdio: 'pipe',
    env: { ...process.env },
  });
} catch (error: unknown) {
  // Type guard defined inline - not reusable
  function hasExecOutput(
    e: unknown
  ): e is { stderr?: { toString(): string }; stdout?: { toString(): string } } {
    return typeof e === 'object' && e !== null && ('stderr' in e || 'stdout' in e);
  }

  const details = hasExecOutput(error)
    ? (error.stderr?.toString() || error.stdout?.toString() || '').split('\n').slice(-5).join(' ').trim()
    : '';
}
```

After (module-scope type guard):

```typescript
// Near top of file with other types
interface ExecError {
  stderr?: { toString(): string };
  stdout?: { toString(): string };
}

function isExecError(e: unknown): e is ExecError {
  return typeof e === 'object' && e !== null && ('stderr' in e || 'stdout' in e);
}

// Later in the file
try {
  execSync('bash scripts/check-restricted-paths.sh', {
    stdio: 'pipe',
    env: { ...process.env },
  });
} catch (error: unknown) {
  const details = isExecError(error)
    ? (error.stderr?.toString() || error.stdout?.toString() || '').split('\n').slice(-5).join(' ').trim()
    : '';
}
```

**Guardrails:**

- Place type guards and their associated interfaces near other type definitions at the top of the file
- Use clear, conventional naming: `isX` for type guard functions, `XError` or similar for interfaces
- Define the interface separately from the type guard for better type documentation
- Consider extracting to a shared utilities module if the type guard is needed across multiple files
- Keep inline type guards only for truly one-off, single-use cases

**Severity:** normal
**UsedBy:** 0
**Tags.** typescript,type-guards,refactoring,code-quality,reusability,type-safety,error-handling
