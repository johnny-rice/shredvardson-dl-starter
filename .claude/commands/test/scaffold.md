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
  - 'Bash(pnpm add:*)'
  - 'Bash(pnpm install:*)'

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
2. Identify target code from the approved plan (read plan file if needed).
3. **Delegate to Test Generator sub-agent** with JSON input:

   ```ts
   // Type shape (for documentation)
   {
     target: {
       type: 'file' | 'function' | 'component' | 'api' | 'feature'
       path: string
       name?: string
     }
     test_types: ('unit' | 'integration' | 'e2e')[]
     coverage_goal: number
     focus_areas: ('happy_path' | 'edge_cases' | 'error_handling')[]
   }
   ```

   Example payload:

   ```json
   {
     "target": { "type": "file", "path": "path/to/target.ts" },
     "test_types": ["unit"],
     "coverage_goal": 70,
     "focus_areas": ["happy_path", "edge_cases", "error_handling"]
   }
   ```

4. Receive JSON output from Test Generator with `test_file_path`, `test_code`, `coverage_analysis`, `dependencies`, `setup_required`.
5. Write test file to `test_file_path` (or override with `testDir` argument).
6. Install any missing dependencies from `dependencies` list.
7. Run tests to verify they fail initially (TDD requirement).
8. Produce test **artifacts** and **link** results in related Issue/PR.
9. Emit **Result**: tests created, failure status, coverage estimate, and next suggested command.

**Examples:**

- `/test:scaffold unit` → creates unit test files
- `/test:scaffold --dry-run` → show planned test structure only.

**Failure & Recovery:**

- If no plan exists → suggest `/dev:plan-feature` first.
- If tests pass initially → verify they test the right functionality.
