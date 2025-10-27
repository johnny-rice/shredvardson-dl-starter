# Typography Patterns

## Overview

Typography establishes visual hierarchy, improves readability, and reinforces brand personality. Consistent typography patterns create a cohesive user experience.

## Type Scale

### Headings

```tsx
<h1 className="text-4xl md:text-5xl font-bold">Heading 1</h1>
<h2 className="text-3xl md:text-4xl font-semibold">Heading 2</h2>
<h3 className="text-2xl md:text-3xl font-semibold">Heading 3</h3>
<h4 className="text-xl md:text-2xl font-semibold">Heading 4</h4>
<h5 className="text-lg md:text-xl font-semibold">Heading 5</h5>
<h6 className="text-base md:text-lg font-semibold">Heading 6</h6>
```

### Body Text

```tsx
<p className="text-base">Default paragraph text (16px)</p>
<p className="text-lg">Large paragraph text (18px)</p>
<p className="text-sm">Small text for captions (14px)</p>
<p className="text-xs">Extra small for metadata (12px)</p>
```

### Font Weights

- **bold** (700): Primary headings, emphasis
- **semibold** (600): Secondary headings
- **medium** (500): Buttons, labels, UI elements
- **normal** (400): Body text, default

## Semantic Colors

### Foreground (Text Colors)

```tsx
<p className="text-foreground">Primary text color</p>
<p className="text-muted-foreground">Secondary/muted text</p>
<p className="text-primary">Brand/link color</p>
<p className="text-destructive">Error/warning text</p>
```

### Usage Guidelines

| Token                   | Use Case              | Contrast Ratio |
| ----------------------- | --------------------- | -------------- |
| `text-foreground`       | Body text, headings   | ≥ 4.5:1 (AA)   |
| `text-muted-foreground` | Helper text, captions | ≥ 4.5:1 (AA)   |
| `text-primary`          | Links, brand elements | ≥ 4.5:1 (AA)   |
| `text-destructive`      | Errors, warnings      | ≥ 4.5:1 (AA)   |

## Line Height

```tsx
<p className="leading-none">No line height (1.0)</p>
<p className="leading-tight">Tight line height (1.25) - Headings</p>
<p className="leading-normal">Normal line height (1.5) - Body text</p>
<p className="leading-relaxed">Relaxed line height (1.625) - Long-form</p>
```

### Recommendations

- **Headings**: `leading-tight` (1.25)
- **Body text**: `leading-normal` (1.5)
- **Long-form**: `leading-relaxed` (1.625)

## Reading Width

Optimal line length: 50-75 characters per line

```tsx
<article className="max-w-prose">
  <p>This paragraph will maintain optimal line length for comfortable reading across devices.</p>
</article>
```

## Hierarchy Patterns

### Page Title with Description

```tsx
<header className="space-y-2 mb-8">
  <h1 className="text-4xl font-bold text-foreground">Page Title</h1>
  <p className="text-xl text-muted-foreground">Brief description or subtitle</p>
</header>
```

### Section Header

```tsx
<div className="space-y-2 mb-6">
  <h2 className="text-3xl font-semibold text-foreground">Section Title</h2>
  <p className="text-muted-foreground">Section description</p>
</div>
```

### Card Header

```tsx
<div className="space-y-1">
  <h3 className="text-xl font-semibold text-card-foreground">Card Title</h3>
  <p className="text-sm text-muted-foreground">Card subtitle or metadata</p>
</div>
```

## Lists

### Unordered List

```tsx
<ul className="space-y-2 list-disc list-inside">
  <li className="text-foreground">First item</li>
  <li className="text-foreground">Second item</li>
  <li className="text-foreground">Third item</li>
</ul>
```

### Ordered List

```tsx
<ol className="space-y-2 list-decimal list-inside">
  <li className="text-foreground">First step</li>
  <li className="text-foreground">Second step</li>
  <li className="text-foreground">Third step</li>
</ol>
```

### Feature List (No Bullets)

```tsx
<ul className="space-y-2">
  <li className="flex gap-2">
    <span className="text-primary">✓</span>
    <span className="text-foreground">Feature one</span>
  </li>
  <li className="flex gap-2">
    <span className="text-primary">✓</span>
    <span className="text-foreground">Feature two</span>
  </li>
</ul>
```

## Emphasis

### Bold

```tsx
<p>
  This is <strong className="font-semibold">important text</strong> in a sentence.
</p>
```

### Italic

```tsx
<p>
  This is <em className="italic">emphasized text</em> in a sentence.
</p>
```

### Inline Code

```tsx
<p>
  Use the <code className="px-1 py-0.5 rounded bg-muted text-sm font-mono">className</code> prop.
</p>
```

## Long-Form Content

### Article Typography

```tsx
<article className="prose max-w-prose mx-auto">
  <h1 className="text-4xl font-bold mb-4">Article Title</h1>

  <p className="text-lg text-muted-foreground mb-8">Published on January 23, 2025</p>

  <div className="space-y-4 leading-relaxed">
    <p className="text-foreground">First paragraph with comfortable line height and spacing.</p>

    <h2 className="text-2xl font-semibold mt-8 mb-4">Section Heading</h2>

    <p className="text-foreground">Paragraph after heading with proper spacing.</p>

    <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">
      This is a blockquote with visual emphasis.
    </blockquote>
  </div>
</article>
```

## Responsive Typography

```tsx
{
  /* Mobile: 2xl, Desktop: 4xl */
}
<h1 className="text-2xl md:text-4xl font-bold">Responsive Heading</h1>;

{
  /* Mobile: base, Desktop: lg */
}
<p className="text-base md:text-lg">Responsive paragraph text</p>;
```

## Accessibility

### Minimum Requirements (WCAG AA)

- ✅ Body text: 16px minimum (1rem)
- ✅ Contrast ratio: ≥ 4.5:1 for normal text
- ✅ Contrast ratio: ≥ 3:1 for large text (18px+, 14px+ bold)
- ✅ Line height: ≥ 1.5 for body text
- ✅ Paragraph spacing: ≥ 2x font size
- ✅ Letter spacing: Adjustable (respect user preferences)

### Font Size Guidelines

| Size             | Use Case          | Contrast Required |
| ---------------- | ----------------- | ----------------- |
| 12px (text-xs)   | Metadata only     | 4.5:1             |
| 14px (text-sm)   | Captions, helpers | 4.5:1             |
| 16px (text-base) | Body text         | 4.5:1             |
| 18px+            | Large text        | 3:1               |
| 14px+ bold       | Large text        | 3:1               |

## Copy Guidelines

### Concise

❌ "Click on this button to proceed to the next step"
✅ "Continue"

### Scannable

Use headings, short paragraphs, bullet points

### Actionable

❌ "There was an error"
✅ "Email address is invalid. Check for typos."

### Empathetic

❌ "Invalid input"
✅ "We couldn't find that email. Try another."

## Token Reference

Typography uses semantic design tokens:

- `text-foreground` → Primary text color
- `text-muted-foreground` → Secondary/helper text
- `text-primary` → Brand/link color
- `text-destructive` → Error text
- `font-sans` → Body font family
- `font-mono` → Monospace font family

## Related Patterns

- [Buttons](./buttons.md) - Button text guidelines
- [Forms](./forms.md) - Label and helper text
- [Error Handling](./error-handling.md) - Error message copy
