#!/usr/bin/env tsx

/**
 * External Component Import Script
 * Phase 4.2: Import components from Tremor, TanStack Table, dnd-kit
 * Handles dependency installation and template generation
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execSync } from 'child_process';
import { createSafeComponentPath } from './utils.js';

// ESM-compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load component registry
const registryPath = path.join(__dirname, '../component-registry.json');

if (!fs.existsSync(registryPath)) {
  console.error(`❌ Registry file not found: ${registryPath}`);
  process.exit(1);
}

let registry;
try {
  registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
} catch (error) {
  console.error(`❌ Failed to parse registry: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}

// Templates directory
const templatesDir = path.join(__dirname, '../templates');

/**
 * Load a component template from a JSON file
 *
 * @param source - The template source (e.g., 'tremor', 'tanstack', 'dndkit')
 * @param componentName - The component name in PascalCase (e.g., 'LineChart')
 * @returns The parsed template object or null if not found
 *
 * @example
 * ```ts
 * const template = loadTemplate('tremor', 'LineChart');
 * // Returns: { component: '...', test: '...', viewerExamples: [...], dependencies: [...] }
 * ```
 */
function loadTemplate(source: string, componentName: string) {
  const kebabName = componentName
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();
  const templatePath = path.join(templatesDir, source, `${kebabName}.json`);

  if (!fs.existsSync(templatePath)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(templatePath, 'utf-8'));
  } catch (error) {
    console.error(`❌ Failed to parse template file: ${templatePath}`);
    console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

/**
 * Get list of available template names for a given source
 *
 * @param source - The template source (e.g., 'tremor', 'tanstack', 'dndkit')
 * @returns Array of component names in PascalCase
 *
 * @example
 * ```ts
 * const templates = getAvailableTemplates('tremor');
 * // Returns: ['LineChart', 'BarChart', 'AreaChart', ...]
 * ```
 */
function getAvailableTemplates(source: string): string[] {
  const sourceDir = path.join(templatesDir, source);
  if (!fs.existsSync(sourceDir)) {
    return [];
  }

  return fs.readdirSync(sourceDir)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      const kebab = f.replace('.json', '');
      return kebab.replace(/(-|_|^)(\w)/g, (_, __, c) => c.toUpperCase());
    });
}

