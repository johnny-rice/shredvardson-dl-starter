---
# Machine-readable metadata (parsed into docs/commands/index.json)
name: '/github:github-learning-capture'
version: '1.0.0'
lane: 'lightweight'
tags: ['github', 'learning', 'documentation']
when_to_use: >
  Update an existing issue with implementation outcomes and learnings.

arguments:
  - name: issueNumber
    type: string
    pattern: "^(#\\d+|[a-zA-Z0-9_.-]+/[a-zA-Z0-9_.-]+#\\d+|\\d+)$"
    required: false
    example: '42'

inputs: []
outputs:
  - type: 'issue-comment'

riskLevel: 'LOW'
requiresHITL: false
riskPolicyRef: 'docs/llm/risk-policy.json#commandDefaults'

allowed-tools:
  - 'Bash(gh issue view:*)'
  - 'Bash(gh issue comment:*)'
  - 'Bash(gh issue edit:*)'
  - 'Read(*)'

preconditions:
  - 'Related GitHub issue exists'
  - 'Implementation work is completed'
postconditions:
  - 'Issue updated with outcomes and learnings'
  - 'Artifacts linked appropriately'

artifacts:
  produces:
    - { path: 'learning-summary.md', purpose: 'Captured implementation learnings' }
  updates: []

permissions:
  tools:
    - name: 'github'
      ops: ['comment', 'edit', 'view']
    - name: 'filesystem'
      ops: ['read']

timeouts:
  softSeconds: 180
  hardSeconds: 360

idempotent: true
dryRun: true
estimatedRuntimeSec: 120
costHints: 'Low I/O; GitHub API calls'

references:
  - 'docs/constitution.md#learning-capture'
  - 'CLAUDE.md#github-integration'
---

**Slash Command:** `/github:github-learning-capture`

**Goal:**  
Update an existing issue with implementation outcomes and learnings.

**Prompt:**

1. Confirm lane (**lightweight/spec**) against `CLAUDE.md` decision rules.
2. Find the related GitHub issue for our current work and update the outcome section with:
   - What actually happened vs planned
   - Key learnings and patterns discovered
   - Links to created artifacts (PRs, docs, wiki updates)
   - Follow-up issues or tasks identified
   - Reusable patterns for similar future work
3. Close the issue if complete or update status/labels appropriately.
4. Produce learning **artifacts** and **link** results in the related Issue/PR.
5. Emit **Result**: issue updated, learnings captured, and next suggested command.

**Examples:**

- `/github:github-learning-capture #42` → updates issue #42 with learnings
- `/github:github-learning-capture --dry-run` → show planned learning capture only.

**Failure & Recovery:**

- If target issue missing → comment on current PR with remediation steps.
- If no learnings to capture → suggest documenting implementation patterns.
