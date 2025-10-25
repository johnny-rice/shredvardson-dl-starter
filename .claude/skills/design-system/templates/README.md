# External Component Templates

This directory contains **lazy-loaded templates** for external component libraries. These templates are NOT installed by default to keep the starter lightweight.

## Philosophy

**Templates live here, components live in your project only when needed.**

- ✅ Templates stored as JSON files
- ✅ Zero bundle impact until imported
- ✅ Dependencies installed on-demand
- ✅ Full TypeScript + Storybook + Tests included

## Available Sources

### Tremor (Data Visualization)
**Bundle Impact:** 15kb gzipped (recharts + @tremor/react)
**License:** Apache-2.0

Components:
- `LineChart` - Line charts with legend, formatters
- `BarChart` - Vertical/horizontal bar charts
- `AreaChart` - Area charts with curve types
- `DonutChart` - Donut/pie charts
- `KpiCard` - KPI cards with change indicators

```bash
/design import tremor LineChart
```

### TanStack Table (Coming Soon)
**Bundle Impact:** 45kb gzipped
**License:** MIT

Templates:
- `basic-table` - Sorting, filtering
- `advanced-table` - Pagination, row selection
- `server-table` - Server-side data

### dnd-kit (Coming Soon)
**Bundle Impact:** 35kb gzipped
**License:** MIT

Templates:
- `kanban-board` - Drag-and-drop kanban
- `sortable-list` - Reorderable lists
- `reorderable-grid` - Grid layouts

## How It Works

1. **User needs a chart:** "I need a bar chart for analytics"
2. **Claude checks registry:** Sees Tremor BarChart is available
3. **Claude asks:** "Would you like me to import Tremor's BarChart?"
4. **On confirmation:** Runs `/design import tremor BarChart`
5. **Result:**
   - Installs `@tremor/react` and `recharts` to `@ui/components`
   - Creates component at `packages/@ui/components/ui/bar-chart/`
   - Generates TypeScript types, Storybook story, unit test
   - Updates component registry

## Template Format

```json
{
  "component": "// Full component code as string",
  "story": "// Storybook story code",
  "test": "// Unit test code",
  "dependencies": ["@tremor/react", "recharts"]
}
```

## Adding New Templates

1. Create `templates/<source>/<component-name>.json`
2. Include `component`, `story`, `test`, `dependencies`
3. Test with `/design import <source> <ComponentName>`

## Why Template Files Instead of Inline?

- ✅ Easier to maintain and update
- ✅ Can be code-generated from official docs
- ✅ Clear separation: templates vs. installed code
- ✅ Can track template versions independently
- ✅ Future: Auto-update templates from upstream

## Bundle Impact Comparison

| Approach | Initial Bundle | After Import |
|----------|---------------|--------------|
| **Inline (❌)** | +15kb | +15kb |
| **Template (✅)** | 0kb | +15kb |

The starter stays lightweight until you actually need the components.
