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

This command delegates to the **Issue Creator Agent** (Haiku 4.5) for efficient issue generation.

**Process:**

1. Gather context from conversation:
   - Extract issue title from discussion
   - Collect description/requirements
   - Identify suggested labels (if any)
   - Determine template type (feature, bug, epic, blank)
   - Optional: Collect project context (tech stack, existing features)

2. Confirm lane (**lightweight/spec**) against `CLAUDE.md` decision rules.

3. Delegate to Issue Creator Agent:

   ```typescript
   const input = {
     title: extractedTitle,
     description: conversationSummary,
     labels: suggestedLabels || [],
     template: templateType || 'feature',
     project_context: {
       has_db: true,
       has_supabase: true,
       tech_stack: ['Next.js', 'Supabase', 'TypeScript'],
     },
   };

   // Use Task tool with issue-creator-agent subagent
   const result = await Task({
     subagent_type: 'issue-creator-agent',
     description: 'Generate GitHub issue',
     prompt: `Generate GitHub issue from discussion.\n\nInput: ${JSON.stringify(input, null, 2)}`,
   });
   ```

4. Process agent response:
   - Parse JSON output from agent
   - Extract `formatted_title` and `formatted_body`
   - Review suggested labels and effort estimate
   - Display preview to user

5. Create GitHub issue:
   - Use `gh issue create` with formatted content
   - Apply suggested labels
   - Return issue URL

6. Emit **Result**: issue created, URL provided, and next suggested command.

**Examples:**

- `/github:create-issue ai-collaboration` → creates issue with AI collaboration template
- `/github:create-issue --dry-run` → show planned issue content only.

**Agent Benefits:**

- **Cost savings:** 68% reduction per task (Haiku vs Sonnet)
- **Speed:** 4-5x faster response time
- **Consistent formatting:** Always follows template structure
- **Smart label suggestions:** Automatically recommends appropriate labels

**Failure & Recovery:**

- If agent returns low confidence → ask for clarification on requirements
- If template missing → agent uses built-in template structure
- If context unclear → agent flags missing details for user review
- If agent fails → fallback to manual issue creation
