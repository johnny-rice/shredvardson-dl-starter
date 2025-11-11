---
name: test
description: TDD workflow via test-scaffolder Skill
version: 2.0.0
skill: test-scaffolder
---

**Slash Command:** `/test`

**Goal:**
Invoke the test-scaffolder Skill for TDD workflow automation.

**Usage:**

```bash
/test unit <component_path>    # Scaffold unit tests (via Test Generator sub-agent)
/test e2e <user_flow>          # Scaffold E2E tests
/test rls <table_name>         # Scaffold RLS security tests
/test coverage                 # Validate coverage against contract
```

**Prompt:**

This is a lightweight discovery command that delegates to the `test-scaffolder` Skill.

**Actions:**

1. **unit**: Delegate to Test Generator sub-agent:

   ```json
   Task(
     subagent_type="Test Generator",
     description="Generating tests for [component_path]",
     prompt='''
     {
       "target": {
         "type": "[inferred from path: component|function|api]",
         "path": "[component_path]"
       },
       "test_types": ["unit"],
       "coverage_goal": 80,
       "focus_areas": ["[inferred from component type: e.g., happy_path, edge_cases, error_handling]"]
     }
     '''
   )
   ```

   **Note:** The `coverage_goal` of 80% aligns with the project's coverage contract. `focus_areas` should be inferred from the component type (utility functions → error_handling, UI components → happy_path + edge_cases, etc.).

2. **e2e**: Invokes Skill script `scaffold-e2e.ts` with user flow name
3. **rls**: Invokes Skill script `scaffold-rls.ts` with table name
4. **coverage**: Invokes Skill script `validate-coverage.ts`

**Skill Location:** `.claude/skills/test-scaffolder/`

**Token Efficiency:**

- **Old `/test:scaffold`**: 121 tokens per invocation
- **New `/test` Skill**: 20-220 tokens (progressive disclosure)
- **Savings**: 66% average, 83% for sub-agent delegations

**Examples:**

```bash
# Scaffold unit tests for a component
/test unit src/components/Header.tsx

# Scaffold E2E test for auth flow
/test e2e auth-signup

# Scaffold RLS tests for user_profiles table
/test rls user_profiles

# Check coverage status
/test coverage
```

**Implementation:**

The Skill system handles:

1. Loading metadata (skill.json)
2. Progressive disclosure (SKILL.md only if needed)
3. Sub-agent delegation (Test Generator with project context)
4. Script execution (never in context)
5. Structured output parsing

This command routes the request to the appropriate Skill action.

**Related:**

- Skill: `.claude/skills/test-scaffolder/`
- ADR: [002-skills-architecture.md](../../docs/adr/002-skills-architecture.md)
- Contract: [coverage-contract.md](../../docs/testing/coverage-contract.md)

**Comprehensive Documentation:**

- [Complete Testing Guide](../../docs/guides/TESTING.md) - Unit, E2E, database, and Skills testing
- [Testing Guide (Detailed)](../../docs/testing/TESTING_GUIDE.md) - Additional testing patterns
