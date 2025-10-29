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
riskPolicyRef: 'docs/llm/risk-policy.json#/prAutomation'

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

This command delegates to the **PR Template Agent** (Haiku 4.5) for efficient PR generation.

**Process:**

1. Gather context:
   - Get current branch name: `git rev-parse --abbrev-ref HEAD`
   - Identify base branch (usually `main`)
   - Collect spec artifact paths: `specs/`, `plans/`, `tasks/`
   - Optional: Issue number from argument

2. Delegate to PR Template Agent:

   ```typescript
   const input = {
     branch: currentBranch,
     base_branch: baseBranch || 'main',
     spec_artifacts: ['specs/', 'plans/', 'tasks/'],
     pr_template_path: '.github/pull_request_template.md',
   };

   // Use Task tool with pr-template-agent subagent
   const result = await Task({
     subagent_type: 'pr-template-agent',
     description: 'Generate PR template',
     prompt: `Generate PR template for branch ${currentBranch}.\n\nInput: ${JSON.stringify(input, null, 2)}`,
   });
   ```

3. Process agent response:
   - Parse JSON output from agent
   - Extract `pr_title` and `pr_body`
   - Save to `artifacts/pr-body.md`
   - Display traceability information to user

4. Suggest next steps:
   - If confidence is high: suggest `/git:prepare-pr`
   - If confidence is medium/low: suggest reviewing the PR body
   - Display any warnings or notes from the agent

**Examples:**

- `/pr:assist #123` → fills template for issue #123
- `/pr:assist` → auto-detects issue from branch name
- `/pr:assist --dry-run` → shows template structure only.

**Agent Benefits:**

- **Cost savings:** 68% reduction per task (Haiku vs Sonnet)
- **Speed:** 4-5x faster response time
- **Context isolation:** Agent explores freely, returns concise summary
- **Structured output:** Guaranteed JSON format with traceability

**Failure & Recovery:**

- If agent returns low confidence → review and supplement PR body manually
- If no traceability artifacts found → agent will generate from commits only
- If multiple specs found → agent will include all relevant IDs
- If agent fails → fallback to manual PR template generation
