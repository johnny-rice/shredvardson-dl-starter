---
id: TASK-20251003-testing-infrastructure
type: task
parentId: PLAN-20251003-testing-infrastructure
issue: 108
plan: PLAN-20251003-testing-infrastructure
spec: SPEC-20251003-testing-infrastructure
branch: feature/108-testing-infrastructure
source: https://github.com/Shredvardson/dl-starter/issues/108
---

# Implementation Tasks: Testing Infrastructure

**Task ID**: 004
**Plan**: [plan-004-testing-infrastructure.md](../plans/plan-004-testing-infrastructure.md)
**Specification**: [feature-004-testing-infrastructure.md](../specs/feature-004-testing-infrastructure.md)
**Branch**: `feature/108-testing-infrastructure`
**Created**: 2025-10-03

---

## Implementation Strategy

Following constitutional TDD order:

1. **Contracts & Interfaces** → Define what should work
2. **Test Foundation** → Integration → E2E → Unit tests
3. **Implementation** → Make tests pass
4. **Integration & Polish** → CI/CD, hooks, tooling
5. **Documentation & Release** → Guides, examples, PR

**Estimated Effort**: 5-7 days (High complexity)

---

## Phase 1: Contracts & Interfaces (Day 1 - Morning)

### Task 1.1: Define Test Coverage Contract

**Effort**: 30 min | **Priority**: P0

Define what "70% coverage" means for this codebase.

**Acceptance Criteria**:

- [ ] Coverage thresholds documented (lines: 70%, functions: 70%, branches: 65%, statements: 70%)
- [ ] Excluded files list defined (generated, config, test files)
- [ ] Critical paths identified (auth, data access, RLS)
- [ ] Risk-based testing strategy documented

**Files**:

- `apps/web/vitest.config.ts` (prepare structure)
- `docs/testing/coverage-contract.md` (create documentation)

**Command**:

```bash
# Document coverage contract
mkdir -p docs/testing
cat > docs/testing/coverage-contract.md << 'DOC'
# Coverage Contract

## Thresholds
- Lines: 70%
- Functions: 70%
- Branches: 65%
- Statements: 70%

## Excluded
- **/*.test.{ts,tsx}
- **/*.config.{ts,js}
- **/tests/**
- **/.next/**

## Critical Paths (80% of effort)
- Auth flows
- Data access (RLS)
- Core workflows
DOC
```

---

### Task 1.2: Define RLS Policy Contracts

**Effort**: 1 hour | **Priority**: P0

Define security boundaries that RLS policies must enforce.

**Acceptance Criteria**:

- [ ] User isolation rules documented (users can only access own data)
- [ ] Role permission rules documented (owner/admin/member capabilities)
- [ ] Anonymous access rules documented (no data access)
- [ ] Test scenarios outlined

**Files**:

- `apps/web/tests/rls/contracts.md` (create)

**Command**:

```bash
mkdir -p apps/web/tests/rls
cat > apps/web/tests/rls/contracts.md << 'DOC'
# RLS Policy Contracts

## User Isolation
- User MUST only read own data
- User CANNOT read other user data
- User CANNOT update other user data
- User CANNOT delete other user data

## Role Permissions
- Owner: Full access to org data
- Admin: Read/write org data, cannot delete org
- Member: Read org data, limited writes

## Anonymous Access
- Anonymous users have NO data access
- All queries must fail for unauthenticated users
DOC
```

---

### Task 1.3: Define E2E Test Contracts

**Effort**: 1 hour | **Priority**: P0

Define critical user flows that must work end-to-end.

**Acceptance Criteria**:

- [ ] Auth flows documented (signup, login, logout)
- [ ] Protected route flows documented
- [ ] CRUD operation flows documented
- [ ] Error handling flows documented

**Files**:

- `apps/web/tests/e2e/contracts.md` (create)

**Command**:

```bash
mkdir -p apps/web/tests/e2e
cat > apps/web/tests/e2e/contracts.md << 'DOC'
# E2E Test Contracts

## Auth Flows
1. User can sign up with valid email/password
2. User can log in with credentials
3. User can log out
4. Unauthenticated user redirected from protected routes

## Protected Routes
1. /dashboard requires authentication
2. /settings requires authentication
3. Public routes accessible without auth

## Error Handling
1. Invalid credentials show error
2. Network errors handled gracefully
DOC
```

---

## Phase 2: Test Foundation (Day 1 Afternoon - Day 2)

### Task 2.1: Setup Vitest Configuration

**Effort**: 1 hour | **Priority**: P0

Configure Vitest with coverage thresholds and test environment.

**Acceptance Criteria**:

- [ ] Vitest config updated with jsdom environment
- [ ] Coverage thresholds configured (70% minimum)
- [ ] Path aliases configured
- [ ] Setup file configured

**Files**:

- `apps/web/vitest.config.ts` (modify)

**Implementation**:

```typescript
// apps/web/vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'tests/unit/**/*.test.{ts,tsx}'],
    exclude: ['e2e/**', 'tests/e2e/**', 'node_modules/**', '.next/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 65,
        statements: 70,
      },
      exclude: ['**/*.test.{ts,tsx}', '**/*.config.{ts,js}', '**/tests/**', '**/.next/**'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

---

### Task 2.2: Create Test Setup & Utilities

**Effort**: 1.5 hours | **Priority**: P0

Create test setup file and reusable test utilities.

**Acceptance Criteria**:

- [ ] Vitest setup file created with Jest DOM
- [ ] Next.js router mocked
- [ ] Test utils with provider wrapper created
- [ ] Supabase client mock created

**Files**:

- `apps/web/tests/setup.ts` (create)
- `apps/web/tests/helpers/test-utils.tsx` (create)
- `apps/web/tests/helpers/mock-supabase.ts` (create)

**Implementation**: See plan section 1.2

---

### Task 2.3: Setup Playwright E2E Configuration

**Effort**: 1 hour | **Priority**: P0

Enhance Playwright config for E2E testing.

**Acceptance Criteria**:

- [ ] Playwright config updated with parallel execution
- [ ] Retries configured for CI
- [ ] Trace/screenshot on failure configured
- [ ] Mobile Chrome project added

**Files**:

- `playwright.config.ts` (modify)

**Implementation**: See plan section 2.1

---

### Task 2.4: Create E2E Test Fixtures

**Effort**: 2 hours | **Priority**: P0

Create reusable E2E test fixtures for auth and database.

**Acceptance Criteria**:

- [ ] Auth fixture created (authenticated page)
- [ ] Test user fixture created
- [ ] Database reset helper created
- [ ] Seed data helper created

**Files**:

- `apps/web/tests/e2e/fixtures/auth.ts` (create)
- `apps/web/tests/e2e/fixtures/database.ts` (create)

**Implementation**: See plan section 2.2

---

### Task 2.5: Create RLS Test Helpers

**Effort**: 1.5 hours | **Priority**: P0

Create helpers for testing RLS policies.

**Acceptance Criteria**:

- [ ] Test user impersonation helper created
- [ ] Admin client helper created
- [ ] Test data creation helper created

**Files**:

- `apps/web/tests/rls/helpers.ts` (create)

**Implementation**: See plan section 3.1

---

## Phase 3: Implementation - Write Tests (Day 3-4)

### Task 3.1: Write RLS Policy Tests (TDD: Contracts First)

**Effort**: 3 hours | **Priority**: P0

Write tests for RLS policy enforcement (security critical).

**Acceptance Criteria**:

- [ ] User isolation tests written and failing
- [ ] Role permission tests written and failing
- [ ] Anonymous access tests written and failing
- [ ] Tests document expected behavior

**Files**:

- `apps/web/tests/rls/user-isolation.test.ts` (create)
- `apps/web/tests/rls/role-permissions.test.ts` (create)

**Implementation**: See plan section 3.2

**Note**: Tests will fail until RLS policies are implemented. This is expected (TDD).

---

### Task 3.2: Write Auth Flow E2E Tests

**Effort**: 3 hours | **Priority**: P0

Write E2E tests for authentication flows.

**Acceptance Criteria**:

- [ ] Signup flow test written
- [ ] Login flow test written
- [ ] Logout flow test written
- [ ] Protected route test written
- [ ] Tests run against local app

**Files**:

- `apps/web/tests/e2e/auth-flows.spec.ts` (create)

**Implementation**: See plan section 2.3

---

### Task 3.3: Write Protected Route E2E Tests

**Effort**: 2 hours | **Priority**: P1

Write E2E tests for route protection.

**Acceptance Criteria**:

- [ ] Unauthenticated redirect test written
- [ ] Authenticated access test written
- [ ] Session persistence test written

**Files**:

- `apps/web/tests/e2e/protected-routes.spec.ts` (create)

---

### Task 3.4: Write Component Unit Tests (Examples)

**Effort**: 2 hours | **Priority**: P1

Write example unit tests for components.

**Acceptance Criteria**:

- [ ] Button component tests written
- [ ] Input component tests written
- [ ] Card component tests written
- [ ] Tests use testing-library best practices

**Files**:

- `apps/web/tests/unit/components/button.test.tsx` (create)
- `apps/web/tests/unit/components/input.test.tsx` (create)
- `apps/web/tests/unit/components/card.test.tsx` (create)

**Implementation**: See plan section 1.3

---

### Task 3.5: Write Utility Function Tests

**Effort**: 1.5 hours | **Priority**: P2

Write tests for utility functions.

**Acceptance Criteria**:

- [ ] Form validation tests written
- [ ] Date formatting tests written
- [ ] String manipulation tests written

**Files**:

- `apps/web/tests/unit/lib/utils.test.ts` (create)

---

## Phase 4: Integration & Polish (Day 5-6)

### Task 4.1: Install and Configure Husky

**Effort**: 30 min | **Priority**: P0

Setup pre-push hooks with Husky.

**Acceptance Criteria**:

- [ ] Husky installed
- [ ] Pre-push hook created
- [ ] Hook runs unit tests (<30s)
- [ ] Bypass with --no-verify works

**Commands**:

```bash
pnpm add -D husky
pnpm husky install
mkdir -p .husky
cat > .husky/pre-push << 'HOOK'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🧪 Running tests before push..."
pnpm --filter=web run test:unit --run

