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
  - 'Task(research-agent)'
  - 'Task(security-scanner)'

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

2. **Delegate to Sub-Agents (Token Optimization)**:

   **If `lane: spec-driven`:**

   Before design discovery, delegate codebase exploration and security analysis to Haiku-based sub-agents for 50%+ token savings:

   **Step 2a: Invoke Research Agent + Security Scanner in parallel**

   Use Task tool to invoke both agents simultaneously:

   ```javascript
   // Research Agent delegation
   Task({
     subagent_type: "research-agent",
     description: "Research codebase patterns for [feature type]",
     prompt: `Analyze the codebase for patterns related to: [feature summary from spec]

   Focus Areas:
   ${spec.focus_areas.map(area => `- ${area}`).join('\n')}

   Research Depth: deep

   Include:
   - Similar implementations in the codebase
   - Architecture patterns used
   - External library recommendations
   - Code locations and references

   Return findings as structured JSON matching ResearchResponse schema.`
   })

   // Security Scanner delegation
   Task({
     subagent_type: "security-scanner",
     description: "Scan for security vulnerabilities in [feature area]",
     prompt: `Scan for security issues related to: [feature summary from spec]

   Focus Areas:
   ${spec.focus_areas.map(area => `- ${area}`).join('\n')}

   Analyze:
   - RLS (Row-Level Security) policy gaps
   - Authentication/authorization vulnerabilities
   - Input validation and injection risks
   - Data exposure and privacy issues
   - API security weaknesses

   Return findings as structured JSON matching SecurityResponse schema.`
   })
   ```

   **Step 2b: Parse and validate JSON responses**

- Extract JSON from both agent responses (handle markdown wrappers)
- Validate against ResearchResponse and SecurityResponse schemas
- If parsing fails, log error and continue without sub-agent findings (graceful degradation)

   **Step 2c: Use findings to enrich design discovery**

   Store findings for use in Phase 1-3:

