# Complete Design System Roadmap

**Date:** 2025-10-16
**Status:** Planning

This document outlines ALL the work needed to complete the DL Starter design system, combining:

1. Original recommendations from AI Design Systems Research Report review
2. New findings from UX pattern documentation research
3. Your requirements as a product designer

---

## Current State Assessment

### What We Have ✅

- [x] Monorepo with Turborepo
- [x] shadcn/ui components installed in `packages/ui`
- [x] Tailwind CSS configured
- [x] Basic CSS variables in `globals.css`
- [x] ~15 core components (Button, Input, Card, Dialog, Select, etc.)
- [x] Light/dark theme support

### What We're Missing ❌

- [ ] Formalized token structure (primitive → semantic → component)
- [ ] Motion tokens (durations, easings)
- [ ] Component API documentation (JSDoc with examples)
- [ ] UX pattern documentation (error states, empty states, forms, loading)
- [ ] Design foundations documentation (color usage, typography hierarchy, spacing)
- [ ] Visual component viewer (`/design` route or similar)
- [ ] Visual theme editor workflow (TweakCN integration)
- [ ] Accessibility validation in CI (axe-core)
- [ ] Visual regression testing (Chromatic or similar)
- [ ] CONTEXT.md for LLMs
- [ ] Contribution guidelines

---

## Complete Task Breakdown

### Phase 1: Foundation (CRITICAL) - ~24-28 hours

#### Task 1.1: Formalize Design Token Structure (~4 hours)

**File:** `packages/ui/src/globals.css`

**Current state:** We have basic CSS variables, but they're not systematically organized.

**What to do:**

1. Reorganize tokens into 3-tier structure:
   - **Primitives**: `--color-blue-500`, `--space-4`, `--radius-md`
   - **Semantic**: `--color-background-primary`, `--color-text-primary`, `--space-section`
   - **Component**: `--button-primary-bg`, `--input-border-color`

2. Add missing token categories:
   - Typography scale (sizes, line-heights, font-weights)
   - Spacing scale (consistent rhythm)
   - Border radius scale
   - Shadow scale

**Example structure:**

```css
:root {
  /* Primitives - Raw values */
  --color-blue-500: oklch(0.6 0.18 255);
  --color-gray-50: oklch(0.98 0 0);
  --space-1: 0.25rem;
  --space-2: 0.5rem;

  /* Semantic - Purpose-driven */
  --color-background-primary: var(--color-gray-50);
  --color-background-secondary: var(--color-gray-100);
  --color-text-primary: var(--color-gray-900);
  --color-border: var(--color-gray-300);

  /* Component - Specific usage */
  --button-primary-bg: var(--color-blue-500);
  --button-primary-text: white;
  --input-border-default: var(--color-border);
}
```

**Deliverable:** Well-organized `globals.css` with clear token hierarchy

**Related Issue:** Part of #145 foundations documentation

---

#### Task 1.2: Add Motion Tokens (~2 hours)

**File:** `packages/ui/src/globals.css`

**What to do:**

1. Define duration tokens:

   ```css
   --motion-duration-instant: 100ms;
   --motion-duration-fast: 150ms;
   --motion-duration-normal: 250ms;
   --motion-duration-slow: 400ms;
   ```

2. Define easing tokens:

   ```css
   --motion-easing-standard: cubic-bezier(0.4, 0, 0.2, 1);
   --motion-easing-decelerate: cubic-bezier(0, 0, 0.2, 1);
   --motion-easing-accelerate: cubic-bezier(0.4, 0, 1, 1);
   ```

3. Document usage in `docs/design/foundations/motion.md`

**Deliverable:** Motion tokens + usage documentation

**Related Issue:** Part of #145 foundations documentation

---

#### Task 1.3: Add JSDoc to All Components (~6 hours)

**Files:** All components in `packages/ui/src/components/`

**What to do:**
Add comprehensive JSDoc comments to EVERY component with:

- Description of what the component does
- When to use it
- Prop descriptions with examples
- Usage examples (code)
- Accessibility notes

**Example:**

````tsx
/**
 * Primary button component for actions and navigation.
 *
 * @example
 * ```tsx
 * // Primary action
 * <Button variant="default">Save Changes</Button>
 *
 * // Destructive action
 * <Button variant="destructive">Delete Account</Button>
 * ```
 *
 * @see {@link https://ui.shadcn.com/docs/components/button shadcn/ui Button}
 *
 * @accessibility
 * - Uses semantic <button> element
 * - Keyboard accessible by default
 * - Supports aria-label for icon-only buttons
 */
export interface ButtonProps {
  /** Visual style variant */
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';

  /** Size of the button */
  size?: 'default' | 'sm' | 'lg' | 'icon';

