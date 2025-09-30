---
# Machine-readable metadata (parsed into docs/commands/index.json)
name: '/docs:generate'
version: '1.0.0'
lane: 'lightweight'
tags: ['documentation', 'automation']
when_to_use: >
  Update documentation from code and tests when docs are outdated.

arguments: []

inputs: []
outputs:
  - type: 'artifact-links'

riskLevel: 'LOW'
requiresHITL: false
riskPolicyRef: 'docs/llm/risk-policy.json#commandDefaults'

allowed-tools:
  - 'Read(*)'
  - 'Edit(*)'
  - 'MultiEdit(*)'
  - 'Glob(src/**/*.ts)'
  - 'Glob(docs/**/*.md)'
  - 'Grep(pattern:@param|@returns|@throws)'

preconditions:
  - 'Code and tests exist to document'
  - 'JSDoc comments are present'
postconditions:
  - 'Documentation is current with codebase'
  - 'README.md reflects actual functionality'

artifacts:
  produces: []
  updates:
    - { path: 'README.md', purpose: 'Updated project documentation' }
    - { path: 'docs/**', purpose: 'Generated API documentation' }

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
costHints: 'Low I/O; documentation scanning'

references:
  - 'docs/constitution.md#documentation-standards'
  - 'CLAUDE.md#docs-guidelines'
---

**Slash Command:** `/docs:generate`

**Goal:**  
Update documentation from code and tests when docs are outdated.

**Prompt:**

1. Confirm lane (**lightweight**) against `CLAUDE.md` decision rules.
2. Scan codebase and update documentation focusing on:
   - API routes in `src/app/api/`
   - Component props and usage
   - Installation/development setup
   - Available scripts in `package.json`
3. Focus on README.md sections that are outdated.
4. Use JSDoc comments and test files as source of truth.
5. Produce updated documentation **artifacts** and **link** results in related Issue/PR.
6. Emit **Result**: what documentation was updated and next suggested command.

**Examples:**

- `/docs:generate` → updates all outdated documentation
- `/docs:generate --dry-run` → show planned documentation updates only.

**Failure & Recovery:**

- If no JSDoc comments found → suggest adding documentation comments first.
- If README structure unclear → ask for guidance on organization.