// Legacy inline templates (will be moved to template files)
const tremorTemplates = {
  LineChart: {
    component: `"use client";

import { LineChart as TremorLineChart } from "@tremor/react";

export interface LineChartProps {
  data: Array<Record<string, any>>;
  index: string;
  categories: string[];
  colors?: string[];
  valueFormatter?: (value: number) => string;
  className?: string;
  showLegend?: boolean;
  showGridLines?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
}

export function LineChart({
  data,
  index,
  categories,
  colors = ["blue", "green", "purple"],
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
}`,
    story: `import type { Meta, StoryObj } from '@storybook/react';
import { LineChart } from './line-chart';

const meta: Meta<typeof LineChart> = {
  title: 'Charts/LineChart',
  component: LineChart,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LineChart>;

const sampleData = [
  { date: 'Jan', Revenue: 2400, Profit: 1200 },
  { date: 'Feb', Revenue: 1398, Profit: 800 },
  { date: 'Mar', Revenue: 9800, Profit: 5200 },
  { date: 'Apr', Revenue: 3908, Profit: 2100 },
  { date: 'May', Revenue: 4800, Profit: 2800 },
  { date: 'Jun', Revenue: 3800, Profit: 2200 },
];

export const Default: Story = {
  args: {
    data: sampleData,
    index: 'date',
    categories: ['Revenue', 'Profit'],
    colors: ['blue', 'green'],
  },
};

export const WithFormatter: Story = {
  args: {
    data: sampleData,
    index: 'date',
    categories: ['Revenue', 'Profit'],
    colors: ['blue', 'green'],
    valueFormatter: (value) => \`$\${value.toLocaleString()}\`,
  },
};

export const NoLegend: Story = {
  args: {
    data: sampleData,
    index: 'date',
    categories: ['Revenue', 'Profit'],
    showLegend: false,
  },
};`,
    test: `import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LineChart } from './line-chart';

describe('LineChart', () => {
  const mockData = [
    { date: 'Jan', value: 100 },
    { date: 'Feb', value: 200 },
  ];

  it('renders without crashing', () => {
    render(
      <LineChart
        data={mockData}
        index="date"
        categories={['value']}
      />
    );
  });

  it('accepts custom className', () => {
    const { container } = render(
      <LineChart
        data={mockData}
        index="date"
        categories={['value']}
        className="custom-class"
      />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });
});`,
  },
  BarChart: {
    component: `"use client";

import { BarChart as TremorBarChart } from "@tremor/react";

export interface BarChartProps {
  data: Array<Record<string, any>>;
  index: string;
  categories: string[];
  colors?: string[];
  valueFormatter?: (value: number) => string;
  className?: string;
  showLegend?: boolean;
  showGridLines?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  layout?: "vertical" | "horizontal";
}

export function BarChart({
  data,
  index,
  categories,
  colors = ["blue", "green", "purple"],
  valueFormatter,
  className,
  showLegend = true,
  showGridLines = true,
  showXAxis = true,
  showYAxis = true,
  layout = "vertical",
}: BarChartProps) {
  return (
    <TremorBarChart
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
      layout={layout}
    />
  );
}`,
    story: `import type { Meta, StoryObj } from '@storybook/react';
import { BarChart } from './bar-chart';

const meta: Meta<typeof BarChart> = {
  title: 'Charts/BarChart',
  component: BarChart,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BarChart>;

const sampleData = [
  { category: 'Sales', 'Q1': 2400, 'Q2': 1398, 'Q3': 9800, 'Q4': 3908 },
  { category: 'Marketing', 'Q1': 1200, 'Q2': 800, 'Q3': 5200, 'Q4': 2100 },
];

export const Default: Story = {
  args: {
    data: sampleData,
    index: 'category',
    categories: ['Q1', 'Q2', 'Q3', 'Q4'],
    colors: ['blue', 'green', 'purple', 'amber'],
  },
};

export const Horizontal: Story = {
  args: {
    data: sampleData,
    index: 'category',
    categories: ['Q1', 'Q2', 'Q3', 'Q4'],
    layout: 'horizontal',
  },
};`,
    test: `import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BarChart } from './bar-chart';

describe('BarChart', () => {
  const mockData = [
    { category: 'A', value: 100 },
    { category: 'B', value: 200 },
  ];

  it('renders without crashing', () => {
    render(
      <BarChart
        data={mockData}
        index="category"
        categories={['value']}
      />
    );
  });
});`,
  },
  AreaChart: {
    component: `"use client";

import { AreaChart as TremorAreaChart } from "@tremor/react";

export interface AreaChartProps {
  data: Array<Record<string, any>>;
  index: string;
  categories: string[];
  colors?: string[];
  valueFormatter?: (value: number) => string;
  className?: string;
  showLegend?: boolean;
  showGridLines?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  curveType?: "linear" | "monotone" | "step";
}

export function AreaChart({
  data,
  index,
  categories,
  colors = ["blue", "green", "purple"],
  valueFormatter,
  className,
  showLegend = true,
  showGridLines = true,
  showXAxis = true,
  showYAxis = true,
  curveType = "monotone",
}: AreaChartProps) {
  return (
    <TremorAreaChart
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
      curveType={curveType}
    />
  );
}`,
    story: `import type { Meta, StoryObj } from '@storybook/react';
import { AreaChart } from './area-chart';

const meta: Meta<typeof AreaChart> = {
  title: 'Charts/AreaChart',
  component: AreaChart,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AreaChart>;

const sampleData = [
  { month: 'Jan', Desktop: 2400, Mobile: 1800 },
  { month: 'Feb', Desktop: 1398, Mobile: 1200 },
  { month: 'Mar', Desktop: 9800, Mobile: 7200 },
  { month: 'Apr', Desktop: 3908, Mobile: 3100 },
  { month: 'May', Desktop: 4800, Mobile: 3800 },
];

export const Default: Story = {
  args: {
    data: sampleData,
    index: 'month',
    categories: ['Desktop', 'Mobile'],
    colors: ['blue', 'purple'],
  },
};

export const WithCurveType: Story = {
  args: {
    data: sampleData,
    index: 'month',
    categories: ['Desktop', 'Mobile'],
    curveType: 'step',
  },
};`,
    test: `import { describe, it } from 'vitest';
import { render } from '@testing-library/react';
import { AreaChart } from './area-chart';

describe('AreaChart', () => {
  const mockData = [
    { date: 'Jan', value: 100 },
    { date: 'Feb', value: 200 },
  ];

  it('renders without crashing', () => {
    render(
      <AreaChart
        data={mockData}
        index="date"
        categories={['value']}
      />
    );
  });
});`,
  },
  DonutChart: {
    component: `"use client";

import { DonutChart as TremorDonutChart } from "@tremor/react";

export interface DonutChartProps {
  data: Array<{ name: string; value: number; [key: string]: any }>;
  category?: string;
  index?: string;
  colors?: string[];
  valueFormatter?: (value: number) => string;
  className?: string;
  showLabel?: boolean;
  showAnimation?: boolean;
}

export function DonutChart({
  data,
  category = "value",
  index = "name",
  colors = ["blue", "green", "purple", "amber", "red"],
  valueFormatter,
  className,
  showLabel = true,
  showAnimation = true,
}: DonutChartProps) {
  return (
    <TremorDonutChart
      data={data}
      category={category}
      index={index}
      colors={colors}
      valueFormatter={valueFormatter}
      className={className}
      showLabel={showLabel}
      showAnimation={showAnimation}
    />
  );
}`,
    story: `import type { Meta, StoryObj } from '@storybook/react';
import { DonutChart } from './donut-chart';

const meta: Meta<typeof DonutChart> = {
  title: 'Charts/DonutChart',
  component: DonutChart,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DonutChart>;

const sampleData = [
  { name: 'Desktop', value: 45 },
  { name: 'Mobile', value: 35 },
  { name: 'Tablet', value: 15 },
  { name: 'Other', value: 5 },
];

export const Default: Story = {
  args: {
    data: sampleData,
  },
};

export const WithFormatter: Story = {
  args: {
    data: sampleData,
    valueFormatter: (value) => \`\${value}%\`,
  },
};`,
    test: `import { describe, it } from 'vitest';
import { render } from '@testing-library/react';
import { DonutChart } from './donut-chart';

describe('DonutChart', () => {
  const mockData = [
    { name: 'A', value: 100 },
    { name: 'B', value: 200 },
  ];

  it('renders without crashing', () => {
    render(<DonutChart data={mockData} />);
  });
});`,
  },
  KpiCard: {
    component: `"use client";

import { Card } from "@tremor/react";

export interface KpiCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "increase" | "decrease" | "neutral";
  description?: string;
  className?: string;
}

export function KpiCard({
  title,
  value,
  change,
  changeType = "neutral",
  description,
  className,
}: KpiCardProps) {
  const changeColor = {
    increase: "text-emerald-500",
    decrease: "text-red-500",
    neutral: "text-gray-500",
  }[changeType];

  return (
    <Card className={className}>
      <div className="flex flex-col gap-2">
        <p className="text-sm text-gray-500">{title}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-semibold text-gray-900">{value}</p>
          {change && (
            <p className={\`text-sm font-medium \${changeColor}\`}>
              {change}
            </p>
          )}
        </div>
        {description && (
          <p className="text-sm text-gray-500">{description}</p>
        )}
      </div>
    </Card>
  );
}`,
    story: `import type { Meta, StoryObj } from '@storybook/react';
import { KpiCard } from './kpi-card';

const meta: Meta<typeof KpiCard> = {
  title: 'Charts/KpiCard',
  component: KpiCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof KpiCard>;

export const Default: Story = {
  args: {
    title: 'Total Revenue',
    value: '$45,231',
  },
};

export const WithIncrease: Story = {
  args: {
    title: 'Active Users',
    value: '1,234',
    change: '+12.3%',
    changeType: 'increase',
    description: 'vs. last month',
  },
};

export const WithDecrease: Story = {
  args: {
    title: 'Bounce Rate',
    value: '34.2%',
    change: '-5.2%',
    changeType: 'decrease',
    description: 'vs. last month',
  },
};`,
    test: `import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KpiCard } from './kpi-card';

describe('KpiCard', () => {
  it('renders title and value', () => {
    render(<KpiCard title="Test Title" value="123" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();
  });

  it('renders change when provided', () => {
    render(<KpiCard title="Test" value="123" change="+10%" />);
    expect(screen.getByText('+10%')).toBeInTheDocument();
  });
});`,
  },
};

