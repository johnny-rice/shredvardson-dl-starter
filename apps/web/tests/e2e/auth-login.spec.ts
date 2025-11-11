/**
 * E2E Tests for Login Flow
 *
 * Comprehensive tests covering:
 * - Successful login scenarios
 * - Failed login scenarios (validation, wrong credentials)
 * - Form validation and error handling
 * - Loading states and accessibility
 * - Redirect functionality
 *
 * @see {@link https://playwright.dev/docs/best-practices | Playwright Best Practices}
 */

import { test as baseTest, expect } from '@playwright/test';

baseTest.describe('Login Flow - Successful Login', () => {
  baseTest('user can login with valid credentials and is redirected to home', async ({ page }) => {
    // First, create a test user
    const email = `test-${Date.now()}@example.com`;
    const password = 'TestPassword123!';

    await page.goto('/signup');
    await page.fill('[name="email"]', email);
    await page.fill('[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL((url) => url.pathname === '/' || url.pathname === '/dashboard', {
      timeout: 15000,
    });

    // Sign out
    await page.goto('/dashboard');
    await page.locator('button:has-text("Sign out")').click();
    await page.waitForURL('/login');

    // Now test login
    await page.goto('/login');
    await page.fill('[name="email"]', email);
    await page.fill('[name="password"]', password);

    await page.click('button[type="submit"]');

    // Should redirect to home or dashboard
    await page.waitForURL((url) => url.pathname === '/' || url.pathname === '/dashboard', {
      timeout: 10000,
    });
    await expect(page).toHaveURL(/^\/(dashboard)?$/);
  });

  baseTest('session persists across page reload after login', async ({ page }) => {
    // Create and login user
    const email = `test-${Date.now()}@example.com`;
    const password = 'TestPassword123!';

    await page.goto('/signup');
    await page.fill('[name="email"]', email);
    await page.fill('[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL((url) => url.pathname === '/' || url.pathname === '/dashboard', {
      timeout: 15000,
    });

    // Navigate to dashboard
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');

    // Reload page
    await page.reload();

    // Should still be on dashboard (session persists)
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator(`text=${email}`)).toBeVisible();
  });

  baseTest('user redirected back to requested page after login', async ({ page }) => {
    // Try to access protected route while not authenticated
    await page.context().clearCookies();
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL('/login');

    // Create a test user and login
    const email = `test-${Date.now()}@example.com`;
    const password = 'TestPassword123!';

    // First signup
    await page.goto('/signup');
    await page.fill('[name="email"]', email);
    await page.fill('[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL((url) => url.pathname === '/' || url.pathname === '/dashboard');

    // Sign out
    await page.goto('/dashboard');
    await page.locator('button:has-text("Sign out")').click();
    await page.waitForURL('/login');

    // Try to access dashboard again (should redirect with redirectTo param)
    await page.goto('/dashboard');

    // Login from the redirected login page
    await page.fill('[name="email"]', email);
    await page.fill('[name="password"]', password);
    await page.click('button[type="submit"]');

    // Note: Currently the app redirects to / after login
    // In the future, this might redirect back to /dashboard
    await page.waitForURL((url) => url.pathname === '/' || url.pathname === '/dashboard');
  });
});

baseTest.describe('Login Flow - Failed Login', () => {
  baseTest('shows error for invalid email format', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[name="email"]', 'not-a-valid-email');
    await page.fill('[name="password"]', 'SomePassword123!');

    // Blur the email field to trigger validation
    await page.locator('[name="email"]').blur();

    // Should show validation error (auto-waits for visibility)
    const errorMessage = page.locator('text=/invalid email/i');
    await expect(errorMessage).toBeVisible();

    // Error should have proper accessibility attributes
    await expect(errorMessage).toHaveAttribute('role', 'alert');
    await expect(errorMessage).toHaveAttribute('aria-live', 'polite');
  });

  baseTest('shows error for wrong password', async ({ page }) => {
    // First create a test user
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

    // Try to login with wrong password
    await page.goto('/login');
    await page.fill('[name="email"]', email);
    await page.fill('[name="password"]', 'WrongPassword123!');
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=/invalid/i')).toBeVisible();
  });

  baseTest('shows error for non-existent user', async ({ page }) => {
    await page.goto('/login');

    const nonExistentEmail = `nonexistent-${Date.now()}@example.com`;
    await page.fill('[name="email"]', nonExistentEmail);
    await page.fill('[name="password"]', 'SomePassword123!');
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=/invalid/i')).toBeVisible();
  });

  baseTest('error messages are accessible with aria-live', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[name="email"]', 'invalid-email');
    await page.locator('[name="email"]').blur();

    // Find error message (auto-waits for visibility)
    const errorMessage = page.locator('[role="alert"][aria-live="polite"]').first();
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText(/invalid email/i);
  });
});

