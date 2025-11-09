# UI Automation Testing Guide

**Version**: 1.0
**Updated**: 2025-11-06
**Target Audience**: Developers, QA Engineers

## Overview

This guide provides **industry-standard practices** for UI testing in the DL Starter monorepo, combining AI-powered testing with traditional automation.

## Testing Philosophy

### The Testing Pyramid

```
        /\
       /E2E\        ← 10% (Critical user journeys)
      /------\
     /  API  \      ← 20% (Integration tests)
    /----------\
   /   Unit     \   ← 70% (Component/function tests)
  /--------------\
```

**Our Approach**:

- **70% Unit Tests** - Components, utilities, business logic
- **20% Integration Tests** - API routes, database queries, RLS policies
- **10% E2E Tests** - Critical user flows (auth, CRUD, checkout)

## Testing Stack

### Tools

| Tool | Purpose | When to Use |
|------|---------|-------------|
| **Vitest** | Unit/Integration testing | Components, utilities, React hooks |
| **React Testing Library** | Component testing | UI components, user interactions |
| **Playwright** | E2E automation | Critical user journeys, cross-browser |
| **Playwright MCP** | AI-powered testing | Exploratory testing, debugging, manual QA |
| **Test Generator** | Test scaffolding | Generate tests from components |
| **pgTAP** | Database testing | RLS policies, triggers, constraints |

### Test Types

```typescript
// Unit Test (Vitest + RTL)
import { render, screen } from '@testing-library/react';
import { Header } from './Header';

test('renders logo and navigation', () => {
  render(<Header />);
  expect(screen.getByRole('banner')).toBeInTheDocument();
});

// E2E Test (Playwright)
import { test, expect } from '@playwright/test';

test('user can sign up', async ({ page }) => {
  await page.goto('/sign-up');
  await page.fill('[name="email"]', 'test@example.com');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/');
});

// AI-Powered Test (Playwright MCP)
// Natural language via Claude Code:
// "Test the sign-up flow and verify redirect to dashboard"
```

## Workflow: From Feature to Test

### Step 1: Write Feature Code

Create your component/feature:

```typescript
// src/components/SignUpForm.tsx
export function SignUpForm() {
  return (
    <form>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit">Sign up</button>
    </form>
  );
}
```

### Step 2: Manual Testing with Playwright MCP

Ask Claude Code to test it:

```
Start the dev server and test the sign-up form at /sign-up:
1. Fill email: test@example.com
2. Fill password: TestPassword123!
3. Submit form
4. Verify redirect to homepage
5. Take screenshots at each step
```

**Why This Works**:

- ✅ Real browser environment
- ✅ Catches runtime issues (env vars, API errors, styling bugs)
- ✅ Visual verification via screenshots
- ✅ Validates user experience, not just functionality

**Output**: Claude tests the flow, captures screenshots, reports bugs.

### Step 3: Fix Issues Discovered

Example from Issue #292:

**Bug Found**: Environment variables not accessible in browser

**Fix Applied**:

```bash
cp .env.local apps/web/.env.local
```

**Re-test**: Ask Claude to re-run the test flow.

### Step 4: Generate Unit Tests

Use Test Generator sub-agent:

```bash
/test unit src/components/SignUpForm.tsx
```

**Output**: Generated test file:

```typescript
// src/components/SignUpForm.test.tsx
import { render, screen } from '@testing-library/react';
import { SignUpForm } from './SignUpForm';

describe('SignUpForm', () => {
  it('renders email input', () => {
    render(<SignUpForm />);
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
  });

  it('renders password input', () => {
    render(<SignUpForm />);
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<SignUpForm />);
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });
});
```

**Coverage Goal**: 80% (per coverage contract)

### Step 5: Codify E2E Tests

Convert validated Playwright MCP flows into code:

```typescript
// apps/web/tests/e2e/auth-flows.spec.ts
import { test, expect } from '@playwright/test';

test('user can sign up', async ({ page }) => {
  // Flow validated via Playwright MCP
  await page.goto('/sign-up');

  // Fill form
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'TestPassword123!');

  // Submit
  await page.click('button[type="submit"]');

  // Verify redirect (behavior confirmed via MCP)
  await expect(page).toHaveURL('/');
});
```

