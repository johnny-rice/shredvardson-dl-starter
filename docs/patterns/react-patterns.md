# React & Next.js Patterns

**Category:** Frontend Development
**Impact:** High - Prevents build failures, ensures accessibility, improves type safety
**Lessons Synthesized:** 10 micro-lessons

## Overview

This guide consolidates battle-tested patterns for React and Next.js development, with a strong emphasis on accessibility, type safety, and the Next.js App Router. These patterns prevent common build failures, ensure WCAG compliance, and establish best practices for component design.

## Core Principles

1. **Accessibility First:** ARIA attributes and semantic HTML are not optional
2. **Type Safety:** Precise types over unions, proper ref typing
3. **Server/Client Boundary:** Explicit 'use client' directive for hooks
4. **Example-Driven:** Demo files teach best practices
5. **Graceful Motion:** Manual reduced-motion adaptation

---

## Pattern 1: Next.js App Router 'use client' Directive

**Problem:** Build failures when using React hooks without 'use client' directive.

**Impact:** High (9/10) - Prevents production build failures

**Source Lessons:**
- `nextjs-client-directive-for-hooks.md`
- `nextjs-turbopack-css-cache-invalidation.md`

### ✅ Correct Pattern

```typescript
// ✅ CORRECT: 'use client' at the very top
'use client';

import { useEffect, useState } from 'react';

export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}
```

### ❌ Anti-Pattern

```typescript
// ❌ WRONG: Missing 'use client' directive
import { useEffect, useState } from 'react';

export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  // ... implementation
}
// Build error: "You're importing a component that needs useState"
```

### Key Points

- **Add 'use client' at the very top** of files using React hooks
- **Test with `pnpm build`** not just `pnpm dev` (dev is more permissive)
- **Applies to custom hooks** in shared packages too
- **Server Components can import Client Components,** but not vice versa
- **Clear cache after major changes:** `rm -rf .next .turbo node_modules/.cache`

### When 'use client' is Required

- `useState`, `useEffect`, `useReducer`, `useContext`
- `useRef`, `useCallback`, `useMemo`
- Event handlers (`onClick`, `onChange`, etc.)
- Browser APIs (`window`, `document`, `localStorage`)
- Third-party libraries using hooks

### Cache Invalidation

```bash
# After changing CSS tooling (Tailwind v3→v4, PostCSS)
rm -rf .next .turbo node_modules/.cache
pnpm install
pnpm dev

# Verify with production build
pnpm build
```

---

## Pattern 2: Accessibility-First Component Design

**Problem:** Icon buttons without labels, missing ARIA attributes, inaccessible form associations.

**Impact:** High (9/10) - WCAG compliance, inclusive UX

**Source Lessons:**
- `icon-buttons-aria-label.md`
- `20251109-223018-accessibility-first-examples.md`
- `svg-accessibility-aria-hidden.md`
- `20251026-084606-accessible-table-row-selection.md`

### ✅ Correct Pattern

```tsx
// Icon buttons
<Button size="icon" aria-label="Search">
  🔍
</Button>

<Button size="icon" aria-label="Close dialog">
  <X className="h-4 w-4" />
</Button>

// Form associations
<label htmlFor="username" className="text-sm font-medium">
  Username
</label>
<Input
  id="username"
  placeholder="@username"
  aria-describedby="username-help"
/>
<p id="username-help" className="text-xs text-gray-600">
  Choose a unique username
</p>

// Checkbox with proper label
<div className="flex items-center space-x-2">
  <input
    type="checkbox"
    id="dark-mode"
    checked={isDarkMode}
    onChange={(e) => setIsDarkMode(e.target.checked)}
    className="h-4 w-4"
  />
  <label htmlFor="dark-mode" className="text-sm">
    Enable Dark Mode
  </label>
</div>

// Decorative SVG (hidden from screen readers)
<svg aria-hidden="true" className="icon">
  <path d="..." />
</svg>

// Semantic HTML for navigation
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>

// Form grouping with fieldset
<fieldset>
  <legend>Notification Preferences</legend>
  <label>
    <input type="checkbox" name="email" />
    Email notifications
  </label>
  <label>
    <input type="checkbox" name="sms" />
    SMS notifications
  </label>
</fieldset>
```

### ❌ Anti-Pattern

