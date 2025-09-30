---
# Machine-readable metadata (parsed into docs/commands/index.json)
name: '/review:self-critique'
version: '1.0.0'
lane: 'lightweight'
tags: ['review', 'quality', 'validation']
when_to_use: >
  Start fresh session and skeptically review recent changes for quality.

arguments: []

inputs: []
outputs:
  - type: 'report'

riskLevel: 'LOW'
requiresHITL: false
riskPolicyRef: 'docs/llm/risk-policy.json#commandDefaults'

allowed-tools:
  - 'Read(*)'
  - 'Bash(git diff:*)'
  - 'Bash(git status:*)'
  - 'Grep(pattern:*)'

preconditions:
  - 'Recent changes exist to review'
  - 'Code is in reviewable state'
postconditions:
  - 'Quality assessment completed'
  - 'Improvement suggestions provided'

artifacts:
  produces:
    - { path: 'self-critique-report.md', purpose: 'Quality review findings' }
  updates: []

permissions:
  tools:
    - name: 'filesystem'
      ops: ['read']
    - name: 'git'
      ops: ['diff', 'status']

timeouts:
  softSeconds: 300
  hardSeconds: 600

idempotent: true
dryRun: true
estimatedRuntimeSec: 240
costHints: 'Medium I/O; code analysis intensive'

references:
  - 'docs/constitution.md#review-standards'
  - 'CLAUDE.md#self-critique-process'
---

**Slash Command:** `/review:self-critique`

**Goal:**  
Start fresh session and skeptically review recent changes for quality.

**Prompt:**

1. Confirm lane (**lightweight/spec**) against `CLAUDE.md` decision rules.
2. Perform skeptical review of recent changes:
   - Read modified files in `src/app/` and tests
   - Check for logic errors, edge cases
   - Verify TypeScript types are correct
   - Test error handling
   - Validate accessibility and performance
3. Suggest specific improvements with file:line references.
4. Produce quality **report** and **link** results in related Issue/PR.
5. Emit **Result**: review findings, improvement suggestions, and next suggested command.

**Examples:**

- `/review:self-critique` → performs comprehensive quality review
- `/review:self-critique --dry-run` → show planned review scope only.

**Failure & Recovery:**

- If no recent changes found → suggest reviewing specific files or components.
- If review scope unclear → ask for specific areas to focus on.
