import { describe, expect, it } from 'vitest';
import { Link } from '@/components/Link';
import { render, screen } from '../../helpers/test-utils';

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

  it('renders with default variant (underlined text link)', () => {
    render(<Link href="/docs">Documentation</Link>);
    const link = screen.getByText('Documentation');
    expect(link).toHaveClass('text-primary');
    expect(link).toHaveClass('hover:text-primary/80');
    expect(link).toHaveClass('underline-offset-4');
  });

  it('renders with primary variant (button-like)', () => {
    render(
      <Link href="/signup" variant="primary">
        Sign Up
      </Link>
    );
    const link = screen.getByText('Sign Up');
    expect(link).toHaveClass('bg-primary');
    expect(link).toHaveClass('text-primary-foreground');
  });

  it('renders with secondary variant', () => {
    render(
      <Link href="/learn-more" variant="secondary">
        Learn More
      </Link>
    );
    const link = screen.getByText('Learn More');
    expect(link).toHaveClass('bg-secondary');
    expect(link).toHaveClass('text-secondary-foreground');
  });

  it('renders with ghost variant', () => {
    render(
      <Link href="/internal" variant="ghost">
        Internal
      </Link>
    );
    const link = screen.getByText('Internal');
    expect(link).toHaveClass('hover:bg-accent');
    expect(link).toHaveClass('hover:text-accent-foreground');
  });

  it('renders with nav variant', () => {
    render(
      <Link href="/dashboard" variant="nav">
        Dashboard
      </Link>
    );
    const link = screen.getByText('Dashboard');
    expect(link).toHaveClass('text-foreground/60');
    expect(link).toHaveClass('hover:text-foreground');
  });

  it('has proper accessibility attributes', () => {
    render(<Link href="/test">Accessible Link</Link>);
    const link = screen.getByText('Accessible Link');
    expect(link).toHaveClass('focus-visible:outline-none');
    expect(link).toHaveClass('focus-visible:ring-2');
    expect(link).toHaveClass('focus-visible:ring-ring');
  });
});
