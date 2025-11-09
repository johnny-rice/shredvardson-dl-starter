import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';

describe('Card Component', () => {
  describe('Card', () => {
    it('renders with default props', () => {
      const { container } = render(<Card>Card content</Card>);
      expect(screen.getByText('Card content')).toBeInTheDocument();
      expect(container.firstChild).toHaveClass('rounded-lg', 'border', 'bg-card');
    });

    it('applies default variant classes', () => {
      const { container } = render(<Card variant="default">Test</Card>);
      expect(container.firstChild).toHaveClass('shadow-sm');
    });

    it('applies elevated variant classes', () => {
      const { container } = render(<Card variant="elevated">Test</Card>);
      expect(container.firstChild).toHaveClass('shadow-md', 'hover:shadow-lg');
    });

    it('applies outlined variant classes', () => {
      const { container } = render(<Card variant="outlined">Test</Card>);
      expect(container.firstChild).toHaveClass('shadow-none', 'border-2');
    });

    it('applies custom className', () => {
      const { container } = render(<Card className="custom-class">Test</Card>);
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('forwards ref correctly', () => {
      const ref = { current: null };
      render(<Card ref={ref}>Card</Card>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('spreads additional HTML attributes', () => {
      render(<Card data-testid="card-test">Test</Card>);
      expect(screen.getByTestId('card-test')).toBeInTheDocument();
    });
  });

  describe('CardHeader', () => {
    it('renders with default styles', () => {
      const { container } = render(<CardHeader>Header content</CardHeader>);
      expect(screen.getByText('Header content')).toBeInTheDocument();
      expect(container.firstChild).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6');
    });

    it('applies custom className', () => {
      const { container } = render(<CardHeader className="custom">Header</CardHeader>);
      expect(container.firstChild).toHaveClass('custom');
    });

    it('forwards ref correctly', () => {
      const ref = { current: null };
      render(<CardHeader ref={ref}>Header</CardHeader>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('CardTitle', () => {
    it('renders as h3 element', () => {
      render(<CardTitle>Title text</CardTitle>);
      const title = screen.getByText('Title text');
      expect(title.tagName).toBe('H3');
    });

    it('applies default styles', () => {
      const { container } = render(<CardTitle>Title</CardTitle>);
      expect(container.firstChild).toHaveClass(
        'text-lg',
        'font-semibold',
        'leading-none',
        'tracking-tight'
      );
    });

    it('applies custom className', () => {
      const { container } = render(<CardTitle className="custom">Title</CardTitle>);
      expect(container.firstChild).toHaveClass('custom');
    });

    it('forwards ref correctly', () => {
      const ref = { current: null };
      render(<CardTitle ref={ref}>Title</CardTitle>);
      expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
    });
  });

  describe('CardDescription', () => {
    it('renders as paragraph element', () => {
      render(<CardDescription>Description text</CardDescription>);
      const description = screen.getByText('Description text');
      expect(description.tagName).toBe('P');
    });

    it('applies default styles', () => {
      const { container } = render(<CardDescription>Description</CardDescription>);
      expect(container.firstChild).toHaveClass('text-sm', 'text-muted-foreground');
    });

    it('applies custom className', () => {
      const { container } = render(
        <CardDescription className="custom">Description</CardDescription>
      );
      expect(container.firstChild).toHaveClass('custom');
    });

    it('forwards ref correctly', () => {
      const ref = { current: null };
      render(<CardDescription ref={ref}>Description</CardDescription>);
      expect(ref.current).toBeInstanceOf(HTMLParagraphElement);
    });
  });

  describe('CardContent', () => {
    it('renders with default styles', () => {
      const { container } = render(<CardContent>Content</CardContent>);
      expect(screen.getByText('Content')).toBeInTheDocument();
      expect(container.firstChild).toHaveClass('p-6', 'pt-0');
    });

    it('applies custom className', () => {
      const { container } = render(<CardContent className="custom">Content</CardContent>);
      expect(container.firstChild).toHaveClass('custom');
    });

    it('forwards ref correctly', () => {
      const ref = { current: null };
      render(<CardContent ref={ref}>Content</CardContent>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('CardFooter', () => {
    it('renders with default styles', () => {
      const { container } = render(<CardFooter>Footer</CardFooter>);
      expect(screen.getByText('Footer')).toBeInTheDocument();
      expect(container.firstChild).toHaveClass('flex', 'items-center', 'p-6', 'pt-0');
    });

    it('applies custom className', () => {
      const { container } = render(<CardFooter className="custom">Footer</CardFooter>);
      expect(container.firstChild).toHaveClass('custom');
    });

    it('forwards ref correctly', () => {
      const ref = { current: null };
      render(<CardFooter ref={ref}>Footer</CardFooter>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('Card composition', () => {
    it('renders complete card with all subcomponents', () => {
      render(
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Test Title</CardTitle>
            <CardDescription>Test Description</CardDescription>
          </CardHeader>
          <CardContent>Test Content</CardContent>
          <CardFooter>Test Footer</CardFooter>
        </Card>
      );

      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
      expect(screen.getByText('Test Footer')).toBeInTheDocument();
    });

    it('renders card without optional sections', () => {
      render(
        <Card>
          <CardContent>Only content</CardContent>
        </Card>
      );

      expect(screen.getByText('Only content')).toBeInTheDocument();
    });
  });
});
