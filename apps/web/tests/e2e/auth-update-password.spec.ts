/**
 * E2E Tests for Update Password Flow
 *
 * Comprehensive tests covering:
 * - Update password form validation
 * - Password strength requirements
 * - Error handling
 * - Loading states
 * - Accessibility
 *
 * Note: This page is accessed via email reset link with token.
 * Testing the complete flow with valid tokens requires email integration.
 * These tests focus on the form functionality and validation.
 */

import { expect, test } from '@playwright/test';

test.describe('Update Password Flow - Form Display', () => {
  test('page displays update password form', async ({ page }) => {
    await page.goto('/update-password');

    // Check for form elements
    await expect(page.locator('text=/update password/i')).toBeVisible();
    await expect(page.locator('text=/enter your new password/i')).toBeVisible();

    const passwordInput = page.locator('#password');
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toHaveAttribute('type', 'password');

    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
  });

  test('password input has proper label', async ({ page }) => {
    await page.goto('/update-password');

    const passwordLabel = page.locator('label[for="password"]');
    await expect(passwordLabel).toBeVisible();
    await expect(passwordLabel).toContainText(/new password/i);
  });

  test('password requirements hint is visible', async ({ page }) => {
    await page.goto('/update-password');

    const requirementsText = page.locator(
      'text=/at least 8 characters.*uppercase.*lowercase.*number.*special character/i'
    );
    await expect(requirementsText).toBeVisible();
  });
});

test.describe('Update Password Flow - Form Validation', () => {
  test('rejects weak password - too short', async ({ page }) => {
    await page.goto('/update-password');

    await page.fill('[name="password"]', 'Short1!'); // Only 7 characters

    // Blur to trigger validation
    await page.locator('[name="password"]').blur();
    await page.waitForTimeout(200);

    // Should show validation error
    await expect(page.locator('text=/must be at least 8 characters/i')).toBeVisible();
  });

  test('rejects password without uppercase letter', async ({ page }) => {
    await page.goto('/update-password');

    await page.fill('[name="password"]', 'testpassword123!'); // No uppercase

    await page.locator('[name="password"]').blur();
    await page.waitForTimeout(200);

    await expect(page.locator('text=/uppercase/i')).toBeVisible();
  });

  test('rejects password without lowercase letter', async ({ page }) => {
    await page.goto('/update-password');

    await page.fill('[name="password"]', 'TESTPASSWORD123!'); // No lowercase

    await page.locator('[name="password"]').blur();
    await page.waitForTimeout(200);

    await expect(page.locator('text=/lowercase/i')).toBeVisible();
  });

  test('rejects password without number', async ({ page }) => {
    await page.goto('/update-password');

    await page.fill('[name="password"]', 'TestPassword!'); // No number

    await page.locator('[name="password"]').blur();
    await page.waitForTimeout(200);

    await expect(page.locator('text=/number/i')).toBeVisible();
  });

  test('rejects password without special character', async ({ page }) => {
    await page.goto('/update-password');

    await page.fill('[name="password"]', 'TestPassword123'); // No special char

    await page.locator('[name="password"]').blur();
    await page.waitForTimeout(200);

    await expect(page.locator('text=/special character/i')).toBeVisible();
  });

  test('password field is required', async ({ page }) => {
    await page.goto('/update-password');

    const passwordInput = page.locator('[name="password"]');
    await expect(passwordInput).toHaveAttribute('required');

    // Focus and blur without entering anything
    await passwordInput.focus();
    await passwordInput.blur();
    await page.waitForTimeout(200);

    // Should show validation error
    const errorVisible = await page
      .locator('text=/password.*required|must be at least 8 characters/i')
      .isVisible();
    expect(errorVisible).toBeTruthy();
  });
});

test.describe('Update Password Flow - Accessibility', () => {
  test('password input has proper autocomplete attribute', async ({ page }) => {
    await page.goto('/update-password');

    const passwordInput = page.locator('[name="password"]');
    await expect(passwordInput).toHaveAttribute('autocomplete', 'new-password');
  });

  test('error messages have proper accessibility attributes', async ({ page }) => {
    await page.goto('/update-password');

    await page.fill('[name="password"]', 'weak');
    await page.locator('[name="password"]').blur();
    await page.waitForTimeout(200);

    const errorMessage = page.locator('[role="alert"][aria-live="polite"]').first();
    await expect(errorMessage).toBeVisible();
  });

  test('input has aria-invalid when error present', async ({ page }) => {
    await page.goto('/update-password');

    const passwordInput = page.locator('[name="password"]');

    // Trigger error
    await passwordInput.fill('weak');
    await passwordInput.blur();
    await page.waitForTimeout(200);

    // Input should have aria-invalid
    await expect(passwordInput).toHaveAttribute('aria-invalid', 'true');

    // Fix the error
    await passwordInput.fill('TestPassword123!');
    await page.waitForTimeout(200);

    // aria-invalid should be removed or false
    const ariaInvalid = await passwordInput.getAttribute('aria-invalid');
    expect(ariaInvalid === 'false' || ariaInvalid === null).toBeTruthy();
  });

  test('submit button shows loading state during submission', async ({ page }) => {
    await page.goto('/update-password');

    await page.fill('[name="password"]', 'TestPassword123!');

    const submitButton = page.locator('button[type="submit"]');

    // Click submit (will likely fail without valid token, but we can check loading state)
    const submitPromise = submitButton.click();

    // Button should show loading state
    await expect(submitButton).toContainText(/updating/i);
    await expect(submitButton).toBeDisabled();

    await submitPromise;
  });
});

test.describe('Update Password Flow - Real-time Validation', () => {
  test('validation feedback on blur', async ({ page }) => {
    await page.goto('/update-password');

    const passwordInput = page.locator('[name="password"]');

    // Enter weak password
    await passwordInput.fill('weak');

    // Blur should trigger validation
    await passwordInput.blur();
    await page.waitForTimeout(200);

    // Error should be visible
    await expect(page.locator('text=/must be at least 8 characters/i')).toBeVisible();
  });

  test('validation feedback on change after error', async ({ page }) => {
    await page.goto('/update-password');

    const passwordInput = page.locator('[name="password"]');

    // Trigger initial validation error
    await passwordInput.fill('weak');
    await passwordInput.blur();
    await page.waitForTimeout(200);
    await expect(page.locator('text=/must be at least 8 characters/i')).toBeVisible();

    // Now fix the password - error should disappear on change
    await passwordInput.fill('TestPassword123!');
    await page.waitForTimeout(200);

    // Error should be gone
    await expect(page.locator('text=/must be at least 8 characters/i')).not.toBeVisible();
  });
});

test.describe('Update Password Flow - Invalid Token Handling', () => {
  test('shows error when no session/token present', async ({ page }) => {
    await page.goto('/update-password');

    // Fill in a valid password
    await page.fill('[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');

    // Should show error about invalid/missing token
    // Note: Exact error message depends on Supabase implementation
    const errorPresent = await page
      .locator('text=/error|invalid|expired|session/i')
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    // Either error is shown, or we're redirected somewhere
    const currentUrl = page.url();
    expect(errorPresent || !currentUrl.includes('/update-password')).toBeTruthy();
  });
});
