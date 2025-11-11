/**
 * E2E Tests for Signup Flow
 *
 * Comprehensive tests covering:
 * - Successful signup scenarios
 * - Failed signup scenarios (validation, duplicate email)
 * - Form validation and error handling
 * - Password strength requirements
 * - Real-time validation feedback
 */

import { expect, test } from '@playwright/test';

test.describe('Signup Flow - Successful Signup', () => {
  test('user can signup with valid email and password', async ({ page }) => {
    await page.goto('/signup');

    const email = `test-${Date.now()}@example.com`;
    const password = 'TestPassword123!';

    await page.fill('[name="email"]', email);
    await page.fill('[name="password"]', password);

    await page.click('button[type="submit"]');

    // Should redirect after successful signup (local Supabase auto-confirms)
    await page.waitForURL((url) => url.pathname === '/' || url.pathname === '/dashboard', {
      timeout: 10000,
    });

    // Verify we're authenticated by checking we can access dashboard
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator(`text=${email}`)).toBeVisible();
  });

  test('form submits and shows loading state', async ({ page }) => {
    await page.goto('/signup');

    const email = `test-${Date.now()}@example.com`;
    const password = 'TestPassword123!';

    await page.fill('[name="email"]', email);
    await page.fill('[name="password"]', password);

    const submitButton = page.locator('button[type="submit"]');

    // Click submit
    const submitPromise = submitButton.click();

    // Button should show loading state
    await expect(submitButton).toContainText(/creating account/i);
    await expect(submitButton).toBeDisabled();

    await submitPromise;
  });

  test('user is redirected to appropriate page after signup', async ({ page }) => {
    await page.goto('/signup');

    const email = `test-${Date.now()}@example.com`;
    const password = 'TestPassword123!';

    await page.fill('[name="email"]', email);
    await page.fill('[name="password"]', password);
    await page.click('button[type="submit"]');

    // Should redirect to home or dashboard
    await page.waitForURL((url) => url.pathname === '/' || url.pathname === '/dashboard', {
      timeout: 10000,
    });
  });
});

test.describe('Signup Flow - Failed Signup', () => {
  test('shows error for duplicate email', async ({ page }) => {
    // Create initial user
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

    // Try to signup again with same email
    await page.goto('/signup');
    await page.fill('[name="email"]', email);
    await page.fill('[name="password"]', 'DifferentPassword123!');
    await page.click('button[type="submit"]');

    // Should show error (Supabase returns "User already registered")
    await expect(
      page.locator('text=/already registered|already exists|already in use/i')
    ).toBeVisible();
  });

  test('rejects weak password - too short', async ({ page }) => {
    await page.goto('/signup');

    await page.fill('[name="email"]', `test-${Date.now()}@example.com`);
    await page.fill('[name="password"]', 'Short1!'); // Only 7 characters

    // Blur to trigger validation
    await page.locator('[name="password"]').blur();

    // Should show validation error (auto-waits for visibility)
    await expect(page.locator('text=/must be at least 8 characters/i')).toBeVisible();
  });

  test('rejects password without uppercase letter', async ({ page }) => {
    await page.goto('/signup');

    await page.fill('[name="email"]', `test-${Date.now()}@example.com`);
    await page.fill('[name="password"]', 'testpassword123!'); // No uppercase

    await page.locator('[name="password"]').blur();

    await expect(page.locator('text=/uppercase/i')).toBeVisible();
  });

  test('rejects password without lowercase letter', async ({ page }) => {
    await page.goto('/signup');

    await page.fill('[name="email"]', `test-${Date.now()}@example.com`);
    await page.fill('[name="password"]', 'TESTPASSWORD123!'); // No lowercase

    await page.locator('[name="password"]').blur();

    await expect(page.locator('text=/lowercase/i')).toBeVisible();
  });

  test('rejects password without number', async ({ page }) => {
    await page.goto('/signup');

    await page.fill('[name="email"]', `test-${Date.now()}@example.com`);
    await page.fill('[name="password"]', 'TestPassword!'); // No number

    await page.locator('[name="password"]').blur();

    await expect(page.locator('text=/number/i')).toBeVisible();
  });

  test('rejects password without special character', async ({ page }) => {
    await page.goto('/signup');

    await page.fill('[name="email"]', `test-${Date.now()}@example.com`);
    await page.fill('[name="password"]', 'TestPassword123'); // No special char

    await page.locator('[name="password"]').blur();

    await expect(page.locator('text=/special character/i')).toBeVisible();
  });

  test('rejects invalid email format', async ({ page }) => {
    await page.goto('/signup');

    await page.fill('[name="email"]', 'not-a-valid-email');
    await page.fill('[name="password"]', 'TestPassword123!');

    await page.locator('[name="email"]').blur();

    await expect(page.locator('text=/invalid email/i')).toBeVisible();
  });
});

