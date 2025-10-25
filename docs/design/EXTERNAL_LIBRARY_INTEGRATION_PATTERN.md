# External Library Integration Pattern

## Overview

This document captures the proven integration pattern from Issue #191 (Tremor) to be reused for TanStack Table (#192) and dnd-kit (#193).

**Status:** ✅ Pattern validated with Tremor implementation
**Source:** [component-library-analysis-2024-10.md](../scratch/component-library-analysis-2024-10.md)

---

## Success Criteria (Must Have)

Before marking any external library integration as complete, verify ALL of these:

### 1. ✅ Design Token Integration
- [ ] Library colors mapped to CSS variables in `tailwind.config.ts`
- [ ] Border radius tokens configured (if applicable)
- [ ] Components automatically adapt to light/dark mode
- [ ] NO hardcoded colors in component implementations

### 2. ✅ Component Implementation
- [ ] Working example component imported via `/design import <library> <Component>`
- [ ] Component lives in `packages/ui/src/components/ui/`
- [ ] Test file generated (`*.test.tsx`)
- [ ] Viewer examples file created (`VIEWER_EXAMPLES.md`)
- [ ] Component registry updated

### 3. ✅ Examples Route
- [ ] Dedicated route created: `/design/external/<library>`
- [ ] Live example with actual component (not placeholder)
- [ ] Visual callout explaining design token integration
- [ ] Import instructions provided
- [ ] Placeholder cards for remaining components

### 4. ✅ Documentation
- [ ] Library documented in `docs/design/EXTERNAL_LIBRARIES.md`
- [ ] Usage examples with design tokens
- [ ] Decision tree updated
- [ ] Available components listed

### 5. ✅ Main Design Viewer Integration
- [ ] Library card in `/design` page
- [ ] Clickable link to `/design/external/<library>`
- [ ] "View examples →" affordance
- [ ] Available component count shown

### 6. ✅ Research Alignment
- [ ] Implementation matches research document recommendations
- [ ] Conversion feasibility rating justified
- [ ] Architectural compatibility verified
- [ ] Copy-paste or headless pattern followed

---

## Step-by-Step Integration Process

### Phase 1: Token Mapping (CRITICAL)

**Location:** `apps/web/tailwind.config.ts`

**For each library, add:**

```typescript
// In theme.extend.colors:
'<library>-brand': 'hsl(var(--primary))',
'<library>-brand-subtle': 'hsl(var(--primary) / 0.1)',
'<library>-background': 'hsl(var(--background))',
'<library>-content': 'hsl(var(--foreground))',
'<library>-border': 'hsl(var(--border))',

// In theme.extend.borderRadius (if needed):
'<library>-default': 'var(--radius)',
'<library>-small': 'calc(var(--radius) - 4px)',
```

**Tremor Example:**
```typescript
colors: {
  'tremor-brand': 'hsl(var(--primary))',
  'tremor-background': 'hsl(var(--background))',
  // ... etc
}
```

### Phase 2: Import Example Component

**Command:**
```bash
/design import <library> <ComponentName>
```

**Outcome:**
- Component created in `packages/ui/src/components/ui/<component-name>/`
- Test file auto-generated
- VIEWER_EXAMPLES.md created
- Component registry updated

**Validate:**
- Component uses token-mapped colors (NOT hardcoded)
- JSDoc explains token integration
- Example shows design system usage

### Phase 3: Create Examples Route

**Location:** `apps/web/src/app/design/external/<library>/page.tsx`

