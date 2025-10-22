---
name: spec
description: Spec analysis via prd-analyzer Skill
version: 2.0.0
skill: prd-analyzer
---

**Slash Command:** `/spec`

**Goal:**
Invoke the prd-analyzer Skill for spec parsing and analysis.

**Usage:**

```bash
/spec parse <spec_file>        # Parse YAML frontmatter
/spec validate <spec_file>     # Validate spec structure
/spec extract <spec_file>      # Extract acceptance criteria
/spec breakdown <spec_file>    # Generate task breakdown
```

**Prompt:**

This is a lightweight discovery command that delegates to the `prd-analyzer` Skill.

**Actions:**

1. **parse**: Invokes Skill script `parse-spec.ts` with spec file path
2. **validate**: Invokes Skill script `validate-spec.ts` with spec file path
3. **extract**: Invokes Skill script `extract-criteria.ts` with spec file path
4. **breakdown**: Invokes Skill script `generate-tasks.ts` with spec file path

**Skill Location:** `.claude/skills/prd-analyzer/`

**Token Efficiency:**

- **Old `/spec:specify`**: 105 tokens per invocation
- **New `/spec` Skill**: 20-200 tokens (progressive disclosure)
- **Savings**: 71% average, 81% for simple parsing

**Examples:**

```bash
# Parse spec frontmatter
/spec parse docs/specs/user-auth.md

# Validate spec against standards
/spec validate docs/specs/user-auth.md

# Extract acceptance criteria
/spec extract docs/specs/user-auth.md

# Generate implementation tasks
/spec breakdown docs/specs/user-auth.md
```

**YAML Frontmatter Requirements:**

```yaml
---
title: Feature or issue title
type: feature | bugfix | refactor | docs
priority: p0 | p1 | p2 | p3
status: draft | ready | in-progress | done
---
```

**Implementation:**

The Skill system handles:
1. Loading metadata (skill.json)
2. Progressive disclosure (SKILL.md only if needed)
3. Script execution (never in context)
4. Structured output parsing

This command routes the request to the appropriate Skill script.

**Related:**

- Skill: `.claude/skills/prd-analyzer/`
- ADR: [002-skills-architecture.md](../../docs/adr/002-skills-architecture.md)