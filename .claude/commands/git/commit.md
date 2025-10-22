---
# Machine-readable metadata (parsed into docs/commands/index.json)
name: '/git:commit'
version: '1.0.0'
lane: 'lightweight'
tags: ['git', 'conventional-commits']
deprecated: true
deprecation_notice: >
  DEPRECATED: This command is being migrated to the `git-workflow` Skill (Phase 3).
  Use `/git commit` instead. This command will remain functional during the
  12-week transition period. See docs/adr/002-skills-architecture.md for details.
when_to_use: >
  Generate a Conventional Commit message for staged changes.

arguments: []

inputs: []
outputs:
  - type: 'artifact-links'

riskLevel: 'MEDIUM'
requiresHITL: true
riskPolicyRef: 'docs/llm/risk-policy.json#gitOperations'

allowed-tools:
  - 'Bash(git status:*)'
  - 'Bash(git diff:*)'
  - 'Bash(git commit:*)'

preconditions:
  - 'Changes are staged for commit'
  - 'Commit message needed'
postconditions:
  - 'Conventional commit message created'
  - 'Changes committed to git'

artifacts:
  produces:
    - { path: 'commit-message.txt', purpose: 'Generated commit message' }
  updates: []

permissions:
  tools:
    - name: 'git'
      ops: ['status', 'diff', 'commit']

timeouts:
  softSeconds: 90
  hardSeconds: 180

idempotent: false
dryRun: true
estimatedRuntimeSec: 60
costHints: 'Low I/O; git operations'

references:
  - 'docs/constitution.md#commit-standards'
  - 'CLAUDE.md#conventional-commits'
---

**Slash Command:** `/git:commit`

**Goal:**  
Generate a Conventional Commit message for staged changes.

**Prompt:**

1. Confirm lane (**lightweight/spec**) against `CLAUDE.md` decision rules.
2. If `requiresHITL` true, ask for human confirmation citing `riskPolicyRef`.
3. Write a concise Conventional Commit subject (≤72 chars) and an optional 2–4 bullet body.
4. Use types: feat|fix|chore|docs|refactor|test|ci|build.
5. Focus on the _user-visible_ impact; avoid file-by-file noise.
6. Produce commit **artifacts** and **link** results in related Issue/PR.
7. Emit **Result**: commit created, message used, and next suggested command.

**Examples:**

- `/git:commit` → creates conventional commit for staged changes
- `/git:commit --dry-run` → show planned commit message only.

**Failure & Recovery:**

- If no staged changes → suggest staging files first.
- If commit message unclear → ask for guidance on user impact.
