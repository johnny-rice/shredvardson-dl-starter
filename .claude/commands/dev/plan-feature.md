---
# Machine-readable metadata (parsed into docs/commands/index.json)
name: '/dev:plan-feature'
version: '1.0.0'
lane: 'lightweight'
tags: ['planning', 'features']
when_to_use: >
  Plan a small, safe feature with clear acceptance criteria.

arguments: []

inputs: []
outputs:
  - type: 'artifact-links'

riskLevel: 'LOW'
requiresHITL: false
riskPolicyRef: 'docs/llm/risk-policy.json#commandDefaults'

allowed-tools:
  - 'Read(*)'
  - 'Write(*)'

preconditions:
  - 'Feature request is clear'
  - 'Scope is defined'
postconditions:
  - 'Plan with scope, files, risks, and tests created'
  - 'Acceptance criteria defined'

artifacts:
  produces:
    - { path: 'plans/feature-[number]-[name].md', purpose: 'Feature implementation plan' }
  updates: []

permissions:
  tools:
    - name: 'filesystem'
      ops: ['read', 'write']

timeouts:
  softSeconds: 180
  hardSeconds: 360

idempotent: true
dryRun: true
estimatedRuntimeSec: 120
costHints: 'Low I/O; planning activity'

references:
  - 'docs/constitution.md#planning-constraints'
  - 'CLAUDE.md#decision-rules'
---

**Slash Command:** `/dev:plan-feature`

**Goal:**  
Plan a small, safe feature with clear acceptance criteria.

**Prompt:**

1. Confirm lane (**lightweight**) against `CLAUDE.md` decision rules.
2. Plan a minimal change.
3. Return: scope, files to edit (src/\*\* only), risks, and a tiny test list.
4. Constraints: no new deps unless essential; keep UI basic; respect tokens; env via @/lib/env.
5. Done when:
   - [ ] All planned files updated with minimal changes
   - [ ] Tests for the tiny list pass locally (`pnpm test`)
   - [ ] No new deps; typecheck passes (`pnpm typecheck`)
6. Produce planning **artifacts** and **link** results in related Issue/PR.
7. Emit **Result**: plan created, scope defined, and next suggested command.

**Examples:**

- `/dev:plan-feature` → creates feature implementation plan
- `/dev:plan-feature --dry-run` → show planned approach only.

**Failure & Recovery:**

- If scope unclear → ask for feature clarification.
- If too complex → suggest `/specify` for spec-driven workflow.
