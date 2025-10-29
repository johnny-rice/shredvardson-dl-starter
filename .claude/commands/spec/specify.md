---
# Machine-readable metadata (parsed into docs/commands/index.json)
name: '/specify'
version: '1.0.0'
lane: 'both'
skill: 'prd-analyzer'
tags: ['spec', 'planning', 'prd']
when_to_use: >
  Create a new spec file with lane detection to begin the spec-driven development workflow.

arguments:
  - name: feature_description
    type: string
    required: true
    example: 'Add payment processing with Stripe'

inputs:
  - type: 'feature-description'
    description: 'High-level description of the feature to implement'
outputs:
  - type: 'spec-file'
    description: 'Created spec file with YAML frontmatter and lane assignment'

riskLevel: 'LOW'
requiresHITL: true
riskPolicyRef: 'docs/llm/risk-policy.json#/specCreation'

allowed-tools:
  - 'Read(*)'
  - 'Write(*)'
  - 'Glob(*)'
  - 'Bash(pnpm *)'

preconditions:
  - 'Feature description provided'
  - 'No existing spec for this feature'
postconditions:
  - 'Spec file created in specs/ directory'
  - 'Lane assigned (spec-driven or simple)'
  - 'YAML frontmatter validated'

artifacts:
  produces:
    - { path: 'specs/[feature-slug].md', purpose: 'Feature specification' }
  updates: []

permissions:
  tools:
    - name: 'filesystem'
      ops: ['read', 'write']
    - name: 'bash'
      ops: ['execute']

timeouts:
  softSeconds: 120
  hardSeconds: 240

idempotent: false
dryRun: true
estimatedRuntimeSec: 90
costHints: 'Low I/O; interactive prompts'

references:
  - '.claude/skills/prd-analyzer/SKILL.md'
  - 'docs/specs/YAML_FRONTMATTER.md'
---

# /specify

**Goal:**
Create a new spec file with proper YAML frontmatter and automatic lane detection (spec-driven vs. simple).

**Prompt:**

You are creating a new feature specification. Follow these steps:

1. **Gather Feature Information** - Ask the user for:
   - Feature name (short, descriptive)
   - Feature type (feature, bugfix, refactor, docs)
   - Priority (p0, p1, p2, p3)
   - Brief description (1-2 sentences)
   - Related GitHub issue number (optional)

2. **Lane Detection** - Ask ONE question:

   ```text
   Is this feature complex or risky enough for spec-driven lane?

   Consider spec-driven if the feature involves:
   - Authentication or authorization systems
   - Payment processing or financial transactions
   - Database architecture or schema changes
   - Multi-day or multi-phase implementation
   - Cross-cutting architectural concerns
   - Security-sensitive operations

   Answer: (yes/no)
   ```

3. **Create Spec File**:
   - Generate slug from feature name (lowercase, hyphens)
   - Create file at `specs/[slug].md`
   - Use this template:

   ```yaml
   ---
   title: [Feature Name]
   type: [feature|bugfix|refactor|docs]
   priority: [p0|p1|p2|p3]
   status: draft
   lane: [spec-driven|simple]
   issue: [GitHub issue number if provided]
   created: [YYYY-MM-DD]
   ---

   # [Feature Name]

   ## Summary

   [Brief description from step 1]

   ## Problem Statement

   [Placeholder - user should fill in: What problem does this solve? Why is it needed?]

   ## Proposed Solution

   [Placeholder - user should fill in: High-level approach to solving the problem]

   ## Acceptance Criteria

   - [ ] [Placeholder - user should add testable, specific criteria]
   - [ ] [Placeholder - each criterion should be measurable]
   - [ ] [Placeholder - criteria should be user-focused]

   ## Technical Constraints

   [Placeholder - user should document any technical limitations, dependencies, or requirements]

   ## Success Metrics

   [Placeholder - user should define how success will be measured]

   ## Out of Scope

   [Placeholder - user should explicitly state what is NOT included in this feature]

   ## References

   [Placeholder - links to related docs, issues, ADRs, etc.]
   ```

4. **Validate Spec**:
   - Check for required fields (title, type, priority, status, lane)
   - Ensure proper YAML syntax
   - Verify all sections are present
   - Note: Validation can be done manually or via future `prd-analyzer` skill scripts

5. **Output**:

   ```text
   ✅ Created spec file: specs/[slug].md
   📋 Lane: [spec-driven|simple]
   🔗 Issue: #[number] (if provided)

   Next steps:
   - Fill in the placeholder sections
   - Add detailed acceptance criteria
   - Run `/plan specs/[slug].md` when ready
   ```

**Usage Examples:**

```bash
/specify Add Stripe payment integration
/specify Fix auth token expiration bug
/specify Refactor database connection pooling
```

**What Happens Next:**

- **If lane: spec-driven** → Use `/plan` to trigger design discovery (3-phase Socratic questioning)
- **If lane: simple** → Use `/plan` for basic planning, then `/tasks` for task breakdown

**Failure & Recovery:**

- If slug already exists → suggest alternative name or ask if updating existing spec
- If validation fails → show error with specific issue and correction suggestion
- If user unsure about lane → default to 'simple' with note that they can change it later
