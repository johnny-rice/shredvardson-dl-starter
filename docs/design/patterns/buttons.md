# Button Patterns

## Overview

Buttons are the primary mechanism for user-initiated actions. Use buttons for explicit actions like submitting forms, starting processes, or confirming decisions.

## When to Use

- **Primary actions**: Main call-to-action on a page (sign up, save, submit)
- **Secondary actions**: Alternative or supporting actions (cancel, reset)
- **Destructive actions**: Irreversible operations (delete, remove, unsubscribe)
- **Navigation**: Moving between pages (when anchor tags aren't appropriate)

## When NOT to Use

- **Internal navigation**: Use `<Link>` component for internal routes
- **External links**: Use `<a>` tags with proper security attributes
- **Toggle states**: Use switches or checkboxes for binary states

## Variants

### Default (Primary)
**Purpose**: Primary call-to-action
**Token**: `bg-primary`, `text-primary-foreground`
**Usage**: Only one per screen to avoid user confusion

```tsx
<Button variant="default">Sign Up</Button>
```

### Secondary
**Purpose**: Alternative actions that need visual weight
**Token**: `bg-secondary`, `text-secondary-foreground`
**Usage**: Supporting actions alongside primary button

```tsx
<Button variant="secondary">Learn More</Button>
```

### Destructive
**Purpose**: Irreversible or dangerous operations
**Token**: `bg-destructive`, `text-destructive-foreground`
**Usage**: Delete, remove, cancel subscription
**Requirement**: MUST include confirmation dialog

```tsx
<Button variant="destructive" onClick={confirmDelete}>
  Delete Account
</Button>
```

### Outline
**Purpose**: Secondary actions with clear boundaries
**Token**: `border-input`, `bg-background`
**Usage**: Forms, cards, less emphasized actions

```tsx
<Button variant="outline">Cancel</Button>
```

### Ghost
**Purpose**: Tertiary actions, minimal visual weight
**Token**: Transparent background, hover state only
**Usage**: Navigation, toolbars, less important actions

```tsx
<Button variant="ghost">Skip</Button>
```

### Link
**Purpose**: Text-based actions that appear inline
**Token**: `text-primary`, underline on hover
**Usage**: Inline actions within paragraphs

```tsx
<Button variant="link">View details</Button>
```

## Sizes

- **`sm`**: Compact contexts (tables, cards, dense UIs)
- **`default`**: Standard size for most use cases
- **`lg`**: Emphasized actions (hero CTAs, landing pages)
- **`icon`**: Icon-only buttons (MUST include `aria-label`)

## Accessibility

### Minimum Requirements (WCAG AA)
- ✅ Contrast ratio ≥ 4.5:1 for normal text
- ✅ Contrast ratio ≥ 3:1 for large text (14pt bold, 18pt regular)
- ✅ Focus ring with 2px outline and 2px offset
- ✅ Keyboard support (Space/Enter)
- ✅ Screen reader compatible (semantic `<button>`)

### Icon-Only Buttons
```tsx
<Button variant="ghost" size="icon" aria-label="Close dialog">
  <X className="h-4 w-4" />
</Button>
```

### Disabled States
- **Visual**: Reduced opacity, no hover effects
- **Behavior**: `pointer-events-none` prevents accidental clicks
- **UX**: MUST explain WHY disabled (tooltip or helper text)

```tsx
<Button disabled aria-describedby="save-disabled-reason">
  Save
</Button>
<p id="save-disabled-reason" className="text-sm text-muted-foreground">
  Fill in all required fields to save
</p>
```

## States

### Default
Normal resting state

### Hover
Visual feedback on mouse over

### Focus
Keyboard focus with visible ring

### Active
Pressed/clicked state

### Disabled
Cannot be interacted with

### Loading
Action in progress (spinner, disabled interaction)

```tsx
<Button disabled={isLoading}>
  {isLoading ? 'Saving...' : 'Save'}
</Button>
```

## Spacing & Layout

### Single Button
```tsx
<Button>Action</Button>
```

### Button Group (Horizontal)
Use `gap-2` for related actions
```tsx
<div className="flex gap-2">
  <Button variant="outline">Cancel</Button>
  <Button>Save</Button>
</div>
```

### Button Group (Vertical)
Use `space-y-2` for stacked actions
```tsx
<div className="space-y-2">
  <Button className="w-full">Primary Action</Button>
  <Button variant="outline" className="w-full">Secondary Action</Button>
</div>
```

## Copy Guidelines

### Be Explicit
❌ "Submit"
✅ "Create Account"

### Be Action-Oriented
❌ "Deletion"
✅ "Delete Account"

### Be Concise
❌ "Click here to download your report"
✅ "Download Report"

### Destructive Actions
MUST use clear, unambiguous language:
- "Delete" not "Remove" (for permanent deletion)
- "Cancel Subscription" not "Cancel" (for subscriptions)

## Examples

### Form Actions
```tsx
<form className="space-y-4">
  <Input label="Email" />
  <Input label="Password" type="password" />
  <div className="flex gap-2 justify-end">
    <Button variant="outline" type="button">Cancel</Button>
    <Button type="submit">Sign In</Button>
  </div>
</form>
```

### Confirmation Dialog
```tsx
<Dialog>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Delete Account?</DialogTitle>
    </DialogHeader>
    <p>This action cannot be undone. All your data will be permanently deleted.</p>
    <div className="flex gap-2 justify-end">
      <Button variant="outline">Cancel</Button>
      <Button variant="destructive" onClick={handleDelete}>
        Delete Account
      </Button>
    </div>
  </DialogContent>
</Dialog>
```

### Hero CTA
```tsx
<div className="text-center space-y-4">
  <h1 className="text-5xl font-bold">Get Started Today</h1>
  <p className="text-xl text-muted-foreground">No credit card required</p>
  <div className="flex gap-2 justify-center">
    <Button size="lg">Start Free Trial</Button>
    <Button size="lg" variant="outline">View Demo</Button>
  </div>
</div>
```

## Token Reference

All button styles use design tokens - NEVER hardcode colors:

- `bg-primary` → Primary background
- `text-primary-foreground` → Primary text color
- `bg-destructive` → Destructive action background
- `border-input` → Border color for outline variant
- `ring-ring` → Focus ring color
- `ring-offset-background` → Focus ring offset

## Related Patterns

- [Links](./navigation.md) - For navigation
- [Forms](./forms.md) - Form submission patterns
- [Dialogs](./dialogs.md) - Confirmation patterns
