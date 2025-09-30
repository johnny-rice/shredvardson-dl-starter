---
UsedBy: 0
Severity: normal
---

# Make Scripts Configurable via Environment Variables

**Context.** CodeRabbit flagged hardcoded limits and allowlists in audit scripts as brittle for multi-app repositories.
**Rule.** **Use environment variables with sensible defaults to make scripts configurable without code changes.**
**Example.**

```javascript
// ❌ Hardcoded values
const BAD_LIMIT = 5 * 1024 * 1024; // 5MB
const allow = r.path.startsWith('public/') || r.path.startsWith('docs/reports/');

// ✅ Configurable via environment
const BAD_LIMIT = Number.parseInt(process.env.AUDIT_LARGE_LIMIT_BYTES ?? '', 10) || 5 * 1024 * 1024;
const ALLOW_PREFIXES = (process.env.AUDIT_LARGE_ALLOW_PREFIXES ?? 'public/,docs/reports/')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const allow = ALLOW_PREFIXES.some((p) => r.path.startsWith(p));
```

**Guardrails.**

- Provide sensible defaults for all configurable values
- Use environment variable naming conventions (SCREAMING_SNAKE_CASE)
- Document environment variables in script comments or README

**Tags.** scripts,configuration,environment,maintainability,coderabbit
