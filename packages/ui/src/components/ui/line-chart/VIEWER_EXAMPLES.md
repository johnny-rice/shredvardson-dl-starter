# LineChart - Design Viewer Examples

Add these examples to `apps/web/src/app/design/page.tsx` to showcase this component.

## Import

```tsx
import { LineChart } from '@ui/components';
```

## Example 1: Basic Line Chart

Basic line chart showing revenue and profit over time

```tsx
<ComponentExample
  title="Basic Line Chart"
  code={`const data = [
  { date: 'Jan', Revenue: 2400, Profit: 1200 },
  { date: 'Feb', Revenue: 1398, Profit: 800 },
  { date: 'Mar', Revenue: 9800, Profit: 5200 },
  { date: 'Apr', Revenue: 3908, Profit: 2100 },
  { date: 'May', Revenue: 4800, Profit: 2800 },
  { date: 'Jun', Revenue: 3800, Profit: 2200 },
];

<LineChart
  data={data}
  index="date"
  categories={['Revenue', 'Profit']}
/>`}
  onCopy={copyCode}
  copied={copiedCode}
>
  {/* Add rendered example here */}
</ComponentExample>
```

## Example 2: With Value Formatter

Format values as currency

```tsx
<ComponentExample
  title="With Value Formatter"
  code={`<LineChart
  data={data}
  index="date"
  categories={['Revenue', 'Profit']}
  valueFormatter={(value) => `$${value.toLocaleString()}`}
/>`}
  onCopy={copyCode}
  copied={copiedCode}
>
  {/* Add rendered example here */}
</ComponentExample>
```

## Example 3: Without Legend

Hide the legend for simpler display

```tsx
<ComponentExample
  title="Without Legend"
  code={`<LineChart
  data={data}
  index="date"
  categories={['Revenue']}
  showLegend={false}
/>`}
  onCopy={copyCode}
  copied={copiedCode}
>
  {/* Add rendered example here */}
</ComponentExample>
```

