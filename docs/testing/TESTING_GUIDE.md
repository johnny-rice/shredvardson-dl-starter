# Testing Guide

Comprehensive guide for writing and running tests in the DL Starter monorepo.

## Table of Contents

- [Overview](#overview)
- [Test Stack](#test-stack)
- [Running Tests](#running-tests)
- [Test Data Seeding](#test-data-seeding)
- [Writing Tests](#writing-tests)
  - [Unit Tests](#unit-tests)
  - [RLS Tests (Application-Level)](#rls-tests)
  - [pgTAP RLS Tests (Database-Level)](#pgtap-rls-tests-database-level)
  - [RLS Optimization Tests](#rls-optimization-tests)
  - [E2E Tests](#e2e-tests)
- [Coverage](#coverage)
- [Best Practices](#best-practices)

## Overview

The DL Starter uses a comprehensive testing strategy with five types of tests:

1. **Unit Tests** - Test individual components and functions in isolation
2. **RLS Tests (Application-Level)** - Test Row Level Security from the application perspective using Vitest
3. **pgTAP RLS Tests (Database-Level)** - Test RLS policies directly in Postgres using pgTAP
4. **E2E Tests** - Test complete user flows in a real browser
5. **CI Script Tests** - Integration tests for CI validation scripts

### Testing Philosophy

- **TDD Order**: Write RLS tests → E2E tests → Unit tests
- **80/20 Rule**: Focus 80% of effort on critical paths (auth, data access, core workflows)
- **Coverage Target**: 70% minimum (see [coverage-contract.md](./coverage-contract.md))
- **Fast Feedback**: <30s for pre-push, <3min for CI

## Test Stack

| Tool                  | Purpose                    | Version |
| --------------------- | -------------------------- | ------- |
| Vitest                | Unit & integration testing | 3.2.4   |
| Playwright            | E2E browser testing        | 1.55.1  |
| React Testing Library | Component testing          | 16.3.0  |
| @vitest/coverage-v8   | Coverage reporting         | 3.2.4   |
| @axe-core/playwright  | Accessibility testing      | 4.10.2  |

## Running Tests

### Unit Tests

```bash
# Run all unit tests
pnpm test:unit

# Run unit tests in watch mode
pnpm --filter=web test:watch

# Run with coverage
pnpm test:coverage
```

### E2E Tests

```bash
# Run E2E tests (starts dev server automatically)
pnpm test:e2e

# Run in CI mode
pnpm test:e2e:ci
```

### CI Script Tests

```bash
# Run CI script integration tests
pnpm test:ci-scripts

# Run specific test
bash tests/ci/validate-specs.test.sh
```

**Purpose**: Validate that CI validation scripts (spec validation, lane detection, etc.) work correctly before pushing.

**Location**: `tests/ci/*.test.sh`

**Coverage**: Integration tests for all scripts in `scripts/ci/`

**Workflow Integration**:

- Runs automatically in pre-push hook (~2s execution time)
- Included in `/git:prepare-pr` slash command verification
- Blocks pushes and PRs if scripts are broken
- Ensures token optimization governance scripts work correctly

### Test Performance Analysis

```bash
# Analyze test execution time (requires running tests first)
pnpm test:analyze-performance

# Use a custom results path (first positional argument)
pnpm test:analyze-performance apps/web/test-results/results.json

# Show top 20 slowest tests (supports both formats)
pnpm test:analyze-performance --top=20
pnpm test:analyze-performance --top 20

# Set custom slow test threshold (default: 1000ms)
pnpm test:analyze-performance --threshold=500
pnpm test:analyze-performance --threshold 500

# Output as JSON for programmatic use
pnpm test:analyze-performance --json

# If the file is missing, run tests with JSON reporter first
# (see vitest.config.ts)
pnpm test:unit
```

**Purpose**: Track and identify slow tests to maintain fast pre-push hooks and CI builds.

**Key Metrics**:

- **Slow test threshold**: 1000ms (1 second)
- **Pre-push target**: 8-15 seconds total
- **Critical threshold**: 20 seconds (analysis exits non-zero; merge blocking depends on required checks in CI)

### All Tests

```bash
# Run all tests (unit + E2E)
pnpm test

# Run all tests including CI scripts
pnpm test && pnpm test:ci-scripts
```

## Test Data Seeding

The project includes deterministic test data seeding for E2E and integration tests. Test data is identical on every run, ensuring test reliability.

### Seed Development Data

Use this for manual testing with randomized data:

```bash
pnpm db:seed:dev
```

Generates random test data suitable for development and manual testing.

### Seed Test Data

Use this for automated tests with deterministic data:

```bash
pnpm db:seed:test
```

Creates test users with known IDs and emails:

- `test-user-1` / `test1@example.com`
- `test-user-2` / `test2@example.com`
- `test-user-admin` / `admin@example.com`

### Programmatic Seeding

Use the seed script directly for custom seeding in your tests:

```typescript
import { seedTest } from '../scripts/seed-test';

// Seed with default 3 users
await seedTest();

// Seed with custom user count
await seedTest({ userCount: 5 });

// Check result
const result = await seedTest({ userCount: 3 });
console.log(`Created ${result.created.users} users in ${result.duration}ms`);
```

### When to Seed

- **Before E2E tests**: Ensures consistent test state with known user data
- **After db:reset**: Rebuilds test database with fresh data
- **In CI/CD**: Automatic seeding before test runs (see `.github/workflows/ci.yml`)
- **RLS testing**: Use RLS helpers instead (see [RLS Tests](#rls-tests) below)

### Idempotent Seeding

The test seeding script is idempotent - it deletes existing test users before inserting new ones. This means you can run it multiple times safely without creating duplicate data.

```bash
# Safe to run multiple times
pnpm db:seed:test
pnpm db:seed:test  # Will reset and recreate the same data
```

**Note**: For RLS testing, use the specialized RLS helpers (`seedRLSTestData`, `createTestData`) instead of the general seeding script. See the [RLS Tests](#rls-tests) section below for details.

## Writing Tests

### Unit Tests

Unit tests live in `apps/web/tests/unit/` mirroring the `src/` structure.

#### Example: Component Test

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../helpers/test-utils';
import { MyComponent } from '@/components/MyComponent';

// Mock dependencies if needed
vi.mock('@/lib/analytics', () => ({
  useTrackClick: () => vi.fn(),
}));

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Hello" />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const onClickMock = vi.fn();
    render(<MyComponent onClick={onClickMock} />);

    await screen.getByRole('button').click();
    expect(onClickMock).toHaveBeenCalledOnce();
  });
});
```

#### Example: Function Test

```ts
import { describe, it, expect } from 'vitest';
import { myFunction } from '@/lib/myFunction';

describe('myFunction', () => {
  it('returns expected result', () => {
    expect(myFunction(2, 3)).toBe(5);
  });

  it('handles edge cases', () => {
    expect(myFunction(0, 0)).toBe(0);
  });
});
```

### RLS Tests

RLS tests live in `apps/web/tests/rls/` and verify database security policies.

#### Running RLS Validation

```bash
# Validate all tables have RLS policies
pnpm db:validate:rls

# Verbose mode (show all tables)
pnpm db:validate:rls --verbose

# Generate RLS policies for a table
pnpm db:rls:scaffold <table_name>
```

**RLS Validation runs automatically in CI** to prevent deploying tables without security policies. See:

- [RLS Implementation Guide](../database/rls-implementation.md) - How to implement RLS
- [RLS Contracts](../../apps/web/tests/rls/contracts.md) - Security boundaries
- [Database Standards](../database/standards.md) - RLS requirements

#### RLS Test Helpers

The project provides comprehensive helpers for RLS testing in [`apps/web/tests/helpers/rls-helpers.ts`](../../apps/web/tests/helpers/rls-helpers.ts):

- `createAdminClient()` - Create admin client (bypasses RLS)
- `createUserClient(userId)` - Create client impersonating a user
- `createAnonymousClient()` - Create unauthenticated client
- `seedRLSTestData(adminClient)` - Seed test users
- `cleanupRLSTestData(adminClient, userId)` - Clean up test users
- `createTestData(adminClient, userId, table, data)` - Insert test data
- `cleanupTestData(adminClient, userId, table)` - Delete test data

#### Example: User Isolation Test

```ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  createAdminClient,
  createUserClient,
  createAnonymousClient,
  seedRLSTestData,
  cleanupRLSTestData,
  createTestData,
  cleanupTestData,
} from '../helpers/rls-helpers';

describe('RLS: User Data Isolation', () => {
  let adminClient;
  let user1, user2;
  let user1Data, user2Data;

  beforeEach(async () => {
    // Create admin client for test setup
    adminClient = createAdminClient();

    // Seed test users
    const users = await seedRLSTestData(adminClient);
    user1 = users.user1;
    user2 = users.user2;

    // Create test data for both users
    user1Data = await createTestData(adminClient, user1.id, 'profiles', {
      name: 'User 1',
      email: user1.email,
    });

    user2Data = await createTestData(adminClient, user2.id, 'profiles', {
      name: 'User 2',
      email: user2.email,
    });
  });

  afterEach(async () => {
    // Cleanup test data
    await cleanupTestData(adminClient, user1.id, 'profiles');
    await cleanupTestData(adminClient, user2.id, 'profiles');

    // Cleanup test users
    await cleanupRLSTestData(adminClient, user1.id);
    await cleanupRLSTestData(adminClient, user2.id);
  });

  it('user can only read their own data', async () => {
    const user1Client = await createUserClient(user1.id);

    const { data, error } = await user1Client
      .from('profiles')
      .select()
      .eq('id', user1Data.id)
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.user_id).toBe(user1.id);
  });

  it('user cannot read other user data', async () => {
    const user1Client = await createUserClient(user1.id);

    const { data, error } = await user1Client
      .from('profiles')
      .select()
      .eq('id', user2Data.id)
      .single();

    // Should either return null or error (depending on RLS implementation)
    expect(data).toBeNull();
  });

  it('anonymous users cannot access any data', async () => {
    const anonClient = createAnonymousClient();

    const { data } = await anonClient.from('profiles').select();

    // Anonymous users should get empty results
    expect(data).toEqual([]);
  });
});
```

### pgTAP RLS Tests (Database-Level)

pgTAP tests provide database-level RLS validation that complements application-level RLS tests. They run directly in Postgres using transaction-based isolation, ensuring comprehensive security coverage.

#### Why Database-Level Testing?

**Application-level tests** (Vitest + JS helpers):

- Test RLS from the application's perspective
- Validate API endpoints respect RLS
- Test client-side auth context handling

**Database-level tests** (pgTAP + SQL):

- Test RLS policies directly in Postgres
- Use transaction isolation (no manual cleanup)
- Validate schema-wide RLS coverage
- More accurate for complex RLS scenarios

Both test suites run independently and provide defense-in-depth security validation.

#### Test Files

pgTAP tests live in `supabase/tests/` and run alphabetically:

- `000-setup-tests-hooks.sql` - Install pgTAP and test helpers
- `001-rls-enabled.sql` - Validate RLS enabled on all tables
- `002-user-isolation.sql` - Test user data isolation

#### Running pgTAP Tests

```bash
# Run all pgTAP tests
pnpm test:rls

# Watch mode for development
pnpm test:rls:watch
```

**Requirements**:

- Docker Desktop must be running
- Supabase CLI must be installed
- Local Supabase instance will be started automatically

#### Available Test Helpers

The tests use [basejump-supabase_test_helpers](https://github.com/usebasejump/supabase-test-helpers) which provide:

- `tests.create_supabase_user(email)` - Create test users
- `tests.authenticate_as(email)` - Switch authentication context
- `tests.get_supabase_uid(email)` - Get user ID from email
- `tests.rls_enabled(schema)` - Verify RLS on all tables in schema
- `tests.authenticate_as_service_role()` - Switch to admin context
- `tests.clear_authentication()` - Clear authentication (anonymous user)

#### Example: Schema-Wide RLS Validation

```sql
-- File: supabase/tests/001-rls-enabled.sql
begin;
select plan(1);

-- Verify RLS is enabled on all tables in public schema
select tests.rls_enabled('public');

select * from finish();
rollback;
```

This test fails if any table in the public schema lacks RLS policies, catching security gaps automatically.

#### Example: User Isolation Test

```sql
-- File: supabase/tests/002-user-isolation.sql
begin;
select plan(4);

-- Create test users
select tests.create_supabase_user('user1@test.com');
select tests.create_supabase_user('user2@test.com');

-- Create test data as User 1
select tests.authenticate_as('user1@test.com');
insert into public.profiles (id, user_id, name)
values (gen_random_uuid(), tests.get_supabase_uid('user1@test.com'), 'User One');

-- Verify User 1 can see their data
select results_eq(
  'SELECT count(*)::int FROM public.profiles WHERE user_id = tests.get_supabase_uid(''user1@test.com'')',
  ARRAY[1],
  'User 1 can see their own profile'
);

-- Switch to User 2
select tests.authenticate_as('user2@test.com');

-- Verify User 2 cannot see User 1's data
select results_eq(
  'SELECT count(*)::int FROM public.profiles WHERE user_id = tests.get_supabase_uid(''user1@test.com'')',
  ARRAY[0],
  'User 2 cannot see User 1''s profile'
);

-- Test anonymous access
select tests.clear_authentication();
select results_eq(
  'SELECT count(*)::int FROM public.profiles',
  ARRAY[0],
  'Anonymous users cannot see any profiles'
);

-- Verify User 2 cannot modify User 1's data
select tests.authenticate_as('user2@test.com');
select throws_ok(
  'UPDATE public.profiles SET name = ''Hacked'' WHERE user_id = tests.get_supabase_uid(''user1@test.com'')',
  '42501',  -- insufficient_privilege error code
  null,
  'User 2 cannot update User 1''s profile'
);

select * from finish();
rollback;  -- All test data is automatically cleaned up
```

#### Writing New pgTAP Tests

1. **Create test file** with numeric prefix (e.g., `003-team-isolation.sql`)
2. **Wrap in transaction** using `begin` and `rollback`
3. **Define test plan** with `select plan(N)` where N = number of tests
4. **Use test helpers** to create users and switch contexts
5. **Make assertions** using pgTAP functions:
   - `ok(condition, description)` - Basic assertion
   - `results_eq(query, expected, description)` - Compare query results
   - `throws_ok(query, error_code, message, description)` - Verify errors
   - `is_empty(query, description)` - Verify query returns no rows
6. **Finish test** with `select * from finish()` and `rollback`

#### Common Test Patterns

### Pattern 1: User can only see their own data

```sql
select tests.create_supabase_user('owner@test.com');
select tests.authenticate_as('owner@test.com');

-- Insert data as owner
insert into public.documents (user_id, title)
values (tests.get_supabase_uid('owner@test.com'), 'My Document');

-- Verify owner can see it
select results_eq(
  'SELECT count(*)::int FROM public.documents WHERE user_id = tests.get_supabase_uid(''owner@test.com'')',
  ARRAY[1],
  'Owner can see their document'
);

-- Verify other user cannot see it
select tests.create_supabase_user('other@test.com');
select tests.authenticate_as('other@test.com');
select results_eq(
  'SELECT count(*)::int FROM public.documents WHERE user_id = tests.get_supabase_uid(''owner@test.com'')',
  ARRAY[0],
  'Other user cannot see owner document'
);
```

### Pattern 2: Anonymous access restrictions

```sql
select tests.clear_authentication();

-- Verify anonymous cannot read protected data
select is_empty(
  'SELECT * FROM public.user_profiles',
  'Anonymous users cannot read user profiles'
);

-- Verify anonymous cannot write
select throws_ok(
  'INSERT INTO public.user_profiles (user_id, name) VALUES (gen_random_uuid(), ''Hacker'')',
  '42501',
  null,
  'Anonymous users cannot insert profiles'
);
```

### Pattern 3: Organization/team-based access

```sql
-- Users in same org can see each other's data
select tests.create_supabase_user('user1@company.com');
select tests.create_supabase_user('user2@company.com');

-- Both users belong to same organization
select tests.authenticate_as('user1@company.com');
insert into public.documents (org_id, user_id, title)
values ('org-abc', tests.get_supabase_uid('user1@company.com'), 'Team Doc');

select tests.authenticate_as('user2@company.com');
select results_eq(
  'SELECT count(*)::int FROM public.documents WHERE org_id = ''org-abc''',
  ARRAY[1],
  'User 2 can see documents in their organization'
);
```

#### Transaction Isolation Benefits

pgTAP tests use `BEGIN/ROLLBACK` transactions, which means:

- ✅ **No manual cleanup required** - All test data is automatically discarded
- ✅ **No side effects** - Tests never modify the actual database
- ✅ **Fast execution** - Rollback is instant compared to manual DELETE operations
- ✅ **Parallel-safe** - Tests can run concurrently without conflicts

Compare this to application-level tests which require:

```typescript
// Application-level cleanup (manual)
afterEach(async () => {
  await cleanupTestData(adminClient, user1.id, 'profiles');
  await cleanupRLSTestData(adminClient, user1.id);
});
```

With pgTAP:

```sql
-- Database-level cleanup (automatic)
rollback;  -- That's it!
```

#### CI/CD Integration

pgTAP tests run automatically in CI/CD after application-level RLS validation:

```yaml
# .github/workflows/ci.yml
- name: Run RLS tests (database-level)
  run: pnpm test:rls
```

Tests block deployment if:

- Any table lacks RLS policies
- User isolation is broken
- Security boundaries are violated

#### Troubleshooting

**Issue: `supabase test db` fails with connection error**

```text
failed to connect to postgres: dial tcp 127.0.0.1:54322: connect: connection refused
```

Solution: Start Supabase local instance first:

```bash
pnpm db:start
pnpm test:rls
```

**Issue: `extension "pgtap" not found`**

Solution: The setup hook file may not have run. Verify it exists:

```bash
ls supabase/tests/000-setup-tests-hooks.sql
```

**Issue: `function tests.create_supabase_user does not exist`**

Solution: basejump-supabase_test_helpers failed to install. Check setup hook output:

```bash
pnpm test:rls --debug
```

#### Issue: Tests pass but data persists

Solution: Ensure tests are wrapped in `begin/rollback`:

```sql
begin;  -- Add this at the start
select plan(N);
-- ... your tests ...
select * from finish();
rollback;  -- Add this at the end
```

#### Issue: Docker not running

Solution: Start Docker Desktop before running tests:

```bash
# Check Docker status
docker ps

# Start Supabase (requires Docker)
pnpm db:start
```

#### Best Practices

1. **Test both layers** - Write both application-level and database-level RLS tests
2. **Start with schema validation** - Ensure all tables have RLS before writing isolation tests
3. **Use descriptive test names** - Make assertion messages clear and actionable
4. **Test all CRUD operations** - Don't just test SELECT, also test INSERT/UPDATE/DELETE
5. **Test anonymous access** - Always verify unauthenticated users are properly restricted
6. **Keep tests focused** - One concern per test file (e.g., user isolation, org access, etc.)
7. **Use error codes** - When testing violations, use specific Postgres error codes (42501 for insufficient_privilege)

#### References

- [Supabase pgTAP Testing Guide](https://supabase.com/docs/guides/local-development/testing/pgtap-extended)
- [basejump-supabase_test_helpers](https://github.com/usebasejump/supabase-test-helpers)
- [Testing RLS with pgTAP (Basejump Guide)](https://usebasejump.com/blog/testing-on-supabase-with-pgtap)
- [pgTAP Documentation](https://pgtap.org/documentation.html)

### RLS Optimization Tests

RLS optimization tests validate that performance optimizations are correctly configured without breaking security. These tests complement functional RLS tests by checking infrastructure setup.

**Location:** `supabase/tests/003-rls-optimization.sql`

**Purpose:**

- Verify optimization infrastructure exists (private schema, security definer functions)
- Check indexes exist on RLS filter columns
- Validate policies specify roles correctly
- Ensure RLS security is maintained

#### Running Optimization Tests

```bash
# Run all pgTAP tests (includes optimization tests)
pnpm test:rls

# Optimization tests run as part of the suite
# Look for: "003-rls-optimization.sql" in output
```

#### What Gets Tested

The optimization test suite validates all 6 RLS optimizations from [RLS_OPTIMIZATION.md](../database/RLS_OPTIMIZATION.md):

1. **Infrastructure Tests**
   - Private schema exists
   - Private schema has correct permissions
   - Security definer functions exist

2. **Function Configuration Tests**
   - Functions return correct types
   - Functions are marked `SECURITY DEFINER`
   - Functions are marked `STABLE` (not `VOLATILE`)

3. **Index Tests**
   - Indexes exist on RLS policy filter columns
   - Composite indexes created where needed

4. **Policy Tests**
   - Policies specify roles (`TO authenticated`, `TO anon`)
   - Policies use function caching (`(SELECT auth.uid())`)
   - Expected policies exist on tables

5. **Security Tests**
   - RLS is enabled on tables
   - Unauthorized access is blocked
   - Existing RLS tests still pass

#### Example: Validation Test

```sql
-- File: supabase/tests/003-rls-optimization.sql
begin;
select plan(12);

-- Test private schema exists
SELECT has_schema('private', 'Private schema should exist');

-- Test security definer function
SELECT has_function('private', 'current_user_id');
SELECT is(
    (SELECT prosecdef FROM pg_proc WHERE proname = 'current_user_id'),
    true,
    'Function should be SECURITY DEFINER'
);

-- Test index exists
SELECT col_is_indexed('public', 'profiles', 'user_id');

-- Test policies exist
SELECT policies_are('public', 'profiles',
    ARRAY['Users can view their own profile'],
    'Expected policies exist'
);

select * from finish();
rollback;
```

#### Writing Optimization Tests

When you add a new optimized table (using [templates](../../supabase/templates/)):

1. **No new tests needed** if using templates exactly as-is
2. **Add tests** if you customize policies or add complex security definer functions

**Test checklist for custom implementations:**

- [ ] Index exists on filter columns
- [ ] Security definer function is `SECURITY DEFINER` and `STABLE`
- [ ] Policies specify roles
- [ ] RLS is enabled
- [ ] Security boundaries are maintained

#### Common Test Patterns

### Pattern 1: Verify security definer function

```sql
-- Check function exists and is configured correctly
SELECT has_function('private', 'user_teams');

-- Verify SECURITY DEFINER flag
SELECT is(
    (SELECT prosecdef FROM pg_proc
     JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid
     WHERE pg_namespace.nspname = 'private' AND proname = 'user_teams'),
    true,
    'user_teams() should be SECURITY DEFINER'
);

-- Verify STABLE flag (for caching)
SELECT is(
    (SELECT provolatile FROM pg_proc
     JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid
     WHERE pg_namespace.nspname = 'private' AND proname = 'user_teams'),
    's',  -- 's' = STABLE
    'user_teams() should be STABLE'
);
```

### Pattern 2: Verify indexes on filter columns

```sql
-- Check index exists on RLS filter column
SELECT col_is_indexed('public', 'documents', 'user_id',
    'Index should exist on documents.user_id for RLS optimization'
);

-- Check index exists on team_id (team-scoped table)
SELECT col_is_indexed('public', 'projects', 'team_id',
    'Index should exist on projects.team_id for RLS optimization'
);
```

### Pattern 3: Verify policies specify roles

```sql
-- Check that policies have role specification (not empty)
SELECT isnt(
    (SELECT COUNT(*) FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename = 'profiles'
       AND polroles IS NOT NULL
       AND array_length(polroles, 1) > 0),
    0,
    'Policies on profiles should specify roles'
);
```

#### Troubleshooting

#### Test fails: "Private schema should exist"

- Run the optimization migration: `supabase db reset`
- Check migration file exists: `supabase/migrations/20251031000000_optimize_rls_performance.sql`

#### Test fails: "Function should be SECURITY DEFINER"

- Function was created without `SECURITY DEFINER` flag
- Recreate function with: `CREATE OR REPLACE FUNCTION ... SECURITY DEFINER ...`

#### Test fails: "Index should exist on column"

- Index missing on RLS filter column
- Add index: `CREATE INDEX idx_tablename_column ON tablename(column);`

#### Test fails: "Policies should specify roles"

- Policies missing `TO authenticated` or `TO anon` clause
- Add role specification to policy

#### Resources

- **Full guide:** [RLS_OPTIMIZATION.md](../database/RLS_OPTIMIZATION.md)
- **Templates:** [supabase/templates/](../../supabase/templates/)
- **Issue:** [#237](https://github.com/your-org/your-repo/issues/237)

### E2E Tests

E2E tests live in `apps/web/tests/e2e/` and test complete user flows.

#### Example: Auth Flow Test

```ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('user can sign up', async ({ page }) => {
    await page.goto('/signup');

    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'SecurePassword123!');
    await page.click('button[type="submit"]');

    // Verify redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('protected routes require auth', async ({ page }) => {
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });
});
```

#### Using Fixtures

```ts
import { test } from '../fixtures/auth';

test('authenticated user can access dashboard', async ({ authenticatedPage }) => {
  // authenticatedPage is already logged in
  await expect(authenticatedPage).toHaveURL(/\/dashboard/);
  await expect(authenticatedPage.getByText('Welcome')).toBeVisible();
});
```

## Coverage

### Coverage Thresholds

| Metric     | Threshold |
| ---------- | --------- |
| Lines      | 70%       |
| Functions  | 70%       |
| Branches   | 65%       |
| Statements | 70%       |

### View Coverage Report

```bash
# Generate and view HTML coverage report
pnpm test:coverage
open apps/web/coverage/index.html
```

### Coverage Contract

See [coverage-contract.md](./coverage-contract.md) for:

- Excluded files and patterns
- Critical paths requiring higher coverage
- Coverage enforcement in CI

## Best Practices

### 1. Test Naming

- **Unit tests**: `{component/function}.test.{ts,tsx}`
- **E2E tests**: `{feature}.spec.ts`
- **RLS tests**: `{policy-area}.test.ts`

### 2. Test Organization

```text
apps/web/tests/
├── e2e/                    # End-to-end tests
│   ├── fixtures/          # Shared test fixtures
│   ├── auth-flows.spec.ts
│   └── smoke.spec.ts
├── rls/                   # Row Level Security tests
│   ├── helpers.ts
│   └── user-isolation.test.ts
├── unit/                  # Unit tests
│   ├── components/
│   └── lib/
└── helpers/               # Shared test utilities
    ├── test-utils.tsx
    └── mock-supabase.ts
```

### 3. Mocking

#### Mock Supabase Client

```ts
import { createMockSupabaseClient } from '../helpers/mock-supabase';

const mockSupabase = createMockSupabaseClient();
mockSupabase.auth.getUser.mockResolvedValue({
  data: { user: { id: '123', email: 'test@example.com' } },
  error: null,
});
```

#### Mock Next.js Navigation

```ts
// Already mocked in setup.ts
import { useRouter } from 'next/navigation';

const router = useRouter();
router.push('/dashboard'); // This is mocked
```

### 4. Async Testing

```ts
import { waitFor } from '@testing-library/react';

it('loads data asynchronously', async () => {
  render(<AsyncComponent />);

  await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument();
  });
});
```

### 5. Testing Accessibility

**Unit Tests (Manual Checks):**

```tsx
it('is accessible', async () => {
  const { container } = render(<MyComponent />);

  // Check for ARIA labels
  expect(screen.getByLabelText('Close dialog')).toBeInTheDocument();

  // Check for semantic HTML
  expect(screen.getByRole('button')).toBeInTheDocument();
});
```

**E2E Tests (Automated with axe-core):**

```ts
import AxeBuilder from '@axe-core/playwright';

test('homepage should not have accessibility violations', async ({ page }) => {
  await page.goto('/');

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
```

**Best Practices:**

- Run axe-core scans on all major pages
- Test keyboard navigation manually
- Verify screen reader compatibility for critical flows
- Check color contrast meets WCAG AA standards

### 6. E2E Best Practices

- **Use data-testid** for stable selectors
- **Wait for elements** before interacting
- **Isolate tests** - each test should be independent
- **Clean up** - use fixtures to reset state between tests

```ts
test('form submission', async ({ page }) => {
  await page.goto('/form');

  // Wait for the form to be ready
  await page.waitForSelector('[data-testid="submit-form"]');

  await page.fill('[name="email"]', 'test@example.com');
  await page.click('[data-testid="submit-form"]');

  // Wait for success message
  await expect(page.getByText('Success')).toBeVisible();
});
```

### 7. Test Performance Optimization

**Monitor Test Performance**:

```bash
# Run tests and analyze performance
pnpm test:unit && pnpm test:analyze-performance
```

**Optimization Strategies**:

**1. Mock expensive operations**:

```ts
// Mock API calls instead of making real requests
vi.mock('@/lib/api', () => ({
  fetchData: vi.fn().mockResolvedValue({ data: 'mock' }),
}));
```

**2. Use test.concurrent() for independent tests**:

```ts
// Run independent tests in parallel
test.concurrent('test 1', async () => {
  /* ... */
});
test.concurrent('test 2', async () => {
  /* ... */
});
```

**3. Avoid unnecessary re-renders**:

```ts
// Use screen queries instead of re-rendering
const { getByText } = render(<Component />);
expect(getByText('Hello')).toBeInTheDocument();
// No need to render again
```

**4. Move slow integration tests to E2E suite** if they involve real I/O, database operations, or browser interactions.

**Performance Targets**:

- Unit tests: <1s per test file
- Pre-push hook: 8-15s total
- Critical threshold: <20s (fails analysis; merge blocking depends on required checks in CI)

## Troubleshooting

### Common Issues

**1. `window.matchMedia is not a function`**

This is mocked in `apps/web/tests/setup.ts`. If you see this error, ensure the setup file is loaded:

```ts
// vitest.config.ts
export default defineConfig({
  test: {
    setupFiles: ['./tests/setup.ts'],
  },
});
```

#### 2. Module import errors

Use path aliases defined in `vitest.config.ts`:

```ts
import { MyComponent } from '@/components/MyComponent'; // ✅
import { MyComponent } from '../../../src/components/MyComponent'; // ❌
```

#### 3. E2E tests timing out

Increase timeout in `playwright.config.ts`:

```ts
export default defineConfig({
  timeout: 30_000, // 30 seconds
});
```

## CI/CD Integration

### Pre-Push Hooks

Unit tests run automatically before every push:

- **Target execution time**: 8-15 seconds (optimal developer experience)
- **Actual time**: ~1-2 seconds (with Turbo cache)
- **Slow test threshold**: 1000ms per test
- **Feedback**: Hook provides timing feedback and optimization suggestions
  - `<5s` - Cached execution
  - `5-15s` - Normal execution
  - `15-30s` - Acceptable but shows optimization suggestion
  - `>30s` - Warning (strongly consider optimizing or reducing test scope)
  - Note: CI marks >20s as critical for analysis; pre-push guidance is more lenient

**When tests exceed 15s**, the pre-push hook suggests running:

```bash
pnpm test:analyze-performance
```

This identifies which tests are slow and provides actionable optimization recommendations.

**Bypass hook** (not recommended):

```bash
git push --no-verify
```

### GitHub Actions

Tests run automatically in CI:

- **Unit tests**: Run on every push (all tests)
- **Test performance analysis**: Runs after unit tests to analyze and report slow tests
- **E2E tests**: Run on PRs and main branch
- **Accessibility tests**: Run with E2E suite
- **Coverage**: Generated with json-summary for GitHub annotations
- **Artifacts**: Coverage reports and test performance data uploaded for review

**CI Performance Tracking**:

- Test performance results are uploaded as artifacts
- Top 10 slowest tests are reported in CI logs
- The analysis flags >20s as critical (non-zero exit); whether CI fails depends on continue-on-error
- Performance data can be downloaded from GitHub Actions artifacts

See `.github/workflows/ci.yml` for full CI configuration.

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [React Testing Library](https://testing-library.com/react)
- [axe-core Accessibility Testing](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
