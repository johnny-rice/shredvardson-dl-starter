---
title: Extract Shared Security Utilities Before Code Review
created: 2025-01-24T19:32:00Z
severity: normal
usedBy: 0
---

## Context

Both `generate-component.ts` and `import-external.ts` had identical filename sanitization and path containment checks (10+ lines each). Code review flagged this duplication.

## Rule

**When implementing defensive security patterns (sanitization, validation), extract to shared utilities immediately - don't wait for code review to identify duplication.**

## Example

```typescript
// ❌ Before: Duplicated in 2+ files
const toKebab = (s: string) =>
  s
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
const resolvedPath = path.resolve(targetPath);
if (!resolvedPath.startsWith(baseDir + path.sep)) {
  throw new Error('Unsafe path');
}

// ✅ After: Shared utility with tests
import { createSafeComponentPath } from './utils.js';
const { kebabName, basePath } = createSafeComponentPath(componentName);
```

## Guardrails

- Extract security utilities as soon as second usage appears
- Include validation/containment checks in the same utility function
- Add comprehensive JSDoc with threat model examples (e.g., `../../../etc/passwd`)
- Write unit tests for edge cases (empty strings, special chars, path traversal)
- Security utilities deserve their own file for easier auditing

**Tags.** #security #duplication #refactoring #utilities #sanitization #path-traversal #phase-4
