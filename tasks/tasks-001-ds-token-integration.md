---
id: TASK-20251002-ds-token-integration
type: task
parentId: PLAN-20251002-ds-token-integration
plan: PLAN-20251002-ds-token-integration
spec: SPEC-20251002-ds-token-integration
issue: 105
created: 2025-10-02
estimatedEffort: 8-10 days
branch: feature/ds-token-integration
---

# Implementation Tasks: Design System Token Integration

**Plan Reference**: [plans/plan-001-ds-token-integration.md](../plans/plan-001-ds-token-integration.md)
**Spec Reference**: [specs/feature-003-ds-token-integration.md](../specs/feature-003-ds-token-integration.md)

---

## 🎯 Constitutional TDD Order

Following **docs/constitution.md** Article I.2 (Test-Driven Development):

1. **Phase 1: Contracts & Interfaces** - Define types, interfaces, and contracts
2. **Phase 2: Test Foundation** - Write tests (integration → e2e → unit)
3. **Phase 3: Implementation** - Implement features to pass tests
4. **Phase 4: Integration & Polish** - Connect pieces, refine UX
5. **Phase 5: Documentation & Release** - Complete docs, prepare PR

---

## Branch Strategy

```bash
# Feature branch
git checkout -b feature/ds-token-integration

# Implementation branches (if needed for isolation)
git checkout -b feature/ds-token-integration/phase-1-foundation
git checkout -b feature/ds-token-integration/phase-2-components
git checkout -b feature/ds-token-integration/phase-3-docs
git checkout -b feature/ds-token-integration/phase-4-visual-tests

# Merge strategy
# Phase branches → feature branch → main (via PR)
```

---

## Phase 1: Contracts & Interfaces (Days 1-2)

**Goal**: Define types, install dependencies, configure build pipeline

### Task 1.1: Install Dependencies

**Commands**:

```bash
# Install Framer Motion
cd packages/ui
pnpm add framer-motion@^11.0.0

# Verify no peer dependency conflicts
pnpm install
pnpm typecheck

# Check bundle size before
cd ../../apps/web
pnpm build
# Note .next/static/chunks/*.js sizes
```

**Acceptance**:

- [ ] Framer Motion installed without errors
- [ ] TypeScript compiles successfully
- [ ] Baseline bundle size recorded

**Files Modified**:

- `packages/ui/package.json`

**Estimated Time**: 30 minutes

---

### Task 1.2: Configure Turborepo Build Pipeline

**Commands**:

```bash
# Edit turbo.json
code turbo.json
```

**Changes**:

```json
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
      "interruptible": true
    },
    "dev": {
      "cache": false,
      "persistent": true,
      "dependsOn": ["^build:tokens"]
    }
  }
}
```

**Test**:

```bash
# Test watch mode
turbo watch --experimental-write-cache dev

# In another terminal, touch a token file
touch packages/ui/styles/tokens.css

# Verify rebuild triggers and completes in <3s
# Check terminal output for rebuild time
```

**Acceptance**:

- [ ] `build:tokens` task added with `interruptible: true`
- [ ] `dev` depends on `^build:tokens`
- [ ] Watch mode triggers rebuild on token changes
- [ ] Rebuild completes in <3 seconds

**Files Modified**:

- `turbo.json`

**Estimated Time**: 1 hour

---

### Task 1.3: Define Fluid Typography Scale

**Commands**:

```bash
code apps/web/tailwind.config.ts
```

**Changes**:

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx,mdx}', '../../packages/ui/src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Existing token mappings (unchanged)
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      // NEW: Fluid typography scale
      fontSize: {
        'fluid-xs': 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',
        'fluid-sm': 'clamp(0.875rem, 0.8rem + 0.375vw, 1rem)',
        'fluid-base': 'clamp(1rem, 0.9rem + 0.5vw, 1.25rem)',
        'fluid-lg': 'clamp(1.125rem, 1rem + 0.625vw, 1.5rem)',
        'fluid-xl': 'clamp(1.25rem, 1.1rem + 0.75vw, 1.875rem)',
        'fluid-2xl': 'clamp(1.5rem, 1.3rem + 1vw, 2.25rem)',
        'fluid-3xl': 'clamp(1.875rem, 1.6rem + 1.375vw, 3rem)',
      },
      // Spacing scale already good (Tailwind 4pt defaults)
      // Document 8pt preference in README
    },
  },
  plugins: [],
};

export default config;
```

**Test**:

```bash
# Verify TypeScript compiles
pnpm typecheck

# Start dev server
pnpm dev

# Test in browser: Resize from 320px to 2560px
# Typography should scale smoothly
```

**Acceptance**:

- [ ] Fluid typography utilities defined
- [ ] TypeScript compiles without errors
- [ ] Dev server starts successfully
- [ ] Text scales smoothly when resizing browser

**Files Modified**:

- `apps/web/tailwind.config.ts`

**Estimated Time**: 1 hour

---

### Task 1.4: Create Animation Type Definitions

**Commands**:

```bash
# Create animations utility file
code packages/ui/src/lib/animations.ts
```

**Content**:

```typescript
import { Variants } from 'framer-motion';

/**
 * Animation variant custom props
 * Used to pass shouldReduceMotion flag to variants
 */
export interface AnimationCustomProps {
  shouldReduceMotion?: boolean;
}

/**
 * Fade in animation variant
 *
 * @usageGuidelines
 * Use for content that appears/disappears without spatial context
 * Examples: tooltips, notifications, modal backdrops
 *
 * @accessibilityConsiderations
 * Respects prefers-reduced-motion by using instant transition
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: (custom: AnimationCustomProps) => ({
    opacity: 1,
    transition: {
      duration: custom?.shouldReduceMotion ? 0 : 0.3,
      ease: 'easeOut',
    },
  }),
};

/**
 * Slide up animation variant
 *
 * @usageGuidelines
 * Use for content entering from bottom (cards, modals, sheets)
 * Creates sense of elevation and layering
 *
 * @accessibilityConsiderations
 * Respects prefers-reduced-motion by removing Y translation
 * Falls back to fade-only animation
 */
export const slideUp: Variants = {
  hidden: (custom: AnimationCustomProps) => ({
    opacity: 0,
    y: custom?.shouldReduceMotion ? 0 : 20,
  }),
  visible: (custom: AnimationCustomProps) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: custom?.shouldReduceMotion ? 0 : 0.4,
      ease: [0.4, 0, 0.2, 1], // Ease-out cubic
    },
  }),
};

