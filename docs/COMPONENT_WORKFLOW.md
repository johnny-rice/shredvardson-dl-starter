# Component Selection Workflow

## Priority Order for Adding UI Components

When you need a new UI component, **always follow this priority order**:

### 1. Check Existing Components First ✅

```bash
# List all available UI components
ls packages/ui/src/components/ui/
```

**Current components:**

- button
- card
- dialog
- input
- label
- select
- section-header
- Link

### 2. Check shadcn/ui Library 🔍

Before creating a custom component, check if shadcn/ui has it:

**Browse available components:**

- [ShadCN UI Components](https://ui.shadcn.com/docs/components)

**Common components you might need:**

- `navigation-menu` - For app navigation with active states
- `dropdown-menu` - For dropdown menus
- `tabs` - For tabbed interfaces
- `sheet` - For slide-out panels
- `toast` - For notifications
- `form` - For form handling with validation
- `table` - For data tables
- `badge` - For status indicators
- `avatar` - For user avatars
- `separator` - For visual dividers

**To add a shadcn component:**

```bash
cd packages/ui
npx shadcn@latest add <component-name>
```

**Example:**

```bash
cd packages/ui
npx shadcn@latest add navigation-menu
```

This will:

- Download the component to `packages/ui/src/components/ui/`
- Set up all necessary dependencies
- Configure TypeScript types

### 3. Check Approved External Libraries 📚

If shadcn/ui doesn't have what you need, we have **Tier 1 approved libraries** for specialized use cases:

**🎯 Tier 1 - Core Extensions** (Always ask before using):

1. **Tremor** - Data visualization
   - Use for: Charts, graphs, KPI cards, dashboards
   - Why: Tailwind-native, copy-paste model (like shadcn)
   - Bundle: +15kb
   - License: Apache-2.0
   - Docs: [tremor.so](https://tremor.so)

2. **TanStack Table** - Advanced data grids
   - Use for: Sortable/filterable tables, pagination, virtualization
   - Why: Headless (perfect for theming), handles 10k+ rows
   - Bundle: +45kb
   - License: MIT
   - Docs: [tanstack.com/table](https://tanstack.com/table)

3. **dnd-kit** - Drag-and-drop
   - Use for: Kanban boards, sortable lists, reorderable grids
   - Why: Headless, modern, accessible, touch-friendly
   - Bundle: +35kb
   - License: MIT
   - Docs: [dndkit.com](https://dndkit.com)

4. **React Aria** - Build-from-scratch toolkit
   - Use for: Custom components with complex interactions
   - Why: Adobe-maintained, WCAG AA compliant, headless hooks
   - Bundle: Varies
   - License: Apache-2.0
   - Docs: [react-spectrum.adobe.com/react-aria](https://react-spectrum.adobe.com/react-aria)

**Decision Tree:**

```
Need a component?
│
├─ Chart/Graph/Visualization? ──────────→ Tremor
│
├─ Data Table?
│  ├─ Simple display ─────────────────→ shadcn Table
│  └─ Advanced (sort/filter/10k+ rows) → TanStack Table
│
├─ Drag-and-drop/Kanban? ───────────────→ dnd-kit
│
├─ Complex custom component? ───────────→ React Aria (build)
│
└─ Anything else? ─────────────────────→ Check shadcn first, then ask
```

**⚠️ IMPORTANT: Always ask before importing external libraries!**

These libraries were chosen because they:

- ✅ Work with Tailwind CSS or are headless
- ✅ Have MIT/Apache-2.0 licenses
- ✅ Are actively maintained
- ✅ Are RSC compatible
- ✅ Have small bundle impact
- ✅ Align with "code ownership" philosophy

### 4. Build Custom Component (Last Resort) 🔨

**Only build custom when:**

- No existing component fits the use case
- The component is highly project-specific
- Existing components would require too much modification

**Before building custom, ask:**

1. "Does shadcn/ui have this?" (Check docs)
2. "Can I compose existing components?" (Combine button + card, etc.)
3. "Is this truly unique to this project?"

## Decision Tree

```
Need a component?
│
├─ Does it exist in packages/ui/src/components/ui/? ──────────── YES → Use it ✅
│                                                              └─ NO ↓
│
├─ Does shadcn/ui have it? ───────────────────────────────────── YES → Ask user, then `npx shadcn add <name>` ✅
│                                                              └─ NO ↓
│
├─ Is it in approved libraries (Tremor/TanStack/dnd-kit/React Aria)?
│  ├─ Data viz? ─────────────────────────────────────────────→ Ask about Tremor
│  ├─ Advanced table? ────────────────────────────────────────→ Ask about TanStack Table
│  ├─ Drag-and-drop? ─────────────────────────────────────────→ Ask about dnd-kit
│  └─ Complex custom? ────────────────────────────────────────→ Ask about React Aria
│                                                              └─ NO ↓
│
├─ Can I compose existing components? ────────────────────────── YES → Compose them ✅
│                                                              └─ NO ↓
│
└─ Build custom (document why existing solutions don't work) ✅
```

## AI Agent Guidelines

**When an AI agent needs a component, it should:**

1. **First**: Check existing components in `packages/ui/src/components/ui/`

   ```bash
   ls packages/ui/src/components/ui/
   ```

2. **Second**: Check shadcn/ui docs
   - Browse: [ui.shadcn.com/docs/components](https://ui.shadcn.com/docs/components)
   - If found: Propose adding it

3. **Third**: Check if it matches an approved external library category:
   - **Charts/graphs** → Tremor
   - **Advanced tables** → TanStack Table
   - **Drag-and-drop** → dnd-kit
   - **Complex custom** → React Aria

4. **Always ask before installing anything:**

   ```
   "I need a [component] for [use case].

   Options:
   1. [Library]: [Component name]
      - Why: [Reason it fits]
      - Bundle: +[size]kb
      - Time: ~[estimate]

   2. Build custom
      - Time: ~[estimate]
      - Full control

   Which would you prefer?"
   ```

5. **Wait for user approval** before:
   - Running `npx shadcn add`
   - Installing external libraries
   - Building custom components

6. **Document** the decision and reasoning

## Examples

### ✅ Good Example 1: shadcn Component

```
User: "I need a navigation component with active states"

AI: "I need a navigation component with active states.

     ✅ Checked existing: No navigation component in packages/ui/
     ✅ Checked shadcn: Yes! They have 'navigation-menu'
        https://ui.shadcn.com/docs/components/navigation-menu

     Should I add it with: `npx shadcn add navigation-menu`?
     Or would you prefer a custom solution?"

User: "Add the shadcn component"

AI: [Runs: cd packages/ui && npx shadcn add navigation-menu]
```

### ✅ Good Example 2: External Library (Data Viz)

```
User: "Add a line chart showing monthly sales"

AI: "I need a line chart component.

     ✅ Checked existing: No chart components in packages/ui/
     ✅ Checked shadcn: No chart components
     ✅ Checked approved libraries: Tremor has LineChart

     Options:
     1. Tremor LineChart (recommended)
        - Tailwind-native, matches our design system
        - Bundle: +15kb
        - Time: ~10 minutes to integrate

     2. Build custom with Recharts
        - Full control
        - Time: ~4 hours
        - Bundle: ~same

     Use Tremor? Or would you prefer to build custom?"

User: "Use Tremor"

AI: [Installs Tremor, imports LineChart, converts to use design tokens]
```

### ✅ Good Example 3: Advanced Table

```
User: "Create a data table with sorting, filtering, and pagination for 10k rows"

AI: "I need an advanced data table.

     ✅ Checked existing: We have shadcn Table (basic only)
     ✅ Checked requirements: Need sorting, filtering, pagination, 10k+ rows
     ✅ Recommendation: TanStack Table (headless, perfect for our tokens)

     Options:
     1. TanStack Table template
        - Handles all requirements
        - Headless (full control over styling)
        - Bundle: +45kb
        - Time: ~2 hours to customize

     2. Extend shadcn Table
        - Would need to build sorting/filtering manually
        - Time: ~8 hours
        - Performance issues with 10k rows

     Use TanStack Table template?"

User: "Yes"

AI: [Generates TanStack Table scaffold with our design tokens]
```

### ❌ Bad Example: Skip Checking

```
AI: "I'll create a custom navigation component."

    [Creates CustomNav.tsx without checking shadcn or asking user]
```

## Quick Reference Commands

### shadcn/ui Commands

```bash
# List existing components
ls packages/ui/src/components/ui/

# Browse shadcn components
open https://ui.shadcn.com/docs/components

# Add shadcn component (from packages/ui/)
cd packages/ui
npx shadcn@latest add <component-name>

# Add multiple components at once
npx shadcn@latest add navigation-menu dropdown-menu tabs

# See what would be added (dry run)
npx shadcn@latest diff <component-name>
```

### External Library Quick Links

```bash
# Check approved libraries documentation
open https://tremor.so                              # Data viz
open https://tanstack.com/table                     # Advanced tables
open https://dndkit.com                             # Drag-and-drop
open https://react-spectrum.adobe.com/react-aria    # Build custom
```

### Installation Commands (After User Approval)

```bash
# Tremor (charts)
pnpm add @tremor/react

# TanStack Table (data grids)
pnpm add @tanstack/react-table

# dnd-kit (drag-and-drop)
pnpm add @dnd-kit/core @dnd-kit/sortable

# React Aria (custom components)
pnpm add react-aria-components
```

## Design System Control

**User maintains control by:**

- Approving all new component additions
- Reviewing shadcn components before installation
- Deciding between shadcn vs custom solutions
- Keeping the design system cohesive and intentional

**Never auto-install components without asking first!**
