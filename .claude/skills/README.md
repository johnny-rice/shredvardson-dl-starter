# Claude Skills Catalog

This directory contains Claude Skills - reusable procedural knowledge that uses progressive disclosure for token efficiency.

## What are Skills?

Skills are the successor to slash commands, offering:

- **51-90% token savings** via progressive disclosure
- **Script execution** without loading code into context
- **Self-improvement** via skill-creator meta-Skill
- **Cross-project memory** via personal Skills directory

## Architecture

```
.claude/skills/
├── README.md                       # This file
├── common/                         # Reserved for shared utilities (empty)
├── implementation-assistant/       # Code validation & standards Skill
│   ├── skill.json                  # Metadata (20 tokens)
│   ├── SKILL.md                    # Progressive disclosure doc (200 tokens)
│   ├── README.md                   # Human documentation
│   └── scripts/                    # Executable scripts (never in context)
│       ├── show-standards.ts
│       ├── implementation-guide.ts
│       ├── show-patterns.ts
│       └── validate-code.ts
├── prd-analyzer/                   # Spec parsing & validation Skill
│   ├── skill.json                  # Metadata (20 tokens)
│   ├── SKILL.md                    # Progressive disclosure doc (180 tokens)
│   ├── README.md                   # Human documentation
│   └── scripts/                    # Executable scripts (never in context)
│       ├── parse-spec.ts
│       ├── validate-spec.ts
│       ├── extract-criteria.ts
│       └── generate-tasks.ts
├── supabase-integration/           # Database workflow Skill
│   ├── skill.json                  # Metadata (20 tokens)
│   ├── SKILL.md                    # Progressive disclosure doc (250 tokens)
│   ├── README.md                   # Human documentation
│   └── scripts/                    # Executable scripts (never in context)
│       ├── create-migration.ts
│       ├── apply-migration.ts
│       ├── rollback-migration.ts
│       ├── validate-migration.ts
│       └── generate-types.ts
├── test-scaffolder/                # Test generation Skill
│   ├── skill.json                  # Metadata (20 tokens)
│   ├── SKILL.md                    # Progressive disclosure doc (230 tokens)
│   ├── README.md                   # Human documentation
│   └── scripts/                    # Executable scripts (never in context)
│       ├── scaffold-e2e.ts
│       ├── scaffold-rls.ts
│       └── validate-coverage.ts
└── design-system/                  # Design system enforcement Skill
    ├── skill.json                  # Metadata (20 tokens)
    ├── SKILL.md                    # Progressive disclosure doc (250 tokens)
    ├── README.md                   # Human documentation
    └── scripts/                    # Executable scripts (never in context)
        ├── viewer.ts
        ├── validate-tokens.ts
        ├── validate-spacing.ts
        ├── contrast-check.ts
        ├── visual-diff.ts
        ├── copy-review.ts
        ├── generate-component.ts
        ├── performance-check.ts
        └── figma-import.ts
```

## Available Skills

### supabase-integration (Phase 1 ✓)

**Command**: Invoked via `/db` discovery command
**Purpose**: Database migration workflow with RLS validation
**Token Savings**: 90% (485 lines → 50 lines)
**Capabilities**:

- Create migrations with RLS templates
- Validate SQL syntax and RLS policies
- Generate TypeScript types
- Execute deterministic scripts without context pollution

**Usage**:

```bash
/db create migration_name
/db validate
/db apply
/db rollback
/db types
```

### test-scaffolder (Phase 2 ✓)

**Command**: Invoked via `/test` discovery command
**Purpose**: TDD workflow automation with Test Generator sub-agent
**Token Savings**: 66% (121 lines → 40 lines)
**Capabilities**:

- Scaffold unit tests (delegates to Test Generator sub-agent)
- Scaffold E2E tests with Playwright
- Scaffold RLS security tests
- Validate coverage against contract

**Usage**:

```bash
/test unit component_path
/test e2e user_flow
/test rls table_name
/test coverage
```

### prd-analyzer (Phase 2 ✓)

**Command**: Invoked via `/spec` discovery command
**Purpose**: Spec parsing and acceptance criteria extraction
**Token Savings**: 71% (105 lines → 30 lines)
**Capabilities**:

- Parse YAML frontmatter
- Validate spec structure
- Extract acceptance criteria
- Generate task breakdown

**Usage**:

```bash
/spec parse spec_file
/spec validate spec_file
/spec extract spec_file
/spec breakdown spec_file
```

### implementation-assistant (Phase 2 ✓)

**Command**: Invoked via `/code` discovery command
**Purpose**: Coding standards and implementation patterns
**Token Savings**: 60% (88 lines → 35 lines)
**Capabilities**:

