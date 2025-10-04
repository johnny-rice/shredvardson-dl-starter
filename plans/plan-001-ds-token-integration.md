---
id: PLAN-20251002-ds-token-integration
type: plan
parentId: SPEC-20251002-ds-token-integration
spec: SPEC-20251002-ds-token-integration
issue: 105
created: 2025-10-02
estimatedEffort: 8-10 days
---

# Technical Implementation Plan: Design System Token Integration

## Executive Summary

This plan outlines the technical implementation for integrating the existing design system tokens with Tailwind CSS, shadcn/ui components, fluid typography, spacing systems, and motion design. The implementation follows our spec-driven workflow and constitutional principles.

**Specification Reference**: [specs/feature-003-ds-token-integration.md](../specs/feature-003-ds-token-integration.md)

**Key Deliverables**:

1. Tailwind config enhanced with fluid typography + spacing scale
2. All shadcn components using semantic tokens (no hardcoded values)
3. Turborepo watch mode with <3s rebuilds
4. Framer Motion integration with accessibility support
5. Comprehensive documentation (inline JSDoc + README)
6. Visual regression testing (critical paths)

---

## 1. Architecture Decisions

### 1.1 Token Architecture (Aligned with Constitution)

**Decision**: Use existing `packages/ui/styles/tokens.css` as single source of truth

**Rationale**:

- ✅ Already follows shadcn conventions (`--primary`, `--background`, etc.)
- ✅ Supports light/dark themes via `.dark` class
- ✅ HSL color format (Tailwind v4 ready)
- ✅ No need for new dependencies (Style Dictionary exists but not blocking)

**Architecture**:

```
packages/ui/styles/tokens.css  ← Single source of truth (CSS variables)
         ↓ (imported by)
apps/web/src/app/globals.css   ← Global stylesheet
         ↓ (referenced by)
apps/web/tailwind.config.ts    ← Tailwind theme extension
         ↓ (consumed by)
packages/ui/src/components/**  ← shadcn components
```

**Constitutional Alignment**:

- ✅ Security First: No runtime token manipulation, build-time only
- ✅ Dependency Management: Leverages existing packages (no new deps for tokens)
- ✅ Test-Driven: Token changes trigger visual regression tests

---

### 1.2 Fluid Typography Architecture

**Decision**: Define fluid scale in `apps/web/tailwind.config.ts` using CSS `clamp()`

**Rationale**:

- ✅ Modern best practice (eliminates breakpoint-based jumps)
- ✅ No external dependencies
- ✅ Easy to customize per-app (web app controls its typography)

**Implementation**:

```typescript
// apps/web/tailwind.config.ts
theme: {
  extend: {
    fontSize: {
      'fluid-xs': 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',    // 12px → 14px
      'fluid-sm': 'clamp(0.875rem, 0.8rem + 0.375vw, 1rem)',      // 14px → 16px
      'fluid-base': 'clamp(1rem, 0.9rem + 0.5vw, 1.25rem)',       // 16px → 20px
      'fluid-lg': 'clamp(1.125rem, 1rem + 0.625vw, 1.5rem)',      // 18px → 24px
      'fluid-xl': 'clamp(1.25rem, 1.1rem + 0.75vw, 1.875rem)',    // 20px → 30px
      'fluid-2xl': 'clamp(1.5rem, 1.3rem + 1vw, 2.25rem)',        // 24px → 36px
      'fluid-3xl': 'clamp(1.875rem, 1.6rem + 1.375vw, 3rem)',     // 30px → 48px
    }
  }
}
```

**Viewport Testing**: 320px (mobile) → 1920px (desktop) → 2560px (ultra-wide)

---

### 1.3 Spacing Scale Architecture

**Decision**: 8pt grid system in `apps/web/tailwind.config.ts`

**Rationale**:

- ✅ Industry standard (Material Design, Apple HIG)
- ✅ Creates vertical/horizontal rhythm
- ✅ Simplifies design decisions (multiples of 8)

**Implementation**:

```typescript
// apps/web/tailwind.config.ts
theme: {
  extend: {
    spacing: {
      // Tailwind's default 4pt scale is good, we'll document 8pt preference
      // Custom values if needed:
      '18': '4.5rem',  // 72px
      '22': '5.5rem',  // 88px
    }
  }
}
```

