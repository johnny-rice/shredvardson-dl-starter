# External Library Design System Integration Pattern

**Context:** Integrated TanStack Table following EXTERNAL_LIBRARY_INTEGRATION_PATTERN.md, discovered critical alignment requirements during Issue #192.

**Rule:** External library components MUST use CVA variants and our Select/Input components, not native HTML elements, to maintain design system consistency.

**Example:**

```tsx
// ❌ BAD - Native select breaks design system
<select className="h-8 w-[70px] rounded-md border">
  <option value="10">10</option>
</select>

// ✅ GOOD - Uses our Select component
<Select value={pageSize.toString()}>
  <SelectTrigger className={cn('w-16', size === 'sm' ? 'h-8' : 'h-10')}>
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="10">10</SelectItem>
  </SelectContent>
</Select>
```

**Guardrails:**

- Always use CVA for variants (size, density, etc.)
- Replace hardcoded values (h-12, w-[70px]) with responsive token-based sizing
- Use existing UI components (Select, Input) instead of native HTML
- Test all variants after integration (sm/md/lg, compact/comfortable/spacious)

**Tags:** #design-system #external-libraries #cva #components #tanstack-table #issue-192

**Severity:** high

**UsedBy:** 0
