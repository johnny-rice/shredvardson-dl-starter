---
id: SPEC-20250929-design-system-core-v2
type: spec
issue: 74
parentId: ''
links: []
source: https://github.com/Shredvardson/dl-starter/issues/74
---

# Design System Core (Phase 1) — Feature Specification

## Problem & Goal

### Problem

DL Starter currently lacks a unified design system foundation, leading to:

- Inconsistent UI patterns across components and future applications
- Hardcoded colors and styling values scattered throughout the codebase
- No systematic approach to theming (light/dark mode)
- Duplicated styling logic without a single source of truth
- Difficulty maintaining visual consistency as the project scales

### Goal

Establish a minimal, production-ready design system foundation that ensures every future UI component is consistent by default through:

- Single source of truth for design tokens via CSS variables
- Shared Tailwind configuration across the monorepo
- Core shadcn/ui primitives with type-safe variants
- Seamless dark mode switching without FOUC (Flash of Unstyled Content)

## Scope & Non-Goals

### In Scope (Phase 1)

- **Token System**: CSS variables for colors, spacing, typography, and border radius
- **Shared Config**: `packages/tailwind-config` preset consumed across apps
- **Core Primitives**: 6 shadcn components (Button, Input, Label, Select, Card, Dialog)
- **Theme Infrastructure**: next-themes integration with FOUC prevention
- **Proof of Concept**: Example page demonstrating all primitives in both themes

### Non-Goals (Future Phases)

- Storybook integration and visual regression testing (Phase 2+)
- Composite/business components beyond primitives (Phase 3)
- Supabase UI flow integration (Phase 4)
- Advanced accessibility testing with Playwright/Axe
- Complex animation or motion design systems

## Proposed Solution (High-Level)

### Architecture Overview

```text
packages/
  tailwind-config/
    src/preset.ts        # Export dlStarterPreset
    index.ts            # Re-export
  ui/
    src/components/ui/   # shadcn primitives
    src/index.ts        # Barrel exports
    styles/tokens.css   # CSS variable definitions

apps/
  web/
    src/app/
      globals.css        # Token imports
      layout.tsx         # ThemeProvider
      example/page.tsx   # Showcase
```

### Technical Approach

1. **Centralized Tokens**: CSS variables in `:root` and `.dark` selectors
2. **Shared Preset**: Tailwind configuration mapping utilities to CSS variables
3. **Type-Safe Components**: CVA (class-variance-authority) for component variants
4. **Theme Management**: next-themes with class-based dark mode strategy
5. **Monorepo Integration**: Proper content paths for Tailwind purging across packages

## Input/Output Examples

### Token Definition Input

```css
/* apps/web/src/app/globals.css */
:root {
  --background: 210 20% 98%;
  --foreground: 210 10% 18%;
  --primary: 222 85% 55%;
  --radius: 0.5rem;
}

.dark {
  --background: 210 15% 10%;
  --foreground: 0 0% 98%;
  --primary: 222 75% 65%;
}
```

### Preset Configuration Output

```typescript
// packages/tailwind-config/src/preset.ts
export const dlStarterPreset = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
};
```

### Component Usage Output

```tsx
// packages/ui/src/components/ui/button.tsx
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);
```

### Theme Provider Integration

```tsx
// apps/web/src/app/layout.tsx
import { ThemeProvider } from 'next-themes';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(font.className)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Example Page Output

```tsx
// apps/web/src/app/example/page.tsx
import { Button, Input, Select, Card, Dialog } from '@dl-starter/ui';
import { ThemeToggle } from '@/components/theme-toggle';

export default function ExamplePage() {
  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Design System Showcase</h1>
        <ThemeToggle />
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <Button>Default Button</Button>
          <Button variant="outline">Outline Button</Button>
          <Button disabled>Disabled Button</Button>
          <Input placeholder="Type something..." />
          <Select>
            <option>Select an option</option>
          </Select>
        </div>
      </Card>
    </div>
  );
}
```

## Risks, Dependencies & Open Questions

### Technical Risks

- **Tailwind Purging Issues**: Classes from `packages/ui` might be purged if content paths are incorrect
  - _Mitigation_: Explicit verification in DoD that classes are present in build
- **FOUC on Theme Switch**: Theme changes could cause layout flashes
  - _Mitigation_: Proper next-themes configuration with suppressHydrationWarning
- **Token Drift**: Developers might introduce hardcoded colors over time
  - _Mitigation_: Clear guidelines and future lint rules

### Dependencies

- **shadcn/ui CLI**: Required for component generation and monorepo setup
- **next-themes**: Theme management and class switching
- **class-variance-authority**: Type-safe component variants
- **Tailwind CSS**: Core styling framework
- **existing token system**: Build upon current `packages/ui/styles/tokens.css`

### Open Questions

1. **Font Loading**: How should we handle Geist font loading across the monorepo?
2. **Component Versioning**: How will we handle breaking changes to primitives?
3. **Token Naming**: Should we align with shadcn standard tokens or keep custom naming?
4. **Build Performance**: Will shared Tailwind config impact build times?
5. **Future Extensibility**: How easily can new apps consume this design system?

### Validation Requirements

- All 6 primitives must render correctly in both light and dark themes
- Dialog component must support keyboard navigation (ESC to close, focus management)
- Theme switching must occur without page refresh or FOUC
- Build process must succeed with `pnpm -w build && pnpm -w lint && pnpm -w typecheck`
- Import paths `@dl-starter/ui` must resolve correctly across monorepo

### Success Criteria

- Zero hardcoded color values in component implementations
- Sub-100ms theme switching performance
- 100% component state coverage in example showcase
- Clean TypeScript compilation across entire monorepo
- LLM-friendly component APIs with semantic token usage