if [ $? -ne 0 ]; then
  echo "❌ Tests failed. Fix issues before pushing."
  echo "💡 Bypass with: git push --no-verify (CI will still validate)"
  exit 1
fi
echo "✅ Tests passed!"
HOOK
chmod +x .husky/pre-push
```

**Files**:

- `.husky/pre-push` (create)
- `package.json` (add "prepare": "husky install")

---

### Task 4.2: Setup Chrome DevTools MCP

**Effort**: 1 hour | **Priority**: P2

Configure Chrome DevTools MCP for AI visual validation.

**Acceptance Criteria**:

- [ ] MCP server config created
- [ ] Chrome DevTools MCP documented
- [ ] Example usage provided
- [ ] Test AI can control browser

**Files**:

- `.claude/mcp-servers.json` (create or modify)

**Implementation**:

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

---

### Task 4.3: Update CI/CD Workflow

**Effort**: 2 hours | **Priority**: P0

Update GitHub Actions to run tests and upload coverage.

**Acceptance Criteria**:

- [ ] Unit tests run in CI job
- [ ] E2E tests run in separate job
- [ ] Coverage uploaded to Codecov
- [ ] Coverage thresholds enforced
- [ ] Total CI time < 3 minutes

**Files**:

- `.github/workflows/ci.yml` (modify)

**Implementation**: Add after existing unit test step:

```yaml
- name: Unit tests with coverage
  if: env.IS_INFRA_CHANGE != 'true'
  run: pnpm --filter=web run test:unit --coverage

