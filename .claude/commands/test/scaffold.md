---
# Machine-readable metadata (parsed into docs/commands/index.json)
name: '/test:scaffold'
version: '1.0.0'
lane: 'lightweight'
tags: ['testing', 'tdd', 'scaffolding']
when_to_use: >
  Write failing tests from approved plan before implementation.

arguments:
  - name: testType
    type: string
    required: false
    example: 'unit'
  - name: testDir
    type: string
    required: false
    example: '__tests__'

inputs: []
outputs:
  - type: 'code-change'

riskLevel: 'LOW'
requiresHITL: false
riskPolicyRef: 'docs/llm/risk-policy.json#commandDefaults'

allowed-tools:
  - 'Write(*)'
  - 'Read(*)'
  - 'Bash(pnpm test:*)'

preconditions:
  - 'Feature plan exists and is approved'
  - 'Test strategy is defined'
postconditions:
  - 'Failing tests created'
  - 'Test files follow naming conventions'

artifacts:
  produces: []
  updates:
    - { path: '__tests__/**', purpose: 'Unit test files' }
    - { path: 'tests/e2e/**', purpose: 'End-to-end test files' }

permissions:
  tools:
    - name: 'filesystem'
      ops: ['read', 'write']
    - name: 'bash'
      ops: ['execute']

timeouts:
  softSeconds: 180
  hardSeconds: 360

idempotent: true
dryRun: true
estimatedRuntimeSec: 120
costHints: 'Low I/O; test file creation'

references:
  - 'docs/constitution.md#tdd-workflow'
  - 'CLAUDE.md#testing-strategy'
---

**Slash Command:** `/test:scaffold`

**Goal:**  
Write failing tests from approved plan before implementation.

**Prompt:**

1. Confirm lane (**lightweight**) against `CLAUDE.md` decision rules.
2. Write failing tests only from the approved plan.
3. Create test files in the target directory (default: `__tests__`, override with `testDir` argument):
   - `__tests__/` for unit tests
   - `tests/e2e/` for end-to-end tests
4. Follow naming: `ComponentName.test.ts` or `feature-name.test.ts`
5. Tests should fail initially - do not implement functionality yet.
6. Produce test **artifacts** and **link** results in related Issue/PR.
7. Emit **Result**: tests created, failure status, and next suggested command.

**Examples:**

- `/test:scaffold unit` → creates unit test files
- `/test:scaffold --dry-run` → show planned test structure only.

**Failure & Recovery:**

- If no plan exists → suggest `/dev:plan-feature` first.
- If tests pass initially → verify they test the right functionality.
