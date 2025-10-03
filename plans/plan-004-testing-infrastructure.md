---
id: PLAN-20251003-testing-infrastructure
type: plan
parentId: SPEC-20251003-testing-infrastructure
issue: 108
spec: SPEC-20251003-testing-infrastructure
source: https://github.com/Shredvardson/dl-starter/issues/108
---

# Technical Implementation Plan: Testing Infrastructure

**Plan ID**: 004
**Specification**: [feature-004-testing-infrastructure.md](../specs/feature-004-testing-infrastructure.md)
**Created**: 2025-10-03
**Status**: Ready for Implementation

## Executive Summary

This plan implements comprehensive testing infrastructure for the DL Starter monorepo, addressing the **P0 (BLOCKER)** gap of zero test coverage. The implementation follows 2025 best practices:
- **70% minimum coverage** with risk-based focus on critical paths
- **Ephemeral test data** via database reset pattern
- **<30s local, <3min CI** execution times
- **Pre-push hooks** with emergency bypass
- **Chrome DevTools MCP** for AI-powered visual validation

### Key Metrics
- **Effort**: 5-7 days (High)
- **Complexity**: High (multiple testing layers + CI/CD integration)
- **Risk**: Medium (well-established patterns, but integration complexity)
- **Dependencies**: None (foundational feature)

---

## Architecture Decision

### Testing Stack Alignment

**Stack Context**:
- **Frontend**: Next.js 15.5.4, React 19.1.1, TypeScript 5
- **Styling**: Tailwind CSS 3.4.17, shadcn/ui components
- **Build**: Turbo 2.5.8 (monorepo orchestration)
- **Existing**: Vitest 3.2.4, Playwright 1.55.1, @testing-library/react 16.3.0

**Decision: Leverage Existing Tools with Enhanced Configuration**

✅ **Use Vitest** for unit/integration tests
- Already installed (3.2.4)
- Fast, modern, Vite-native
- Built-in coverage with c8
- Supports React Testing Library

✅ **Use Playwright** for E2E tests
- Already installed (1.55.1)
- Modern, reliable, fast
- Built-in visual regression support
- Chrome DevTools Protocol compatible

✅ **Add Chrome DevTools MCP** for AI visual validation
- NEW: Bleeding-edge 2025 technology
- Enables AI to "see" browser state
- Complements Playwright's E2E capabilities
- MCP server integration for Claude Code

**Rationale**: Maximize existing investments, avoid churn, add only strategic new capabilities (Chrome DevTools MCP).

---

## Implementation Strategy

### Phase 1: Unit & Integration Testing (Days 1-2)

#### 1.1 Enhanced Vitest Configuration
**File**: `apps/web/vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: [
      'src/**/*.test.{ts,tsx}',
      'tests/unit/**/*.test.{ts,tsx}',
    ],
    exclude: [
      'e2e/**',
      'tests/e2e/**',
      'node_modules/**',
      '.next/**',
      'dist/**',
      '.git/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 65,
        statements: 70,
      },
      exclude: [
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/tests/**',
        '**/.next/**',
        '**/node_modules/**',
        '**/dist/**',
        // Exclude generated/config files
        '**/*.config.{ts,js}',
        '**/tailwind.config.ts',
        '**/postcss.config.js',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/lib': path.resolve(__dirname, './src/lib'),
    },
  },
});
```

**Changes**:
- ✅ Already has Vitest installed
- ➕ Add globals, jsdom environment
- ➕ Add setup file path
- ➕ Add coverage configuration (70% thresholds)
- ➕ Add path aliases for imports
- ➕ Exclude generated/config files from coverage

#### 1.2 Test Setup & Utilities
**File**: `apps/web/tests/setup.ts` (CREATE)

```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Next.js router
beforeAll(() => {
  vi.mock('next/navigation', () => ({
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
  }));
});

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
```

**File**: `apps/web/tests/helpers/test-utils.tsx` (CREATE)

```typescript
import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from 'next-themes';

// Wrapper with common providers
function AllTheProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      {children}
    </ThemeProvider>
  );
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, { wrapper: AllTheProviders, ...options });
}

// Re-export everything from testing library
export * from '@testing-library/react';
export { renderWithProviders as render };
```

**File**: `apps/web/tests/helpers/mock-supabase.ts` (CREATE)

```typescript
import { vi } from 'vitest';

export function createMockSupabaseClient() {
  return {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
  };
}
```

