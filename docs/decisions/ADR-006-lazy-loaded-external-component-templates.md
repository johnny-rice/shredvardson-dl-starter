# ADR-006: Lazy-Loaded External Component Templates

**Status:** Proposed
**Date:** 2025-10-24

## Context

The DL Starter aims to be a lightweight, production-ready starter template. As we expand the design system to support specialized components (data visualization, tables, drag-and-drop), we face a critical tension:

1. **User Need:** Quick access to common UI patterns (charts, tables, kanban boards)
2. **Starter Principle:** Maintain minimal bundle size and dependencies
3. **Developer Experience:** Simple workflow to add components when needed

Initial implementation auto-installed all external components (Tremor charts, TanStack Table, dnd-kit) on project creation, adding ~60kb+ to the bundle before any components were actually used. This violated our lightweight starter principle.

Additionally, the implementation used Storybook for component previews, which would have added another dependency and isolated testing environment separate from the actual application.

## Decision

We will implement a **lazy-loaded template system** for external component libraries with the following characteristics:

### 1. Template Storage
- Store component templates as JSON files in `.claude/skills/design-system/templates/<source>/`
- Each template contains: component code, test code, viewer examples, and dependencies
- Templates are version-controlled but not installed until explicitly imported

### 2. On-Demand Installation
- Provide `/design import <source> <component>` command via design-system Skill
- Dependencies are installed only when user explicitly imports a component
- Component files are generated in `packages/@ui/components/ui/` at import time

### 3. Viewer Integration (Not Storybook)
- Templates generate viewer examples for the existing `/design` route
- Examples follow the `ComponentExample` pattern already used in the app
- No Storybook dependency or separate preview environment

### 4. Supported Sources
- **Tremor:** Data visualization (charts, KPI cards)
- **TanStack Table:** Advanced table functionality
- **dnd-kit:** Drag-and-drop interactions

## Consequences

### Benefits
1. **Maintains Lightweight Starter:** Zero bundle impact until components are imported
2. **Developer Autonomy:** Users decide which external components they actually need
3. **No Vendor Lock-in:** Templates are just code; users can modify after import
4. **Integrated Preview:** Components live in the actual app's `/design` viewer, not isolated
5. **Discoverability:** Registry tracks available templates without installing them
6. **Future-Proof:** New templates can be added without affecting existing projects

### Tradeoffs
1. **Manual Integration:** Users must copy viewer examples to `/design/page.tsx` manually
2. **Template Maintenance:** Templates need updates when source libraries change
3. **No Auto-Updates:** Imported components don't auto-update with template changes
4. **Initial Overhead:** Setting up the template system requires infrastructure
5. **Fallback Complexity:** Script supports both JSON templates and inline fallbacks

### Monitoring
- Track template usage via component registry
- Monitor bundle size growth after imports
- Collect feedback on developer experience
- Measure time-to-import for common components
- Monitor template maintenance burden (updates needed per quarter)

## References

- [ADR concept](https://adr.github.io/)
- Issue: #151 (Epic: Complete Design System)
- Issue: #191 (Phase 4.2a: Tremor Integration)
- PR: #190 (Implementation)
- Design System Principle: Lightweight starter with progressive enhancement
