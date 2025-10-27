---
skill: review
version: 1.0.0
category: quality
token_cost: 400
description: Automated code quality checks and review
triggers:
  - after_code_change
  - before_pr
---

# /review - Code Quality Review

**Purpose:** Automated code quality checks following best practices

**Usage:**

```bash
/review [--fix]
```

**Quality Checks:**

1. **TypeScript** - Type safety validation
   - Runs: `pnpm typecheck`
   - Blocking: Yes

2. **ESLint** - Code style and quality
   - Runs: `pnpm lint`
   - Auto-fix: Available with `--fix`
   - Blocking: Warning

3. **Tests** - Test suite execution
   - Runs: `pnpm test`
   - Blocking: Yes

4. **Coverage** - Test coverage analysis
   - Runs: `pnpm test:coverage`
   - Target: 70%
   - Blocking: Warning

5. **Build** - Production build validation
   - Runs: `pnpm build`
   - Blocking: Yes

**Flags:**

- `--fix` - Auto-fix issues where possible (ESLint)

**Output:** JSON report with check results

**Token Cost:** ~400 tokens (progressive disclosure)

**When to Use:**

- Before creating PR
- After significant code changes
- When CI checks fail
- Manual code quality verification

**Examples:**

```bash
/review              # Run all checks
/review --fix        # Run checks and auto-fix
```

**Execution:**

```bash
bash scripts/skills/code-reviewer.sh "$@"
```
