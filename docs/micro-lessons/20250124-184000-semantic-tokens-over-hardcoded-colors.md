# Lesson: Semantic Tokens Over Hardcoded Colors in Templates

**Date:** 2025-01-24
**Context:** Issue #151 - Phase 4 Tremor Template Externalization
**Severity:** high
**UsedBy:** 0

## Context

Component templates were using hardcoded Tailwind color names (`'blue'`, `'green'`, `'purple'`) and utility classes (`text-emerald-500`, `text-red-500`) as defaults. This violated the design system's token compliance goal and made components theme-incompatible.

## Rule

**Always use semantic token names in component defaults, never hardcoded color strings or utility classes.**

## Why It Matters

1. **Theme Compatibility:** Hardcoded colors break when switching themes (light/dark/custom)
2. **Design System Consistency:** Tokens ensure all components use the same color palette
3. **Maintainability:** Changing brand colors requires updating one token definition, not hunting through every component
4. **Token Compliance:** Stated goal of 100% token compliance is impossible with hardcoded values

## Example

### ❌ Before (Hardcoded Colors)
```typescript
// Tremor chart template - WRONG
export function LineChart({
  colors = ["blue", "green", "purple"], // ❌ Hardcoded Tremor color names
  // ...
}: LineChartProps) {
  return <TremorLineChart colors={colors} {...props} />;
}

// KPI card template - WRONG
const changeTypeStyles = {
  increase: "text-emerald-500",   // ❌ Hardcoded Tailwind class
  decrease: "text-red-500",        // ❌ Hardcoded Tailwind class
  neutral: "text-gray-500",        // ❌ Hardcoded Tailwind class
};
```

### ✅ After (Semantic Tokens)
```typescript
// Tremor chart template - CORRECT
export function LineChart({
  /**
   * Color scheme for chart lines.
   * Uses semantic color names that map to your design system.
   * @default ['primary', 'secondary', 'accent']
   */
  colors = ['primary', 'secondary', 'accent'], // ✅ Semantic tokens
  // ...
}: LineChartProps) {
  return <TremorLineChart colors={colors} {...props} />;
}

// KPI card template - CORRECT
const changeTypeStyles = {
  increase: "text-[var(--color-success)]",        // ✅ CSS custom property
  decrease: "text-[var(--color-error)]",          // ✅ CSS custom property
  neutral: "text-[var(--color-foreground-muted)]", // ✅ CSS custom property
};
```

## Semantic Token Strategies

### 1. Library-Native Tokens (Tremor, Recharts)
Use semantic names the library understands: `'primary'`, `'secondary'`, `'accent'`, `'success'`, `'warning'`, `'error'`

### 2. CSS Custom Properties (Native Components)
Use Tailwind's arbitrary value syntax with CSS variables: `text-[var(--color-primary)]`

### 3. Token Mapping Layer (Advanced)
Create a mapping from semantic names to library-specific values:
```typescript
const tokenMap = {
  primary: 'blue',    // Maps to Tremor's 'blue'
  secondary: 'green', // Maps to Tremor's 'green'
  // ...
};
```

## Guardrails

- **Code Review:** Reject any PR with hardcoded color strings in component defaults
- **Linting:** Add ESLint rule to flag `colors = ["blue"`, `className="text-red-`, etc.
- **Documentation:** Every color prop must document semantic token usage with JSDoc `@default`
- **Template Validation:** Scripts that generate components should validate token usage
- **Design System Audit:** Periodically grep for hardcoded colors: `rg '(blue|green|red|purple|emerald|gray)-\d{3}'`

## Related

- CodeRabbit PR #190 critical issue: "Token Compliance: 100% violated by hardcoded colors"
- Design system token documentation
- [Tailwind CSS arbitrary values](https://tailwindcss.com/docs/adding-custom-styles#using-arbitrary-values)

**Tags.** #design-tokens #semantic-tokens #hardcoded-colors #theme-compatibility #design-system #tremor #tailwind #phase-4