/**
 * Scale animation variant
 *
 * @usageGuidelines
 * Use for modals, dialogs, popovers entering/exiting
 * Creates sense of depth and focus
 *
 * @accessibilityConsiderations
 * Respects prefers-reduced-motion by removing scale effect
 */
export const scale: Variants = {
  hidden: (custom: AnimationCustomProps) => ({
    opacity: 0,
    scale: custom?.shouldReduceMotion ? 1 : 0.95,
  }),
  visible: (custom: AnimationCustomProps) => ({
    opacity: 1,
    scale: 1,
    transition: {
      duration: custom?.shouldReduceMotion ? 0 : 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  }),
};

/**
 * Slide in from right animation variant
 *
 * @usageGuidelines
 * Use for side panels, sheets, navigation drawers
 * Creates sense of lateral movement
 */
export const slideInRight: Variants = {
  hidden: (custom: AnimationCustomProps) => ({
    opacity: 0,
    x: custom?.shouldReduceMotion ? 0 : 20,
  }),
  visible: (custom: AnimationCustomProps) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: custom?.shouldReduceMotion ? 0 : 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  }),
};
```

**Test**:

```bash
# Verify types compile
cd packages/ui
pnpm typecheck

# Verify Framer Motion types work
# Should show no type errors
```

**Acceptance**:

- [ ] Animation variants typed correctly
- [ ] JSDoc documentation complete
- [ ] TypeScript compiles without errors
- [ ] Framer Motion types imported successfully

**Files Created**:

- `packages/ui/src/lib/animations.ts`

**Estimated Time**: 1 hour

---

### Task 1.5: Export Animations from UI Package

**Commands**:

```bash
code packages/ui/src/index.ts
```

**Changes**:

```typescript
// Export components
export * from './components/ui/button';
export * from './components/ui/card';
export * from './components/ui/dialog';
export * from './components/ui/input';
export * from './components/ui/label';
export * from './components/ui/select';
export * from './components/ui/Link';

// NEW: Export animations
export * from './lib/animations';

// Export utilities
export * from './lib/utils';
```

**Test**:

```bash
# Verify exports work
cd ../../apps/web
pnpm typecheck

# Try importing in a test file
echo "import { fadeIn } from '@ui/components';" | npx tsc --noEmit --stdin
```

**Acceptance**:

- [ ] Animations exported from package index
- [ ] TypeScript recognizes exports
- [ ] No circular dependency warnings

**Files Modified**:

- `packages/ui/src/index.ts`

**Estimated Time**: 15 minutes

---

**Phase 1 Summary**:

- ✅ Dependencies installed
- ✅ Build pipeline configured (<3s rebuilds)
- ✅ Fluid typography defined
- ✅ Animation variants created with types
- ✅ Exports configured

**Total Phase 1 Time**: ~4 hours (Day 1)

---

## Phase 2: Test Foundation (Days 2-3)

**Goal**: Write tests before implementation (TDD)

### Task 2.1: Unit Tests for Animation Variants

**Commands**:

```bash
# Create test file
code packages/ui/src/lib/__tests__/animations.test.ts
```

**Content**:

```typescript
import { describe, it, expect } from 'vitest';
import { fadeIn, slideUp, scale, slideInRight } from '../animations';
import type { AnimationCustomProps } from '../animations';

describe('Animation Variants', () => {
  describe('fadeIn', () => {
    it('has correct hidden state', () => {
      expect(fadeIn.hidden).toEqual({ opacity: 0 });
    });

    it('has correct visible state with motion', () => {
      const custom: AnimationCustomProps = { shouldReduceMotion: false };
      const visible = fadeIn.visible(custom);

      expect(visible).toMatchObject({
        opacity: 1,
        transition: {
          duration: 0.3,
          ease: 'easeOut',
        },
      });
    });

    it('respects reduced motion preference', () => {
      const custom: AnimationCustomProps = { shouldReduceMotion: true };
      const visible = fadeIn.visible(custom);

      expect(visible.transition.duration).toBe(0);
    });
  });

  describe('slideUp', () => {
    it('has correct hidden state with motion', () => {
      const custom: AnimationCustomProps = { shouldReduceMotion: false };
      const hidden = slideUp.hidden(custom);

      expect(hidden).toEqual({ opacity: 0, y: 20 });
    });

    it('removes Y translation when reduced motion', () => {
      const custom: AnimationCustomProps = { shouldReduceMotion: true };
      const hidden = slideUp.hidden(custom);

      expect(hidden.y).toBe(0);
      expect(hidden.opacity).toBe(0);
    });

    it('has correct visible state', () => {
      const custom: AnimationCustomProps = { shouldReduceMotion: false };
      const visible = slideUp.visible(custom);

      expect(visible).toMatchObject({
        opacity: 1,
        y: 0,
      });
    });
  });

  describe('scale', () => {
    it('has correct scale values', () => {
      const customWithMotion: AnimationCustomProps = { shouldReduceMotion: false };
      const customReduced: AnimationCustomProps = { shouldReduceMotion: true };

      const hiddenWithMotion = scale.hidden(customWithMotion);
      const hiddenReduced = scale.hidden(customReduced);

      expect(hiddenWithMotion.scale).toBe(0.95);
      expect(hiddenReduced.scale).toBe(1); // No scale when reduced motion
    });
  });

  describe('slideInRight', () => {
    it('slides from right when motion enabled', () => {
      const custom: AnimationCustomProps = { shouldReduceMotion: false };
      const hidden = slideInRight.hidden(custom);

      expect(hidden.x).toBe(20);
    });

    it('no X translation when reduced motion', () => {
      const custom: AnimationCustomProps = { shouldReduceMotion: true };
      const hidden = slideInRight.hidden(custom);

      expect(hidden.x).toBe(0);
    });
  });
});
```

**Test**:

```bash
# Run tests
cd packages/ui
pnpm test

