---
# Machine-readable metadata (parsed into docs/commands/index.json)
name: '/research:explore'
version: '1.0.0'
lane: 'lightweight'
tags: ['research', 'exploration', 'codebase']
when_to_use: >
  Deep codebase exploration to answer questions about architecture, patterns, or implementation details.

arguments:
  - name: query
    type: string
    required: true
    example: 'How does authentication work?'

inputs: []
outputs:
  - type: 'report'

riskLevel: 'LOW'
requiresHITL: false
riskPolicyRef: 'docs/llm/risk-policy.json#commandDefaults'

allowed-tools:
  - 'Read(*)'
  - 'Glob(*)'
  - 'Grep(*)'
  - 'Bash(ls:*)'
  - 'Bash(find:*)'

preconditions: []
postconditions:
  - 'Research report generated with findings'

artifacts:
  produces:
    - { path: 'scratch/research-*.md', purpose: 'Research findings report' }
  updates: []

permissions:
  tools:
    - name: 'filesystem'
      ops: ['read']
    - name: 'bash'
      ops: ['execute']

timeouts:
  softSeconds: 60
  hardSeconds: 120

idempotent: true
dryRun: false
estimatedRuntimeSec: 45
costHints: 'Read-only; uses Haiku sub-agent for token isolation'

references:
  - 'docs/constitution.md#research-workflow'
  - '.claude/agents/research-agent.md'
---

# /research:explore

**Goal:**
Deep codebase exploration using isolated Research Agent context to answer architectural and implementation questions.

**Prompt:**

1. Parse user's research query from arguments.
2. **Delegate to Research Agent sub-agent** with JSON input:

   ```json
   {
     "query": "user's natural language question",
     "focus_areas": ["optional", "specific", "areas"],
     "max_files": 50
   }
   ```

3. Receive JSON output with `key_findings`, `architecture_patterns`, `recommendations`, `code_locations`, `confidence`.
4. Present findings to user in clear, organized format with file:line references.
5. Optionally save findings to `scratch/research-YYYY-MM-DD-topic.md` for future reference.
6. Suggest follow-up questions if research was incomplete or confidence is low.

**Examples:**

- `/research:explore "How does authentication work?"` → explores auth implementation
- `/research:explore "Where are UI buttons defined?"` → finds button components
- `/research:explore "What database migrations exist?"` → lists migration files

**Output Format:**

Present findings concisely:

```markdown
## Key Findings

- Finding 1 ([file.ts:42](path/to/file.ts#L42))
- Finding 2 ([file.ts:58](path/to/file.ts#L58))

## Architecture Patterns

- Pattern 1 description
- Pattern 2 description

## Recommendations

- Recommendation 1
- Recommendation 2

## Code Locations

- [file.ts:42](path/to/file.ts#L42) - Purpose description
- [other.ts:15](path/to/other.ts#L15) - Purpose description

**Confidence:** High/Medium/Low
```

**Failure & Recovery:**

- If query too broad → Research Agent returns partial findings and suggests narrowing scope
- If no matches found → Research Agent suggests alternative search terms
- If timeout approaching → Research Agent returns partial results with follow-up suggestions
