# Implementation Assistant Skill

Coding standards, error handling patterns, and DL Starter conventions.

## Purpose

Provides guidance for:

- Coding standards enforcement
- Implementation patterns
- Code validation
- Step-by-step implementation guides

## Usage

Via `/code` discovery command:

```bash
# Show coding standards
/code standards [category]

# Show implementation patterns
/code patterns <category>

# Validate code against standards
/code validate <file_path>

# Get implementation guide
/code implement <feature_type>
```

## Actions

### standards

Shows DL Starter coding standards:

- TypeScript patterns
- React component structure
- Naming conventions
- Import organization
- Error handling

**Usage**: `/code standards [typescript|react|naming|imports|error|all]`

### patterns

Shows implementation patterns:

- `component`: React component template
- `api`: Next.js API route template
- `database`: Supabase query patterns
- `error`: Error handling patterns

**Usage**: `/code patterns <category>`

### validate

Validates code against standards:

- No `any` types
- Proper error handling
- Naming conventions
- Import organization
- Component structure

**Output**: Validation report with violations and suggestions

### implement

Provides step-by-step implementation guide:

- `feature`: TDD workflow for features
- `bugfix`: Systematic bug fixing
- `refactor`: Safe refactoring approach

**Output**: Checklist with phases and quality gates

## Coding Standards Summary

**TypeScript**:

- No `any` types
- Explicit return types
- Strict null checks
- Type imports

**React**:

- Function components
- PascalCase naming
- Props interface
- Named exports

**Error Handling**:

- Always explicit
- Structured returns
- User-friendly messages
- Proper logging

## Token Savings

**Old `/dev:implement` command**:

- Full prompt: ~88 tokens per invocation

**New implementation-assistant Skill**:

- Metadata only: ~20 tokens (typical)
- With full context: ~200 tokens (rare)
- **Savings: 60% average, 77% for lookups**

## Version

1.0.0 - Phase 2 core workflow

## Related

- Skill: `.claude/skills/implementation-assistant/`
- ADR: [002-skills-architecture.md](../../../docs/adr/002-skills-architecture.md)
