---
UsedBy: 1
Severity: normal
---

# Polymorphic Component Ref Typing

**Context.** When creating a polymorphic React component with an `as` prop (e.g., SectionHeader that can render h1-h6), the ref type must match the actual element being rendered, not a generic HTMLElement. Using `HTMLElement` as the ref type forces unnecessary type casts and loses TypeScript's type safety.

**Rule.** **Type forwardRef generics to the actual element rendered by the polymorphic component, not a generic parent type.**

**Example.**

```tsx
// ❌ Wrong - forces type casts, loses type safety
export const SectionHeader = React.forwardRef<HTMLElement, SectionHeaderProps>(
  ({ as: Comp = 'h2', ...props }, ref) => {
    return (
      <Comp
        ref={ref as React.Ref<HTMLHeadingElement>} // ← type cast needed
        {...props}
      />
    );
  }
);

// ✅ Correct - proper typing, no casts needed
export const SectionHeader = React.forwardRef<HTMLHeadingElement, SectionHeaderProps>(
  ({ as: Comp = 'h2', ...props }, ref) => {
    return (
      <Comp
        ref={ref} // ← no cast needed, TypeScript infers correctly
        {...props}
      />
    );
  }
);
```

**Guardrails.**

- When using polymorphic `as` prop for semantic elements (h1-h6, button, a, etc.), type the ref to the most specific element type (HTMLHeadingElement, HTMLButtonElement, HTMLAnchorElement)
- If the component truly can render different element types with incompatible refs, consider using a discriminated union type or separate components
- Avoid `as React.Ref<T>` type casts in component implementations - they indicate incorrect ref typing in forwardRef

**Tags.** react,typescript,forwardRef,polymorphic-components,ref-typing,type-safety