test.describe('Signup Flow - Form Validation', () => {
  test('all required fields are validated', async ({ page }) => {
    await page.goto('/signup');

    // HTML5 validation should prevent submission
    const emailInput = page.locator('[name="email"]');
    const passwordInput = page.locator('[name="password"]');

    await expect(emailInput).toHaveAttribute('required');
    await expect(passwordInput).toHaveAttribute('required');
  });

  test('password strength indicator text is visible', async ({ page }) => {
    await page.goto('/signup');

    // Look for password requirements text
    const requirementsText = page.locator(
      'text=/at least 8 characters.*uppercase.*lowercase.*number.*special character/i'
    );
    await expect(requirementsText).toBeVisible();
  });

  test('real-time validation feedback on blur', async ({ page }) => {
    await page.goto('/signup');

    const emailInput = page.locator('[name="email"]');

    // Enter invalid email
    await emailInput.fill('invalid');
    // No error yet (validation is progressive)

    // Blur should trigger validation
    await emailInput.blur();
    await page.waitForTimeout(200);

    // Now error should be visible
    await expect(page.locator('text=/invalid email/i')).toBeVisible();
  });

  test('real-time validation feedback on change after error', async ({ page }) => {
    await page.goto('/signup');

    const emailInput = page.locator('[name="email"]');

    // Trigger initial validation error
    await emailInput.fill('invalid');
    await emailInput.blur();
    await page.waitForTimeout(200);
    await expect(page.locator('text=/invalid email/i')).toBeVisible();

    // Now fix the email - error should disappear on change
    await emailInput.fill(`test-${Date.now()}@example.com`);
    await page.waitForTimeout(200);

    // Error should be gone
    await expect(page.locator('text=/invalid email/i')).not.toBeVisible();
  });

  test('form inputs have proper autocomplete attributes', async ({ page }) => {
    await page.goto('/signup');

    const emailInput = page.locator('[name="email"]');
    const passwordInput = page.locator('[name="password"]');

    await expect(emailInput).toHaveAttribute('autocomplete', 'email');
    await expect(passwordInput).toHaveAttribute('autocomplete', 'new-password');
  });

  test('form inputs have proper labels and accessibility', async ({ page }) => {
    await page.goto('/signup');

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

  test('error messages have proper accessibility attributes', async ({ page }) => {
    await page.goto('/signup');

    await page.fill('[name="email"]', 'invalid');
    await page.locator('[name="email"]').blur();
    await page.waitForTimeout(200);

    const errorMessage = page.locator('[role="alert"][aria-live="polite"]').first();
    await expect(errorMessage).toBeVisible();
  });

  test('input fields have aria-invalid when error present', async ({ page }) => {
    await page.goto('/signup');

    const emailInput = page.locator('[name="email"]');

    // Trigger error
    await emailInput.fill('invalid');
    await emailInput.blur();
    await page.waitForTimeout(200);

    // Input should have aria-invalid
    await expect(emailInput).toHaveAttribute('aria-invalid', 'true');

    // Fix the error
    await emailInput.fill(`test-${Date.now()}@example.com`);
    await page.waitForTimeout(200);

    // aria-invalid should be removed or false
    const ariaInvalid = await emailInput.getAttribute('aria-invalid');
    expect(ariaInvalid === 'false' || ariaInvalid === null).toBeTruthy();
  });
});

test.describe('Signup Flow - Navigation Links', () => {
  test('has link to login page', async ({ page }) => {
    await page.goto('/signup');

    const loginLink = page.locator('a[href="/login"]');
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toContainText(/log in|sign in/i);

    // Click and verify navigation
    await loginLink.click();
    await expect(page).toHaveURL('/login');
  });

  test('page has proper title and description', async ({ page }) => {
    await page.goto('/signup');

    await expect(page.locator('text=/create an account/i')).toBeVisible();
    await expect(
      page.locator('text=/enter your email and password to get started/i')
    ).toBeVisible();
  });
});
