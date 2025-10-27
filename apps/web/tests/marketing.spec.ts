import { expect, test } from '@playwright/test';

test.describe('Marketing Page', () => {
  test('hero heading renders correctly', async ({ page }) => {
    await page.goto('/');

    // Assert hero heading is visible
    await expect(
      page.getByRole('heading', { name: /ship faster with ai-ready code/i, level: 1 })
    ).toBeVisible();
  });

  test('three benefits section exists', async ({ page }) => {
    await page.goto('/');

    // Assert all three benefit cards are present
    await expect(page.getByText('⚡ Zero Bloat')).toBeVisible();
    await expect(page.getByText('🤖 AI-Optimized')).toBeVisible();
    await expect(page.getByText('🔧 Recipe-Driven')).toBeVisible();
  });

  test('primary CTA points to docs', async ({ page }) => {
    await page.goto('/');

    // Assert primary CTA link exists and points to docs
    const getStartedLink = page.getByRole('link', { name: /get started/i });
    await expect(getStartedLink).toBeVisible();
    await expect(getStartedLink).toHaveAttribute('href', '/docs');
  });

  test('view docs link exists', async ({ page }) => {
    await page.goto('/');

    // Assert secondary CTA exists
    await expect(page.getByRole('link', { name: /view docs/i })).toBeVisible();
  });
});
