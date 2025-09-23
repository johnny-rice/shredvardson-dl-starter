# Use ESM-Safe Entrypoint Detection

## Summary
Detect direct execution in ESM using `import.meta.url` compared against the executed script's file URL.

## When to use
- CLI/one‑off scripts compiled to ESM or run via `tsx`/custom loaders.
- Libraries that need optional "run as script" behavior without CommonJS.

## Problem
`require.main === module` throws in ESM/tsx environments because `require` is undefined, breaking script execution when run directly.

## Solution
Use `import.meta.url` with `pathToFileURL` for ESM-safe entrypoint detection:

```typescript
// ❌ Before: breaks in ESM environments
if (require.main === module) {
  const validator = new TraceabilityValidator();
  const result = validator.validateTraceability();
  validator.printSummary();
  if (!result.valid) {
    process.exit(1);
  }
}

// ✅ After: ESM-safe entrypoint detection
import { pathToFileURL } from 'node:url';
const execUrl = process.argv[1] ? pathToFileURL(process.argv[1]).href : undefined;
if (execUrl && import.meta.url === execUrl) {
  const validator = new TraceabilityValidator();
  const result = validator.validateTraceability();
  validator.printSummary();
  if (!result.valid) process.exit(1);
}
```

## How It Works
- `import.meta.url` gives the current module's file URL
- `pathToFileURL(process.argv[1])` converts the executed script path to URL
- Comparing them detects if this module is the direct entry point
- Works correctly with tsx, node --loader, and native ESM

## Context
- Essential for TypeScript modules run with tsx
- Prevents "require is not defined" errors in ESM
- Maintains same functionality as CommonJS require.main check

**Tags:** `esm,typescript,entrypoint,tsx,import-meta,module-detection,coderabbit`