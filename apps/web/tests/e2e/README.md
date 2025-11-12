# End-to-End (E2E) Testing Guide

This directory contains comprehensive end-to-end tests for the web application, with a focus on authentication flows, accessibility, and mobile responsiveness.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Test Suite Structure](#test-suite-structure)
- [Prerequisites](#prerequisites)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Test Fixtures](#test-fixtures)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)
- [CI/CD Integration](#cicd-integration)

## Overview

**Test Framework:** Playwright
**Total Tests:** 148 tests
**Coverage Areas:**
- ✅ Authentication flows (login, signup, password reset, password update)
- ✅ Protected routes and session management
- ✅ Accessibility (WCAG 2.1 AA compliance)
- ✅ Mobile responsiveness (320px - 768px+ viewports)
- ✅ Form validation and error handling
- ✅ Design system components

**Test Execution Time:** ~60 seconds (parallel execution)

## Quick Start

```bash
# From project root
pnpm test:e2e

# From apps/web
pnpm exec playwright test

# Run specific test file
pnpm exec playwright test auth-login.spec.ts

# Run in UI mode (interactive)
pnpm exec playwright test --ui

# Run in debug mode
pnpm exec playwright test --debug
```

## Test Suite Structure

```text
tests/e2e/
├── README.md                          # This file
├── fixtures/
│   ├── auth.ts                        # Auth fixtures (authenticatedPage, testUser)
│   └── database.ts                    # Database cleanup utilities
├── auth-login.spec.ts                 # Login flow tests (17 tests)
├── auth-signup.spec.ts                # Signup flow tests (16 tests)
├── auth-password-reset.spec.ts        # Password reset tests (12 tests)
├── auth-update-password.spec.ts       # Password update tests (9 tests)
├── auth-protected-routes.spec.ts      # Protected routes & session (20 tests)
├── auth-accessibility.spec.ts         # Accessibility compliance (28 tests)
├── auth-flows.spec.ts                 # Complete auth flows (8 tests)
├── mobile-responsive.spec.ts          # Mobile viewport tests (24 tests)
├── accessibility.spec.ts              # General accessibility (5 tests)
├── design-viewer.spec.ts              # Design system viewer (7 tests)
└── smoke.spec.ts                      # Basic smoke tests (2 tests)
```

### Test Coverage by Area

| Area | Tests | Files |
|------|-------|-------|
| **Authentication** | 82 tests | 7 files |
| **Accessibility** | 33 tests | 2 files |
| **Mobile Responsive** | 24 tests | 1 file |
| **Design System** | 7 tests | 1 file |
| **Smoke Tests** | 2 tests | 1 file |
| **Total** | **148 tests** | **11 files** |

## Prerequisites

### 1. Supabase Local Instance

Tests require a running local Supabase instance:

```bash
# Start Supabase (from project root)
supabase start

# Verify Supabase is running
supabase status
```

You should see output like:

```text
API URL: http://127.0.0.1:54321
GraphQL URL: http://127.0.0.1:54321/graphql/v1
...
```

### 2. Environment Variables

Ensure these environment variables are set in `apps/web/.env.local`:

```bash
# Supabase (from `supabase status`)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# For database cleanup (optional, only needed for resetTestDatabase)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Playwright Installation

If this is your first time running Playwright:

```bash
# Install Playwright browsers
pnpm exec playwright install chromium

# Or install all browsers
pnpm exec playwright install
```

## Running Tests

### Basic Commands

```bash
# Run all tests (parallel execution)
pnpm exec playwright test

# Run specific test file
pnpm exec playwright test auth-login.spec.ts

# Run tests matching a pattern
pnpm exec playwright test auth-

# Run single test by line number
pnpm exec playwright test auth-login.spec.ts:17
```

### Interactive Modes

```bash
# UI Mode - Interactive test runner with time travel debugging
pnpm exec playwright test --ui

# Debug Mode - Step through tests with Playwright Inspector
pnpm exec playwright test --debug

# Headed Mode - See browser while tests run
pnpm exec playwright test --headed
```

### Browser-Specific Tests

```bash
# Run on Chromium only (default)
pnpm exec playwright test --project=chromium

# Run on Mobile Chrome
pnpm exec playwright test --project="Mobile Chrome"

# Run on all configured browsers
pnpm exec playwright test --project=chromium --project="Mobile Chrome"
```

### Filtering Tests

```bash
# Run tests by grep pattern
pnpm exec playwright test --grep "login"

# Exclude tests by pattern
pnpm exec playwright test --grep-invert "mobile"

# Run only failed tests from last run
pnpm exec playwright test --last-failed
```

### Reporting

```bash
# Generate HTML report
pnpm exec playwright test --reporter=html

# Open last HTML report
pnpm exec playwright show-report

# JSON report (for CI)
pnpm exec playwright test --reporter=json

# List reporter (default)
pnpm exec playwright test --reporter=list
```

## Writing Tests

### Basic Test Structure

```typescript
import { expect, test } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup code (runs before each test)
    await page.goto('/your-page');
  });

  test('should do something', async ({ page }) => {
    // Arrange
    await page.fill('[name="email"]', 'test@example.com');

    // Act
    await page.click('button[type="submit"]');

    // Assert
    await expect(page).toHaveURL('/dashboard');
  });
});
```

### Using Auth Fixtures

```typescript
import { expect, test } from './fixtures/auth';