  /** Whether button spans full width */
  asChild?: boolean;
}
````

**Why this matters for LLMs:**

- JSDoc appears in IDE autocomplete and in LLM context
- Examples serve as few-shot learning
- Clear prop descriptions reduce hallucination

**Deliverable:** All components have comprehensive JSDoc

**Related Issue:** Separate from #145 but foundational

---

#### Task 1.4: Create CONTEXT.md for LLMs (~2 hours)

**File:** `CONTEXT.md` (repo root)

**What to do:**
Create a concise briefing document that LLMs (and humans) read first when working on the project.

**Structure:**

```markdown
# DL Starter - Project Context

## Architecture

- **Type**: SaaS starter template
- **Stack**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Monorepo**: Turborepo with `apps/web` and `packages/ui`
- **Design System**: Code-first using shadcn/ui + Radix UI primitives
- **Styling**: Tailwind utility classes + CSS variables for theming

## Design System Principles

1. **Code as source of truth**: Components live in `packages/ui`, not Figma
2. **Accessible by default**: Built on Radix UI primitives
3. **AI-friendly**: JSDoc comments, clear patterns, predictable structure
4. **Lightweight**: No heavy dependencies, copy-paste components

## Key Conventions

- Components: `packages/ui/src/components/[component-name].tsx`
- Tokens: `packages/ui/src/globals.css` (primitives → semantic → component)
- Patterns: `docs/design/patterns/[pattern-name].md`
- Tests: Co-located `[file].test.tsx` files

## When Working on UI

1. Check `docs/design/patterns/` for established UX patterns
2. Use existing components from `packages/ui`
3. Follow token structure (use semantic tokens, not primitives directly)
4. Ensure accessibility (WCAG 2.1 AA minimum)
5. Add JSDoc comments with examples

## Common Tasks

- Add component: `pnpm dlx shadcn@latest add [component]`
- Run dev: `pnpm dev`
- Type check: `pnpm typecheck`
- Test: `pnpm test`
- Visual preview: Open `/design` route in dev

## References

- Design System Viewer: `/design` route
- UX Patterns: `docs/design/patterns/`
- Component Docs: JSDoc comments in source files
```

**Deliverable:** CONTEXT.md at repo root

**Related Issue:** Separate but critical for AI-assisted development

---

#### Task 1.5: UX Pattern Documentation (~10-12 hours)

**Files:** New directory `docs/design/patterns/`

**What to do:**
This is **Issue #145, Part 1**. Create 5 core pattern documents:

1. `error-handling.md` - Inline validation, toasts, error states, when to use each
2. `empty-states.md` - No data scenarios, onboarding, illustrations
3. `form-patterns.md` - Layout, validation timing, success feedback, multi-step
4. `loading-states.md` - Skeletons, spinners, progressive loading, optimistic UI
5. `accessibility.md` - Color contrast, keyboard nav, screen readers, ARIA

Each pattern doc should include:

- When to use (decision criteria)
- Code examples (using actual components)
- Accessibility requirements
- Variants (different scenarios)
- Anti-patterns (what NOT to do)

**Deliverable:** 5 pattern docs, 2-3 pages each

**Related Issue:** #145 Part 1

---

#### Task 1.6: Foundations Documentation (~4 hours)

**Files:** New directory `docs/design/foundations/`

**What to do:**
This is **Issue #145, Part 1 (continued)**. Create 3 foundation documents:

1. `color.md` - Semantic usage, contrast requirements, dark mode
2. `typography.md` - Hierarchy, when to use sizes, line-height ratios
3. `spacing.md` - Layout principles, spacing scale usage, consistency

**Deliverable:** 3 foundation docs

**Related Issue:** #145 Part 1

---

### Phase 2: Designer Tools (HIGH VALUE) - ~8-10 hours

#### Task 2.1: Build `/design` Route (~6-8 hours)

**Files:**

- `apps/web/app/design/page.tsx`
- `apps/web/app/design/components/` (helper components)

**What to do:**
This is **Issue #145, Part 2**. Create a full-featured design system showcase page.

**Features to implement:**

1. Component showcase with all variants
2. Light/dark theme toggle
3. Copy code button for each example
4. Links to pattern documentation
5. Responsive preview options
6. Search/filter components (optional)

**Example structure:**

