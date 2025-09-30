# Cross-Platform ESM Entrypoint Detection

**Pattern:** ESM modules using naive string comparison for entrypoint detection that fails on Windows due to path format differences.

**Context:** ES modules need to detect if they're being run directly vs imported, but Windows file paths break simple string comparison.

## Problem

```typescript
// Breaks on Windows - path separators and format differ
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

// Unix: file:///path/to/script.js vs file:///path/to/script.js ✓
// Windows: file:///C:/path/to/script.js vs file://C:\path\to\script.js ✗
```

## Solution

```typescript
import { pathToFileURL } from 'node:url';

// Cross-platform comparison using proper URL conversion
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
```

## Benefits

- **Cross-platform compatibility**: Works on Windows, macOS, and Linux
- **Robust path handling**: Handles backslashes and drive letters correctly
- **Proper URL format**: Uses Node.js built-in URL utilities

## When to Apply

- ESM modules with CLI entry points
- Scripts that need direct execution detection
- Any file path to URL conversion in Node.js

## Alternative Patterns

```typescript
// Option 1: URL objects comparison
if (
  process.argv[1] &&
  new URL(import.meta.url).pathname === pathToFileURL(process.argv[1]).pathname
) {
  main();
}

// Option 2: fileURLToPath for path comparison
import { fileURLToPath } from 'node:url';
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main();
}
```

**Estimated reading time:** 80 seconds
