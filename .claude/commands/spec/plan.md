---
# Machine-readable metadata (parsed into docs/commands/index.json)
name: '/plan'
version: '1.0.0'
lane: 'both'
skill: 'prd-analyzer'
tags: ['planning', 'design', 'architecture']
when_to_use: >
  Generate technical plan from spec file. Automatically triggers design discovery for spec-driven lane features.

arguments:
  - name: spec_file
    type: string
    required: true
    example: 'specs/payment-processing.md'

inputs:
  - type: 'spec-file'
    description: 'Path to validated spec file'
outputs:
  - type: 'plan-file'
    description: 'Technical implementation plan'
  - type: 'adr-file'
    description: 'Architectural Decision Record (if architectural decisions made)'

riskLevel: 'MEDIUM'
requiresHITL: true
riskPolicyRef: 'docs/llm/risk-policy.json#/designDecisions'

allowed-tools:
  - 'Read(*)'
  - 'Write(*)'
  - 'Glob(*)'
  - 'Bash(pnpm *)'
  - 'SlashCommand(/adr:draft)'

preconditions:
  - 'Spec file exists and is valid'
  - 'Spec has required YAML frontmatter'
  - 'Acceptance criteria defined'
postconditions:
  - 'Technical plan created'
  - 'ADR created if architectural decisions made'
  - 'Plan references spec file'

artifacts:
  produces:
    - { path: 'plans/[feature-slug].md', purpose: 'Technical implementation plan' }
    - { path: 'docs/decisions/ADR-*.md', purpose: 'Architectural decision record (conditional)' }
  updates:
    - { path: 'specs/[feature-slug].md', purpose: 'Update status to ready' }

permissions:
  tools:
    - name: 'filesystem'
      ops: ['read', 'write']
    - name: 'bash'
      ops: ['execute']
    - name: 'slash-commands'
      ops: ['execute']

timeouts:
  softSeconds: 300
  hardSeconds: 600

idempotent: false
dryRun: false
estimatedRuntimeSec: 240
costHints: 'Interactive design discovery for spec-driven; quick planning for simple lane'

references:
  - '.claude/skills/prd-analyzer/SKILL.md'
  - 'docs/decisions/0001-template.md'
---

# /plan

**Goal:**
Generate a technical implementation plan from a spec file. For spec-driven lane features, triggers structured design discovery using Socratic methodology.

**Prompt:**

You are creating a technical plan from a spec file. Follow these steps:

1. **Read and Parse Spec**:
   - Read the spec file provided
   - Parse YAML frontmatter to get lane, type, priority
   - Extract acceptance criteria and constraints
   - Validate spec completeness

2. **Lane-Based Planning**:

   **If `lane: spec-driven`:**

   Trigger **3-phase design discovery** using prd-analyzer's Socratic methodology:

   **Phase 1: Understanding** - Ask clarifying questions one at a time

   Use the AskUserQuestion pattern:

   ```text
   **Question:** [Specific technical question]

   Options:
   - Option A: [Description]
   - Option B: [Description]
   - Option C: [Description]

   Context: [Why this matters and how it affects the design]
   ```

   **Rules:**
   - Ask ONE question at a time
   - Provide 2-3 concrete options
   - Explain WHY the answer matters
   - Wait for user response before next question
   - Focus on: requirements, constraints, trade-offs, success criteria

   **Phase 2: Exploration** - Present 2-3 architectural approaches

   ```text
   I see [2-3] approaches for [feature]:

   **Option A:** [Approach Name]
   ✅ Pros:
   - [Benefit 1]
   - [Benefit 2]
   - [Benefit 3]

   ❌ Cons:
   - [Drawback 1]
   - [Drawback 2]
   - [Drawback 3]

   Best for: [Specific use case]

   **Option B:** [Approach Name]
   [Same structure]

   **Option C:** [Approach Name]
   [Same structure]

   Which approach fits your needs?
   ```

   **Rules:**
   - Present options objectively (no pushing preferred solution)
   - Include honest trade-offs
   - Tailor to user's infrastructure/constraints
   - Wait for user decision

   **Phase 3: Design Presentation** - Present design incrementally

   Present design in **200-300 word sections**:
   1. Present one section (architecture, data model, API, etc.)
   2. Ask: "Does this address your requirements?"
   3. Wait for validation
   4. Adjust if needed
   5. Move to next section

   **Sections to cover:**
   - High-level architecture
   - Data model/schema
   - API design
   - Security considerations
   - Error handling
   - Testing strategy
   - Deployment approach

   **Anti-pattern:** Don't dump entire design at once

   **If `lane: simple`:**

   Skip design discovery and create basic plan:
   - Read spec acceptance criteria
   - Identify major implementation steps
   - Note any obvious technical decisions
   - Create straightforward implementation plan

