---
title: Remove Unused Imports Immediately During Code Review
created: 2025-01-24T19:30:00Z
severity: low
usedBy: 0
---

## Context

PR review feedback identified unused Handlebars import in `import-external.ts`. The import and its helper functions were removed in an earlier refactor but the import statement remained.

## Rule

**Always remove unused imports as soon as they're identified in code review, before they accumulate technical debt.**

## Example

```typescript
// ❌ Before: Unused import after refactor
import Handlebars from 'handlebars';
import { execSync } from 'child_process';

// Helper functions that used Handlebars were removed...

// ✅ After: Clean imports
import { execSync } from 'child_process';
```

## Guardrails

- Run `pnpm typecheck` or IDE diagnostics to catch unused imports automatically
- Include unused import removal in the same commit as the code that made them obsolete
- Set up pre-commit hooks or CI checks to flag unused imports (e.g., ESLint `no-unused-vars`)
- Don't defer cleanup - "later" becomes "never"

**Tags.** #code-quality #imports #refactoring #pr-review #typescript