- name: Upload coverage
  if: env.IS_INFRA_CHANGE != 'true'
  uses: codecov/codecov-action@v4
  with:
    files: ./apps/web/coverage/lcov.info
    fail_ci_if_error: true
```

---

### Task 4.4: Update Turbo Configuration

**Effort**: 15 min | **Priority**: P1

Update Turbo to handle test task caching.

**Acceptance Criteria**:

- [ ] Test tasks have `cache: false`
- [ ] E2E outputs configured
- [ ] Dependencies configured

**Files**:

- `turbo.json` (modify)

**Implementation**:

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

---

### Task 4.5: Add Test Scripts to Package.json

**Effort**: 15 min | **Priority**: P1

Ensure all test scripts are properly configured.

**Acceptance Criteria**:

- [ ] `test:unit` script exists
- [ ] `test:e2e` script exists
- [ ] `test:coverage` script exists
- [ ] `test:watch` script exists

**Files**:

- `apps/web/package.json` (verify/update)

---

## Phase 5: Documentation & Release (Day 7)

### Task 5.1: Create Comprehensive Testing Guide

**Effort**: 3 hours | **Priority**: P0

Write complete testing documentation.

**Acceptance Criteria**:

- [ ] Testing guide covers all test types
- [ ] Quick start commands documented
- [ ] Writing tests examples provided
- [ ] Debugging guide included
- [ ] AI visual validation documented
- [ ] Common patterns documented

**Files**:

- `apps/web/tests/README.md` (create)

**Implementation**: See plan section 6.1

---

### Task 5.2: Create Test Examples & Templates

**Effort**: 2 hours | **Priority**: P1

Provide copy-paste examples for common scenarios.

**Acceptance Criteria**:

- [ ] Component test template
- [ ] E2E test template
- [ ] RLS test template
- [ ] Form test example
- [ ] API test example

**Files**:

- `apps/web/tests/examples/` (create directory with templates)

---

### Task 5.3: Update Main README

**Effort**: 30 min | **Priority**: P1

Update project README with testing info.

**Acceptance Criteria**:

- [ ] Testing section added
- [ ] Test commands documented
- [ ] Coverage badge added (if using Codecov)
- [ ] Link to testing guide

**Files**:

- `README.md` (modify)

---

### Task 5.4: Run Full Test Suite & Validate

**Effort**: 1 hour | **Priority**: P0

Validate entire testing infrastructure works.

**Acceptance Criteria**:

- [ ] All unit tests pass
- [ ] All E2E tests pass
- [ ] RLS tests pass
- [ ] Coverage meets 70% threshold
- [ ] Pre-push hook works (<30s)
- [ ] CI passes (<3min)

**Commands**:

```bash
# Run all tests locally
pnpm test:unit --coverage
pnpm test:e2e

# Test pre-push hook
git add .
git commit -m "test: validate testing infrastructure"
git push  # Should trigger hook

# Verify CI passes
# Check GitHub Actions
```

---

### Task 5.5: Create Pull Request

**Effort**: 30 min | **Priority**: P0

Create PR with comprehensive description.

**Acceptance Criteria**:

- [ ] PR created with testing infrastructure changes
- [ ] Description includes test coverage stats
- [ ] Description includes implementation summary
- [ ] All CI checks passing
- [ ] Screenshots/demo of test runs included

**Commands**:

```bash
gh pr create --title "feat: implement comprehensive testing infrastructure" \
  --body "$(cat <<'PR_BODY'
