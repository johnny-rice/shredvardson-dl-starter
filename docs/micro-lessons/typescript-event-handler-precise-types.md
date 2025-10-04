---
UsedBy: 1
Severity: normal
---

# Use Precise Types for Event Handlers Not Unions

**Context.** Self-critique found useReducedMotion had `event: MediaQueryListEvent | MediaQueryList` type union, but addEventListener only passes MediaQueryListEvent. The union was overly permissive.

**Rule.** **Match event handler parameter types exactly to what the API passes - avoid unions that accept more types than actually possible.**

**Example.**

```typescript
// ❌ BAD: Overly permissive union type
const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
  setPrefersReducedMotion(event.matches);
};

mediaQuery.addEventListener('change', handleChange);
// addEventListener only passes MediaQueryListEvent, never MediaQueryList

// ✅ GOOD: Precise type matching API contract
const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

const handleChange = (event: MediaQueryListEvent) => {
  setPrefersReducedMotion(event.matches);
};

mediaQuery.addEventListener('change', handleChange);
```

**Guardrails.**

- Check browser API documentation for exact event types
- Use TypeScript's IntelliSense to see what addEventListener expects
- Avoid union types unless multiple valid types can actually be passed
- Test that handlers work with strict TypeScript checks enabled

**Tags.** typescript,event-handlers,type-safety,api-contracts,web-apis,media-queries,type-precision
