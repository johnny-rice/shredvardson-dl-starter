# @ui/components

A comprehensive design system built with React, TypeScript, Tailwind CSS, and shadcn/ui conventions. Features semantic design tokens, fluid typography, motion design, and accessible components.

## Quick Start

```tsx
import { Button, Card, CardHeader, CardTitle, CardContent } from '@ui/components';

export function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-fluid-2xl">Welcome</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="default">Get Started</Button>
      </CardContent>
    </Card>
  );
}
```

## Design Tokens

This package uses semantic design tokens following shadcn/ui conventions. All tokens are theme-aware and support light/dark modes automatically.

### Color Tokens

| Token                  | Purpose             | Example Usage                       |
| ---------------------- | ------------------- | ----------------------------------- |
| `--primary`            | Primary brand color | Main CTAs, links, active states     |
| `--primary-foreground` | Text on primary     | Button text on primary background   |
| `--secondary`          | Secondary actions   | Less prominent buttons              |
| `--destructive`        | Destructive actions | Delete, remove, cancel buttons      |
| `--muted`              | Muted backgrounds   | Disabled states, subtle backgrounds |
| `--accent`             | Accent highlights   | Hover states, highlights            |
| `--card`               | Card backgrounds    | Card components                     |
| `--popover`            | Popover backgrounds | Dropdown menus, tooltips            |
| `--border`             | Border colors       | Input borders, dividers             |
| `--input`              | Input borders       | Form input borders                  |
| `--ring`               | Focus rings         | Keyboard focus indicators           |

### Using Tokens

**Tailwind Classes:**

```tsx
<div className="bg-primary text-primary-foreground">
  Primary colored element
</div>

<div className="border border-input bg-background">
  Input-styled element
</div>
```

**CSS Variables:**

```css
.custom-element {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}
```

## Typography Scale

Fluid typography scales smoothly from mobile (320px) to ultra-wide displays (2560px) using CSS `clamp()`.

### Available Scales

| Class             | Min Size | Max Size | Use Case            |
| ----------------- | -------- | -------- | ------------------- |
| `text-fluid-xs`   | 12px     | 14px     | Captions, footnotes |
| `text-fluid-sm`   | 14px     | 16px     | Small body text     |
| `text-fluid-base` | 16px     | 20px     | Body text (default) |
| `text-fluid-lg`   | 18px     | 24px     | Large body text     |
| `text-fluid-xl`   | 20px     | 30px     | Section headings    |
| `text-fluid-2xl`  | 24px     | 36px     | Page headings       |
| `text-fluid-3xl`  | 30px     | 48px     | Hero headings       |

### Example Usage

```tsx
<div>
  <h1 className="text-fluid-3xl font-bold">Hero Title</h1>
  <h2 className="text-fluid-2xl font-semibold">Section Heading</h2>
  <p className="text-fluid-base">Body text that scales fluidly across viewports.</p>
  <small className="text-fluid-xs text-muted-foreground">Fine print</small>
</div>
```

### How It Works

Fluid typography uses CSS `clamp()` to interpolate between min and max sizes based on viewport width:

```css
/* text-fluid-base */
font-size: clamp(1rem, 0.9rem + 0.5vw, 1.25rem);
/*              ↑     ↑              ↑
 *         min (16px) viewport  max (20px)
 */
```

## Spacing Scale

This design system follows an 8pt grid system for consistent spacing. All spacing values are multiples of 4px (0.5 increments in Tailwind).

### Recommended Values

| Class       | Size | Use Case                            |
| ----------- | ---- | ----------------------------------- |
| `p-2`       | 8px  | Tight padding (buttons, badges)     |
| `p-4`       | 16px | Default padding (cards, inputs)     |
| `p-6`       | 24px | Comfortable padding (card headers)  |
| `p-8`       | 32px | Generous padding (page sections)    |
| `gap-4`     | 16px | Default gap between flex/grid items |
| `space-y-4` | 16px | Default vertical spacing            |

### Example Layout

```tsx
<div className="space-y-8">
  <Card className="p-6">
    <CardHeader className="space-y-2">
      <CardTitle>Title</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <p>Content with consistent spacing</p>
      <div className="flex gap-4">
        <Button>Action 1</Button>
        <Button variant="outline">Action 2</Button>
      </div>
    </CardContent>
  </Card>
</div>
```

## Motion Design

Motion design is powered by **Framer Motion** with built-in accessibility support for `prefers-reduced-motion`.

### Animation Variants

```tsx
import { fadeIn, slideUp, scale, slideInRight } from '@ui/components';

// Fade in animation
<motion.div variants={fadeIn} initial="hidden" animate="visible">
  Content fades in
</motion.div>

// Slide up from bottom
<motion.div variants={slideUp} initial="hidden" animate="visible">
  Content slides up
</motion.div>

// Scale animation (great for dialogs)
<motion.div variants={scale} initial="hidden" animate="visible">
  Content scales in
</motion.div>

// Slide in from right
<motion.div variants={slideInRight} initial="hidden" animate="visible">
  Content slides from right
</motion.div>
```

