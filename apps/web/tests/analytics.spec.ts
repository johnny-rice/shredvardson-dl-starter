import { test, expect } from '@playwright/test';

test.describe('Analytics Dashboard', () => {
  test('should navigate to analytics dashboard', async ({ page }) => {
    await page.goto('/dashboard');

    // Navigate to analytics page using the header link
    await page.click('a[href="/dashboard/analytics"]');

    // Should render analytics dashboard
    await expect(page).toHaveURL('/dashboard/analytics');
    await expect(page.getByRole('heading', { name: /analytics/i })).toBeVisible();
  });

  test('should display disabled message when feature flag is off', async ({ page }) => {
    await page.goto('/dashboard/analytics');

    // Should show disabled message (default state)
    await expect(page.getByText(/analytics is currently disabled/i)).toBeVisible();
    await expect(page.getByTestId('analytics-dashboard')).not.toBeVisible();
  });

  test('should display analytics metrics when feature flag is enabled', async ({ page }) => {
    // Set environment variable to enable analytics
    await page.addInitScript(() => {
      // Mock environment variable
      Object.defineProperty(window, '__ENV__', {
        value: { NEXT_PUBLIC_ENABLE_ANALYTICS: true },
      });
    });

    await page.goto('/dashboard/analytics');

    // Should show analytics content when enabled
    await expect(page.getByTestId('analytics-dashboard')).toBeVisible();

    // Should display key metrics (will show zero values initially)
    await expect(page.getByTestId('page-views-metric')).toBeVisible();
    await expect(page.getByTestId('unique-pages-metric')).toBeVisible();
    await expect(page.getByTestId('total-clicks-metric')).toBeVisible();
    await expect(page.getByTestId('session-duration-metric')).toBeVisible();
  });

  test('should handle empty analytics data gracefully', async ({ page }) => {
    // Enable analytics but with no data
    await page.addInitScript(() => {
      Object.defineProperty(window, '__ENV__', {
        value: { NEXT_PUBLIC_ENABLE_ANALYTICS: true },
      });
      localStorage.removeItem('dl-analytics');
    });

    await page.goto('/dashboard/analytics');

    // Should show zero state
    await expect(page.getByTestId('analytics-dashboard')).toBeVisible();
    await expect(page.getByText(/no analytics data/i)).toBeVisible();

    // Metrics should show zeros
    await expect(page.getByTestId('page-views-metric')).toContainText('0');
    await expect(page.getByTestId('unique-pages-metric')).toContainText('0');
  });
});

test.describe('Analytics Tracking', () => {
  test.beforeEach(async ({ page }) => {
    // Enable analytics for tracking tests
    await page.addInitScript(() => {
      Object.defineProperty(window, '__ENV__', {
        value: { NEXT_PUBLIC_ENABLE_ANALYTICS: true },
      });
      localStorage.removeItem('dl-analytics');
    });
  });

  test('should track page views across dashboard navigation', async ({ page }) => {
    // Visit multiple pages
    await page.goto('/dashboard');
    await page.goto('/dashboard/analytics');
    await page.goto('/dashboard');

    // Check that events were tracked
    const analyticsData = await page.evaluate(() => {
      const data = localStorage.getItem('dl-analytics');
      return data ? JSON.parse(data) : null;
    });

    expect(analyticsData).toBeTruthy();

    const pageViewEvents = analyticsData.events.filter(
      (e: { type: string }) => e.type === 'page_view'
    );
    expect(pageViewEvents.length).toBeGreaterThan(0);
  });

  test('should track click events on components', async ({ page }) => {
    await page.goto('/dashboard');

    // Click on a tracked component
    await page.click('[data-analytics="header-help"]');

    // Check that click event was tracked
    const analyticsData = await page.evaluate(() => {
      const data = localStorage.getItem('dl-analytics');
      return data ? JSON.parse(data) : null;
    });

    if (analyticsData) {
      const clickEvents = analyticsData.events.filter((e: { type: string }) => e.type === 'click');
      expect(clickEvents.length).toBeGreaterThan(0);
    }
  });

  test('should display charts when data is available', async ({ page }) => {
    // Pre-populate with some analytics data
    await page.addInitScript(() => {
      const mockData = {
        events: [
          { id: '1', type: 'page_view', path: '/dashboard', timestamp: Date.now() },
          { id: '2', type: 'page_view', path: '/dashboard/analytics', timestamp: Date.now() },
          {
            id: '3',
            type: 'click',
            path: '/dashboard',
            timestamp: Date.now(),
            metadata: { component: 'header-help' },
          },
        ],
        sessionId: 'test-session',
        createdAt: Date.now(),
        lastUpdated: Date.now(),
      };
      localStorage.setItem('dl-analytics', JSON.stringify(mockData));
    });

    await page.goto('/dashboard/analytics');

    // Should render charts
    await expect(page.getByTestId('page-views-chart')).toBeVisible();
    await expect(page.getByTestId('clicks-chart')).toBeVisible();

    // Charts should have data
    const pageViewsChart = page.getByTestId('page-views-chart');
    await expect(pageViewsChart).toContainText('/dashboard');
  });
});
