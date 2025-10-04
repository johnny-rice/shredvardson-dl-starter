---
# Machine-readable metadata (parsed into docs/commands/index.json)
name: '/tasks'
version: '1.0.0'
lane: 'spec'
tags: ['spec-kit', 'tasks', 'implementation']
when_to_use: >
  Break down technical plan into actionable implementation tasks with TDD focus.

arguments: []

inputs: []
outputs:
  - type: 'artifact-links'

riskLevel: 'MEDIUM'
requiresHITL: true
riskPolicyRef: 'docs/llm/risk-policy.json#implementationPlanning'

allowed-tools:
  - 'Read(*)'
  - 'Write(*)'
  - 'Bash(gh issue comment:*)'
  - 'Bash(git checkout:*)'

preconditions:
  - 'Technical plan exists from /plan command'
  - 'TDD workflow is understood'
postconditions:
  - 'Actionable task breakdown created'
  - 'GitHub issue updated with checklist'
  - 'Feature branch ready for implementation'

artifacts:
  produces:
    - { path: 'tasks/feature-[number]-[name].md', purpose: 'Implementation task breakdown' }
  updates: []

permissions:
  tools:
    - name: 'filesystem'
      ops: ['read', 'write']
    - name: 'github'
      ops: ['comment']
    - name: 'git'
      ops: ['checkout', 'branch']

timeouts:
  softSeconds: 600
  hardSeconds: 1200

idempotent: true
dryRun: true
estimatedRuntimeSec: 360
costHints: 'Medium I/O; task planning intensive'

references:
  - 'docs/constitution.md#tdd-workflow'
  - 'CLAUDE.md#spec-driven-workflow'
---

**Slash Command:** `/tasks`

**Goal:**  
Break down technical plan into actionable implementation tasks with TDD focus.

**Prompt:**

1. Confirm lane (**spec**) against `CLAUDE.md` decision rules.
2. If `requiresHITL` true, ask for human confirmation citing `riskPolicyRef`.
3. Create actionable task breakdown following constitutional order:
   - Phase 1: Contracts & Interfaces
   - Phase 2: Test Foundation (integration → e2e → unit)
   - Phase 3: Implementation
   - Phase 4: Integration & Polish
   - Phase 5: Documentation & Release
4. Reference existing plan from `/plan` command in `/plans/` folder.
5. **IMPORTANT**: Start the task file with YAML frontmatter:
   ```yaml
   ---
   id: TASK-{YYYYMMDD}-{kebab-case-name}
   type: task
   parentId: PLAN-{YYYYMMDD}-{kebab-case-name}
   issue: { github-issue-number }
   plan: PLAN-{YYYYMMDD}-{kebab-case-name}
   spec: SPEC-{YYYYMMDD}-{kebab-case-name}
   branch: feature/{number}-{name}
   source: { github-issue-url }
   ---
   ```
   Example:
   ```yaml
   ---
   id: TASK-20251003-testing-infrastructure
   type: task
   parentId: PLAN-20251003-testing-infrastructure
   issue: 108
   plan: PLAN-20251003-testing-infrastructure
   spec: SPEC-20251003-testing-infrastructure
   branch: feature/108-testing-infrastructure
   source: https://github.com/Shredvardson/dl-starter/issues/108
   ---
   ```
6. Include implementation commands, branch strategy, and next steps.
7. Save breakdown to `/tasks/` folder and update GitHub issue with checklist.
8. Create feature branch ready for implementation.
9. Emit **Result**: tasks created, branch ready, implementation can begin.

**Examples:**

- `/tasks` → creates implementation task breakdown
- `/tasks --dry-run` → show planned task structure only.

**Failure & Recovery:**

- If no plan exists → suggest running `/plan` first.
- If TDD workflow unclear → reference constitutional implementation order.
