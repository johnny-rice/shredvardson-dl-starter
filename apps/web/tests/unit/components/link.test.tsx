import { describe, it, expect } from 'vitest';
import { render, screen } from '../../helpers/test-utils';
import { Link } from '@/components/Link';

describe('Link Component', () => {
  it('renders with text', () => {
    render(<Link href="/test">Click me</Link>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('renders with correct href', () => {
    render(<Link href="/dashboard">Dashboard</Link>);
    const link = screen.getByText('Dashboard');
    expect(link).toHaveAttribute('href', '/dashboard');
  });

  it('renders with target blank when specified', () => {
    render(
      <Link href="https://example.com" target="_blank" rel="noopener noreferrer">
        External
      </Link>
    );
    const link = screen.getByText('External');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders with ghost variant', () => {
    render(
      <Link href="/internal" variant="ghost">
        Internal
      </Link>
    );
    const link = screen.getByText('Internal');
    expect(link).toHaveClass('bg-transparent');
  });
});
