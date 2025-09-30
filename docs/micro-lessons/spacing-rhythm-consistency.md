# Spacing Rhythm Consistency

## Context

When building UI components with design system tokens, maintain consistent spacing rhythm to avoid visual conflicts and improve readability.

## Problem Pattern

```jsx
// ❌ INCONSISTENT - Multiple spacing approaches in same component
<div className="space-y-md">  {/* 16px between items */}
  <h3 className="mb-lg">Title</h3>  {/* 24px after title */}
  <nav className="space-y-md">  {/* 16px between nav items */}
```

This creates uneven visual rhythm: 16px → 24px → 16px spacing pattern.

## Solution Pattern

```jsx
// ✅ CONSISTENT - Unified spacing approach
<div className="space-y-sm">  {/* 8px between items */}
  <h3 className="mb-md">Title</h3>  {/* 16px after title (2x base) */}
  <nav className="space-y-sm">  {/* 8px between nav items */}
```

Creates consistent rhythm: 8px → 16px → 8px with clear hierarchy.

## Design System Guidelines

### 1. Choose One Spacing Unit per Context

- **Small components**: Use `sm` (8px) as base unit
- **Medium sections**: Use `md` (16px) as base unit
- **Large layouts**: Use `lg` (24px) as base unit

### 2. Use Multipliers for Hierarchy

- **Same level**: Same spacing (e.g., `space-y-sm`)
- **Higher level**: 2x spacing (e.g., `mb-md` when using `space-y-sm`)
- **Section breaks**: 3x spacing (e.g., `mb-3xl`)

### 3. Consistent Application

Apply the same pattern across similar components:

```jsx
// Card pattern - use consistently
<div className="bg-card p-xl">
  <h3 className="mb-md">Title</h3>    {/* Always mb-md for card titles */}
  <nav className="space-y-sm">       {/* Always space-y-sm for nav items */}
```

## When This Pattern Helps

- Building card-based layouts
- Creating consistent navigation sections
- Maintaining visual hierarchy in content sections
- Ensuring responsive spacing scales proportionally

## Related Patterns

- Typography hierarchy with consistent line-height
- Grid systems with consistent gutters
- Component spacing with design tokens

## Detection

Look for mixed spacing patterns in same component:

- Different `space-y-*` classes in related elements
- Inconsistent `mb-*` values for similar content types
- Visual rhythm that feels "off" or uneven

## Tags

`design-system` `spacing` `typography` `consistency` `ui-components`
