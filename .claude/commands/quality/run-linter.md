---
# Machine-readable metadata (parsed into docs/commands/index.json)
name: '/quality:run-linter'
version: '1.0.0'
lane: 'lightweight'
tags: ['quality', 'linting', 'formatting']
when_to_use: >
  Execute linting and fix all quality issues before commits.

arguments: []

inputs: []
outputs:
  - type: 'report'

riskLevel: 'LOW'
requiresHITL: false
riskPolicyRef: 'docs/llm/risk-policy.json#/commandDefaults'

allowed-tools:
  - 'Bash(pnpm lint:*)'
  - 'Bash(pnpm format:*)'
  - 'Bash(pnpm typecheck:*)'
  - 'Read(eslint.config.mjs|.eslintrc.*)'
  - 'Read(.prettierrc|.prettierrc.*|prettier.config.*)'

preconditions:
  - 'Code changes exist to be linted'
  - 'ESLint and Prettier are configured'
postconditions:
  - 'All linting errors resolved'
  - 'Code formatting is consistent'
  - 'TypeScript compiles without errors'

artifacts:
  produces:
    - { path: 'lint-report.md', purpose: 'Quality check results' }
  updates: []

permissions:
  tools:
    - name: 'bash'
      ops: ['execute']
    - name: 'filesystem'
      ops: ['read']

timeouts:
  softSeconds: 120
  hardSeconds: 300

idempotent: true
dryRun: true
estimatedRuntimeSec: 60
costHints: 'Low I/O; linting operations'

references:
  - 'docs/constitution.md#quality-standards'
  - 'CLAUDE.md#quality-gates'
---

**Slash Command:** `/quality:run-linter`

**Goal:**  
Execute linting and fix all quality issues before commits.

**Prompt:**

1. Confirm lane (**lightweight**) against `CLAUDE.md` decision rules.
2. **Check formatting scope first**:

   ```bash
   prettier --list-different . || echo "No formatting changes needed"
   ```

3. **Ask user before wide formatting**: If many files need formatting, confirm with user whether to:
   - Apply formatting now (may affect many files)
   - Skip formatting for focused PR
   - Apply formatting in separate commit/PR
4. Execute linting and conditional formatting:

   ```bash
   pnpm lint || echo "Linting failed - see errors above"
   # Only run pnpm format if approved by user or minimal changes
   pnpm format || echo "Formatting failed - check configuration"
   ```

5. Check ESLint rules in `eslint.config.mjs` and Prettier config.
6. Fix TypeScript errors, unused imports, and formatting issues.
7. Verify all files pass quality gates.
8. Produce quality **report** and **link** results in related Issue/PR.
9. Emit **Result**: quality status, issues fixed, and next suggested command.

**Examples:**

- `/quality:run-linter` → runs linting and fixes all issues
- `/quality:run-linter --dry-run` → show linting results without fixes.

**Failure & Recovery:**

- If linting fails → report specific errors and suggest manual fixes.
- If config missing → suggest setting up ESLint/Prettier configuration.