### Step 6: Run Tests in CI

Add to pre-push hook:

```bash
# .husky/pre-push
pnpm test:unit  # Fast unit tests
```

Add to GitHub Actions:

```yaml
# .github/workflows/test.yml
- name: Run E2E Tests
  run: pnpm test:e2e
```

## Test Commands

### Unit Tests

```bash
# Run all unit tests
pnpm test

# Watch mode (auto-run on file changes)
pnpm test:watch

# Coverage report
pnpm test:coverage

# Specific file
pnpm test Header.test.tsx
```

### E2E Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Interactive mode (UI)
pnpm test:e2e --ui

# Debug mode (headed browser)
pnpm test:e2e --debug

# Specific test
pnpm test:e2e auth-flows.spec.ts
```

### Playwright MCP (AI-Powered)

Via Claude Code (natural language):

```
Test the auth flow:
1. Sign up with new user
2. Navigate to dashboard
3. Sign out
4. Sign in again
5. Verify session persists
```

Claude will execute using MCP tools.

## Best Practices

### 1. Test User Behavior, Not Implementation

❌ **Avoid** (tests implementation):

```typescript
expect(component.state.isLoading).toBe(false);
```

✅ **Prefer** (tests behavior):

```typescript
expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
expect(screen.getByText('Dashboard')).toBeInTheDocument();
```

### 2. Use Semantic Queries

❌ **Avoid** (brittle):

```typescript
screen.getByClassName('btn-primary');
```

✅ **Prefer** (accessible):

```typescript
screen.getByRole('button', { name: /sign up/i });
```

### 3. Test Accessibility

Always include keyboard navigation:

```typescript
test('form is keyboard accessible', async () => {
  render(<SignUpForm />);

  const emailInput = screen.getByRole('textbox', { name: /email/i });
  const submitButton = screen.getByRole('button', { name: /sign up/i });

  // Tab navigation
  emailInput.focus();
  await userEvent.tab();
  expect(screen.getByLabelText(/password/i)).toHaveFocus();

  // Enter to submit
  await userEvent.keyboard('{Enter}');
  expect(submitButton).toHaveAttribute('type', 'submit');
});
```

### 4. Isolate Tests

Each test should be independent:

```typescript
// ❌ Bad - tests depend on each other
test('user signs up', async () => {
  globalUser = await signUp();
});

test('user signs in', async () => {
  await signIn(globalUser); // Depends on previous test
});

// ✅ Good - each test is independent
test('user signs up', async () => {
  const user = await signUp();
  expect(user).toBeDefined();
});

test('user signs in', async () => {
  const user = await signUp(); // Create own test data
  await signIn(user);
  expect(isAuthenticated()).toBe(true);
});
```

### 5. Mock External Dependencies

```typescript
// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signUp: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
    },
  }),
}));
```

### 6. Use Fixtures for E2E Tests

```typescript
// tests/e2e/fixtures/auth.ts
export const test = base.extend<{
  authenticatedPage: Page;
}>({
  authenticatedPage: async ({ page }, use) => {
    // Sign up and authenticate
    await page.goto('/sign-up');
    await page.fill('[name="email"]', `test-${Date.now()}@example.com`);
    await page.fill('[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');

    // Provide authenticated page to test
    await use(page);

    // Cleanup
    await signOut(page);
  },
});

// Usage
test('authenticated user can access dashboard', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/dashboard');
  await expect(authenticatedPage).toHaveURL('/dashboard');
});
```

### 7. Test Error States

```typescript
test('shows error for invalid email', async () => {
  render(<SignUpForm />);

  const emailInput = screen.getByRole('textbox', { name: /email/i });
  const submitButton = screen.getByRole('button', { name: /sign up/i });

  // Invalid email
  await userEvent.type(emailInput, 'invalid-email');
  await userEvent.click(submitButton);

  // Error message displayed
  expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
});
```

## Test Coverage Requirements

From [coverage-contract.md](./coverage-contract.md):

### Minimum Thresholds

- **Lines**: 70%
- **Functions**: 70%
- **Branches**: 65%
- **Statements**: 70%

### Exemptions

Excluded from coverage requirements:

- Config files (`*.config.ts`, `*.config.js`)
- Type definitions (`*.d.ts`)
- Test files (`*.test.ts`, `*.spec.ts`)
- Storybook stories (`*.stories.tsx`)

### Check Coverage

```bash
pnpm test:coverage
```

**Output**:

```
--------------------|---------|----------|---------|---------|-------------------
File                | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
--------------------|---------|----------|---------|---------|-------------------
All files           |   78.23 |    72.45 |   81.12 |   78.56 |
 Header.tsx         |     100 |      100 |     100 |     100 |
 Link.tsx           |     100 |      100 |     100 |     100 |
 SignUpForm.tsx     |   85.71 |       75 |      80 |   85.71 | 45-48