test.describe('Protected Feature', () => {
  test('requires authentication', async ({ authenticatedPage, testUser }) => {
    // authenticatedPage is already logged in
    // testUser contains { email, password }

    await authenticatedPage.goto('/dashboard');
    await expect(authenticatedPage.locator('text=Welcome')).toBeVisible();
  });
});
```

### Accessibility Testing

```typescript
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('should have no accessibility violations', async ({ page }) => {
  await page.goto('/your-page');

  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
```

### Mobile Testing

```typescript
import { expect, test } from '@playwright/test';

test.describe('Mobile Viewport', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('works on mobile', async ({ page }) => {
    await page.goto('/login');

    // Use tap() instead of click() for touch interactions
    await page.locator('input[name="email"]').tap();
    await page.locator('input[name="email"]').fill('test@example.com');
  });
});
```

## Test Fixtures

### Auth Fixture (`fixtures/auth.ts`)

Provides authenticated test sessions and unique test users.

#### `testUser` Fixture

Generates a unique test user for each test:

```typescript
import { expect, test } from './fixtures/auth';

test('example', async ({ testUser }) => {
  console.log(testUser.email);    // test-1634567890123@example.com
  console.log(testUser.password); // TestPassword123!
});
```

#### `authenticatedPage` Fixture

Provides a Playwright page that's already authenticated:

```typescript
import { expect, test } from './fixtures/auth';

test('dashboard', async ({ authenticatedPage, testUser }) => {
  // Already signed in, just navigate
  await authenticatedPage.goto('/dashboard');

  // testUser contains the credentials used
  await expect(authenticatedPage.locator(`text=${testUser.email}`)).toBeVisible();
});
```

**How it works:**
1. Creates a unique test user with `testUser` fixture
2. Navigates to `/signup`
3. Fills and submits signup form
4. Waits for redirect to `/` or `/dashboard`
5. Provides authenticated page to your test
6. Cleans up (signs out) after test completes

### Database Fixture (`fixtures/database.ts`)

Provides database cleanup utilities (optional, for CI/CD).

```typescript
import { resetTestDatabase } from './fixtures/database';

test.afterAll(async () => {
  // Clean up test users created in last 24 hours
  await resetTestDatabase();
});
```

**Requirements:**
- `SUPABASE_SERVICE_ROLE_KEY` environment variable
- Only cleans users with emails starting with `test-` or ending in `@example.com`
- Only cleans users created in last 24 hours (safety measure)

## Best Practices

### ✅ DO

- **Use semantic selectors:** `page.locator('button[type="submit"]')` instead of `page.locator('.btn-primary')`
- **Wait for navigation:** `await page.waitForURL('/dashboard')` after form submissions
- **Test accessibility:** Use `aria-*` attributes and semantic HTML in your assertions
- **Isolate tests:** Each test should be independent and not rely on others
- **Use fixtures:** Leverage `testUser` and `authenticatedPage` for auth tests
- **Test error states:** Don't just test happy paths
- **Use `expect` assertions:** Playwright's expect has auto-retry built-in

### ❌ DON'T

- **Don't use hard-coded delays:** Use `waitForSelector`, `waitForURL`, or `waitForLoadState` instead of `waitForTimeout`
- **Don't rely on CSS classes:** They can change with styling updates
- **Don't test implementation details:** Test behavior, not internal state
- **Don't create real users in production:** Use local Supabase or test environments
- **Don't share state between tests:** Each test should start fresh
- **Don't use test IDs unless necessary:** Prefer semantic selectors

### Selector Best Practices

**Priority order (best → worst):**

1. **Role selectors:** `page.getByRole('button', { name: 'Submit' })`
2. **Label selectors:** `page.getByLabel('Email')`
3. **Placeholder selectors:** `page.getByPlaceholder('Enter email')`
4. **Text selectors:** `page.getByText('Welcome')`
5. **Test ID selectors:** `page.getByTestId('submit-button')` (last resort)

### Form Testing

```typescript
// ✅ Good - Wait for validation to trigger
await page.fill('[name="email"]', 'invalid');
await page.locator('[name="email"]').blur();
await expect(page.locator('[role="alert"]')).toBeVisible();

// ❌ Bad - Race condition, might not wait for validation
await page.fill('[name="email"]', 'invalid');
await page.click('button[type="submit"]');
// Error might not have appeared yet
```

### Authentication Testing

```typescript
// ✅ Good - Use fixture for authenticated state
import { expect, test } from './fixtures/auth';

test('protected page', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/dashboard');
  // Already authenticated
});