3. **Create Plan File**:

   Create `plans/[spec-slug].md` with this structure:

   ```markdown
   ---
   title: [Feature Name] - Implementation Plan
   spec: specs/[spec-slug].md
   lane: [spec-driven|simple]
   created: [YYYY-MM-DD]
   status: draft
   ---

   # [Feature Name] - Implementation Plan

   ## Overview

   [Brief summary of the implementation approach]

   ## Design Decisions

   [For spec-driven: Validated design choices from Phase 2-3]
   [For simple: Key technical decisions]

   ## Architecture

   [High-level architecture diagram or description]
   [Component breakdown]
   [Data flow]

   ## Implementation Phases

   ### Phase 1: [Phase Name]

   **Goal:** [What this phase achieves]
   **Tasks:**

   - Task 1
   - Task 2

   **Deliverables:**

   - Deliverable 1
   - Deliverable 2

   ### Phase 2: [Phase Name]

   [Same structure]

   ## Technical Specifications

   ### Data Model

   [Schema, relationships, constraints]

   ### API Design

   [Endpoints, request/response formats]

   ### Security

   [Authentication, authorization, data protection]

   ## Testing Strategy

   [Unit tests, integration tests, E2E tests]
   [Coverage requirements]

   ## Deployment

   [Deployment steps, rollback plan]
   [Migration strategy if needed]

   ## Risk Mitigation

   [Identified risks and mitigation strategies]

   ## Success Criteria

   [How we know the implementation is successful]

   ## References

   - Spec: [Link to spec file]
   - ADR: [Link to ADR if created]
   - Related docs
   ```

4. **Create ADR (If Needed)**:

   If architectural decisions were made during design discovery:
   - Use `/adr:draft` to create ADR
   - Document decision context, chosen approach, consequences
   - Link ADR from plan file

5. **Update Spec Status**:

   Update spec file frontmatter:

   ```yaml
   status: ready # was: draft
   plan: plans/[spec-slug].md
   ```

6. **Output**:

   ```text
   ✅ Created plan: plans/[spec-slug].md
   [If ADR created] 📝 Created ADR: docs/decisions/ADR-[id].md
   📋 Updated spec status: ready

   Next steps:
   - Review the plan
   - Run `/tasks specs/[slug].md` to generate implementation tasks
   ```

**Usage Examples:**

```bash
/plan specs/payment-processing.md
/plan specs/auth-system.md
/plan specs/refactor-db-connections.md
```

**Design Discovery Token Budget:**

- **Understanding phase:** ~20 tokens per question (3-5 questions)
- **Exploration phase:** ~150 tokens for 3 options
- **Design presentation:** ~50 tokens per validation checkpoint (5-8 sections)
- **Total overhead:** ~300-500 tokens

**ROI:** Prevents costly architectural mistakes (saves 2-4 hours of rework) when:

- User confirms design addresses requirements at each checkpoint
- ADR is created to document key decisions
- Design discovery surfaces clarifications that prevent implementation dead-ends

**Failure & Recovery:**

- If spec file missing → provide clear path and suggest `/specify` first
- If spec invalid → run validation and show specific errors
- If lane not specified → default to 'simple' lane
- If user unsure during discovery → offer to pause and research, then resume
- If design gets too complex → break into sub-features with separate specs
