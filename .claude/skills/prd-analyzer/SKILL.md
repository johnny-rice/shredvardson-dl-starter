# PRD Analyzer Skill

Extracts acceptance criteria and validates specs against YAML frontmatter standards. For spec-lane features, provides structured design discovery with Socratic questioning.

## Core Workflow

```text
parse → validate → extract → [discover] → breakdown
```

**Note:** `discover` phase activates for `lane: spec-driven` features only.

## Actions

### parse <spec_file>

Parses YAML frontmatter from spec file.

**Script**: `scripts/parse-spec.ts`
**Output**: Parsed frontmatter, metadata, validation status

### validate <spec_file>

Validates spec structure against standards.

**Script**: `scripts/validate-spec.ts`
**Checks**:

- Required frontmatter fields (title, type, priority, status)
- Proper YAML syntax
- Acceptance criteria presence
- Technical constraints documented

**Output**: Validation report, errors, warnings

### extract <spec_file>

Extracts acceptance criteria for implementation.

**Script**: `scripts/extract-criteria.ts`
**Output**: Structured acceptance criteria, success metrics, constraints

### discover <spec_file>

**Triggers when:** Spec has `lane: spec-driven` in frontmatter
**For:** Complex features (auth, payments, database, multi-day work)

Structured design discovery using Socratic methodology.

**Script**: `scripts/discover-design.ts`
**Process**:

1. **Understanding Phase** - Ask clarifying questions one at a time
2. **Exploration Phase** - Present 2-3 architectural approaches with trade-offs
3. **Design Presentation** - Incremental 200-300 word sections with validation
4. **Documentation** - Capture validated design in ADR/plan

**Output**: Design choices, trade-off analysis, implementation plan

### breakdown <spec_file>

Generates task breakdown from spec.

**Script**: `scripts/generate-tasks.ts`
**Output**: Ordered task list, dependencies, estimates

## Progressive Disclosure

**Level 1** (Metadata): skill.json (~20 tokens)
**Level 2** (This file): SKILL.md (~180 tokens)
**Level 3** (On-demand): Scripts executed, only output returned (~0 tokens)

## YAML Frontmatter Standards

**Required Fields**:

```yaml
---
title: Feature or issue title
type: feature | bugfix | refactor | docs
priority: p0 | p1 | p2 | p3
status: draft | ready | in-progress | done
---
```

**Optional Fields**:

```yaml
issue: GitHub issue number
assignee: GitHub username
labels: [label1, label2]
estimate: Time estimate
dependencies: [task1, task2]
```

**Documentation**: See `docs/specs/YAML_FRONTMATTER.md`

## Acceptance Criteria Format

Acceptance criteria should be:

- Testable
- Specific
- Measurable
- User-focused
- Independent

**Example**:

```markdown
## Acceptance Criteria

- [ ] User can sign up with email and password
- [ ] Email verification sent within 5 seconds
- [ ] Invalid email shows clear error message
- [ ] Duplicate email prevented with helpful message
```

## Task Breakdown

The `breakdown` action generates:

1. Ordered implementation tasks
2. Dependencies between tasks
3. Time estimates
4. Risk flags

**Output Format**:

```json
{
  "tasks": [
    {
      "id": 1,
      "description": "Create signup API endpoint",
      "dependencies": [],
      "estimate": "2 hours",
      "risk": "low"
    }
  ]
}
```

## Design Discovery Protocol