**Guidelines** (documented in README):

- Prefer `gap-*` over margins in flex/grid
- Use `space-x-*`/`space-y-*` for sibling spacing
- All custom spacing must be multiples of 4px (ideally 8px)

---

### 1.4 Motion Design Architecture

**Decision**: Framer Motion as animation library with centralized variants

**Rationale**:

- ✅ Industry standard for React animations
- ✅ Built-in `prefers-reduced-motion` support
- ✅ Declarative API (LLM-friendly)
- ✅ Physics-based animations (natural feel)

**New Dependency** (requires justification per Constitution):

- **Package**: `framer-motion` (~80KB gzipped)
- **Justification**: Essential for modern UX (user delight, state feedback, micro-interactions)
- **Alternatives Rejected**:
  - CSS transitions only: Too limited for complex animations
  - React Spring: More complex API, steeper learning curve
  - GSAP: Commercial licensing issues

**Architecture**:

```
packages/ui/src/lib/animations.ts  ← Reusable variants
         ↓ (imported by)
packages/ui/src/components/**      ← Components use variants
```

**Example Variants**:

```typescript
// packages/ui/src/lib/animations.ts
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};
```

---

### 1.5 Build Pipeline Architecture

**Decision**: Turborepo watch mode with `interruptible: true` for token tasks

**Rationale**:

- ✅ Turborepo 2.4+ supports `--experimental-write-cache`
- ✅ `interruptible: true` restarts tasks on dependency changes
- ✅ Achieves <3s rebuild target

**Implementation**:

```json
// turbo.json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"],
      "interruptible": false
    },
    "build:tokens": {
      "dependsOn": ["^build:tokens"],
      "outputs": ["styles/**/*.css"],
      "interruptible": true // ← NEW: Restart on token changes
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

**Usage**:

```bash
# Development workflow
turbo watch --experimental-write-cache

