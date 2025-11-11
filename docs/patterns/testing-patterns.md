# Testing Patterns

**Category:** Quality Assurance
**Impact:** Critical - Prevents false positives/negatives in CI, ensures test reliability
**Lessons Synthesized:** 8 micro-lessons

## Overview

This guide consolidates testing patterns that ensure reliable, maintainable tests across unit, integration, and end-to-end testing. Special emphasis on Supabase RLS testing, test isolation, and CI integration.

## Core Principles

1. **Test Isolation:** Each test independent, no shared state
2. **Real Environments:** Test against real auth, real database policies
3. **Fail Explicitly:** Clear exit codes, no silent failures
4. **Fast Feedback:** Optimize for CI speed without sacrificing coverage

---

## Pattern 1: Test Isolation with Proper Cleanup

**Problem:** Tests pass individually but fail in CI due to shared mock state, leftover side effects.

**Impact:** Critical (8/10) - CI false positives/negatives

**Source Lessons:**
- `test-isolation-hooks.md`
- `stateful-class-analysis-reset.md`

### ✅ Correct Pattern

```typescript
// Vitest
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('UserService', () => {
  beforeEach(() => {
    // Clear ALL mocks before each test
    vi.clearAllMocks();

    // Reset modules if testing module-level state
    vi.resetModules();

    // Clear any timers
    vi.clearAllTimers();
  });

  afterEach(() => {
    // Restore original implementations
    vi.restoreAllMocks();

    // Clean up any test data
    // (database cleanup, temp files, etc.)
  });

  it('should create user', () => {
    // Test code
  });

  it('should update user', () => {
    // This test starts with clean mocks
  });
});
```

### Stateful Class Analysis

```typescript
// If your class maintains state, reset between tests
class CodeAnalyzer {
  private cache = new Map();

  analyze(code: string) {
    // Uses cache
  }

  // Provide reset method for tests
  reset() {
    this.cache.clear();
  }
}

describe('CodeAnalyzer', () => {
  let analyzer: CodeAnalyzer;

  beforeEach(() => {
    analyzer = new CodeAnalyzer();
  });

  afterEach(() => {
    analyzer.reset();  // Clear state
  });

  it('should analyze code', () => {
    // Test with fresh state
  });
});
```

### Playwright Test Isolation

```typescript
import { test } from '@playwright/test';

test.describe('Authentication', () => {
  // Each test gets fresh browser context
  test.use({
    storageState: undefined  // No shared auth state
  });

  test.beforeEach(async ({ page }) => {
    // Navigate to clean state
    await page.goto('/');
  });

  test('should login', async ({ page }) => {
    // Test code
  });

  test('should logout', async ({ page }) => {
    // Starts fresh, no state from previous test
  });
});
```

### Key Points

- **Use `beforeEach` for setup,** `afterEach` for cleanup
- **Clear ALL mocks** with `vi.clearAllMocks()`
- **Reset modules** if testing module-level state
- **Provide reset methods** on stateful classes
- **Each test should pass in isolation** and in any order

---

## Pattern 2: Test Runner Exit Codes

**Problem:** Tests fail but script exits 0, causing CI to pass incorrectly.

**Impact:** Critical (9/10) - False positive in CI

**Source Lessons:**
- `test-runner-exit-codes.md`

### ✅ Correct Pattern

```typescript
// test-runner.ts
import { execFileSync } from 'child_process';

async function runTests() {
  try {
    // Run tests
    execFileSync('vitest', ['run'], {
      stdio: 'inherit'
    });

    console.log('✅ All tests passed');
    return 0;
  } catch (error) {
    console.error('❌ Tests failed');

    // CRITICAL: Exit with non-zero code
    process.exit(1);
  }
}

runTests().catch(error => {
  console.error('Test runner error:', error);
  process.exit(1);  // Ensure non-zero exit
});
```

### Bash Test Runner