// ❌ Bad - Manually authenticate in every test
test('protected page', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');
  await page.waitForURL('/');
  // Now navigate to protected page...
});
```

## Troubleshooting

### Supabase Connection Errors

**Symptom:** Tests fail with "Failed to fetch" or connection errors

**Solution:**
```bash
# Check if Supabase is running
supabase status

# If not running, start it
supabase start

# Verify environment variables
cat apps/web/.env.local | grep SUPABASE
```

### Tests Timing Out

**Symptom:** Tests fail with "Test timeout of 30000ms exceeded"

**Solution:**
1. Check if Next.js dev server is running (`http://localhost:3000`)
2. Increase timeout in `playwright.config.ts`:
   ```typescript
   timeout: 60_000, // 60 seconds
   ```
3. Use more specific waitFor conditions:
   ```typescript
   await page.waitForURL('/dashboard', { timeout: 10000 });
   ```

### Flaky Tests

**Symptom:** Tests sometimes pass, fail other times

**Common causes:**
- **Race conditions:** Not waiting for elements/navigation
- **Network delays:** Use `page.waitForResponse()` for API calls
- **Animation delays:** Wait for `page.waitForLoadState('networkidle')`

**Solutions:**
```typescript
// ✅ Wait for specific condition
await page.waitForSelector('[role="alert"]', { state: 'visible' });

// ✅ Wait for navigation
await page.waitForURL('/dashboard');

// ✅ Wait for network to settle
await page.waitForLoadState('networkidle');

// ❌ Don't use arbitrary timeouts
await page.waitForTimeout(1000); // Bad!
```

### Database Cleanup Issues

**Symptom:** Tests fail because users already exist

**Solution:**
```bash
# Reset local Supabase database
supabase db reset

# Or clean up test users programmatically (create a temporary script)
echo "import { resetTestDatabase } from './tests/e2e/fixtures/database.js'; await resetTestDatabase();" > cleanup.mjs
node cleanup.mjs
rm cleanup.mjs
```

### Playwright Browser Not Installed

**Symptom:** "Executable doesn't exist at ..."

**Solution:**
```bash
# Install Chromium
pnpm exec playwright install chromium

# Or install all browsers
pnpm exec playwright install
```

### Port 3000 Already in Use

**Symptom:** "Error: listen EADDRINUSE: address already in use :::3000"

**Solution:**
```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in playwright.config.ts
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: supabase/setup-cli@v1
        with:
          version: latest

      - name: Start Supabase
        run: supabase start

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Install Playwright Browsers
        run: pnpm exec playwright install --with-deps chromium

      - name: Run E2E tests
        run: pnpm test:e2e
        env:
          NEXT_PUBLIC_SUPABASE_URL: http://127.0.0.1:54321
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: apps/web/playwright-report/
          retention-days: 30
```

### Environment Variables for CI

Required secrets in GitHub Actions:
- `SUPABASE_ANON_KEY` - From `supabase status` (anon key)
- `SUPABASE_SERVICE_ROLE_KEY` - From `supabase status` (service_role key)

### Database Cleanup in CI

```typescript
// In test setup file or afterAll hook
import { resetTestDatabase } from './fixtures/database';

test.afterAll(async () => {
  if (process.env.CI) {
    await resetTestDatabase();
  }
});
```

## Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Supabase Local Development](https://supabase.com/docs/guides/cli/local-development)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Axe Accessibility Testing](https://github.com/dequelabs/axe-core)
- [Project Testing Guide](../../docs/guides/TESTING.md)

## Issue Tracking

This test suite was created to fulfill [Issue #359](https://github.com/Shredvardson/dl-starter/issues/359) - Expand E2E test coverage for authentication flows.

**Current Status:** ✅ Complete
- 148 tests passing
- All auth flows covered
- Accessibility compliant
- Mobile responsive
- CI/CD ready