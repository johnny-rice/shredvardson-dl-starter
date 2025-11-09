---
UsedBy: 0
Severity: high
---

# Accessibility-First Example Files Teach Best Practices

**Context.** CodeRabbit bot flagged missing `aria-describedby`, improper disabled link patterns, and checkboxes without semantic labels in UI component example files. These were educational opportunities, not just bugs.

**Rule.** **Example and demo files should demonstrate accessibility best practices (aria attributes, semantic HTML, proper associations) as primary teaching tools - never sacrifice accessibility for "simplicity" since examples shape how developers build production code.**

**Example.**

```tsx
// Bad: Simple but teaches wrong pattern
<span className="text-sm">Dark Mode</span>
<input type="checkbox" className="h-4 w-4" />

// Good: Accessible example teaches proper associations
<label htmlFor="dark-mode" className="text-sm">
  Dark Mode
</label>
<input id="dark-mode" type="checkbox" className="h-4 w-4" />
```

```tsx
// Bad: Helper text with no programmatic association
<Input id="username" placeholder="@username" />
<p className="text-xs">Choose a unique username</p>

// Good: Screen readers announce the helper text
<Input
  id="username"
  placeholder="@username"
  aria-describedby="helper-text"
/>
<p id="helper-text" className="text-xs">
  Choose a unique username
</p>
```

**Guardrails.**

- All form inputs must have associated labels (via `htmlFor`/`id` or wrapping)
- Helper text and error messages must use `aria-describedby` to programmatically link to inputs
- Disabled interactive elements need `aria-disabled`, `tabIndex={-1}`, and `preventDefault` (not just CSS)
- Use semantic HTML (`<nav>`, `<fieldset>`, `<legend>`) to demonstrate proper structure
- Example files are documentation - prioritize teaching value over brevity

**Tags.** #accessibility #examples #documentation #aria #semantic-html #wcag #education
