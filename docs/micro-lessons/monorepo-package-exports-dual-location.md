---
UsedBy: 1
Severity: normal
---

# Monorepo Packages Need Exports in Both src/index.ts and Root index.ts

**Context.** After implementing animation utilities, TypeScript couldn't find the exports from @ui/components even though they were exported from src/index.ts. The root index.ts also needed the exports.

**Rule.** **In monorepo packages with nested src/ directories, export from both packages/[name]/src/index.ts AND packages/[name]/index.ts to ensure consumers can resolve imports.**

**Example.**

```typescript
// ❌ BAD: Only exporting from src/index.ts
// packages/ui/src/index.ts
export { fadeIn, slideUp } from './lib/animations';

// packages/ui/index.ts
// (empty or missing exports)

// Result: TypeScript errors in consuming apps
import { fadeIn } from '@ui/components'; // Error: no exported member 'fadeIn'

// ✅ GOOD: Export from both locations
// packages/ui/src/index.ts
export { fadeIn, slideUp } from './lib/animations';

// packages/ui/index.ts
export { fadeIn, slideUp } from './src/lib/animations';

// Result: Imports work correctly
import { fadeIn } from '@ui/components'; // ✅ Works
```

**Guardrails.**

- Check package.json "main" and "exports" fields to understand resolution paths
- When adding new exports, update both index files in the same commit
- Run `pnpm typecheck` across all consuming packages after export changes
- Consider using build tools to generate root exports automatically

**Tags.** monorepo,typescript,exports,package-resolution,module-resolution,turborepo,pnpm
