---
# Machine-readable metadata (parsed into docs/commands/index.json)
name: '/ops:wiki-sync'
version: '1.0.0'
lane: 'operational'
tags: ['wiki', 'sync', 'maintenance']
when_to_use: >
  Verify docs/PRD.md and docs/wiki/WIKI-PRD.md are in sync, auto-fix if needed.

arguments: []

inputs:
  - type: 'prd-changes'
    description: 'Changes to core project documentation'
outputs:
  - type: 'sync-status'
    description: 'Wiki sync verification and fixes'

riskLevel: 'LOW'
requiresHITL: false
riskPolicyRef: 'docs/llm/risk-policy.json#wikiSync'

allowed-tools:
  - 'Read(*)'
  - 'Bash(pnpm wiki:generate:*)'
  - 'Bash(git status:*)'

preconditions:
  - 'docs/PRD.md exists'
  - 'wiki:generate script available'
postconditions:
  - 'Wiki in sync with PRD'
  - 'Any sync issues resolved'

artifacts:
  produces:
    - { path: 'artifacts/wiki-sync-report.md', purpose: 'Sync verification report' }
  updates:
    - { path: 'docs/wiki/WIKI-PRD.md', purpose: 'Auto-generated wiki' }

permissions:
  tools:
    - name: 'filesystem'
      ops: ['read']
    - name: 'npm'
      ops: ['wiki:generate']

timeouts:
  softSeconds: 30
  hardSeconds: 60

idempotent: true
dryRun: true
estimatedRuntimeSec: 20
costHints: 'Low I/O; script execution'

references:
  - 'pnpm wiki:generate'
  - 'docs/PRD.md'
---

**Slash Command:** `/ops:wiki-sync`

**Goal:**  
Verify docs/PRD.md and docs/wiki/WIKI-PRD.md are in sync, auto-fix if needed.

**Prompt:**

1. Compare docs/PRD.md with docs/wiki/WIKI-PRD.md timestamps and content.
2. If out of sync:
   - Run `pnpm wiki:generate` to regenerate wiki
   - Verify regeneration succeeded
   - Stage changes if wiki updated
3. Create sync report showing:
   - Sync status (✅ in sync / ⚠️ was out of sync, fixed / ❌ sync failed)
   - Timestamp comparison
   - Any changes made
4. Save report to `artifacts/wiki-sync-report.md`.
5. Emit **Result**: sync status, suggest commit if changes made.

**Examples:**

- `/ops:wiki-sync` → checks and fixes wiki sync
- `/ops:wiki-sync --dry-run` → checks sync status only.

**Failure & Recovery:**

- If wiki:generate script missing → report error and suggest manual sync.
- If generation fails → check for PRD formatting issues.
