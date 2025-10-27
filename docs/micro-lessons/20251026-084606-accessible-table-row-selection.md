# Accessible Table Row Selection Implementation

**Context:** Initial DataTable implementation lacked visual row selection UI, breaking WCAG AA compliance and user expectations during Issue #192.

**Rule:** Row selection requires explicit checkbox column with proper ARIA labels and scope attributes, not just background color changes.

**Example:**

```tsx
// ❌ BAD - No visual selection mechanism
<tr className={row.getIsSelected() && 'bg-muted'}>
  {row.getVisibleCells().map(cell => <td>...</td>)}
</tr>

// ✅ GOOD - Accessible checkbox column
<thead>
  <th scope="col">
    <input
      type="checkbox"
      aria-label="Select all rows"
      checked={table.getIsAllPageRowsSelected()}
    />
  </th>
</thead>
<tbody>
  <td>
    <input
      type="checkbox"
      aria-label="Select row"
      checked={row.getIsSelected()}
    />
  </td>
</tbody>
```

**Guardrails:**

- Always provide visual selection UI (checkboxes), not just state changes
- Add aria-label to all checkboxes (select-all, select-row)
- Add aria-sort to sortable headers (ascending/descending/none)
- Add scope="col" to header cells for screen readers
- Test with keyboard navigation and screen readers

**Tags:** #accessibility #aria #wcag #tables #ui #tanstack-table #issue-192

**Severity:** high

**UsedBy:** 0
