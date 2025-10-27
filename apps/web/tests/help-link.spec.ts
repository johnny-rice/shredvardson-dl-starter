import { expect, test } from '@playwright/test';

test.describe('Help Link', () => {
  test('should render Help link in header and return 200 status', async ({ page }) => {
    // Navigate to dashboard page
    await page.goto('/dashboard');

    // Assert Help link is visible
    const helpLink = page.getByTestId('help-link');
    await expect(helpLink).toBeVisible();
    await expect(helpLink).toHaveText('Help');

    // Check the href attribute points to wiki Home
    await expect(helpLink).toHaveAttribute(
      'href',
      'https://github.com/Shredvardson/dl-starter/wiki/Home'
    );

    // Check that target and rel attributes are set correctly for security
    await expect(helpLink).toHaveAttribute('target', '_blank');
    const rel = (await helpLink.getAttribute('rel')) || '';
    expect(rel.split(/\s+/)).toEqual(expect.arrayContaining(['noopener', 'noreferrer']));

    // Test that the link responds with 200 (using HEAD request to avoid following redirect)
    const linkUrl = await helpLink.getAttribute('href');
    if (linkUrl) {
      const response = await page.request.head(linkUrl);
      expect(response.status()).toBe(200);
    }
  });

  test('should open wiki in new tab when clicked', async ({ page, context }) => {
    await page.goto('/dashboard');

    const helpLink = page.getByTestId('help-link');
    await expect(helpLink).toBeVisible();

    // Listen for new page events
    const pagePromise = context.waitForEvent('page');
    await helpLink.click();

    // Verify new page opens with correct URL (GitHub may redirect, so check for wiki path)
    const newPage = await pagePromise;
    await newPage.waitForLoadState();
    expect(newPage.url()).toContain('github.com/Shredvardson/dl-starter');
  });
});
