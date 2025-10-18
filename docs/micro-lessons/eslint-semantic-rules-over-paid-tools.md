---
UsedBy: 1
Severity: normal
---

# Free Static Analysis Tools Can Replace Expensive Code Review Services

**Context.** During CodeRabbit CLI evaluation (Issue #98), we found that paid AI code review tools can be slow (~90s per review), rate-limited (~2 reviews/hour on free tier), and expensive. However, the same semantic issues they catch can often be detected by properly configured free tools like ESLint and TypeScript.

**Rule.** **Before adopting paid code review services, audit your ESLint and TypeScript configurations to ensure you're maximizing free static analysis tools first.**

**Example.**

**Before** (relying on paid tool):

```typescript
// CodeRabbit CLI catches this, but takes 90s and hits rate limits
function addUser(user: any) {
  users.push(user);
}
```

**After** (caught instantly by ESLint):

```json
// eslint.config.mjs
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "error"
  }
}
```

**Result**: Catches the same issue in ~3s with unlimited runs.

**Guardrails.**

- Enable `@typescript-eslint/no-explicit-any` to catch type safety bypasses
- Add `prefer-const`, `no-var`, `eqeqeq`, and `curly` for code quality baseline
- Test pre-commit hook performance (<5s target) after adding new rules
- Consider TypeScript `strict` mode before expensive tooling
- Start with "warn" level for aggressive rules, promote to "error" after fixing violations

**Tags.** eslint, typescript, code-quality, cost-optimization, developer-experience
