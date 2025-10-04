# Testing Guide

Comprehensive guide for writing and running tests in the DL Starter monorepo.

## Table of Contents

- [Overview](#overview)
- [Test Stack](#test-stack)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Coverage](#coverage)
- [Best Practices](#best-practices)

## Overview

The DL Starter uses a comprehensive testing strategy with three types of tests:

1. **Unit Tests** - Test individual components and functions in isolation
2. **RLS Tests** - Test Row Level Security policies in Supabase
3. **E2E Tests** - Test complete user flows in a real browser

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

### All Tests

```bash
# Run all tests (unit + E2E)
pnpm test
```

## Writing Tests

### Unit Tests

Unit tests live in `apps/web/tests/unit/` mirroring the `src/` structure.

**Example: Component Test**

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

**Example: Function Test**

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

**Example: User Isolation Test**

```ts
import { describe, it, expect } from 'vitest';
import { createTestUser, createAdminClient } from './helpers';

describe('RLS: User Data Isolation', () => {
  it('user can only read their own data', async () => {
    const adminClient = createAdminClient();
    const userId = 'test-user-1';

    // Create test data as admin
    await adminClient.from('posts').insert({
      user_id: userId,
      title: 'My Post',
    });

    // Try to read as the user
    const userClient = createTestUser(userId);
    const { data, error } = await userClient.from('posts').select();

    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data[0].user_id).toBe(userId);
  });

  it('user cannot read other user data', async () => {
    const adminClient = createAdminClient();

    // Create data for user1
    await adminClient.from('posts').insert({
      user_id: 'user-1',
      title: 'User 1 Post',
    });

    // Try to read as user2
    const user2Client = createTestUser('user-2');
    const { data } = await user2Client.from('posts').select();

    // Should not see user-1's data
    expect(data).toHaveLength(0);
  });
});
```

### E2E Tests

E2E tests live in `apps/web/tests/e2e/` and test complete user flows.

**Example: Auth Flow Test**

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

**Using Fixtures**

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

```
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

**Mock Supabase Client**

```ts
import { createMockSupabaseClient } from '../helpers/mock-supabase';

const mockSupabase = createMockSupabaseClient();
mockSupabase.auth.getUser.mockResolvedValue({
  data: { user: { id: '123', email: 'test@example.com' } },
  error: null,
});
```

**Mock Next.js Navigation**

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

**2. Module import errors**

Use path aliases defined in `vitest.config.ts`:

```ts
import { MyComponent } from '@/components/MyComponent'; // ✅
import { MyComponent } from '../../../src/components/MyComponent'; // ❌
```

**3. E2E tests timing out**

Increase timeout in `playwright.config.ts`:

```ts
export default defineConfig({
  timeout: 30_000, // 30 seconds
});
```

## CI/CD Integration

### Pre-Push Hooks

Unit tests run automatically before every push:

- **Target execution time**: <15-20 seconds (optimal developer experience)
- **Actual time**: ~1-2 seconds (with Turbo cache)
- **Feedback**: Hook provides timing feedback
  - `<5s` - Cached execution
  - `5-15s` - Normal execution
  - `15-30s` - Acceptable but slower
  - `>30s` - Warning (consider optimizing)

**Bypass hook** (not recommended):

```bash
git push --no-verify
```

### GitHub Actions

Tests run automatically in CI:

- **Unit tests**: Run on every push (all tests)
- **E2E tests**: Run on PRs and main branch
- **Accessibility tests**: Run with E2E suite
- **Coverage**: Generated with json-summary for GitHub annotations
- **Artifacts**: Coverage reports uploaded for review

See `.github/workflows/ci.yml` for full CI configuration.

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [React Testing Library](https://testing-library.com/react)
- [axe-core Accessibility Testing](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
