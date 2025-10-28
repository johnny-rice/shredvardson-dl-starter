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
riskPolicyRef: 'docs/llm/risk-policy.json#/commandDefaults'

allowed-tools:
  - 'Task(Documentation Writer)'
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

2. **Delegate to Documentation Writer sub-agent:**

   Invoke the Task tool to generate documentation:

   ```json
   Task(
     subagent_type="Documentation Writer",
     description="Generating documentation for [target]",
     prompt='''
     {
       "doc_type": "[inferred from context: readme|api|guide]",
       "target": {
         "type": "[inferred: file|component|api]",
         "path": "[path to target]"
       },
       "audience": "both",
       "include_examples": true,
       "style": "detailed"
     }
     '''
   )
   ```

   **Note:** Default parameters (audience: "both", style: "detailed") are suitable for most documentation tasks. Future versions may add command arguments for customization.

   Wait for documentation generation to complete.

3. **Parse documentation output:** Extract `documentation`, `file_path`, `frontmatter`, `metadata`, `related_docs`, `confidence` from JSON response.

4. **Focus areas** for documentation updates:
   - API routes in `src/app/api/`
   - Component props and usage
   - Installation/development setup
   - Available scripts in `package.json`

5. **Update README.md** sections that are outdated using Edit tool.

6. **Use JSDoc comments and test files** as source of truth.

7. **Produce updated documentation artifacts** and link results in related Issue/PR.

8. **Emit Result:** what documentation was updated and next suggested command.

**Examples:**

- `/docs:generate` → updates all outdated documentation
- `/docs:generate --dry-run` → show planned documentation updates only.

**Failure & Recovery:**

- If no JSDoc comments found → suggest adding documentation comments first.
- If README structure unclear → ask for guidance on organization.