**Template Structure:**
```tsx
'use client';

import { Component } from '@ui/...';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@ui/...';
import Link from 'next/link';

export default function LibraryExamplesPage() {
  return (
    <div className="container mx-auto p-8">
      {/* Breadcrumb back to design system */}
      <Link href="/design">← Back to Design System</Link>

      {/* Header */}
      <h1>Library Components</h1>
      <p>Description...</p>

      {/* Import Instructions Card */}
      <Card className="border-blue-200 dark:border-blue-800">
        <CardContent>
          <code>/design import library ComponentName</code>
        </CardContent>
      </Card>

      {/* Live Example */}
      <Card>
        <CardHeader>
          <CardTitle>ComponentName Example</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Working component */}
          <Component {...props} />

          {/* Design Token Callout */}
          <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg">
            <p>✅ Design Token Integration</p>
            <p>Components use design system via tailwind.config.ts</p>
          </div>
        </CardContent>
      </Card>

      {/* Placeholder Cards for other components */}
      <Card className="opacity-60">
        <CardContent>
          <p>Not yet imported</p>
          <code>/design import library OtherComponent</code>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Phase 4: Update Main Design Page

**Location:** `apps/web/src/app/design/page.tsx`

**Find External Libraries section, add:**

```tsx
<Link href="/design/external/<library>" className="block">
  <div className="p-4 rounded-lg ... hover:border-blue-300 transition-colors">
    <h3>Library Name</h3>
    <p>Use case description</p>
    <div className="flex flex-wrap gap-1">
      <span className="badge">Component1</span>
      <span className="badge">Component2</span>
      <span className="badge">+N more</span>
    </div>
    <div className="flex items-center justify-between">
      <code>/design import library</code>
      <span className="text-blue-600">View examples →</span>
    </div>
  </div>
</Link>
```

### Phase 5: Documentation

**Update `docs/design/EXTERNAL_LIBRARIES.md`:**

```markdown
### Library Name - Use Case

**When to use:** Specific scenarios

**Why approved:**
- Reason 1 (matches research)
- Reason 2
- License, maintenance status

**Available components:**
- Component1 - Description
- Component2 - Description

**How to use:**
\`\`\`bash
/design import library ComponentName
\`\`\`

**Documentation:** Link
```

---

## Library-Specific Patterns

### Tremor (Data Visualization)

**Token Strategy:** Map Tremor's semantic colors
```typescript
'tremor-brand': 'hsl(var(--primary))',
'tremor-brand-subtle': 'hsl(var(--primary) / 0.1)',
```

**Component Usage:**
```tsx
<LineChart
  data={data}
  colors={['blue', 'cyan']} // Tremor palette, themed via config
/>
```

**Key Learning:** Tremor uses its own color names but expects Tailwind colors. Map semantic names in config.

---

### TanStack Table (Advanced Data Grids)

**Token Strategy:** Headless - NO color mapping needed
- Render custom markup using shadcn components
- Apply CSS variables directly to rendered elements

**Component Pattern:**
```tsx
<Table>
  <TableHeader>
    {table.getHeaderGroups().map((headerGroup) => (
      <TableRow key={headerGroup.id}>
        {headerGroup.headers.map((header) => (
          <TableHead key={header.id}>
            {/* Use shadcn TableHead component */}
          </TableHead>
        ))}
      </TableRow>
    ))}
  </TableHeader>
</Table>
```

**Key Learning:** TanStack provides logic ONLY. We control 100% of markup/styling.

---

### dnd-kit (Drag & Drop)

**Token Strategy:** Headless - NO color mapping needed
- Apply design tokens to draggable elements
- Use shadcn Card/Button components as drag handles

**Component Pattern:**
```tsx
const {attributes, listeners, setNodeRef} = useDraggable({id: 'item'});

<Card ref={setNodeRef} {...attributes} {...listeners}>
  {/* shadcn Card styled with our tokens */}
</Card>
```

**Key Learning:** dnd-kit provides hooks. We render our own components.

---

## Quality Checklist

Before closing any library integration issue:

### Functionality
- [ ] `/design import <library> <Component>` command works
- [ ] Component renders correctly in example route
- [ ] Component uses design tokens (verified via DevTools)
- [ ] Light/dark mode toggle works

### Code Quality
- [ ] TypeScript types are correct
- [ ] No `any` types (except documented exceptions)
- [ ] ESLint passes
- [ ] Biome formatting applied
- [ ] Tests exist and pass

### Documentation
- [ ] JSDoc on component interfaces
- [ ] Token integration explained
- [ ] Import examples provided
- [ ] Research alignment verified

### User Experience
- [ ] Example route loads without errors
- [ ] Navigation back to /design works
- [ ] Placeholder cards show for unimported components
- [ ] Import instructions are clear

---

## Anti-Patterns (Avoid These)

❌ **Hardcoded Colors**
```tsx
// BAD
colors={['#3B82F6', '#EF4444']}

// GOOD
colors={['blue', 'red']} // Themed via tailwind.config.ts
```