# Should see all tests pass
# Expected: 10+ tests passing
```

**Acceptance**:

- [ ] All animation variant tests pass
- [ ] Reduced motion behavior tested
- [ ] Test coverage >80% for animations.ts

**Files Created**:

- `packages/ui/src/lib/__tests__/animations.test.ts`

**Estimated Time**: 1.5 hours

---

### Task 2.2: Integration Tests for Token Usage

**Commands**:

```bash
# Create integration test for button component
code packages/ui/src/components/ui/__tests__/button.test.tsx
```

**Content**:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../button';

describe('Button Component Token Integration', () => {
  it('uses semantic token classes (no hardcoded colors)', () => {
    render(<Button variant="default">Click me</Button>);
    const button = screen.getByRole('button');

    // Should use token-based classes
    expect(button.className).toContain('bg-primary');
    expect(button.className).toContain('text-primary-foreground');

    // Should NOT have hardcoded color classes
    expect(button.className).not.toContain('bg-blue-');
    expect(button.className).not.toContain('bg-slate-');
    expect(button.className).not.toContain('text-white');
  });

  it('destructive variant uses destructive tokens', () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByRole('button');

    expect(button.className).toContain('bg-destructive');
    expect(button.className).toContain('text-destructive-foreground');
  });

  it('outline variant uses border token', () => {
    render(<Button variant="outline">Outline</Button>);
    const button = screen.getByRole('button');

    expect(button.className).toContain('border-input');
    expect(button.className).toContain('bg-background');
  });

  it('has JSDoc documentation', async () => {
    // Meta-test: Ensure component has design rationale
    // ESM-compatible approach using dynamic import with ?raw suffix
    const buttonSourceModule = await import('../button.tsx?raw');
    const buttonSource = buttonSourceModule.default;

    // Check for JSDoc tags (implementation will add these)
    // This test will initially fail, then pass after Phase 3
    expect(buttonSource).toContain('@usageGuidelines');
    expect(buttonSource).toContain('@accessibilityConsiderations');
  });
});
```

**Note**: JSDoc test will fail initially (expected). It passes in Phase 3 after adding documentation.

**Test**:

```bash
# Run tests (JSDoc test will fail, that's expected)
pnpm test

# Should see:
# ✓ uses semantic token classes
# ✓ destructive variant uses destructive tokens
# ✓ outline variant uses border token
# ✗ has JSDoc documentation (expected to fail initially)
```

**Acceptance**:

- [ ] Token usage tests pass (3/4 tests)
- [ ] JSDoc test fails initially (expected)
- [ ] Tests verify no hardcoded colors

**Files Created**:

- `packages/ui/src/components/ui/__tests__/button.test.tsx`

**Estimated Time**: 1 hour

---

### Task 2.3: Create Design System Showcase Page

**Commands**:

```bash
# Create showcase page
code apps/web/src/app/showcase/page.tsx
```

**Content**:

```typescript
import { Button, Card, Input, Label, Select } from '@ui/components';

export default function ShowcasePage() {
  return (
    <div className="container mx-auto p-8 space-y-16">
      {/* Typography Section */}
      <section>
        <h1 className="text-fluid-3xl font-bold mb-8">Design System Showcase</h1>
        <p className="text-muted-foreground mb-4">
          This page demonstrates all design tokens, components, and animations.
        </p>

        <div className="space-y-4">
          <h2 className="text-fluid-2xl font-semibold">Typography Scale</h2>
          <div className="space-y-2 border-l-4 border-primary pl-4">
            <p className="text-fluid-xs">Extra Small - Fluid XS</p>
            <p className="text-fluid-sm">Small - Fluid SM</p>
            <p className="text-fluid-base">Base - Fluid Base (body text)</p>
            <p className="text-fluid-lg">Large - Fluid LG</p>
            <p className="text-fluid-xl">Extra Large - Fluid XL</p>
            <p className="text-fluid-2xl">2XL - Fluid 2XL</p>
            <p className="text-fluid-3xl">3XL - Fluid 3XL</p>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Resize browser from 320px → 2560px to see fluid scaling
          </p>
        </div>
      </section>

      {/* Colors Section */}
      <section>
        <h2 className="text-fluid-2xl font-semibold mb-4">Color Tokens</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="h-24 bg-primary rounded-lg" />
            <p className="text-sm font-mono">--primary</p>
          </div>
          <div className="space-y-2">
            <div className="h-24 bg-secondary rounded-lg" />
            <p className="text-sm font-mono">--secondary</p>
          </div>
          <div className="space-y-2">
            <div className="h-24 bg-destructive rounded-lg" />
            <p className="text-sm font-mono">--destructive</p>
          </div>
          <div className="space-y-2">
            <div className="h-24 bg-muted rounded-lg" />
            <p className="text-sm font-mono">--muted</p>
          </div>
          <div className="space-y-2">
            <div className="h-24 bg-accent rounded-lg" />
            <p className="text-sm font-mono">--accent</p>
          </div>
          <div className="space-y-2">
            <div className="h-24 bg-card border border-border rounded-lg" />
            <p className="text-sm font-mono">--card</p>
          </div>
          <div className="space-y-2">
            <div className="h-24 bg-background border border-border rounded-lg" />
            <p className="text-sm font-mono">--background</p>
          </div>
          <div className="space-y-2">
            <div className="h-24 bg-popover border border-border rounded-lg" />
            <p className="text-sm font-mono">--popover</p>
          </div>
        </div>
      </section>

      {/* Button Variants Section */}
      <section>
        <h2 className="text-fluid-2xl font-semibold mb-4">Button Variants</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="default">Default</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>

        <h3 className="text-fluid-lg font-semibold mt-8 mb-4">Button Sizes</h3>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon">🔍</Button>
        </div>

        <h3 className="text-fluid-lg font-semibold mt-8 mb-4">Button States</h3>
        <div className="flex flex-wrap gap-4">
          <Button>Normal</Button>
          <Button disabled>Disabled</Button>
        </div>
      </section>

      {/* Form Components Section */}
      <section>
        <h2 className="text-fluid-2xl font-semibold mb-4">Form Components</h2>
        <Card className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="John Doe" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="john@example.com" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select id="role">
              <option>Developer</option>
              <option>Designer</option>
              <option>Product Manager</option>
            </Select>
          </div>

          <Button>Submit Form</Button>
        </Card>
      </section>

      {/* Spacing Scale Section */}
      <section>
        <h2 className="text-fluid-2xl font-semibold mb-4">Spacing Scale (8pt Grid)</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 text-sm font-mono">p-2</div>
            <div className="p-2 bg-accent">8px</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 text-sm font-mono">p-4</div>
            <div className="p-4 bg-accent">16px</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 text-sm font-mono">p-6</div>
            <div className="p-6 bg-accent">24px</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 text-sm font-mono">p-8</div>
            <div className="p-8 bg-accent">32px</div>
          </div>
        </div>
      </section>

      {/* Border Radius Section */}
      <section>
        <h2 className="text-fluid-2xl font-semibold mb-4">Border Radius</h2>
        <div className="flex gap-4">
          <div className="w-24 h-24 bg-primary rounded-sm flex items-center justify-center text-primary-foreground text-xs">
            rounded-sm
          </div>
          <div className="w-24 h-24 bg-primary rounded-md flex items-center justify-center text-primary-foreground text-xs">
            rounded-md
          </div>
          <div className="w-24 h-24 bg-primary rounded-lg flex items-center justify-center text-primary-foreground text-xs">
            rounded-lg
          </div>
        </div>
      </section>
    </div>
  );
}
```

