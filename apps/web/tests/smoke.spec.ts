import { expect, test } from '@playwright/test';

test('homepage renders', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('smoke')).toBeVisible();
});

test('/api/health returns ok', async ({ request }) => {
  const res = await request.get('/api/health');
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json.ok).toBeTruthy();
});
