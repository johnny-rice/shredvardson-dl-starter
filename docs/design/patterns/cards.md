# Card Patterns

## Overview

Cards are flexible containers that group related content and actions. They provide clear boundaries and visual hierarchy for information.

## When to Use

- **Content grouping**: Related information that needs visual separation
- **Clickable items**: List items that navigate elsewhere
- **Feature highlights**: Marketing sections, pricing tiers
- **Dashboard widgets**: Metrics, charts, quick actions

## When NOT to Use

- **Single piece of content**: Use semantic HTML instead
- **Full-page layouts**: Use standard page structure
- **List items without actions**: Use semantic `<ul>` or `<ol>`

## Basic Card

```tsx
<Card className="p-6">
  <h3 className="text-xl font-semibold mb-2">Card Title</h3>
  <p className="text-muted-foreground">
    Card content with proper spacing and typography.
  </p>
</Card>
```

## Card Variants

### Content Card

```tsx
<Card className="p-6 space-y-4">
  <div className="space-y-2">
    <h3 className="text-xl font-semibold text-card-foreground">
      Content Title
    </h3>
    <p className="text-sm text-muted-foreground">
      Subtitle or metadata
    </p>
  </div>
  <p className="text-muted-foreground leading-relaxed">
    Main content goes here with comfortable line height
    and proper spacing between elements.
  </p>
  <div className="flex gap-2">
    <Button size="sm">Primary Action</Button>
    <Button size="sm" variant="outline">Secondary</Button>
  </div>
</Card>
```

### Interactive Card (Clickable)

```tsx
<Card className="p-6 hover:border-primary transition-colors cursor-pointer">
  <div className="space-y-2">
    <h3 className="text-lg font-semibold text-card-foreground">
      Clickable Card
    </h3>
    <p className="text-sm text-muted-foreground">
      Click anywhere to navigate
    </p>
  </div>
</Card>
```

### Pricing Card

```tsx
<Card className="p-6 space-y-6">
  <div className="space-y-2">
    <h3 className="text-2xl font-bold text-card-foreground">Pro Plan</h3>
    <div className="flex items-baseline gap-1">
      <span className="text-4xl font-bold">$29</span>
      <span className="text-muted-foreground">/month</span>
    </div>
  </div>

  <ul className="space-y-2">
    <li className="flex gap-2">
      <span className="text-primary">✓</span>
      <span>Unlimited projects</span>
    </li>
    <li className="flex gap-2">
      <span className="text-primary">✓</span>
      <span>Priority support</span>
    </li>
    <li className="flex gap-2">
      <span className="text-primary">✓</span>
      <span>Advanced analytics</span>
    </li>
  </ul>

  <Button className="w-full">Get Started</Button>
</Card>
```

### Metric Card

```tsx
<Card className="p-6 space-y-2">
  <p className="text-sm text-muted-foreground">Total Users</p>
  <p className="text-3xl font-bold text-card-foreground">12,847</p>
  <p className="text-sm text-green-600">
    ↑ 12% from last month
  </p>
</Card>
```

### Feature Card

```tsx
<Card className="p-6 space-y-4">
  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
    <span className="text-2xl">⚡</span>
  </div>
  <div className="space-y-2">
    <h3 className="text-xl font-semibold text-card-foreground">
      Lightning Fast
    </h3>
    <p className="text-muted-foreground">
      Optimized performance for instant loading times.
    </p>
  </div>
</Card>
```

## Card Layouts

### Single Card

```tsx
<div className="max-w-md mx-auto">
  <Card className="p-6">
    {/* Content */}
  </Card>
</div>
```

### Card Grid (2 columns)

```tsx
<div className="grid md:grid-cols-2 gap-4">
  <Card className="p-6">{/* Card 1 */}</Card>
  <Card className="p-6">{/* Card 2 */}</Card>
</div>
```

### Card Grid (3 columns)

```tsx
<div className="grid md:grid-cols-3 gap-6">
  <Card className="p-6">{/* Card 1 */}</Card>
  <Card className="p-6">{/* Card 2 */}</Card>
  <Card className="p-6">{/* Card 3 */}</Card>
</div>
```

