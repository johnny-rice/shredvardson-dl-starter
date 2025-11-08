# Next.js Link with Button asChild Pattern for Client-Side Navigation

**Severity:** normal
**UsedBy:** 0

## Context

During PR #321 (Issue #292: Complete Auth Module MVP), CodeRabbit review identified that the marketing page was using plain HTML anchor tags (`<a>`) instead of Next.js `Link` components for internal navigation. This caused full page reloads instead of client-side transitions.

**Branch:** `feature/292-complete-auth-module-mvp`
**Files Changed:** `apps/web/src/app/(marketing)/page.tsx`

## Rule

**When using design system Button components for internal navigation in Next.js, always use the `asChild` prop with Next.js `Link` to enable client-side routing and prefetching.**

## Problem

Using plain anchor tags with Button components disables Next.js's optimizations:

```tsx
// ❌ BAD: Full page reload, no prefetching
<Button asChild variant="ghost">
  <a href="/login">Log In</a>
</Button>
```

This causes:

- Full page reloads (white flash, slow)
- Loss of client-side state
- No route prefetching
- Worse user experience

## Solution

Use Next.js `Link` component with the Button's `asChild` prop:

```tsx
import NextLink from 'next/link';
import { Button } from '@ui/components';

// ✅ GOOD: Client-side navigation with prefetching
<Button asChild variant="ghost">
  <NextLink href="/login">Log In</NextLink>
</Button>
```

Benefits:

- ✅ Instant client-side navigation
- ✅ Automatic route prefetching on hover
- ✅ Preserves client state
- ✅ Better UX (no white flash)
- ✅ Works with design system Button styles

## How asChild Works

The `asChild` prop (from Radix UI's Slot component) tells the Button to:

1. Pass its styles and props to the child component
2. Render the child instead of a `<button>` element
3. Merge className and event handlers

This allows `NextLink` to maintain its navigation behavior while getting Button's visual styles.

## Pattern for Other Components

This pattern works with any Radix-based component that supports `asChild`:

```tsx
// Dialog trigger
<DialogTrigger asChild>
  <NextLink href="/dashboard">Open Dashboard</NextLink>
</DialogTrigger>

// Custom Link styled as button
<Button asChild size="lg">
  <NextLink href="/signup">Get Started Free</NextLink>
</Button>
```

## Guardrails

1. **Always import as `NextLink`** to avoid confusion with custom `Link` component:

   ```tsx
   import NextLink from 'next/link';
   import { Link } from '@/components/Link'; // Custom link component
   ```

2. **Use for internal routes only** - External links should use regular anchors:

   ```tsx
   // Internal - use NextLink
   <Button asChild><NextLink href="/docs">Docs</NextLink></Button>

   // External - use anchor
   <Button asChild><a href="https://github.com/...">GitHub</a></Button>
   ```

3. **Preserve accessibility attributes** on the NextLink, not the Button:

   ```tsx
   <Button asChild size="lg">
     <NextLink href="/signup" aria-label="Get started with DLStarter">
       Get Started Free
     </NextLink>
   </Button>
   ```

4. **Don't mix href props** - href goes on NextLink, not Button:

   ```tsx
   // ❌ WRONG
   <Button asChild href="/login">
     <NextLink>Log In</NextLink>
   </Button>

   // ✅ CORRECT
   <Button asChild>
     <NextLink href="/login">Log In</NextLink>
   </Button>
   ```

## Related Patterns

- For simple text links, use the custom `Link` component directly (already wraps NextLink)
- For navigation menus, use `Link` with `variant="nav"`
- For button-styled CTAs, use `Button` + `asChild` + `NextLink`

## References

- PR #321: Complete MVP Authentication Module
- Next.js Documentation: [next/link](https://nextjs.org/docs/app/api-reference/components/link)
- Radix UI: [Composition (asChild)](https://www.radix-ui.com/primitives/docs/guides/composition)

**Tags:** #nextjs #design-system #navigation #client-side-routing #button #asChild #radix-ui #accessibility #issue-292
