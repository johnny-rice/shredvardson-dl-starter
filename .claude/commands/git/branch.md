---
# Machine-readable metadata (parsed into docs/commands/index.json)
name: '/git:branch'
version: '1.0.0'
lane: 'lightweight'
tags: ['git', 'branch-management', 'workflow']
deprecated: true
deprecation_notice: >
  DEPRECATED: This command is being migrated to the `git-workflow` Skill (Phase 3).
  Use `/git branch` instead. This command will remain functional during the
  12-week transition period. See docs/adr/002-skills-architecture.md for details.
when_to_use: >
  Create a new git branch following standardized naming conventions.

arguments:
  - name: type
    type: string
    required: true
    example: 'feature'
  - name: issue_number
    type: string
    required: true
    example: '103'
  - name: slug
    type: string
    required: true
    example: 'git-branch-command'

inputs: []
outputs:
  - type: 'artifact-links'

riskLevel: 'LOW'
requiresHITL: false
riskPolicyRef: 'docs/llm/risk-policy.json#gitOperations'

allowed-tools:
  - 'Bash(git branch:*)'
  - 'Bash(git switch:*)'
  - 'Bash(git show-ref:*)'
  - 'Bash(git diff-index:*)'
  - 'Bash(git rev-parse:*)'
  - 'Bash(git ls-files:*)'

preconditions:
  - 'Git repository is initialized'
  - 'Valid branch type provided'
postconditions:
  - 'New branch created with standardized name'
  - 'Switched to new branch'

artifacts:
  produces:
    - { path: 'git-branch-name.txt', purpose: 'Generated branch name' }
  updates: []

permissions:
  tools:
    - name: 'git'
      ops: ['branch', 'switch', 'show-ref', 'diff-index', 'rev-parse', 'ls-files']

timeouts:
  softSeconds: 30
  hardSeconds: 60

idempotent: false
dryRun: true
estimatedRuntimeSec: 10
costHints: 'Low I/O; git operations'

references:
  - 'docs/constitution.md#git-workflow'
  - 'docs/ai/CLAUDE.md'
  - 'git/shared/common-git-workflow.md'
  - 'git/shared/branch-validation.md'
  - 'git/shared/error-handling.md'
---

**Slash Command:** `/git:branch`

**Goal:**
Create a new git branch following standardized naming conventions.

**Shared Patterns:**

- **Validation**: See [branch-validation.md](./shared/branch-validation.md) for validation patterns
- **Workflow**: See [common-git-workflow.md](./shared/common-git-workflow.md) for git best practices
- **Error Handling**: See [error-handling.md](./shared/error-handling.md) for error recovery

**Prompt:**

1. Confirm lane (**lightweight**) against `CLAUDE.md` decision rules.
2. Validate inputs using patterns from `branch-validation.md`:
   - Branch type (feature, fix, chore, docs)
   - Issue number format (numeric)
   - Slug format (kebab-case, lowercase, alphanumeric + hyphens)
3. Generate branch name: `<type>/<issue#>-<slug>`
4. Validate working directory state (see `common-git-workflow.md`)
5. Create and switch to the new branch
6. Emit **Result**: branch created, name used, and next suggested command

**Branch Naming Structure:**

```text
feature/<issue#>-<slug>       # new features
fix/<issue#>-<slug>           # bug fixes
chore/<issue#>-<slug>         # maintenance
docs/<issue#>-<slug>          # documentation-only
```

**Examples:**

- `/git:branch feature 103 git-branch-command` → creates `feature/103-git-branch-command`
- `/git:branch fix 42 login-bug` → creates `fix/42-login-bug`
- `/git:branch chore 99 update-deps` → creates `chore/99-update-deps`
- `/git:branch docs 12 api-reference` → creates `docs/12-api-reference`
- `/git:branch --dry-run feature 103 test` → show planned branch name only

**Implementation:**

Follow these steps, referencing shared templates for reusable patterns:

1. **Parse arguments** (type, issue, slug, flags)
2. **Validate inputs** using validation patterns from `branch-validation.md`
3. **Check working directory** using patterns from `common-git-workflow.md`
4. **Handle existing branch** using error patterns from `error-handling.md`
5. **Create branch** with `git switch -c`
6. **Write artifact** `git-branch-name.txt`

For complete validation and error handling implementations, reference the shared templates.