```tsx
// ❌ Icon button without label
<Button size="icon">🔍</Button>
// Screen reader: "button" (no context)

// ❌ Helper text without association
<Input id="username" placeholder="@username" />
<p className="text-xs">Choose a unique username</p>
// Screen reader doesn't announce helper text

// ❌ Checkbox without label association
<span className="text-sm">Dark Mode</span>
<input type="checkbox" className="h-4 w-4" />
// Clicking text doesn't toggle checkbox

// ❌ Decorative SVG without aria-hidden
<svg className="icon">
  <path d="..." />
</svg>
// Screen reader announces SVG internals

// ❌ Disabled link (wrong pattern)
<Link href="/dashboard" className={disabled ? 'pointer-events-none' : ''}>
  Dashboard
</Link>
// CSS doesn't prevent keyboard navigation
```

### Proper Disabled Link Pattern

```tsx
// ✅ CORRECT: True disabled state
{disabled ? (
  <span
    className="link-disabled"
    aria-disabled="true"
    role="link"
    tabIndex={-1}
  >
    Dashboard
  </span>
) : (
  <Link href="/dashboard">Dashboard</Link>
)}
```

### Key Points

- **Icon-only buttons** must have `aria-label` describing the action
- **Form inputs** must have associated labels (via `htmlFor`/`id`)
- **Helper text** must use `aria-describedby` for programmatic association
- **Decorative images/icons** must have `aria-hidden="true"`
- **Semantic HTML** (`<nav>`, `<fieldset>`, `<legend>`) improves structure
- **Disabled interactive elements** need proper ARIA and keyboard handling
- **Example files teach patterns** - prioritize accessibility over brevity

### ARIA Attribute Quick Reference

| Pattern | ARIA Attribute | Purpose |
|---------|---------------|---------|
| Icon button | `aria-label="Action"` | Describes button purpose |
| Helper text | `aria-describedby="help-id"` | Associates hint with input |
| Error message | `aria-invalid="true"` | Indicates validation failure |
| Disabled element | `aria-disabled="true"` | Indicates disabled state |
| Decorative image | `aria-hidden="true"` | Hides from screen readers |
| Loading state | `aria-busy="true"` | Indicates loading |
| Modal | `aria-modal="true"` | Restricts focus to dialog |

---

## Pattern 3: Component Type Safety

**Problem:** Imprecise types cause runtime errors, force type casts, lose IDE support.

**Impact:** Medium (6/10) - Type safety, developer experience

**Source Lessons:**
- `polymorphic-component-ref-typing.md`
- `typescript-event-handler-precise-types.md`
- `react-void-elements-no-children.md`

### ✅ Correct Pattern

```tsx
// Polymorphic component with proper ref typing
type SectionHeaderProps = {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  children: React.ReactNode;
} & React.ComponentPropsWithoutRef<'h2'>;

// ✅ Type to actual element, not generic parent
export const SectionHeader = React.forwardRef<
  HTMLHeadingElement,  // Specific element type
  SectionHeaderProps
>(({ as: Comp = 'h2', ...props }, ref) => {
  return <Comp ref={ref} {...props} />; // No cast needed
});

SectionHeader.displayName = 'SectionHeader';

// Precise event handler types
const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

// ✅ Exact type from API
const handleChange = (event: MediaQueryListEvent) => {
  setPrefersReducedMotion(event.matches);
};

mediaQuery.addEventListener('change', handleChange);

// Void elements handling
const VOID_ELEMENTS = [
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img',
  'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'
];

// ✅ Conditional rendering for void elements
function renderComponent(Component: React.ElementType, props: any) {
  const isVoid = VOID_ELEMENTS.includes(Component.displayName?.toLowerCase() || '');

  return isVoid ? (
    <Component {...props} />
  ) : (
    <Component {...props}>
      {props.children}
    </Component>
  );
}
```

### ❌ Anti-Pattern

```tsx
// ❌ Generic parent type forces casts
export const SectionHeader = React.forwardRef<
  HTMLElement,  // Too generic!
  SectionHeaderProps
>(({ as: Comp = 'h2', ...props }, ref) => {
  return (
    <Comp
      ref={ref as React.Ref<HTMLHeadingElement>}  // Cast required!
      {...props}
    />
  );
});

// ❌ Overly permissive union type
const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
  // API only passes MediaQueryListEvent, never MediaQueryList
  setPrefersReducedMotion(event.matches);
};

// ❌ Treating all elements the same
<Component {...props}>
  {component.name === 'input' && 'Placeholder'}
  {/* Error! input is void element */}
</Component>
```

