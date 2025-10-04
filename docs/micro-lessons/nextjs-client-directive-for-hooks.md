---
UsedBy: 1
Severity: high
---

# Next.js App Router Requires 'use client' for React Hooks

**Context.** Building useReducedMotion hook caused production build to fail with "You're importing a component that needs useEffect/useState" error, even though it worked in development.

**Rule.** **Any module using React hooks (useState, useEffect, etc.) must have 'use client' directive at the top when used in Next.js App Router.**

**Example.**

```typescript
// ❌ BAD: Missing 'use client' directive
import { useEffect, useState } from 'react';

export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  // ... hook implementation
}

// ✅ GOOD: Explicit 'use client' directive
'use client';

import { useEffect, useState } from 'react';

export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  // ... hook implementation
}
```

**Guardrails.**

- Add 'use client' at the very top of files using React hooks
- Test with `pnpm build` not just `pnpm dev` (dev mode is more permissive)
- Server Components can import Client Components, but not vice versa
- This applies to custom hooks exported from shared packages too

**Tags.** nextjs,react,hooks,use-client,app-router,build-errors,server-components