- Show coding standards
- Provide implementation patterns
- Validate code against standards
- Generate implementation guides

**Usage**:

```bash
/code standards [category]
/code patterns category
/code validate file_path
/code implement feature_type
```

### verification (Phase 0 ✓)

**Command**: Automatic (no manual trigger)
**Purpose**: "Evidence Before Claims" protocol preventing false completions
**Token Savings**: 57% average (75% for prevented rework cycles)
**Source**: Adapted from [obra/superpowers:verification-before-completion](https://github.com/obra/superpowers)

**Capabilities**:

- Enforces fresh verification before completion claims
- Integrates automatically with git, test, db, review Skills
- Prevents "tests pass" claims without running tests
- Eliminates ~40% of rework cycles

**Integration**:

- `/git:prepare-pr` - Verifies tests/build before PR
- `/test` - Verifies test output before claiming pass
- `/db` - Verifies migration before claiming applied
- `/review` - Verifies lint/type before claiming clean

**Usage**: Automatic (no command needed)

**Example**:
```bash
# Before (without verification):
Claude: "All tests pass, ready to commit!"
[Human runs tests → 3 failures]

# After (with verification):
Claude: [Runs pnpm test]
Claude: "Tests show 3 failures: ..."
```

### design-system (Phase 0 ✓)

**Command**: Invoked via `/design` discovery command
**Purpose**: Proactive UI generation and automated design system enforcement
**Token Savings**: 80% (estimated, to be measured)
**Capabilities**:

- Open component viewer at /design route
- Validate token compliance (AST parsing)
- Validate spacing consistency (CDP)
- Check WCAG contrast ratios (CDP)
- Visual regression testing (Playwright)
- UX copy review (LLM Judge)
- Generate components (Handlebars templates)
- Performance profiling (CDP)
- Figma token import (Phase 5)

**Sub-Agent Integration**:

- Design Review Agent
- A11y Review Agent
- Visual Regression Agent
- Copy Review Agent
- Usability Review Agent
- Manager Agent (orchestrator)

**Usage**:

```bash
/design viewer                   # Open component browser
/design validate                 # Run all checks
/design validate-tokens          # Token compliance
/design contrast-check           # WCAG contrast
/design visual-diff              # Screenshot comparison
/design generate <name> [var]    # Scaffold component
```

**Phase 0 Status**: Infrastructure complete, scripts stubbed (except viewer)

## Progressive Disclosure (3-Tier Loading)

```
Level 1 (always): skill.json metadata (~20 tokens)
Level 2 (triggered): SKILL.md context (~250 tokens)
Level 3 (on-demand): Scripts executed, only output returned
```

**Result**: Scripts never enter context, only their output.

## Discovery Commands

Instead of 27 slash commands, we have 6 lightweight discovery commands:

- `/db` → supabase-integration Skill (Phase 1 ✓)
- `/test` → test-scaffolder Skill (Phase 2 ✓)
- `/spec` → prd-analyzer Skill (Phase 2 ✓)
- `/code` → implementation-assistant Skill (Phase 2 ✓)
- `/design` → design-system Skill (Phase 0 ✓)
- `/git` → git-workflow Skill (Phase 3, pending)

## Creating a New Skill

1. Create directory: `.claude/skills/my-skill/`
2. Add `skill.json` with metadata
3. Write `SKILL.md` with progressive disclosure
4. Add scripts to `scripts/` (TypeScript preferred)
5. Document in `README.md`
6. Update this catalog
7. Create discovery command (optional)

See [Skill Development Guide](../../docs/skills-development-guide.md) for details.

## Token Savings Validation

After implementing a Skill, measure token savings:

```bash
pnpm skill:measure <skill-name>
```

This validates the progressive disclosure hypothesis and ensures we're achieving the expected 30-90% savings.

## Version History

- **Phase 1** (v1.0.0): Foundation + supabase-integration Skill ✓
- **Phase 2** (v2.0.0): TDD workflow Skills (test-scaffolder, prd-analyzer, implementation-assistant) ✓
- **Phase 0-DS** (v2.1.0): Design System Skill infrastructure ✓
- **Phase 3** (v3.0.0 planned): Git consolidation
- **Phase 4** (v4.0.0 planned): Meta-capabilities (skill-creator, learning-capturer)

## References

- [ADR-002: Skills Architecture](../../docs/adr/002-skills-architecture.md)
- [Skills Implementation Checklist](../../docs/adr/002-skills-implementation-checklist.md)
- [Anthropic Skills Documentation](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview)
