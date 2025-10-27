#!/usr/bin/env tsx

/**
 * Scaffolds E2E tests for critical user flows
 *
 * Usage: tsx scaffold-e2e.ts <user_flow>
 * Example: tsx scaffold-e2e.ts auth-signup
 */

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const userFlow = process.argv[2];

if (!userFlow) {
  console.error('Error: User flow name required');
  console.error('Usage: tsx scaffold-e2e.ts <user_flow>');
  process.exit(1);
}

// Validate user flow name (alphanumeric, hyphens, underscores only)
if (!/^[a-zA-Z0-9_-]+$/.test(userFlow)) {
  console.error(
    'Error: User flow name must contain only letters, numbers, hyphens, and underscores'
  );
  process.exit(1);
}

const testDir = join(process.cwd(), 'apps/web/tests/e2e');
const testFile = join(testDir, `${userFlow}.spec.ts`);

if (existsSync(testFile)) {
  console.error(`Error: Test file already exists: ${testFile}`);
  process.exit(1);
}

// Ensure test directory exists
if (!existsSync(testDir)) {
  mkdirSync(testDir, { recursive: true });
}

const template = `import { test, expect } from '@playwright/test';
import { authenticateUser } from './fixtures/auth';

/**
 * E2E tests for ${userFlow}
 *
 * Coverage: Critical user flow
 * Priority: P0
 */

test.describe('${userFlow}', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Navigate to starting page
    await page.goto('/');
  });

  test('happy path: ${userFlow} succeeds', async ({ page }) => {
    // TODO: Implement happy path test
    // 1. Setup preconditions
    // 2. Execute user actions
    // 3. Verify expected outcomes

    throw new Error('Test not implemented');
  });

  test('error handling: ${userFlow} with invalid input', async ({ page }) => {
    // TODO: Implement error handling test
    // 1. Setup error conditions
    // 2. Execute user actions
    // 3. Verify error messages and recovery

    throw new Error('Test not implemented');
  });

  test('loading state: ${userFlow} shows loading indicators', async ({ page }) => {
    // TODO: Implement loading state test
    // 1. Setup slow network conditions
    // 2. Execute user actions
    // 3. Verify loading indicators

    throw new Error('Test not implemented');
  });
});
`;

writeFileSync(testFile, template);

console.log(
  JSON.stringify(
    {
      success: true,
      testFile: testFile.replace(process.cwd(), '.'),
      userFlow,
      nextSteps: [
        'Implement test scenarios in the scaffolded file',
        'Run tests: pnpm --filter=web test:e2e',
        'Add page objects if needed in tests/e2e/pages/',
      ],
      commands: ['pnpm --filter=web test:e2e ' + testFile.replace(process.cwd(), '.')],
    },
    null,
    2
  )
);
