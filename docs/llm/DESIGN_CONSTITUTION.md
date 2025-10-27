# Design Constitution

**RULES_VERSION:** 0.1.0

## Precedence Hierarchy

1. **Product Requirements Document (PRD)** - Business goals and user acceptance criteria
2. **Architecture Guardrails + Data Formatting** - Technical constraints and patterns
3. **Style Guide & Design Principles** - Visual consistency and UX patterns
4. **UX Writing** - Voice, tone, and content guidelines

## Binding Sources

The following canonical files define the rules for this codebase. Never duplicate these rules - always reference the source:

### Core Architecture

- `docs/llm/context-map.json` - Monorepo routing, allowed/avoided patterns per area
- `docs/llm/STARTER_MANIFEST.json` - Template defaults and customization scope
- `docs/ai/CLAUDE.md` - Index, git rules, environment rules, task management flow

### Process & Workflows

- `docs/llm/NEW_APP_KICKOFF.md` - New app bootstrap process (both modes)
- `docs/llm/CONTRIBUTING_LLMS.md` - LLM contribution guidelines
- `docs/llm/QUALITY_PIPELINE.md` - Lint/format/test automation via hooks

### Technical Standards

- `packages/config/` - ESLint, Prettier, TypeScript shared configs
- `apps/web/src/styles/tokens.css` - Design token system (no hex literals)
- `apps/web/app.config.ts` - Feature toggle patterns

## Constitution Integrity

This constitution is protected by a checksum system that hashes all binding source files. The checksum must be updated whenever any binding source changes.

**Checksum File:** `docs/llm/CONSTITUTION.CHECKSUM`
**Update Command:** `pnpm tsx scripts/update-constitution-checksum.ts`

## Debugging Circuit Breaker Rule

**Source:** Adapted from [obra/superpowers:systematic-debugging](https://github.com/obra/superpowers)

### The 3-Fix Rule

If 3+ fix attempts fail without success:

1. **STOP** - Do not attempt Fix #4
2. **Question Architecture** - "Is this pattern fundamentally sound?"
3. **Discuss with Human** - Get approval before continuing
4. **Consider Refactoring** - Architecture problem vs bug

### Pattern Indicating Architectural Problem

- Each fix reveals new coupling in different files
- Fixes require touching 5+ unrelated components
- Each fix creates new symptoms elsewhere
- Issue seems systemic, not local

### When to Apply

| Situation | Action |
|-----------|--------|
| Fix #1 fails | Continue with new hypothesis |
| Fix #2 fails | Continue with new hypothesis |
| Fix #3 fails | **STOP** - Question architecture |
| Ready for Fix #4 | **BLOCKED** - Discuss with human first |

This prevents infinite symptom-chasing and identifies when refactoring is needed vs repeated fixes.

## Enforcement

- **CI Pipeline:** Fails if checksum is stale when binding sources change
- **Starter Doctor:** Validates constitution integrity before allowing development
- **Code Reviews:** Must reference this constitution for architecture decisions
- **Debugging Workflows:** Enforces 3-fix circuit breaker rule