```bash
#!/bin/bash
set -euo pipefail  # Exit on error

run_tests() {
  local exit_code=0

  # Run unit tests
  pnpm test:unit || exit_code=$?

  # Run integration tests
  pnpm test:integration || exit_code=$((exit_code + $?))

  # Run E2E tests
  pnpm test:e2e || exit_code=$((exit_code + $?))

  return $exit_code
}

run_tests
exit $?  # Propagate exit code to CI
```

### Key Points

- **Call `process.exit(1)` on test failure**
- **Catch and rethrow errors** in async runners
- **Use `set -e` in bash** to fail fast
- **Propagate exit codes** through all layers
- **Verify in CI** that failed tests fail the job

---

## Pattern 3: Supabase RLS Testing with Real JWT

**Problem:** Testing RLS policies with fake user IDs doesn't match production behavior.

**Impact:** Critical (10/10) - Security testing correctness

**Source Lessons:**
- `supabase-rls-testing-jwt-sessions.md`
- `rls-policy-sql-syntax.md`
- `supabase-anon-rls-policies.md`

### ✅ Correct Pattern

```typescript
import { createClient } from '@supabase/supabase-js';

describe('RLS Policies', () => {
  let supabase: ReturnType<typeof createClient>;
  let testUserId: string;

  beforeEach(async () => {
    // Create test user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: `test-${Date.now()}@example.com`,
      password: 'test-password',
      email_confirm: true
    });

    if (authError) throw authError;
    testUserId = authData.user.id;

    // ✅ Generate real JWT session link
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: authData.user.email!
    });

    if (linkError) throw linkError;

    // ✅ Set session with real JWT
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: linkData.properties.access_token,
      refresh_token: linkData.properties.refresh_token
    });

    if (sessionError) throw sessionError;
  });

  afterEach(async () => {
    // Clean up test user
    await supabaseAdmin.auth.admin.deleteUser(testUserId);
  });

  it('should allow user to read own profile', async () => {
    // This uses REAL JWT with auth.uid()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', testUserId);

    expect(error).toBeNull();
    expect(data).toHaveLength(1);
  });

  it('should deny user from reading other profiles', async () => {
    const otherUserId = '00000000-0000-0000-0000-000000000000';

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', otherUserId);

    // RLS should block this
    expect(data).toHaveLength(0);
  });
});
```

### RLS Policy SQL Patterns

```sql
-- ✅ CORRECT: Use explicit role and auth.uid()
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- ✅ CORRECT: Anon users can only read public data
CREATE POLICY "Public profiles readable by anon"
  ON profiles
  FOR SELECT
  TO anon
  USING (is_public = true);

-- ❌ WRONG: No role specification
CREATE POLICY "Users can read profiles"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);  -- Applies to ALL roles!
```

### Testing Anon Access

```typescript
it('should allow anon user to read public profiles', async () => {
  // Create client WITHOUT auth (anon key only)
  const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Test anon access
  const { data, error } = await anonClient
    .from('profiles')
    .select('*')
    .eq('is_public', true);

  expect(error).toBeNull();
  expect(data.length).toBeGreaterThan(0);
});
```

### Key Points

- **Use `auth.admin.generateLink()`** to get real JWT
- **Set session with `setSession()`** before testing
- **Specify role in policies:** `TO authenticated`, `TO anon`
- **Test both authenticated and anon scenarios**
- **Clean up test users in `afterEach`**
- **Use real `auth.uid()`** in policies, not hardcoded IDs

---

## Pattern 4: Mocking Best Practices

**Problem:** Mocks leak between tests, partial mocks break other imports.

**Impact:** High (7/10) - Test reliability

**Source Lessons:**
- `test-isolation-hooks.md`

### ✅ Correct Pattern

```typescript
import { vi } from 'vitest';

// ✅ Mock at module level
vi.mock('fs', () => ({
  readFileSync: vi.fn(),
  writeFileSync: vi.fn()
}));

describe('FileService', () => {
  beforeEach(() => {
    // Clear mock call history
    vi.clearAllMocks();
  });

  it('should read file', async () => {
    const { readFileSync } = await import('fs');

    // Setup mock return value
    (readFileSync as Mock).mockReturnValue('file content');

    // Test code
    const content = service.readFile('test.txt');

    expect(readFileSync).toHaveBeenCalledWith('test.txt', 'utf-8');
    expect(content).toBe('file content');
  });
});
```