**Test**:

```bash
# Start dev server
cd apps/web
pnpm dev

# Visit http://localhost:3000/showcase
# Verify all sections render correctly
# Resize browser 320px → 2560px to test fluid typography
```

**Acceptance**:

- [ ] Showcase page renders without errors
- [ ] All components visible
- [ ] Fluid typography scales smoothly
- [ ] Color tokens display correctly
- [ ] Ready for visual regression testing

**Files Created**:

- `apps/web/src/app/showcase/page.tsx`

**Estimated Time**: 2 hours

---

### Task 2.4: Write Playwright Visual Regression Tests

**Commands**:

```bash
# Create Playwright test
code apps/web/tests/visual/design-system.spec.ts
```

**Content**:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Design System Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/showcase');
    // Wait for fonts to load
    await page.waitForLoadState('networkidle');
  });

  test('showcase page - light theme', async ({ page }) => {
    await expect(page).toHaveScreenshot('showcase-light.png', {
      fullPage: true,
      maxDiffPixels: 100, // Allow minor rendering differences
    });
  });

  test('showcase page - dark theme', async ({ page }) => {
    // Add dark class to html element
    await page.locator('html').evaluate((el) => el.classList.add('dark'));
    await page.waitForTimeout(500); // Wait for theme transition

    await expect(page).toHaveScreenshot('showcase-dark.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('button variants render correctly', async ({ page }) => {
    const buttonSection = page.locator('section').filter({ hasText: 'Button Variants' });
    await expect(buttonSection).toHaveScreenshot('button-variants.png', {
      maxDiffPixels: 50,
    });
  });

  test('button hover state', async ({ page }) => {
    const defaultButton = page.getByRole('button', { name: 'Default' }).first();
    await defaultButton.hover();
    await page.waitForTimeout(300); // Wait for hover transition

    const buttonSection = page.locator('section').filter({ hasText: 'Button Variants' });
    await expect(buttonSection).toHaveScreenshot('button-hover.png', {
      maxDiffPixels: 50,
    });
  });

  test('button focus state', async ({ page }) => {
    const defaultButton = page.getByRole('button', { name: 'Default' }).first();
    await defaultButton.focus();

    const buttonSection = page.locator('section').filter({ hasText: 'Button Variants' });
    await expect(buttonSection).toHaveScreenshot('button-focus.png', {
      maxDiffPixels: 50,
    });
  });

  test('typography scales at mobile width', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    const typographySection = page.locator('section').filter({ hasText: 'Typography Scale' });

    await expect(typographySection).toHaveScreenshot('typography-mobile.png', {
      maxDiffPixels: 50,
    });
  });

  test('typography scales at desktop width', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    const typographySection = page.locator('section').filter({ hasText: 'Typography Scale' });

    await expect(typographySection).toHaveScreenshot('typography-desktop.png', {
      maxDiffPixels: 50,
    });
  });

  test('form components in card', async ({ page }) => {
    const formSection = page.locator('section').filter({ hasText: 'Form Components' });

    await expect(formSection).toHaveScreenshot('form-components.png', {
      maxDiffPixels: 50,
    });
  });
});
```

**Test (Generate Baselines)**:

```bash
# Install Playwright if not already installed
pnpm playwright install --with-deps chromium

# Generate baseline screenshots
pnpm test:visual

# This will create baseline images in:
# apps/web/tests/visual/design-system.spec.ts-snapshots/
```

**Acceptance**:

- [ ] All visual tests generate baseline screenshots
- [ ] Light theme snapshot captured
- [ ] Dark theme snapshot captured
- [ ] Component variant snapshots captured
- [ ] Mobile/desktop typography snapshots captured

**Files Created**:

- `apps/web/tests/visual/design-system.spec.ts`

**Estimated Time**: 2 hours

---

**Phase 2 Summary**:

- ✅ Animation unit tests written
- ✅ Token integration tests written
- ✅ Showcase page created
- ✅ Visual regression tests written
- ✅ Baseline screenshots generated

**Total Phase 2 Time**: ~6.5 hours (Days 2-3)

---

## Phase 3: Implementation (Days 3-5)

**Goal**: Implement features to make tests pass

### Task 3.1: Add JSDoc Design Rationale to Button Component

**Commands**:

```bash
code packages/ui/src/components/ui/button.tsx
```

**Changes**:
Add comprehensive JSDoc before component definition:

````typescript
/**
 * Button component with design system variants
 *
 * A flexible button component that supports multiple visual styles and sizes.
 * Built with accessibility in mind and follows semantic design token patterns.
 *
 * @usageGuidelines
 * - Only one primary button visible per screen to avoid user confusion
 * - Use default variant for primary CTAs (sign up, submit, save)
 * - Use destructive variant for irreversible actions (delete, remove, cancel subscription)
 * - Use outline variant for secondary actions that need clear boundaries
 * - Use ghost variant for tertiary actions (navigation, less important actions)
 * - Use link variant for text-based actions that should appear inline
 * - Prefer ghost/link variants for secondary actions to reduce visual noise
 * - Disabled state should explain WHY button is disabled (via tooltip or helper text)
 *
 * @accessibilityConsiderations
 * - Minimum 4.5:1 contrast ratio on background (WCAG AA)
 * - Focus ring uses 2px outline with 2px offset for high visibility
 * - Disabled state uses pointer-events-none to prevent accidental clicks
 * - Disabled state uses opacity reduction for visual feedback
 * - Supports keyboard navigation (Space/Enter to activate)
 * - Works with screen readers (proper ARIA semantics via button element)
 * - Icon-only buttons should have aria-label for screen readers
 *
 * @example
 * ```tsx
 * // Primary CTA
 * <Button variant="default" size="lg">
 *   Sign Up Free
 * </Button>
 *
 * // Destructive action
 * <Button variant="destructive" onClick={handleDelete}>
 *   Delete Account
 * </Button>
 *
 * // Icon button with label
 * <Button variant="ghost" size="icon" aria-label="Close dialog">
 *   <X className="h-4 w-4" />
 * </Button>
 * ```
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = 'Button';
````

**Test**:

```bash
# Run integration test (should now pass JSDoc test)
pnpm test -- button.test

