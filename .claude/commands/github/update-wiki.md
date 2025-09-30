---
# Machine-readable metadata (parsed into docs/commands/index.json)
name: '/github:update-wiki'
version: '1.0.0'
lane: 'lightweight'
tags: ['github', 'wiki', 'documentation']
when_to_use: >
  Sync current project state to wiki pages for GPT-5 context.

arguments: []

inputs: []
outputs:
  - type: 'artifact-links'

riskLevel: 'LOW'
requiresHITL: true
riskPolicyRef: 'docs/llm/risk-policy.json#commandDefaults'

allowed-tools:
  - 'Read(*.md)'
  - 'Read(wiki/**/*)'
  - 'Write(wiki/**/*)'
  - 'Glob(**/*.md)'

preconditions:
  - 'Project state changes exist'
  - 'Wiki structure is established'
postconditions:
  - 'Wiki pages updated with current state'
  - 'GPT-5 context is current'

artifacts:
  produces:
    - { path: 'wiki-updates.md', purpose: 'Generated wiki content updates' }
  updates: []

permissions:
  tools:
    - name: 'filesystem'
      ops: ['read', 'write']

timeouts:
  softSeconds: 300
  hardSeconds: 600

idempotent: true
dryRun: true
estimatedRuntimeSec: 180
costHints: 'Medium I/O; documentation generation'

references:
  - 'docs/constitution.md#documentation-standards'
  - 'CLAUDE.md#wiki-maintenance'
purpose: 'Generated wiki content updates'
---

**Slash Command:** `/github:update-wiki`

**Goal:**  
Sync current project state to wiki pages for GPT-5 context.

> Updates the canonical Wiki pages (list all or "discovered via Glob(\*_/_.md)").
> Idempotent given identical inputs; non-dry-run will overwrite existing pages.

**Prompt:**

1. Confirm lane (**lightweight**) against `CLAUDE.md` decision rules.
2. Update relevant wiki pages with current project state:
   - Add new features to Current-Features.md
   - Update architecture changes in Architecture-Overview.md
   - Document new patterns in Data-Model.md
   - Ensure Home.md reflects current project status
3. Generate updated content and provide copy-paste instructions for manual wiki update.
4. Produce wiki **artifacts** and **link** results in related Issue/PR.
5. Emit **Result**: wiki content generated, update instructions provided, and next suggested command.

**Examples:**

- `/github:update-wiki` → generates updated wiki content
- `/github:update-wiki --dry-run` → show planned wiki updates only.

**Failure & Recovery:**

- If wiki structure missing → suggest creating basic wiki template.
- If no changes to document → confirm current wiki is up to date.
