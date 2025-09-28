# Shared Enum Constants (DRY Principle)

## Problem
Enum/union values duplicated across files leads to type drift and maintenance burden.

```typescript
// ❌ Bad: Hardcoded in multiple places
// auth/adapter.ts
export type AuthProvider = 'supabase' | 'nextauth' | 'clerk' | 'custom';

// env.ts  
AUTH_PROVIDER: z.enum(['supabase', 'nextauth', 'clerk', 'custom'])
```

When adding a new provider, you must remember to update both files or risk runtime/validation mismatches.

## Solution
Extract shared constant, import where needed:

```typescript
// ✅ Good: Single source of truth
// auth/adapter.ts
export const AUTH_PROVIDER_VALUES = ['supabase', 'nextauth', 'clerk', 'custom'] as const;
export type AuthProvider = (typeof AUTH_PROVIDER_VALUES)[number];

// env.ts
import { AUTH_PROVIDER_VALUES } from './auth/adapter';
AUTH_PROVIDER: z.enum(AUTH_PROVIDER_VALUES)
```

## Why This Works
- **DRY**: Single definition prevents drift
- **Type Safety**: TypeScript ensures consistency
- **Maintainability**: Add provider in one place only
- **Runtime Validation**: Zod uses same values as TypeScript

## When to Apply
- Enum/union values used in multiple files
- Runtime validation that should match TypeScript types
- Any shared constants that might grow over time

## Pattern Recognition
🚨 **Red Flag**: Same string literals in 2+ files
✅ **Green Flag**: Import shared constant arrays

## Related
- `duplicate-config-entries.md` - Similar DRY principle
- Consider for: status codes, feature flags, provider lists

---
*Created from CodeRabbit feedback on AUTH_PROVIDER duplication*