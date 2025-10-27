# Test Scaffolder Skill

TDD workflow automation with Test Generator sub-agent integration.

## Purpose

Automates test scaffolding for:

- Unit tests (via Test Generator sub-agent)
- E2E tests (Playwright)
- RLS security tests
- Coverage validation

## Usage

Via `/test` discovery command:

```bash
# Scaffold unit tests for a component
/test unit src/components/Header.tsx

# Scaffold E2E test for user flow
/test e2e auth-signup

# Scaffold RLS tests for a table
/test rls user_profiles

# Validate coverage against contract
/test coverage
```

## Actions

### unit

Delegates to Test Generator sub-agent with project-specific context:

- Coverage contract requirements
- Test utilities (render helpers, mocks)
- Existing test patterns
- DL Starter conventions

**Benefits**:

- Automatic test generation following project standards
- Integrated with coverage requirements
- Uses project-specific test utilities

### e2e

Scaffolds Playwright E2E tests with:

- Auth fixtures
- Page object patterns
- Loading state handling
- Error scenarios

**Output**: Playwright test file with TODOs

### rls

Scaffolds RLS security tests with:

- User isolation tests
- Anonymous access denial
- Admin bypass verification
- Cross-tenant protection

**Output**: Vitest test file with security checklist

### coverage

Validates coverage against contract:

- Checks all thresholds (70% lines/functions, 65% branches)
- Identifies gaps
- Provides recommendations

**Output**: Coverage report with actionable next steps

## Integration with Test Generator

The `unit` action integrates with Claude's Test Generator sub-agent:

1. **Context Loading**: Passes project-specific context
   - `docs/testing/coverage-contract.md`
   - `apps/web/tests/helpers/`
   - Example test files

2. **Standards Enforcement**: Ensures tests follow
   - DL Starter patterns
   - Coverage requirements
   - Test utilities usage

3. **Token Efficiency**: Sub-agent runs independently
   - No context pollution
   - Progressive disclosure
   - Only structured output returned

## Coverage Contract

This Skill enforces the coverage contract defined in `docs/testing/coverage-contract.md`:

**Thresholds**:

- Lines: 70%
- Functions: 70%
- Branches: 65%
- Statements: 70%

**Focus Areas** (80/20 rule):

- Auth flows (90%+ coverage)
- RLS policies (85%+ coverage)
- Core workflows (70%+ coverage)

## Token Savings

**Old `/test:scaffold` command**:

- Full prompt: ~121 tokens per invocation

**New test-scaffolder Skill**:

- Metadata only: ~20 tokens (typical)
- With full context: ~220 tokens (rare)
- **Savings: 66% average, 83% for delegations**

## Version

1.0.0 - Phase 2 core workflow

## Related

- Skill: `.claude/skills/test-scaffolder/`
- ADR: [002-skills-architecture.md](../../../docs/adr/002-skills-architecture.md)
- Contract: [coverage-contract.md](../../../docs/testing/coverage-contract.md)