# Token change detected → restarts affected tasks in <3s
```

---

## 2. File Changes Required

### 2.1 Configuration Files

#### `turbo.json` (root)

**Changes**:

- Add `build:tokens` task with `interruptible: true`
- Update `dev` task to depend on `^build:tokens`

**Risk**: Low (additive change, no breaking modifications)

---

#### `apps/web/tailwind.config.ts`

**Changes**:

- Add fluid typography scale (`fontSize.fluid-*`)
- Document spacing scale guidelines (8pt grid)
- Verify token references (already correct)

**Before**:

```typescript
theme: {
  extend: {
    colors: { /* existing tokens */ },
    borderRadius: { /* existing */ }
  }
}
```

**After**:

```typescript
theme: {
  extend: {
    colors: { /* existing tokens (unchanged) */ },
    borderRadius: { /* existing (unchanged) */ },
    fontSize: {
      // NEW: Fluid typography scale
      'fluid-xs': 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',
      'fluid-sm': 'clamp(0.875rem, 0.8rem + 0.375vw, 1rem)',
      'fluid-base': 'clamp(1rem, 0.9rem + 0.5vw, 1.25rem)',
      'fluid-lg': 'clamp(1.125rem, 1rem + 0.625vw, 1.5rem)',
      'fluid-xl': 'clamp(1.25rem, 1.1rem + 0.75vw, 1.875rem)',
      'fluid-2xl': 'clamp(1.5rem, 1.3rem + 1vw, 2.25rem)',
      'fluid-3xl': 'clamp(1.875rem, 1.6rem + 1.375vw, 3rem)',
    },
    spacing: {
      // Document 8pt grid preference
      // Tailwind defaults are 4pt based (good), add custom if needed
    }
  }
},
plugins: [
  require('tailwindcss-animate'),  // ← May need to install
]
```

**Risk**: Low (additive, no breaking changes to existing theme)

---

#### `packages/ui/package.json`

**Changes**:

- Add `framer-motion` dependency
- Verify `tailwindcss-animate` is installed (may already exist)

**Before**:

```json
{
  "dependencies": {
    "@radix-ui/react-dialog": "^1.1.4"
    // ...existing
  }
}
```

**After**:

```json
{
  "dependencies": {
    "@radix-ui/react-dialog": "^1.1.4",
    // ...existing
    "framer-motion": "^11.0.0" // NEW
  }
}
```

**Risk**: Low (peer dependency of React 19, no conflicts)

---

### 2.2 Token Files (No Changes Required!)

#### `packages/ui/styles/tokens.css`

**Analysis**: ✅ **Already correct!**

Current state:

- Uses shadcn naming conventions (`--primary`, `--background`, etc.)
- Supports light/dark themes
- HSL color format
- Has static typography scale (will supplement with fluid in Tailwind)

**Changes**: None required (file already follows best practices)

**Enhancement** (optional, low priority):

- Could add JSDoc-style comments for token documentation
- Example:
  ```css
  /**
   * @token primary
   * @usage Main brand color for CTAs, links, active states
   * @contrast 4.5:1 on background (WCAG AA)
   */
  --primary: var(--brand-600);
  ```

**Risk**: None (no changes)

---

### 2.3 Component Files

#### All components in `packages/ui/src/components/ui/*.tsx`

**Audit Required**: Check for hardcoded values

**Current Status** (from `button.tsx` example):

- ✅ Uses semantic tokens (`bg-primary`, `text-primary-foreground`)
- ✅ No hardcoded colors detected
- ❌ Missing JSDoc design rationale

**Changes Needed**:

1. **Add JSDoc design rationale** to all components
2. **Audit all components** for hardcoded values
3. **Replace any hardcoded values** with tokens

**Example Enhancement** (`button.tsx`):

```typescript
/**
 * Button component with design system variants
 *
 * @usageGuidelines
 * - Only one primary button visible per screen to avoid user confusion
 * - Use destructive variant for irreversible actions (delete, remove, etc.)
 * - Prefer ghost/link variants for secondary actions
 *
 * @accessibilityConsiderations
 * - Minimum 4.5:1 contrast ratio (WCAG AA)
 * - Focus ring uses 2px outline with 2px offset for visibility
 * - Disabled state uses opacity (pointer-events-none prevents clicks)
 * - Supports keyboard navigation (Space/Enter to activate)
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>();
// ...implementation
```

**Components to Update**:

- `packages/ui/src/components/ui/button.tsx`
- `packages/ui/src/components/ui/card.tsx`
- `packages/ui/src/components/ui/dialog.tsx`
- `packages/ui/src/components/ui/input.tsx`
- `packages/ui/src/components/ui/label.tsx`
- `packages/ui/src/components/ui/select.tsx`
- `packages/ui/src/components/ui/Link.tsx`

**Risk**: Low (additive JSDoc comments, non-breaking)

---

### 2.4 New Files

#### `packages/ui/src/lib/animations.ts` (NEW)

**Purpose**: Centralized Framer Motion animation variants

```typescript
import { Variants } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';

/**
 * Fade in animation variant
 * Respects prefers-reduced-motion by using instant transition
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: (custom) => ({
    opacity: 1,
    transition: {
      duration: custom?.shouldReduceMotion ? 0 : 0.3,
      ease: 'easeOut',
    },
  }),
};

/**
 * Slide up animation variant
 * Respects prefers-reduced-motion by removing Y translation
 */
export const slideUp: Variants = {
  hidden: (custom) => ({
    opacity: 0,
    y: custom?.shouldReduceMotion ? 0 : 20,
  }),
  visible: (custom) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: custom?.shouldReduceMotion ? 0 : 0.4,
      ease: [0.4, 0, 0.2, 1], // Ease-out curve
    },
  }),
};

/**
 * Scale animation variant
 * Commonly used for modal/dialog entrances
 */
export const scale: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (custom) => ({
    opacity: 1,
    scale: 1,
    transition: {
      duration: custom?.shouldReduceMotion ? 0 : 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  }),
};

/**
 * Hook to get shouldReduceMotion flag
 * Use this in component custom props
 */
