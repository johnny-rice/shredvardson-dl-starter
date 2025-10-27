---
# Machine-readable metadata (parsed into docs/commands/index.json)
name: '/github:create-issue'
version: '1.0.0'
lane: 'lightweight'
tags: ['github', 'issues', 'planning']
when_to_use: >
  Create a GitHub issue from current planning discussion with proper template.

arguments:
  - name: template
    type: string
    required: false
    example: 'ai-collaboration'

inputs: []
outputs:
  - type: 'artifact-links'

riskLevel: 'LOW'
requiresHITL: false
riskPolicyRef: 'docs/llm/risk-policy.json#/commandDefaults'

allowed-tools:
  - 'Bash(gh issue create:*)'
  - 'Read(.github/ISSUE_TEMPLATE/*)'

preconditions:
  - 'Planning discussion exists'
  - 'Issue template available'
postconditions:
  - 'GitHub issue created with proper template'
  - 'Context and acceptance criteria included'

artifacts:
  produces:
    - { path: 'issue-summary.md', purpose: 'Created issue details' }
  updates: []

permissions:
  tools:
    - name: 'github'
      ops: ['create', 'label', 'assign']
    - name: 'filesystem'
      ops: ['read']

timeouts:
  softSeconds: 120
  hardSeconds: 300

idempotent: false
dryRun: true
estimatedRuntimeSec: 90
costHints: 'Low I/O; GitHub API calls'

references:
  - 'docs/constitution.md#issue-management'
  - 'CLAUDE.md#github-integration'
  - '.github/ISSUE_TEMPLATE/'
---

**Slash Command:** `/github:create-issue`

**Goal:**  
Create a GitHub issue from current planning discussion with proper template.

**Prompt:**

1. Confirm lane (**lightweight/spec**) against `CLAUDE.md` decision rules.
2. Create a GitHub issue based on our current conversation.
3. Use the most appropriate template (ai-collaboration, learning-spike, refactor-secure, or standard).
4. Include all relevant context, links to related issues, and clear acceptance criteria.
5. Auto-assign appropriate labels and link to project board.
6. Produce issue **artifacts** and **link** results, return the created issue URL for tracking.
7. Emit **Result**: issue created, URL provided, and next suggested command.

**Examples:**

- `/github:create-issue ai-collaboration` → creates issue with AI collaboration template
- `/github:create-issue --dry-run` → show planned issue content only.

**Failure & Recovery:**

- If template missing → use standard template and suggest template creation.
- If context unclear → ask for specific issue details and acceptance criteria.
