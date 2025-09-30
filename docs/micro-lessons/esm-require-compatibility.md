---
UsedBy: 0
Severity: high
---

# Avoid require() in ESM-Compatible Code

**Context.** CodeRabbit flagged `require('fs')` inside function breaking ESM runners when mixing module systems.
**Rule.** **Use proper ES module imports at the top level instead of require() calls inside functions.**
**Example.**

```typescript
// ❌ Breaks under ESM runners
export function docExists(path: string): boolean {
  try {
    const fs = require('fs'); // Runtime require() call
    return fs.existsSync(resolved);
  } catch {
    return false;
  }
}

// ✅ ESM-compatible approach
import { existsSync } from 'fs';

export function docExists(path: string): boolean {
  try {
    return existsSync(resolved); // Use imported function
  } catch {
    return false;
  }
}
```

**Guardrails.**

- Import all dependencies at the top of the file
- Test with both CommonJS and ESM runners (tsx, node --loader, etc.)
- Use static imports over dynamic imports when possible

**Tags.** esm,modules,compatibility,imports,typescript,coderabbit