/**
 * Default dependencies for each external component source
 *
 * These are installed when a component from the source is imported.
 * Individual templates can override with custom dependencies.
 */
const dependencies = {
  tremor: ['@tremor/react', 'recharts'],
  tanstack: ['@tanstack/react-table'],
  dndkit: ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
};

/**
 * Main import flow - loads template and generates component files
 *
 * Workflow:
 * 1. Parse command arguments (source + component name)
 * 2. Load template from JSON file (or inline fallback)
 * 3. Install dependencies to @ui/components package
 * 4. Generate component, test, and viewer example files
 * 5. Update component registry
 *
 * @example
 * ```bash
 * # Import Tremor LineChart
 * tsx import-external.ts tremor LineChart
 *
 * # Output:
 * # - packages/@ui/components/ui/line-chart/line-chart.tsx
 * # - packages/@ui/components/ui/line-chart/line-chart.test.tsx
 * # - packages/@ui/components/ui/line-chart/VIEWER_EXAMPLES.md
 * ```
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: /design import <source> <component>');
    console.error('Sources: tremor, tanstack, dndkit');
    console.error('Example: /design import tremor LineChart');
    process.exit(1);
  }

  const [source, componentName] = args;

  // Validate source
  if (!['tremor', 'tanstack', 'dndkit'].includes(source)) {
    console.error(`❌ Invalid source: ${source}`);
    console.error('Valid sources: tremor, tanstack, dndkit');
    process.exit(1);
  }

  // For now, only Tremor is implemented
  if (source !== 'tremor') {
    console.error(`❌ ${source} integration not yet implemented`);
    console.error('Currently available: tremor');
    process.exit(1);
  }

  // Try to load template from file first, fall back to inline templates
  let template = loadTemplate(source, componentName);

  if (!template && source === 'tremor' && componentName in tremorTemplates) {
    // Fall back to inline templates
    template = tremorTemplates[componentName as keyof typeof tremorTemplates];
  }

  if (!template) {
    const available = getAvailableTemplates(source);
    const inlineAvailable = source === 'tremor' ? Object.keys(tremorTemplates) : [];
    const allAvailable = [...new Set([...available, ...inlineAvailable])];

    console.error(`❌ Component ${componentName} not available for ${source}`);
    if (allAvailable.length > 0) {
      console.error(`Available ${source} components:`, allAvailable.join(', '));
    } else {
      console.error(`No templates available for ${source}`);
    }
    process.exit(1);
  }

  console.log(`📦 Importing ${componentName} from ${source}...`);

  // Get dependencies from template or defaults
  const deps = template.dependencies || dependencies[source as keyof typeof dependencies];

  // Check and install dependencies
  console.log('\n📥 Installing dependencies...');
  try {
    execSync(`pnpm add ${deps.join(' ')} --filter=@ui/components`, { stdio: 'inherit' });
    console.log('✅ Dependencies installed');
  } catch (error) {
    console.error('❌ Failed to install dependencies');
    process.exit(1);
  }

  // Create component files using shared utility for safe path creation
  const { kebabName, basePath } = createSafeComponentPath(componentName);

  // Create directory
  if (!fs.existsSync(basePath)) {
    fs.mkdirSync(basePath, { recursive: true });
  }

  // Get templates
  const templates = template;

  // Define files to write
  const componentPath = path.join(basePath, `${kebabName}.tsx`);
  const testPath = path.join(basePath, `${kebabName}.test.tsx`);

  const filesToWrite = [
    { path: componentPath, content: templates.component, name: 'component' },
    { path: testPath, content: templates.test, name: 'test' },
  ];

  // Write component and test files with error handling
  for (const file of filesToWrite) {
    try {
      fs.writeFileSync(file.path, file.content);
      console.log(`✅ Created ${file.path}`);
    } catch (error) {
      console.error(`❌ Failed to write ${file.name} file: ${error instanceof Error ? error.message : String(error)}`);
      console.error(`Path: ${file.path}`);
      process.exit(1);
    }
  }

  // Write viewer examples README with error handling
  if (templates.viewerExamples) {
    const readmePath = path.join(basePath, 'VIEWER_EXAMPLES.md');
    try {
      let readmeContent = `# ${componentName} - Design Viewer Examples\n\n`;
      readmeContent += `Add these examples to \`apps/web/src/app/design/page.tsx\` to showcase this component.\n\n`;
      readmeContent += `## Import\n\n\`\`\`tsx\nimport { ${componentName} } from '@ui/components';\n\`\`\`\n\n`;

      templates.viewerExamples.forEach((example: any, idx: number) => {
        readmeContent += `## Example ${idx + 1}: ${example.title}\n\n`;
        readmeContent += `${example.description}\n\n`;
        readmeContent += `\`\`\`tsx\n<ComponentExample\n  title="${example.title}"\n  code={\`${example.code}\`}\n  onCopy={copyCode}\n  copied={copiedCode}\n>\n  {/* Add rendered example here */}\n</ComponentExample>\n\`\`\`\n\n`;
      });

      fs.writeFileSync(readmePath, readmeContent);
      console.log(`✅ Created ${readmePath}`);
    } catch (error) {
      console.error(`❌ Failed to write viewer examples: ${error instanceof Error ? error.message : String(error)}`);
      console.error(`Path: ${readmePath}`);
      process.exit(1);
    }
  }

  // Update registry
  const registryEntry = {
    createdAt: new Date().toISOString().split('T')[0],
    reason: `Imported from ${source}`,
    source,
    dependencies: deps,
    viewerExamples: templates.viewerExamples?.length || 0,
  };

  if (!registry.customComponents) {
    registry.customComponents = {};
  }
  registry.customComponents[kebabName] = registryEntry;

  // Write registry with error handling to avoid inconsistent state
  try {
    const tempPath = `${registryPath}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(registry, null, 2));
    fs.renameSync(tempPath, registryPath);
    console.log('\n✅ Updated component registry');
  } catch (error) {
    console.error(`\n❌ Failed to update registry: ${error instanceof Error ? error.message : String(error)}`);
    console.error('⚠️  Component files created but not registered. Manual registry update required.');
    process.exit(1);
  }

  console.log(`\n🎉 Successfully imported ${componentName}!`);
  console.log(`\nComponent location: ${componentPath}`);
  console.log(`Test location: ${testPath}`);
  if (templates.viewerExamples) {
    console.log(`Viewer examples: ${path.join(basePath, 'VIEWER_EXAMPLES.md')}`);
  }
  console.log(`\nNext steps:`);
  console.log(`1. Import and use: import { ${componentName} } from "@ui/components"`);
  console.log(`2. Add examples to /design viewer: apps/web/src/app/design/page.tsx`);
  console.log(`3. View in browser: /design viewer`);
  console.log(`4. Run tests: pnpm test`);
}

main().catch(console.error);