```tsx
// apps/web/app/design/page.tsx
export default function DesignSystemPage() {
  return (
    <div className="container py-8">
      <header className="mb-12">
        <h1>Design System</h1>
        <ThemeToggle />
      </header>

      {/* Foundations Section */}
      <Section id="colors" title="Colors">
        <ColorPalette />
        <Link href="/docs/design/foundations/color.md">See color guidelines →</Link>
      </Section>

      {/* Components Section */}
      <Section id="buttons" title="Buttons">
        <ComponentGrid>
          <Preview label="Default">
            <Button>Click me</Button>
          </Preview>
          <Preview label="Destructive">
            <Button variant="destructive">Delete</Button>
          </Preview>
          {/* All variants */}
        </ComponentGrid>
        <CodeBlock src="packages/ui/src/components/button.tsx" />
      </Section>

      {/* Patterns Section */}
      <Section id="error-handling" title="Error Handling">
        <PatternExample pattern="error-handling" />
      </Section>
    </div>
  );
}
```

**Components to build:**

- `ComponentGrid` - Responsive grid layout
- `Preview` - Individual component preview with label
- `CodeBlock` - Syntax-highlighted code display (copy button)
- `Section` - Consistent section layout
- `ColorPalette` - Display all color tokens
- `PatternExample` - Show pattern implementation

**Deliverable:** Fully functional `/design` route

**Related Issue:** #145 Part 2

---

#### Task 2.2: Document TweakCN Workflow (~1 hour)

**Files:**

- `docs/design/README.md` (add section)
- Or `README.md` (designer workflow section)

**What to do:**
This is **Issue #145, Part 3**. Document the visual theme editing workflow.

**Content:**

1. What TweakCN is and why we use it
2. Step-by-step workflow:
   - Open TweakCN in browser
   - Adjust colors/radii/spacing visually
   - Export CSS variables
   - Paste into `packages/ui/src/globals.css`
   - Refresh app to see changes
3. Screenshots (optional but helpful)
4. Tips for maintaining consistency

**Deliverable:** Clear documentation for designer workflow

**Related Issue:** #145 Part 3

---

### Phase 3: Quality & Automation (CRITICAL) - ~6-8 hours

#### Task 3.1: Add Accessibility Testing with axe-core (~3 hours)

**Files:**

- `.github/workflows/ci.yml` (add axe-core check)
- `apps/web/tests/a11y/` (new directory for accessibility tests)

**What to do:**

1. Install axe-core: `pnpm add -D @axe-core/playwright`

2. Create accessibility test:

   ```typescript
   // apps/web/tests/a11y/components.test.ts
   import { test, expect } from '@playwright/test';
   import AxeBuilder from '@axe-core/playwright';

   test('design system page should be accessible', async ({ page }) => {
     await page.goto('/design');
     const results = await new AxeBuilder({ page }).analyze();
     expect(results.violations).toEqual([]);
   });
   ```

3. Add to CI workflow:

   ```yaml
   - name: Run accessibility tests
     run: pnpm test:a11y
   ```

4. Add package script:
   ```json
   {
     "scripts": {
       "test:a11y": "playwright test tests/a11y"
     }
   }
   ```

**Deliverable:** Automated accessibility testing in CI

**Priority:** HIGH (prevents accessibility debt)

---

#### Task 3.2: Add Visual Regression Testing (~3-4 hours)

**Options:**

**Option A: Chromatic (recommended, easiest)**

1. Sign up for Chromatic (free tier available)
2. Install: `pnpm add -D chromatic`
3. Add to CI:
   ```yaml
   - name: Publish to Chromatic
     uses: chromaui/action@v1
     with:
       projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
   ```

**Option B: Playwright visual comparisons (free, more complex)**

1. Add screenshot tests:
   ```typescript
   test('button variants match snapshots', async ({ page }) => {
     await page.goto('/design#buttons');
     await expect(page.locator('#buttons')).toHaveScreenshot();
   });
   ```

**Deliverable:** Visual regression testing prevents UI breaks

**Priority:** MEDIUM (nice to have, not critical at first)

---

### Phase 4: Polish & Optimization (NICE TO HAVE) - ~4-6 hours

#### Task 4.1: Create Contribution Guidelines (~2 hours)

**File:** `docs/design/CONTRIBUTING.md`

**What to do:**
Document how to:

- Add a new component
- Modify an existing component
- Add a new pattern
- Update tokens
- Run tests before submitting

**Deliverable:** Clear contribution guide

---

#### Task 4.2: Add Component Composition Examples (~2-3 hours)

**Files:** `docs/design/examples/`

**What to do:**
Create real-world examples showing how to compose components:

- Login form
- Settings page
- Data table with actions
- Modal with form
- Empty state with action

**Deliverable:** Practical composition examples

---

#### Task 4.3: Optional: Add Ladle (if /design route insufficient) (~2-3 hours)

**Only do this if:**

- `/design` route doesn't provide enough isolation
- You need true component isolation testing
- Team prefers Storybook-style workflow

**What to do:**

1. Install Ladle: `pnpm add -D @ladle/react`
2. Create stories for each component
3. Configure `.ladle/` directory
4. Add to package scripts