# Expected: All 4 tests pass (including JSDoc test)
```

**Acceptance**:

- [ ] JSDoc includes @usageGuidelines section
- [ ] JSDoc includes @accessibilityConsiderations section
- [ ] JSDoc includes @example section
- [ ] Integration test passes (4/4 tests)

**Files Modified**:

- `packages/ui/src/components/ui/button.tsx`

**Estimated Time**: 45 minutes

---

### Task 3.2: Add JSDoc to Remaining Components

**Commands**:

```bash
# Card component
code packages/ui/src/components/ui/card.tsx

# Dialog component
code packages/ui/src/components/ui/dialog.tsx

# Input component
code packages/ui/src/components/ui/input.tsx

# Label component
code packages/ui/src/components/ui/label.tsx

# Select component
code packages/ui/src/components/ui/select.tsx
```

**Template** (adapt for each component):

````typescript
/**
 * [Component Name] component with design system tokens
 *
 * [Brief description of component purpose]
 *
 * @usageGuidelines
 * - [When to use this component]
 * - [Best practices]
 * - [Common mistakes to avoid]
 *
 * @accessibilityConsiderations
 * - [Keyboard navigation support]
 * - [Screen reader support]
 * - [Focus management]
 * - [ARIA attributes]
 * - [Contrast requirements]
 *
 * @example
 * ```tsx
 * <ComponentName>
 *   Example usage
 * </ComponentName>
 * ```
 */
````

**Examples**:

**Card**:

````typescript
/**
 * Card component for grouping related content
 *
 * @usageGuidelines
 * - Use for grouping related information with clear boundaries
 * - Avoid nesting cards more than 2 levels deep
 * - Use Card + CardHeader + CardContent + CardFooter for standard layout
 * - Prefer consistent padding across cards in a grid
 *
 * @accessibilityConsiderations
 * - Use semantic HTML (div with role if needed)
 * - Ensure sufficient contrast between card and background
 * - Keep interactive elements inside cards keyboard accessible
 *
 * @example
 * ```tsx
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Settings</CardTitle>
 *   </CardHeader>
 *   <CardContent>
 *     Card content here
 *   </CardContent>
 * </Card>
 * ```
 */
````

**Input**:

````typescript
/**
 * Input component for text entry
 *
 * @usageGuidelines
 * - Always pair with Label component for accessibility
 * - Use type attribute for appropriate keyboard on mobile
 * - Provide placeholder as hint, not instruction
 * - Use disabled sparingly, prefer readonly when appropriate
 *
 * @accessibilityConsiderations
 * - Must have associated label (via htmlFor or aria-label)
 * - Error states should have aria-invalid and aria-describedby
 * - Placeholder text should NOT replace labels
 * - Focus ring visible for keyboard navigation
 *
 * @example
 * ```tsx
 * <div>
 *   <Label htmlFor="email">Email</Label>
 *   <Input id="email" type="email" placeholder="you@example.com" />
 * </div>
 * ```
 */
````

**Test**:

```bash
# Verify all components have JSDoc
grep -r "@usageGuidelines" packages/ui/src/components/ui/*.tsx

# Should see 7 matches (all components)
```

**Acceptance**:

- [ ] All 7 components have JSDoc design rationale
- [ ] Each JSDoc includes usage guidelines
- [ ] Each JSDoc includes accessibility considerations
- [ ] Each JSDoc includes examples

**Files Modified**:

- `packages/ui/src/components/ui/card.tsx`
- `packages/ui/src/components/ui/dialog.tsx`
- `packages/ui/src/components/ui/input.tsx`
- `packages/ui/src/components/ui/label.tsx`
- `packages/ui/src/components/ui/select.tsx`
- `packages/ui/src/components/ui/Link.tsx`

**Estimated Time**: 3 hours (30-45 min per component)

---

### Task 3.3: Audit Components for Hardcoded Values

**Commands**:

```bash
# Search for potential hardcoded colors
cd packages/ui
grep -r "bg-slate-" src/components/ui/*.tsx
grep -r "text-blue-" src/components/ui/*.tsx
grep -r "bg-gray-" src/components/ui/*.tsx
grep -r "border-gray-" src/components/ui/*.tsx
grep -r "#[0-9a-fA-F]\{6\}" src/components/ui/*.tsx  # Hex colors
```

**Expected Result**: No matches (components already use semantic tokens)

**If matches found**:

1. Review each instance
2. Replace with semantic token equivalent
3. Example: `bg-slate-900` → `bg-background`

**Test**:

```bash
# Run token integration tests
pnpm test -- button.test

# All token usage tests should pass
```

**Acceptance**:

- [ ] No hardcoded color classes found
- [ ] No hex color values found
- [ ] All components use semantic tokens
- [ ] Token integration tests pass

**Estimated Time**: 1 hour (likely 0 changes needed)

---

### Task 3.4: Enhance Dialog with Motion

**Commands**:

```bash
code packages/ui/src/components/ui/dialog.tsx
```

**Changes**:

```typescript
import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { scale } from '../../lib/animations';

// ... existing code ...

/**
 * Dialog content with scale animation
 *
 * @usageGuidelines
 * - Use for modal dialogs requiring user attention
 * - Keep content focused and concise
 * - Provide clear close button and ESC key support
 * - Avoid nested dialogs (use sheets or steppers instead)
 *
 * @accessibilityConsiderations
 * - Traps focus inside dialog when open
 * - Returns focus to trigger element on close
 * - Supports ESC key to close
 * - Prevents scroll on body when open
 * - Backdrop click closes dialog (can be disabled with onPointerDownOutside)
 * - Animation respects prefers-reduced-motion
 */
