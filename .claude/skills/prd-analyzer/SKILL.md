# PRD Analyzer Skill

Extracts acceptance criteria and validates specs against YAML frontmatter standards.

## Core Workflow

```text
parse → validate → extract → breakdown
```

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

## Error Handling

- **Missing frontmatter**: Error with template example
- **Invalid YAML**: Syntax error with line number
- **No acceptance criteria**: Warning with recommendation
- **Invalid spec file**: Clear error message

## Integration Points

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

1.0.0 - Phase 2 core workflow
