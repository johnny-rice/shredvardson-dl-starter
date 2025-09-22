# Tests Context

## Unit vs E2E Rules

- **Unit tests**: `__tests__/` directory, test individual components/functions
- **E2E tests**: `tests/e2e/` directory, test complete user workflows

## Test Naming

- Unit: `ComponentName.test.ts` or `utils.test.ts`
- E2E: `user-journey.spec.ts` or `feature-flow.spec.ts`

## Test Commands

```bash
# Unit tests with Vitest
pnpm test
pnpm test --watch
pnpm test ComponentName

# E2E tests with Playwright
pnpm test:e2e
pnpm test:e2e --headed
```

## File Locations

- Unit tests mirror `src/` structure in `__tests__/`
- E2E tests organize by user journeys in `tests/e2e/`
- Shared test utilities in `tests/utils/`

## @display Convention

Tag UI data-display suites with `@display` comment. No state-mutating hooks in these suites (doctor blocks if violated).

```typescript
// @display
test.describe('Analytics Dashboard', () => {
  // ❌ Don't do this in @display suites
  // beforeEach(() => localStorage.clear())
  
  test('shows charts correctly', () => {
    // UI assertion tests only
  })
})
```

→ **Why**: UI display tests should focus on rendering, not state mutation
→ **Reference**: [test-isolation-hooks](../docs/micro-lessons/test-isolation-hooks.md)

## What Constitutes Done

- All new code has unit tests (80% coverage minimum)
- Critical user paths have E2E coverage
- Tests pass in CI/CD pipeline
- No flaky or skipped tests
