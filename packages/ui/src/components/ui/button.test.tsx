import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from './button';

describe('Button Component Token Integration', () => {
  it('uses semantic token classes (no hardcoded colors)', () => {
    render(<Button variant="default">Click me</Button>);
    const button = screen.getByRole('button');

    // Should use token-based classes
    expect(button.className).toContain('bg-primary');
    expect(button.className).toContain('text-primary-foreground');

    // Should NOT have hardcoded color classes
    expect(button.className).not.toContain('bg-blue-');
    expect(button.className).not.toContain('bg-slate-');
    expect(button.className).not.toContain('text-white');
  });

  it('destructive variant uses destructive tokens', () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByRole('button');

    expect(button.className).toContain('bg-destructive');
    expect(button.className).toContain('text-destructive-foreground');
  });

  it('outline variant uses border token', () => {
    render(<Button variant="outline">Outline</Button>);
    const button = screen.getByRole('button');

    expect(button.className).toContain('border-input');
    expect(button.className).toContain('bg-background');
  });

  it('ghost variant uses hover token', () => {
    render(<Button variant="ghost">Ghost</Button>);
    const button = screen.getByRole('button');

    expect(button.className).toContain('hover:bg-accent');
    expect(button.className).toContain('hover:text-accent-foreground');
  });

  it('secondary variant uses secondary tokens', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole('button');

    expect(button.className).toContain('bg-secondary');
    expect(button.className).toContain('text-secondary-foreground');
  });

  it('link variant uses primary token', () => {
    render(<Button variant="link">Link</Button>);
    const button = screen.getByRole('button');

    expect(button.className).toContain('text-primary');
  });

  it('applies size classes correctly', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    let button = screen.getByRole('button');
    expect(button.className).toContain('h-9');

    rerender(<Button size="lg">Large</Button>);
    button = screen.getByRole('button');
    expect(button.className).toContain('h-11');
  });

  it('can be disabled', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button');

    expect(button).toBeDisabled();
  });

  it('renders children correctly', () => {
    render(<Button>Test Content</Button>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<Button ref={ref}>Button</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
