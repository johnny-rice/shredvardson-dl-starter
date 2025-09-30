'use client';

import { useEffect, useState } from 'react';
import { AnalyticsMetrics, ChartData } from '@shared/types';
import { getAnalyticsData, calculateMetrics, reportMetricsToTelemetry } from '@/lib/analytics';
import { AnalyticsChart } from '@/components/AnalyticsChart';
import { env } from '@/lib/env';

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const enabled = env.NEXT_PUBLIC_ENABLE_ANALYTICS;

  useEffect(() => {
    if (enabled) {
      const data = getAnalyticsData();
      const calculatedMetrics = calculateMetrics(data);
      setMetrics(calculatedMetrics);

      // Report metrics to telemetry when analytics dashboard is viewed
      // Only if we have meaningful data (more than just the current page view)
      if (calculatedMetrics.totalPageViews > 1 || calculatedMetrics.totalClicks > 0) {
        reportMetricsToTelemetry(calculatedMetrics);
      }
    }
    setLoading(false);
  }, [enabled]);

  if (loading) {
    return (
      <div className="min-h-dvh p-8 bg-[hsl(var(--bg))]">
        <h1 className="text-2xl font-semibold text-[hsl(var(--text))] mb-2">Analytics</h1>
        <p className="text-[hsl(var(--text-muted))]">Loading analytics data...</p>
      </div>
    );
  }

  if (!enabled) {
    return (
      <div className="min-h-dvh p-8 bg-[hsl(var(--bg))]">
        <h1 className="text-2xl font-semibold text-[hsl(var(--text))] mb-2">Analytics</h1>
        <div className="bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-[var(--radius-lg)] p-6">
          <p className="text-[hsl(var(--text-muted))]">
            Analytics is currently disabled. Enable it by setting{' '}
            <code className="bg-[hsl(var(--muted))] px-2 py-1 rounded text-sm">
              NEXT_PUBLIC_ENABLE_ANALYTICS=true
            </code>{' '}
            in your environment variables.
          </p>
        </div>
      </div>
    );
  }

  const hasData = metrics && (metrics.totalPageViews > 0 || metrics.totalClicks > 0);

  const pageViewsChartData: ChartData = {
    title: 'Page Views',
    type: 'bar',
    data:
      metrics?.topPages.map((page: { path: string; views: number }) => ({
        label: page.path,
        value: page.views,
      })) || [],
  };

  const clicksChartData: ChartData = {
    title: 'Clicks by Component',
    type: 'bar',
    data:
      metrics?.clicksByComponent.map((item: { component: string; clicks: number }) => ({
        label: item.component,
        value: item.clicks,
      })) || [],
  };

  return (
    <div className="min-h-dvh p-8 bg-[hsl(var(--bg))]">
      <h1 className="text-2xl font-semibold text-[hsl(var(--text))] mb-6">Analytics</h1>

      <div data-testid="analytics-dashboard">
        {!hasData ? (
          <div className="bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-[var(--radius-lg)] p-8 text-center">
            <p className="text-[hsl(var(--text-muted))] text-lg mb-2">No analytics data yet</p>
            <p className="text-[hsl(var(--text-muted))] text-sm">
              Start navigating the dashboard to collect usage metrics.
            </p>
          </div>
        ) : (
          <>
            {/* Metrics Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <MetricCard
                title="Page Views"
                value={metrics.totalPageViews}
                testId="page-views-metric"
              />
              <MetricCard
                title="Unique Pages"
                value={metrics.uniquePages}
                testId="unique-pages-metric"
              />
              <MetricCard
                title="Total Clicks"
                value={metrics.totalClicks}
                testId="total-clicks-metric"
              />
              <MetricCard
                title="Avg Session (ms)"
                value={Math.round(metrics.averageSessionDuration)}
                testId="session-duration-metric"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-[var(--radius-lg)] p-6">
                <AnalyticsChart data={pageViewsChartData} testId="page-views-chart" />
              </div>
              <div className="bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-[var(--radius-lg)] p-6">
                <AnalyticsChart data={clicksChartData} testId="clicks-chart" />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: number;
  testId: string;
}

function MetricCard({ title, value, testId }: MetricCardProps) {
  return (
    <div
      className="bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-[var(--radius-lg)] p-4"
      data-testid={testId}
    >
      <h3 className="text-sm font-medium text-[hsl(var(--text-muted))] mb-1">{title}</h3>
      <p className="text-2xl font-semibold text-[hsl(var(--text))]">{value.toLocaleString()}</p>
    </div>
  );
}
