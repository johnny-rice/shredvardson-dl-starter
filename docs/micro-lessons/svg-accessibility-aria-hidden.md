---
UsedBy: 0
Severity: normal
---

# SVG Accessibility: Use aria-hidden NOT title for Decorative Icons

**Context.** CodeRabbit flagged redundant `<title>` elements inside SVGs marked with `aria-hidden="true"`. When `aria-hidden="true"` is set, assistive technologies ignore the entire element including any title, making the title serve no purpose.

**Rule.** **For decorative SVGs (icons next to visible text), use `aria-hidden="true"` only - do NOT add `<title>` elements as they are redundant and ignored by screen readers.**

**Example.**

```tsx
// ❌ BAD: Redundant title in aria-hidden SVG
<Link href="/design/tokens">
  <svg aria-hidden="true">
    <title>Palette icon</title>  {/* Ignored! */}
    <path d="..." />
  </svg>
  Browse Tokens  {/* This text is what screen readers announce */}
</Link>

// ✅ GOOD: aria-hidden decorative icon, visible text provides context
<Link href="/design/tokens">
  <svg aria-hidden="true">
    <path d="..." />
  </svg>
  Browse Tokens
</Link>

// ✅ GOOD: Standalone icon (no visible text) needs title + role
<button onClick={handleCopy}>
  <svg role="img">
    <title>Copy to clipboard</title>
    <path d="..." />
  </svg>
</button>
```

**Guardrails.**

- If SVG is next to visible text (button label, link text), use `aria-hidden="true"` with no title
- If SVG is the only content (icon-only button), use `role="img"` + `<title>` OR `aria-label` on parent
- Never combine `aria-hidden="true"` with `<title>` - the title will be ignored

**Tags.** svg,accessibility,aria-hidden,a11y,screen-reader,decorative-icons
