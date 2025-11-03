---
UsedBy: 0
Severity: high
---

# Input Validation Must Happen Before Any Processing

**Context.** Added Zod schemas for git command arguments but forgot to validate user-facing API inputs. Function accepted `maxCommits: -5` and `diffContext: 3.14` without error, violating documented contracts and potentially causing unexpected behavior.

**Rule.** **Validate all user-provided inputs with Zod schemas at API boundaries before any processing or business logic.**

**Example.**

```typescript
// ❌ WRONG: No validation at public API boundary
export function getGitContext(options?: GitContextOptions): GitContext {
  const maxCommits = options?.maxCommits ?? 10; // Could be negative!
  const diffContext = options?.diffContext ?? 3; // Could be 3.14!
  // ... use values without validation
}

// ✅ CORRECT: Validate immediately at entry point
import { gitContextOptionsSchema } from './validators.js';

export function getGitContext(options?: GitContextOptions): GitContext {
  // Validate inputs as promised in documentation
  const validated = options ? gitContextOptionsSchema.parse(options) : undefined;

  const maxCommits = validated?.maxCommits ?? 10; // Guaranteed positive integer
  const diffContext = validated?.diffContext ?? 3; // Guaranteed non-negative integer
  // ... safe to use
}
```

**Guardrails.**

- Define Zod schema for every public API that accepts user input
- Call `.parse()` at the entry point of public functions, not deep in call stack
- Document validation in JSDoc with `@throws {ZodError}` if validation fails
- Use `.optional()` for optional parameters in schemas
- Test with invalid inputs (negative numbers, wrong types, null, undefined) to verify rejection

**Tags.** security, input-validation, zod, typescript, api-design, defense-in-depth
