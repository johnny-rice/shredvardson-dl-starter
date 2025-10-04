---
# Machine-readable metadata (parsed into docs/commands/index.json)
name: '/specify'
version: '1.0.0'
lane: 'spec'
tags: ['spec-kit', 'requirements', 'planning']
when_to_use: >
  Define pure requirements - what and why only, no technical details.

arguments: []

inputs: []
outputs:
  - type: 'artifact-links'

riskLevel: 'LOW'
requiresHITL: false
riskPolicyRef: 'docs/llm/risk-policy.json#commandDefaults'

allowed-tools:
  - 'Read(*)'
  - 'Write(*)'
  - 'Bash(gh issue create:*)'

preconditions:
  - 'Feature requirements are understood'
  - 'User needs are clear'
postconditions:
  - 'Pure requirements specification created'
  - 'GitHub issue created and linked'

artifacts:
  produces:
    - { path: 'specs/feature-[number]-[name].md', purpose: 'Feature specification' }
  updates: []

permissions:
  tools:
    - name: 'filesystem'
      ops: ['read', 'write']
    - name: 'github'
      ops: ['create']

timeouts:
  softSeconds: 300
  hardSeconds: 600

idempotent: true
dryRun: true
estimatedRuntimeSec: 240
costHints: 'Low I/O; requirements analysis'

references:
  - 'docs/constitution.md#specification-principles'
  - 'CLAUDE.md#spec-driven-workflow'
---

**Slash Command:** `/specify`

**Goal:**  
Define pure requirements - what and why only, no technical details.

**Prompt:**

1. Confirm lane (**spec**) against `CLAUDE.md` decision rules.
2. Create a feature specification focused ONLY on what users need and why.
3. Constraints:
   - NO tech stack, APIs, or implementation details
   - NO "how" - only "what" and "why"
   - Mark ALL ambiguities with [NEEDS_CLARIFICATION]
   - Reference existing features and user workflows
   - Focus on user value and business requirements
4. Format output with User Need, Functional Requirements, User Experience, Success Criteria, and Clarifications Needed.
5. **IMPORTANT**: Start the specification file with YAML frontmatter:
   ```yaml
   ---
   id: SPEC-{YYYYMMDD}-{kebab-case-name}
   type: spec
   issue: { github-issue-number }
   source: { github-issue-url }
   ---
   ```
   Example:
   ```yaml
   ---
   id: SPEC-20251003-testing-infrastructure
   type: spec
   issue: 108
   source: https://github.com/Shredvardson/dl-starter/issues/108
   ---
   ```
6. Auto-number the feature sequentially and save to `/specs/` folder.
7. Create GitHub issue linking to this specification.
8. Emit **Result**: specification created, issue URL, ready for `/plan` command.

**Examples:**

- `/specify` → creates feature specification and GitHub issue
- `/specify --dry-run` → show planned specification structure only.

**Failure & Recovery:**

- If requirements unclear → ask for clarification on user needs and value.
- If scope too large → suggest breaking into smaller features.
