# Architecture Overview

## Table of Contents

- [Stack Overview](#stack-overview)
- [Repository Structure](#repository-structure)
- [UI Framework Rules](#ui-framework-rules)
- [App Layout](#app-layout)
- [Development Architecture](#development-architecture)

## Stack Overview

### Core Technologies

- **Frontend**: Next.js 15 with App Router, React 19, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Build System**: Turborepo monorepo with workspace management
- **Styling**: Tailwind CSS with design tokens
- **UI Components**: shadcn/ui component library
- **Deployment**: Vercel with automatic preview deployments
- **Monitoring**: Sentry for error tracking and performance

### Development Tools

- **Package Manager**: pnpm with workspace support
- **Testing**: Vitest (unit), Playwright (E2E)
- **Linting**: ESLint with TypeScript rules
- **Type Checking**: Strict TypeScript configuration
- **CI/CD**: GitHub Actions with quality gates

## Repository Structure

```text
├── apps/
│   └── web/                 # Next.js application
│       ├── src/
│       │   ├── app/         # App Router pages and layouts
│       │   ├── components/  # React components
│       │   └── lib/         # Utilities and configurations
│       └── tests/           # E2E tests (Playwright)
│
├── packages/
│   ├── types/               # Shared TypeScript types
│   ├── ui/                  # Shared UI components
│   └── config/              # Shared configurations
│
├── docs/                    # Project documentation
│   ├── wiki/                # External LLM wiki
│   ├── constitution.md      # Governance and principles
│   └── recipes/             # Implementation guides
│
├── .claude/commands/        # AI workflow commands
├── specs/                   # Feature specifications
├── plans/                   # Implementation plans
└── tasks/                   # Development task breakdowns
```

### Workspace Organization

- **apps/**: Deployable applications (Next.js web app)
- **packages/**: Shared libraries and utilities
- **Turborepo**: Manages dependencies and build orchestration
- **TypeScript**: Strict typing across all workspaces

## UI Framework Rules

### Component Hierarchy

1. **shadcn/ui Components** (Primary)
   - Use for all standard UI patterns
   - Maintains design system consistency
   - Built-in accessibility features

2. **Custom Components** (Secondary)
   - Domain-specific business logic
   - Composed from shadcn/ui primitives
   - Project-specific patterns

3. **Third-party Components** (Rare)
   - Only when shadcn/ui insufficient
   - Must justify dependency addition
   - Security and bundle size review required

### Styling Rules

- **Tailwind CSS Only**: No custom CSS files
- **Design Tokens**: Use semantic CSS custom properties for theming
- **No Hardcoded Colors**: Use semantic tokens (e.g., `bg-primary`, not `bg-blue-600`)
- **Fluid Typography**: Use `text-fluid-*` classes for responsive text scaling
- **8pt Grid System**: All spacing multiples of 4px (`p-2`, `p-4`, `p-6`, `p-8`)
- **Responsive Design**: Mobile-first approach with fluid design
- **Dark Mode**: Automatic theme support via CSS custom properties

### Design System

The project uses a comprehensive design system built with **shadcn/ui conventions** and semantic tokens.

**Core Principles:**

- **Semantic tokens** - Abstract design decisions (e.g., `--primary` not `--blue-500`)
- **Fluid typography** - Responsive text scaling using CSS `clamp()` (320px-2560px viewports)
- **Motion design** - Framer Motion animations with `prefers-reduced-motion` support
- **Accessibility-first** - WCAG AA compliance, keyboard nav, ARIA labels

**Key Features:**

- Color tokens: `--primary`, `--secondary`, `--destructive`, `--muted`, `--accent`
- Typography: `text-fluid-xs` through `text-fluid-3xl` (7 scales)
- Spacing: 8pt grid (`gap-4`, `space-y-6`, `p-8`)
- Motion: `fadeIn`, `slideUp`, `scale`, `slideInRight` variants

**Documentation:** See [packages/ui/README.md](../../packages/ui/README.md) for complete token reference, usage examples, and component update workflow.

### Component Development Standards

All components must follow these standards:

#### 1. Use Class Variance Authority (CVA)

```tsx
import { cva } from 'class-variance-authority';

const buttonVariants = cva('base-classes', {
  variants: {
    variant: {
      default: 'bg-primary text-primary-foreground',
      secondary: 'bg-secondary text-secondary-foreground',
      ghost: 'bg-transparent hover:bg-accent',
    },
    size: {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2',
      lg: 'px-6 py-3 text-lg',
    },
  },
});
```

#### 2. Semantic Tokens Only

```tsx
// ✅ Correct - semantic tokens
<Button className="bg-primary text-primary-foreground">Primary</Button>

// ❌ Wrong - hardcoded colors
<Button className="bg-blue-600 text-white">Primary</Button>
```

#### 3. JSDoc Documentation

```tsx
/**
 * @usageGuidelines
 * - Only one primary button visible per screen
 * - Use destructive variant for irreversible actions
 *
 * @accessibilityConsiderations
 * - 4.5:1 contrast ratio (WCAG AA)
 * - Focus ring with 2px outline
 * - Keyboard navigation (Space/Enter)
 */
export function Button({ variant, children }: ButtonProps) {
  // ...
}
```

#### 4. Accessibility Requirements

- WCAG AA contrast ratios (4.5:1 minimum)
- Keyboard navigation support
- ARIA labels for icon-only buttons
- Focus indicators (2px outline + 2px offset)
- 44px minimum touch targets on mobile

#### 5. Testing Requirements

- Unit tests for all variants
- Interaction tests (clicks, hovers, keyboard)
- Accessibility tests with axe-core (E2E)
- Visual regression tests for UI changes

### Example Component Structure

```tsx
// ✅ Good: Uses shadcn/ui + semantic tokens
import { Button } from '@ui/components';

export function AnalyticsButton() {
  return (
    <Button className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]">
      View Analytics
    </Button>
  );
}

// ❌ Bad: Hardcoded styles, no design system
export function CustomButton() {
  return <button className="bg-blue-500 text-white px-4 py-2">Click Me</button>;
}
```

## App Layout

### Next.js App Router Structure

```text
apps/web/src/app/
├── (marketing)/           # Public marketing pages
│   └── page.tsx          # Landing page
├── (app)/                # Authenticated app area
│   ├── layout.tsx        # App-wide layout with providers
│   └── dashboard/        # Main dashboard routes
│       ├── page.tsx      # Dashboard home
│       └── analytics/    # Analytics feature
└── api/                  # API routes
    └── health/           # Health check endpoint
```

### Component Organization

```text
apps/web/src/components/
├── AnalyticsProvider.tsx  # Context providers
├── AnalyticsChart.tsx     # Feature-specific components
└── Header.tsx             # Layout components
```

### Utilities and Configuration

```text
apps/web/src/lib/
├── analytics.ts          # Feature logic
├── env.ts               # Environment validation
└── adapters/            # External service adapters
    └── sentry.ts        # Monitoring integration
```

## Development Architecture

### Dual-Lane System

- **Simple Lane**: Direct implementation for small changes (via `/dev:plan-feature`)
- **Spec-Driven Lane**: Structured planning for complex features (via `/specify` → `/plan` → `/tasks`)

### Quality Integration

- All code changes go through [Quality Gates](./WIKI-Quality-Gates.md)
- TypeScript strict mode enforced
- Comprehensive testing strategy (unit + E2E)
- Automated security scanning

### Feature Flag Architecture

- Environment-based feature toggles
- Example: `NEXT_PUBLIC_ENABLE_ANALYTICS=true`
- Safe rollout and instant disable capabilities

---

**Note:** Architecture balances rapid development velocity with security, quality, and maintainability.