#### 1.3 Example Unit Tests
**File**: `apps/web/tests/unit/components/button.test.tsx` (CREATE)

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/tests/helpers/test-utils';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();
    const { user } = render(<Button onClick={handleClick}>Click</Button>);
    
    await user.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('renders disabled state', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Phase 2: E2E Testing with Playwright (Days 3-4)

#### 2.1 Enhanced Playwright Configuration
**File**: `playwright.config.ts` (MODIFY)

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'apps/web/tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command: 'pnpm --filter=web run start',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

**Changes**:
- ✅ Update testDir to `apps/web/tests/e2e`
- ➕ Add parallel execution, retries
- ➕ Add trace/screenshot on failure
- ➕ Add mobile Chrome project

#### 2.2 E2E Test Utilities
**File**: `apps/web/tests/e2e/fixtures/auth.ts` (CREATE)

```typescript
import { test as base } from '@playwright/test';
import type { Page } from '@playwright/test';

export type TestUser = {
  email: string;
  password: string;
  id?: string;
};

export const test = base.extend<{
  authenticatedPage: Page;
  testUser: TestUser;
}>({
  testUser: async ({}, use) => {
    // Create test user via API
    const testUser: TestUser = {
      email: `test-${Date.now()}@example.com`,
      password: 'TestPassword123!',
    };
    
    // TODO: Create user via Supabase API
    await use(testUser);
    
    // TODO: Cleanup user after test
  },

  authenticatedPage: async ({ page, testUser }, use) => {
    // Navigate to login
    await page.goto('/login');
    
    // Fill login form
    await page.fill('[name="email"]', testUser.email);
    await page.fill('[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard');
    
    await use(page);
  },
});

export { expect } from '@playwright/test';
```

**File**: `apps/web/tests/e2e/fixtures/database.ts` (CREATE)

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function resetTestDatabase() {
  // Truncate test data tables (except auth.users)
  // TODO: Add table truncation logic
}

export async function seedTestData() {
  // Insert minimal test data
  // TODO: Add seed logic
}
```

#### 2.3 Critical Path E2E Tests
**File**: `apps/web/tests/e2e/auth-flows.spec.ts` (CREATE)

```typescript
import { test, expect } from './fixtures/auth';

test.describe('Authentication Flows', () => {
  test('user can sign up', async ({ page }) => {
    await page.goto('/signup');
    
    const email = `test-${Date.now()}@example.com`;
    await page.fill('[name="email"]', email);
    await page.fill('[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    
    // Should redirect to verification page or dashboard
    await expect(page).toHaveURL(/\/(verify|dashboard)/);
  });

  test('user can log in', async ({ page, testUser }) => {
    await page.goto('/login');
    
    await page.fill('[name="email"]', testUser.email);
    await page.fill('[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/dashboard');
  });

  test('user can log out', async ({ authenticatedPage }) => {
    // Click logout button
    await authenticatedPage.click('[data-testid="logout-button"]');
    
    // Should redirect to home
    await expect(authenticatedPage).toHaveURL('/');
  });

  test('unauthenticated user cannot access protected routes', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });
});
```

### Phase 3: RLS Testing (Day 4)

#### 3.1 RLS Test Helpers
**File**: `apps/web/tests/rls/helpers.ts` (CREATE)

```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export function createTestUser(userId: string): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
    global: {
      headers: {
        // Impersonate user for RLS testing
        'X-Test-User-Id': userId,
      },
    },
  });
}

