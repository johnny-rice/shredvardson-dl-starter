# Accessibility Patterns

## Overview

Accessibility ensures everyone can use your application, regardless of ability. Following WCAG AA guidelines isn't just about compliance—it's about creating a better experience for all users.

## Core Principles (WCAG)

1. **Perceivable**: Information must be presentable to users
2. **Operable**: Interface components must be operable
3. **Understandable**: Information must be understandable
4. **Robust**: Content must work with assistive technologies

## WCAG AA Requirements

All components MUST meet these minimum standards:

### Color Contrast

| Element | Minimum Ratio | WCAG Level |
|---------|--------------|------------|
| Normal text (<18px) | 4.5:1 | AA |
| Large text (≥18px, ≥14px bold) | 3:1 | AA |
| UI components | 3:1 | AA |
| Icons (informational) | 3:1 | AA |

### Text

- ✅ Font size ≥ 16px for body text
- ✅ Line height ≥ 1.5 for body text
- ✅ Paragraph spacing ≥ 2x font size
- ✅ Text resizable up to 200% without loss of functionality

### Interactive Elements

- ✅ Minimum touch target: 44×44px
- ✅ Visible focus indicators (2px outline, 2px offset)
- ✅ Keyboard accessible (Tab, Enter, Space, Arrows)
- ✅ Clear hover/focus/active states

## Keyboard Navigation

### Standard Keys

| Key | Action |
|-----|--------|
| Tab | Move focus forward |
| Shift+Tab | Move focus backward |
| Enter | Activate button/link |
| Space | Activate button, toggle checkbox |
| Arrow keys | Navigate lists, menus, tabs |
| Escape | Close modal/menu, cancel action |
| Home/End | Jump to first/last item |

### Tab Order

Ensure logical tab order:

```tsx
// ✅ Good - natural DOM order
<form>
  <input id="name" />      {/* Tab 1 */}
  <input id="email" />     {/* Tab 2 */}
  <button type="submit">   {/* Tab 3 */}
</form>

// ❌ Bad - disrupted by CSS
<div className="grid grid-cols-2">
  <input className="col-start-2" />  {/* Visually first, Tab 2 */}
  <input className="col-start-1" />  {/* Visually second, Tab 1 */}
</div>
```

### Focus Management

```tsx
// Trap focus in modal
import { useEffect, useRef } from 'react';

function Modal({ isOpen, onClose, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Save current focus
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Focus first element in modal
      const firstFocusable = modalRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      (firstFocusable as HTMLElement)?.focus();
    } else {
      // Restore focus on close
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }

    if (e.key === 'Tab') {
      // Trap focus within modal
      const focusable = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0] as HTMLElement;
      const last = focusable[focusable.length - 1] as HTMLElement;

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
}
```

### Skip Links

Allow keyboard users to skip navigation:

```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:p-4 focus:bg-primary focus:text-primary-foreground"
>
  Skip to main content
</a>

<main id="main-content">
  {/* Page content */}
</main>
```

## Screen Reader Support

### Semantic HTML

Use correct HTML elements:

```tsx
// ✅ Good - semantic
<button onClick={handleClick}>Submit</button>
<nav><a href="/about">About</a></nav>
<main>{content}</main>

// ❌ Bad - divs for everything
<div onClick={handleClick}>Submit</div>
<div><div onClick={() => navigate('/about')}>About</div></div>
<div>{content}</div>
```

### ARIA Labels

Add labels when visual text isn't sufficient:

```tsx
// Icon-only button
<Button size="icon" aria-label="Close dialog">
  <X className="h-4 w-4" />
</Button>

// Link with generic text
<Link href="/docs" aria-label="Read documentation">
  Learn more →
</Link>

// Search input
<input
  type="search"
  placeholder="Search..."
  aria-label="Search projects"
/>
```

### ARIA Descriptions

Link helper text to inputs:

```tsx
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    aria-describedby="email-hint email-error"
  />
  <p id="email-hint" className="text-sm text-muted-foreground">
    We'll never share your email
  </p>
  {error && (
    <p id="email-error" className="text-sm text-destructive" role="alert">
      {error}
    </p>
  )}
</div>
```

### Live Regions

Announce dynamic changes:

```tsx
// Toast notification
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  className="fixed top-4 right-4"
>
  {toast && <p>{toast.message}</p>}
</div>

// Form error
<div
  role="alert"
  aria-live="assertive"
  className="p-4 bg-destructive/10"
>
  {formError}
</div>
```

### Screen Reader Only Content

Hide visually, show to screen readers:

```tsx
// Tailwind utility
<span className="sr-only">Loading, please wait</span>

// Custom CSS
<span className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0">
  3 notifications
</span>
```

## Forms

### Label Association

```tsx
// ✅ Method 1: htmlFor + id
<Label htmlFor="username">Username</Label>
<Input id="username" />

// ✅ Method 2: Wrapping
<label>
  Username
  <Input />
</label>

// ❌ Bad - no association
<div>Username</div>
<Input />
```

### Required Fields

```tsx
<Label htmlFor="email">
  Email <span className="text-destructive" aria-label="required">*</span>
</Label>
<Input
  id="email"
  type="email"
  required
  aria-required="true"
/>
```

### Error States

```tsx
<Input
  id="password"
  type="password"
  aria-invalid={!!error}
  aria-describedby={error ? "password-error" : undefined}
/>
{error && (
  <p id="password-error" className="text-sm text-destructive" role="alert">
    {error}
  </p>
)}
```

