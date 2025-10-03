---
UsedBy: 1
Severity: normal
---

# JavaScript typeof null Returns 'object'

**Context.** Self-critique found missing null check in getReducedMotionVariants where `typeof variant === 'object'` would incorrectly match null values, potentially causing errors with malformed animation variants.

**Rule.** **Always check for null before typeof === 'object' checks because typeof null === 'object' in JavaScript (legacy language quirk).**

**Example.**
```typescript
// ❌ BAD: typeof null === 'object' is true
function processVariants(variants: Variants): Variants {
  const result: Variants = {};
  for (const key in variants) {
    const variant = variants[key];
    if (typeof variant === 'object') {
      // This executes for null! Will crash if you access properties
      result[key] = { ...variant };
    }
  }
  return result;
}

// ✅ GOOD: Explicit null check first
function processVariants(variants: Variants): Variants {
  const result: Variants = {};
  for (const key in variants) {
    const variant = variants[key];
    if (variant && typeof variant === 'object') {
      result[key] = { ...variant };
    }
  }
  return result;
}
```

**Guardrails.**
- Use `variant && typeof variant === 'object'` pattern for null-safe object checks
- Consider TypeScript strict null checks to catch these at compile time
- Arrays also return 'object' from typeof - use Array.isArray() for array checks
- This affects any code that validates object types at runtime

**Tags.** javascript,typeof,null,type-checking,defensive-programming,edge-cases,runtime-validation
