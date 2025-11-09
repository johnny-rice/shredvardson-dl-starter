import { render } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { LineChart } from './line-chart';

describe('LineChart', () => {
  const mockData = [
    { date: 'Jan', value: 100 },
    { date: 'Feb', value: 200 },
  ];

  it('renders without crashing', () => {
    render(<LineChart data={mockData} index="date" categories={['value']} />);
  });

  it('accepts custom className', () => {
    const { container } = render(
      <LineChart data={mockData} index="date" categories={['value']} className="custom-class" />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
