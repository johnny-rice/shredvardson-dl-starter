---
UsedBy: 1
Severity: high
---

# Preserve Function-Based Variants in Framer Motion Transformations

**Context.** getReducedMotionVariants utility dropped function-based variant keys (common when using custom props), breaking animations that relied on dynamic variants.

**Rule.** **When transforming Framer Motion variants, check for both object AND function types - function variants must be wrapped to preserve behavior while applying transformations.**

**Example.**
```typescript
// ❌ BAD: Only handles objects, drops function variants
function getReducedMotionVariants(variants: Variants): Variants {
  const reduced: Variants = {};
  for (const key in variants) {
    const variant = variants[key];
    if (variant && typeof variant === 'object') {
      reduced[key] = { ...variant, transition: { duration: 0.01 } };
    }
    // Function variants are silently dropped! Keys missing from output.
  }
  return reduced;
}

// ✅ GOOD: Handles both objects and functions
function getReducedMotionVariants(variants: Variants): Variants {
  const reduced: Variants = {};
  for (const key in variants) {
    const variant = variants[key];

    // Handle function-based variants
    if (typeof variant === 'function') {
      reduced[key] = (custom: unknown) => {
        const resolved = variant(custom);
        if (resolved && typeof resolved === 'object') {
          return { ...resolved, transition: { duration: 0.01 } };
        }
        return resolved;
      };
      continue;
    }

    // Handle object-based variants
    if (variant && typeof variant === 'object') {
      reduced[key] = { ...variant, transition: { duration: 0.01 } };
    }
  }
  return reduced;
}

// Example usage with function variants
const variants = {
  hidden: { opacity: 0 },
  visible: (custom: { delay: number }) => ({
    opacity: 1,
    transition: { duration: 0.5, delay: custom.delay }
  })
};

const reduced = getReducedMotionVariants(variants);
// reduced.visible is still a function that accepts custom props
```

**Guardrails.**
- Check typeof === 'function' BEFORE typeof === 'object' (functions are objects in JS)
- Wrap function variants to preserve signature and apply transformations to resolved values
- Test with both static and dynamic variants
- Verify all original keys are present in transformed output

**Tags.** framer-motion,animations,variants,function-types,type-checking,javascript,transformation,accessibility