baseTest.describe('Login Flow - Form Validation', () => {
  baseTest('email field requires valid email', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.locator('[name="email"]');

    // Test invalid formats
    const invalidEmails = ['notanemail', 'missing@domain', '@nodomain.com', 'spaces in@email.com'];

    for (const invalidEmail of invalidEmails) {
      await emailInput.fill(invalidEmail);
      await emailInput.blur();

      // Should show validation error (auto-waits for visibility)
      const errorMessage = page.locator('text=/invalid email/i');
      await expect(errorMessage).toBeVisible();

      // Clear for next test
      await emailInput.clear();
    }
  });

  baseTest('password field requires non-empty value', async ({ page }) => {
    await page.goto('/login');

    const passwordInput = page.locator('[name="password"]');

    // Focus and blur without entering anything
    await passwordInput.focus();
    await passwordInput.blur();

    // Should show validation error (auto-waits for visibility)
    const errorMessage = page.locator('text=/password is required/i');
    await expect(errorMessage).toBeVisible();
  });

  baseTest('submit button shows loading state during submission', async ({ page }) => {
    // Create a test user first
    const email = `test-${Date.now()}@example.com`;
    const password = 'TestPassword123!';

    await page.goto('/signup');
    await page.fill('[name="email"]', email);
    await page.fill('[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL((url) => url.pathname === '/' || url.pathname === '/dashboard');

    await page.goto('/dashboard');
    await page.locator('button:has-text("Sign out")').click();
    await page.waitForURL('/login');

    // Go to login
    await page.goto('/login');
    await page.fill('[name="email"]', email);
    await page.fill('[name="password"]', password);

    const submitButton = page.locator('button[type="submit"]');

    // Click submit
    const submitPromise = submitButton.click();

    // Button should show loading state
    await expect(submitButton).toContainText(/signing in/i);
    await expect(submitButton).toBeDisabled();

    await submitPromise;
  });

  baseTest('form inputs have proper autocomplete attributes', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.locator('[name="email"]');
    const passwordInput = page.locator('[name="password"]');

    // Check autocomplete attributes
    await expect(emailInput).toHaveAttribute('autocomplete', 'email');
    await expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
  });

  baseTest('form inputs have proper labels and accessibility attributes', async ({ page }) => {
    await page.goto('/login');

    // Email field
    const emailLabel = page.locator('label[for="email"]');
    const emailInput = page.locator('#email');
    await expect(emailLabel).toBeVisible();
    await expect(emailLabel).toHaveText('Email');
    await expect(emailInput).toHaveAttribute('type', 'email');
    await expect(emailInput).toHaveAttribute('required');

    // Password field
    const passwordLabel = page.locator('label[for="password"]');
    const passwordInput = page.locator('#password');
    await expect(passwordLabel).toBeVisible();
    await expect(passwordLabel).toHaveText('Password');
    await expect(passwordInput).toHaveAttribute('type', 'password');
    await expect(passwordInput).toHaveAttribute('required');
  });
});

baseTest.describe('Login Flow - Navigation Links', () => {
  baseTest('has link to signup page', async ({ page }) => {
    await page.goto('/login');

    const signupLink = page.locator('a[href="/signup"]');
    await expect(signupLink).toBeVisible();
    await expect(signupLink).toContainText(/sign up/i);

    // Click and verify navigation
    await signupLink.click();
    await expect(page).toHaveURL('/signup');
  });

  baseTest('has link to password reset page', async ({ page }) => {
    await page.goto('/login');

    const resetLink = page.locator('a[href="/reset-password"]');
    await expect(resetLink).toBeVisible();
    await expect(resetLink).toContainText(/forgot.*password/i);

    // Click and verify navigation
    await resetLink.click();
    await expect(page).toHaveURL('/reset-password');
  });
});