### Key Points

- **Type forwardRef to actual element:** `HTMLHeadingElement` not `HTMLElement`
- **Match event types exactly** to what the API passes
- **Void elements cannot have children:** Check before rendering
- **Use TypeScript strict mode** to catch these at compile time
- **Avoid type casts** in component implementations - they indicate wrong typing

### TypeScript Strict Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

---

## Pattern 4: Framer Motion Accessibility

**Problem:** Misleading documentation suggests animations auto-adapt to reduced motion.

**Impact:** High (8/10) - Motion sensitivity, WCAG compliance

**Source Lessons:**
- `framer-motion-variants-static-objects.md`
- `framer-motion-function-variants-preservation.md`

### ✅ Correct Pattern

```tsx
// Hook for detecting reduced motion preference
'use client';

import { useEffect, useState } from 'react';

export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

// Utility to adapt variants
export function getReducedMotionVariants(variants: Variants): Variants {
  const reduced: Variants = {};

  for (const key in variants) {
    const variant = variants[key];
    if (variant && typeof variant === 'object') {
      // Remove transitions, keep only opacity/position changes
      reduced[key] = {
        ...variant,
        transition: { duration: 0 },
      };
    }
  }

  return reduced;
}

// Documented animation variants
/**
 * Fade in animation variant.
 *
 * IMPORTANT: Use with useReducedMotion hook:
 * ```tsx
 * const prefersReducedMotion = useReducedMotion();
 * <motion.div
 *   variants={prefersReducedMotion ? getReducedMotionVariants(fadeIn) : fadeIn}
 * >
 * ```
 *
 * @accessibilityConsiderations Does NOT automatically respect prefers-reduced-motion.
 * Must use useReducedMotion hook or getReducedMotionVariants utility.
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

// Usage in components
export function AnimatedCard({ children }: { children: React.ReactNode }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      variants={prefersReducedMotion ? getReducedMotionVariants(fadeIn) : fadeIn}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
}
```

### ❌ Anti-Pattern

```tsx
// ❌ Misleading documentation
/**
 * Fade in animation variant.
 * @accessibilityConsiderations Respects prefers-reduced-motion
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

// ❌ Direct usage without adaptation
<motion.div variants={fadeIn}>
  Content
</motion.div>
// Does NOT respect prefers-reduced-motion!
```

### Key Points

- **Variants are static objects** - they don't auto-adapt to preferences
- **Use `useReducedMotion` hook** to detect user preference
- **Provide adaptation utilities** like `getReducedMotionVariants`
- **Document requirements clearly** with code examples
- **Test with reduced motion enabled** in system preferences
- **Include null check:** `variant && typeof variant === 'object'` (typeof null === 'object')

---

## Pattern 5: Form State Management

**Problem:** Form examples show structure but not state handling, leaving developers guessing.

**Impact:** Medium (6/10) - Educational completeness

**Source Lessons:**
- `20251109-223019-form-state-examples.md`
- `20251109-223018-accessibility-first-examples.md`

### ✅ Correct Pattern

```tsx
// Complete form example with state and feedback
'use client';

import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ProfileForm() {
  const [formData, setFormData] = useState({
    name: '',
    role: 'developer',
    level: 'mid',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert(`Profile updated: ${formData.name} - ${formData.role} (${formData.level})`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Name
        </label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          aria-describedby="name-help"
        />
        <p id="name-help" className="text-xs text-gray-600">
          Your full name as it appears on documents
        </p>
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium">
          Role
        </label>
        <Select
          value={formData.role}
          onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
        >
          <SelectTrigger id="role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="developer">Developer</SelectItem>
            <SelectItem value="designer">Designer</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label htmlFor="level" className="block text-sm font-medium">
          Experience Level
        </label>
        <Select
          value={formData.level}
          onValueChange={(value) => setFormData(prev => ({ ...prev, level: value }))}
        >
          <SelectTrigger id="level">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="junior">Junior</SelectItem>
            <SelectItem value="mid">Mid-level</SelectItem>
            <SelectItem value="senior">Senior</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit">Save Profile</Button>
    </form>
  );
}
```