export function createAdminClient(): SupabaseClient {
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function createTestData(adminClient: SupabaseClient, userId: string) {
  // Insert test data owned by user
  const { data, error } = await adminClient
    .from('test_table')
    .insert({ user_id: userId, name: 'Test Data' })
    .select()
    .single();
    
  if (error) throw error;
  return data;
}
```

#### 3.2 RLS Policy Tests
**File**: `apps/web/tests/rls/user-isolation.test.ts` (CREATE)

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { createTestUser, createAdminClient, createTestData } from './helpers';

describe('RLS: User Data Isolation', () => {
  const adminClient = createAdminClient();
  const user1Id = 'user-1-test-id';
  const user2Id = 'user-2-test-id';
  
  let user1Data: any;
  let user2Data: any;

  beforeEach(async () => {
    // Create test data for both users
    user1Data = await createTestData(adminClient, user1Id);
    user2Data = await createTestData(adminClient, user2Id);
  });

  it('user can only read their own data', async () => {
    const user1Client = createTestUser(user1Id);
    
    const { data, error } = await user1Client
      .from('test_table')
      .select()
      .eq('id', user1Data.id)
      .single();
    
    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.user_id).toBe(user1Id);
  });

  it('user cannot read other user data', async () => {
    const user1Client = createTestUser(user1Id);
    
    const { data, error } = await user1Client
      .from('test_table')
      .select()
      .eq('id', user2Data.id)
      .single();
    
    expect(data).toBeNull();
    expect(error).toBeDefined();
  });

  it('user cannot update other user data', async () => {
    const user1Client = createTestUser(user1Id);
    
    const { error } = await user1Client
      .from('test_table')
      .update({ name: 'Hacked!' })
      .eq('id', user2Data.id);
    
    expect(error).toBeDefined();
  });
});
```

### Phase 4: Chrome DevTools MCP Integration (Day 5)

#### 4.1 MCP Server Configuration
**File**: `.claude/mcp-servers.json` (MODIFY or CREATE)

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["chrome-devtools-mcp@latest"]
    }
  }
}
```

#### 4.2 Visual Validation Documentation
**File**: `apps/web/tests/README.md` (CREATE - Documentation Section)

```markdown
## AI-Powered Visual Validation

### Chrome DevTools MCP Setup

The Chrome DevTools MCP allows AI (Claude) to control Chrome and inspect the browser state during testing.

**Capabilities**:
- Take screenshots and compare visual states
- Inspect DOM/CSS to catch layout issues
- Analyze network requests and performance
- Verify user flows work visually

**Usage**:
1. Ensure Chrome DevTools MCP is configured in Claude Code
2. Ask Claude to "verify the login page layout"
3. Claude will:
   - Launch Chrome
   - Navigate to the page
   - Take screenshots
   - Inspect DOM structure
   - Report visual issues

**Example Prompts**:
- "Verify the dashboard layout is correct"
- "Check if the button alignment is correct on mobile"
- "Analyze the performance of the homepage"
- "Take screenshots of all auth flows"
```

### Phase 5: CI/CD Integration (Day 6)

#### 5.1 GitHub Actions Updates
**File**: `.github/workflows/ci.yml` (MODIFY)

Add coverage reporting to existing test job:

```yaml
# In the existing "ci" job, after "Unit tests" step:

- name: Unit tests with coverage
  if: env.IS_INFRA_CHANGE != 'true'
  run: pnpm --filter=web run test:unit --coverage

- name: Upload coverage to Codecov
  if: env.IS_INFRA_CHANGE != 'true'
  uses: codecov/codecov-action@v4
  with:
    files: ./apps/web/coverage/lcov.info
    flags: unittests
    fail_ci_if_error: true

- name: Check coverage thresholds
  if: env.IS_INFRA_CHANGE != 'true'
  run: |
    pnpm --filter=web run test:unit --coverage --run
    # Vitest will fail if coverage below 70%
```

#### 5.2 Pre-Push Hook Setup
**File**: `.husky/pre-push` (CREATE)

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🧪 Running tests before push..."

# Run fast unit tests only (<30s target)
pnpm --filter=web run test:unit --run

if [ $? -ne 0 ]; then
  echo "❌ Tests failed. Fix issues before pushing."
  echo "💡 Bypass with: git push --no-verify (CI will still validate)"
  exit 1
fi

echo "✅ Tests passed!"
```

**File**: `package.json` (MODIFY - Add husky setup)

```json
{
  "scripts": {
    "prepare": "husky install"
  },
  "devDependencies": {
    "husky": "^9.0.11"
  }
}
```

#### 5.3 Turbo Configuration Updates
**File**: `turbo.json` (MODIFY)

```json
{
  "tasks": {
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"],
      "cache": false
    },
    "test:unit": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"],
      "cache": false
    },
    "test:e2e": {
      "dependsOn": ["build"],
      "outputs": ["test-results/**", "playwright-report/**"],
      "cache": false
    }
  }
}
```

**Changes**:
- ✅ Already has test tasks
- ➕ Add `cache: false` for test tasks (ensure fresh runs)
- ➕ Add E2E outputs for Playwright results

### Phase 6: Documentation & Examples (Day 7)

#### 6.1 Testing Guide
**File**: `apps/web/tests/README.md` (CREATE)

