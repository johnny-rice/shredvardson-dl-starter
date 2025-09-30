'use client';

import { ChartData } from '@shared/types';

interface AnalyticsChartProps {
  data: ChartData;
  testId?: string;
}

export function AnalyticsChart({ data, testId }: AnalyticsChartProps) {
  const { title, data: chartData } = data;

  if (!chartData.length) {
    return (
      <div className="p-4" data-testid={testId}>
        <h3 className="text-lg font-medium text-[hsl(var(--text))] mb-4">{title}</h3>
        <p className="text-[hsl(var(--text-muted))] text-center py-8">No data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...chartData.map((d) => d.value));
  const barHeight = 24;
  const labelWidth = 120;
  const chartWidth = 300;

  return (
    <div className="p-4" data-testid={testId}>
      <h3 className="text-lg font-medium text-[hsl(var(--text))] mb-4">{title}</h3>

      <div className="space-y-4">
        {chartData.map((item, index) => {
          const barWidth = maxValue > 0 ? (item.value / maxValue) * chartWidth : 0;

          return (
            <div key={index} className="flex items-center space-x-3">
              <div
                className="text-sm text-[hsl(var(--text-muted))] truncate"
                style={{ width: labelWidth }}
                title={item.label}
              >
                {item.label}
              </div>
              <div className="flex-1 relative">
                <div
                  className="bg-[hsl(var(--primary))] rounded-sm transition-all duration-300"
                  style={{
                    width: Math.max(barWidth, 2), // Minimum 2px width for visibility
                    height: barHeight,
                  }}
                />
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-white font-medium">
                  {item.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {chartData.length === 0 && (
        <div className="text-center py-8 text-[hsl(var(--text-muted))]">No data to display</div>
      )}
    </div>
  );
}