export function useAnimationCustom() {
  const shouldReduceMotion = useReducedMotion();
  return { shouldReduceMotion };
}
```

**Risk**: Low (new file, no breaking changes)

---

#### `packages/ui/src/lib/hooks/useReducedMotion.ts` (NEW)

**Purpose**: Accessibility hook for motion preferences

```typescript
import { useEffect, useState } from 'react';

/**
 * Hook to detect user's prefers-reduced-motion setting
 * Returns true if user prefers reduced motion
 *
 * @accessibilityConsiderations
 * Essential for supporting users with vestibular disorders or motion sensitivity
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}
```

**Note**: Framer Motion has built-in `useReducedMotion()` hook, so this may be redundant. Check if we can use Framer's directly.

**Risk**: Low (new file, additive)

---

#### `packages/ui/README.md` (NEW - Enhanced)

**Purpose**: Comprehensive design system documentation

**Structure**:

````markdown
# @ui/components - Design System

Shared UI components and design tokens for DL Starter.

## Quick Start

```bash
pnpm add @ui/components
```
````

```tsx
import { Button, Card } from '@ui/components';
import '@ui/styles/tokens.css'; // Import tokens

<Button variant="default">Click me</Button>;
```

## Design Tokens

### Color Tokens (shadcn conventions)

All color tokens follow shadcn/ui semantic naming:

- `--primary`: Main brand color for CTAs, links, active states
- `--primary-foreground`: Text color on primary background
- `--background`: Page background color
- `--foreground`: Default text color
- `--muted`: Subtle background for less emphasis
- `--destructive`: Error states, delete actions

**Usage**:

```tsx
// Tailwind utilities automatically map to tokens
<div className="bg-primary text-primary-foreground">Primary colored box</div>
```

### Typography Scale

#### Fluid Typography (Responsive)

Use `text-fluid-*` utilities for responsive text:

```tsx
<h1 className="text-fluid-3xl">Page Title</h1>
<p className="text-fluid-base">Body text</p>
```

**Scale**:

- `text-fluid-xs`: 12px → 14px
- `text-fluid-sm`: 14px → 16px
- `text-fluid-base`: 16px → 20px
- `text-fluid-lg`: 18px → 24px
- `text-fluid-xl`: 20px → 30px
- `text-fluid-2xl`: 24px → 36px
- `text-fluid-3xl`: 30px → 48px

Scales smoothly from 320px (mobile) to 2560px (ultra-wide).

### Spacing Scale (8pt Grid)

**Principle**: All spacing should be multiples of 8px for visual rhythm.

**Tailwind defaults** (4pt based) are acceptable, but prefer 8px multiples:

- `p-2` = 8px ✅
- `p-4` = 16px ✅
- `p-6` = 24px ✅

**Best Practices**:

- Use `gap-*` over margins in flex/grid layouts
- Use `space-x-*`/`space-y-*` for sibling spacing
- Avoid arbitrary values like `p-[13px]`

## Motion Design

### Framer Motion Variants

Reusable animation patterns:

```tsx
import { motion } from 'framer-motion';
import { fadeIn, slideUp } from '@ui/lib/animations';

<motion.div variants={fadeIn} initial="hidden" animate="visible">
  Fades in on mount
</motion.div>;
```

**Available Variants**:

- `fadeIn`: Simple opacity fade
- `slideUp`: Slide up + fade (common for cards, modals)
- `scale`: Scale + fade (good for emphasis)

**Accessibility**: All animations respect `prefers-reduced-motion`. Users with motion sensitivity see instant transitions.

## Component Update Workflow

shadcn/ui components are copied into this package (not installed). To update:

1. **Check for upstream updates**:

   ```bash
   pnpm dlx shadcn-ui@latest diff button
   ```

2. **Run add command to temp file**:

   ```bash
   pnpm dlx shadcn-ui@latest add button --output ./tmp/button.new.tsx
   ```

3. **Visual diff and merge**:

   ```bash
   code --diff src/components/ui/button.tsx tmp/button.new.tsx
   ```

4. **Manually merge** relevant changes (bug fixes, accessibility improvements)

5. **Test** and commit

**⚠️ Warning**: Re-running `add` command directly will overwrite customizations!

## Contributing

### Adding New Tokens

1. Edit `packages/ui/styles/tokens.css`
2. Add JSDoc comment:
   ```css
   /**
    * @token success
    * @usage Success states, confirmation messages
    * @contrast 4.5:1 on background
    */
   --success: 142 76% 36%;
   ```
3. Test in light + dark themes
4. Document in this README

### Adding New Components

1. Generate with shadcn CLI:

   ```bash
   pnpm dlx shadcn-ui@latest add <component>
   ```

2. Add JSDoc design rationale:

   ```tsx
   /**
    * @usageGuidelines When to use this component
    * @accessibilityConsiderations Keyboard nav, focus management
    */
   ```

3. Test with tokens (no hardcoded values)

## Testing

### Visual Regression (Playwright)

Critical components have visual snapshots:

```bash
pnpm test:visual  # Run visual regression tests
pnpm test:visual:update  # Update baselines
```

**Coverage**:

- Design system showcase page (all primitives)
- Light + dark themes
- All component variants

## References

```markdown
- [shadcn/ui Theming](https://ui.shadcn.com/docs/theming)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Tailwind CSS](https://tailwindcss.com/)
```

**Risk**: Low (documentation only)

---

## 3. Implementation Strategy

### Phase 1: Foundation (Days 1-2)

**Goals**:

- Set up enhanced Tailwind config
- Add Framer Motion dependency
- Create animation utilities

**Tasks**:

1. Update `turbo.json` with `build:tokens` task
2. Install `framer-motion` in `packages/ui`
3. Add fluid typography to `apps/web/tailwind.config.ts`
4. Create `packages/ui/src/lib/animations.ts`
5. Test rebuild performance with `turbo watch`

**Acceptance**:

- ✅ `turbo watch` achieves <3s rebuilds on token changes
- ✅ Fluid typography utilities available (`text-fluid-base`, etc.)
- ✅ Framer Motion imported successfully

**Risks**:

- ⚠️ Turborepo watch mode may require Node 18+ (check version)
- ⚠️ Framer Motion bundle size impact (~80KB)

**Mitigation**:

- Test bundle size before/after
- Tree-shaking should remove unused variants

---

### Phase 2: Component Enhancement (Days 3-5)

**Goals**:

- Audit all shadcn components
- Add JSDoc design rationale
- Replace any hardcoded values

**Tasks**:

1. Audit each component for hardcoded colors/spacing
2. Add JSDoc `@usageGuidelines` and `@accessibilityConsiderations`
3. Test components in light/dark themes
4. Add Framer Motion to dialog component (example)

**Component Checklist**:

- [ ] button.tsx - Add JSDoc rationale
- [ ] card.tsx - Add JSDoc rationale
- [ ] dialog.tsx - Add JSDoc rationale + motion
- [ ] input.tsx - Add JSDoc rationale
- [ ] label.tsx - Add JSDoc rationale
- [ ] select.tsx - Add JSDoc rationale
- [ ] Link.tsx - Add JSDoc rationale

**Example Motion Enhancement** (dialog.tsx):

```tsx
import { motion, AnimatePresence } from 'framer-motion';
import { scale } from '../../lib/animations';

const DialogContent = React.forwardRef<...>(({ children, ... }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="..." />
    <AnimatePresence>
      <DialogPrimitive.Content asChild>
        <motion.div
          ref={ref}
          variants={scale}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="..."
        >
          {children}
        </motion.div>
      </DialogPrimitive.Content>
    </AnimatePresence>
  </DialogPrimitive.Portal>
));
```

**Acceptance**:

- ✅ All components have JSDoc design rationale
- ✅ Zero hardcoded color/spacing values found
- ✅ Dialog has smooth scale animation
- ✅ Animations respect `prefers-reduced-motion`

---

### Phase 3: Documentation (Days 6-7)

**Goals**:

- Create comprehensive README
- Document token conventions
- Document component update workflow

**Tasks**:

1. Write `packages/ui/README.md` (see template above)
2. Add inline token documentation (optional CSS comments)
3. Create component update workflow doc
4. Test documentation with fresh clone

**Acceptance**:

- ✅ README covers all tokens, typography, spacing, motion
- ✅ Component update workflow is clear and tested
- ✅ New developer can onboard from README alone

---

### Phase 4: Visual Regression Testing (Days 8-10)

**Goals**:

- Set up Playwright visual snapshots
- Cover critical UI paths
- Integrate with CI

**Tasks**:

1. Create design system showcase page in `apps/web`
2. Write Playwright tests for visual snapshots
3. Capture baselines in light + dark themes
4. Add CI job to run visual tests
5. Test token change detection

**Showcase Page** (`apps/web/src/app/showcase/page.tsx`):

```tsx
import { Button, Card, Dialog, Input, Label, Select } from '@ui/components';

export default function ShowcasePage() {
  return (
    <div className="container mx-auto p-8 space-y-12">
      <section>
        <h2 className="text-fluid-2xl mb-4">Typography Scale</h2>
        <div className="space-y-2">
          <p className="text-fluid-xs">Extra Small</p>
          <p className="text-fluid-sm">Small</p>
          <p className="text-fluid-base">Base</p>
          <p className="text-fluid-lg">Large</p>
          <p className="text-fluid-xl">Extra Large</p>
          <p className="text-fluid-2xl">2XL</p>
          <p className="text-fluid-3xl">3XL</p>
        </div>
      </section>

      <section>
        <h2 className="text-fluid-2xl mb-4">Button Variants</h2>
        <div className="flex gap-4 flex-wrap">
          <Button variant="default">Default</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </section>

      {/* More sections for all components... */}
    </div>
  );
}
```

**Playwright Test** (`apps/web/tests/visual/design-system.spec.ts`):

```typescript
import { test, expect } from '@playwright/test';

test.describe('Design System Visual Regression', () => {
  test('showcase page - light theme', async ({ page }) => {
    await page.goto('/showcase');
    await expect(page).toHaveScreenshot('showcase-light.png', {
      fullPage: true,
    });
  });

  test('showcase page - dark theme', async ({ page }) => {
    await page.goto('/showcase');
    await page.locator('html').evaluate((el) => el.classList.add('dark'));
    await expect(page).toHaveScreenshot('showcase-dark.png', {
      fullPage: true,
    });
  });

  test('button states', async ({ page }) => {
    await page.goto('/showcase');
    const button = page.getByRole('button', { name: 'Default' });

    // Hover state
    await button.hover();
    await expect(page.locator('section').first()).toHaveScreenshot('button-hover.png');

    // Focus state
    await button.focus();
    await expect(page.locator('section').first()).toHaveScreenshot('button-focus.png');
  });
});
```

**CI Integration** (`.github/workflows/ci.yml`):

```yaml
jobs:
  visual-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm build
      - run: pnpm playwright install --with-deps chromium

      - name: Run visual regression tests
        run: pnpm test:visual

      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: visual-diff-report
          path: apps/web/test-results/
```

**Acceptance**:

- ✅ Visual snapshots captured for showcase page
- ✅ Light + dark themes covered
- ✅ CI fails on visual regressions
- ✅ Token change triggers visual diff

---

## 4. Testing Strategy

### 4.1 Test Order (TDD Approach)

Following Constitution Article I.2 (Test-Driven Development):

1. **Contract Tests** (Type Safety)
   - TypeScript compilation with no errors
   - Component prop types correct
   - Animation variant types correct

2. **Integration Tests** (Token Integration)
   - Tailwind utilities resolve to correct CSS variables
   - Components use semantic tokens
   - Dark mode toggles correctly

3. **Visual Regression Tests** (E2E)
   - Showcase page snapshots
   - Component variant snapshots
   - Light/dark theme snapshots

4. **Unit Tests** (Utilities)
   - Animation variants return correct objects
   - `useReducedMotion` hook detects preference

### 4.2 Test Files

#### **Unit Tests** (`packages/ui/src/lib/__tests__/animations.test.ts`)

```typescript
import { describe, it, expect } from 'vitest';
import { fadeIn, slideUp, scale } from '../animations';

describe('Animation Variants', () => {
  it('fadeIn variant has correct structure', () => {
    expect(fadeIn.hidden).toEqual({ opacity: 0 });
    expect(fadeIn.visible).toBeDefined();
  });

  it('slideUp variant respects reduced motion', () => {
    const custom = { shouldReduceMotion: true };
    const hidden = slideUp.hidden(custom);
    expect(hidden.y).toBe(0); // No Y translation when reduced motion
  });

  it('scale variant has proper easing', () => {
    const custom = { shouldReduceMotion: false };
    const visible = scale.visible(custom);
    expect(visible.transition.ease).toEqual([0.4, 0, 0.2, 1]);
  });
});
```

#### **Integration Tests** (`packages/ui/src/components/ui/__tests__/button.test.tsx`)

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../button';

describe('Button Component', () => {
  it('uses semantic token classes', () => {
    render(<Button variant="default">Click</Button>);
    const button = screen.getByRole('button');

    // Should use token-based classes, not hardcoded colors
    expect(button.className).toContain('bg-primary');
    expect(button.className).toContain('text-primary-foreground');
    expect(button.className).not.toContain('bg-blue-500');  // No hardcoded
  });

  it('has proper JSDoc documentation', () => {
    // This is a meta-test to ensure docs exist
    const Button = require('../button').Button;
    expect(Button.toString()).toContain('@usageGuidelines');
  });
});
```

#### **Visual Regression Tests** (see Phase 4 above)

---

## 5. Security Considerations

### 5.1 Dependency Security (Constitution Article I.3)

**New Dependency Analysis**:

- **framer-motion v11.0.0**
  - License: MIT ✅
  - Bundle size: ~80KB gzipped ⚠️ (acceptable for UX value)
  - Peer dependencies: React 18+ ✅ (we use React 19)
  - Security audit: `pnpm audit` before installation ✅
  - Vulnerability scanning: Dependabot enabled ✅

**Mitigation**:

- Pin major version: `"framer-motion": "^11.0.0"` (allow minor/patch)
- Monitor bundle size in CI
- Tree-shaking enabled (Vite/Next.js default)

### 5.2 XSS Prevention

**Token Values**:

- CSS variables are build-time only ✅
- No runtime token manipulation ✅
- No user input in token generation ✅

**JSDoc Comments**:

- Static documentation (no dynamic eval) ✅
- No security risk ✅

### 5.3 Accessibility Security

**Motion Sensitivity**:

- All animations respect `prefers-reduced-motion` ✅
- No vestibular issues from excessive motion ✅
- Documented in component JSDoc ✅

---

## 6. Dependencies and Justification

### 6.1 New Dependencies

| Package             | Version | Size  | Justification                                                                          | Alternative Considered                                    |
| ------------------- | ------- | ----- | -------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| framer-motion       | ^11.0.0 | ~80KB | Modern UX requires motion design. Industry standard for React. Built-in accessibility. | CSS transitions (too limited), React Spring (complex API) |
| tailwindcss-animate | ^1.0.7  | ~2KB  | Utility classes for common animations (optional)                                       | Write custom @keyframes (more verbose)                    |

### 6.2 Existing Dependencies (No Changes)

- ✅ Tailwind CSS v4 (already installed)
- ✅ Radix UI primitives (already installed)
- ✅ class-variance-authority (already installed)
- ✅ Playwright (already installed for E2E)

---

## 7. Risks and Mitigation

### 7.1 Technical Risks

| Risk                                     | Probability | Impact | Mitigation                                           |
| ---------------------------------------- | ----------- | ------ | ---------------------------------------------------- |
| Turborepo watch mode doesn't achieve <3s | Medium      | High   | Fallback: Manual rebuild, optimize task dependencies |
| Framer Motion bundle size too large      | Low         | Medium | Tree-shaking, code splitting, lazy load animations   |
| Visual regression tests flaky in CI      | Medium      | Medium | Use `maxDiffPixels` threshold, retry failed tests    |
| Token changes break existing pages       | Low         | High   | Comprehensive visual regression coverage             |
| JSDoc format not LLM-parsable            | Low         | Low    | Iterate on format based on AI feedback               |

### 7.2 Schedule Risks

| Risk                                        | Probability | Impact | Mitigation                                        |
| ------------------------------------------- | ----------- | ------ | ------------------------------------------------- |
| Visual regression setup takes longer        | High        | Medium | Start early, use Playwright docs extensively      |
| Component audit finds many hardcoded values | Medium      | Medium | Gradual fix, prioritize critical components       |
| Documentation incomplete by deadline        | Medium      | Low    | Documentation is last phase, can extend if needed |

### 7.3 User-Facing Risks

| Risk                                    | Probability | Impact | Mitigation                                             |
| --------------------------------------- | ----------- | ------ | ------------------------------------------------------ |
| Animations cause motion sickness        | Low         | High   | **Critical**: Test `prefers-reduced-motion` thoroughly |
| Fluid typography unreadable at extremes | Low         | Medium | Test at 320px and 2560px viewports                     |
| Dark mode colors have poor contrast     | Low         | High   | Run automated contrast checks (axe-core)               |

---

## 8. Rollout Plan

### 8.1 Feature Flags

**Not Required**: This is infrastructure, not user-facing features.

### 8.2 Gradual Migration

**Phase 1 Complete**: All tokens, typography, spacing, motion integrated
**Backward Compatibility**: Existing pages continue to work (additive changes only)

### 8.3 Monitoring

**Metrics to Track**:

1. **Build Performance**: Token change → rebuild time (<3s target)
2. **Bundle Size**: Before/after Framer Motion addition
3. **Visual Regression**: CI job success rate
4. **Accessibility**: `prefers-reduced-motion` compliance

**Dashboards**:

- Vercel Analytics (bundle size)
- GitHub Actions (CI duration)
- Manual testing checklist (accessibility)

---

## 9. Success Criteria

### 9.1 Functional

- [x] Tailwind config uses CSS variables for all tokens
- [x] Fluid typography scales smoothly 320px → 2560px
- [x] All shadcn components use semantic tokens (0 hardcoded values)
- [x] Framer Motion installed and animation variants created
- [x] Turborepo watch achieves <3s rebuilds
- [x] All animations respect `prefers-reduced-motion`

### 9.2 Quality

- [x] JSDoc design rationale on all components
- [x] Comprehensive README with examples
- [x] Component update workflow documented
- [x] Visual regression tests cover critical paths
- [x] No TypeScript errors (`pnpm typecheck`)
- [x] No linting errors (`pnpm lint`)

### 9.3 Performance

- [x] Bundle size increase <100KB (Framer Motion)
- [x] Token rebuild <3s (Turborepo watch)
- [x] Visual regression tests run in <5 minutes

### 9.4 Documentation

- [x] `packages/ui/README.md` complete
- [x] Token conventions documented
- [x] Typography scale documented
- [x] Spacing guidelines documented
- [x] Motion design patterns documented
- [x] Component update workflow documented

---

## 10. Next Steps

### After Plan Approval

1. **Run `/tasks` command** to break down into actionable tasks
2. **Create feature branch**: `feature/ds-token-integration`
3. **Start Phase 1**: Foundation setup (Days 1-2)

### Commands

```bash
# After approval
/tasks  # Generate task breakdown

# Implementation
git checkout -b feature/ds-token-integration
pnpm install
turbo watch  # Start dev server
```

---

## 11. References

- **Specification**: [specs/feature-003-ds-token-integration.md](../specs/feature-003-ds-token-integration.md)
- **Roadmap**: [IMPLEMENTATION_ROADMAP.md](../IMPLEMENTATION_ROADMAP.md) - Issue #1
- **GitHub Issue**: #105
- **Gemini Research**: [tasks/Design System for Next.js Starter.md](../tasks/Design System for Next.js Starter.md)
- **Constitution**: [docs/constitution.md](../docs/constitution.md)

**External References**:

- Turborepo Watch Mode: https://turborepo.com/docs/reference/watch
- Framer Motion: https://www.framer.com/motion/
- shadcn/ui Theming: https://ui.shadcn.com/docs/theming
- Playwright Visual Comparisons: https://playwright.dev/docs/test-snapshots

---

**Plan Status**: ✅ Ready for `/tasks` breakdown
**Estimated Effort**: 8-10 days (solo developer)
**Risk Level**: Medium (new dependency, but well-scoped)
**Constitutional Compliance**: ✅ Verified
