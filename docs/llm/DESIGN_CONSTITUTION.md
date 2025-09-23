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

## Enforcement

- **CI Pipeline:** Fails if checksum is stale when binding sources change
- **Starter Doctor:** Validates constitution integrity before allowing development
- **Code Reviews:** Must reference this constitution for architecture decisions