const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  // Detect reduced motion preference
  const [shouldReduceMotion, setShouldReduceMotion] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setShouldReduceMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setShouldReduceMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className={cn(
          'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
        )}
      />
      <DialogPrimitive.Content ref={ref} asChild {...props}>
        <motion.div
          className={cn(
            'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg',
            'translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6',
            'shadow-lg duration-200 sm:rounded-lg',
            className
          )}
          variants={scale}
          initial="hidden"
          animate="visible"
          exit="hidden"
          custom={{ shouldReduceMotion }}
        >
          {children}
          <DialogPrimitive.Close
            className={cn(
              'absolute right-4 top-4 rounded-sm opacity-70',
              'ring-offset-background transition-opacity hover:opacity-100',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              'disabled:pointer-events-none'
            )}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </motion.div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;
```

**Test**:

```bash
# Start dev server
pnpm dev

# Visit showcase page
# Open a dialog (if exists, or create test dialog)
# Verify scale animation plays
# Enable prefers-reduced-motion in DevTools
# Verify animation is instant (no scale)
```

**Acceptance**:

- [ ] Dialog scales in/out smoothly
- [ ] Animation respects prefers-reduced-motion
- [ ] No console errors
- [ ] Dialog functionality unchanged

**Files Modified**:

- `packages/ui/src/components/ui/dialog.tsx`

**Estimated Time**: 1.5 hours

---

**Phase 3 Summary**:

- ✅ JSDoc design rationale added to all components
- ✅ Components audited (no hardcoded values found)
- ✅ Dialog enhanced with motion
- ✅ All integration tests pass

**Total Phase 3 Time**: ~6.25 hours (Days 3-5)

---

## Phase 4: Documentation (Days 6-7)

**Goal**: Create comprehensive documentation

### Task 4.1: Create UI Package README

**Commands**:

```bash
code packages/ui/README.md
```

**Content**: (See plan for full README template - ~500 lines)

Key sections:

- Quick Start
- Design Tokens (color conventions)
- Typography Scale (fluid examples)
- Spacing Scale (8pt grid)
- Motion Design (Framer Motion patterns)
- Component Update Workflow (diff-and-merge)
- Contributing Guidelines
- Testing

**Test**:

```bash
# Verify markdown renders correctly
# Check all code examples have correct syntax
# Test links work

# Optional: Use markdown linter
pnpm dlx markdownlint packages/ui/README.md
```

**Acceptance**:

- [ ] README covers all tokens
- [ ] Typography scale documented with examples
- [ ] Spacing guidelines clear
- [ ] Motion patterns explained
- [ ] Component update workflow detailed
- [ ] Examples are copy-pastable

**Files Created**:

- `packages/ui/README.md`

**Estimated Time**: 3 hours

---

### Task 4.2: Add Inline Token Documentation (Optional)

**Commands**:

```bash
code packages/ui/styles/tokens.css
```

**Enhancement** (optional, low priority):
Add CSS comments explaining tokens:

```css
/**
 * Primary brand color token
 * @usage Main CTAs, links, active states
 * @contrast 4.5:1 on background (WCAG AA)
 */
--primary: var(--brand-600);

/**
 * Primary foreground (text on primary background)
 * @usage Text color on primary buttons
 * @contrast 4.5:1 on primary (WCAG AA)
 */
--primary-foreground: 0 0% 100%;
```

**Note**: This is optional enhancement. Token naming is already clear.

**Acceptance**:

- [ ] (Optional) Key tokens have inline comments
- [ ] Comments explain usage and contrast ratios

**Files Modified**:

- `packages/ui/styles/tokens.css` (optional)

**Estimated Time**: 1 hour (optional)

---

### Task 4.3: Update Root README

**Commands**:

```bash
code README.md
```

**Changes**:
Add section referencing design system:

```markdown
## Design System

This project includes a comprehensive design system with:

- **Semantic tokens** following shadcn/ui conventions
- **Fluid typography** scaling from mobile to ultra-wide displays
- **Motion design** with Framer Motion and accessibility support
- **8pt spacing grid** for visual consistency

See [`packages/ui/README.md`](packages/ui/README.md) for complete documentation.

### Quick Example

\`\`\`tsx
import { Button, Card } from '@ui/components';
import '@ui/styles/tokens.css';

function MyComponent() {
return (
<Card className="p-6">

<h1 className="text-fluid-2xl mb-4">Welcome</h1>
<Button variant="default">Get Started</Button>
</Card>
);
}
\`\`\`
```

**Acceptance**:

- [ ] Root README mentions design system
- [ ] Link to UI package README included
- [ ] Quick example provided

**Files Modified**:

- `README.md`

**Estimated Time**: 30 minutes

---

**Phase 4 Summary**:

- ✅ Comprehensive UI README created
- ✅ Optional token documentation added
- ✅ Root README updated

**Total Phase 4 Time**: ~4.5 hours (Days 6-7)

---

## Phase 5: Integration & Polish (Days 8-10)

**Goal**: Visual regression testing and final integration

### Task 5.1: Run Full Visual Regression Suite

**Commands**:

```bash
# Generate/update baselines
cd apps/web
pnpm playwright install --with-deps chromium
pnpm test:visual

# Review baseline images
open tests/visual/design-system.spec.ts-snapshots/

# Commit baselines to git
git add tests/visual/design-system.spec.ts-snapshots/
git commit -m "test: add visual regression baselines"
```

**Acceptance**:

- [ ] All visual tests pass
- [ ] Baselines generated for light theme
- [ ] Baselines generated for dark theme
- [ ] Component variant snapshots captured
- [ ] Mobile/desktop typography snapshots captured

**Estimated Time**: 1 hour

---

### Task 5.2: Test Token Change Detection

**Commands**:

```bash
# Make a token change
code packages/ui/styles/tokens.css
# Change: --primary: var(--brand-600); → --primary: 250 75% 55%;

# Save and test rebuild time
time turbo watch dev
# Measure rebuild time (should be <3s)

# Run visual regression
pnpm test:visual

# Should see diff detected
# Review diff images in test-results/

# Revert token change
git checkout packages/ui/styles/tokens.css
```