### Fieldsets

Group related fields:

```tsx
<fieldset className="space-y-4">
  <legend className="text-lg font-semibold">Shipping Address</legend>
  <Input label="Street" />
  <Input label="City" />
  <Input label="Postal Code" />
</fieldset>
```

## Interactive Components

### Buttons

```tsx
<Button
  disabled={isLoading}
  aria-busy={isLoading}
  aria-label={isLoading ? "Saving changes, please wait" : undefined}
>
  {isLoading ? "Saving..." : "Save"}
</Button>
```

### Toggle Buttons

```tsx
const [isLiked, setIsLiked] = useState(false);

<Button
  variant="ghost"
  size="icon"
  onClick={() => setIsLiked(!isLiked)}
  aria-pressed={isLiked}
  aria-label={isLiked ? "Unlike post" : "Like post"}
>
  <Heart className={isLiked ? "fill-current" : ""} />
</Button>
```

### Disclosure (Accordion)

```tsx
<div>
  <button
    onClick={() => setIsOpen(!isOpen)}
    aria-expanded={isOpen}
    aria-controls="content-1"
  >
    Section Title
  </button>
  <div
    id="content-1"
    hidden={!isOpen}
  >
    {content}
  </div>
</div>
```

### Tabs

```tsx
<div role="tablist" aria-label="Account settings">
  {tabs.map((tab, i) => (
    <button
      key={tab.id}
      role="tab"
      aria-selected={activeTab === i}
      aria-controls={`panel-${i}`}
      id={`tab-${i}`}
      onClick={() => setActiveTab(i)}
    >
      {tab.label}
    </button>
  ))}
</div>

{tabs.map((tab, i) => (
  <div
    key={tab.id}
    role="tabpanel"
    id={`panel-${i}`}
    aria-labelledby={`tab-${i}`}
    hidden={activeTab !== i}
  >
    {tab.content}
  </div>
))}
```

### Dialog/Modal

```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent
    role="dialog"
    aria-modal="true"
    aria-labelledby="dialog-title"
    aria-describedby="dialog-description"
  >
    <DialogHeader>
      <DialogTitle id="dialog-title">
        Confirm Delete
      </DialogTitle>
    </DialogHeader>
    <p id="dialog-description">
      Are you sure you want to delete this item? This action cannot be undone.
    </p>
    <div className="flex gap-2 justify-end">
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button variant="destructive" onClick={handleDelete}>
        Delete
      </Button>
    </div>
  </DialogContent>
</Dialog>
```

## Images

### Alternative Text

```tsx
// Informative image
<img
  src="/chart.png"
  alt="Sales increased 25% in Q4 compared to Q3"
/>

// Decorative image
<img
  src="/pattern.png"
  alt=""
  role="presentation"
/>

// Icon with adjacent text
<button>
  <Trash className="h-4 w-4" aria-hidden="true" />
  Delete
</button>

// Icon-only button
<button aria-label="Delete item">
  <Trash className="h-4 w-4" aria-hidden="true" />
</button>
```

## Color

### Don't Rely Solely on Color

```tsx
// ❌ Bad - color only
<span className="text-destructive">Error</span>

// ✅ Good - icon + color + text
<div className="flex items-center gap-2 text-destructive">
  <AlertCircle className="h-4 w-4" />
  <span>Error: Invalid email format</span>
</div>
```

## Testing Checklist

### Manual Testing

- [ ] Navigate entire site using only keyboard
- [ ] Test with screen reader (VoiceOver on Mac, NVDA on Windows)
- [ ] Zoom page to 200% and verify no content is cut off
- [ ] Test color contrast with browser tools
- [ ] Verify all interactive elements have focus indicators
- [ ] Check all images have appropriate alt text
- [ ] Verify forms can be completed with keyboard only
- [ ] Test modals trap focus correctly

### Automated Tools

```bash
# axe-core in tests
import { axe } from 'jest-axe';

test('has no accessibility violations', async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## Common Patterns by Component

### Navigation

```tsx
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/" aria-current={isHome ? "page" : undefined}>Home</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>
```

### Breadcrumbs

```tsx
<nav aria-label="Breadcrumb">
  <ol className="flex gap-2">
    <li><a href="/">Home</a></li>
    <li aria-hidden="true">/</li>
    <li><a href="/products">Products</a></li>
    <li aria-hidden="true">/</li>
    <li aria-current="page">Item Details</li>
  </ol>
</nav>
```

### Pagination

```tsx
<nav aria-label="Pagination">
  <ul className="flex gap-2">
    <li>
      <Button
        disabled={page === 1}
        aria-label="Go to previous page"
      >
        Previous
      </Button>
    </li>
    {pages.map(p => (
      <li key={p}>
        <Button
          variant={p === page ? "default" : "outline"}
          aria-label={`Go to page ${p}`}
          aria-current={p === page ? "page" : undefined}
        >
          {p}
        </Button>
      </li>
    ))}
    <li>
      <Button
        disabled={page === totalPages}
        aria-label="Go to next page"
      >
        Next
      </Button>
    </li>
  </ul>
</nav>
```

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [axe DevTools Browser Extension](https://www.deque.com/axe/devtools/)

## Related Patterns

- [Buttons](./buttons.md) - Button accessibility
- [Forms](./forms.md) - Form accessibility
- [Typography](./typography.md) - Text readability
- [Error Handling](./error-handling.md) - Accessible error messages
