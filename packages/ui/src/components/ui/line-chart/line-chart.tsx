'use client';

import { LineChart as TremorLineChart } from '@tremor/react';

export interface LineChartProps {
  data: Array<Record<string, number | string>>;
  index: string;
  categories: string[];
  /**
   * Color scheme for the chart lines.
   * Uses Tremor's color palette which maps to our design tokens via tailwind.config.ts
   * @default ['blue', 'cyan', 'indigo'] - Tremor colors themed to our design system
   */
  colors?: string[];
  valueFormatter?: (value: number) => string;
  className?: string;
  showLegend?: boolean;
  showGridLines?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
}

/**
 * LineChart component using Tremor
 *
 * Colors are themed via tailwind.config.ts mappings:
 * - Tremor colors (blue, cyan, etc.) use our design tokens
 * - Charts automatically match light/dark mode
 *
 * @example
 * ```tsx
 * <LineChart
 *   data={salesData}
 *   index="month"
 *   categories={['revenue', 'expenses']}
 *   colors={['blue', 'red']}
 * />
 * ```
 */
export function LineChart({
  data,
  index,
  categories,
  colors = ['blue', 'cyan', 'indigo'],
  valueFormatter,
  className,
  showLegend = true,
  showGridLines = true,
  showXAxis = true,
  showYAxis = true,
}: LineChartProps) {
  return (
    <TremorLineChart
      data={data}
      index={index}
      categories={categories}
      colors={colors}
      valueFormatter={valueFormatter}
      className={className}
      showLegend={showLegend}
      showGridLines={showGridLines}
      showXAxis={showXAxis}
      showYAxis={showYAxis}
    />
  );
}