### ❌ Anti-Pattern

```tsx
// ❌ Structure only, no state
<form onSubmit={(e) => { e.preventDefault(); }}>
  <Select defaultValue="developer">
    <SelectTrigger><SelectValue /></SelectTrigger>
    <SelectContent>
      <SelectItem value="developer">Developer</SelectItem>
    </SelectContent>
  </Select>
  <button type="submit">Submit</button>
</form>
// How do I get the value? Uncontrolled? FormData API?
```

### Key Points

- **Show complete state management** with `useState` and handlers
- **Include both controlled and uncontrolled** patterns where appropriate
- **Provide visible feedback:** `console.log` + `alert` for immediate results
- **Model real-world patterns** developers will copy into production
- **Don't leave developers guessing** how to extract values
- **Include ARIA attributes** and labels in examples

---

## Pattern 6: Component Quality Patterns

**Problem:** Inconsistent component APIs, missing error boundaries, no loading states.

**Impact:** Medium (6/10) - User experience, maintainability

**Source Lessons:**
- `react-component-quality-patterns.md`
- `20251026-084605-external-library-cva-integration.md`

### ✅ Correct Pattern

```tsx
// Consistent component API with cva for variants
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

// Error boundary for component failures
export class ComponentErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// Loading state wrapper
export function LoadingWrapper({
  isLoading,
  children,
}: {
  isLoading: boolean;
  children: React.ReactNode;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4" aria-busy="true">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  return <>{children}</>;
}
```

### Key Points

- **Use cva for variant management** - type-safe, consistent
- **Provide error boundaries** for graceful failure handling
- **Include loading states** with proper ARIA attributes
- **Consistent API patterns** across all components
- **Forward refs properly** with correct types
- **Display names for debugging** with `displayName`

---

## Checklist for React Components

Before committing React components, verify:

- [ ] 'use client' directive on files using hooks
- [ ] Icon-only buttons have `aria-label`
- [ ] Form inputs have associated labels (`htmlFor`/`id`)
- [ ] Helper text uses `aria-describedby`
- [ ] Decorative elements have `aria-hidden="true"`
- [ ] Event handler types match API exactly
- [ ] Refs typed to specific elements (not generic parents)
- [ ] Void elements rendered without children
- [ ] Framer Motion variants documented with adaptation requirements
- [ ] Form examples include state management
- [ ] Semantic HTML (`<nav>`, `<fieldset>`, `<legend>`)
- [ ] Error boundaries for graceful failures
- [ ] Loading states with `aria-busy="true"`
- [ ] Production build passes (`pnpm build`)

---

## Quick Reference

### Common ARIA Patterns

```tsx
// Icon button
<Button aria-label="Close">×</Button>

// Form association
<label htmlFor="email">Email</label>
<Input id="email" aria-describedby="email-help" />
<span id="email-help">We'll never share your email</span>

// Error state
<Input aria-invalid="true" aria-describedby="error" />
<span id="error" role="alert">Email is required</span>

// Loading
<div aria-busy="true">Loading...</div>

// Hidden from screen readers
<svg aria-hidden="true">...</svg>
```

### Void Elements

```typescript
const VOID_ELEMENTS = [
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img',
  'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'
];
```

### Reduced Motion Detection

```tsx
const prefersReducedMotion = useReducedMotion();
<motion.div
  variants={prefersReducedMotion ? reducedVariants : fullVariants}
/>
```

---

## References

- **Next.js App Router:** https://nextjs.org/docs/app
- **WCAG Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA Authoring Practices:** https://www.w3.org/WAI/ARIA/apg/
- **Framer Motion:** https://www.framer.com/motion/
- **CVA (Class Variance Authority):** https://cva.style/

---

## Related Patterns

- [TypeScript Patterns](./typescript-patterns.md) - Type safety and precision
- [Testing Patterns](./testing-patterns.md) - Component testing strategies
- [Accessibility Patterns](./security-patterns.md) - Security considerations

---

**Last Updated:** 2025-11-11
**Lessons Referenced:** 10 micro-lessons from React/Next.js category