### Card List (Vertical)

```tsx
<div className="space-y-4">
  <Card className="p-6">{/* Card 1 */}</Card>
  <Card className="p-6">{/* Card 2 */}</Card>
  <Card className="p-6">{/* Card 3 */}</Card>
</div>
```

## Spacing

### Internal Spacing
- **Padding**: Use `p-6` (24px) for standard cards
- **Content spacing**: Use `space-y-4` (16px) for internal sections
- **Small cards**: Use `p-4` (16px) for compact layouts

### External Spacing
- **Gap in grids**: Use `gap-4` (16px) or `gap-6` (24px)
- **Vertical spacing**: Use `space-y-4` (16px) for stacked cards

## Accessibility

### Minimum Requirements (WCAG AA)
- ✅ Border contrast ≥ 3:1 against background
- ✅ Text contrast ≥ 4.5:1 for normal text
- ✅ Focus indicator for interactive cards
- ✅ Semantic HTML structure

### Interactive Cards
Use proper button/link semantics:

```tsx
{/* Card as link */}
<Link href="/details" className="block">
  <Card className="p-6 hover:border-primary transition-colors">
    {/* Content */}
  </Card>
</Link>

{/* Card with internal action */}
<Card className="p-6">
  <h3>Title</h3>
  <p>Content</p>
  <Button>Action</Button>
</Card>
```

### Keyboard Navigation
- Tab: Focus interactive elements within card
- Enter/Space: Activate focused element

## States

### Default
Normal resting state with border

### Hover (Interactive Cards)
Highlight border color change

```tsx
<Card className="hover:border-primary transition-colors">
  {/* Content */}
</Card>
```

### Focus (Interactive Cards)
Visible focus ring

```tsx
<Card className="focus-within:ring-2 focus-within:ring-ring">
  {/* Content */}
</Card>
```

### Loading
Skeleton or spinner state

```tsx
<Card className="p-6">
  {isLoading ? (
    <div className="space-y-3">
      <div className="h-4 bg-muted rounded animate-pulse" />
      <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
    </div>
  ) : (
    <div>{content}</div>
  )}
</Card>
```

## Examples

### Dashboard Card

```tsx
<Card className="p-6 space-y-4">
  <div className="flex items-center justify-between">
    <h3 className="text-lg font-semibold">Recent Activity</h3>
    <Button variant="ghost" size="sm">View All</Button>
  </div>
  <div className="space-y-2">
    {activities.map(activity => (
      <div key={activity.id} className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/10" />
        <div className="flex-1">
          <p className="text-sm font-medium">{activity.title}</p>
          <p className="text-xs text-muted-foreground">{activity.time}</p>
        </div>
      </div>
    ))}
  </div>
</Card>
```

### Settings Card

```tsx
<Card className="p-6 space-y-4">
  <div className="space-y-2">
    <h3 className="text-lg font-semibold text-card-foreground">
      Email Notifications
    </h3>
    <p className="text-sm text-muted-foreground">
      Manage your email preferences
    </p>
  </div>
  <div className="space-y-3">
    <label className="flex items-center gap-2">
      <input type="checkbox" defaultChecked />
      <span className="text-sm">Weekly summary</span>
    </label>
    <label className="flex items-center gap-2">
      <input type="checkbox" />
      <span className="text-sm">Product updates</span>
    </label>
  </div>
</Card>
```

### Empty State Card

```tsx
<Card className="p-12 text-center space-y-4">
  <div className="text-4xl">📭</div>
  <div className="space-y-2">
    <h3 className="text-xl font-semibold text-card-foreground">
      No items yet
    </h3>
    <p className="text-muted-foreground">
      Get started by creating your first item
    </p>
  </div>
  <Button>Create Item</Button>
</Card>
```

## Token Reference

Cards use design system tokens:

- `bg-card` → Card background color
- `text-card-foreground` → Card text color
- `border-border` → Card border color
- Card automatically inherits theme (light/dark)

## Related Patterns

- [Buttons](./buttons.md) - Card actions
- [Typography](./typography.md) - Card content hierarchy
- [Layout](./layout.md) - Card grid patterns