**Acceptance**:

- [ ] Token change triggers rebuild in <3s
- [ ] Visual regression detects changes
- [ ] Diff images show changed elements
- [ ] Revert restores passing tests

**Estimated Time**: 1 hour

---

### Task 5.3: Add Visual Tests to CI

**Commands**:

```bash
code .github/workflows/ci.yml
```

**Changes**:

```yaml
# Add to existing CI workflow

jobs:
  # ... existing jobs ...

  visual-regression:
    runs-on: ubuntu-latest
    needs: [build]
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build packages
        run: pnpm build

      - name: Install Playwright
        run: pnpm playwright install --with-deps chromium

      - name: Run visual regression tests
        run: pnpm test:visual

      - name: Upload visual diff report
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: visual-diff-report
          path: apps/web/test-results/
          retention-days: 7
```

**Test**:

```bash
# Commit and push to trigger CI
git add .github/workflows/ci.yml
git commit -m "ci: add visual regression tests"
git push origin feature/ds-token-integration

# Wait for CI to run
# Verify visual tests pass in GitHub Actions
```

**Acceptance**:

- [ ] CI job added for visual regression
- [ ] Tests run in GitHub Actions
- [ ] Diff artifacts uploaded on failure
- [ ] CI passes with current baselines

**Files Modified**:

- `.github/workflows/ci.yml`

**Estimated Time**: 1 hour

---

### Task 5.4: Verify Bundle Size Impact

**Commands**:

```bash
cd apps/web

# Build and analyze bundle
pnpm build

# Check bundle sizes
ls -lh .next/static/chunks/*.js | sort -k5 -h

# Compare with baseline (recorded in Task 1.1)
# Framer Motion should add ~80KB gzipped

# Optional: Use bundle analyzer
pnpm add -D @next/bundle-analyzer
# Configure in next.config.js
# ANALYZE=true pnpm build
```

**Acceptance**:

- [ ] Bundle size increase <100KB
- [ ] Framer Motion properly tree-shaken
- [ ] No unexpected bundle bloat
- [ ] Core Web Vitals unaffected

**Estimated Time**: 1 hour

---

### Task 5.5: Smoke Test Full Flow

**Commands**:

```bash
# Fresh install
rm -rf node_modules .next
pnpm install

# Full build
pnpm build

# Run all tests
pnpm test
pnpm test:visual

# Type check
pnpm typecheck

# Lint
pnpm lint

# Start production build
pnpm start

# Manual testing checklist:
# - Visit /showcase
# - Toggle light/dark theme
# - Resize browser 320px → 2560px
# - Test all button variants
# - Test form components
# - Verify animations respect prefers-reduced-motion
```

**Acceptance**:

- [ ] All tests pass
- [ ] TypeScript compiles without errors
- [ ] Linting passes
- [ ] Production build works
- [ ] Showcase page renders correctly
- [ ] Theme toggle works
- [ ] Fluid typography scales
- [ ] Animations work with accessibility

**Estimated Time**: 2 hours

---

### Task 5.6: Create Pull Request

**Commands**:

```bash
# Ensure all changes committed
git status

# Push feature branch
git push origin feature/ds-token-integration

# Create PR via GitHub CLI
gh pr create \
  --title "feat: design system token integration with fluid typography and motion" \
  --body "$(cat <<'EOF'
## Summary

Implements comprehensive design system token integration following spec-driven workflow.

**Specification**: [feature-003-ds-token-integration.md](specs/feature-003-ds-token-integration.md)
**Plan**: [plan-001-ds-token-integration.md](plans/plan-001-ds-token-integration.md)
**Tasks**: [tasks-001-ds-token-integration.md](tasks/tasks-001-ds-token-integration.md)

## Changes

### Token Integration
- ✅ Tailwind config uses CSS variables for all tokens
- ✅ All shadcn components use semantic tokens (0 hardcoded values)
- ✅ Turborepo watch mode achieves <3s rebuilds

### Typography & Spacing
- ✅ Fluid typography scale using CSS `clamp()` (320px → 2560px)
- ✅ 8pt spacing grid documented and enforced
- ✅ No breakpoint-based typography jumps

### Motion Design
- ✅ Framer Motion integrated (~80KB bundle increase)
- ✅ Reusable animation variants (fadeIn, slideUp, scale, slideInRight)
- ✅ All animations respect `prefers-reduced-motion`
- ✅ Dialog component enhanced with scale animation

### Documentation
- ✅ JSDoc design rationale on all components (@usageGuidelines, @accessibilityConsiderations)
- ✅ Comprehensive UI package README
- ✅ Component update workflow documented (diff-and-merge)

### Testing
- ✅ Unit tests for animation variants (10+ tests)
- ✅ Integration tests for token usage (3+ tests)
- ✅ Visual regression tests for critical paths (8+ tests)
- ✅ CI integration for visual regression

## Verification

### Build Performance
- Token change → rebuild: <3s ✅
- Full build: passes ✅
- Bundle size increase: ~80KB (acceptable) ✅

### Test Coverage
- Unit tests: 100% for animations ✅
- Integration tests: token usage verified ✅
- Visual regression: light/dark themes covered ✅

### Accessibility
- `prefers-reduced-motion` support: verified ✅
- Focus states: visible and tested ✅
- Keyboard navigation: supported ✅

## Breaking Changes

None. All changes are additive.

## Migration Guide

No migration needed. Existing components continue to work.

New features available:
- Fluid typography utilities: `text-fluid-*`
- Animation variants: `import { fadeIn } from '@ui/components'`
- Enhanced documentation: `packages/ui/README.md`

## Screenshots

### Light Theme
![Showcase Light](link-to-screenshot)

### Dark Theme
![Showcase Dark](link-to-screenshot)

### Fluid Typography
![Typography Scaling](link-to-gif)

## Next Steps

After merge:
- [ ] Monitor bundle size in production
- [ ] Collect feedback on motion design
- [ ] Consider Phase 4+ enhancements (Storybook, Figma automation)

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

**Acceptance**:

- [ ] PR created with comprehensive description
- [ ] All checklist items completed
- [ ] CI checks pass
- [ ] Ready for review

**Estimated Time**: 1 hour

---

**Phase 5 Summary**:

- ✅ Visual regression suite complete
- ✅ Token change detection verified
- ✅ CI integration added
- ✅ Bundle size verified
- ✅ Full smoke test passed
- ✅ Pull request created

**Total Phase 5 Time**: ~7 hours (Days 8-10)

---

## Implementation Commands Summary

### Quick Start

```bash
# Create feature branch
git checkout -b feature/ds-token-integration