--------------------|---------|----------|---------|---------|-------------------
```

## Testing Patterns by Feature Type

### Authentication Flow

**Manual Test** (Playwright MCP):

```
Test complete auth flow:
1. Sign up → Verify redirect
2. Dashboard access → Verify user data
3. Sign out → Verify session cleared
4. Sign in → Verify success
5. Session persistence → Verify refresh works
```

**E2E Test** (codified):

```typescript
test('complete auth flow', async ({ page }) => {
  const email = `test-${Date.now()}@example.com`;

  // Sign up
  await page.goto('/sign-up');
  await page.fill('[name="email"]', email);
  await page.fill('[name="password"]', 'TestPassword123!');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/');

  // Dashboard
  await page.goto('/dashboard');
  await expect(page.getByText(email)).toBeVisible();

  // Sign out
  await page.click('button:has-text("Sign out")');
  await expect(page).toHaveURL('/sign-in');

  // Sign in
  await page.fill('[name="email"]', email);
  await page.fill('[name="password"]', 'TestPassword123!');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/');

  // Session persistence
  await page.reload();
  await page.goto('/dashboard');
  await expect(page).toHaveURL('/dashboard'); // Not redirected to sign-in
});
```

**Unit Tests**:

```typescript
describe('SignUpForm', () => {
  it('validates email format', async () => {
    render(<SignUpForm />);
    await userEvent.type(screen.getByRole('textbox', { name: /email/i }), 'invalid');
    await userEvent.click(screen.getByRole('button', { name: /sign up/i }));
    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
  });

  it('validates password strength', async () => {
    render(<SignUpForm />);
    await userEvent.type(screen.getByLabelText(/password/i), 'weak');
    await userEvent.click(screen.getByRole('button', { name: /sign up/i }));
    expect(await screen.findByText(/password must be at least 8 characters/i)).toBeInTheDocument();
  });
});
```

### CRUD Operations

**Manual Test**:

```
Test todo CRUD:
1. Create todo "Buy milk"
2. Verify appears in list
3. Edit to "Buy milk and eggs"
4. Verify updated
5. Delete todo
6. Verify removed from list
```

**E2E Test**:

```typescript
test('todo CRUD operations', async ({ authenticatedPage }) => {
  // Create
  await authenticatedPage.goto('/todos');
  await authenticatedPage.fill('[name="title"]', 'Buy milk');
  await authenticatedPage.click('button:has-text("Add")');
  await expect(authenticatedPage.getByText('Buy milk')).toBeVisible();

  // Update
  await authenticatedPage.click('button[aria-label="Edit Buy milk"]');
  await authenticatedPage.fill('[name="title"]', 'Buy milk and eggs');
  await authenticatedPage.click('button:has-text("Save")');
  await expect(authenticatedPage.getByText('Buy milk and eggs')).toBeVisible();

  // Delete
  await authenticatedPage.click('button[aria-label="Delete Buy milk and eggs"]');
  await authenticatedPage.click('button:has-text("Confirm")');
  await expect(authenticatedPage.getByText('Buy milk and eggs')).not.toBeVisible();
});
```

### Protected Routes

**Manual Test**:

```
Test protected route access:
1. Clear session
2. Navigate to /dashboard
3. Verify redirect to /sign-in
4. Sign in
5. Verify redirect back to /dashboard
```

**E2E Test**:

```typescript
test('unauthenticated user redirected', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL('/sign-in');
});