```markdown
# Testing Guide

## Overview

This project uses a comprehensive testing strategy with three layers:

1. **Unit/Integration Tests** (Vitest + React Testing Library)
2. **E2E Tests** (Playwright)
3. **RLS Policy Tests** (Vitest + Supabase)

## Quick Start

```bash
# Run all tests
pnpm test

# Run unit tests only (fast, <30s)
pnpm --filter=web test:unit

# Run E2E tests
pnpm test:e2e

# Run with coverage
pnpm --filter=web test:unit --coverage

# Watch mode
pnpm --filter=web test -- --watch
```

## Writing Tests

### Unit Tests

Location: `apps/web/src/**/*.test.tsx` or `apps/web/tests/unit/**/*.test.tsx`

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/tests/helpers/test-utils';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### E2E Tests

Location: `apps/web/tests/e2e/**/*.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test('user can complete flow', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Get Started');
  await expect(page).toHaveURL('/signup');
});
```

### RLS Tests

Location: `apps/web/tests/rls/**/*.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { createTestUser } from './helpers';

describe('RLS: Table Policies', () => {
  it('user can only access own data', async () => {
    const client = createTestUser('user-id');
    const { data } = await client.from('table').select();
    expect(data).toHaveLength(1);
  });
});
```

## Coverage Requirements

- **Minimum**: 70% coverage (lines, functions, statements)
- **Focus**: Critical paths (auth, data access, payment flows)
- **Exclusions**: Config files, generated code, test files

## CI/CD

### Local (Pre-Push Hook)
- Runs unit tests automatically before `git push`
- Target: <30 seconds
- Bypass: `git push --no-verify` (CI still validates)

### CI (GitHub Actions)
- Unit tests: <1 minute
- E2E tests: <2 minutes
- Total: <3 minutes
- Merge blocked if tests fail

## Test Data Management

### Ephemeral Reset Pattern
- Database resets before each test
- Test data created via API during setup
- Automatic cleanup on next reset

### Best Practices
1. Create minimal test data
2. Use factories for consistent data
3. Don't rely on existing data
4. Clean up after yourself

## Debugging

### Failed Unit Tests
```bash
# Run specific test file
pnpm vitest src/components/MyComponent.test.tsx

# Run in watch mode
pnpm vitest --watch

# Debug in VS Code
# Add breakpoint, use "Debug Test" code lens
```

### Failed E2E Tests
```bash
# Run with UI
pnpm dlx playwright test --ui

# Run specific test
pnpm dlx playwright test auth-flows

# View last run report
pnpm dlx playwright show-report
```

## AI-Powered Visual Validation

See [Chrome DevTools MCP section](#ai-powered-visual-validation) above.

## Common Patterns

### Testing Authenticated Routes
```typescript
import { test } from './fixtures/auth';

test('protected route', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/dashboard');
  // Already logged in!
});
```

### Mocking Supabase
```typescript
import { createMockSupabaseClient } from '@/tests/helpers/mock-supabase';

const mockSupabase = createMockSupabaseClient();
// Use in tests
```

### Testing Forms
```typescript
import { userEvent } from '@testing-library/user-event';

it('submits form', async () => {
  const user = userEvent.setup();
  render(<MyForm />);
  
  await user.type(screen.getByLabelText('Email'), 'test@example.com');
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  
  expect(screen.getByText('Success')).toBeInTheDocument();
});
```
```

---

## File Changes Required

### Files to CREATE (18 new files)

1. **Test Setup & Utilities**:
   - `apps/web/tests/setup.ts` - Vitest global setup
   - `apps/web/tests/helpers/test-utils.tsx` - React Testing Library wrapper
   - `apps/web/tests/helpers/mock-supabase.ts` - Supabase client mocks
   - `apps/web/tests/helpers/test-factories.ts` - Test data factories

2. **Unit Tests**:
   - `apps/web/tests/unit/components/button.test.tsx` - Example component test
   - `apps/web/tests/unit/lib/utils.test.ts` - Example utility test

3. **E2E Tests**:
   - `apps/web/tests/e2e/fixtures/auth.ts` - Auth test fixtures
   - `apps/web/tests/e2e/fixtures/database.ts` - Database helpers
   - `apps/web/tests/e2e/auth-flows.spec.ts` - Auth E2E tests
   - `apps/web/tests/e2e/protected-routes.spec.ts` - Route protection tests