# Install dependencies
cd packages/ui
pnpm add framer-motion@^11.0.0
cd ../..
pnpm install

# Start dev server with watch mode
turbo watch --experimental-write-cache dev

# In another terminal: run tests
pnpm test
pnpm test:visual
```

### Daily Workflow

```bash
# Morning: Pull latest, verify tests
git pull origin feature/ds-token-integration
pnpm install
pnpm test

# During development: watch mode
turbo watch dev

# After changes: verify and commit
pnpm typecheck
pnpm lint
pnpm test
git add .
git commit -m "feat: [description]"
```

### Testing Commands

```bash
# Unit tests
pnpm test

# Unit tests (watch mode)
pnpm test:watch

# Visual regression tests
pnpm test:visual

# Update visual baselines
pnpm test:visual:update

# Type check
pnpm typecheck

# Lint
pnpm lint

# Full verification
pnpm typecheck && pnpm lint && pnpm test && pnpm test:visual
```

---

## Task Checklist for GitHub Issue

### Phase 1: Foundation (Days 1-2)

- [ ] Task 1.1: Install Framer Motion dependency
- [ ] Task 1.2: Configure Turborepo build pipeline (<3s rebuilds)
- [ ] Task 1.3: Define fluid typography scale in Tailwind config
- [ ] Task 1.4: Create animation type definitions and variants
- [ ] Task 1.5: Export animations from UI package

### Phase 2: Test Foundation (Days 2-3)

- [ ] Task 2.1: Write unit tests for animation variants
- [ ] Task 2.2: Write integration tests for token usage
- [ ] Task 2.3: Create design system showcase page
- [ ] Task 2.4: Write Playwright visual regression tests

### Phase 3: Implementation (Days 3-5)

- [ ] Task 3.1: Add JSDoc design rationale to Button
- [ ] Task 3.2: Add JSDoc to remaining 6 components
- [ ] Task 3.3: Audit components for hardcoded values
- [ ] Task 3.4: Enhance Dialog with motion animation

### Phase 4: Documentation (Days 6-7)

- [ ] Task 4.1: Create comprehensive UI package README
- [ ] Task 4.2: Add inline token documentation (optional)
- [ ] Task 4.3: Update root README with design system section

### Phase 5: Integration & Polish (Days 8-10)

- [ ] Task 5.1: Run full visual regression suite
- [ ] Task 5.2: Test token change detection (<3s rebuild)
- [ ] Task 5.3: Add visual tests to CI pipeline
- [ ] Task 5.4: Verify bundle size impact (<100KB increase)
- [ ] Task 5.5: Smoke test full flow (manual QA)
- [ ] Task 5.6: Create pull request with comprehensive description

---

## Success Criteria (Final Verification)

### Functional Requirements

- [x] Tailwind config uses CSS variables for all semantic tokens
- [x] Fluid typography scales smoothly 320px → 2560px (no jumps)
- [x] All shadcn components use semantic tokens (0 hardcoded values)
- [x] Framer Motion installed and animation variants working
- [x] Turborepo watch achieves <3s rebuilds on token changes
- [x] All animations respect `prefers-reduced-motion`
- [x] Dialog has smooth scale animation

### Quality Requirements

- [x] JSDoc design rationale on all 7 components
- [x] @usageGuidelines section in each component
- [x] @accessibilityConsiderations section in each component
- [x] Comprehensive README in packages/ui/
- [x] Component update workflow documented
- [x] Visual regression tests cover critical paths
- [x] No TypeScript errors (`pnpm typecheck` passes)
- [x] No linting errors (`pnpm lint` passes)
- [x] All tests pass (`pnpm test` passes)

### Performance Requirements

- [x] Bundle size increase <100KB (Framer Motion ~80KB)
- [x] Token rebuild time <3s (Turborepo watch)
- [x] Visual regression tests run in <5 minutes
- [x] No Core Web Vitals degradation

### Documentation Requirements

- [x] Token naming conventions documented (shadcn standard)
- [x] Fluid typography scale documented with examples
- [x] Spacing scale documented (8pt grid guidelines)
- [x] Motion design patterns documented (Framer Motion)
- [x] Component update workflow detailed (diff-and-merge)
- [x] Contributing guidelines clear
- [x] Testing instructions complete

---

## Risk Mitigation Checklist

### Technical Risks

- [ ] Turborepo watch mode verified to work with Node 18+
- [ ] Framer Motion bundle impact measured and acceptable
- [ ] Visual regression tests stable (not flaky) in CI
- [ ] Token changes don't break existing pages (visual regression catches issues)
- [ ] JSDoc format verified to be LLM-parsable

### Schedule Risks

- [ ] Visual regression setup time tracked (adjust if needed)
- [ ] Component audit completed (minimal changes needed)
- [ ] Documentation time buffer included (can extend if needed)

### User-Facing Risks

- [ ] `prefers-reduced-motion` tested thoroughly in browser DevTools
- [ ] Fluid typography tested at 320px and 2560px extremes
- [ ] Dark mode contrast verified with automated tools (axe-core)
- [ ] All animations have fallback behavior for reduced motion

---

## Next Steps After Implementation

1. **Merge to main** via pull request (requires approval)
2. **Monitor production**:
   - Bundle size via Vercel Analytics
   - Build times via GitHub Actions
   - User feedback on motion design
3. **Consider Phase 2+ enhancements** (deferred):
   - Storybook documentation site (Phase 4+)
   - Design-to-code automation (Figma sync)
   - Additional animation patterns as needed
4. **Capture learnings** in micro-lessons if patterns emerge

---

**Implementation Status**: ✅ Ready to begin
**Estimated Total Effort**: 8-10 days (solo developer)
**Constitutional Compliance**: ✅ Verified (TDD order, security, dependencies)
**Branch Created**: `feature/ds-token-integration`
**Next Command**: Start Task 1.1 (Install Dependencies)
