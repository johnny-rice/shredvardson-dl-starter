/* eslint-disable react-hooks/rules-of-hooks */

import type { Page } from '@playwright/test';
import { test as base } from '@playwright/test';

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
    // Create test user with unique email
    const testUser: TestUser = {
      email: `test-${Date.now()}@example.com`,
      password: 'TestPassword123!',
    };

    // TODO: Create user via Supabase API when auth is implemented
    await use(testUser);

    // TODO: Cleanup user after test
  },

  authenticatedPage: async ({ page }, use) => {
    // TODO: Implement when /login and /dashboard routes exist
    // For now, just provide the page without authentication
    // When auth is implemented, this should:
    // 1. Navigate to /login
    // 2. Fill email/password form with testUser credentials
    // 3. Submit form
    // 4. Wait for redirect to /dashboard

    await use(page);
  },
});

export { expect } from '@playwright/test';
