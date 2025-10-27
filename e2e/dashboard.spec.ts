import { expect, test } from '@playwright/test';

test('dashboard responds 200', async ({ page }) => {
  const res = await page.goto('/dashboard');
  expect(res?.ok()).toBe(true);
});
