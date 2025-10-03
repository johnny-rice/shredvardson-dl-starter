import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/');

    // Verify page loads without errors (use regex to match absolute URL)
    await expect(page).toHaveURL(/\/$/);

    // Check for main content using data-testid
    await expect(page.getByTestId('smoke')).toBeVisible();

    // Verify hero text is present
    await expect(
      page.getByRole('heading', { name: /Ship Faster with AI-Ready Code/i })
    ).toBeVisible();
  });

  test('header navigation is visible', async ({ page }) => {
    await page.goto('/');

    // Verify header with theme toggle and links
    await expect(page.getByText('Your Starter')).toBeVisible();
    await expect(page.getByRole('combobox')).toBeVisible(); // Theme selector
  });

  test('404 page works', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist');

    // Verify 404 response
    expect(response?.status()).toBe(404);
  });

  test('health endpoint responds', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.status).toBe('ok');
  });
});
