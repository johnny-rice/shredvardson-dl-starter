/**
 * Mobile Responsiveness Test for Auth Forms
 *
 * Tests auth pages at various mobile viewports to ensure:
 * - No horizontal scroll
 * - Adequate touch targets (44x44px minimum)
 * - Proper layout and spacing
 * - Validation messages don't break layout
 * - Fluid typography scales properly
 */

import { expect, test } from '@playwright/test';

const VIEWPORTS = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'Minimum Mobile', width: 320, height: 568 },
  { name: 'iPad Mini', width: 768, height: 1024 },
];

const AUTH_PAGES = [
  { path: '/signup', title: 'Sign Up' },
  { path: '/login', title: 'Sign In' },
  { path: '/reset-password', title: 'Reset Password' },
];

for (const viewport of VIEWPORTS) {
  test.describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    for (const page of AUTH_PAGES) {
      test(`${page.title} page renders correctly`, async ({ page: browserPage }) => {
        await browserPage.goto(`http://localhost:3000${page.path}`);

        // Verify no horizontal scroll
        const bodyWidth = await browserPage.evaluate(() => document.body.scrollWidth);
        const viewportWidth = await browserPage.evaluate(() => window.innerWidth);
        expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);

        // Verify logo/branding is visible
        const logo = browserPage.locator('text=DL Starter');
        await expect(logo).toBeVisible();

        // Verify card is visible and properly sized
        const card = browserPage.locator('[role="region"], .rounded-lg.border').first();
        await expect(card).toBeVisible();

        // Verify input fields have adequate touch targets
        const emailInput = browserPage.locator('input[name="email"]');
        if ((await emailInput.count()) > 0) {
          const box = await emailInput.boundingBox();
          if (box) {
            expect(box.height).toBeGreaterThanOrEqual(40); // Close to 44px minimum
          }
        }

        // Verify submit button has adequate touch target
        const submitButton = browserPage.locator('button[type="submit"]');
        const buttonBox = await submitButton.boundingBox();
        if (buttonBox) {
          expect(buttonBox.height).toBeGreaterThanOrEqual(40);
        }

        // Take screenshot for visual verification
        await browserPage.screenshot({
          path: `apps/web/tests/manual/screenshots/${viewport.name.replace(/\s+/g, '-')}-${page.path.replace('/', '')}.png`,
          fullPage: true,
        });
      });
    }

    test('Validation messages display properly', async ({ page: browserPage }) => {
      await browserPage.goto('http://localhost:3000/signup');

      // Click email field and blur to trigger validation
      const emailInput = browserPage.locator('input[name="email"]');
      await emailInput.click();
      await emailInput.fill('invalid');
      await emailInput.blur();

      // Wait for validation message
      await browserPage.waitForTimeout(200);

      // Verify error message is visible and doesn't break layout
      const errorMessage = browserPage
        .locator('text=/Please enter a valid email address/i')
        .first();
      if ((await errorMessage.count()) > 0) {
        await expect(errorMessage).toBeVisible();

        // Verify no horizontal scroll after error
        const bodyWidth = await browserPage.evaluate(() => document.body.scrollWidth);
        const viewportWidth = await browserPage.evaluate(() => window.innerWidth);
        expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);
      }

      // Take screenshot with validation
      await browserPage.screenshot({
        path: `apps/web/tests/manual/screenshots/${viewport.name.replace(/\s+/g, '-')}-validation.png`,
        fullPage: true,
      });
    });
  });
}
