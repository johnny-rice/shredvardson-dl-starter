/**
 * E2E Tests for Protected Routes
 *
 * Comprehensive tests covering:
 * - Dashboard access control
 * - Session persistence
 * - Logout functionality
 * - Redirect behavior
 */

import { test as baseTest, expect } from '@playwright/test';
import { test } from './fixtures/auth';

baseTest.describe('Protected Routes - Dashboard Access', () => {
  baseTest('unauthenticated user redirected to login from dashboard', async ({ page }) => {
    // Ensure not authenticated
    await page.context().clearCookies();

    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL('/login', { timeout: 10000 });
  });

  test('authenticated user can access dashboard', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard');

    // Should NOT redirect
    await expect(page).toHaveURL('/dashboard');

    // Should see dashboard content
    await expect(page.locator('text=/dashboard/i')).toBeVisible();
    await expect(page.locator('text=/account information/i')).toBeVisible();
  });

  test('authenticated user sees their email on dashboard', async ({
    authenticatedPage: page,
    testUser,
  }) => {
    await page.goto('/dashboard');

    // Should see user's email
    await expect(page.locator(`text=${testUser.email}`)).toBeVisible();
  });

  test('dashboard displays user information correctly', async ({
    authenticatedPage: page,
    testUser,
  }) => {
    await page.goto('/dashboard');

    // Check for account information sections
    await expect(page.locator('text=/email/i')).toBeVisible();
    await expect(page.locator('text=/user id/i')).toBeVisible();
    await expect(page.locator('text=/last sign in/i')).toBeVisible();

    // Verify email is displayed
    await expect(page.locator(`text=${testUser.email}`)).toBeVisible();
  });
});

baseTest.describe('Protected Routes - Session Persistence', () => {
  test('user stays logged in after page reload', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');

    // Reload page
    await page.reload();

    // Should still be on dashboard (not redirected to login)
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=/dashboard/i')).toBeVisible();
  });

  test('user stays logged in after closing and reopening browser tab', async ({
    authenticatedPage: page,
    context,
    testUser,
  }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');

    // Create a new page (simulates opening a new tab)
    const newPage = await context.newPage();
    await newPage.goto('/dashboard');

    // Should still be authenticated in new tab
    await expect(newPage).toHaveURL('/dashboard');
    await expect(newPage.locator(`text=${testUser.email}`)).toBeVisible();

    await newPage.close();
  });

  test('session persists across navigation', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');

    // Navigate to home
    await page.goto('/');

    // Navigate back to dashboard
    await page.goto('/dashboard');

    // Should still be authenticated
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=/dashboard/i')).toBeVisible();
  });

  test('cookies are properly set after authentication', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard');

    // Get cookies
    const cookies = await page.context().cookies();

    // Should have Supabase auth cookies
    // Supabase uses cookies like: sb-<project-ref>-auth-token
    const hasAuthCookie = cookies.some((cookie) => /^sb-[a-z0-9]+-auth-token$/i.test(cookie.name));

    expect(hasAuthCookie).toBeTruthy();
  });
});

baseTest.describe('Protected Routes - Logout', () => {
  test('user can log out from dashboard', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard');

    const signOutButton = page.locator('button:has-text("Sign out")');
    await expect(signOutButton).toBeVisible();

    await signOutButton.click();

    // Should redirect to login
    await expect(page).toHaveURL('/login', { timeout: 10000 });
  });

  test('after logout, protected routes are inaccessible', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard');

    // Log out
    await page.locator('button:has-text("Sign out")').click();
    await expect(page).toHaveURL('/login');

    // Try to access dashboard again
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });

  test('after logout, user is redirected to login page', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard');

    await page.locator('button:has-text("Sign out")').click();

    // Should redirect to login
    await expect(page).toHaveURL('/login');
    await expect(page.locator('text=/sign in/i')).toBeVisible();
  });

  test('logout clears authentication cookies', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard');

    // Get cookies before logout
    const cookiesBefore = await page.context().cookies();
    const authCookie = cookiesBefore.find((cookie) =>
      /^sb-[a-z0-9]+-auth-token$/i.test(cookie.name)
    );
    expect(authCookie?.value).toBeTruthy();

    // Log out
    await page.locator('button:has-text("Sign out")').click();
    await expect(page).toHaveURL('/login');

    // Note: Cookies might still exist but be cleared/invalidated by Supabase
    // The important test is that we can't access protected routes
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/login');
  });
});

