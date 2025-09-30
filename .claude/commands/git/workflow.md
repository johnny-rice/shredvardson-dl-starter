---
# Machine-readable metadata (parsed into docs/commands/index.json)
name: '/git:workflow'
version: '1.0.0'
lane: 'lightweight'
tags: ['git', 'workflow', 'branch-management']
when_to_use: >
  Manage git branch lifecycle using consolidated workflow operations.

arguments:
  - name: operation
    type: string
    required: false
    example: 'start'
  - name: branchName
    type: string
    required: false
    example: 'fix/login-bug'

inputs: []
outputs:
  - type: 'artifact-links'

riskLevel: 'MEDIUM'
requiresHITL: true
riskPolicyRef: 'docs/llm/risk-policy.json#gitOperations'

allowed-tools:
  - 'Bash(pnpm git:*)'
  - 'Bash(scripts/git-workflow.sh:*)'

preconditions:
  - 'Git repository is initialized'
  - 'Working directory is clean'
postconditions:
  - 'Git operations completed successfully'
  - 'Branch state is consistent'

artifacts:
  produces: []
  updates: []

permissions:
  tools:
    - name: 'git'
      ops: ['branch', 'checkout', 'merge', 'push', 'pull']
    - name: 'bash'
      ops: ['execute']

timeouts:
  softSeconds: 120
  hardSeconds: 300

idempotent: true
dryRun: true
estimatedRuntimeSec: 90
costHints: 'Low I/O; git operations'

references:
  - 'docs/constitution.md#git-workflow'
  - 'CLAUDE.md#branch-strategy'
  - 'scripts/git-workflow.sh'
---

**Slash Command:** `/git:workflow`

**Goal:**  
Manage git branch lifecycle using consolidated workflow operations.

**Prompt:**

1. Confirm lane (**lightweight/spec**) against `CLAUDE.md` decision rules.
2. If `requiresHITL` true, ask for human confirmation citing `riskPolicyRef`.
3. Execute consolidated git operations using `scripts/git-workflow.sh`:
   - `pnpm git:start <branch-name>` - Start new feature branch
   - `pnpm git:status` - Comprehensive git status
   - `pnpm git:cleanup` - Preview branch cleanup (dry-run)
   - `pnpm git:cleanup-force` - Execute branch cleanup
   - `pnpm git:finish` - Clean current branch after merge
4. Follow branch lifecycle: Start → Work → PR → Finish
5. Leverage safety features: protected branches, PR checks, dry-run previews.
6. Produce workflow **artifacts** and **link** results in related Issue/PR.
7. Emit **Result**: operation completed, branch status, and next suggested command.

**Examples:**

- `/git:workflow start fix/login-bug` → starts new feature branch
- `/git:workflow --dry-run` → show planned git operations only.

**Failure & Recovery:**

- If uncommitted changes exist → suggest stashing or committing first.
- If branch conflicts → provide resolution guidance.
