/**
 * E2E Accessibility Tests for Authentication Forms
 *
 * Comprehensive tests covering:
 * - Keyboard navigation
 * - Screen reader support (ARIA attributes)
 * - WCAG compliance
 * - Focus management
 * - Color contrast and visual accessibility
 */

import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('Auth Accessibility - Automated Scanning', () => {
  test('login page has no accessibility violations', async ({ page }) => {
    await page.goto('/login');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('signup page has no accessibility violations', async ({ page }) => {
    await page.goto('/signup');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('reset password page has no accessibility violations', async ({ page }) => {
    await page.goto('/reset-password');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('update password page has no accessibility violations', async ({ page }) => {
    await page.goto('/update-password');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('login page with errors has no accessibility violations', async ({ page }) => {
    await page.goto('/login');

    // Trigger validation errors
    await page.fill('[name="email"]', 'invalid');
    await page.locator('[name="email"]').blur();
    await page.waitForTimeout(200);

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

test.describe('Auth Accessibility - Keyboard Navigation', () => {
  test('can tab through all login form fields', async ({ page }) => {
    await page.goto('/login');

    // Start from beginning
    await page.keyboard.press('Tab'); // Focus first element (might be skip link or logo)

    // Tab to email field
    let focusedElement = await page.evaluate(() => document.activeElement?.id);
    let attempts = 0;
    while (focusedElement !== 'email' && attempts < 10) {
      await page.keyboard.press('Tab');
      focusedElement = await page.evaluate(() => document.activeElement?.id);
      attempts++;
    }
    expect(focusedElement).toBe('email');

    // Tab to password field
    await page.keyboard.press('Tab');
    focusedElement = await page.evaluate(() => document.activeElement?.id);
    expect(focusedElement).toBe('password');

    // Tab to submit button
    await page.keyboard.press('Tab');
    const focusedText = await page.evaluate(
      () => document.activeElement?.textContent?.toLowerCase() || ''
    );
    expect(focusedText).toContain('sign in');
  });

  test('can tab through all signup form fields', async ({ page }) => {
    await page.goto('/signup');

    // Tab to email field
    let focusedElement = await page.evaluate(() => document.activeElement?.id);
    let attempts = 0;
    while (focusedElement !== 'email' && attempts < 10) {
      await page.keyboard.press('Tab');
      focusedElement = await page.evaluate(() => document.activeElement?.id);
      attempts++;
    }
    expect(focusedElement).toBe('email');

    // Tab to password field
    await page.keyboard.press('Tab');
    focusedElement = await page.evaluate(() => document.activeElement?.id);
    expect(focusedElement).toBe('password');

    // Tab to submit button
    await page.keyboard.press('Tab');
    const focusedText = await page.evaluate(
      () => document.activeElement?.textContent?.toLowerCase() || ''
    );
    expect(focusedText).toContain('create account');
  });

  test('can submit login form with Enter key', async ({ page }) => {
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

    // Test keyboard submission
    await page.goto('/login');
    await page.fill('[name="email"]', email);
    await page.fill('[name="password"]', password);

    // Press Enter to submit
    await page.keyboard.press('Enter');

    // Should redirect after successful login
    await page.waitForURL('/', { timeout: 10000 });
  });

  test('focus indicators are visible', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.locator('#email');
    await emailInput.focus();

    // Check that focused element has visible outline or focus style
    const hasFocusStyle = await emailInput.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      const outline = styles.outline;
      const outlineWidth = styles.outlineWidth;
      const boxShadow = styles.boxShadow;

      // Element should have visible focus indication
      return (
        (outline !== 'none' && outlineWidth !== '0px') ||
        boxShadow !== 'none' ||
        styles.borderColor !== styles.backgroundColor
      );
    });

    expect(hasFocusStyle).toBeTruthy();
  });

  test('focus order is logical on login page', async ({ page }) => {
    await page.goto('/login');

    const focusOrder: string[] = [];

    // Tab through form and record focus order
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const elementInfo = await page.evaluate(() => {
        const el = document.activeElement;
        return {
          tag: el?.tagName.toLowerCase(),
          id: el?.id,
          type: (el as HTMLInputElement)?.type,
          text: el?.textContent?.trim().substring(0, 20),
        };
      });

      if (elementInfo.id || elementInfo.type || elementInfo.text) {
        focusOrder.push(
          `${elementInfo.tag}${elementInfo.id ? `#${elementInfo.id}` : ''}${elementInfo.type ? `[${elementInfo.type}]` : ''}`
        );
      }
    }

    // Should include email, password, and submit button in order
    const orderString = focusOrder.join(' -> ');
    expect(orderString).toContain('email');
    expect(orderString).toContain('password');
    expect(orderString.indexOf('email')).toBeLessThan(orderString.indexOf('password'));
  });

  test('can navigate links with keyboard', async ({ page }) => {
    await page.goto('/login');

    // Tab to signup link
    let foundSignupLink = false;
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab');
      const href = await page.evaluate(() => (document.activeElement as HTMLAnchorElement)?.href);
      if (href?.includes('/signup')) {
        foundSignupLink = true;
        break;
      }
    }

    expect(foundSignupLink).toBeTruthy();

    // Press Enter on the link
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL('/signup');
  });
});

test.describe('Auth Accessibility - Screen Reader Support', () => {
  test('login form labels are properly associated with inputs', async ({ page }) => {
    await page.goto('/login');

    // Email field
    const emailLabel = page.locator('label[for="email"]');
    const emailInput = page.locator('#email');
    await expect(emailLabel).toBeVisible();

    const labelFor = await emailLabel.getAttribute('for');
    const inputId = await emailInput.getAttribute('id');
    expect(labelFor).toBe(inputId);

    // Password field
    const passwordLabel = page.locator('label[for="password"]');
    const passwordInput = page.locator('#password');
    await expect(passwordLabel).toBeVisible();

    const passwordLabelFor = await passwordLabel.getAttribute('for');
    const passwordInputId = await passwordInput.getAttribute('id');
    expect(passwordLabelFor).toBe(passwordInputId);
  });

  test('error messages are announced via aria-live', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[name="email"]', 'invalid');
    await page.locator('[name="email"]').blur();
    await page.waitForTimeout(200);

    const errorMessage = page.locator('[role="alert"]').first();
    await expect(errorMessage).toBeVisible();

    // Error should have aria-live for screen reader announcement
    await expect(errorMessage).toHaveAttribute('aria-live', 'polite');
  });

  test('loading states are announced', async ({ page }) => {
    await page.goto('/login');

    const email = `test-${Date.now()}@example.com`;
    const password = 'TestPassword123!';

    await page.fill('[name="email"]', email);
    await page.fill('[name="password"]', password);

    const submitButton = page.locator('button[type="submit"]');

    // Start submission
    const clickPromise = submitButton.click();

    // Check button shows loading state (text changes)
    await expect(submitButton).toContainText(/signing in/i);

    await clickPromise;
  });

  test('success messages are announced', async ({ page }) => {
    await page.goto('/reset-password');

    const email = `test-${Date.now()}@example.com`;
    await page.fill('[name="email"]', email);
    await page.click('button[type="submit"]');

    // Wait for success message
    const successMessage = page.locator('output[aria-live="polite"]');
    await expect(successMessage).toBeVisible({ timeout: 10000 });
    await expect(successMessage).toContainText(/check your email/i);
  });

  test('inputs have aria-invalid when errors present', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.locator('[name="email"]');

    // Trigger error
    await emailInput.fill('invalid');
    await emailInput.blur();
    await page.waitForTimeout(200);

    // Input should have aria-invalid
    await expect(emailInput).toHaveAttribute('aria-invalid', 'true');
  });

  test('inputs have aria-describedby linking to error messages', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.locator('[name="email"]');

    // Trigger error
    await emailInput.fill('invalid');
    await emailInput.blur();
    await page.waitForTimeout(200);

    // Get aria-describedby
    const describedBy = await emailInput.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();

    // Error message should have matching id
    const errorMessage = page.locator(`#${describedBy}`);
    await expect(errorMessage).toBeVisible();
  });
});

test.describe('Auth Accessibility - WCAG Compliance', () => {
  test('form has proper heading structure', async ({ page }) => {
    await page.goto('/login');

    // Should have h1 or similar for page title
    const heading = page.locator('text=/sign in/i').first();
    await expect(heading).toBeVisible();

    // Check heading level
    const headingLevel = await heading.evaluate((el) => {
      let current: Element | null = el;
      while (current) {
        if (/^h[1-6]$/i.test(current.tagName)) {
          return current.tagName.toLowerCase();
        }
        current = current.parentElement;
      }
      return null;
    });

    // Should be h1, h2, or contained in card title
    expect(headingLevel).toBeTruthy();
  });

  test('error messages are not conveyed by color alone', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[name="email"]', 'invalid');
    await page.locator('[name="email"]').blur();
    await page.waitForTimeout(200);

    // Error message should have text content, not just color
    const errorMessage = page.locator('[role="alert"]').first();
    await expect(errorMessage).toBeVisible();

    const errorText = await errorMessage.textContent();
    expect(errorText?.length).toBeGreaterThan(0);

    // Error should have role="alert" so it's announced
    await expect(errorMessage).toHaveAttribute('role', 'alert');
  });

  test('forms have proper landmark roles', async ({ page }) => {
    await page.goto('/login');

    // Form should be in a main landmark or have proper structure
    const form = page.locator('form').first();
    await expect(form).toBeVisible();

    // Check that form is within proper document structure
    const inMainLandmark = await form.evaluate((el) => {
      let current: Element | null = el;
      while (current) {
        const role = current.getAttribute('role');
        const tag = current.tagName.toLowerCase();
        if (role === 'main' || tag === 'main') {
          return true;
        }
        current = current.parentElement;
      }
      return false;
    });

    // Form should be in main content area
    expect(inMainLandmark).toBe(true);
  });

  test('color contrast is sufficient for text', async ({ page }) => {
    await page.goto('/login');

    // Use axe to check color contrast
    const accessibilityScanResults = await new AxeBuilder({ page }).withTags(['wcag2aa']).analyze();

    const contrastViolations = accessibilityScanResults.violations.filter((v) =>
      v.id.includes('color-contrast')
    );

    expect(contrastViolations).toEqual([]);
  });

  test('form inputs have visible labels', async ({ page }) => {
    await page.goto('/login');

    // Email label
    const emailLabel = page.locator('label[for="email"]');
    await expect(emailLabel).toBeVisible();
    const emailLabelText = await emailLabel.textContent();
    expect(emailLabelText?.trim().length).toBeGreaterThan(0);

    // Password label
    const passwordLabel = page.locator('label[for="password"]');
    await expect(passwordLabel).toBeVisible();
    const passwordLabelText = await passwordLabel.textContent();
    expect(passwordLabelText?.trim().length).toBeGreaterThan(0);
  });

  test('required fields are properly marked', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.locator('#email');
    const passwordInput = page.locator('#password');

    // Should have required attribute
    await expect(emailInput).toHaveAttribute('required');
    await expect(passwordInput).toHaveAttribute('required');
  });
});

test.describe('Auth Accessibility - Password Requirements', () => {
  test('password requirements are visible and accessible on signup', async ({ page }) => {
    await page.goto('/signup');

    const requirementsText = page.locator(
      'text=/at least 8 characters.*uppercase.*lowercase.*number.*special character/i'
    );
    await expect(requirementsText).toBeVisible();

    // Requirements should be programmatically associated with password field
    // Check if they're linked via aria-describedby (best practice)
    const passwordInput = page.locator('#password');
    const ariaDescribedBy = await passwordInput.getAttribute('aria-describedby');

    // Should have aria-describedby for proper accessibility
    expect(ariaDescribedBy).toBeTruthy();

    // Verify the referenced element exists if aria-describedby is present
    if (ariaDescribedBy) {
      const describedElement = page.locator(`#${ariaDescribedBy}`);
      await expect(describedElement).toBeVisible();
    }
  });

  test('password requirements are visible on update password page', async ({ page }) => {
    await page.goto('/update-password');

    const requirementsText = page.locator(
      'text=/at least 8 characters.*uppercase.*lowercase.*number.*special character/i'
    );
    await expect(requirementsText).toBeVisible();
  });
});
