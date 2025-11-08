/* eslint-disable react-hooks/rules-of-hooks */

import type { Page } from '@playwright/test';
import { test as base } from '@playwright/test';

export type TestUser = {
  email: string;
  password: string;
  id?: string;
};

/**
 * Auth fixture for E2E tests
 * Provides authenticated page and test user creation
 */
export const test = base.extend<{
  authenticatedPage: Page;
  testUser: TestUser;
}>({
  /**
   * Creates a unique test user for each test
   * Password meets Supabase requirements: 8+ chars, uppercase, lowercase, number, symbol
   */
  testUser: async (_, use) => {
    const testUser: TestUser = {
      email: `test-${Date.now()}@example.com`,
      password: 'TestPassword123!', // Meets Supabase password requirements
    };

    await use(testUser);

    // Note: Cleanup handled by database reset between test runs
    // Local Supabase can be reset with: supabase db reset
  },

  /**
   * Provides an authenticated page by:
   * 1. Creating a test user via sign-up flow
   * 2. Waiting for successful authentication
   * 3. Verifying redirect to dashboard
   */
  authenticatedPage: async ({ page, testUser }, use) => {
    // Navigate to sign-up page
    await page.goto('/signup');

    // Fill sign-up form
    await page.fill('[name="email"]', testUser.email);
    await page.fill('[name="password"]', testUser.password);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for redirect after successful sign-up
    // Supabase auto-confirms in local dev, so we should land on / or /dashboard
    await page.waitForURL((url) => url.pathname === '/' || url.pathname === '/dashboard', {
      timeout: 10000,
    });

    // Provide the authenticated page to the test
    await use(page);

    // Logout after test (cleanup)
    try {
      await page.goto('/dashboard');
      // Click sign out button if it exists
      const signOutButton = page.locator('button:has-text("Sign out")');
      if (await signOutButton.isVisible()) {
        await signOutButton.click();
      }
    } catch {
      // If logout fails, that's okay - session will be cleared by browser context cleanup
    }
  },
});

export { expect } from '@playwright/test';