4. **RLS Tests**:
   - `apps/web/tests/rls/helpers.ts` - RLS testing utilities
   - `apps/web/tests/rls/user-isolation.test.ts` - User isolation tests

5. **Documentation**:
   - `apps/web/tests/README.md` - Comprehensive testing guide

6. **Git Hooks**:
   - `.husky/pre-push` - Pre-push test hook
   - `.husky/_/.gitignore` - Husky internals

7. **Configuration**:
   - `.claude/mcp-servers.json` - Chrome DevTools MCP config
   - `scripts/pretest-env-check.ts` - Environment validation (UPDATE if exists)

8. **CI/CD Scripts**:
   - `scripts/test-setup.ts` - CI test database setup

### Files to MODIFY (5 files)

1. **`apps/web/vitest.config.ts`**
   - Add globals, jsdom environment
   - Add coverage configuration (70% thresholds)
   - Add path aliases
   - Add setupFiles

2. **`playwright.config.ts`**
   - Update testDir to `apps/web/tests/e2e`
   - Add parallel execution, retries
   - Add trace/screenshot on failure
   - Add mobile Chrome project

3. **`turbo.json`**
   - Add `cache: false` to test tasks
   - Add E2E outputs for Playwright

4. **`package.json` (root)**
   - Add husky to devDependencies
   - Add "prepare": "husky install" script

5. **`.github/workflows/ci.yml`**
   - Add coverage upload step
   - Add coverage threshold check
   - Update test commands

---

## Testing Strategy (TDD Order)

Following best practices, implement tests in this order:

### 1. **Contracts First** (RLS Policies)
- Define what data access should/shouldn't be allowed
- Write RLS policy tests
- Verify security boundaries

### 2. **Integration Tests** (E2E Critical Paths)
- Auth flows (signup, login, logout)
- Protected route access
- Core user workflows

### 3. **Unit Tests** (Components & Logic)
- UI components (Button, Input, Card)
- Utility functions
- Hooks and business logic

### 4. **Visual Validation** (Chrome DevTools MCP)
- Layout correctness
- Performance analysis
- Accessibility checks

**Rationale**: Security first (RLS), then critical paths (E2E), then granular logic (Unit). Visual validation complements all layers.

---

## Security Considerations

### 1. Test Data Isolation
- ✅ Use separate test database (Supabase local)
- ✅ Reset database before each test
- ✅ No production data in tests
- ✅ Use ephemeral test users

### 2. RLS Policy Validation
- ✅ Test user cannot access other user data
- ✅ Test anonymous users have no access
- ✅ Test admin roles have appropriate access
- ⚠️ **Critical**: RLS tests run in CI (blocking)

### 3. Secret Management
- ✅ Test env vars separate from production
- ✅ Mock external APIs (Stripe, email)
- ✅ No real credentials in test code
- ✅ Use `.env.test.local` (gitignored)

### 4. Chrome DevTools MCP
- ✅ MCP server runs locally only
- ✅ No sensitive data sent to external services
- ✅ Screenshots stored locally, not committed

---

## Dependencies

### New Dependencies (4)

```json
{
  "devDependencies": {
    "husky": "^9.0.11",
    "@vitest/ui": "^3.2.4",
    "chrome-devtools-mcp": "latest",
    "@supabase/supabase-js": "^2.x.x" // For RLS testing
  }
}
```

**Justification**:
- **husky**: Pre-push hook management (industry standard)
- **@vitest/ui**: Visual test runner (DX improvement)
- **chrome-devtools-mcp**: AI visual validation (strategic, bleeding-edge)
- **@supabase/supabase-js**: RLS testing (already used in app)

### Existing Dependencies (Leverage)
- ✅ Vitest 3.2.4
- ✅ Playwright 1.55.1
- ✅ @testing-library/react 16.3.0
- ✅ @testing-library/jest-dom 6.8.0
- ✅ jsdom 27.0.0

---

## Risks & Mitigation

### Risk 1: Test Execution Time Exceeds Targets
**Impact**: Developer frustration, pre-push hooks bypassed
**Likelihood**: Medium
**Mitigation**:
- Profile slow tests and optimize
- Run only unit tests in pre-push (<30s)
- Move slower tests to CI only
- Use Playwright sharding for parallel E2E

### Risk 2: Flaky E2E Tests
**Impact**: False failures, CI instability
**Likelihood**: Medium
**Mitigation**:
- Use Playwright auto-wait (built-in)
- Set appropriate timeouts (30s max)
- Retry flaky tests (2 retries in CI)
- Use data-testid for stable selectors

