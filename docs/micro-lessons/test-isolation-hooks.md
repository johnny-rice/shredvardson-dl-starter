---
UsedBy: 0
Severity: high  # common failure pattern
---

# Test Isolation with Suite Hooks

**Context.** Tests failed intermittently in CI when previous suites left global mock state. The pattern only appeared with certain execution orders.

**Rule.** **Always use beforeEach/afterEach hooks to reset/restore mocks and global state; never rely on test order.**

**Example.**
```typescript
// ❌ Failing: global mock persists between tests
vi.mock('../lib/analytics', () => ({ track: vi.fn() }))

// ✅ Passing: clean mock state per test
beforeEach(() => {
  vi.clearAllMocks()
  // Prefer not to reset the module graph unless necessary; it is expensive.
  // vi.resetModules()
})
afterEach(() => {
  vi.restoreAllMocks()
  // If you used fake timers:
  // vi.useRealTimers()
})
```

**Guardrails.**
- Add `vi.clearAllMocks()` in beforeEach hooks for any test file using mocks
- Reset global state (localStorage, sessionStorage, etc.) in afterEach
- Use isolated test environments for database/API tests
- Never commit `test.only`/`test.skip`; fix or delete flaky tests

**Tags.** testing,mocks,isolation,vitest,ci,hooks