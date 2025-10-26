# External Component Libraries

This document lists approved external component libraries and how to use them in the DL Starter monorepo.

## Philosophy

We follow a **component selection priority**:
1. Check existing components in `packages/ui/src/components/ui/`
2. Check [shadcn/ui](https://ui.shadcn.com) library
3. Check approved external libraries (this document)
4. Build custom only as last resort

See [COMPONENT_WORKFLOW.md](../COMPONENT_WORKFLOW.md) for complete workflow.

## Tier 1: Approved Libraries

### Tremor - Data Visualization

**When to use:** Charts, graphs, KPI cards, dashboards

**Why approved:**
- Tailwind-native (matches our design system)
- Copy-paste model (like shadcn/ui)
- Small bundle impact (+15kb gzipped)
- Apache-2.0 license
- RSC compatible

**Available components:**
- `LineChart` - Time series and trend visualization
- `BarChart` - Categorical comparisons
- `AreaChart` - Cumulative trends
- `DonutChart` - Proportional data
- `KpiCard` - Key metrics display

**How to use:**

```bash
# Import a Tremor component when needed
/design import tremor LineChart

# This will:
# 1. Install @tremor/react and recharts dependencies
# 2. Create component wrapper in packages/ui/src/components/ui/line-chart/
# 3. Generate test file
# 4. Update component registry
```

**Documentation:** https://tremor.so/docs

---

### TanStack Table - Advanced Data Grids

**When to use:** Sortable/filterable tables, pagination, virtualization, 10k+ rows

**Why approved:**
- Headless (perfect for theming with our design tokens)
- Handles large datasets efficiently
- MIT license
- Well-maintained
- RSC compatible

**Available components:**
- `DataTable` - Headless table with sorting, filtering, pagination, and row selection

**How to use:**

```bash
# Import the DataTable component
/design import tanstack-table DataTable

# This will:
# 1. Install @tanstack/react-table dependency
# 2. Create component wrapper in packages/ui/src/components/ui/data-table/
# 3. Generate test file
# 4. Update component registry
```

**Usage example:**

```tsx
import { DataTable } from '@ui/components';
import type { ColumnDef } from '@tanstack/react-table';

const columns: ColumnDef<User>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
];

<DataTable
  columns={columns}
  data={users}
  enableSorting
  enablePagination
  pageSize={20}
/>
```

**Note:** For simple tables, use shadcn/ui Table component first.

**Documentation:** https://tanstack.com/table

---

### dnd-kit - Drag and Drop

**When to use:** Kanban boards, sortable lists, reorderable grids

**Why approved:**
- Headless (full styling control)
- Modern, accessible
- Touch-friendly
- MIT license
- Well-documented

**Available templates:**
- `kanban-board` - Multi-column drag-and-drop
- `sortable-list` - Vertical/horizontal reordering
- `reorderable-grid` - 2D grid reordering

**How to use:**

```bash
# Coming in Issue #193
/design import dnd-kit kanban-board
```

**Documentation:** https://dndkit.com

---

### React Aria - Build-from-Scratch Toolkit

**When to use:** Custom components with complex interactions that don't fit shadcn/ui

**Why approved:**
- Adobe-maintained
- WCAG AA compliant out of the box
- Headless hooks (perfect for custom styling)
- Apache-2.0 license
- Comprehensive primitives

**Use cases:**
- Custom date pickers
- Complex form controls
- Accessible menus with keyboard navigation
- Custom select components

**How to use:**

```bash
# Install React Aria hooks as needed
pnpm add react-aria-components --filter=@ui/components

# Use hooks directly in custom components
```

**Documentation:** https://react-spectrum.adobe.com/react-aria

---

## Decision Tree

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

## Adding New Libraries

To propose a new external library, it must meet these criteria:

- ✅ Works with Tailwind CSS or is headless
- ✅ Has MIT/Apache-2.0 license
- ✅ Is actively maintained (commits within last 6 months)
- ✅ Is RSC compatible
- ✅ Has small bundle impact (<100kb gzipped)
- ✅ Aligns with "code ownership" philosophy (copy-paste or headless preferred)

Create an issue with:
- Library name and purpose
- Why existing solutions don't work
- Bundle impact analysis
- License verification
- Maintenance status

---

## Commands Reference

```bash
# View design system
/design viewer

# Import from Tremor
/design import tremor <ComponentName>

# Import from TanStack Table
/design import tanstack-table <ComponentName>

# Import from dnd-kit (Coming soon - Issue #193)
/design import dnd-kit <template-name>

# Check available components
cat .claude/skills/design-system/component-registry.json
```

---

## Related Documentation

- [Component Workflow](../COMPONENT_WORKFLOW.md) - Full component selection process
- [Design System Context](./CONTEXT.md) - Design system for LLMs
- [Component Registry](./../.claude/skills/design-system/component-registry.json) - All available components