### Risk 3: Coverage Threshold Too Strict
**Impact**: Blocks legitimate PRs, slows velocity
**Likelihood**: Low
**Mitigation**:
- Start with 70% (achievable)
- Exclude generated/config files
- Focus on critical paths (80% of effort)
- Review and adjust quarterly

### Risk 4: Chrome DevTools MCP Learning Curve
**Impact**: Team doesn't adopt, value unrealized
**Likelihood**: Medium
**Mitigation**:
- Comprehensive documentation
- Example use cases in README
- Demo video in onboarding
- Optional (doesn't block other tests)

### Risk 5: Test Database Conflicts
**Impact**: Test failures, data pollution
**Likelihood**: Low
**Mitigation**:
- Use Supabase local (isolated)
- Reset before each test (ephemeral)
- Unique test user IDs (timestamp-based)
- Parallel-safe test design

---

## Implementation Checklist

### Phase 1: Unit & Integration Testing (Days 1-2)
- [ ] Update `apps/web/vitest.config.ts` with coverage config
- [ ] Create `apps/web/tests/setup.ts`
- [ ] Create test helper utilities (`test-utils.tsx`, `mock-supabase.ts`)
- [ ] Write example unit tests (Button, utils)
- [ ] Verify coverage thresholds work
- [ ] Document unit testing patterns

### Phase 2: E2E Testing (Days 3-4)
- [ ] Update `playwright.config.ts` with enhanced config
- [ ] Create E2E fixtures (auth, database)
- [ ] Write auth flow E2E tests
- [ ] Write protected route tests
- [ ] Verify E2E tests pass locally
- [ ] Document E2E patterns

### Phase 3: RLS Testing (Day 4)
- [ ] Create RLS test helpers
- [ ] Write user isolation tests
- [ ] Write role permission tests
- [ ] Verify RLS tests catch violations
- [ ] Document RLS testing patterns

### Phase 4: Chrome DevTools MCP (Day 5)
- [ ] Add MCP server config to `.claude/mcp-servers.json`
- [ ] Document visual validation capabilities
- [ ] Create example visual validation scenarios
- [ ] Test AI can control browser
- [ ] Document best practices

### Phase 5: CI/CD Integration (Day 6)
- [ ] Install husky: `pnpm add -D husky`
- [ ] Setup husky: `pnpm husky install`
- [ ] Create `.husky/pre-push` hook
- [ ] Update GitHub Actions workflow
- [ ] Add coverage upload to Codecov
- [ ] Verify tests run in CI (<3min)
- [ ] Verify pre-push hook works (<30s)

### Phase 6: Documentation (Day 7)
- [ ] Create comprehensive `apps/web/tests/README.md`
- [ ] Document all test types and patterns
- [ ] Add troubleshooting guide
- [ ] Add AI visual validation guide
- [ ] Create PR with full implementation
- [ ] Update main README with test commands

---

## Success Metrics

### Immediate (Post-Implementation)
- ✅ 70% test coverage achieved
- ✅ All critical paths have E2E tests
- ✅ RLS policies validated
- ✅ Pre-push hook runs in <30s
- ✅ CI runs full suite in <3min
- ✅ Chrome DevTools MCP configured

### Short-Term (1 month)
- 📈 Test coverage increases to 75%+
- 📉 Production bug rate decreases by 50%
- 📉 PR review time decreases (confidence in tests)
- 📈 Developer confidence in deployments increases

### Long-Term (3 months)
- 📈 Test coverage reaches 80%+
- 📉 Production incidents decrease by 70%
- 📈 Feature velocity increases (less manual testing)
- 📈 Team adopts AI visual validation

---

## Next Steps

1. ✅ **Review this plan** with team/stakeholders
2. ➡️ **Run `/tasks`** to break down into concrete implementation tasks
3. ➡️ **Begin Phase 1** implementation (Unit & Integration Testing)

---

## References

- **Specification**: [feature-004-testing-infrastructure.md](../specs/feature-004-testing-infrastructure.md)
- **GitHub Issue**: #108
- **Research**: 2025 best practices (coverage, data management, pre-push hooks)
- **Chrome DevTools MCP**: https://developer.chrome.com/blog/chrome-devtools-mcp
- **Vitest Docs**: https://vitest.dev
- **Playwright Docs**: https://playwright.dev