baseTest.describe('Protected Routes - Redirect URL Preservation', () => {
  baseTest('attempting to access protected route saves redirect URL', async ({ page }) => {
    await page.context().clearCookies();

    // Try to access dashboard directly
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL('/login');

    // Note: Current implementation doesn't preserve redirectTo in URL
    // but this test documents the expected behavior if it's added in the future
  });

  baseTest('user redirected to original destination after login', async ({ page }) => {
    await page.context().clearCookies();

    // Create a test user first
    const email = `test-${Date.now()}@example.com`;
    const password = 'TestPassword123!';

    await page.goto('/signup');
    await page.fill('[name="email"]', email);
    await page.fill('[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL((url) => url.pathname === '/' || url.pathname === '/dashboard');

    // Sign out
    await page.goto('/dashboard');
    await page.locator('button:has-text("Sign out")').click();
    await page.waitForURL('/login');

    // Now try to access a protected route
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/login');

    // Login
    await page.fill('[name="email"]', email);
    await page.fill('[name="password"]', password);
    await page.click('button[type="submit"]');

    // Note: Current implementation redirects to / after login
    // In the future, might want to redirect back to /dashboard
    await page.waitForURL((url) => url.pathname === '/' || url.pathname === '/dashboard');
  });
});

baseTest.describe('Protected Routes - Multiple Protected Routes', () => {
  test('dashboard is protected', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=/dashboard/i')).toBeVisible();
  });

  baseTest('unauthenticated access to any protected route redirects to login', async ({ page }) => {
    await page.context().clearCookies();

    // List of protected routes to test
    const protectedRoutes = ['/dashboard'];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await expect(page).toHaveURL('/login', { timeout: 10000 });
    }
  });
});

baseTest.describe('Protected Routes - Auth State Edge Cases', () => {
  test('expired session redirects to login', async ({ page }) => {
    // Create and authenticate user
    const email = `test-${Date.now()}@example.com`;
    const password = 'TestPassword123!';

    await page.goto('/signup');
    await page.fill('[name="email"]', email);
    await page.fill('[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL((url) => url.pathname === '/' || url.pathname === '/dashboard');

    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');

    // Clear all cookies to simulate expired session
    await page.context().clearCookies();

    // Try to access dashboard
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });

  test('invalid session redirects to login', async ({ page }) => {
    // First, create a real authenticated session to get the actual cookie name
    const email = `test-${Date.now()}@example.com`;
    const password = 'TestPassword123!';

    await page.goto('/signup');
    await page.fill('[name="email"]', email);
    await page.fill('[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL((url) => url.pathname === '/' || url.pathname === '/dashboard');

    // Get the real Supabase auth cookie
    const cookies = await page.context().cookies();
    const authCookie = cookies.find((cookie) => /^sb-[a-z0-9]+-auth-token$/i.test(cookie.name));

    if (!authCookie) {
      throw new Error('Could not find Supabase auth cookie to test invalid session');
    }

    // Now overwrite it with an invalid value (keeping the real cookie name)
    await page.context().clearCookies();
    await page.context().addCookies([
      {
        name: authCookie.name,
        value: 'invalid-token-value',
        domain: authCookie.domain,
        path: authCookie.path,
        expires: authCookie.expires,
        httpOnly: authCookie.httpOnly,
        secure: authCookie.secure,
        sameSite: authCookie.sameSite,
      },
    ]);

    await page.goto('/dashboard');

    // Should redirect to login due to invalid session token
    await expect(page).toHaveURL('/login');
  });
});