❌ **Pre-importing All Components**
```bash
# BAD - Don't import everything upfront
/design import tremor LineChart
/design import tremor BarChart
/design import tremor AreaChart
# ... etc

# GOOD - Import one example, document others
/design import tremor LineChart  # One working example
# Document that BarChart, AreaChart, etc. are AVAILABLE
```

❌ **Missing Token Integration Callout**
```tsx
// BAD - User doesn't understand theming
<Component data={data} />

// GOOD - Explain token integration visually
<Component data={data} />
<div className="callout">
  ✅ Design Token Integration
  <p>Colors use our design system via tailwind.config.ts</p>
</div>
```

❌ **Library-Specific Styling Systems**
```tsx
// BAD - Using library's proprietary theming
<MantineProvider theme={customTheme}>
  <Component />
</MantineProvider>

// GOOD - Headless or Tailwind-native only
<Component /> {/* Uses our tailwind.config */}
```

---

## Validation Script

Run these commands to verify integration:

```bash
# 1. Check token mappings exist
grep -A10 "<library>" apps/web/tailwind.config.ts

# 2. Verify component import worked
ls packages/ui/src/components/ui/<component-name>/

# 3. Check example route exists
ls apps/web/src/app/design/external/<library>/

# 4. Verify main page links to examples
grep "/design/external/<library>" apps/web/src/app/design/page.tsx

# 5. Run tests
pnpm test --filter=@ui/components

# 6. Type check
pnpm typecheck

# 7. Visual test
# Open http://localhost:3000/design/external/<library>
# Toggle light/dark mode - verify colors adapt
```

---

## Decision Matrix: When to Use Which Approach

### Styled Library (Tremor, NextUI)
✅ **Use when:** Library is Tailwind-native
📋 **Approach:** Token mapping in `tailwind.config.ts`
⚠️ **Effort:** Low (one-time config)

### Headless Library (TanStack Table, dnd-kit, React Aria)
✅ **Use when:** Library provides logic only
📋 **Approach:** Compose with shadcn components
⚠️ **Effort:** Medium (build custom UI)

### Opinionated Library (Mantine, Ant Design)
❌ **Avoid:** Incompatible styling system
📋 **Alternative:** Use headless library instead
⚠️ **Effort:** High (maintenance burden)

---

## Success Metrics

Track these for each library integration:

- **Import time:** < 2 minutes from command to working component
- **Token coverage:** 100% of colors use CSS variables
- **Light/dark mode:** Seamless toggle with no hardcoded colors
- **Documentation:** All 4 docs updated (EXTERNAL_LIBRARIES.md, examples route, VIEWER_EXAMPLES.md, component JSDoc)
- **User feedback:** No confusion about how to import or customize

---

## Lessons Learned (Tremor Integration)

### What Went Well ✅
1. **Token mapping was straightforward** - Research document provided exact pattern
2. **`/design import` command worked perfectly** - Infrastructure already existed
3. **Example route template was clear** - Easy to replicate for other libraries
4. **Visual callout about tokens** - Helped users understand theming

### What Could Be Better 🔄
1. **Initial PR missing token integration** - Should be done upfront, not as followup
2. **Doctor check failed** - Need to validate before pushing
3. **Research document wasn't referenced initially** - Should read research FIRST

### For Next Libraries 📝
1. **Start with research document** - Read relevant section BEFORE implementation
2. **Token mapping FIRST** - Add to tailwind.config.ts before importing components
3. **Validate with visual test** - Actually toggle light/dark mode to verify
4. **Update all 4 docs together** - Don't leave any out

---

## Merge Criteria

✅ **Ready to merge when:**
- All 6 success criteria met (see top of document)
- CI checks pass (including doctor)
- Visual testing complete (light/dark mode verified)
- Research alignment confirmed
- Integration pattern followed exactly

🔄 **Not ready if:**
- Hardcoded colors found
- Token mapping missing
- Example route not functional
- CI checks failing
- Research recommendations not followed

---

## Related Documents

- [External Libraries Guide](./EXTERNAL_LIBRARIES.md) - User-facing documentation
- [Component Workflow](../COMPONENT_WORKFLOW.md) - Component selection priority
- [Component Library Research](../scratch/component-library-analysis-2024-10.md) - Analysis and recommendations
- [Design System Context](./CONTEXT.md) - AI integration guide

---

**Last Updated:** 2025-10-25 (Tremor integration)
**Next Review:** After TanStack Table integration (#192)