### Partial Mocks

```typescript
// ✅ Mock only specific exports
vi.mock('./database', async () => {
  const actual = await vi.importActual<typeof import('./database')>('./database');

  return {
    ...actual,  // Keep real implementations
    query: vi.fn()  // Mock only query
  };
});
```

### Spy on Original Implementation

```typescript
import * as database from './database';

it('should log queries', async () => {
  // Spy without replacing implementation
  const querySpy = vi.spyOn(database, 'query');

  await service.getUser('123');

  expect(querySpy).toHaveBeenCalledWith('SELECT * FROM users WHERE id = $1', ['123']);

  querySpy.mockRestore();  // Restore original
});
```

### Key Points

- **Mock at module level** with `vi.mock()`
- **Clear mocks in `beforeEach`**
- **Use partial mocks** to preserve real implementations
- **Use spies** when you need original behavior
- **Restore mocks** after tests

---

## Pattern 5: CI Test Optimization

**Problem:** Tests take too long in CI, causing slow feedback loops.

**Impact:** Medium (7/10) - Developer experience

**Source Lessons:**
- `20251027-083728-configurable-execsync-timeouts-for-ci.md`
- `ci-dependency-availability.md`

### ✅ Correct Pattern

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    // Optimize for CI
    pool: 'threads',  // Use worker threads
    poolOptions: {
      threads: {
        singleThread: false,
        isolate: true
      }
    },

    // Configurable timeout
    testTimeout: process.env.CI
      ? 30000  // 30s in CI
      : 10000, // 10s local

    // Fail fast in CI
    bail: process.env.CI ? 1 : undefined,

    // Coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'test/**',
        '**/*.test.ts',
        '**/*.spec.ts'
      ]
    }
  }
});
```

### GitHub Actions Matrix

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        test-suite: [unit, integration, e2e]
      fail-fast: false  # Run all suites even if one fails

    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      # Run specific test suite
      - run: pnpm test:${{ matrix.test-suite }}
        env:
          CI: true
          SKILL_EXEC_TIMEOUT_MS: 300000  # 5min for CI
```

### Dependency Availability Check

```typescript
// Check dependencies before running tests
function checkDependencies() {
  const required = ['git', 'node', 'pnpm'];

  for (const cmd of required) {
    try {
      execFileSync('which', [cmd], { stdio: 'pipe' });
    } catch {
      console.error(`Error: Required dependency not found: ${cmd}`);
      process.exit(1);
    }
  }
}

// Run before tests
checkDependencies();
```

### Key Points

- **Use parallel test execution** with threads/workers
- **Configure timeouts for CI** vs local
- **Fail fast in CI** to get quick feedback
- **Use matrix strategy** to parallelize test suites
- **Check dependencies** before running tests
- **Set appropriate timeouts** via environment variables

---

## Pattern 6: Database Testing Patterns

**Problem:** Tests interfere with each other, test data persists, migrations not applied.

**Impact:** High (8/10) - Test reliability

**Source Lessons:**
- `20251031-144200-pgtap-pg-tle-schema-clarification.md`
- `postgrest-health-check-syntax.md`

### ✅ Correct Pattern

```typescript
describe('Database Tests', () => {
  beforeAll(async () => {
    // Apply migrations
    await runMigrations();

    // Verify PostgREST is healthy
    await checkPostgRESTHealth();
  });

  beforeEach(async () => {
    // Start transaction
    await supabase.rpc('begin_transaction');
  });

  afterEach(async () => {
    // Rollback transaction (clean up test data)
    await supabase.rpc('rollback_transaction');
  });

  it('should create user', async () => {
    // Test code - changes will be rolled back
  });
});
```

### PostgREST Health Check

```typescript
async function checkPostgRESTHealth(): Promise<void> {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    headers: {
      apikey: SUPABASE_ANON_KEY
    }
  });

  if (!response.ok) {
    throw new Error('PostgREST not healthy');
  }
}
```