test('authenticated user accesses protected route', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/dashboard');
  await expect(authenticatedPage).toHaveURL('/dashboard');
  await expect(authenticatedPage.getByText('Dashboard')).toBeVisible();
});
```

### Form Validation

**Unit Test** (preferred for validation):

```typescript
describe('SignUpForm validation', () => {
  it('shows error for empty email', async () => {
    render(<SignUpForm />);
    await userEvent.click(screen.getByRole('button', { name: /sign up/i }));
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
  });

  it('shows error for weak password', async () => {
    render(<SignUpForm />);
    await userEvent.type(screen.getByLabelText(/password/i), 'weak');
    await userEvent.click(screen.getByRole('button', { name: /sign up/i }));
    expect(await screen.findByText(/password must contain/i)).toBeInTheDocument();
  });

  it('clears errors on valid input', async () => {
    render(<SignUpForm />);
    const emailInput = screen.getByRole('textbox', { name: /email/i });

    // Trigger error
    await userEvent.click(screen.getByRole('button', { name: /sign up/i }));
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();

    // Fix error
    await userEvent.type(emailInput, 'test@example.com');
    expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
  });
});
```

## Debugging Failed Tests

### Unit Test Failures

**Debug with screen.debug()**:

```typescript
test('debugging example', () => {
  render(<Component />);
  screen.debug(); // Prints current DOM

  // Or debug specific element
  const button = screen.getByRole('button');
  screen.debug(button);
});
```

**Interactive debugging**:

```bash
pnpm test --ui
```

Opens Vitest UI for visual debugging.

### E2E Test Failures

**Screenshots on failure** (automatic):

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
});
```

**Manual debugging**:

```bash
pnpm test:e2e --debug auth-flows.spec.ts
```

Opens headed browser with pause on each step.

**Trace viewer** (post-failure):

```bash
npx playwright show-trace trace.zip
```

### Playwright MCP Debugging

Ask Claude for diagnostics:

```
The sign-up form isn't submitting. Can you:
1. Take a screenshot of the form
2. Get console messages
3. Get network requests
4. Try submitting again and report any errors
```

Claude will use MCP tools to diagnose the issue.

## Performance Testing

### Lighthouse CI

For performance metrics:

```bash
# Install
pnpm add -D @lhci/cli

# Run
lhci autorun --collect.url=http://localhost:3000
```

### Visual Regression

Use Playwright screenshots:

```typescript
test('visual regression', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveScreenshot('dashboard.png');
});
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm test:unit
      - run: pnpm test:coverage
      - uses: codecov/codecov-action@v4

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
      - run: pnpm install
      - run: npx playwright install --with-deps
      - run: pnpm test:e2e
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

### Pre-push Hook

```bash
# .husky/pre-push
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

pnpm test:unit --run
```

Fast unit tests only (E2E too slow for pre-push).

## Resources

### Internal Documentation

- [PLAYWRIGHT_MCP_GUIDE.md](./PLAYWRIGHT_MCP_GUIDE.md) - Playwright MCP usage
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - General testing guide
- [coverage-contract.md](./coverage-contract.md) - Coverage requirements
- [E2E Test Contracts](../../apps/web/tests/e2e/contracts.md) - User flow contracts

### External Resources

- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Vitest Docs](https://vitest.dev/)
- [Testing JavaScript](https://testingjavascript.com/) (Kent C. Dodds course)

### Tools

- [Testing Library Queries](https://testing-library.com/docs/queries/about) - Query cheat sheet
- [Playwright Trace Viewer](https://trace.playwright.dev/) - Debug E2E failures
- [Vitest UI](https://vitest.dev/guide/ui.html) - Visual test runner

## Success Metrics

From Issue #292 (Auth Module):

- ✅ **Complete auth flow tested** in 15 minutes via Playwright MCP
- ✅ **1 critical bug discovered** before code review (env vars)
- ✅ **9 E2E tests written** covering all auth contracts
- ✅ **3 auth fixtures created** for test isolation
- ✅ **100% auth flow coverage** validated manually

**Key Takeaway**: AI-powered testing (Playwright MCP) + traditional automation (Playwright/Vitest) = comprehensive, fast, and reliable test suite.

---

**Pro Tip**: Start every feature with Playwright MCP manual testing. Fix bugs discovered. Then codify happy paths into unit/E2E tests. This workflow ensures you catch issues early while building a regression-proof test suite.
