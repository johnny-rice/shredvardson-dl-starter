/**
 * Tremor Component Examples
 *
 * Demonstrates Tremor chart components available via /design import tremor <ComponentName>
 */

'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/src/components/ui/card';
import { LineChart } from '@ui/src/components/ui/line-chart/line-chart';
import Link from 'next/link';

const sampleData = [
  { month: 'Jan', Revenue: 2400, Expenses: 1200 },
  { month: 'Feb', Revenue: 1398, Expenses: 800 },
  { month: 'Mar', Revenue: 9800, Expenses: 5200 },
  { month: 'Apr', Revenue: 3908, Expenses: 2100 },
  { month: 'May', Revenue: 4800, Expenses: 2800 },
  { month: 'Jun', Revenue: 3800, Expenses: 2200 },
];

export default function TremorExamplesPage() {
  return (
    <div className="container mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/design"
          className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block"
        >
          ← Back to Design System
        </Link>
        <h1 className="text-4xl font-bold tracking-tight mb-2">Tremor Components</h1>
        <p className="text-lg text-muted-foreground mb-4">
          Chart and data visualization components from Tremor
        </p>
        <div className="flex gap-4 text-sm">
          <a
            href="https://tremor.so/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            View Tremor Docs →
          </a>
          <Link
            href="/docs/design/EXTERNAL_LIBRARIES.md"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            View Integration Guide →
          </Link>
        </div>
      </div>

      {/* Import Instructions */}
      <Card className="mb-8 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="text-lg">How to Import Tremor Components</CardTitle>
          <CardDescription>
            Use the /design import command to add Tremor components to your project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <code className="text-sm bg-white dark:bg-gray-900 px-3 py-1.5 rounded border">
                /design import tremor LineChart
              </code>
              <p className="text-xs text-muted-foreground mt-1">
                Installs dependencies and creates component wrapper
              </p>
            </div>
            <div className="text-sm space-y-1 text-muted-foreground">
              <p>
                <strong>Available components:</strong>
              </p>
              <ul className="list-disc list-inside ml-2 space-y-0.5">
                <li>LineChart - Time series visualization</li>
                <li>BarChart - Categorical comparisons</li>
                <li>AreaChart - Cumulative trends</li>
                <li>DonutChart - Proportional data</li>
                <li>KpiCard - Key metrics display</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Example: LineChart (Imported) */}
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>LineChart Example</CardTitle>
            <CardDescription>Revenue vs Expenses over time (imported component)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <LineChart
                data={sampleData}
                index="month"
                categories={['Revenue', 'Expenses']}
                colors={['blue', 'rose']}
                valueFormatter={(value) => `$${value.toLocaleString()}`}
                showLegend={true}
                showGridLines={true}
              />
            </div>
            <div className="mt-4 space-y-3">
              <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  ✅ Design Token Integration
                </p>
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  Tremor colors automatically use our design system via{' '}
                  <code className="text-xs bg-white dark:bg-gray-900 px-1 rounded">
                    tailwind.config.ts
                  </code>{' '}
                  mappings. Charts adapt to light/dark mode seamlessly.
                </p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Import code:</strong>
                </p>
                <code className="text-xs block mt-1">
                  {`import { LineChart } from '@ui/components';`}
                </code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Placeholder Cards for Other Components */}
        <Card className="opacity-60">
          <CardHeader>
            <CardTitle>BarChart Example</CardTitle>
            <CardDescription>Import this component to see examples</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center bg-muted/30 rounded-lg border-2 border-dashed">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Not yet imported</p>
                <code className="text-xs bg-background px-2 py-1 rounded">
                  /design import tremor BarChart
                </code>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="opacity-60">
          <CardHeader>
            <CardTitle>AreaChart Example</CardTitle>
            <CardDescription>Import this component to see examples</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center bg-muted/30 rounded-lg border-2 border-dashed">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Not yet imported</p>
                <code className="text-xs bg-background px-2 py-1 rounded">
                  /design import tremor AreaChart
                </code>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="opacity-60">
            <CardHeader>
              <CardTitle className="text-lg">DonutChart Example</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-32 flex items-center justify-center bg-muted/30 rounded-lg border-2 border-dashed">
                <code className="text-xs">Not imported</code>
              </div>
            </CardContent>
          </Card>

          <Card className="opacity-60">
            <CardHeader>
              <CardTitle className="text-lg">KpiCard Example</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-32 flex items-center justify-center bg-muted/30 rounded-lg border-2 border-dashed">
                <code className="text-xs">Not imported</code>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
