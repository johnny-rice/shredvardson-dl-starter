---
# Machine-readable metadata (parsed into docs/commands/index.json)
name: '/tasks'
version: '1.0.0'
lane: 'both'
skill: 'prd-analyzer'
tags: ['tasks', 'breakdown', 'implementation']
when_to_use: >
  Generate implementation task breakdown from spec and plan files. Works for both spec-driven and simple lane features.

arguments:
  - name: spec_file
    type: string
    required: true
    example: 'specs/payment-processing.md'

inputs:
  - type: 'spec-file'
    description: 'Path to spec file'
  - type: 'plan-file'
    description: 'Path to plan file (optional, but recommended)'
outputs:
  - type: 'task-list'
    description: 'Ordered task breakdown with dependencies and estimates'

riskLevel: 'LOW'
requiresHITL: false
riskPolicyRef: 'docs/llm/risk-policy.json#/taskPlanning'

allowed-tools:
  - 'Read(*)'
  - 'Write(*)'
  - 'Glob(*)'
  - 'Bash(pnpm *)'

preconditions:
  - 'Spec file exists'
  - 'Plan file exists (recommended)'
  - 'Acceptance criteria defined'
postconditions:
  - 'Task breakdown created'
  - 'Dependencies identified'
  - 'Estimates provided'

artifacts:
  produces:
    - { path: 'tasks/[feature-slug].md', purpose: 'Implementation task breakdown' }
  updates:
    - { path: 'specs/[feature-slug].md', purpose: 'Link to tasks file' }

permissions:
  tools:
    - name: 'filesystem'
      ops: ['read', 'write']
    - name: 'bash'
      ops: ['execute']

timeouts:
  softSeconds: 120
  hardSeconds: 240

idempotent: true
dryRun: false
estimatedRuntimeSec: 90
costHints: 'Low token usage; automated breakdown'

references:
  - '.claude/skills/prd-analyzer/SKILL.md'
---

# /tasks

**Goal:**
Generate a detailed implementation task breakdown from spec and plan files, with dependencies, estimates, and risk flags.

**Prompt:**

You are creating an implementation task breakdown. Follow these steps:

**Phase 0: Sub-Agent Research** 🤖

Before generating the task breakdown, delegate research to sub-agents for enriched context:

```typescript
// Delegate to Research Agent for dependency analysis
import { orchestrate } from '.claude/skills/agent-orchestrator/scripts/orchestrate.ts';

const researchResult = await orchestrate({
  agents: [{
    type: 'research',
    prompt: `Analyze the codebase to identify:
    1. Dependencies and integration points for implementing: [feature from spec]
    2. Similar implementations or patterns already in use
    3. External dependencies or third-party packages needed
    4. Database schema changes required
    5. API endpoints that need creation/modification

    Context:
    - Spec file: ${specPath}
    - Plan file: ${planPath || 'none'}

    Focus on: dependencies, integration points, and technical complexity`,
    timeout: 90000 // 90s for dependency analysis
  }]
});

// Extract findings
const dependencies = researchResult.agents[0].response;
```

**Use research findings to**:

- Identify all dependencies between tasks
- Estimate complexity based on integration points
- Flag high-risk tasks (external APIs, complex migrations, etc.)
- Suggest parallel vs sequential work streams

1. **Read Source Files**:
   - Read spec file (required)
   - Read plan file if it exists at `plans/[spec-slug].md`
   - Extract acceptance criteria from spec
   - Extract implementation phases from plan (if available)

2. **Generate Task Breakdown**:

   **Note:** This command relies on Claude's reasoning heuristics rather than explicit scripting.
   Use your understanding of the spec/plan to decompose work intelligently.

   Follow this process:

   a. **Identify Acceptance Criteria** → Extract from spec frontmatter/body
   b. **Decompose into Steps** → Break each criterion into atomic, testable tasks
   c. **Estimate Effort** → Use fibonacci sequence (1h, 2h, 3h, 5h, 8h, 13h)
   d. **Map Dependencies** → Identify which tasks must complete before others
   e. **Flag Risks** → Mark tasks with security, performance, or complexity concerns

   **Task Sizing Guidelines:**
   - 1-2h: Simple component creation, basic UI updates
   - 3-5h: API endpoint with tests, complex component with state
   - 8-13h: Database migration with RLS, authentication flow, external integration