### Accessibility Hook

Use the `useReducedMotion` hook to respect user preferences:

```tsx
import { useReducedMotion, fadeIn, getReducedMotionVariants } from '@ui/components';

function AnimatedComponent() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      variants={prefersReducedMotion ? getReducedMotionVariants(fadeIn) : fadeIn}
      initial="hidden"
      animate="visible"
    >
      Respects user motion preferences
    </motion.div>
  );
}
```

### Animation Guidelines

- **Use animations to provide feedback** - indicate loading, success, or error states
- **Keep animations subtle** - 200-400ms duration for most transitions
- **Always respect `prefers-reduced-motion`** - use the hook or utility
- **Avoid gratuitous animations** - every animation should serve a purpose
- **Test with reduced motion enabled** - ensure UI remains functional

## Component Documentation

All components include comprehensive JSDoc with:

- `@usageGuidelines` - When and how to use the component
- `@accessibilityConsiderations` - WCAG compliance details
- `@example` - Copy-pastable examples

### Example: Button Component

```tsx
/**
 * @usageGuidelines
 * - Only one primary button visible per screen
 * - Use destructive variant for irreversible actions
 * - Disabled state should explain WHY via tooltip
 *
 * @accessibilityConsiderations
 * - 4.5:1 contrast ratio (WCAG AA)
 * - Focus ring with 2px outline + 2px offset
 * - Supports keyboard navigation (Space/Enter)
 */
<Button variant="destructive" onClick={handleDelete}>
  Delete Account
</Button>
```

## Component Update Workflow

When updating shadcn/ui components, use the diff-and-merge strategy to preserve customizations:

### Step 1: Check Current Version

```bash
# Note current component code
cat packages/ui/src/components/ui/button.tsx
```

### Step 2: Download Updated Component

```bash
# Use shadcn CLI to preview changes
pnpm dlx shadcn@latest add button --overwrite=false
```

### Step 3: Manual Diff & Merge

```bash
# Use git diff or VS Code diff
git diff packages/ui/src/components/ui/button.tsx
```

### Step 4: Preserve Customizations

- Keep JSDoc comments with `@usageGuidelines` and `@accessibilityConsiderations`
- Keep semantic token usage (e.g., `bg-primary` not `bg-blue-600`)
- Keep animation integrations if added
- Merge new props or variants from upstream

### Step 5: Test After Update

```bash
pnpm test                    # Unit tests
pnpm test:e2e               # Visual regression tests
pnpm typecheck              # TypeScript compilation
```

## Contributing

### Adding New Components

1. **Use shadcn CLI**: `pnpm dlx shadcn@latest add [component]`
2. **Add JSDoc**: Include `@usageGuidelines`, `@accessibilityConsiderations`, `@example`
3. **Verify tokens**: Ensure semantic tokens are used (no hardcoded colors)
4. **Write tests**: Add integration tests to verify token usage
5. **Export**: Add to `packages/ui/src/index.ts`

### Design System Guidelines

- **Use semantic tokens** - Never hardcode colors (e.g., `bg-slate-900`)
- **Follow 8pt grid** - Use spacing multiples of 4px
- **Fluid typography** - Use `text-fluid-*` classes for scalable text
- **Respect motion preferences** - Use `useReducedMotion` hook
- **Document with JSDoc** - Include usage guidelines and accessibility notes

## Testing

### Unit Tests

```bash
pnpm --filter @ui/components test
```

### Visual Regression Tests

```bash
# Generate baselines
pnpm test:e2e --update-snapshots

# Run visual regression tests
pnpm test:e2e
```

### TypeScript

```bash
pnpm --filter @ui/components typecheck
```

## Showcase

View all design system elements at `/showcase` in your application:

```tsx
// apps/web/src/app/showcase/page.tsx
import { Button, Card, Input, Label } from '@ui/components';

export default function ShowcasePage() {
  return (
    <div className="container mx-auto p-8 space-y-16">
      {/* Typography, colors, components, spacing demos */}
    </div>
  );
}
```

## Architecture

```text
packages/ui/
├── src/
│   ├── components/ui/       # shadcn/ui components with customizations
│   │   ├── button.tsx       # JSDoc + semantic tokens
│   │   ├── card.tsx         # JSDoc + semantic tokens
│   │   └── ...
│   ├── lib/
│   │   ├── animations.ts    # Framer Motion variants
│   │   ├── use-reduced-motion.ts  # Accessibility hook
│   │   └── utils.ts         # cn() helper
│   ├── styles/
│   │   └── tokens.css       # Semantic design tokens (single source of truth)
│   └── index.ts             # Public exports
├── vitest.config.ts
├── package.json
└── README.md (this file)
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS `clamp()` for fluid typography (IE11 not supported)
- `prefers-reduced-motion` media query support

## License

Same as parent repository.
