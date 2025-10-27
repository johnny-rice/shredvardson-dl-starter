import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('Accessibility Tests', () => {
  test('homepage should not have automatically detectable accessibility issues', async ({
    page,
  }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('dashboard link should be accessible', async ({ page }) => {
    await page.goto('/');

    // Check that navigation is keyboard accessible
    const dashboardLink = page.getByText('Your Starter');
    await expect(dashboardLink).toBeVisible();

    // Verify it has proper role
    const role = await dashboardLink.getAttribute('role');
    const tagName = await dashboardLink.evaluate((el) => el.tagName.toLowerCase());

    // Should be a link (either explicit role or anchor tag)
    expect(role === 'link' || tagName === 'a').toBeTruthy();
  });

  test('theme toggle should be accessible', async ({ page }) => {
    await page.goto('/');

    const themeSelect = page.getByRole('combobox');
    await expect(themeSelect).toBeVisible();

    // Check for accessible label
    const label = page.getByText('Theme:');
    await expect(label).toBeVisible();

    // Verify label is associated with select
    const selectId = await themeSelect.getAttribute('id');
    const labelFor = await label.evaluate((el) => {
      const labelEl = el.closest('label');
      return labelEl?.getAttribute('for');
    });

    expect(selectId).toBe(labelFor);
  });

  test('help link should have accessible attributes', async ({ page }) => {
    await page.goto('/');

    const helpLink = page.getByTestId('help-link');

    // External links should have proper security attributes
    await expect(helpLink).toHaveAttribute('target', '_blank');
    await expect(helpLink).toHaveAttribute('rel', 'noopener noreferrer');

    // Should be keyboard accessible (is a link)
    await expect(helpLink).toBeVisible();
  });

  test('error page should be accessible', async ({ page }) => {
    // Navigate to 404 page
    await page.goto('/this-page-does-not-exist', { waitUntil: 'networkidle' });

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