3. **Create Tasks File**:

   Create `tasks/[spec-slug].md` with this structure:

   ```markdown
   ---
   title: [Feature Name] - Task Breakdown
   spec: specs/[spec-slug].md
   plan: plans/[spec-slug].md
   created: [YYYY-MM-DD]
   status: ready
   total_estimate: [Sum of all estimates]
   ---

   # [Feature Name] - Task Breakdown

   ## Summary

   **Total Estimated Effort:** [X hours]
   **Number of Tasks:** [N]
   **High-Risk Tasks:** [M]

   ## Task List

   ### Task 1: [Task Name]

   **ID:** T1
   **Priority:** [p0|p1|p2|p3]
   **Estimate:** [hours]
   **Dependencies:** None
   **Risk:** [low|medium|high]

   **Description:**
   [What needs to be done, specific and actionable]

   **Acceptance Criteria:**

   - [ ] [Specific, testable criterion]
   - [ ] [Another criterion]

   **Notes:**
   [Any implementation notes, gotchas, or considerations]

   ---

   ### Task 2: [Task Name]

   **ID:** T2
   **Priority:** [p0|p1|p2|p3]
   **Estimate:** [hours]
   **Dependencies:** T1
   **Risk:** [low|medium|high]

   **Description:**
   [What needs to be done]

   **Acceptance Criteria:**

   - [ ] [Criterion]

   **Notes:**
   [Notes]

   ---

   [Continue for all tasks...]

   ## Implementation Order

   **Phase 1: Foundation** (depends on: none)

   - T1: [Task name]
   - T2: [Task name]

   **Phase 2: Core Features** (depends on: Phase 1)

   - T3: [Task name]
   - T4: [Task name]

   **Phase 3: Integration** (depends on: Phase 2)

   - T5: [Task name]

   **Phase 4: Testing & Polish** (depends on: Phase 3)

   - T6: [Task name]

   ## Risk Mitigation

   ### High-Risk Tasks

   [List tasks flagged as high-risk with mitigation strategies]

   ### Dependencies

   [Critical path and potential bottlenecks]

   ## Testing Strategy

   **Per-Task Testing:**

   - Each task should have unit tests
   - Integration tests after each phase
   - E2E tests at completion

   **Coverage Targets:**

   - Unit: 80%
   - Integration: 70%
   - E2E: Critical paths

   ## Success Metrics

   [How to measure successful completion of all tasks]

   ## References

   - Spec: [Link]
   - Plan: [Link]
   - Related tasks: [Links to related task files]
   ```

4. **Task Breakdown Guidelines**:

   **Good Task Properties:**
   - **Atomic:** Can be completed in one sitting (1-8 hours)
   - **Testable:** Has clear pass/fail criteria
   - **Independent:** Minimizes blocking dependencies
   - **Specific:** Clear scope and deliverables
   - **Estimatable:** Can reasonably predict effort

   **Task Types:**
   - **Foundation:** Setup, configuration, infrastructure
   - **Core:** Main feature implementation
   - **Integration:** Connecting components
   - **Testing:** Test creation and validation
   - **Polish:** UI refinement, error handling, edge cases
   - **Docs:** Documentation and examples

   **Risk Indicators:**
   - High risk: New technology, complex logic, security-critical, external dependencies
   - Medium risk: Some unknowns, moderate complexity
   - Low risk: Well-understood, straightforward implementation

5. **Update Spec File**:

   Add tasks reference to spec frontmatter:

   ```yaml
   tasks: tasks/[spec-slug].md
   ```

6. **Output**:

   ```text
   ✅ Created task breakdown: tasks/[spec-slug].md
   📊 Total: [N] tasks, [X] hours estimated
   ⚠️  High-risk tasks: [M]

   Implementation order:
   Phase 1: [N1] tasks ([X1] hours)
   Phase 2: [N2] tasks ([X2] hours)
   Phase 3: [N3] tasks ([X3] hours)

   Next steps:
   - Review task breakdown
   - Start with Phase 1 tasks
   - Track progress in GitHub issues/project board
   ```

**Usage Examples:**

```bash
/tasks specs/payment-processing.md
/tasks specs/auth-system.md
/tasks specs/refactor-db.md
```

**Task Estimation Guide:**

- **1 hour:** Simple function, basic test, small refactor
- **2 hours:** Component with tests, API endpoint
- **3 hours:** Complex component, database migration
- **5 hours:** Feature module, integration work
- **8 hours:** Major subsystem, architectural change
- **13 hours:** Large feature, requires multiple sessions

**Failure & Recovery:**

- If spec file missing → provide path to create one with `/specify`
- If no acceptance criteria → warn that task breakdown may be incomplete
- If plan missing → still generate tasks from spec, but note that plan would improve quality
- If estimates seem too large → suggest breaking feature into smaller specs
- If too many dependencies → flag potential bottlenecks and suggest parallelization

**Integration with GitHub:**

After task breakdown, consider:

- Creating GitHub issues for each task
- Adding issues to project board
- Linking issues back to spec/plan
- Using task IDs in commit messages
