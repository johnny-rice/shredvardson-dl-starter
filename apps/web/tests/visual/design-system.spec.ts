import { test, expect } from '@playwright/test';

test.describe('Design System Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/showcase');
    // Wait for fonts to load
    await page.waitForLoadState('networkidle');
  });

  test('showcase page - light theme', async ({ page }) => {
    await expect(page).toHaveScreenshot('showcase-light.png', {
      fullPage: true,
      maxDiffPixels: 100, // Allow minor rendering differences
    });
  });

  test('showcase page - dark theme', async ({ page }) => {
    // Add dark class to html element
    await page.locator('html').evaluate((el) => el.classList.add('dark'));
    await page.waitForTimeout(500); // Wait for theme transition

    await expect(page).toHaveScreenshot('showcase-dark.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('button variants render correctly', async ({ page }) => {
    const buttonSection = page.locator('section').filter({ hasText: 'Button Variants' });
    await expect(buttonSection).toHaveScreenshot('button-variants.png', {
      maxDiffPixels: 50,
    });
  });

  test('button hover state', async ({ page }) => {
    const defaultButton = page.getByRole('button', { name: 'Default' }).first();
    await defaultButton.hover();
    await page.waitForTimeout(300); // Wait for hover transition

    const buttonSection = page.locator('section').filter({ hasText: 'Button Variants' });
    await expect(buttonSection).toHaveScreenshot('button-hover.png', {
      maxDiffPixels: 50,
    });
  });

  test('button focus state', async ({ page }) => {
    const defaultButton = page.getByRole('button', { name: 'Default' }).first();
    await defaultButton.focus();

    const buttonSection = page.locator('section').filter({ hasText: 'Button Variants' });
    await expect(buttonSection).toHaveScreenshot('button-focus.png', {
      maxDiffPixels: 50,
    });
  });

  test('typography scales at mobile width', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    const typographySection = page.locator('section').filter({ hasText: 'Typography Scale' });

    await expect(typographySection).toHaveScreenshot('typography-mobile.png', {
      maxDiffPixels: 50,
    });
  });

  test('typography scales at desktop width', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    const typographySection = page.locator('section').filter({ hasText: 'Typography Scale' });

    await expect(typographySection).toHaveScreenshot('typography-desktop.png', {
      maxDiffPixels: 50,
    });
  });

  test('form components in card', async ({ page }) => {
    const formSection = page.locator('section').filter({ hasText: 'Form Components' });

    await expect(formSection).toHaveScreenshot('form-components.png', {
      maxDiffPixels: 50,
    });
  });
});