**Source:** Adapted from [obra/superpowers:writing-plans](https://github.com/obra/superpowers)

### When to Use

Design discovery activates ONLY for `lane: spec-driven` features:

- Authentication systems
- Payment processing
- Database architecture
- Multi-day/multi-phase features
- Cross-cutting concerns

**Skip for:** Quick fixes, simple feature additions, refactoring

### Three-Phase Process

#### Phase 1: Understanding

Ask clarifying questions **one at a time** to understand requirements.

**AskUserQuestion Pattern:**

```markdown
**Question:** Should we handle refunds in this phase?

Options:

- Yes - Full refund workflow
- No - Ship without refunds
- Partial - Basic refund, detailed later

Context: This affects payment provider choice and data model.
```

**Rules:**

- One question at a time
- Provide context for WHY it matters
- Offer concrete options
- Wait for answer before next question

#### Phase 2: Exploration

Present **2-3 architectural approaches** with honest trade-offs.

**Format:**

```markdown
I see 3 approaches for [feature]:

**Option A:** [Name]
✅ Pros: [2-3 benefits]
❌ Cons: [2-3 drawbacks]
Best for: [use case]

**Option B:** [Name]
✅ Pros: [2-3 benefits]
❌ Cons: [2-3 drawbacks]
Best for: [use case]

**Option C:** [Name]
✅ Pros: [2-3 benefits]
❌ Cons: [2-3 drawbacks]
Best for: [use case]

Which approach resonates with your needs?
```

**No pushing preferred solution** - present options objectively.

#### Phase 3: Design Presentation

Present design in **incremental 200-300 word sections**.

**Flow:**

1. Present section (architecture, data model, API design, etc.)
2. Ask: "Does this address your requirements?"
3. Wait for validation
4. Adjust if needed
5. Move to next section

**Anti-pattern:** Dumping full design all at once.

### Documentation Output

After validation, capture in:

- **ADR** (Architectural Decision Record) for architecture choices
- **Technical Plan** for implementation approach
- **Updated Spec** with validated design details

### Example Flow

```text
[Spec has lane: spec-driven]

Phase 1: Understanding
Q: "Should webhooks be synchronous or async?"
[User: async]

Q: "What's the retry strategy for failed webhooks?"
[User: 3 retries with exponential backoff]

Phase 2: Exploration
"I see 3 webhook implementation approaches:

Option A: Redis queue + worker
✅ Proven, scalable
❌ New infrastructure dependency

Option B: Supabase Edge Functions + pg_cron
✅ Zero new infrastructure
❌ Less control over retry timing

Option C: Vercel Cron + database queue
✅ Built-in monitoring
❌ Cron interval limitations

Which fits your infrastructure preferences?"

[User: Option C - we're already on Vercel]

Phase 3: Design
"Here's the webhook queue architecture (250 words)...
Does this address your requirements?"
[User: Yes, but what about webhook signatures?]

"Good point. Adding webhook signature verification (200 words)...
Does this cover the security requirements?"
[User: Perfect]

Documentation: Created ADR-015-webhook-architecture.md
```

### Token Efficiency

- Understanding: ~20 tokens per question
- Exploration: ~150 tokens for 3 options
- Design: ~50 tokens per validation checkpoint
- **Total overhead: ~300-500 tokens** for complex features

**ROI:** Prevents costly architectural mistakes (saves 2-4 hours rework)

## Error Handling

- **Missing frontmatter**: Error with template example
- **Invalid YAML**: Syntax error with line number
- **No acceptance criteria**: Warning with recommendation
- **Invalid spec file**: Clear error message
- **Missing lane flag**: Defaults to fast-lane (no discovery)

## Integration

- **Commands**: Invoked via `/spec` discovery command
- **Scripts**: TypeScript in `scripts/` directory
- **Docs**: `docs/specs/` for standards and examples

## Token Efficiency

**Old command** (`/spec:specify`):

- YAML frontmatter: ~35 tokens
- Full prompt: ~70 tokens
- **Total: 105 tokens** per invocation

**New Skill**:

- Metadata: 20 tokens
- SKILL.md: 180 tokens (progressive)
- Scripts: 0 tokens (executed, not loaded)
- **Total: 200 tokens** (only when full context needed)
- **Typical: 20 tokens** (metadata only for parsing)

**Savings**: 71% average, 81% for simple actions

## Version

2.0.0 - Added Design Discovery protocol (Issue #209 Phase 2)