### pgTAP Tests

```sql
-- tests/test_rls_policies.sql
BEGIN;

SELECT plan(3);

-- Test 1: User can read own profile
SELECT is(
  (SELECT count(*) FROM profiles WHERE id = auth.uid()),
  1::bigint,
  'User can read own profile'
);

-- Test 2: User cannot read other profiles
SELECT is(
  (SELECT count(*) FROM profiles WHERE id != auth.uid()),
  0::bigint,
  'User cannot read other profiles'
);

-- Test 3: Anon can only read public profiles
SET ROLE anon;
SELECT is(
  (SELECT count(*) FROM profiles WHERE is_public = false),
  0::bigint,
  'Anon cannot read private profiles'
);

SELECT * FROM finish();
ROLLBACK;
```

### Key Points

- **Apply migrations before tests**
- **Use transactions for test isolation**
- **Verify PostgREST health** before database tests
- **Use pgTAP** for database-specific tests
- **Test with different roles** (authenticated, anon)
- **Rollback after each test** to clean up

---

## Pattern 7: E2E Testing Best Practices

**Problem:** Flaky E2E tests, slow execution, unclear failure reasons.

**Impact:** High (8/10) - Test reliability

**Source Lessons:**
- General E2E testing patterns from analysis

### ✅ Correct Pattern

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  // Retry on CI
  retries: process.env.CI ? 2 : 0,

  // Parallel execution
  workers: process.env.CI ? 2 : 4,

  // Timeouts
  timeout: 30000,
  expect: {
    timeout: 5000
  },

  // Projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' }
    }
  ],

  // Web server
  webServer: {
    command: 'pnpm dev',
    port: 3000,
    reuseExistingServer: !process.env.CI
  }
});
```

### Stable Selectors

```typescript
// ✅ Use data-testid for stable selectors
await page.click('[data-testid="submit-button"]');

// ❌ Avoid brittle selectors
await page.click('.btn.btn-primary.mt-4');  // Breaks on style changes
```

### Wait for Network Idle

```typescript
// ✅ Wait for network before asserting
await page.goto('/dashboard');
await page.waitForLoadState('networkidle');

await expect(page.locator('[data-testid="user-name"]')).toHaveText('John Doe');
```

### Key Points

- **Retry flaky tests in CI**
- **Use stable selectors** (`data-testid`)
- **Wait for network idle** before assertions
- **Run in parallel** to speed up execution
- **Start web server** automatically
- **Screenshot on failure** for debugging

---

## Testing Checklist

Before merging, verify:

- [ ] All tests pass in isolation: `vitest run --reporter=verbose`
- [ ] Tests pass in random order: `vitest run --sequence.shuffle`
- [ ] Mocks are cleared in `beforeEach`
- [ ] Test runner exits non-zero on failure
- [ ] RLS tests use real JWT sessions
- [ ] Database tests use transactions for isolation
- [ ] E2E tests use stable selectors
- [ ] Tests run successfully in CI
- [ ] Coverage meets threshold (>80%)

---

## Quick Reference

| Test Type | Tool | Isolation Strategy | Run Time |
|-----------|------|-------------------|----------|
| Unit | Vitest | Mock dependencies | <1min |
| Integration | Vitest | Real database + transactions | 1-5min |
| E2E | Playwright | Fresh browser context | 5-15min |
| RLS | Vitest + Supabase | Real JWT sessions + cleanup | 2-5min |

---

## References

- **Vitest Documentation:** https://vitest.dev/
- **Playwright Documentation:** https://playwright.dev/
- **Supabase Testing:** https://supabase.com/docs/guides/testing
- **pgTAP:** https://pgtap.org/

---

## Related Patterns

- [Security Patterns](./security-patterns.md) - RLS policies, input validation
- [Database Patterns](./database-patterns.md) - Supabase, migrations
- [CI/CD Patterns](./ci-cd-patterns.md) - GitHub Actions, test automation

---

**Last Updated:** 2025-11-11
**Lessons Referenced:** 8 micro-lessons from testing category
