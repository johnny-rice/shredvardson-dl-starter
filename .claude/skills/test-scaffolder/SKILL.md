# Test Scaffolder Skill

TDD workflow automation with Test Generator sub-agent integration.

## Core Workflow

```text
analyze → scaffold → validate → coverage
```

## Actions

### unit <component_path>
Scaffolds unit tests for a component or function using Test Generator sub-agent.

**Delegation**: Test Generator sub-agent with project context
**Output**: Test file path, coverage baseline

### e2e <user_flow>
Scaffolds E2E tests for critical user flows.

**Script**: `scripts/scaffold-e2e.ts`
**Includes**:
- Playwright setup
- Auth fixtures
- Page object patterns

**Output**: Test file path, test commands

### rls <table_name>
Scaffolds RLS security tests for database tables.

**Script**: `scripts/scaffold-rls.ts`
**Includes**:
- User isolation tests
- Admin bypass tests
- Anonymous access tests

**Output**: Test file path, security checklist

### coverage
Validates current coverage against coverage contract.

**Script**: `scripts/validate-coverage.ts`
**Checks**:
- Coverage thresholds (70% lines/functions, 65% branches)
- Critical paths coverage (80/20 rule)
- Exclusions properly configured

**Output**: Coverage report, gaps, recommendations

## Progressive Disclosure

**Level 1** (Metadata): skill.json (~20 tokens)
**Level 2** (This file): SKILL.md (~200 tokens)
**Level 3** (On-demand): Test Generator sub-agent invoked, scripts executed (~0 tokens)

## Test Patterns

**Unit Tests**:
- Component rendering
- User interactions
- Props validation
- Error boundaries
- Custom hooks

**E2E Tests**:
- Authentication flows
- CRUD operations
- Form submissions
- Navigation
- Error handling

**RLS Tests**:
- User data isolation
- Role-based access
- Anonymous denial
- Cross-tenant security

## Template-Based Scaffolding

Test scaffolding uses template-based generation with:
- Project-specific patterns (coverage-contract.md)
- Test utilities (render helpers, mocks)
- Coverage requirements
- Existing test examples

This ensures tests follow DL Starter conventions automatically.

## Coverage Contract

**Thresholds**:
- Lines: 70%
- Functions: 70%
- Branches: 65%
- Statements: 70%

**Focus Areas** (80% effort):
- Auth flows (90%+ coverage)
- RLS policies (85%+ coverage)
- Core workflows (70%+ coverage)

**Documentation**: See `docs/testing/coverage-contract.md`

## Error Handling

- **Missing test file**: Auto-create with template-based scaffolding
- **Coverage below threshold**: Warning with gap analysis
- **Playwright not installed**: Auto-install prompt

## Integration Points

- **Commands**: Invoked via `/test` discovery command
- **Sub-agent**: Test Generator (with project context)
- **Scripts**: TypeScript in `scripts/` directory
- **Docs**: `docs/testing/` for patterns and guides

## Token Efficiency

**Old command** (`/test:scaffold`):
- YAML frontmatter: ~40 tokens
- Full prompt: ~81 tokens
- **Total: 121 tokens** per invocation

**New Skill**:
- Metadata: 20 tokens
- SKILL.md: 200 tokens (progressive)
- Sub-agent: 0 tokens (executed separately)
- **Total: 220 tokens** (only when full context needed)
- **Typical: 20 tokens** (metadata only for delegation)

**Savings**: 66% average, 83% for simple delegations

## Version

1.0.0 - Phase 2 core workflow