**Deliverable:** Ladle-based component viewer

**Priority:** LOW (only if needed)

---

## Complete Time Estimates

### By Phase:

| Phase                             | Hours           | Priority     |
| --------------------------------- | --------------- | ------------ |
| **Phase 1: Foundation**           | 24-28           | CRITICAL     |
| **Phase 2: Designer Tools**       | 8-10            | HIGH         |
| **Phase 3: Quality & Automation** | 6-8             | CRITICAL     |
| **Phase 4: Polish**               | 4-6             | NICE TO HAVE |
| **Total**                         | **42-52 hours** |              |

### By Task Priority:

| Priority                  | Tasks                                                                                       | Hours |
| ------------------------- | ------------------------------------------------------------------------------------------- | ----- |
| **CRITICAL** (Must Do)    | Token structure, Motion tokens, JSDoc, CONTEXT.md, Pattern docs, Foundations docs, axe-core | 28-32 |
| **HIGH** (Should Do)      | `/design` route, TweakCN docs                                                               | 8-10  |
| **MEDIUM** (Nice to Have) | Visual regression, Contribution guide, Examples                                             | 7-10  |
| **LOW** (Optional)        | Ladle                                                                                       | 2-3   |

---

## Recommended Implementation Order

### Sprint 1 (Week 1): Foundation + Issue #145

**Total: ~24-28 hours**

1. ✅ Token structure (4h) - Foundation for everything
2. ✅ Motion tokens (2h) - Quick win
3. ✅ UX pattern docs (10-12h) - **Issue #145 Part 1**
4. ✅ Foundations docs (4h) - **Issue #145 Part 1 continued**
5. ✅ `/design` route (6-8h) - **Issue #145 Part 2**
6. ✅ TweakCN docs (1h) - **Issue #145 Part 3**

**After Sprint 1:** You have a complete, usable design system with docs and visual viewer.

### Sprint 2 (Week 2): Code Quality

**Total: ~11 hours**

7. ✅ JSDoc on components (6h) - Better DX and AI context
8. ✅ CONTEXT.md (2h) - LLM briefing
9. ✅ axe-core testing (3h) - Accessibility validation

**After Sprint 2:** Code quality is high, LLMs have good context, accessibility is enforced.

### Sprint 3 (Optional): Polish

**Total: ~7-10 hours**

10. ⏭️ Visual regression (3-4h) - Prevent UI breaks
11. ⏭️ Contribution guide (2h) - Team onboarding
12. ⏭️ Composition examples (2-3h) - Practical guidance

---

## What Issue #145 Covers

**Issue #145** (created earlier) covers:

- ✅ UX Pattern Documentation (5 patterns)
- ✅ Foundations Documentation (3 docs)
- ✅ `/design` Route (component viewer)
- ✅ TweakCN Workflow Docs

**Estimated:** 17-21 hours

---

## What's NOT in Issue #145 (Remaining Work)

### Critical:

- Token structure formalization (4h)
- Motion tokens (2h)
- JSDoc on components (6h)
- CONTEXT.md for LLMs (2h)
- axe-core accessibility testing (3h)

**Subtotal:** ~17 hours

### Nice to Have:

- Visual regression testing (3-4h)
- Contribution guidelines (2h)
- Composition examples (2-3h)
- Ladle (optional, 2-3h)

**Subtotal:** ~9-12 hours

---

## Suggested Next Steps

### Option A: Do Everything (Complete Design System)

Create **Issue #146** for the remaining critical work:

- Token structure + motion tokens
- JSDoc on all components
- CONTEXT.md
- axe-core testing

**Total remaining:** ~17 hours critical + ~9-12 hours optional = **26-29 hours**

### Option B: Phased Approach (Recommended)

1. **Now**: Complete Issue #145 (17-21 hours) → Get usable design system with docs
2. **Next**: Issue #146 for code quality (JSDoc, CONTEXT.md) → ~8 hours
3. **Then**: Issue #147 for tokens + automation (tokens, motion, axe-core) → ~9 hours
4. **Later**: Polish (visual regression, examples) → As needed

---

## Summary

**Current Issue #145:** 17-21 hours (UX patterns + /design route + TweakCN)

**Remaining Critical Work:** ~17 hours (tokens, JSDoc, CONTEXT.md, axe-core)

**Optional Polish:** ~9-12 hours (visual regression, examples, contribution guide)

**Grand Total:** ~42-52 hours for complete, production-ready design system

**Your question was spot-on**: Yes, there's significant work beyond Issue #145 to have a truly complete design system. But the good news is Issue #145 gives you the most **designer-visible value** first (docs + viewer), and the remaining work is more technical (tokens, testing, automation).

Want me to create Issue #146 for the remaining critical work?
