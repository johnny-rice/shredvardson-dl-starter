---
UsedBy: 0
Severity: normal
---

# Use Consistent Path Resolution Utilities Across Scripts

**Context.** CodeRabbit flagged literal path strings mixed with resolveDoc() calls, making future file moves harder to manage.
**Rule.** **Normalize all documentation paths through the same resolution mechanism for consistency and maintainability.**
**Example.**

```typescript
// ❌ Inconsistent path handling
const bindingSources = [
  resolveDoc('CLAUDE.md'), // Uses utility
  'docs/llm/context-map.json', // Literal string
  'docs/llm/STARTER_MANIFEST.json', // Literal string
];

// ✅ Consistent path resolution
const bindingSources = [
  resolveDoc('CLAUDE.md'),
  resolveDoc('docs/llm/context-map.json'), // Centralized resolution
  resolveDoc('docs/llm/STARTER_MANIFEST.json'), // Future-proof if files move
];
```

**Guardrails.**

- Create path resolution utilities for commonly referenced files
- Use the utilities consistently across all scripts
- Centralize path changes in the utility when files move

**Tags.** paths,consistency,utilities,maintainability,scripts,coderabbit