- Research findings → inform architectural options in Phase 2
- Security findings → add to security considerations in Phase 3
- Code references → include in plan references section

   **If `lane: simple`:**

   Skip sub-agent delegation (simple features don't need deep research)

3. **Lane-Based Planning**:

   **If `lane: spec-driven`:**

   Trigger **3-phase design discovery** using prd-analyzer's Socratic methodology:

   **Phase 1: Understanding** - Ask clarifying questions one at a time

   **IMPORTANT: Use research findings from sub-agents to inform your questions**

   Before asking questions, review:

   - Research Agent findings: similar patterns, architecture used, code locations
   - Security Scanner findings: vulnerabilities, RLS gaps, security recommendations

Use the AskUserQuestion pattern:

```text
**Question:** [Specific technical question]

[If relevant] Based on codebase analysis: [Brief insight from research findings]

Options:
- Option A: [Description] [+ reference to similar implementation if found]
- Option B: [Description]
- Option C: [Description]

Context: [Why this matters and how it affects the design]
[If relevant] Security note: [Mention any security findings related to this decision]
````

**Rules:**

- Ask ONE question at a time
- Provide 2-3 concrete options
- **Use research findings to make options more concrete and evidence-based**
- Include code references from research when relevant
- Mention security concerns from scanner when applicable
- Explain WHY the answer matters
- Wait for user response before next question
- Focus on: requirements, constraints, trade-offs, success criteria

  **Phase 2: Exploration** - Confidence-based recommendation with gating

  **IMPORTANT: Base options on research findings + security recommendations + confidence calculation**

  **Step 1: Calculate Confidence**

  Before presenting options, calculate confidence:

  1. Use `detectTechStack()` to extract libraries and deployment platform from package.json + ADRs
  2. Use `calculateConfidence()` with inputs:
     - `researchDepth`: 'high' if Research Agent ran, 'medium' if partial findings, 'low'/'null' if none
     - `techStackMatch`: 'full' if all options fit stack, 'partial' if some, 'generic' if none
     - `architectureSimplicity`: 'simple' for common patterns, 'moderate', 'complex' for novel
     - `knowledgeRecency`: 'current' if pre-2025, 'emerging' if post-2025
  3. Get confidence result: `{ percentage: number, level: 'HIGH' | 'MEDIUM' | 'LOW', factors: string[], reasoning: string }`

  **Thresholds:**
  - HIGH: ≥90%
  - MEDIUM: 70-89%
  - LOW: <70%

  **Step 2: Confidence-Based Gating**

  Based on confidence level, follow the appropriate flow:

  **IF confidence.level === 'HIGH' (≥90%):**

  Auto-proceed with single recommendation - no user prompt needed.

  ```text
  🎯 HIGH CONFIDENCE RECOMMENDATION

  Confidence: [XX]% (HIGH)
  Reasoning: [confidence.reasoning]

  Recommended Approach: [Option Name]

  [Brief description of recommended approach - 2-3 sentences]

  ✅ Why this approach:
  - [Key benefit 1 - backed by research/codebase analysis]
  - [Key benefit 2 - tech stack alignment]
  - [Key benefit 3 - simplicity/proven pattern]

  ⚠️ Security considerations:
  [List any P0/high severity issues from Security Scanner]
  [Security patterns to include in implementation]

  ---

  Proceeding to Phase 3 (Design Presentation) with this approach.
  User can interrupt with Ctrl+C if different approach preferred.
  ```

  - Log decision with `createRecommendationLog()` and `logRecommendation()`
  - Track: sessionId, confidence (HIGH), recommended option, user choice (auto-accepted), research triggered
  - **Proceed directly to Phase 3** without waiting for user input

  **ELSE IF confidence.level === 'MEDIUM' (70-89%):**

  Show recommendation with yes/no/research options - requires user confirmation.

  ```text
  ⚠️ MEDIUM CONFIDENCE - RECOMMENDATION PROVIDED

  Confidence: [XX]% (MEDIUM)
  Reasoning: [confidence.reasoning]

  Uncertainty factors:
  [List factors that prevented HIGH confidence - from confidence.factors]

  ---

  🎯 RECOMMENDED: [Option Name]

  Based on codebase analysis, I see [2-3] approaches for [feature]:

  **Option A:** [Approach Name]
  [If found in research] Similar to: [file:line reference from codebase]

  ✅ Pros:
  - [Benefit 1]
  - [Benefit 2 - backed by research findings]
  - [Benefit 3]

  ❌ Cons:
  - [Drawback 1]
  - [Security concern from scanner, if applicable]
  - [Drawback 3]

  Best for: [Specific use case]

  **Option B:** [Approach Name] ← RECOMMENDED
  [Same structure]

  **Option C:** [Approach Name]
  [Same structure]

  ---

  Security considerations:
  [List P0/high severity issues from Security Scanner that apply to all options]

  ---

  **Next steps:**
  - Type 'yes' or 'accept' to proceed with recommended option (Option B)
  - Type 'A', 'B', or 'C' to choose a different option
  - Type 'research' to trigger additional research (Context7 + WebSearch)
  - Type 'no' or 'cancel' to exit and refine spec

  Your choice:
  ```

  Wait for user input and handle response:
  - If 'yes'/'accept' → Proceed to Phase 3 with recommended option
  - If 'A'/'B'/'C' → Proceed to Phase 3 with chosen option
  - If 'research' → Trigger auto-research (see below), recalculate confidence, retry gating
  - If 'no'/'cancel' → Exit gracefully, suggest refining spec

  - Log decision with `createRecommendationLog()` and `logRecommendation()`
  - Track: sessionId, confidence (MEDIUM), recommended option, user choice, accepted (boolean), research triggered

  **ELSE IF confidence.level === 'LOW' (<70%):**

  Auto-trigger research, recalculate confidence, then proceed based on new level.

  ```text
  🔍 LOW CONFIDENCE - TRIGGERING AUTO-RESEARCH

  Confidence: [XX]% (LOW)
  Reasoning: [confidence.reasoning]

  Uncertainty factors:
  [List factors that resulted in LOW confidence]

  ---

  Researching to improve confidence...

  [Call triggerAutoResearch() from .claude/scripts/orchestrator/confidence/auto-research.ts]

  - Checking rate limit (max 10 research calls per session)...
  - Searching Context7 for [library/pattern] documentation...
  - Analyzing codebase for similar implementations...
  - Searching web for best practices...

  [Display progress as research runs]

  Research complete. Recalculating confidence...
  ```

  After research completes:
  1. Recalculate confidence with new research findings
  2. If new confidence is MEDIUM or HIGH → Follow that flow above
  3. If still LOW after research → Fall back to MEDIUM flow (show options, require user choice)
  4. Log research trigger and results

  **Auto-Research Implementation:**
  - Use `triggerAutoResearch()` from `.claude/scripts/orchestrator/confidence/auto-research.ts`
  - Checks rate limit via `.claude/scripts/orchestrator/confidence/rate-limit.ts` (max 10 per session)
  - If rate limit exceeded:

    ```text
    ⚠️ Research quota exceeded (10 research calls per session)

    Falling back to MEDIUM confidence flow - please review options and choose.
    ```

    → Fall back to MEDIUM confidence flow
  - Research includes:
    - Context7 library documentation search
    - Codebase pattern analysis (via Research Agent)
    - Web search for best practices
  - Returns enhanced reasoning with external references
  - Append research findings to context for recalculation

  **Step 3: Log Decision**

  After user decision (explicit or auto-proceed):
  - Use `createRecommendationLog()` and `logRecommendation()` from `.claude/scripts/orchestrator/confidence/audit-log.ts`
  - Track metadata:
    - sessionId
    - timestamp
    - confidence_level (HIGH/MEDIUM/LOW)
    - confidence_percentage
    - confidence_factors
    - recommended_option
    - user_choice (selected option or 'auto-accepted')
    - accepted (boolean - did user accept recommendation?)
    - research_triggered (boolean)
    - spec_file_path
  - Logs written to `.claude/logs/` for audit trail

  **Phase 3: Design Presentation** - Present design incrementally

  Present design in **200-300 word sections**:
  1. Present one section (architecture, data model, API, etc.)
  2. Ask: "Does this address your requirements?"
  3. Wait for validation
  4. Adjust if needed
  5. Move to next section

  **Sections to cover:**

- High-level architecture [+ architecture patterns from research]
- Data model/schema [+ RLS requirements from security scan]
- API design [+ security patterns from scanner]
- Security considerations [+ vulnerabilities and recommendations from Security Scanner]
- Error handling
- Testing strategy
- Deployment approach

  **Anti-pattern:** Don't dump entire design at once

  **Enhancement from sub-agents:**

- Include code references from Research Agent in each section
- Incorporate security recommendations from Security Scanner
- Link to external library documentation found by Research Agent

  **If `lane: simple`:**

  Skip design discovery and create basic plan:

- Read spec acceptance criteria
- Identify major implementation steps
- Note any obvious technical decisions
- Create straightforward implementation plan

4. **Create Plan File**:

   Create `plans/[spec-slug].md` with this structure:

   ```markdown
   ---
   title: [Feature Name] - Implementation Plan
   spec: specs/[spec-slug].md
   lane: [spec-driven|simple]
   created: [YYYY-MM-DD]
   status: draft
   confidence_level: [HIGH|MEDIUM|LOW]
   confidence_percentage: [0-100]
   confidence_reasoning: "[Brief reasoning from confidence calculation - max 200 chars]"
   research_triggered: [true|false]
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

5. **Create ADR (If Needed)**:

   If architectural decisions were made during design discovery:
   - Use `/adr:draft` to create ADR
   - Document decision context, chosen approach, consequences
   - Link ADR from plan file

6. **Update Spec Status**:

   Update spec file frontmatter:

   ```yaml
   status: ready # was: draft
   plan: plans/[spec-slug].md
   ```

7. **Output**:

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

**Token Budget with Sub-Agent Optimization:**

**Without sub-agents (legacy):**

- Research & exploration: ~50,000 tokens ($0.90 Sonnet)
- Design discovery: ~70,000 tokens ($1.26 Sonnet)
- **Total: ~120,000 tokens ($2.16)**

**With sub-agents (optimized):**

- Sub-agent overhead: 200 tokens (SKILL.md load)
- Research Agent (isolated): ~45,000 tokens ($0.25 Haiku)
- Security Scanner (isolated): ~20,000 tokens ($0.11 Haiku)
- Sub-agent responses loaded: ~5,000 tokens ($0.09 Sonnet)
- Design discovery (enriched): ~30,000 tokens ($0.54 Sonnet)
- **Total: ~50,200 tokens ($0.99)**

## Savings

58% tokens, 54% cost ($1.17 saved per workflow)

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
