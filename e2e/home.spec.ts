import { expect, test } from '@playwright/test';

test('home loads and title comes from env', async ({ page }) => {
  const res = await page.goto('/');
  expect(res?.ok()).toBe(true);
  await expect(page).toHaveTitle(/DL Starter/i); // from NEXT_PUBLIC_APP_NAME in .env.example
});