## Summary
Implements comprehensive testing infrastructure addressing P0 blocker (Issue #108).

## Implementation
- ✅ Unit/Integration tests (Vitest + React Testing Library)
- ✅ E2E tests (Playwright)
- ✅ RLS policy tests (Supabase)
- ✅ Pre-push hooks (Husky, <30s)
- ✅ CI/CD integration (<3min)
- ✅ Chrome DevTools MCP (AI visual validation)
- ✅ 70% coverage threshold enforced

## Test Coverage
- Lines: XX%
- Functions: XX%
- Branches: XX%
- Statements: XX%

## Test Execution Times
- Local (pre-push): XXs
- CI (full suite): XXm XXs

## Files Changed
- 18 files created (tests, fixtures, config, docs)
- 5 files modified (vitest, playwright, CI, turbo, package.json)

## Breaking Changes
None

## Testing
- [x] All unit tests pass
- [x] All E2E tests pass
- [x] RLS tests pass
- [x] Coverage thresholds met
- [x] Pre-push hook works
- [x] CI passes

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
PR_BODY
)"
```

---

## Task Summary

### By Phase

| Phase                    | Tasks   | Effort     | Priority |
| ------------------------ | ------- | ---------- | -------- |
| Phase 1: Contracts       | 3 tasks | 2.5 hours  | P0       |
| Phase 2: Test Foundation | 5 tasks | 7 hours    | P0       |
| Phase 3: Implementation  | 5 tasks | 11.5 hours | P0-P2    |
| Phase 4: Integration     | 5 tasks | 4 hours    | P0-P2    |
| Phase 5: Documentation   | 5 tasks | 7 hours    | P0-P1    |

**Total**: 23 tasks, ~32 hours (~5-7 days with testing/debugging)

### Critical Path (Must Complete)

1. Phase 1: All contract tasks (2.5h)
2. Task 2.1-2.2: Vitest setup (2.5h)
3. Task 2.5: RLS helpers (1.5h)
4. Task 3.1: RLS tests (3h)
5. Task 2.3-2.4: E2E setup (3h)
6. Task 3.2: Auth E2E tests (3h)
7. Task 4.1: Pre-push hooks (0.5h)
8. Task 4.3: CI/CD (2h)
9. Task 5.1: Documentation (3h)
10. Task 5.4-5.5: Validation & PR (1.5h)

**Critical Path Total**: ~22 hours

---

## Implementation Commands

### Quick Start

```bash
# Ensure on feature branch
git checkout feature/108-testing-infrastructure

# Start with Phase 1
# Follow tasks 1.1 → 1.2 → 1.3

# Install dependencies as needed
pnpm add -D husky @vitest/ui

# Run tests continuously while developing
pnpm --filter=web test -- --watch
```

### Validation Checkpoints

**After Phase 2** (Test Foundation):

```bash
# Should run without errors (no tests yet)
pnpm --filter=web test:unit
pnpm test:e2e
```

**After Phase 3** (Implementation):

```bash
# Should have passing tests
pnpm --filter=web test:unit --coverage
# Coverage should approach 70%
```

**After Phase 4** (Integration):

```bash
# Pre-push hook should work
git push  # Tests run automatically

# CI should pass
gh pr checks
```

---

## Branch Strategy

**Current Branch**: `feature/108-testing-infrastructure`

**Workflow**:

1. Implement tasks in order (Phase 1 → Phase 5)
2. Commit after each phase completion
3. Push regularly to trigger CI
4. Create PR when Phase 5 complete

**Commit Convention**:

```bash
# Phase commits
git commit -m "test: add coverage contracts and RLS test helpers"
git commit -m "test: implement E2E auth flow tests"
git commit -m "ci: add pre-push hooks and coverage reporting"
git commit -m "docs: add comprehensive testing guide"

# Final commit
git commit -m "feat: complete testing infrastructure implementation"
```

---

## Next Steps

1. ✅ Tasks created and documented
2. ✅ Branch ready: `feature/108-testing-infrastructure`
3. ➡️ **Start with Phase 1, Task 1.1**: Define test coverage contract
4. ➡️ Follow tasks sequentially for TDD approach

**Recommended Command**:

```bash
# Start implementing Phase 1
/dev:implement
```

Or implement manually following the task breakdown above.

---

## References

- **Plan**: [plan-004-testing-infrastructure.md](../plans/plan-004-testing-infrastructure.md)
- **Spec**: [feature-004-testing-infrastructure.md](../specs/feature-004-testing-infrastructure.md)
- **Issue**: #108
- **Branch**: `feature/108-testing-infrastructure`
