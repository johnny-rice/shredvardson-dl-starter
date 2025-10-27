# Design System Context for LLMs

This document provides essential context about the DL Starter design system for AI assistants and LLMs. It follows a progressive disclosure pattern: start with core concepts, then expand to specific patterns as needed.

## Core Principles

1. **Semantic Design Tokens**: Use design tokens (colors, spacing, typography) instead of hardcoded values
2. **Accessibility First**: WCAG AA compliance is mandatory, components must be keyboard navigable
3. **Consistent Patterns**: Follow established UX patterns documented in `/docs/design/patterns/`
4. **Component Composition**: Build complex UI from smaller, reusable components

## Component Architecture

### Base Components (Always Use These)

Located in `packages/ui/src/components/ui/`:

- **Button**: Primary action component with 6 variants (default, secondary, destructive, outline, ghost, link)
- **Input**: Text input with built-in validation states
- **Select**: Dropdown selection with keyboard navigation
- **Card**: Content container with header/content/footer slots
- **Dialog**: Modal overlay for focused interactions
- **Label**: Form field labels for accessibility

### Component Import Pattern

```tsx
// Always import from @ui package
import { Button } from '@ui/src/components/ui/button';
import { Input } from '@ui/src/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@ui/src/components/ui/card';
```

## Design Tokens

### Color System

Use semantic color tokens that adapt to theme:

- `foreground` / `background`: Main content colors
- `primary` / `primary-foreground`: Primary actions
- `secondary` / `secondary-foreground`: Secondary elements
- `muted` / `muted-foreground`: De-emphasized content
- `accent` / `accent-foreground`: Interactive highlights
- `destructive` / `destructive-foreground`: Dangerous actions
- `border`: Element borders
- `ring`: Focus rings

### Spacing Scale

Use Tailwind spacing utilities:

- `space-y-2`: Vertical spacing between related elements
- `space-y-4`: Section spacing
- `gap-4`: Grid/flex gaps
- `p-6`: Standard padding
- `p-4`: Compact padding

### Typography

- Headings: `text-4xl font-bold` (h1), `text-3xl font-semibold` (h2), `text-2xl font-semibold` (h3)
- Body: `text-foreground` (default), `text-muted-foreground` (secondary)
- Small: `text-sm`, `text-xs` for helper text

## Common Patterns

### Form Layout

```tsx
<div className="space-y-4">
  <div className="space-y-2">
    <Label htmlFor="email">Email</Label>
    <Input id="email" type="email" placeholder="you@example.com" />
    <p className="text-sm text-muted-foreground">We'll never share your email.</p>
  </div>
  <Button type="submit">Submit</Button>
</div>
```

### Card Grid

```tsx
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card>
    <CardHeader>
      <CardTitle>Title</CardTitle>
    </CardHeader>
    <CardContent>Content</CardContent>
  </Card>
  {/* More cards... */}
</div>
```

### Modal Dialog

```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description text</DialogDescription>
    </DialogHeader>
    {/* Dialog content */}
  </DialogContent>
</Dialog>
```

## Accessibility Requirements

### Every Component Must Have

1. **Keyboard Navigation**: Tab order, arrow keys for menus
2. **Focus Indicators**: 2px ring with 2px offset
3. **ARIA Labels**: For icon-only buttons and complex interactions
4. **Semantic HTML**: Use proper heading hierarchy, button vs link
5. **Color Contrast**: Minimum 4.5:1 for text, 3:1 for UI elements

### Form Accessibility

- Every input needs a label (visible or aria-label)
- Error messages connected via aria-describedby
- Required fields marked with aria-required
- Validation states announced to screen readers

## Component Selection Guide

### When to Use Each Component

**Button Variants**:

- `default`: Primary CTA (one per view)
- `secondary`: Alternative actions
- `destructive`: Delete, remove, cancel
- `outline`: Secondary with emphasis
- `ghost`: Tertiary, navigation
- `link`: Inline text actions

**Form Controls**:

- `Input`: Text, email, password, numbers
- `Select`: 5+ options
- `RadioGroup`: 2-4 options (not shown, use when needed)
- `Checkbox`: Binary choices
- `Switch`: Instant on/off settings

**Layout Components**:

- `Card`: Group related content
- `Dialog`: Focus user attention
- `Sheet`: Slide-out panels (not shown, use when needed)
- `Tabs`: Multiple views in same space

## File Organization

```text
packages/ui/src/components/ui/    # Base components
apps/web/src/components/          # App-specific components
docs/design/patterns/             # UX pattern documentation
apps/web/src/app/design/page.tsx  # Visual component viewer
```

## Testing Requirements

All components must have:

1. Unit tests for logic
2. Accessibility tests (axe-core)
3. Visual regression tests (Playwright)
4. Keyboard navigation tests
5. Screen reader compatibility tests

## Token Compliance

When building UI:

1. Never use hex colors directly - use token classes
2. Use spacing scale (2, 4, 6, 8) not arbitrary values
3. Follow typography scale for consistency
4. Respect responsive breakpoints (sm, md, lg, xl)

## Progressive Disclosure for LLMs

### Tier 1 (Always Load)

- Component names and basic props
- Import patterns
- Primary design tokens

### Tier 2 (Load on Request)

- Detailed usage examples
- Accessibility guidelines
- Complex patterns

### Tier 3 (Deep Context)

- Full pattern documentation
- Edge cases and warnings
- Performance considerations

## Quick Reference

### Most Used Components

```tsx
// Buttons
<Button variant="default">Primary Action</Button>
<Button variant="ghost" size="sm">Secondary</Button>

// Forms
<Label htmlFor="field">Label</Label>
<Input id="field" type="text" />
<Select>...</Select>

// Layout
<Card className="p-6">...</Card>
<Dialog>...</Dialog>

// Typography
<h1 className="text-4xl font-bold">Heading</h1>
<p className="text-muted-foreground">Secondary text</p>
```

### CSS Classes Quick Reference

- Container: `max-w-7xl mx-auto`
- Section spacing: `space-y-8` or `space-y-16`
- Responsive grid: `grid md:grid-cols-2 lg:grid-cols-3 gap-4`
- Flex alignment: `flex items-center justify-between`
- Text colors: `text-foreground`, `text-muted-foreground`
- Backgrounds: `bg-background`, `bg-card`, `bg-muted`
- Borders: `border border-border`, `rounded-lg`
- Shadows: `shadow-sm`, `shadow-md`

## Related Documents

- [Pattern Documentation](./patterns/) - Detailed UX patterns
- [Component Viewer](/design) - Visual reference at localhost:3000/design
- [Testing Guide](../testing/TESTING_GUIDE.md) - Component testing requirements

---

This context should be sufficient for most AI-assisted development tasks. For deeper patterns, refer to the full documentation in `/docs/design/patterns/`.
