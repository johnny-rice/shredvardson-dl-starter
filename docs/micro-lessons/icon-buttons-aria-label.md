---
UsedBy: 1
Severity: high
---

# Icon-Only Buttons Must Have aria-label

**Context.** CodeRabbit caught icon button rendering only "🔍" emoji with no accessible name, causing screen readers to announce "button" without context.

**Rule.** **Always add aria-label to buttons that contain only icons, emojis, or symbols - screen readers cannot announce visual-only content meaningfully.**

**Example.**
```tsx
// ❌ BAD: Icon button with no accessible name
<Button size="icon">🔍</Button>
// Screen reader announces: "button" (no context)

// ✅ GOOD: Icon button with descriptive aria-label
<Button size="icon" aria-label="Search">🔍</Button>
// Screen reader announces: "Search, button"

// ✅ ALSO GOOD: SVG icon with aria-label
<Button size="icon" aria-label="Close dialog">
  <X className="h-4 w-4" />
</Button>
```

**Guardrails.**
- Add aria-label to ALL icon-only buttons (emoji, SVG, icon fonts)
- Label should describe the action, not the icon ("Search" not "Magnifying glass")
- Test with screen reader (VoiceOver on Mac: Cmd+F5, NVDA on Windows)
- Visual text inside button doesn't need aria-label (already accessible)

**Tags.** accessibility,aria-label,buttons,icons,screen-readers,wcag,a11y,semantic-html
