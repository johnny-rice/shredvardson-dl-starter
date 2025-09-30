---
# Machine-readable metadata (parsed into docs/commands/index.json)
name: '/dev:implement'
version: '1.0.0'
lane: 'lightweight'
tags: ['implementation', 'development', 'tdd']
when_to_use: >
  Write minimal code to make failing tests pass during TDD implementation.

arguments: []

inputs: []
outputs:
  - type: 'code-change'

riskLevel: 'HIGH'
requiresHITL: true
riskPolicyRef: 'docs/llm/risk-policy.json#commandDefaults'

allowed-tools:
  - 'Read(*)'
  - 'Edit(*)'
  - 'MultiEdit(*)'
  - 'Bash(pnpm typecheck)'
  - 'Bash(pnpm test)'
  - 'Bash(pnpm test:unit)'

preconditions:
  - 'Failing tests exist and have been scaffolded'
  - 'Implementation plan is clear'
postconditions:
  - 'Tests pass with minimal implementation'
  - 'TypeScript compiles without errors'

artifacts:
  produces: []
  updates:
    - { path: 'src/components/**', purpose: 'Component implementations' }
    - { path: 'src/app/**', purpose: 'App Router implementations' }

permissions:
  tools:
    - name: 'filesystem'
      ops: ['read', 'write']
    - name: 'bash'
      ops: ['execute']

timeouts:
  softSeconds: 300
  hardSeconds: 600

idempotent: false
dryRun: true
estimatedRuntimeSec: 240
costHints: 'Medium I/O; moderate file operations'

references:
  - 'docs/constitution.md#ai-constraints'
  - 'CLAUDE.md#decision-rules'
---

**Slash Command:** `/dev:implement`

**Goal:**  
Write minimal code to make failing tests pass during TDD implementation.

**Prompt:**

1. Confirm lane (**lightweight**) against `CLAUDE.md` decision rules.
2. If `requiresHITL` true, ask for human confirmation citing `riskPolicyRef`.
3. Write minimal code to make failing tests pass focusing on:
   - Core functionality in `src/app/` or `src/components/`
   - Proper TypeScript interfaces
   - Next.js App Router patterns
   - Tailwind CSS styling
4. Never change existing tests - only implement what they require.
5. Emit **Result**: what was implemented, test status, and next suggested command.

**Examples:**

- `/dev:implement` → implements failing test requirements
- `/dev:implement --dry-run` → show planned implementation only.

**Failure & Recovery:**

- If no failing tests → suggest `/test:scaffold` first.
- If implementation breaks existing tests → revert and ask for guidance.
