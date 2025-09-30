---
# Machine-readable metadata (parsed into docs/commands/index.json)
name: '/pr:assist'
version: '1.0.0'
lane: 'operational'
tags: ['pr', 'traceability', 'automation']
when_to_use: >
  Auto-fill PR template with traceability IDs and metadata before opening PR.

arguments:
  - name: issueNumber
    type: string
    required: false
    example: '123'

inputs:
  - type: 'git-changes'
    description: 'Staged changes ready for PR'
outputs:
  - type: 'pr-body'
    description: 'Complete PR template with traceability'

riskLevel: 'LOW'
requiresHITL: false
riskPolicyRef: 'docs/llm/risk-policy.json#prAutomation'

allowed-tools:
  - 'Read(*)'
  - 'Bash(git status:*)'
  - 'Bash(git diff:*)'
  - 'Glob(*)'

preconditions:
  - 'Changes staged for commit'
  - 'Spec/Plan/Task artifacts exist (if spec-driven)'
postconditions:
  - 'PR template filled with correct IDs'
  - 'Traceability verified'

artifacts:
  produces:
    - { path: 'artifacts/pr-body.md', purpose: 'Complete PR template' }
  updates: []

permissions:
  tools:
    - name: 'filesystem'
      ops: ['read']
    - name: 'git'
      ops: ['status', 'diff']

timeouts:
  softSeconds: 60
  hardSeconds: 120

idempotent: true
dryRun: true
estimatedRuntimeSec: 45
costHints: 'Low I/O; metadata extraction'

references:
  - '.github/pull_request_template.md'
  - 'docs/constitution.md#traceability'
---

**Slash Command:** `/pr:assist`

**Goal:**  
Auto-fill PR template with traceability IDs and metadata before opening PR.

**Prompt:**

1. Scan for traceability artifacts in current branch:
   - Spec files: `specs/SPEC-YYYYMMDD-*.md`
   - Plan files: `plans/PLAN-YYYYMMDD-*.md`
   - Task files: `tasks/TASK-YYYYMMDD-*.md`
   - ADR files: `docs/decisions/ADR-YYYYMMDD-*.md`
2. Extract IDs and metadata from front-matter.
3. Fill PR template with:
   - GitHub Issue number (from argument or git branch)
   - Spec/Plan/Task IDs (if found)
   - ADR Reference (if governance changes detected)
   - Summary (based on git diff and artifacts)
   - Verification checklist status
4. Save complete template to `artifacts/pr-body.md`.
5. Emit **Result**: PR template ready, suggest `/git:prepare-pr` next.

**Examples:**

- `/pr:assist #123` → fills template for issue #123
- `/pr:assist` → auto-detects issue from branch name
- `/pr:assist --dry-run` → shows template structure only.

**Failure & Recovery:**

- If no traceability artifacts found → suggest simple workflow.
- If multiple specs found → ask which one to reference.
