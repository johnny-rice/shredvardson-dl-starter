import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Link } from './Link';

describe('Link Component', () => {
  describe('Basic rendering', () => {
    it('renders with default props', () => {
      render(<Link href="/test">Link text</Link>);
      const link = screen.getByRole('link', { name: 'Link text' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/test');
    });

    it('renders as anchor element', () => {
      render(<Link href="/page">Test Link</Link>);
      const link = screen.getByText('Test Link');
      expect(link.tagName).toBe('A');
    });

    it('renders children correctly', () => {
      render(<Link href="/test">Click here</Link>);
      expect(screen.getByText('Click here')).toBeInTheDocument();
    });

    it('renders with complex children', () => {
      render(
        <Link href="/test">
          <span>Click</span> <strong>here</strong>
        </Link>
      );
      expect(screen.getByText('Click')).toBeInTheDocument();
      expect(screen.getByText('here')).toBeInTheDocument();
    });
  });

  describe('Variant styles', () => {
    it('applies default variant classes', () => {
      const { container } = render(
        <Link href="/test" variant="default">
          Default
        </Link>
      );
      const link = container.querySelector('a');
      expect(link).toHaveClass('text-primary', 'hover:text-primary/80', 'underline-offset-4');
    });

    it('applies primary variant classes', () => {
      const { container } = render(
        <Link href="/test" variant="primary">
          Primary
        </Link>
      );
      const link = container.querySelector('a');
      expect(link).toHaveClass(
        'bg-primary',
        'text-primary-foreground',
        'hover:bg-primary/90',
        'rounded-md',
        'px-4',
        'py-2'
      );
    });

    it('applies secondary variant classes', () => {
      const { container } = render(
        <Link href="/test" variant="secondary">
          Secondary
        </Link>
      );
      const link = container.querySelector('a');
      expect(link).toHaveClass(
        'bg-secondary',
        'text-secondary-foreground',
        'hover:bg-secondary/80',
        'rounded-md',
        'px-4',
        'py-2'
      );
    });

    it('applies ghost variant classes', () => {
      const { container } = render(
        <Link href="/test" variant="ghost">
          Ghost
        </Link>
      );
      const link = container.querySelector('a');
      expect(link).toHaveClass(
        'hover:bg-accent',
        'hover:text-accent-foreground',
        'rounded-md',
        'px-4',
        'py-2'
      );
    });

    it('applies nav variant classes', () => {
      const { container } = render(
        <Link href="/test" variant="nav">
          Nav
        </Link>
      );
      const link = container.querySelector('a');
      expect(link).toHaveClass(
        'text-foreground/60',
        'hover:text-foreground',
        'hover:bg-accent/50',
        'rounded-md',
        'px-3',
        'py-2'
      );
    });
  });

  describe('Custom styling', () => {
    it('applies custom className', () => {
      const { container } = render(
        <Link href="/test" className="custom-link">
          Custom
        </Link>
      );
      const link = container.querySelector('a');
      expect(link).toHaveClass('custom-link');
    });

    it('maintains base classes with custom className', () => {
      const { container } = render(
        <Link href="/test" className="custom-class">
          Link
        </Link>
      );
      const link = container.querySelector('a');
      expect(link).toHaveClass('custom-class');
      expect(link).toHaveClass('inline-flex', 'items-center', 'justify-center');
    });
  });

  describe('User interactions', () => {
    it('handles onClick event', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn((e) => e.preventDefault());

      render(
        <Link href="/test" onClick={handleClick}>
          Click me
        </Link>
      );

      await user.click(screen.getByText('Click me'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('is keyboard navigable', async () => {
      const user = userEvent.setup();
      render(
        <>
          <button>Before</button>
          <Link href="/test">Link</Link>
          <button>After</button>
        </>
      );

      const link = screen.getByRole('link', { name: 'Link' });

      await user.tab();
      expect(screen.getByText('Before')).toHaveFocus();

      await user.tab();
      expect(link).toHaveFocus();

      await user.tab();
      expect(screen.getByText('After')).toHaveFocus();
    });
  });

  describe('Navigation attributes', () => {
    it('supports target attribute', () => {
      render(
        <Link href="https://example.com" target="_blank">
          External
        </Link>
      );
      const link = screen.getByRole('link', { name: 'External' });
      expect(link).toHaveAttribute('target', '_blank');
    });

    it('supports rel attribute for external links', () => {
      render(
        <Link href="https://example.com" target="_blank" rel="noopener noreferrer">
          External Link
        </Link>
      );
      const link = screen.getByRole('link', { name: 'External Link' });
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('supports download attribute', () => {
      render(
        <Link href="/file.pdf" download="document.pdf">
          Download
        </Link>
      );
      const link = screen.getByRole('link', { name: 'Download' });
      expect(link).toHaveAttribute('download', 'document.pdf');
    });
  });

  describe('Accessibility', () => {
    it('supports aria-label', () => {
      render(
        <Link href="/test" aria-label="Go to test page">
          Test
        </Link>
      );
      expect(screen.getByRole('link', { name: 'Go to test page' })).toBeInTheDocument();
    });

    it('supports aria-describedby', () => {
      render(
        <>
          <Link href="/test" aria-describedby="link-description">
            Link
          </Link>
          <span id="link-description">This link goes to the test page</span>
        </>
      );
      const link = screen.getByRole('link', { name: 'Link' });
      expect(link).toHaveAttribute('aria-describedby', 'link-description');
    });

    it('has focus ring styles', () => {
      const { container } = render(<Link href="/test">Link</Link>);
      const link = container.querySelector('a');
      expect(link).toHaveClass(
        'focus-visible:outline-none',
        'focus-visible:ring-2',
        'focus-visible:ring-ring',
        'focus-visible:ring-offset-2'
      );
    });

    it('supports aria-current for active navigation', () => {
      render(
        <Link href="/current" aria-current="page">
          Current Page
        </Link>
      );
      const link = screen.getByRole('link', { name: 'Current Page' });
      expect(link).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('Ref forwarding', () => {
    it('forwards ref correctly', () => {
      const ref = { current: null };
      render(
        <Link href="/test" ref={ref}>
          Link
        </Link>
      );
      expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
    });

    it('allows programmatic focus via ref', () => {
      const ref = { current: null as HTMLAnchorElement | null };
      render(
        <Link href="/test" ref={ref}>
          Link
        </Link>
      );

      ref.current?.focus();
      expect(ref.current).toHaveFocus();
    });
  });

  describe('Edge cases', () => {
    it('handles empty href', () => {
      render(<Link href="">Empty href</Link>);
      const link = screen.getByRole('link', { name: 'Empty href' });
      expect(link).toHaveAttribute('href', '');
    });

    it('handles hash links', () => {
      render(<Link href="#section">Jump to section</Link>);
      const link = screen.getByRole('link', { name: 'Jump to section' });
      expect(link).toHaveAttribute('href', '#section');
    });

    it('handles relative paths', () => {
      render(<Link href="./relative">Relative</Link>);
      const link = screen.getByRole('link', { name: 'Relative' });
      expect(link).toHaveAttribute('href', './relative');
    });

    it('handles absolute URLs', () => {
      render(<Link href="https://example.com">Absolute</Link>);
      const link = screen.getByRole('link', { name: 'Absolute' });
      expect(link).toHaveAttribute('href', 'https://example.com');
    });

    it('supports data attributes', () => {
      render(
        <Link href="/test" data-testid="custom-link" data-analytics="track-click">
          Test
        </Link>
      );
      const link = screen.getByTestId('custom-link');
      expect(link).toHaveAttribute('data-analytics', 'track-click');
    });
  });

  describe('Disabled state', () => {
    it('prevents interaction when disabled', () => {
      const { container } = render(
        <Link href="/test" className="disabled:opacity-50 disabled:pointer-events-none">
          Disabled
        </Link>
      );
      const link = container.querySelector('a');
      expect(link).toHaveClass('disabled:opacity-50', 'disabled:pointer-events-none');
    });
  });

  describe('Semantic token usage', () => {
    it('uses semantic color tokens', () => {
      const { container } = render(
        <Link href="/test" variant="default">
          Link
        </Link>
      );
      const link = container.querySelector('a');
      expect(link).toHaveClass('text-primary');
    });

    it('uses semantic transition classes', () => {
      const { container } = render(<Link href="/test">Link</Link>);
      const link = container.querySelector('a');
      expect(link).toHaveClass('transition-colors', 'duration-200');
    });
  });

  describe('Link composition', () => {
    it('works in navigation menu', () => {
      render(
        <nav>
          <Link href="/" variant="nav">
            Home
          </Link>
          <Link href="/about" variant="nav">
            About
          </Link>
          <Link href="/contact" variant="nav">
            Contact
          </Link>
        </nav>
      );

      expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Contact' })).toBeInTheDocument();
    });

    it('works as call-to-action button', () => {
      render(
        <Link href="/signup" variant="primary">
          Get Started
        </Link>
      );

      const link = screen.getByRole('link', { name: 'Get Started' });
      expect(link).toHaveClass('bg-primary', 'rounded-md', 'px-4', 'py-2');
    });
  });
});
