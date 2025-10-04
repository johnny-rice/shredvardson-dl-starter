---
id: component-packaging-api-patterns
title: Component Packaging and API Patterns
category: react
tags: [packaging, forwardref, typescript, radix-ui, npm, monorepo]
confidence: high
created: 2025-01-29
reuse_count: 0
---

# Component Packaging and API Patterns

## Problem

Component libraries often have critical packaging and API issues that break consumers: incorrect TypeScript entrypoints, missing ref forwarding, incomplete asChild implementations, and type mismatches. These cause MODULE_NOT_FOUND errors, runtime ref failures, and broken component composition patterns.

## Symptoms

- `MODULE_NOT_FOUND` errors when importing packages
- "Function components cannot be given refs" runtime errors
- `asChild` prop silently ignored, breaking Radix patterns
- TypeScript ref type mismatches causing development errors
- Missing build artifacts in published packages

## Solution Patterns

### 1. Package Entrypoint Configuration

```json
// ❌ Poor - points to non-existent files
{
  "main": "./index.js",        // File doesn't exist
  "types": "./index.ts",       // Source files, not declarations
  "files": ["src/**/*"]        // Ships source, not compiled
}

// ✅ Good - proper build pipeline
{
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": ["dist/**/*"],
  "scripts": {
    "build": "tsc",
    "prepare": "pnpm build"      // Auto-build before publish
  }
}
```

### 2. TypeScript Build Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "outDir": "dist",
    "declaration": true, // Generate .d.ts files
    "composite": true // Enable project references
  }
}
```

### 3. Proper Ref Forwarding

```tsx
// ❌ Poor - no ref forwarding breaks Next.js Link integration
export function Link({ ...props }: Props) {
  return <a {...props} />;
}

// ✅ Good - forwards refs to underlying DOM element
export const Link = React.forwardRef<HTMLAnchorElement, Props>(({ ...props }, ref) => {
  return <a ref={ref} {...props} />;
});
Link.displayName = 'Link';
```

### 4. Radix Slot Integration (asChild Pattern)

```tsx
// ❌ Poor - asChild prop ignored, breaks composition
const Button = ({ asChild, ...props }) => {
  return <button {...props} />; // Always renders button
};

// ✅ Good - implements asChild with Radix Slot
import { Slot } from '@radix-ui/react-slot';

const Button = React.forwardRef(({ asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return <Comp ref={ref} {...props} />;
});
```

### 5. Correct TypeScript Element Typing

```tsx
// ❌ Poor - ref type doesn't match rendered element
const CardTitle = React.forwardRef<HTMLParagraphElement, Props>(
  (props, ref) => <h3 ref={ref} {...props} /> // h3 ≠ p type
);

// ✅ Good - ref type matches rendered element
const CardTitle = React.forwardRef<HTMLHeadingElement, Props>((props, ref) => (
  <h3 ref={ref} {...props} />
));
```

## When to Apply

### Package Setup

- **Always** set up proper build pipeline with TypeScript compilation
- **Always** configure package.json entrypoints to point to dist/
- **Always** use `prepare` script for automatic building

### Component APIs

- **Always** use forwardRef for components that render DOM elements
- **Always** implement asChild when using Radix patterns
- **Always** match TypeScript ref types with rendered elements
- **Always** set displayName for debugging

### Development Workflow

- **Before publishing**: Verify package builds and exports work
- **During development**: Test ref forwarding with Next.js/React Router
- **Code review**: Check for missing forwardRef and type mismatches

## Verification Steps

1. **Package Export Test**: `node -e "console.log(require('./dist/index.js'))"`
2. **Type Resolution**: Verify TypeScript resolves types from .d.ts files
3. **Ref Forwarding**: Test with `useRef()` and DOM method calls
4. **asChild Integration**: Test `<Button asChild><Link /></Button>` pattern
5. **Build Pipeline**: Ensure `pnpm build` produces correct dist/ structure

## Related Patterns

- `interface-method-typing-precision` - For correct TypeScript signatures
- `react-component-quality-patterns` - For component API best practices
- `shared-enum-constants-dry` - For consistent configuration patterns

---

**When this pattern helped:** During design system component library setup, applying these patterns prevented multiple critical packaging bugs that would have broken all consumers and caused runtime failures in Next.js applications.
