/**
 * E2E Tests for Password Reset Flow
 *
 * Comprehensive tests covering:
 * - Request password reset
 * - Form validation
 * - Success message display
 * - Error handling
 * - Accessibility
 *
 * Note: Testing the complete password reset flow (clicking email link, updating password)
 * requires email integration or mocking. These tests focus on the request flow.
 */

import { expect, test } from '@playwright/test';

test.describe('Password Reset Flow - Request Reset', () => {
  test('user can request password reset with valid email', async ({ page }) => {
    // Create a test user first
    const email = `test-${Date.now()}@example.com`;
    const password = 'TestPassword123!';

    await page.goto('/signup');
    await page.fill('[name="email"]', email);
    await page.fill('[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL((url) => url.pathname === '/' || url.pathname === '/dashboard');

    // Now request password reset
    await page.goto('/reset-password');

    await page.fill('[name="email"]', email);
    await page.click('button[type="submit"]');

    // Should show success message
    await expect(page.locator('text=/check your email for a password reset link/i')).toBeVisible({
      timeout: 10000,
    });

    // Success message should have proper accessibility
    const successMessage = page.locator('output[aria-live="polite"]');
    await expect(successMessage).toBeVisible();
  });

  test('form shows loading state during submission', async ({ page }) => {
    await page.goto('/reset-password');

    const email = `test-${Date.now()}@example.com`;
    await page.fill('[name="email"]', email);

    const submitButton = page.locator('button[type="submit"]');

    // Click submit
    const submitPromise = submitButton.click();

    // Button should show loading state
    await expect(submitButton).toContainText(/sending/i);
    await expect(submitButton).toBeDisabled();

    await submitPromise;
  });

  test('success message is displayed after submission', async ({ page }) => {
    await page.goto('/reset-password');

    const email = `test-${Date.now()}@example.com`;
    await page.fill('[name="email"]', email);
    await page.click('button[type="submit"]');

    // Should show success message
    const successMessage = page.locator('text=/check your email/i');
    await expect(successMessage).toBeVisible({ timeout: 10000 });

    // Form should be hidden after success
    const emailInput = page.locator('[name="email"]');
    await expect(emailInput).not.toBeVisible();
  });

  test('success message has proper accessibility attributes', async ({ page }) => {
    await page.goto('/reset-password');

    const email = `test-${Date.now()}@example.com`;
    await page.fill('[name="email"]', email);
    await page.click('button[type="submit"]');

    // Find success message with output element and aria-live
    const successOutput = page.locator('output[aria-live="polite"]');
    await expect(successOutput).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Password Reset Flow - Form Validation', () => {
  test('shows error for invalid email format', async ({ page }) => {
    await page.goto('/reset-password');

    await page.fill('[name="email"]', 'not-a-valid-email');

    // Blur to trigger validation
    await page.locator('[name="email"]').blur();
    await page.waitForTimeout(200);

    // Should show validation error
    await expect(page.locator('text=/invalid email/i')).toBeVisible();
  });

  test('email field is required', async ({ page }) => {
    await page.goto('/reset-password');

    const emailInput = page.locator('[name="email"]');
    await expect(emailInput).toHaveAttribute('required');

    // Focus and blur without entering anything
    await emailInput.focus();
    await emailInput.blur();
    await page.waitForTimeout(200);

    // Should show validation error or prevent submission
    const errorVisible = await page.locator('text=/invalid email|email is required/i').isVisible();
    expect(errorVisible).toBeTruthy();
  });

  test('email input has proper autocomplete attribute', async ({ page }) => {
    await page.goto('/reset-password');

    const emailInput = page.locator('[name="email"]');
    await expect(emailInput).toHaveAttribute('autocomplete', 'email');
  });

  test('email input has proper label and accessibility', async ({ page }) => {
    await page.goto('/reset-password');

    const emailLabel = page.locator('label[for="email"]');
    const emailInput = page.locator('#email');

    await expect(emailLabel).toBeVisible();
    await expect(emailLabel).toHaveText('Email');
    await expect(emailInput).toHaveAttribute('type', 'email');
    await expect(emailInput).toHaveAttribute('required');
  });

  test('error messages have proper accessibility attributes', async ({ page }) => {
    await page.goto('/reset-password');

    await page.fill('[name="email"]', 'invalid');
    await page.locator('[name="email"]').blur();
    await page.waitForTimeout(200);

    const errorMessage = page.locator('[role="alert"][aria-live="polite"]').first();
    await expect(errorMessage).toBeVisible();
  });

  test('input has aria-invalid when error present', async ({ page }) => {
    await page.goto('/reset-password');

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

test.describe('Password Reset Flow - Navigation', () => {
  test('has link back to login page', async ({ page }) => {
    await page.goto('/reset-password');

    const loginLink = page.locator('a[href="/login"]');
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toContainText(/back to login/i);

    // Click and verify navigation
    await loginLink.click();
    await expect(page).toHaveURL('/login');
  });

  test('page has proper title and description', async ({ page }) => {
    await page.goto('/reset-password');

    await expect(page.locator('text=/reset password/i')).toBeVisible();
    await expect(
      page.locator('text=/enter your email.*send you a link to reset your password/i')
    ).toBeVisible();
  });
});

test.describe('Password Reset Flow - Edge Cases', () => {
  test('shows success message even for non-existent email (security)', async ({ page }) => {
    await page.goto('/reset-password');

    const nonExistentEmail = `nonexistent-${Date.now()}@example.com`;
    await page.fill('[name="email"]', nonExistentEmail);
    await page.click('button[type="submit"]');

    // Should still show success message (don't reveal if email exists)
    // Note: This depends on backend implementation
    await expect(
      page.locator('text=/check your email/i').or(page.locator('text=/if.*account.*exists/i'))
    ).toBeVisible({ timeout: 10000 });
  });

  test('can request password reset multiple times', async ({ page }) => {
    const email = `test-${Date.now()}@example.com`;

    // First request
    await page.goto('/reset-password');
    await page.fill('[name="email"]', email);
    await page.click('button[type="submit"]');
    await expect(page.locator('text=/check your email/i')).toBeVisible({ timeout: 10000 });

    // Go back to form and request again
    await page.goto('/reset-password');
    await page.fill('[name="email"]', email);
    await page.click('button[type="submit"]');
    await expect(page.locator('text=/check your email/i')).toBeVisible({ timeout: 10000 });
  });
});
