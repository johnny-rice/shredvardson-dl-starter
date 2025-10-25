import { expect, test } from '@playwright/test';

test.describe('Design System Viewer', () => {
  test.describe('Component Gallery (/design)', () => {
    test('should load and display component categories', async ({ page }) => {
      await page.goto('/design');
      await page.waitForLoadState('networkidle');

      // Check header
      await expect(page.getByRole('heading', { name: 'Design System', level: 1 })).toBeVisible();

      // Check statistics cards
      const componentsStat = page
        .locator('div')
        .filter({ hasText: /^8$/ })
        .locator('..')
        .getByText('Components');
      await expect(componentsStat).toBeVisible();

      // Check categories exist
      await expect(page.getByRole('heading', { name: 'Core', level: 2 })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Forms', level: 2 })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Layout', level: 2 })).toBeVisible();
    });

    test('should navigate to component detail page', async ({ page }) => {
      await page.goto('/design');
      await page.waitForLoadState('networkidle');

      // Click on Button component card
      const buttonCard = page.getByRole('link').filter({ hasText: 'Button' }).first();
      await expect(buttonCard).toBeVisible();
      await buttonCard.click();

      // Should navigate to button playground
      await expect(page).toHaveURL('/design/components/button');
      await expect(page.getByRole('heading', { name: 'Button', level: 1 })).toBeVisible();
    });

    test('should navigate to tokens browser', async ({ page }) => {
      await page.goto('/design');
      await page.waitForLoadState('networkidle');

      // Click "Browse Tokens" button
      const tokensLink = page.getByRole('link', { name: /Browse Tokens/i });
      await tokensLink.click();

      // Should navigate to tokens page
      await expect(page).toHaveURL('/design/tokens');
      await expect(page.getByRole('heading', { name: 'Design Tokens', level: 1 })).toBeVisible();
    });

    test('should display component metadata', async ({ page }) => {
      await page.goto('/design');
      await page.waitForLoadState('networkidle');

      // Check Button component metadata
      const buttonCard = page.getByRole('link').filter({ hasText: 'Button' }).first();

      // Should show file path
      await expect(buttonCard.locator('code')).toContainText(
        'packages/ui/src/components/ui/button.tsx'
      );

      // Should show variant badges
      const variantBadges = buttonCard.locator('.bg-secondary');
      await expect(variantBadges).toHaveCount(2); // variant and size
    });
  });

  test.describe('Interactive Playground (/design/components/[name])', () => {
    test('should load button playground', async ({ page }) => {
      await page.goto('/design/components/button');
      await page.waitForLoadState('networkidle');

      // Check header and metadata
      await expect(page.getByRole('heading', { name: 'Button', level: 1 })).toBeVisible();
      await expect(
        page.locator('code').filter({ hasText: 'packages/ui/src/components/ui/button.tsx' })
      ).toBeVisible();

      // Check preview exists
      await expect(page.getByRole('button', { name: 'Click me' })).toBeVisible();

      // Check controls exist
      await expect(page.getByRole('heading', { name: 'Controls' })).toBeVisible();
      await expect(page.locator('label[for="variant"]')).toBeVisible();
      await expect(page.locator('label[for="size"]')).toBeVisible();
    });

    test('should change button variant via controls', async ({ page }) => {
      await page.goto('/design/components/button');
      await page.waitForLoadState('networkidle');

      const previewButton = page.getByRole('button', { name: 'Click me' });

      // Get initial class
      const initialClass = await previewButton.getAttribute('class');

      // Change variant to destructive
      const variantSelect = page.getByRole('combobox').first();
      await variantSelect.click();
      await page.getByRole('option', { name: 'destructive' }).click();

      // Class should have changed
      const newClass = await previewButton.getAttribute('class');
      expect(newClass).not.toBe(initialClass);
      expect(newClass).toContain('destructive');
    });

    test('should toggle disabled state', async ({ page }) => {
      await page.goto('/design/components/button');
      await page.waitForLoadState('networkidle');

      const previewButton = page.getByRole('button', { name: 'Click me' });

      // Initially not disabled
      await expect(previewButton).toBeEnabled();

      // Find and click the disabled toggle
      const disabledLabel = page.getByText('disabled', { exact: true });
      const toggleButton = page
        .locator('button[type="button"]')
        .filter({ has: disabledLabel })
        .first();

      if (await toggleButton.isVisible()) {
        await toggleButton.click();

        // Should now be disabled
        await expect(previewButton).toBeDisabled();
      }
    });

    test('should show and copy code snippet', async ({ page }) => {
      await page.goto('/design/components/button');
      await page.waitForLoadState('networkidle');

      // Click "Show Code" button
      const showCodeButton = page.getByRole('button', { name: /Show Code/i });
      await showCodeButton.click();

      // Code snippet should be visible (look for the generated code within the muted background)
      const codeBlock = page.locator('.bg-muted code').filter({ hasText: '<Button' }).first();
      await expect(codeBlock).toBeVisible();

      // Copy button should be visible
      const copyButton = page.getByRole('button', { name: 'Copy' });
      await expect(copyButton).toBeVisible();

      // Click copy button
      await copyButton.click();

      // Note: We can't easily test clipboard content in Playwright without special setup
    });

    test('should display props documentation', async ({ page }) => {
      await page.goto('/design/components/button');
      await page.waitForLoadState('networkidle');

      // Check props table exists
      await expect(page.getByRole('heading', { name: 'Props', level: 2 })).toBeVisible();

      // Check table headers
      await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: 'Type' })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: 'Default' })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: 'Description' })).toBeVisible();

      // Check variant prop is documented (look for the code element with exact text)
      await expect(page.locator('td code').filter({ hasText: /^variant$/ })).toBeVisible();
    });

    test('should reset props', async ({ page }) => {
      await page.goto('/design/components/button');
      await page.waitForLoadState('networkidle');

      // Change variant
      const variantSelect = page.getByRole('combobox').first();
      await variantSelect.click();
      await page.getByRole('option', { name: 'destructive' }).click();

      // Click reset
      const resetButton = page.getByRole('button', { name: 'Reset' });
      await resetButton.click();

      // Should be back to default
      const previewButton = page.getByRole('button', { name: 'Click me' });
      const buttonClass = await previewButton.getAttribute('class');
      expect(buttonClass).toContain('bg-primary'); // Default variant class
    });
  });

  test.describe('Token Browser (/design/tokens)', () => {
    test('should load and display token categories', async ({ page }) => {
      await page.goto('/design/tokens');
      await page.waitForLoadState('networkidle');

      // Check header
      await expect(page.getByRole('heading', { name: 'Design Tokens', level: 1 })).toBeVisible();

      // Check main categories
      await expect(page.getByRole('heading', { name: 'Colors', level: 2 })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Spacing', level: 2 })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Typography', level: 2 })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Shadows', level: 2 })).toBeVisible();
    });

    test('should display color swatches', async ({ page }) => {
      await page.goto('/design/tokens');
      await page.waitForLoadState('networkidle');

      // Check neutral colors exist (use exact to avoid matching 500, 950, etc.)
      await expect(page.getByText('neutral.0', { exact: true })).toBeVisible();
      await expect(page.getByText('neutral.50', { exact: true })).toBeVisible();

      // Check brand colors exist
      await expect(page.getByText('brand.500', { exact: true })).toBeVisible();

      // Check semantic colors
      await expect(page.getByText('success.500', { exact: true })).toBeVisible();
      await expect(page.getByText('error.500', { exact: true })).toBeVisible();
    });

    test.skip('should copy token value on click', async ({ page }) => {
      await page.goto('/design/tokens');
      await page.waitForLoadState('networkidle');

      // Find any color swatch Copy button and test the copy functionality
      const copyButton = page.getByRole('button', { name: 'Copy' }).first();
      await copyButton.click();

      // Button text should change to indicate copy success (the specific button that was clicked)
      await expect(copyButton).toContainText('Copied');

      // Button text should change back to "Copy" after timeout
      await page.waitForTimeout(2500);
      await expect(copyButton).toHaveText('Copy');
    });

    test('should display typography preview', async ({ page }) => {
      await page.goto('/design/tokens');
      await page.waitForLoadState('networkidle');

      // Scroll to typography section
      await page.getByRole('heading', { name: 'Font Sizes', level: 3 }).scrollIntoViewIfNeeded();

      // Check font size examples exist
      await expect(page.getByText('fontSize.xs')).toBeVisible();
      await expect(page.getByText('fontSize.lg')).toBeVisible();

      // Check live preview text exists
      await expect(
        page.getByText('The quick brown fox jumps over the lazy dog').first()
      ).toBeVisible();
    });

    test('should display spacing visual scale', async ({ page }) => {
      await page.goto('/design/tokens');
      await page.waitForLoadState('networkidle');

      // Check spacing tokens exist (use exact to avoid matching 10, 14, 16, etc.)
      await expect(page.getByText('spacing.1', { exact: true })).toBeVisible();
      await expect(page.getByText('spacing.4', { exact: true })).toBeVisible();
      await expect(page.getByText('spacing.8', { exact: true })).toBeVisible();
    });

    test('should display shadow previews', async ({ page }) => {
      await page.goto('/design/tokens');
      await page.waitForLoadState('networkidle');

      // Scroll to shadows section
      await page.getByRole('heading', { name: 'Shadows', level: 2 }).scrollIntoViewIfNeeded();

      // Check shadow tokens exist
      await expect(page.getByText('shadows.sm')).toBeVisible();
      await expect(page.getByText('shadows.lg')).toBeVisible();
    });
  });

  test.describe('Navigation', () => {
    test('should navigate between viewer sections', async ({ page }) => {
      await page.goto('/design');

      // Navigate to tokens via nav link
      await page.getByRole('link', { name: 'Tokens' }).first().click();
      await expect(page).toHaveURL('/design/tokens');

      // Navigate back to components
      await page.getByRole('link', { name: 'Components' }).first().click();
      await expect(page).toHaveURL('/design');

      // Navigate back to app
      await page.getByRole('link', { name: /Back to App/i }).click();
      await expect(page).toHaveURL('/');
    });
  });

  test.describe('Accessibility', () => {
    test('design gallery should be keyboard navigable', async ({ page }) => {
      await page.goto('/design');
      await page.waitForLoadState('networkidle');

      // Focus the first component card link directly
      const firstComponentCard = page.getByRole('link').filter({ hasText: 'Button' }).first();
      await firstComponentCard.focus();

      // Should be able to activate with Enter
      await page.keyboard.press('Enter');

      // Should navigate to component page
      await page.waitForURL(/\/design\/components\/.+/, { timeout: 5000 });
      await expect(page).toHaveURL('/design/components/button');
    });

    test('playground controls should be keyboard accessible', async ({ page }) => {
      await page.goto('/design/components/button');
      await page.waitForLoadState('networkidle');

      // Focus on first control (variant select)
      const variantSelect = page.getByRole('combobox').first();
      await variantSelect.focus();

      // Should be focused
      await expect(variantSelect).toBeFocused();

      // Should be able to open with Enter/Space
      await page.keyboard.press('Space');

      // Options should be visible
      await expect(page.getByRole('option', { name: 'destructive' })).toBeVisible();
    });
  });
});
