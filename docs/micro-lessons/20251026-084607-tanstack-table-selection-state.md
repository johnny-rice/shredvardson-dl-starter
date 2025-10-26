# TanStack Table Selection State Management

**Context:** Row selection callback broke when using array indices after sorting/filtering changed row order in Issue #192.

**Rule:** Use `table.getSelectedRowModel().flatRows` for stable selection tracking, not array index mapping, as row indices change with sorting/filtering/pagination.

**Example:**
```tsx
// ❌ BAD - Breaks with sorting/filtering
onRowSelectionChange: (updater) => {
  const newSelection = typeof updater === 'function' ? updater(rowSelection) : updater;
  const indices = Object.keys(newSelection).map(Number);
  const selected = indices.map(i => data[i]); // ⚠️ Wrong rows!
  callback(selected);
}

// ✅ GOOD - Stable selection via table model
const table = useReactTable({
  onRowSelectionChange: setRowSelection,
});

useEffect(() => {
  const selected = table.getSelectedRowModel().flatRows.map(r => r.original);
  callback(selected);
}, [table]); // Note: rowSelection intentionally excluded
```

**Guardrails:**
- Never map selection state to data array indices directly
- Use `table.getSelectedRowModel()` for stable row references
- Remove `rowSelection` from useEffect deps (causes infinite loop)
- Test selection with active sorting, filtering, and pagination
- Verify selected rows persist across page changes

**Tags:** #tanstack-table #react #hooks #state-management #selection #bug-fix #issue-192

**Severity:** high

**UsedBy:** 0
