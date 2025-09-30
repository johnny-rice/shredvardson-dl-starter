---
# Machine-readable metadata (parsed into docs/commands/index.json)
name: '/plan'
version: '1.0.0'
lane: 'spec'
tags: ['spec-kit', 'planning', 'architecture']
when_to_use: >
  Create technical implementation plan within constitutional constraints.

arguments: []

inputs: []
outputs:
  - type: 'artifact-links'

riskLevel: 'MEDIUM'
requiresHITL: true
riskPolicyRef: 'docs/llm/risk-policy.json#planningOperations'

allowed-tools:
  - 'Read(*)'
  - 'Write(*)'
  - 'Bash(gh issue comment:*)'

preconditions:
  - 'Feature specification exists from /specify command'
  - 'Constitutional constraints are understood'
postconditions:
  - 'Technical implementation plan created'
  - 'GitHub issue updated with technical context'

artifacts:
  produces:
    - { path: 'plans/feature-[number]-[name].md', purpose: 'Technical implementation plan' }
  updates: []

permissions:
  tools:
    - name: 'filesystem'
      ops: ['read', 'write']
    - name: 'github'
      ops: ['comment']

timeouts:
  softSeconds: 600
  hardSeconds: 1200

idempotent: true
dryRun: true
estimatedRuntimeSec: 480
costHints: 'Medium I/O; architectural planning intensive'

references:
  - 'docs/constitution.md#architectural-constraints'
  - 'CLAUDE.md#spec-driven-workflow'
---

**Slash Command:** `/plan`

**Goal:**  
Create technical implementation plan within constitutional constraints.

**Prompt:**

1. Confirm lane (**spec**) against `CLAUDE.md` decision rules.
2. If `requiresHITL` true, ask for human confirmation citing `riskPolicyRef`.
3. Create detailed technical plan for the specified feature with:
   - Architecture Decision (Next.js/TypeScript/Tailwind alignment)
   - File Changes Required (exact `src/**` paths)
   - Implementation Strategy (components, state, APIs)
   - Testing Strategy (TDD order: contracts, integration, e2e, unit)
   - Security Considerations
   - Dependencies and justification
   - Risks & Mitigation
4. Must reference existing specification from `/specify` command.
5. Save plan to `/plans/` folder and update GitHub issue.
6. Emit **Result**: plan created, technical context added, ready for `/tasks` command.

**Examples:**

- `/plan` → creates technical implementation plan
- `/plan --dry-run` → show planned technical approach only.

**Failure & Recovery:**

- If no specification exists → suggest running `/specify` first.
- If constitutional constraints unclear → reference `docs/constitution.md`.
