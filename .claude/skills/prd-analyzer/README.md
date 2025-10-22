# PRD Analyzer Skill

Extracts acceptance criteria and validates specs against YAML frontmatter standards.

## Purpose

Automates spec analysis for:

- YAML frontmatter parsing
- Spec validation
- Acceptance criteria extraction
- Task breakdown generation

## Usage

Via `/spec` discovery command:

```bash
# Parse spec frontmatter
/spec parse docs/specs/user-auth.md

# Validate spec structure
/spec validate docs/specs/user-auth.md

# Extract acceptance criteria
/spec extract docs/specs/user-auth.md

# Generate task breakdown
/spec breakdown docs/specs/user-auth.md
```

## Actions

### parse

Parses YAML frontmatter and extracts metadata:

- Frontmatter fields
- Presence of key sections
- Word count

**Output**: Parsed data with validation status

### validate

Validates spec against standards:

- Required fields (title, type, priority, status)
- Valid field values
- Proper structure
- Acceptance criteria presence

**Output**: Validation report with errors and warnings

### extract

Extracts structured acceptance criteria:

- Checkbox items from Acceptance Criteria section
- Success metrics
- Technical constraints

**Output**: Structured data ready for implementation

### breakdown

Generates implementation task breakdown:

- Ordered tasks based on type
- Dependencies between tasks
- Time estimates
- Risk assessment

**Output**: Task list with dependencies and estimates

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

- `issue`: GitHub issue number
- `assignee`: GitHub username
- `labels`: Array of labels
- `estimate`: Time estimate
- `dependencies`: Task dependencies

## Acceptance Criteria Format

Use checkboxes for testable criteria:

```markdown
## Acceptance Criteria

- [ ] User can sign up with email and password
- [ ] Email verification sent within 5 seconds
- [ ] Invalid email shows clear error message
```

## Token Savings

**Old `/spec:specify` command**:

- Full prompt: ~105 tokens per invocation

**New prd-analyzer Skill**:

- Metadata only: ~30 tokens (typical - matches skill.json measurement)
- With full context: ~200 tokens (rare - when scripts execute)
- **Savings: 71% average** (based on typical metadata-only usage)

## Version

1.0.0 - Phase 2 core workflow

## Related

- Skill: `.claude/skills/prd-analyzer/`
- ADR: [002-skills-architecture.md](../../../docs/adr/002-skills-architecture.md)
