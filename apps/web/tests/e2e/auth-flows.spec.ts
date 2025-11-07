import { test as baseTest, expect } from '@playwright/test';
import { test } from './fixtures/auth';

baseTest.describe('Authentication Flows - Sign Up', () => {
  baseTest('user can sign up with valid credentials', async ({ page }) => {
    await page.goto('/signup');

    const email = `test-${Date.now()}@example.com`;
    await page.fill('[name="email"]', email);
    await page.fill('[name="password"]', 'TestPassword123!');

    await page.click('button[type="submit"]');

    // Should redirect after successful sign-up (local Supabase auto-confirms)
    await page.waitForURL((url) => url.pathname === '/' || url.pathname === '/dashboard', {
      timeout: 10000,
    });

    // Verify we're authenticated by checking we can access dashboard
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator(`text=${email}`)).toBeVisible();
  });

  baseTest('user cannot sign up with weak password', async ({ page }) => {
    await page.goto('/signup');

    await page.fill('[name="email"]', `test-${Date.now()}@example.com`);
    await page.fill('[name="password"]', 'weak'); // Too short, no uppercase, no number, no symbol

    await page.click('button[type="submit"]');

    // Should show validation error
    await expect(page.locator('text=/must be at least 8 characters/i')).toBeVisible();
  });

  baseTest('user cannot sign up with invalid email', async ({ page }) => {
    await page.goto('/signup');

    await page.fill('[name="email"]', 'not-an-email');
    await page.fill('[name="password"]', 'TestPassword123!');

    await page.click('button[type="submit"]');

    // Should show validation error
    await expect(page.locator('text=/invalid email/i')).toBeVisible();
  });
});

test.describe('Authentication Flows - Sign In', () => {
  test('user can sign in with correct credentials', async ({ page, testUser }) => {
    // First create the user via sign-up
    await page.goto('/signup');
    await page.fill('[name="email"]', testUser.email);
    await page.fill('[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL((url) => url.pathname === '/' || url.pathname === '/dashboard');

    // Sign out
    await page.goto('/dashboard');
    const signOutButton = page.locator('button:has-text("Sign out")');
    await signOutButton.click();
    await page.waitForURL('/login');

    // Now sign in with the same credentials
    await page.goto('/login');
    await page.fill('[name="email"]', testUser.email);
    await page.fill('[name="password"]', testUser.password);
    await page.click('button[type="submit"]');

    // Should redirect to / (default redirect)
    await page.waitForURL('/');

    // Verify we're authenticated by checking we can access dashboard
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');
  });

  test('user cannot sign in with wrong password', async ({ page, testUser }) => {
    // First create the user
    await page.goto('/signup');
    await page.fill('[name="email"]', testUser.email);
    await page.fill('[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL((url) => url.pathname === '/' || url.pathname === '/dashboard');

    // Sign out
    await page.goto('/dashboard');
    await page.locator('button:has-text("Sign out")').click();

    // Try to sign in with wrong password
    await page.goto('/login');
    await page.fill('[name="email"]', testUser.email);
    await page.fill('[name="password"]', 'WrongPassword123!');
    await page.click('button[type="submit"]');

    // Should show error message (Supabase returns "Invalid login credentials")
    await expect(page.locator('text=/invalid/i')).toBeVisible();
  });

  test('user can sign out', async ({ authenticatedPage: page }) => {
    // User is already authenticated via fixture
    await page.goto('/dashboard');

    await page.locator('button:has-text("Sign out")').click();

    // Should redirect to login
    await expect(page).toHaveURL('/login');

    // Verify we cannot access dashboard anymore
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/login');
  });

  test('session persists across page refresh', async ({ authenticatedPage: page }) => {
    // User is already authenticated via fixture
    await page.goto('/dashboard');

    // Refresh page
    await page.reload();

    // Should still be on dashboard (not redirected to sign-in)
    await expect(page).toHaveURL('/dashboard');
  });
});

baseTest.describe('Protected Routes', () => {
  baseTest('unauthenticated user redirected from protected route', async ({ page }) => {
    // Ensure not authenticated
    await page.context().clearCookies();

    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });

  test('authenticated user can access protected routes', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard');

    // Should NOT redirect
    await expect(page).toHaveURL('/dashboard');

    // Should see welcome message
    await expect(page.locator('text=/dashboard/i')).toBeVisible();
  });
});
